# Data sources

Each entry gets: name, URL, dataset date/vintage, retrieval date, what it is used for, and whether it is observed, modeled, or a proxy. Filled in as each phase lands.

| Source | Used for | URL | Vintage | Status |
|---|---|---|---|---|
| Census TIGER/Line 2024 (cd119, tracts) | NC-08 boundary, tracts | https://www2.census.gov/geo/tiger/TIGER2024/CD/tl_2024_37_cd119.zip ; https://www2.census.gov/geo/tiger/TIGER2024/TRACT/tl_2024_37_tract.zip | 2024 | downloaded 2026-10-18 |
| Census TIGER/Line 2024 (places) | Census place polygons used to map names to intersecting district tract zones at freeze time | https://www2.census.gov/geo/tiger/TIGER2024/PLACE/tl_2024_37_place.zip | 2024 | required input to the resident lookup; generated mapping is frozen in `data/frozen/places.json` |
| Census ACS 5-year (B25001, B25003, B25034, B25040, B19013, B01001) | housing units, year built, heating fuel, income, tenure | https://api.census.gov/data/2024/acs/acs5 | 2020-2024 | downloaded 2026-10-18 |
| CDC/ATSDR SVI 2022 | vulnerability percentiles | https://svi.cdc.gov/Documents/Data/2022/csv/states/NorthCarolina.csv | 2022 | downloaded 2026-10-18 |
| LEHD LODES8 WAC (NC, JT00) | jobs by sector | https://lehd.ces.census.gov/data/lodes/LODES8/nc/wac/nc_wac_S000_JT00_2023.csv.gz | 2023 | downloaded 2026-10-18 |
| OpenStreetMap via Overpass (HIFLD Open unavailable, see ASSUMPTIONS.md) | critical facilities | https://overpass-api.de/api/interpreter | pulled 2026-10-18 | downloaded; incomplete coverage |
| EIA-930 region-data, respondents DUK (Duke Energy Carolinas), CPLE and CPLW (Duke Energy Progress East/West), type D | regional hourly demand | https://api.eia.gov/v2/electricity/rto/region-data/data/ | 2022-12-22..26 | downloaded 2026-10-18 |
| SC Office of Regulatory Staff, "Inspection and Examination Report of DEC and DEP December 2022 Winter Storm Outages and Blackouts" | DEC shed 400 MW directed 6:14 AM, maintained at 1,000 MW; DEP requests 600/200/50/~111 MW (sum 961); p.39 printed (PDF p.49) | https://ors.sc.gov/sites/scors/files/Documents/News%20Archive/Inspection%20and%20Examination%20Report%20of%20DEC%20and%20DEP%20December%202022%20Winter%20Storm%20Outages%20and%20Blackouts.pdf | 2023 | downloaded 2026-10-18; quotes verified |
| FERC-NERC-Regional Entity staff report, "Inquiry into Bulk-Power System Operations During December 2022 Winter Storm Elliott" (Nov 2023) | DEC 400 MW (6:27) -> 1,000 MW (7:10); DEP 600 MW (6:25) -> 800 MW (7:10) -> max 961 MW by 7:56; PDF p.71 | https://www.ferc.gov/sites/default/files/2024-02/24_Winter-Storm_Elliot_0207_UPDATE.pdf | Nov 2023 | downloaded 2026-10-18; quotes verified |
| EIA Form 861 (data year 2024): Service_Territory, Sales_Ult_Cust (BA Code, customers) | county -> utility/BA assignment; customer counts for shared-county split | https://www.eia.gov/electricity/data/eia861/zip/f8612024.zip | 2024 | downloaded 2026-10-18 |
| NREL End-Use Load Profiles: ResStock AMY2018 release 2 (NC state), ComStock AMY2018 release 2 (NC state, counties) | load per housing unit / per job | https://oedi-data-lake.s3.amazonaws.com/nrel-pds-building-stock/end-use-load-profiles-for-us-building-stock/2024/ | AMY2018, release 2 (2024) | cold week downloaded 2026-10-18 |
| KCLT ASOS hourly temperature via Iowa Environmental Mesonet (NOAA NCEI was unavailable) | display only | https://mesonet.agron.iastate.edu/cgi-bin/request/asos.py | 2022-12-23..25 | downloaded 2026-10-18 |
| HIFLD Open Electric Substations | zone generating points | not reachable (see ASSUMPTIONS.md Phase 3) | n/a | unavailable; zones are census tracts |
| LBNL, "Updated Value of Service Reliability Estimates for Electric Utility Customers in the United States" (ICE Calculator 2.0 report, LBNL-6941E) | interruption cost: $5.1 per household-hour; $21.8 and $295.0 per average kW (Medium and Large / Small C&I); Table ES-1 p. xii (PDF p. 14), ES-2 p. xiii | https://eta-publications.lbl.gov/sites/default/files/lbnl-6941e.pdf | 2015, U.S. 2013 dollars | downloaded 2026-10-18; values verified |
| EIA-930 bulk files (Dec 2017 to Dec 2018 for the demand model) | winter demand history before the API's 2019-01-01 start | https://www.eia.gov/electricity/gridmonitor/sixMonthFiles/ (EIA930_BALANCE_2017_Jul_Dec, 2018_Jan_Jun, 2018_Jul_Dec, 2019_Jan_Jun) | 2017-2019 | downloaded 2026-10-19; identical to the API on the overlap |
| KCLT and KRDU hourly temperature via Iowa Environmental Mesonet | demand model temperature inputs | https://mesonet.agron.iastate.edu/cgi-bin/request/asos.py | Dec 2017 to Feb 2025 | downloaded 2026-10-19 |


## Historical interface opener

The approximate customer count in the introduction comes from [Duke Energy’s December 24, 2022 restoration update](https://news.duke-energy.com/releases/duke-energy-asks-for-continued-energy-conservation-as-power-restoration-continues-following-extreme-winter-temperatures), which reports service interrupted to about 500,000 customers. The UI bundles this narrative context from `docs/historical_context.yaml` at build time; it does not affect any scenario result. The start time uses the SC ORS source already listed above. The approximate temperature uses the frozen KCLT reference-hour observation, not a temperature measured across the district at the exact start minute.


## Census place lookup (UI pass 3, 2026-10-20)

Official source: [Census TIGER/Line 2024 North Carolina places ZIP](https://www2.census.gov/geo/tiger/TIGER2024/PLACE/tl_2024_37_place.zip). `make places` runs `scripts/build_places.py`, reusing `load_tiger_places` and `place_zone_lookup`. The existing frozen district and tract geometry constrain the spatial intersections. The generated `data/frozen/places.json` contains 79 named places and valid zone IDs; Albemarle, Rockingham, Laurinburg and Lumberton were verified. Runtime search is local and makes no geocoding requests. This build changes only the lookup, not demand, harm values, or precomputed plans.

## Optional one-room cooling measurement (pass 5)

Owner-supplied serial readings, when supplied, are the sole source for `node_cooling.json`; none are shipped now. The utility selects the stated heat-off window, fits temperature against elapsed hours by least squares, and stores the observations, first observed temperature, cooling slope, R² and extrapolated hours to 64°F from that first reading. A nonpositive cooling slope yields no crossing estimate; a room already at/below the reference yields zero. This independent demonstration never enters optimization inputs or results. No claim is made that the plugged-in device works during an outage.

[WHO Housing and Health Guidelines](https://www.who.int/publications/i/item/9789241550376), section 4.1, proposes 18°C (64.4°F) for general populations in cold seasons; higher temperatures may be needed for vulnerable groups. The requested 64°F test line is separately labeled, not attributed as an exact WHO threshold. Source checked October 20, 2026.

Preparedness URLs `https://www.readync.gov/winter-weather` and `https://www.ready.gov/winter-weather` both returned HTTP 200 on October 20, 2026. They are navigation links, not runtime data requests.
