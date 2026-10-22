# Changelog

## 2026-10-22 — Household check-in

- Added a skippable first-launch flow: add your town, then six optional questions about heating, medical equipment, 65+/needing help, past outages, a warm place and backup power. Answers live only in this phone's local storage (`hearth.household.v1`); nothing is sent anywhere, and My household can edit, share (user-initiated) or delete them.
- Home shows a "Higher / Some / Lower need" card from the answers only, with generic reason chips and the label "Based on your answers. Not a medical or official assessment." The rule is in Methods and `docs/ASSUMPTIONS.md`.
- The Ready checklist switches on Electric heat, Medical needs and Getting help leaving from the answers and puts the most important first.
- "Get on the official lists" (only for medical equipment or 65+/needs help) links Duke Energy's Medically Essential Program, the county's page when a verified one exists, and NC 211. Sources are in comments in `web/data/registries.js`; Stanly and Anson have no verified page and show none.
- County Map, real-only Devices (all sample data removed) and the new Ready tab shipped earlier in this branch. No model, data or existing test expectations changed.

## 2026-10-21 — Home Flame logo

Installed the supplied Home Flame artwork in headers, loading screen, web icons and native iOS icon/launch assets. No model, data or navigation changes.

## 2026-10-21 — Repository documentation cleanup

Removed retired UI briefs, iterative review reports and duplicate generated captures. Consolidated AI disclosures and contributor guidance; retained scientific documentation, verification scripts and native review limitations. No application, data or model changes.

## 2026-10-20 · iOS spacing and icon cleanup (OpenAI Codex)

- Added consistent gaps between Prepare headings, export actions, empty state, shortlist, and county import. Centered the empty-state icon, text, and action.
- Replaced font-dependent interface symbols with shared inline SVGs for menus, close, search, plus, and minus controls.
- Aligned map legend labels and ramp; kept footer actions on one line. No data, model, or numerical expectation changes.
- Verified all primary views at 320/375/414/768px and desktop; npm test/lint/build and the native Xcode build pass. See `docs/IOS_SPACING_REVIEW.md`.

## 2026-10-20 · iOS Simulator shell (OpenAI Codex)

- Added an isolated `ios-shell` branch with exact Capacitor dependencies and an Xcode project using Swift Package Manager.
- Added native shell detection, cache-file sharing, in-app source links, light haptics, keyboard-aware navigation, portrait orientation, paper launch screen, and original app icons.
- Kept website downloads and page zoom, and hid native printing. No model, data, or numerical test expectation changes; no production deployment.
- Verification and Simulator limitations are recorded in `docs/IOS_REVIEW.md`.

## 2026-10-20 · Pass 6, last cleanup (OpenAI Codex)

- Consolidated resident caveats into one replay note and replaced text-heavy answers with shared count pills; removed the resident district totals as requested.
- Aligned desktop KPI sub-lines, shortened phone copy, capped phone tiles and put the filter beside the plan selector.
- Stack paired maps below 1280px of available content width, retaining shared view state and >=500px desktop map widths beside the open panel.
- Added display regression checks and review screenshots. Updated the disclaimer copy assertion to the owner's new wording; numerical expectations, data and model logic unchanged. No push/deployment; feature freeze retained.


## 2026-10-20 · Pass 5, feature freeze (OpenAI Codex)

- Added local resident/planner entry choice, query overrides, menu switching and a fixed Elliott/Balanced resident town page with one map and readiness tips.
- Added an independent serial-log cooling fitter and optional card; no real measurements shipped. Demo output is marked and blocked from runtime export. Corrected WHO attribution to 18°C/64.4°F while retaining the requested 64°F test line.
- Fixed town combobox/map accessibility and mount only active planner screens/maps to reduce startup work. Existing numerical computations, datasets and test expectations retained.
- Added entry/cooling/browser checks, production-build Lighthouse reports, pass-4 screenshot rechecks and a private-window check of the existing live release. No deployment. Feature freeze after this pass.


## 2026-10-20 · UI pass 4 (OpenAI Codex)

- Fixed shared status pill geometry, removed nested area-panel framing, and keep both maps and all results visible beside the 360px panel.
- Restored full-width desktop controls and Explore town search; aligned KPI rows and preserved the household trade-off tint.
- Added context around town fits, map town labels and an in-field clear button.
- Fixed regular Safari tab stacking and short copy, added reachable app-mode Changes, tint-only bottom selection and touch hints.
- Added task-oriented guidance, an actual visible-path WebKit touch check, pill clipping assertions, aligned-KPI assertions and seven review screenshots. No model/data changes or deployment.


## 2026-10-20 · App hierarchy refinement (OpenAI Codex)

- Moved desktop scenario/place controls into a side panel so the comparison maps and outcomes share the first screen.
- Reduced the introduction, grouped results into a compact strip, and highlighted the household trade-off with the existing warm accent surface.
- Focused Prepare/Evidence on their own tasks by omitting comparison controls and results; Explore has its own action-oriented introduction.
- Preserved model outputs, actual MW, mandatory place disclaimer, deep links and phone interactions. Updated Chrome/WebKit screenshots and responsive checks. No push/deployment.


## 2026-10-20 · UI pass 3 (OpenAI Codex)

- Built the real 79-place Census lookup independently of scenario freezing; town selection highlights all matching zones.
- Added the desktop overlay drawer, compact controls, centered map legend, five-step spacing, simpler map controls and plain priority labels.
- Reworked phone details into a nonmodal peek/half/full sheet and added conditional installed-app header/bottom navigation, safe-area CSS, local line icons and horizontal KPI scrolling.
- Added presentation mode, local preview screenshots, town regressions and Chrome/WebKit browser checks. No model/result changes or production deployment.


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

### iOS tab review and desktop navigation alignment

- Verified separate Compare/Explore/Prepare/Evidence panels in WebKit standalone emulation at 393×852.
- Corrected desktop header/navigation padding so the tabs align with the left edge of app content. Model and data unchanged.

### Phone map-first interaction

- Added a compact current-scenario summary with explicit Edit/Done controls on phones; the full existing controls and place lookup expand on demand.
- Kept the four bottom tabs as distinct panels, introduced task titles in the installed-app header, and brought comparison maps onto the first phone screen.
- Existing model, frozen results, and calculation logic are unchanged. Web tests (30), lint and build pass; phone tab screenshots use WebKit standalone emulation.

### Clean iPhone surfaces

- Fixed installed-app top/bottom geometry independently of spacing tokens; compact scenario editing remains explicit.
- Show all three outcomes together on phones, retain the household trade-off, group Prepare actions, and highlight the selected bottom tab.
- Reduced map toolbar height and phone map framing so the map enters the first screen. Four tab screenshots are under docs/figures/ios-clean/.
