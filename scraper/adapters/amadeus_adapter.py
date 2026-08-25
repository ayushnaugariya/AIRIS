"""
Amadeus Self-Service API adapter.
"""
from __future__ import annotations
import os
import time
from datetime import date
import httpx

from scraper.adapters.base import SourceAdapter, SchemaDriftError, SourceBlockedError
from scraper.models import FareObservation, CabinClass


class AmadeusAdapter(SourceAdapter):
    name = "amadeus"
    TOKEN_URL = "https://test.api.amadeus.com/v1/security/oauth2/token"
    SEARCH_URL = "https://test.api.amadeus.com/v2/shopping/flight-offers"

    def __init__(self, client_id: str | None = None, client_secret: str | None = None):
        self.client_id = client_id or os.environ.get("AMADEUS_CLIENT_ID")
        self.client_secret = client_secret or os.environ.get("AMADEUS_CLIENT_SECRET")
        self._token: str | None = None
        self._token_expiry: float = 0.0

    def canary_route(self) -> tuple[str, str, date]:
        return ("DEL", "BOM", date.today())

    async def _get_token(self, client: httpx.AsyncClient) -> str:
        if self._token and time.time() < self._token_expiry - 60:
            return self._token

        if not self.client_id or not self.client_secret:
            raise SourceBlockedError("Amadeus credentials not set (AMADEUS_CLIENT_ID / AMADEUS_CLIENT_SECRET)")

        resp = await client.post(
            self.TOKEN_URL,
            data={
                "grant_type": "client_credentials",
                "client_id": self.client_id,
                "client_secret": self.client_secret,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        if resp.status_code != 200:
            raise SourceBlockedError(f"Amadeus auth failed: HTTP {resp.status_code}")

        data = resp.json()
        self._token = data["access_token"]
        self._token_expiry = time.time() + data.get("expires_in", 1799)
        return self._token

    async def fetch(self, origin: str, destination: str, travel_date: date) -> list[FareObservation]:
        async with httpx.AsyncClient(timeout=15.0) as client:
            token = await self._get_token(client)
            resp = await client.get(
                self.SEARCH_URL,
                params={
                    "originLocationCode": origin,
                    "destinationLocationCode": destination,
                    "departureDate": travel_date.isoformat(),
                    "adults": 1,
                    "currencyCode": "INR",
                    "max": 10,
                },
                headers={"Authorization": f"Bearer {token}"},
            )

        if resp.status_code == 429:
            raise SourceBlockedError("Amadeus rate limit exceeded")
        if resp.status_code != 200:
            raise SourceBlockedError(f"Amadeus search returned HTTP {resp.status_code}")

        payload = resp.json()
        offers = payload.get("data", [])
        if not offers:
            return []

        observations: list[FareObservation] = []
        for offer in offers:
            try:
                observations.append(self._parse_offer(offer, origin, destination, travel_date))
            except (KeyError, IndexError) as exc:
                raise SchemaDriftError(f"Unexpected offer shape: {exc}") from exc

        return observations

    def _parse_offer(self, offer: dict, origin: str, destination: str, travel_date: date) -> FareObservation:
        price = offer["price"]
        base_fare = float(price.get("base", price["total"]))
        total = float(price["total"])
        itinerary = offer["itineraries"][0]
        segments = itinerary["segments"]
        airline = segments[0]["carrierCode"]
        flight_number = f"{airline}-{segments[0]['number']}"
        is_direct = len(segments) == 1
        cabin = offer.get("travelerPricings", [{}])[0].get("fareDetailsBySegment", [{}])[0].get("cabin", "ECONOMY")

        raw = str(offer.get("id", "")) + str(total)
        return FareObservation(
            origin=origin,
            destination=destination,
            airline=airline,
            flight_number=flight_number,
            travel_date=travel_date,
            cabin_class=CabinClass(cabin) if cabin in CabinClass.__members__ else CabinClass.ECONOMY,
            is_direct=is_direct,
            base_fare=base_fare,
            taxes_fees=round(total - base_fare, 2),
            source=self.name,
            raw_payload_hash=FareObservation.hash_payload(raw),
        )
