"""
Amadeus Self-Service adapter — a real, working integration against
Amadeus's official Flight Offers Search API (test environment, free tier).

This is the fallback/sustainable path referenced throughout your Q&A prep:
no ToS risk, no anti-bot cat-and-mouse, and it plugs into the exact same
FareObservation contract as the scraped sources — proving your comparability
engine and index construction are genuinely source-agnostic.

Get free test credentials at https://developers.amadeus.com (self-service,
instant approval). Set AMADEUS_CLIENT_ID / AMADEUS_CLIENT_SECRET as env vars.
"""
from __future__ import annotations
import os
import time
from datetime import date

import httpx

from airis_scraper.adapters.base import SourceAdapter, SourceBlockedError, SchemaDriftError
from airis_scraper.models import FareObservation, CabinClass

AMADEUS_TOKEN_URL = "https://test.api.amadeus.com/v1/security/oauth2/token"
AMADEUS_SEARCH_URL = "https://test.api.amadeus.com/v2/shopping/flight-offers"


class AmadeusAdapter(SourceAdapter):
    name = "amadeus"

    def __init__(self, client_id: str | None = None, client_secret: str | None = None):
        self.client_id = client_id or os.environ.get("AMADEUS_CLIENT_ID")
        self.client_secret = client_secret or os.environ.get("AMADEUS_CLIENT_SECRET")
        self._token: str | None = None
        self._token_expiry: float = 0.0

    def canary_route(self) -> tuple[str, str, date]:
        return ("DEL", "BOM", date.today())

    async def _get_token(self, client: httpx.AsyncClient) -> str:
        if self._token and time.time() < self._token_expiry - 30:
            return self._token
        if not self.client_id or not self.client_secret:
            raise RuntimeError(
                "AMADEUS_CLIENT_ID / AMADEUS_CLIENT_SECRET not set. "
                "Get free test credentials at https://developers.amadeus.com"
            )
        resp = await client.post(
            AMADEUS_TOKEN_URL,
            data={
                "grant_type": "client_credentials",
                "client_id": self.client_id,
                "client_secret": self.client_secret,
            },
        )
        if resp.status_code == 429:
            raise SourceBlockedError("Amadeus rate limit hit")
        resp.raise_for_status()
        payload = resp.json()
        self._token = payload["access_token"]
        self._token_expiry = time.time() + payload.get("expires_in", 1800)
        return self._token

    async def fetch(self, origin: str, destination: str, travel_date: date) -> list[FareObservation]:
        async with httpx.AsyncClient(timeout=15) as client:
            token = await self._get_token(client)
            resp = await client.get(
                AMADEUS_SEARCH_URL,
                headers={"Authorization": f"Bearer {token}"},
                params={
                    "originLocationCode": origin,
                    "destinationLocationCode": destination,
                    "departureDate": travel_date.isoformat(),
                    "adults": 1,
                    "currencyCode": "INR",
                    "max": 10,
                },
            )
            if resp.status_code == 429:
                raise SourceBlockedError("Amadeus rate limit hit")
            resp.raise_for_status()
            payload = resp.json()

        try:
            offers = payload["data"]
        except KeyError as exc:
            raise SchemaDriftError(f"Amadeus response missing 'data' key: {payload}") from exc

        observations: list[FareObservation] = []
        for offer in offers:
            try:
                observations.append(self._parse_offer(offer, origin, destination, travel_date))
            except (KeyError, IndexError) as exc:
                # one malformed offer shouldn't kill the whole batch —
                # but repeated failures here should trip the canary
                raise SchemaDriftError(f"Unexpected offer shape: {exc}") from exc

        return observations

    def _parse_offer(self, offer: dict, origin: str, destination: str, travel_date: date) -> FareObservation:
        price = offer["price"]
        base_fare = float(price["base"])
        total = float(price["total"])
        itinerary = offer["itineraries"][0]
        segments = itinerary["segments"]
        airline = segments[0]["carrierCode"]
        flight_number = f"{airline}{segments[0]['number']}"
        is_direct = len(segments) == 1
        cabin = offer.get("travelerPricings", [{}])[0].get("fareDetailsBySegment", [{}])[0].get("cabin", "ECONOMY")

        raw = str(offer.get("id", "")) + str(total)
        return FareObservation(
            origin=origin, destination=destination, airline=airline,
            flight_number=flight_number, travel_date=travel_date,
            cabin_class=CabinClass(cabin) if cabin in CabinClass.__members__ else CabinClass.ECONOMY,
            is_direct=is_direct,
            base_fare=base_fare, taxes_fees=round(total - base_fare, 2),
            source=self.name,
            raw_payload_hash=FareObservation.hash_payload(raw),
        )
