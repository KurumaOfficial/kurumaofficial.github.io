#!/usr/bin/env python3
"""Generate the social-share (Open Graph) banner for aleph.icu.

Renders a 1200x630 banner in the site's visual language:
dark #080606 background, ruby #8b1a2a accents, outlined logo square,
letter-spaced "ALEPH STUDIO" wordmark and the domain underneath.

Output: assets/images/social/og-banner.png (and .webp alongside).

Usage:  python tools/generate_og_banner.py
Deps:   Pillow
"""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "assets" / "images" / "social"

W, H = 1200, 630
BG = (8, 6, 6)
RUBY = (139, 26, 42)
RUBY_LIGHT = (181, 34, 57)
TEXT = (232, 218, 218)
TEXT_DIM = (176, 156, 151)

FONT_DISPLAY = "C:/Windows/Fonts/bahnschrift.ttf"
FONT_MONO = "C:/Windows/Fonts/consola.ttf"


def radial_glow(size: tuple[int, int], center: tuple[int, int], radius: float,
                color: tuple[int, int, int], peak_alpha: int) -> Image.Image:
    """Soft radial gradient layer (transparent PNG) like the site's corner glows."""
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    px = layer.load()
    cx, cy = center
    for y in range(size[1]):
        for x in range(size[0]):
            d = math.hypot(x - cx, y - cy) / radius
            if d >= 1.0:
                continue
            alpha = int(peak_alpha * (1.0 - d) ** 2)
            if alpha > 0:
                px[x, y] = (*color, alpha)
    return layer


def draw_letterspaced(draw: ImageDraw.ImageDraw, pos: tuple[int, int], text: str,
                      font: ImageFont.FreeTypeFont, fill, tracking: int) -> int:
    """Draw text with manual letter-spacing; returns total width."""
    x, y = pos
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        w = draw.textlength(ch, font=font)
        x += int(w) + tracking
    return x - tracking - pos[0]


def measure_letterspaced(draw: ImageDraw.ImageDraw, text: str,
                         font: ImageFont.FreeTypeFont, tracking: int) -> int:
    total = 0
    for ch in text:
        total += int(draw.textlength(ch, font=font)) + tracking
    return total - tracking


def main() -> None:
    img = Image.new("RGB", (W, H), BG)

    # Corner glows — mirror of the site's `body::before` radial gradients.
    img = Image.alpha_composite(img.convert("RGBA"),
                                radial_glow((W, H), (0, 0), 760, RUBY, 46))
    img = Image.alpha_composite(img,
                                radial_glow((W, H), (W, H), 700, RUBY, 30))

    draw = ImageDraw.Draw(img)

    # Top accent line: transparent -> ruby -> light ruby -> ruby -> transparent.
    for x in range(W):
        t = x / W
        if t < 0.18 or t > 0.82:
            continue
        edge = min((t - 0.18) / 0.14, (0.82 - t) / 0.14, 1.0)
        mid = 1.0 - abs(t - 0.5) / 0.32
        col = RUBY_LIGHT if mid > 0.55 else RUBY
        alpha = edge
        line = tuple(int(BG[i] + (col[i] - BG[i]) * alpha) for i in range(3))
        draw.line([(x, 0), (x, 2)], fill=line)

    font_word = ImageFont.truetype(FONT_DISPLAY, 92)
    font_sub = ImageFont.truetype(FONT_MONO, 26)

    tracking_word = 26
    word = "ALEPH STUDIO"
    word_w = measure_letterspaced(draw, word, font_word, tracking_word)

    sq = 64           # logo square outer size
    sq_border = 5
    gap = 44          # square <-> wordmark gap

    total_w = sq + gap + word_w
    x0 = (W - total_w) // 2
    word_bbox = draw.textbbox((0, 0), word, font=font_word)
    word_h = word_bbox[3] - word_bbox[1]
    cy = H // 2 - 26  # optical centre, slightly above geometric

    # Logo square — outlined, like `.logo-sq` / favicon.
    sq_y = cy - sq // 2
    draw.rectangle([x0, sq_y, x0 + sq, sq_y + sq], outline=RUBY_LIGHT, width=sq_border)

    # Wordmark.
    word_x = x0 + sq + gap
    word_y = cy - word_h // 2 - word_bbox[1]
    draw_letterspaced(draw, (word_x, word_y), word, font_word, TEXT, tracking_word)

    # Divider + domain, centred under the lock-up.
    sub = "WWW.ALEPH.ICU"
    tracking_sub = 10
    sub_w = measure_letterspaced(draw, sub, font_sub, tracking_sub)
    sub_y = cy + sq // 2 + 56

    div_w = 460
    div_y = sub_y - 26
    for x in range(div_w):
        t = x / div_w
        edge = min(t / 0.25, (1 - t) / 0.25, 1.0)
        line = tuple(int(BG[i] + (RUBY[i] - BG[i]) * edge * 0.9) for i in range(3))
        draw.point((W // 2 - div_w // 2 + x, div_y), fill=line)

    # Small ruby tick before the domain — mirrors `.donate-eyebrow::before`.
    sub_x = (W - sub_w) // 2
    tick = 8
    draw.rectangle([sub_x - tick - 14, sub_y + 9, sub_x - 14, sub_y + 9 + tick], fill=RUBY_LIGHT)
    draw_letterspaced(draw, (sub_x, sub_y), sub, font_sub, TEXT_DIM, tracking_sub)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    rgb = img.convert("RGB")
    rgb.save(OUT_DIR / "og-banner.png", optimize=True)
    rgb.save(OUT_DIR / "og-banner.webp", quality=92, method=6)
    print(f"written: {OUT_DIR / 'og-banner.png'} ({(OUT_DIR / 'og-banner.png').stat().st_size // 1024} KB)")
    print(f"written: {OUT_DIR / 'og-banner.webp'} ({(OUT_DIR / 'og-banner.webp').stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
