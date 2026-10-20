"""Place lookup generation uses polygons only; there is no runtime geocoder."""
import json
import sys
from pathlib import Path

import geopandas as gpd
from shapely.geometry import box

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from metric_grid.ingest.places import place_zone_lookup

ROOT = Path(__file__).resolve().parents[1]


def test_place_lookup_returns_only_valid_intersecting_zone_ids():
    district = gpd.GeoDataFrame(geometry=[box(-81, 34, -80, 35)], crs=4326)
    places = gpd.GeoDataFrame({"GEOID": ["37001", "37002", "37003"],
                               "NAME": ["Alpha", "Beta", "Outside"]},
                              geometry=[box(-80.9, 34.1, -80.7, 34.3),
                                        box(-80.7, 34.1, -80.5, 34.3),
                                        box(-82, 34, -81.5, 34.5)], crs=4326)
    zones = gpd.GeoDataFrame({"zone_id": [1, 2, 3]},
                             geometry=[box(-80.9, 34.1, -80.7, 34.3),
                                       box(-80.7, 34.1, -80.5, 34.3),
                                       box(-80.5, 34.3, -80.3, 34.5)], crs=4326)
    mapped = place_zone_lookup(places, zones, district)
    valid = set(zones.zone_id)
    assert [item["name"] for item in mapped] == ["Alpha", "Beta"]
    assert all(item["zone_ids"] and set(item["zone_ids"]) <= valid for item in mapped)
    assert mapped[0]["zone_ids"] == [1]
    assert mapped[1]["zone_ids"] == [2]


def test_frozen_places_reference_existing_zones_when_present():
    path = ROOT / "data/frozen/places.json"
    if not path.exists():
        import pytest
        pytest.skip("run `make freeze` to generate the Census place lookup")
    places = json.loads(path.read_text())
    zones = gpd.read_file(ROOT / "data/frozen/zones.geojson")
    ids = {int(value) for value in zones.zone_id}
    assert places
    assert all(p["name"].strip() and p["zone_ids"] and set(p["zone_ids"]) <= ids for p in places)
