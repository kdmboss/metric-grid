# HEARTH pass 6 — last cleanup

Production-build preview: http://127.0.0.1:4173/ . This pass is local only, with no push/deployment.

1. **Done — repeated copy removed.** Resident results have one event/replay disclaimer, only at the bottom of the result card. Removed the duplicate introduction/map/footer caveats and district household totals from the resident page, as explicitly requested. Planner town search no longer repeats the household disclaimer; the planner's household trade-off and Methods remain. The resident map has a compact vulnerability/critical-facility legend.
2. **Done — visual resident answer.** Albemarle retains its title and existing counts, displayed as MW-only “2 of 8 areas lose power” and people-first “All 8 stay on” using the shared Status component. Numbers and classification logic are unchanged.
3. **Done — KPI edges.** Desktop labels, values and sub-lines share a left edge. Shortened weighted-impact comparison to “the typical MW-only plan”; direction remains dynamic. Compact text is used in a narrow panel-open desktop layout to avoid overflow.
4. **Done — phone cleanup.** Electric-heat label now names homes. Tiles are capped at 112px with compact content; narrow 320px screens use the allowed 80% swipe cards. Removed the phone helper line and empty filter row; filter and plan selector share one row in Safari/app mode. A district tract is visible on the first app screen.
5. **Done — panel-open map widths.** An inline-size container query stacks paired maps below 1280px of available content width, preserving shared view state. Browser checks verify both maps remain at least 500px wide beside the panel at 1440px and 1200px viewport widths.
6. **Done — checks/screenshots.** Web test/lint/build outputs and browser assertions saved in `figures/ui-pass6/`. Requested desktop default, panel open, resident desktop/phone and app Compare screenshots are included, plus Safari and full-page stacked maps. Terminology review uses the existing required-sentence/identity exceptions and identifies existing test-list literals separately.

The earlier copy regression was updated to assert the newly requested single resident disclaimer, normalizing JSX whitespace. No numerical assertions or model/data tests were weakened. Older pass-4/pass-5 browser scripts are historical UI evidence; pass-6 assertions reflect the explicitly requested display changes.

Feature freeze remains in effect. No new features, model/data changes, configuration changes or real cooling measurements. Physical iPhone installation remains unverified; phone app screenshots use WebKit standalone emulation.
