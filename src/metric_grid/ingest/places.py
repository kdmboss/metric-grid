"""Build a frozen, district-limited Census place to tract-zone lookup."""
from __future__ import annotations

import geopandas as gpd
TIGER_PLACES_URL = "https://www2.census.gov/geo/tiger/TIGER{year}/PLACE/tl_{year}_{state_fips}_place.zip"


def place_zone_lookup(places: gpd.GeoDataFrame, zones: gpd.GeoDataFrame,
                      district: gpd.GeoDataFrame) -> list[dict]:
    """Map each TIGER place intersecting the district to intersecting tract zones.

    Zone polygons are clipped to the district before intersection because the app
    intentionally retains whole tracts that cross the district boundary.
    """
    for label, frame in (("places", places), ("zones", zones), ("district", district)):
        if frame.crs is None:
            raise ValueError(f"{label} must have a coordinate reference system")
    required = {"GEOID", "NAME", "geometry"}
    missing = required - set(places.columns)
    if missing:
        raise ValueError(f"TIGER places missing required columns: {sorted(missing)}")
    if "zone_id" not in zones:
        raise ValueError("zones must include zone_id")

    # Use an equal-area CRS for the positive-area overlap test.
    crs = "EPSG:5070"
    places = places.to_crs(crs)
    zones = zones.to_crs(crs)
    district_geom = district.to_crs(crs).geometry.union_all()
    zone_geoms = [(int(row.zone_id), row.geometry.intersection(district_geom))
                  for row in zones[["zone_id", "geometry"]].itertuples(index=False)]

    result = []
    for row in places[["GEOID", "NAME", "geometry"]].itertuples(index=False):
        place_geom = row.geometry.intersection(district_geom)
        if place_geom.is_empty:
            continue
        # Boundary-only touches do not count as a place containing a zone.
        ids = sorted(zone_id for zone_id, geom in zone_geoms
                     if not geom.is_empty and place_geom.intersection(geom).area > 0)
        if ids:
            result.append({"geoid": str(row.GEOID), "name": str(row.NAME), "zone_ids": ids})
    return sorted(result, key=lambda item: (item["name"].casefold(), item["geoid"]))


def load_tiger_places(cfg: dict) -> gpd.GeoDataFrame:
    """Download/read the official state TIGER/Line place polygons at freeze time."""
    from metric_grid.ingest.common import RAW, download

    year = int(cfg["district"]["tiger_year"])
    state_fips = str(cfg["district"]["state_fips"]).zfill(2)
    path = download(TIGER_PLACES_URL.format(year=year, state_fips=state_fips),
                    RAW / "tiger" / f"tl_{year}_{state_fips}_place.zip")
    places = gpd.read_file(path)
    return places.loc[places["STATEFP"].astype(str).str.zfill(2) == state_fips].copy()
