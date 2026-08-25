"""
Behavioral simulation — Layer 3. Makes interactions look human-paced
rather than machine-regular. Every helper here uses randomized timing;
never call these with fixed delays.
"""
from __future__ import annotations
import random
import asyncio
from playwright.async_api import Page


async def human_delay(a: float = 0.4, b: float = 1.8) -> None:
    await asyncio.sleep(random.uniform(a, b))


async def human_type(page: Page, selector: str, text: str) -> None:
    await page.click(selector)
    await human_delay(0.1, 0.3)
    for ch in text:
        await page.keyboard.type(ch, delay=random.randint(60, 180))
    await human_delay(0.2, 0.6)


async def human_scroll(page: Page, steps: int | None = None) -> None:
    steps = steps or random.randint(2, 4)
    for _ in range(steps):
        await page.mouse.wheel(0, random.randint(200, 500))
        await human_delay(0.3, 0.9)


async def human_click(page: Page, selector: str) -> None:
    # move roughly toward the element first rather than teleporting the cursor
    box = await page.locator(selector).bounding_box()
    if box:
        await page.mouse.move(
            box["x"] + box["width"] * random.uniform(0.3, 0.7),
            box["y"] + box["height"] * random.uniform(0.3, 0.7),
            steps=random.randint(5, 15),
        )
    await human_delay(0.15, 0.5)
    await page.click(selector)


def jittered_schedule_offset(base_minutes: int, spread_minutes: int = 5) -> int:
    """Returns a minute offset so scheduled scrapes don't all fire on the
    same synchronized tick across sources — a scheduling pattern is itself
    a bot signature."""
    return base_minutes + random.randint(-spread_minutes, spread_minutes)
