# Changelog

## 2026-10-19 · UI pass 2 (OpenAI Codex)

- Enlarged paired maps, centered their fit, and moved zone details below them. Added stronger shared selection, centroid chips, blank-space/Escape clearing, pointer-centered wheel zoom and two-finger pinch.
- Removed repeated caveats and generic marketing cards; retained one footer line and a full Methods explanation. Shortened useful zone notes without inventing protected facility types.
- Fixed Inter hyphen spacing by limiting tabular numerals to numbers; aligned SVG arrows and disclosure/select controls.
- Split the workspace into components/hooks, grouped map state in a reducer, merged CSS, and added Prettier/ESLint/source checks. Renamed the npm package to hearth.
- Added priority/concentration/zoom regressions and Chrome/WebKit screenshot checks. Model data and calculations are unchanged; no push or deployment in this pass.

## 2026-10-19 · Warm light visual cleanup (OpenAI Codex)

- Applied the owner’s warm paper/ember palette, self-hosted Inter only, 400/600 weights, shared tokens, 8 px spacing, three KPI cards, and a compact wordmark-only header.
- Removed redundant hero copy, the right-side reference box, the fourth KPI, the visible instructions row and empty Prepare badge. Actual MW and the shared target band remain visible below controls; instructions and county cap are disclosures.
- Collapsed map filters; moved County summary and Plan range into Evidence while preserving older deep links. Resident tools remain in a disclosure below the comparison; county imports remain in Prepare.
- Added phone map switching, a native zone detail sheet, home-screen metadata/manifest and original H assets.
- Correctly label alpha-zero results Business-cost optimized and preserve higher/lower/unchanged wording from the actual outcomes. No model, frozen-input or frozen-result changes; existing tests retained, with a new presentation regression file and cleanup browser checks.

## 2026-10-19 · County resource CSV imports (OpenAI Codex)

- Added a drag-and-drop/file-picker box in Prepare with an empty CSV template for county resource information.
- Validate all rows against existing tract GEOIDs, require source/update date, derive counties, and preview each resource’s current modeled tract status under both plans. Support county filtering and removing the imported list.
- Process uploads locally for the browser session, with file/row limits and clear errors. Imports do not change the model or frozen data. No new dependencies or production deployment.

## 2026-10-19 · Resident place context and winter readiness (OpenAI Codex)

- Added the resident Census-place search UI and freeze-time generator for intersecting tract zones under both current model plans, alongside household counts, electric-heat share and a clear no-home-prediction disclaimer. The local preview has no frozen place file yet, so results remain unavailable until the Census input is supplied and generated.
- Added five basic winter-outage preparation tips with official ReadyNC and Ready.gov links.
- Added the place-to-zone generator to the Python freeze pipeline; the generated table will bundle locally for offline app use when the source input is present. No optimization or harm model changes.
- The current checkout has no raw TIGER place-boundary ZIP. The generator and UI are implemented; the final frozen mapping, screenshot and end-to-end place lookup remain blocked until that official input is available.

## 2026-10-19 · HEARTH name and identity (OpenAI Codex)

- Renamed the visible web and legacy Streamlit interfaces to HEARTH; added the requested tagline and original inline house-and-warmth mark, including the favicon.
- Updated browser metadata, print and download names, export headers, documentation and video purpose sentence. Kept the repository/package/module identifiers and Vercel URL unchanged.
- Added source and built-output checks for retired visible names. No model, data, deployment or dependency changes.

## 2026-10-19 · Technical demonstration guidance (OpenAI Codex)

- Mapped visual comparison, supported what-if controls, GEOID data integration and optimization tests to their real source files in README and the video shot list.
- Clarified that the React app replays precomputed Python solutions; arbitrary MW targets and live browser-triggered Python solving are not implemented.
- Added the actual GeoPandas/Shapely tract selection and facility spatial join, clarified the civic planning use, and replaced the obsolete long-page video sequence with the current focused-tab flow.
- Kept the distinction between modeled comparisons and operational decisions explicit. Documentation only; no UI, model, input, dependency or deployment changes.

## 2026-10-19 · Review polish and focused tabs (OpenAI Codex)

- Made Compare the default, preserved explicit mode and scenario deep links, and standardized visible branding and browser metadata to the prior app name.
- Split Compare into Two plans / What changed? / County summary / Plan range; moved priority lookup into Explore and supporting analyses into Evidence with Robustness / Forecast / Methods tabs.
- Added a sourced historical opener and result-aware benefit copy. Historical facts are bundled at build time separately from model inputs.
- Fixed tooltip cleanup on tract leave, tab changes and scenario/view changes; defensively exclude protected zones from cut styling.
- Fit map viewports to local geometry and panel dimensions without cropping; added regression checks across all supported scenarios.
- Updated the live-link documentation, project context and Compare-first video workflow. Production is unchanged.

## 2026-10-19 · Difference map and county context (OpenAI Codex)

- Added the default-on difference map below the two comparison maps, with exclusive live categories, protected hatching, tooltips, and a conditional SVI swap explanation.
- Added locally computed county labels, a two-stroke selected-zone outline, and synchronized zoom to the selected tract on all maps.
- Added a Union-default county summary with ACS household/heating data and each plan’s MW, district share, electric-heat and total households cut.
- Added the three-step how-to strip. Retained actual plan MW, the shared band and the equally prominent household trade-off.
- Added all-scenario partition/rollup checks and Chrome map pixel-variance checks. No model, frozen inputs, dependencies or production changes.

## 2026-10-19 · Map-first planning workspace (OpenAI Codex)

- Added Explore, Compare and Prepare modes within the existing React/Vite page; retained the original frozen model results and Python pipeline.
- Added local geographic search, county filtering, three map layers, overlays, pan/zoom/reset, shared comparison views and contextual zone details.
- Reordered results around electric-heat homes and vulnerability-weighted impact; retained the equally prominent amber total-household trade-off and actual MW/band labels.
- Added a browser-local shortlist with notes, follow-up actions, CSV export, readable print view, removal, and undo after clearing.
- Added build-time filtering of approved, attributed quotes and safe text rendering of an optional author story. Both content files ship empty.
- Restored the required district-scaling sentence, retained supporting evidence, and updated the demo-video workflow.
- Preview-only release; production remains unchanged pending owner review.


- Phase 0: scaffold repo layout, config.yaml placeholders, README, docs stubs, Makefile stubs.
- Phase 0: add CLAUDE.md (from docs/SPEC.md), rebuild requirements.txt and .gitignore, create .venv (Python 3.11), add config loader and scaffold smoke test.
- Phase 1: ingest NC-08 tracts (TIGER 2024), ACS 2024 5-yr, SVI 2022, LODES 2023, OSM critical facilities; joined table; tests; `make data` runs Phase 1.
- Decision: protected facilities are hospital, nursing_home, water_treatment (config `facilities.protected_types`); fire, police and wastewater are display-only. Headroom counts recorded in ASSUMPTIONS.md.
- Phase 1: protected facility types set to hospital/nursing_home/water_treatment (fire, police, wastewater display-only) after tract-level protection check.
- Phase 2: EIA-930 DUK series + r=0.0479, NOAA KCLT (IEM fallback), ResStock NC per-unit and ComStock loads for the cold week via Range requests; tests.
- Phase 2b: two footprint groups (DEC: DUK; DEP: CPLE+CPLW) from EIA-861; per-group r from ORS/FERC-NERC (1,000 / 961 MW); district scaling D_NC08=1,686 MW, T_NC08=91.9 MW; demand figure (matplotlib); tests.
- Phase 3: tract zones (substation layer unavailable), option-(a) protected flags, L_i from two-utility scaling (sum L_i = D_NC08), `make freeze` to data/frozen/, zone map figure, app shell with offline render test.
- Phase 4.1-4.2: harm model (ICE-sourced costs) and two-plan optimizer with a shared target band replacing exact T* (spec change; exact-equality check showed ~5e12 feasible subsets but a 34 s solve); band sensitivity; district outline on maps; protected-zone constraint bug found and fixed by tests.
- Phase 4.3-4.4: sensitivity (19 settings, always/sometimes/never), scenarios 10/15/20%, alpha sweep + alpha_tradeoff.png, pre-solved grid and model outputs written at `make freeze` (spec deviation, approved), plain-language honesty summary.
- Optional county-share cap (default OFF) with tests and a sensitivity row; priority-list definition (baseline-cut zones spared in every alpha>0 setting) added to sensitivity outputs.
- Phase 4.5: Streamlit app (two pydeck maps, flip strip, priority list, zone detail, robustness card, methods drawer), offline blank map style, pre-solved grid with cap on/off (40 records), app tests, Playwright screenshots.
- Phase 6: README, VIDEO_SHOTLIST, REVIEWS template, per-file AI_DISCLOSURE, audit tests, demo locations (3 public buildings), zone 8 default, tooltips, empty/infeasible/missing-data states, `make demo`.
- Housekeeping: example locations that illustrate differences (zone 23, zone 141, Robeson library); verified prior-work citations (NCUC removed); slider snaps to Elliott/10/15/20; requirements split and pinned; firmware folder deleted; spec amendments table; clean-clone skips noted.
- Priority list is now frequency-based: high-vulnerability zones (SVI >= 0.75 or electric-heat >= 50%, in config) ranked by the share of the 200 load-only plans that cut them; card retitled; ASSUMPTIONS notes the vulnerability-aware plan is a single optimum.
- Deployment prep: .python-version (3.11) for Streamlit Community Cloud; history checked for keys and private files.
- Presentation redesign (v2): first screen with headline, four stat tiles, one controls bar and two large maps; maps are now inline SVG (no WebGL, no basemap, no external requests) after the pydeck maps rendered blank in a user's Chrome (not reproducible headless); pydeck removed from requirements; sections for distribution, priority table, zone lookup, robustness, forecasts; all technical text in Methods; browser test checks both maps draw in Chromium and WebKit.
- Design system v3: dark theme (Inter + IBM Plex Mono bundled and embedded, no network), sidebar shell with section links, page header with the primary insight, mono tabular numbers, shared chart theme with hover tooltips, source/kind lines per section; Pillow pinned (favicon). Plotly deliberately not added (Vega-Lite already in Streamlit; keeps requirements minimal).
- Maps: one amber cut color and the same SVI shading on both maps; contrast checked (scripts/contrast_check.py plus a computed-style scan of every text node at 1440 and 390 px, minimum 6.45:1).
