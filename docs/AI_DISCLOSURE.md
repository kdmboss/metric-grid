# AI disclosure

## UI pass 2 (2026-10-19)

OpenAI Codex implemented the owner’s UI brief and arrow-alignment request. It refactored React
components and hooks, consolidated styles, adjusted map presentation/gestures, shortened copy,
added formatting/lint tools and new regressions, and generated Chrome/WebKit review screenshots.
Existing model calculations, frozen files and test expectations were preserved; the locked
JavaScript modules and existing tests received formatting only. The previous three stylesheets
were removed after consolidation into `web/app.css`. No push or deployment was performed in this
pass. Owner-review fields remain for the owners to complete.

| File | Status | What I changed |
|---|---|---|
| `docs/UI_BRIEF.md` | AI-assisted (OpenAI Codex); current UI structure, package name and audit-safe tagline capitalization | TODO (author) |
| `scripts/ui-style-inventory.mjs` | AI-assisted (OpenAI Codex); class/tag inventory for UI pass 2 | TODO (author) |
| `web/components/LineChart.jsx` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `.hallmark/log.json` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `.prettierrc.json` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `CHANGELOG.md` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `README.md` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `docs/UI_CHANGES.md` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `docs/UI_PASS2_REVIEW.md` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `docs/VIDEO_SHOTLIST.md` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `eslint.config.js` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `package-lock.json` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `package.json` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `scripts/check-ui-source.mjs` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `scripts/ui-pass2-smoke.cjs` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `tokens.css` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/ComparisonPanels.jsx` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/CountyData.jsx` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/Evidence.jsx` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/MapCanvas.jsx` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/ResidentLayer.jsx` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/Workspace.jsx` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/app.css` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/comparison.js` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/components/AppHeader.jsx` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/components/Arrow.jsx` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/components/ComparePlans.jsx` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/components/EvidencePrimitives.jsx` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/components/EvidenceRange.jsx` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/components/EvidenceView.jsx` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/components/ExploreView.jsx` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/components/Footer.jsx` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/components/Forecast.jsx` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/components/Help.jsx` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/components/Hero.jsx` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/components/MapControls.jsx` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/components/MapFilters.jsx` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/components/MapLegend.jsx` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/components/MapTooltip.jsx` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/components/MapTracts.jsx` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/components/PeopleResults.jsx` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/components/Preparation.jsx` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/components/PrintSheet.jsx` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/components/PriorityTable.jsx` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/components/Robustness.jsx` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/components/ScenarioControls.jsx` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/components/ShortlistItem.jsx` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/components/ViewTabs.jsx` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/components/ZoneDetail.jsx` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/components/ZoneSheet.jsx` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/content.js` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/countyData.js` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/hooks/scenarioSelectors.js` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/hooks/useCountyLabels.js` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/hooks/useMapGestures.js` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/hooks/useMapHint.js` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/hooks/useMapUI.js` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/hooks/useMobileSheet.js` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/hooks/useNavigation.js` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/hooks/useScenario.js` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/hooks/useShortlist.js` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/hooks/useWorkspace.js` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/hooks/workspaceProps.js` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/main.jsx` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/mapGeometry.js` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/model.js` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/model.test.js` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/planning.js` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/presentation.js` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/presentation.test.js` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |
| `web/scenario.test.js` | AI-assisted (OpenAI Codex); UI pass 2 | TODO (author) |

`docs/figures/ui-pass2/*.png` are generated browser captures; `docs/UI_PASS2_CHECKS.txt` records command output.


## Warm light visual cleanup (2026-10-19)

OpenAI Codex applied the owner-supplied cleanup brief to the existing React components and CSS. Codex added shared theme tokens, a compact hero/three-card comparison, disclosures, updated tab placement, a mobile plan toggle, a native zone detail dialog, dynamic objective labels, and local home-screen assets. Codex retained all model and frozen data files and left existing test files intact during this pass; the new presentation test covers objective labels, outcome directions and navigation migration. The new browser script captures the requested desktop and phone states. Existing author-review fields are still for the owners to complete.

| File | Status | What I changed |
|---|---|---|
| `tokens.css` | AI-scaffolded (OpenAI Codex); owner-specified design tokens | TODO (author) |
| `web/cleanup.css` | AI-scaffolded (OpenAI Codex); cleanup styles and responsive states | TODO (author) |
| `web/presentation.js` | AI-scaffolded (OpenAI Codex); objective labels and navigation | TODO (author) |
| `web/presentation.test.js` | AI-scaffolded (OpenAI Codex); new presentation regressions | TODO (author) |
| `scripts/cleanup-smoke.cjs` | AI-scaffolded (OpenAI Codex); browser acceptance and screenshots | TODO (author) |
| `scripts/generate-app-icons.py` | AI-scaffolded (OpenAI Codex); original geometric H assets | TODO (author) |
| `public/manifest.webmanifest` | AI-scaffolded (OpenAI Codex); standalone display metadata | TODO (author) |
| `public/apple-touch-icon.png` | AI-generated from the original local H drawing | TODO (author) |
| `public/icon-192.png` | AI-generated from the original local H drawing | TODO (author) |
| `public/icon-512.png` | AI-generated from the original local H drawing | TODO (author) |

Codex also updated `web/Workspace.jsx`, `web/Evidence.jsx`, `web/MapCanvas.jsx`, `web/ComparisonPanels.jsx`, `web/comparison.js`, `web/ResidentLayer.jsx`, `web/CountyData.jsx`, `web/main.jsx`, `web/styles.css`, `web/workspace.css`, `package.json`, `index.html`, `public/favicon.svg`, `.hallmark/log.json`, `README.md`, `docs/UI_BRIEF.md`, `docs/UI_CHANGES.md`, `docs/PROJECT_CONTEXT.md`, `docs/VIDEO_SHOTLIST.md`, `CHANGELOG.md`, and this disclosure. Screenshots under `docs/figures/cleanup_*.png` are generated browser captures. No production deployment was performed.

## County resource import addition (2026-10-19)

OpenAI Codex added the local CSV parser/validator and the Prepare county resource panel, plus validation tests and browser acceptance checks. Codex updated `web/Workspace.jsx`, `web/workspace.css`, `web/model.test.js`, `scripts/workspace-smoke.cjs`, `README.md`, `docs/PROJECT_CONTEXT.md`, `docs/UI_BRIEF.md`, `docs/ASSUMPTIONS.md`, `docs/SPEC.md`, `CHANGELOG.md`, and this disclosure. Uploaded rows are county-supplied annotations with explicit source/date fields, not model inputs. No model, frozen data, dependency or production changes were made. Test resources are explicitly automated fixtures and are not shipped as sample county data. Owner-review fields remain for the owners. `docs/figures/ui_county_data.png` is a browser screenshot of the empty upload panel.

| File | Status | What I changed |
|---|---|---|
| `web/CountyData.jsx` | AI-scaffolded (OpenAI Codex); author review pending | TODO (author) |
| `web/countyData.js` | AI-scaffolded (OpenAI Codex); author review pending | TODO (author) |

## Tools used
- **OpenAI Codex**: created the React/Vite interface, browser data export, Vercel configuration, migration tests, and deployment documentation on 2026-10-19. Validated all 40 precomputed scenarios against the original frozen outputs and tested desktop and mobile browser interactions. Author review remains pending.
- **Claude** (Anthropic): design discussion and drafting of the project spec; the optional hardware prototype's firmware and node server (not in this repository; in progress, not part of this submission) are AI-written with Claude, reviewed by the author, hardware testing in progress.
- **Claude Code** (Anthropic CLI): scaffolded and wrote the repository's code, tests and documentation, ran the data pulls, and produced the figures and screenshots.
- **Perplexity**: used by the author for research. (Author: add what you used it for.)

## How to read this file
Status values: **AI-scaffolded** (generated by AI, then reviewed or edited), **AI-assisted** (written together), **Author-written**. The "What I changed" column is the author's to fill in honestly before submission; nothing here claims the author wrote a file unless the status says so. A test (`tests/test_audit.py`) fails if a tracked file is missing from this table, so keep it current.

Not listed individually because they are generated by `make freeze` or `scripts/app_screenshots.py` from public data and the model: everything in `data/frozen/`, the images in `docs/figures/`, empty `.gitkeep` files, and empty `__init__.py` package markers.

## Per-file status

| File | Status | What I changed |
|---|---|---|
| `.gitignore` | AI-scaffolded (Claude Code) | TODO (author) |
| `.python-version` | AI-scaffolded (Claude Code) | TODO (author) |
| `.streamlit/config.toml` | AI-scaffolded (Claude Code) | TODO (author) |
| `CHANGELOG.md` | AI-scaffolded (Claude Code) | TODO (author) |
| `CLAUDE.md` | AI-scaffolded (Claude Code) | TODO (author) |
| `Makefile` | AI-scaffolded (Claude Code) | TODO (author) |
| `README.md` | AI-scaffolded (Claude Code) | TODO (author) |
| `config.yaml` | AI-scaffolded (Claude Code) | TODO (author) |
| `docs/AI_DISCLOSURE.md` | AI-scaffolded (Claude Code); author edits TBD | TODO (author) |
| `docs/ASSUMPTIONS.md` | AI-scaffolded (Claude Code); author edits TBD | TODO (author) |
| `docs/DATA_SOURCES.md` | AI-scaffolded (Claude Code); author edits TBD | TODO (author) |
| `docs/REVIEWS.md` | AI-scaffolded (Claude Code); author edits TBD | TODO (author) |
| `docs/SPEC.md` | Author-provided project spec; the amendments table at the top was added by Claude Code (author: state which parts of the original AI helped write) | TODO (author) |
| `docs/VIDEO_SHOTLIST.md` | AI-scaffolded (Claude Code); author edits TBD | TODO (author) |
| `pytest.ini` | AI-scaffolded (Claude Code) | TODO (author) |
| `requirements-dev.txt` | AI-scaffolded (Claude Code) | TODO (author) |
| `requirements-node.txt` | AI-scaffolded (Claude Code) | TODO (author) |
| `requirements.txt` | AI-scaffolded (Claude Code) | TODO (author) |
| `scripts/app_screenshots.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `scripts/contrast_check.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `scripts/baseline_spread.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `src/metric_grid/app/copy.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `src/metric_grid/app/data.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `src/metric_grid/app/demand_panel.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `src/metric_grid/app/distribution.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `src/metric_grid/app/lookup.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `src/metric_grid/app/maps.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `src/metric_grid/app/provenance.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `src/metric_grid/app/streamlit_app.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `src/metric_grid/app/theme.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `src/metric_grid/app/chart_theme.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `src/metric_grid/app/assets/fonts/README.md` | AI-scaffolded (Claude Code) | TODO (author) |
| `src/metric_grid/app/assets/fonts/inter-vf.woff2` | Third-party font (Inter, SIL OFL 1.1), unmodified | n/a |
| `src/metric_grid/app/assets/fonts/plex-mono-400.woff2` | Third-party font (IBM Plex Mono, SIL OFL 1.1), unmodified | n/a |
| `src/metric_grid/app/assets/fonts/plex-mono-500.woff2` | Third-party font (IBM Plex Mono, SIL OFL 1.1), unmodified | n/a |
| `src/metric_grid/config.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `src/metric_grid/figures.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `src/metric_grid/frozen.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `src/metric_grid/geometry/allocate.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `src/metric_grid/geometry/zones.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `src/metric_grid/ingest/acs.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `src/metric_grid/ingest/common.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `src/metric_grid/ingest/demand_history.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `src/metric_grid/ingest/district.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `src/metric_grid/ingest/eia930.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `src/metric_grid/ingest/facilities.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `src/metric_grid/ingest/footprints.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `src/metric_grid/ingest/freeze.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `src/metric_grid/ingest/hifld.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `src/metric_grid/ingest/lodes.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `src/metric_grid/ingest/noaa.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `src/metric_grid/ingest/resstock.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `src/metric_grid/ingest/run.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `src/metric_grid/ingest/svi.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `src/metric_grid/ingest/xlsx_min.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `src/metric_grid/model/harm.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `src/metric_grid/model/load_allocation.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `src/metric_grid/model/loadonly.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `src/metric_grid/model/optimizer.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `src/metric_grid/model/scenarios.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `src/metric_grid/model/sensitivity.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `src/metric_grid/train/demand.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `tests/test_app.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `tests/test_audit.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `tests/test_demand_model.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `tests/test_demand_panel.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `tests/test_footprints.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `tests/test_harm_optimizer.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `tests/test_loadonly.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `tests/test_maps_render.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `tests/test_phase1.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `tests/test_phase2.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `tests/test_phase3.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `tests/test_scaffold.py` | AI-scaffolded (Claude Code) | TODO (author) |
| `tests/test_sensitivity_scenarios.py` | AI-scaffolded (Claude Code) | TODO (author) |

## Web migration files (2026-10-19)

Generated exports under `public/data/`, `public/fonts/`, and `public/methods/` are ignored and rebuilt from retained source files. The original Python model and frozen results are unchanged. Codex also updated `.gitignore`, `README.md`, and this disclosure for the web migration.

| File | Status | What I changed |
|---|---|---|
| `package.json` | AI-scaffolded (OpenAI Codex); author review pending | TODO (author) |
| `package-lock.json` | AI-scaffolded (OpenAI Codex); author review pending | TODO (author) |
| `vite.config.js` | AI-scaffolded (OpenAI Codex); author review pending | TODO (author) |
| `vercel.json` | AI-scaffolded (OpenAI Codex); author review pending | TODO (author) |
| `.vercelignore` | AI-scaffolded (OpenAI Codex); author review pending | TODO (author) |
| `index.html` | AI-scaffolded (OpenAI Codex); author review pending | TODO (author) |
| `public/favicon.svg` | AI-scaffolded (OpenAI Codex); author review pending | TODO (author) |
| `scripts/export-web-data.mjs` | AI-scaffolded (OpenAI Codex); author review pending | TODO (author) |
| `src/metric_grid/ingest/places.py` | AI-scaffolded (OpenAI Codex); author review pending | TODO (author) |
| `web/ResidentLayer.jsx` | AI-scaffolded (OpenAI Codex); author review pending | TODO (author) |
| `tests/test_places.py` | AI-scaffolded (OpenAI Codex); author review pending | TODO (author) |
| `scripts/web-smoke.cjs` | AI-scaffolded (OpenAI Codex); author review pending | TODO (author) |
| `web/main.jsx` | AI-scaffolded (OpenAI Codex); author review pending | TODO (author) |
| `web/model.js` | AI-scaffolded (OpenAI Codex); author review pending | TODO (author) |
| `web/model.test.js` | AI-scaffolded (OpenAI Codex); author review pending | TODO (author) |
| `web/styles.css` | AI-scaffolded (OpenAI Codex); author review pending | TODO (author) |
| `.hallmark/log.json` | AI-scaffolded (OpenAI Codex); author review pending | TODO (author) |

## Map-first workspace redesign (2026-10-19)

OpenAI Codex implemented the owner-requested map-first Explore/Compare/Prepare interface using the supplied public reference screenshots. The original Python model, configuration values, training code and frozen data were not changed. No new project dependencies were added. Browser-local notes are user-authored, and empty story and quote files must be completed by the owners. Codex did not write a family story or fabricate testimonials.

| File | Status | What I changed |
|---|---|---|
| `web/Workspace.jsx` | AI-scaffolded (OpenAI Codex); author review pending | TODO (author) |
| `web/Evidence.jsx` | AI-scaffolded (OpenAI Codex); author review pending | TODO (author) |
| `web/MapCanvas.jsx` | AI-scaffolded (OpenAI Codex); author review pending | TODO (author) |
| `web/content.js` | AI-scaffolded (OpenAI Codex); author review pending | TODO (author) |
| `web/planning.js` | AI-scaffolded (OpenAI Codex); author review pending | TODO (author) |
| `web/workspace.css` | AI-scaffolded (OpenAI Codex); author review pending | TODO (author) |
| `scripts/workspace-smoke.cjs` | AI-scaffolded (OpenAI Codex); author review pending | TODO (author) |
| `scripts/workspace-contrast.cjs` | AI-scaffolded (OpenAI Codex); author review pending | TODO (author) |
| `docs/UI_CHANGES.md` | AI-scaffolded (OpenAI Codex); author review pending | TODO (author) |
| `docs/quotes.yaml` | AI-scaffolded (OpenAI Codex); author review pending | TODO (author) |
| `docs/author_story.md` | AI-scaffolded (OpenAI Codex); author review pending | TODO (author) |

Codex also updated `web/main.jsx`, `web/model.test.js`, `scripts/export-web-data.mjs`, `scripts/web-smoke.cjs`, `index.html`, `README.md`, `CHANGELOG.md`, `docs/VIDEO_SHOTLIST.md`, and `.hallmark/log.json`. Existing author-review fields remain unfilled.

Validation for the workspace: 13 web tests passed; the original suite completed with 182 passed and 11 skipped (7 raw-data prerequisites, 4 missing browser builds). Codex ran Chrome interaction and responsive checks, contrast checks and a protected-file hash comparison. Safari and owner-operated real-browser checks are not claimed. New UI screenshots in `docs/figures/ui_*.png` are generated artifacts.


## Difference map and county context additions (2026-10-19)

OpenAI Codex added UI-only comparisons from the existing frozen results. County heat share uses summed ACS heating-fuel occupied households as its denominator. The swap description tests actual mean SVI direction and does not claim specific people protected. No personal story or quote content was written. Original model/data/configuration and production remain unchanged.

| File | Status | What I changed |
|---|---|---|
| `web/comparison.js` | AI-scaffolded (OpenAI Codex); author review pending | TODO (author) |
| `web/ComparisonPanels.jsx` | AI-scaffolded (OpenAI Codex); author review pending | TODO (author) |

Codex also updated `web/Workspace.jsx`, `web/MapCanvas.jsx`, `web/workspace.css`, `web/model.test.js`, `scripts/workspace-smoke.cjs`, `scripts/workspace-contrast.cjs`, `CHANGELOG.md`, `docs/UI_CHANGES.md`, and `docs/VIDEO_SHOTLIST.md`. Screenshots `docs/figures/ui_what_changed.png`, `docs/figures/ui_county_summary.png`, and their phone counterparts are generated artifacts; author-review fields remain for the owners.


Validation for these additions: 17 web tests passed; 182 Python tests passed with 11 expected skips; Chrome acceptance, pixel-variance and responsive/contrast checks passed. All 46 protected model/input/configuration files remained unchanged. No Safari validation is claimed. The owner must review the preview and complete the author fields.


## Review polish and focused tabs (2026-10-19)

OpenAI Codex applied the owner-supplied review and the owner’s request to separate content into focused tabs. Codex completed the previous brand pass, made Compare the default, separated supporting analysis from the primary comparison, fixed hover cleanup and map framing, and added conditional benefit copy. The historical customer count was verified against Duke Energy’s December 24, 2022 update and stored separately from model inputs. Codex did not change the original model, frozen data, configuration values or personal-story/quote files.

| File | Status | What I changed |
|---|---|---|
| `docs/historical_context.yaml` | AI-assisted (OpenAI Codex); sourced historical UI context | TODO (author) |
| `docs/PROJECT_CONTEXT.md` | AI-assisted (OpenAI Codex); current repository summary | TODO (author) |

Codex also updated `web/Workspace.jsx`, `web/MapCanvas.jsx`, `web/Evidence.jsx`, `web/main.jsx`, `web/comparison.js`, `web/workspace.css`, `web/model.test.js`, `scripts/export-web-data.mjs`, `scripts/workspace-smoke.cjs`, `scripts/workspace-contrast.cjs`, `index.html`, `public/favicon.svg`, `README.md`, `CHANGELOG.md`, `docs/VIDEO_SHOTLIST.md`, `docs/UI_CHANGES.md`, `docs/DATA_SOURCES.md`, and `.hallmark/log.json`. All `web/` files are listed in this disclosure. Owner fields remain for the owners. Review screenshots are generated artifacts.


Review validation: 19 web tests passed, the build passed, and the Python suite completed with 182 passed and 11 expected skips. Chrome checks covered all 40 rendered plan pairs, protected-zone styling, hover cleanup, focused/keyboard tabs, responsive layout and pixel variance. All 46 original protected file hashes matched. Desktop and phone review screenshots were refreshed; no Safari result is claimed. Production remains unchanged.


## Technical demonstration guidance (2026-10-19)

OpenAI Codex audited the owner-supplied technical checklist against the repository and updated `README.md`, `docs/VIDEO_SHOTLIST.md`, `CHANGELOG.md`, and this disclosure. The guidance points to actual GEOID normalization, duplicate-key checks, ACS/SVI/LODES joins, GeoPandas/Shapely tract selection and facility spatial joins, shared optimization constraints and existing tests. It explicitly distinguishes precomputed browser playback from Python solver execution, describes the civic planning use without promising operational decisions, and does not claim arbitrary MW targets or a live backend. The video guide now follows the focused-tab interface instead of the retired long-page layout. No application/model/data files were changed. Owner-review fields remain for the owners.

Validation for this documentation update: 2 targeted data-cleaning/join tests, 5 real optimizer tests and 21 audit tests passed. No pipeline rebuild or deployment was performed.


## HEARTH visible-name update (2026-10-19)

OpenAI Codex updated visible browser and legacy Streamlit branding, the original inline house mark and favicon, export filenames and CSV/JSON headers, name-copy tests, project guidance, and the video wording. Codex retained the repository, package, Python module, storage key, data, and deployed URL identifiers. No model or data changes were made. A protected review preview was deployed; production was not promoted or changed.

| File | Status | What I changed |
|---|---|---|
| `docs/UI_BRIEF.md` | AI-assisted (OpenAI Codex); new current product brief | TODO (author) |

Codex also updated `web/Evidence.jsx`, `web/Workspace.jsx`, `web/comparison.js`, `web/planning.js`, `web/styles.css`, `web/main.jsx`, `web/model.test.js`, `scripts/workspace-smoke.cjs`, `index.html`, `public/favicon.svg`, `src/metric_grid/app/streamlit_app.py`, `src/metric_grid/app/theme.py`, `README.md`, `CLAUDE.md`, `config.yaml` (comment only), `docs/PROJECT_CONTEXT.md`, `docs/UI_BRIEF.md`, `docs/UI_CHANGES.md`, `docs/VIDEO_SHOTLIST.md`, `docs/SPEC.md`, `CHANGELOG.md`, `tests/test_app.py`, `tests/test_audit.py`, and this disclosure. Updated screenshots are generated artifacts. Existing owner-review fields remain the owners’ responsibility.
