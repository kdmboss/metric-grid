# METRIC-Grid — current project context

Repository files and the amendments in `docs/SPEC.md`, `CLAUDE.md`, and `docs/ASSUMPTIONS.md` take precedence over old pasted briefs.

## Product and deployment

METRIC-Grid helps emergency planners and community stakeholders compare how load-only and vulnerability-aware outage scenarios could distribute risk across North Carolina's 8th District. The official name is **METRIC-Grid**.

Primary public app: https://metric-grid.vercel.app/. The current interface is React + JavaScript, built with Vite and deployed as a static Vercel site. The original Python model and data pipeline produce the precomputed optimization results. The browser selects those results and computes presentation summaries locally. No live optimization, runtime external data services, secrets or database are required. The retained Streamlit interface is for reproducibility, not the primary submission link.

The current UI branch is `codex/map-first-workspace`; production remains unchanged during review. Preview URLs are temporary and may require Vercel sign-in. Do not promote a preview or merge to production without the owner’s approval.

## Navigation

- Compare is the default. Its views are Two plans, What changed?, County summary, and Plan range.
- Explore contains local geographic search, map layers, selected-zone evidence, the priority list and example public buildings.
- Prepare keeps a user-selected shortlist, notes, CSV export and print output locally. It is omitted from the video workflow.
- Evidence contains Robustness, Forecast and Methods & sources.

Deep links preserve alpha, target percentage, county cap, selected zone and explicit mode. Comparison views use `section=plans|changes|counties|range`. Invalid or omitted modes fall back to Compare.

## Scientific and editorial boundaries

The reference remains Winter Storm Elliott on December 24, 2022. The interface explores hypothetical shortage sizes and priorities using that reference; it is not live grid monitoring, a prediction, Duke’s selection method or an operational switching tool. Geography is census tract zones, not utility boundaries. Both plans use the same MW band, with their actual MW reported separately. Protected facility zones are hard exclusions, with incomplete coverage disclosed.

All outcomes come from existing results. Show the total-household trade-off alongside positive vulnerability/cost results. Cost units remain 2013 dollars for the configured duration. A weighted vulnerability score is not a count of specific seniors or families protected. Explanatory text must reverse or become neutral when the current scenario worsens an outcome. Do not change `src/metric_grid/model/`, `ingest/`, `geometry/`, `train/`, `data/frozen/` or configuration values for UI work.

Historical narrative facts are separately sourced in `docs/historical_context.yaml` and bundled at build time. Start time comes from frozen scenario constants; approximate temperature comes from the frozen KCLT reference-hour observation. It is not a temperature measurement at every tract or at the exact start minute.

Quotes are bundled from `docs/quotes.yaml`; only permission-approved, fully attributed, nonempty entries render. Author text comes from `docs/author_story.md` and is rendered safely as plain text. Both content files remain empty until the owners supply real content. Never invent a personal experience or testimonial.

## Commands and review

`npm ci`; `npm run dev` (port 5173); `npm test`; `npm run build`. Browser checks: `node scripts/workspace-smoke.cjs` with the existing Playwright runtime and Chrome. The Python suite is `make test`; raw-data and unavailable browser-build skips are documented in the validation report. No dependency additions are needed for the interface.

Update `CHANGELOG.md`, `docs/AI_DISCLOSURE.md`, `docs/VIDEO_SHOTLIST.md` and review screenshots with UI changes. Keep every AI tool and file disclosed; author-review fields belong to the owners. The video names Python for data/optimization and React/JavaScript for the interface, explains precomputed results, starts on Compare and keeps the household trade-off visible. See `docs/VIDEO_SHOTLIST.md` for the current sequence. Stop for owner review after checks and screenshots; keep production unchanged.
