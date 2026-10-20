# UI changes · 2026-10-19

## Current review · warm light cleanup

This section describes the current owner-requested cleanup. Sections below it record earlier iterations and their historical screenshots/validation.

- One self-hosted Inter family, 400/600 weights, tabular numerals, the specified type scale, centralized warm paper/ember tokens and a centered 1200 px workspace.
- Three outcome cards keep the total-household trade-off visible. The shared target band and both actual MW cuts appear below the controls. At alpha zero the optimized column is named Business-cost optimized; all signs follow the existing outcomes.
- Compare has Two plans and What changed?. County summary and Plan range are in Evidence, with legacy deep links migrated. County imports remain in Prepare. The resident tools remain in a disclosure below the comparison.
- Phone users switch one map between the two plans and tap a tract for a native detail sheet; keyboard users can open the selected-zone button. County labels stay 12 screen pixels, with subtle halos, collision spacing and leaders where needed.
- Home-screen metadata and a standalone manifest use original local H icons. No service worker, background refresh, model change or production deployment was added.

### Removed from the visible layout

- Repeated hero subtitle and benefit copy; the longer customer-count narrative remains sourced in Methods.
- The right-side reference box, fourth MW KPI tile and amber underline.
- The house icon and tagline in the header/footer, the empty Prepare count, the tab-bar plan-count sentence and “Planning workspace” header text.
- The permanent how-to row, open filter bar and always-visible county-cap switch. Their functions remain in How to use, Filters and More options.
- Monospace typography and the prior blue/teal/yellow palette. No functional model, county data, shortlist, evidence, quote or story feature was removed.

### Verification for this cleanup

- 25 web tests pass, including the 23 retained tests and 2 new presentation regressions; production build passes.
- The full Python run has 183 passed and 8 prerequisite skips. Its four legacy map-render setups were initially blocked by sandbox socket restrictions; rerunning those four outside the sandbox gives four missing-browser-build skips. Across both runs: 183 passed, 12 skipped. Existing tests were not rewritten for this cleanup.
- The current cleanup browser script verifies all six required widths (320/375/390/414/768/1440), typography, no root horizontal overflow, actual tract tapping, mobile plan switching/sheet dismissal, filters, priority extremes, county cap, Evidence navigation, legacy links, local home-screen assets, no page exceptions and no external requests.
- The desktop map surface starts at approximately 764 px, inside a 1440×900 viewport. At 390×844, all three KPI cards and the household trade-off fit in the default screenshot.
- Palette text contrast: primary on paper 15.47:1; secondary on paper 6.52:1; secondary on cards 7.21:1; ember on cards 5.55:1. Essential labels use secondary text rather than the lower-contrast decorative muted tone.
- Model and frozen-data differences are empty. Browser checks use Chrome; an actual iPhone/Safari Add to Home Screen launch is not claimed.

### Current screenshots

- [Desktop default](figures/cleanup_desktop_default.png), [middle priority](figures/cleanup_desktop_middle.png), [selected zone](figures/cleanup_desktop_selected.png), [business-cost-only honesty check](figures/cleanup_desktop_cost_only.png).
- [Phone default](figures/cleanup_phone_default.png), [middle priority](figures/cleanup_phone_middle.png), [selected-zone sheet](figures/cleanup_phone_selected.png), [other plan selected](figures/cleanup_phone_other_plan.png).

The default priority is already the middle position; the middle-priority shots explicitly return to it after testing another value. The standard `ui_first_screen_1440.png` and `ui_phone_390.png` aliases also show this cleanup. Current browser checks run with `node scripts/cleanup-smoke.cjs`; the older workspace smoke script retains its pre-cleanup interface expectations and is preserved as requested.

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

The landing view is now Compare. At that review stage, the former app name was consistent across the header/footer, browser title, loading states, favicon title and README. The historical opener uses the existing start-time and temperature observations plus a separately sourced Duke Energy customer count, bundled at build time. The benefit sentence becomes neutral at settings that do not reduce both weighted harm and electric-heat exposure.

The main views are Compare / Explore / Prepare / Evidence. Compare has Two plans / What changed? / County summary / Plan range tabs; Evidence has Robustness / Forecast / Methods & sources tabs. Explore owns the priority list and public-building examples. Results are no longer presented as one long sequence. Comparison state, selected zone and camera are preserved between views; explicit mode and comparison-view deep links remain supported.

Tooltips clear on tract leave, mode/view changes, pan and scenario changes. Protected zones cannot receive the cut styling. SVG viewports fit local whole-tract geometry to each panel’s dimensions with padding, preserving every tract. The two-plan map panels are taller for geographic readability. README and the new PROJECT_CONTEXT identify Vercel as primary; the video starts on Compare, names Python + React/JavaScript and explains the precomputed results. Prepare is omitted from the video.


Final review validation: 19 web tests passed; production build passed; full Python suite completed with 182 passed and 11 expected skips (7 raw-data prerequisites and 4 unavailable browser builds). Chrome smoke checks covered exact rendered cut-zone sets across all 40 scenarios, protected exclusions, tooltip leave/tab cleanup, keyboard view tabs, the difference-map overlay shortcut, responsive widths 320–1440 px, local-only requests, shortlist/export flows, and safe optional content. Each comparison/evidence view passed contrast checks at 1440 and 390 px, with text at least 6.95:1. All 46 protected model/input/configuration hashes remained unchanged. Safari has not been verified.

Primary navigation remains reachable in a sticky top bar. The full introduction and headline results appear in Compare; other modes open directly into their own content. Primary-mode changes open at the top of their content, while scenario and selection state are preserved. Selecting a zone from Plan range opens its Explore inspector.

Current review preview: https://metric-grid-opwsq1y68-karthiks-projects-65cb8506.vercel.app/ (Compare opens by default; Vercel sign-in may be required). Production remains unchanged.


## HEARTH visible identity

The web header and footer use HEARTH, the requested muted tagline, and a locally drawn house-and-warmth icon. The browser title, loading and benefit copy, print sheet, CSV/JSON exports and favicon match. The retained Streamlit app is labeled as the legacy interface and carries the same identity. Repository/package/module names and the Vercel hostname stay stable.

Review screenshots: [1440 × 900 first screen](figures/ui_first_screen_1440.png) and [390 × 900 phone first screen](figures/ui_phone_390.png). Chrome’s full workspace smoke check passed. Web tests: 20 passed. Production build passed. Python suite: 182 passed, 11 skipped, 27 existing missing-SVI warnings. A protected Vercel review preview is ready at https://metric-grid-dn2xyt1s3-karthiks-projects-65cb8506.vercel.app/ (HTTP 200; sign-in may be required). This preview was not promoted to production.
