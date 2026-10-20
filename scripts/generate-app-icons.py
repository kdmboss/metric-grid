"""Generate the original H home-screen mark from the shared theme tokens (dev only)."""
import re
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
tokens = (ROOT / "tokens.css").read_text()


def color(name):
    return re.search(rf"--color-{name}:\s*(#[0-9A-Fa-f]+)", tokens).group(1)


for size, name in [(180, "apple-touch-icon.png"), (192, "icon-192.png"), (512, "icon-512.png")]:
    image = Image.new("RGB", (size, size), color("paper"))
    draw = ImageDraw.Draw(image)
    # One original geometric letter, kept inside the maskable safe region.
    for box in [(0.28, 0.25, 0.39, 0.75), (0.61, 0.25, 0.72, 0.75), (0.39, 0.445, 0.61, 0.555)]:
        draw.rectangle(tuple(round(v * size) for v in box), fill=color("accent"))
    image.save(ROOT / "public" / name)

(ROOT / "public/favicon.svg").write_text(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
    f'<style>:root{{--paper:{color("paper")};--ember:{color("accent")}}}</style>'
    '<rect width="64" height="64" rx="12" fill="var(--paper)"/>'
    '<path d="M18 16h7v13h14V16h7v32h-7V35H25v13h-7Z" fill="var(--ember)"/>'
    '</svg>\n'
)
