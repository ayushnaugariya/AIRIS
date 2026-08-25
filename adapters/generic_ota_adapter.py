"""
Template for a real scraped-source adapter, wiring together every layer:
proxy (Layer 1) -> fingerprint stealth (Layer 2) -> behavioral simulation
(Layer 3) -> extraction with a schema-drift check.

This is a TEMPLATE. The selectors below are placeholders — you MUST
inspect your actual target site (DevTools > Elements) and replace them.
Copy this file per source (e.g. makemytrip_adapter.py, cleartrip_adapter.py)
rather than trying to make one adapter handle every site's DOM.

Two things to get right when you adapt this:
1. SEARCH_URL_TEMPLATE and the selectors below.
2. canary_route() — a route you're confident always has fares, used to
   detect drift independently of your main scrape schedule.
"""
from __future__ import annotations
from datetime import date

from playwright.async_api import TimeoutError as PWTimeoutError

from airis_scraper.adapters.base import SourceAdapter, SchemaDriftError, SourceBlockedError
from airis_scraper.stealth import stealth_page, ProxyManager
from airis_scraper.behavior import human_delay, human_scroll, human_click
from airis_scraper.models import FareObservation, CabinClass

# ---- REPLACE THESE with your actual target site's structure ----
SEARCH_URL_TEMPLATE = "https://example-ota.com/flights/{origin}-{destination}/{date}"
RESULTS_CONTAINER_SELECTOR = "[data-testid='flight-results']"
FARE_CARD_SELECTOR = "[data-testid='fare-card']"
FARE_CARD_FIELDS = {
    "airline": "[data-testid='airline-name']",
    "price": "[data-testid='fare-price']",
    "flight_number": "[data-testid='flight-number']",
    "duration": "[data-testid='duration']",
    "stops": "[data-testid='stops']",
}
BLOCKED_PAGE_MARKERS = ["Access Denied", "unusual traffic", "captcha"]
# ------------------------------------------------------------------


class GenericOTAAdapter(SourceAdapter):
    name = "generic_ota"  # override per source, e.g. "makemytrip"

    def __init__(self, proxy_manager: ProxyManager | None = None):
        self.proxy_manager = proxy_manager

    def canary_route(self) -> tuple[str, str, date]:
        return ("DEL", "BOM", date.today())

    async def fetch(self, origin: str, destination: str, travel_date: date) -> list[FareObservation]:
        proxy = self.proxy_manager.get() if self.proxy_manager else None
        url = SEARCH_URL_TEMPLATE.format(origin=origin, destination=destination, date=travel_date.isoformat())

        async with stealth_page(proxy=proxy) as page:
            try:
                await page.goto(url, wait_until="domcontentloaded", timeout=20000)
                await human_delay(1.0, 2.5)

                page_text = await page.content()
                if any(marker.lower() in page_text.lower() for marker in BLOCKED_PAGE_MARKERS):
                    if proxy and self.proxy_manager:
                        self.proxy_manager.mark_blocked(proxy)
                    raise SourceBlockedError(f"{self.name}: blocked/CAPTCHA page detected")

                await human_scroll(page)

                try:
                    await page.wait_for_selector(RESULTS_CONTAINER_SELECTOR, timeout=10000)
                except PWTimeoutError as exc:
                    # results container never appeared — the page structure
                    # has likely changed. This is the canary trip.
                    raise SchemaDriftError(
                        f"{self.name}: results container '{RESULTS_CONTAINER_SELECTOR}' not found"
                    ) from exc

                return await self._extract_fares(page, origin, destination, travel_date)

            except PWTimeoutError as exc:
                raise SourceBlockedError(f"{self.name}: page load timeout (possible soft block)") from exc

    async def _extract_fares(self, page, origin: str, destination: str, travel_date: date) -> list[FareObservation]:
        cards = await page.query_selector_all(FARE_CARD_SELECTOR)
        if not cards:
            raise SchemaDriftError(f"{self.name}: no fare cards found — selector may be stale")

        observations: list[FareObservation] = []
        for card in cards:
            try:
                await human_delay(0.05, 0.2)  # tiny pacing between reads, not a hard requirement
                airline = await self._text(card, FARE_CARD_FIELDS["airline"])
                price_raw = await self._text(card, FARE_CARD_FIELDS["price"])
                flight_number = await self._text(card, FARE_CARD_FIELDS["flight_number"], required=False)
                stops_raw = await self._text(card, FARE_CARD_FIELDS["stops"], required=False)

                base_fare, taxes = self._parse_price(price_raw)
                raw_snapshot = f"{airline}{price_raw}{flight_number}"

                observations.append(FareObservation(
                    origin=origin, destination=destination, airline=airline,
                    flight_number=flight_number or None,
                    travel_date=travel_date,
                    cabin_class=CabinClass.ECONOMY,
                    is_direct=(stops_raw is None or "non" in (stops_raw or "").lower()),
                    base_fare=base_fare, taxes_fees=taxes,
                    source=self.name,
                    raw_payload_hash=FareObservation.hash_payload(raw_snapshot),
                ))
            except (ValueError, KeyError):
                # one malformed card shouldn't kill the batch — skip and continue.
                # if EVERY card fails to parse, that's a drift signal worth
                # surfacing separately (see canary_check in base.py)
                continue

        return observations

    @staticmethod
    async def _text(card, selector: str, required: bool = True) -> str | None:
        el = await card.query_selector(selector)
        if el is None:
            if required:
                raise KeyError(f"missing field for selector {selector}")
            return None
        return (await el.inner_text()).strip()

    @staticmethod
    def _parse_price(raw: str) -> tuple[float, float]:
        """Parses a displayed price string into (base_fare, taxes_fees).
        Most OTAs only show the all-in price on the results page — if so,
        estimate the split with a documented, adjustable assumption
        (~18% taxes/fees for domestic India fares) and flag it for the
        Comparability Engine rather than pretending it's a precise split."""
        cleaned = raw.replace("₹", "").replace(",", "").strip()
        total = float(cleaned)
        taxes = round(total * 0.18, 2)
        base = round(total - taxes, 2)
        return base, taxes
