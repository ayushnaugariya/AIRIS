"""
Stealth browser setup — Layer 1 (proxy) + Layer 2 (fingerprint) of the
4-layer acquisition architecture.

Requires: playwright, playwright-stealth
    pip install playwright playwright-stealth
    playwright install chromium
"""
from __future__ import annotations
from contextlib import asynccontextmanager

from playwright.async_api import async_playwright, Browser, Page

try:
    from playwright_stealth import stealth_async
except ImportError:  # pragma: no cover
    stealth_async = None


class ProxyManager:
    """Rotates through a pool of residential proxies, cooling down any
    that get flagged as blocked instead of hammering them repeatedly."""

    def __init__(self, proxies: list[dict]):
        # each proxy dict: {"server": "http://host:port", "username": "...", "password": "..."}
        if not proxies:
            raise ValueError("ProxyManager needs at least one proxy")
        self.proxies = proxies
        self._cooldowns: dict[str, float] = {}

    def get(self) -> dict:
        import time, random
        now = time.time()
        available = [p for p in self.proxies if self._cooldowns.get(p["server"], 0) < now]
        pool = available or self.proxies  # fall back to full pool if everything's cooling down
        return random.choice(pool)

    def mark_blocked(self, proxy: dict, cooldown_seconds: int = 900):
        import time
        self._cooldowns[proxy["server"]] = time.time() + cooldown_seconds


@asynccontextmanager
async def stealth_page(proxy: dict | None = None, locale: str = "en-IN"):
    """Async context manager yielding a Playwright page with stealth
    patches applied and (optionally) a proxy attached.

    Usage:
        async with stealth_page(proxy=proxy_manager.get()) as page:
            await page.goto("https://example.com")
    """
    async with async_playwright() as pw:
        launch_kwargs = {"headless": True}
        if proxy:
            launch_kwargs["proxy"] = proxy

        browser: Browser = await pw.chromium.launch(**launch_kwargs)
        context = await browser.new_context(
            locale=locale,
            timezone_id="Asia/Kolkata",
            viewport={"width": 1366, "height": 768},
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
            ),
        )
        page: Page = await context.new_page()

        if stealth_async is not None:
            await stealth_async(page)
        else:  # minimal manual patch if playwright-stealth isn't installed
            await page.add_init_script(
                "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
            )

        try:
            yield page
        finally:
            await context.close()
            await browser.close()
