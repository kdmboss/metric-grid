# HEARTH UI pass 4 review

Preview: http://127.0.0.1:5176/ . This pass is local only; production is unchanged.

1. **Done — shared status pills.** Cut, Kept on and Protected use the existing shared component with nonshrinking content-sized geometry. Browser assertions require `scrollWidth <= clientWidth` and containment in the parent row. Kept-on color is a named token for #EFE9E1.
2. **Done — desktop area panel.** One 360px container with 20px padding, no nested card, no Selected area caption, a plain 32px close control and keyboard-only focus ring. The comparison content shrinks with a 200ms width transition, preserving both maps and the household trade-off beside the panel.
3. **Done — full-width desktop controls.** Removed the Compare side rail presentation; restored the top control card with a wide slider and town search. Explore puts town search above its full-width map. Equal-width desktop cut presets are 36px tall.
4. **Done — KPI alignment.** Identical padding, row structure, label margins and numeric line-height; browser checks compare the numeric top positions. Trade-off tint retained.
5. **Done — town lookup.** Town camera fit adds 25% context relative to the prior fit; town names appear on each map. The live summary remains; an accessible in-field × clears the lookup.
6. **Done — regular phone Safari.** Comparison tabs stack above the full-width plan toggle; a filter icon sits beside the tabs. Short current-result copy, Export in the ⋯ menu, and touch-specific pinch/drag hint.
7. **Done — installed-app phone mode.** MW-only/Aware/Changes selector reaches the difference map. An actual WebKit touchscreen tap on a visible displayed-map tract opens the sheet at peek. Bottom tabs use ember tint without a filled selected background.
8. **Done — copy.** Updated priority/shortlist headers and Elliott comparison subtitle. Added a small action hint and a task-focused introduction in response to the owner's request for a more user-oriented interface.
9. **Done — verification artifacts.** Seven requested screenshots in `figures/ui-pass4/`, web test/lint/build logs and browser checks. Physical iPhone installation remains unverified; installed-app display mode is emulated in WebKit.

No model, data, frozen results, numerical calculations or existing test expectations were changed. The new browser script adds checks; the old browser review scripts remain historical evidence for their earlier UI layouts.

User flow: compare choices → select an area → save it for preparation. The app supports discussion of outreach/warming centers/backup power; it does not prove those resources have been allocated or predict an individual home's outage.
