# HEARTH UI brief

Current last-cleanup verification: [UI_PASS6_REVIEW.md](UI_PASS6_REVIEW.md). Feature freeze remains in effect.
Paired desktop maps fill the content row; selected-zone details use a panel beside the resized content, with a nonmodal sheet on compact screens. The app uses
`web/app.css`, variable-only `tokens.css`, and dedicated components/hooks.

## Product name and purpose

**HEARTH** — Outage planning that remembers who's home.

HEARTH helps emergency planners and community stakeholders compare how load-only and vulnerability-aware outage scenarios could distribute risk across North Carolina's 8th District.

## Identity

- Use HEARTH in all visible application branding, browser metadata, print output, downloads and the retained legacy interface.
- Use the HEARTH wordmark alone in the header and footer. The favicon and home-screen icon use an original geometric H. All assets are local.
- Keep the app tagline out of the compact header; show only the wordmark and NC-08 pill.
- Keep the repository name, Vercel hostname, folder names and Python identifiers stable; the npm package is `hearth` as requested in UI pass 2.

## Product experience

Keep Compare as the default, with focused tabs for Two plans and What changed?. County summary and Plan range live in Evidence alongside robustness, forecast and methods. Explore holds map search and tract evidence; Prepare holds a manual shortlist; Evidence holds robustness, forecast and methods. Use people-first result labels and keep the total-household trade-off visible alongside positive results.

Prepare also holds County data: a local CSV drop box with an empty template, whole-file validation, named source/update dates, county filtering, and current modeled tract statuses. Imported resources are session-only county-supplied context; they do not change the model, loads, or protected zones. Render all imported content as text.

On Compare, retain “Check your area” and winter tips in a disclosure below the maps so the comparison remains visible on the first screen. At freeze time, use 2024 Census TIGER place polygons to build a local place-name-to-zone lookup; do not geocode at runtime or invent matches. The result reports current-plan zone statuses and aggregate tract household/electric-heat context and always shows “A modeled planning scenario, not a prediction for your home.” If the frozen lookup is unavailable during local development, disclose that state rather than returning fabricated matches. Pair the lookup with five brief winter-outage tips and official ReadyNC and Ready.gov links.

## Evidence and limits

Use existing frozen scenario results. The web interface selects precomputed Python optimization results; it does not run a live solver or monitor the grid. Keep actual MW for both plans and the shared target band visible. Use modeled/estimated labels, preserve provenance and explain the census-tract geography. Never present the weighted score as a count of particular people protected, invent personal stories or quotes, or change model and data inputs as part of visual work.

## Visual system (2026-10-19 cleanup)

The owner-specified warm light palette and shared tokens live in `tokens.css`. Inter is the only font; use weights 400/600 and tabular numerals. The type scale is 12/14/16/20/32/48 px; the mobile hero is 32 px. Cards use 24 px padding, 12 px radii, and one border. The centered content width is at most 1200 px. Ember identifies the optimized plan, warm gray the load-only comparison, and ink the household trade-off. All previous blue/teal/yellow styling is retired.

On phones, Compare displays one map with an MW-only/optimized-plan toggle. Tapping a tract opens a native dialog bottom sheet; the selected-zone button provides keyboard access. Filters and how-to instructions open on tap. At alpha zero, the optimized column is labeled Business-cost optimized because human impact has zero objective weight; outcome wording still follows the actual values.
