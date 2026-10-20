"""Build only the frozen Census place lookup; leave all scenario results unchanged."""
from __future__ import annotations

import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

import geopandas as gpd
from metric_grid.config import load_config
from metric_grid.ingest.places import load_tiger_places, place_zone_lookup


def main() -> None:
    """Download official polygons and intersect them with the existing frozen geometry."""
    frozen = ROOT / "data" / "frozen"
    places = load_tiger_places(load_config())
    rows = place_zone_lookup(places, gpd.read_file(frozen / "zones.geojson"),
                             gpd.read_file(frozen / "district.geojson"))
    if not rows:
        raise RuntimeError("No district places found; the existing lookup was not overwritten")
    for name in ("Albemarle", "Rockingham", "Laurinburg", "Lumberton"):
        if not any(row["name"] == name for row in rows):
            raise RuntimeError(f"Expected district place missing: {name}")
        print(f"Verified {name}")
    target = frozen / "places.json"
    temporary = target.with_suffix(".json.tmp")
    temporary.write_text(json.dumps(rows, indent=2) + "\n")
    temporary.replace(target)
    print(f"Wrote {len(rows)} Census places to {target.relative_to(ROOT)}")
    print("Sample names:", ", ".join(row["name"] for row in rows[:10]))



if __name__ == "__main__":
    main()
