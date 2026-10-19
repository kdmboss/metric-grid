# UI changes · 2026-10-19

## Scope

The React/Vite app now provides Explore, Compare, and Prepare views in one page. Production is unchanged; this work is on `codex/map-first-workspace` for preview review.

## What changed

- Map-first exploration with local search, county filtering, social vulnerability / electric heat / estimated zone load layers, protected-zone and district overlays, pan and zoom, and a contextual detail panel.
- People-first results with both plans’ electric-heat household counts, a weighted-impact score, an equally prominent amber total-home trade-off, a shared MW band, and actual MW for each compared plan.
- Compare uses synchronized map views and selected zones, four distribution strips and a county-concentration explanation.
- Prepare stores a manually selected shortlist and notes locally in the browser. CSV and print outputs carry scenario provenance, missing-data labels, status, evidence, and limitations. Clearing has Undo. Storage failures are visible.
- Quotes and author-story content are bundled at build time and rendered as plain text. Unapproved or unattributed quotes are excluded. Empty content ships no sections or navigation.
- Supporting sensitivity, demand, examples, methods, disclosures and source links remain accessible. The exact district-scaling sentence is restored.

## Model and limitations

No Python model, ingestion, geometry, training, frozen data or configuration values changed. The date remains the Elliott winter reference; arbitrary dates, intervention-benefit calculations and live data are outside scope. No additional project dependencies were added.

The original briefs predated the React/Vercel migration. Values from frozen data take precedence: 5.258 kW/home, 1.335 kW/job and 3.685% combined-demand CV error. Current capped default results differ from the older comparison figures.

## Verification

- `npm test`: 13 passed, including all 40 original scenario combinations, full distribution parity, protected zones, county caps, approved-content filtering, CSV safety, saved-state validation, and web copy audit.
- `make test` with one numerical-library thread and local socket access: **182 passed, 11 skipped**, 27 expected missing-SVI warnings. Seven skips need ignored raw data; four need Playwright Chromium/WebKit browser builds that are not installed. The first sandboxed attempt could not bind the legacy test server; the rerun passed with local socket access. Python runtime here is 3.12; repository deployment reference is 3.11.
- Production build passes. No project dependencies were added.
- Chrome acceptance checks passed at 320, 375, 390, 414, 768, 1024, and 1440 px. Maps, synchronized zoom/pan, layers, overlays, county filters, search, scenario extremes and cap, deep links, examples, evidence and required Methods text were exercised.
- Shortlist add/edit/reload/remove/clear/undo, safe CSV, and a two-page printable PDF were verified. Storage failure is visible and session-only editing remains available.
- Optional sections are absent with empty source files. Build-time filtering rejects unapproved/unattributed quotes. Browser injection fixtures render as text; missing deployment data shows recovery UI.
- All external runtime requests were blocked during local acceptance checks; none were requested. Assets and data are served locally.
- Rendered contrast checks: at least 6.95:1 for checked text; amber cut vs highest map shade 3.09:1; district outline vs map 11.67:1; plan dots vs chart 4.91:1. The original `scripts/contrast_check.py` also passes.
- Hash comparison confirms all 46 original protected model/data/configuration files are unchanged.
- Automated Chrome testing was performed. Safari and owner-operated real-browser review remain unverified; both are review checkpoints before production approval.

## Screenshots

Before: `docs/figures/app_v2_first_screen.png`, `app_v2_full_page.png`, `app_v2_phone_first_screen.png` show the supplied legacy interface. The first React migration was captured in earlier chat artifacts; the legacy images are retained as historical references.

After (all compressed below 300 KB, original dimensions retained):
- `ui_first_screen_1440.png`: Explore, 1440×900.
- `ui_full_page_1440.png`: default Explore page.
- `ui_tablet_1024.png`: tablet layout.
- `ui_phone_390.png`: phone first screen.
- `ui_priority1.png`: Compare, people-at-risk-only setting.
- `ui_cap_on.png`: Compare with the county cap.
- `ui_compare_full.png`: default comparison and distributions.

## Reference facts and scope

The customer-count claim from the older suggested story line was not added as an unsourced constant. The interface uses the source-backed reference date and data-build date. Quotes and family details remain entirely owner-supplied. Intervention benefits, arbitrary-date scenarios, live conditions, and locations outside the supplied district require additional data/model work and have not been implemented.

## Review deployment

Vercel preview: https://metric-grid-ovfoss7sd-karthiks-projects-65cb8506.vercel.app

This is a preview target; the existing production deployment at https://metric-grid.vercel.app has not been promoted or replaced. The team’s preview protection may require Vercel sign-in.

The remote source-build preview stayed queued, so the delivered preview uses the verified static `dist/` artifact through Vercel’s Build Output API. Vercel reported the prebuilt preview READY; no production target or alias was changed.

Authenticated Vercel checks returned HTTP 200 for the preview HTML and `/data/app.json`. The deployed data bundle matches the local verified build byte-for-byte, and the HTML references the verified JavaScript asset. The original production deployment remains `dpl_5YNaGYaS8xuZNQsRfTdSPeFoVRf5`.


## Difference map and county context review

The Compare view now includes a default-on, synchronized difference map, exclusive category counts, protected hatching and an SVI-direction-aware explanation. All maps have local county labels, a clearer selected-zone outline and zoom-to-selected. The county summary defaults to Union and independently summarizes existing household, heating and plan-cut data. The top how-to strip explains the three main interactions. County heating percentages use the summed ACS denominator; the swap averages weight each tract equally and are not counts of people protected.

Review screenshots: `docs/figures/ui_first_screen_1440.png`, `docs/figures/ui_what_changed.png`, `docs/figures/ui_county_summary.png`, plus phone versions. This is a review checkpoint, with production unchanged.


Validation for these additions: `npm test` — 17 passed; `npm run build` — passed; full `make test` — 182 passed, 11 expected skips, 27 existing missing-SVI warnings. Chrome acceptance checks passed, including exclusive live counts, all-county totals, label placement inside real tract outlines, selected-zone zoom synchronization, protected hatching, pixel variance, and responsive widths 320–1440 px. Compare text contrast at 1440 and 390 px was at least 6.95:1. All 46 protected model/data/configuration file hashes matched their starting values. Safari is not claimed.

Review preview: https://metric-grid-d2xxwozl2-karthiks-projects-65cb8506.vercel.app/?mode=compare (Vercel account sign-in may be required). Production remains on its prior deployment.


## Review polish and focused navigation

The landing view is now Compare. The official METRIC-Grid name is consistent across the header/footer, browser title, loading states, favicon title and README. The historical opener uses the existing start-time and temperature observations plus a separately sourced Duke Energy customer count, bundled at build time. The benefit sentence becomes neutral at settings that do not reduce both weighted harm and electric-heat exposure.

The main views are Compare / Explore / Prepare / Evidence. Compare has Two plans / What changed? / County summary / Plan range tabs; Evidence has Robustness / Forecast / Methods & sources tabs. Explore owns the priority list and public-building examples. Results are no longer presented as one long sequence. Comparison state, selected zone and camera are preserved between views; explicit mode and comparison-view deep links remain supported.

Tooltips clear on tract leave, mode/view changes, pan and scenario changes. Protected zones cannot receive the cut styling. SVG viewports fit local whole-tract geometry to each panel’s dimensions with padding, preserving every tract. The two-plan map panels are taller for geographic readability. README and the new PROJECT_CONTEXT identify Vercel as primary; the video starts on Compare, names Python + React/JavaScript and explains the precomputed results. Prepare is omitted from the video.


Final review validation: 19 web tests passed; production build passed; full Python suite completed with 182 passed and 11 expected skips (7 raw-data prerequisites and 4 unavailable browser builds). Chrome smoke checks covered exact rendered cut-zone sets across all 40 scenarios, protected exclusions, tooltip leave/tab cleanup, keyboard view tabs, the difference-map overlay shortcut, responsive widths 320–1440 px, local-only requests, shortlist/export flows, and safe optional content. Each comparison/evidence view passed contrast checks at 1440 and 390 px, with text at least 6.95:1. All 46 protected model/input/configuration hashes remained unchanged. Safari has not been verified.

Primary navigation remains reachable in a sticky top bar. The full introduction and headline results appear in Compare; other modes open directly into their own content. Primary-mode changes open at the top of their content, while scenario and selection state are preserved. Selecting a zone from Plan range opens its Explore inspector.

Current review preview: https://metric-grid-opwsq1y68-karthiks-projects-65cb8506.vercel.app/ (Compare opens by default; Vercel sign-in may be required). Production remains unchanged.
