# iOS design pass (branch `ios-design`)

Design and motion only: model numbers, data, logic and test expectations are untouched. Figures are in `docs/figures/ios-design/`. Simulator captures use the iPhone 17 Pro (iOS 26.5), because no iPhone 16 Pro runtime is installed on this machine.

## System
- **Type**: Plus Jakarta Sans Variable (bundled by `@fontsource-variable/plus-jakarta-sans`, no CDN); Inter removed from the web app. Apple text styles are tokens in `tokens.css` (`--font-large-title` … `--font-caption`), `tnum` on all numbers, hero KPIs 48/34px bold. Nothing under 12px except the 11px tab labels the brief specifies. Secondary text is `#6B635A` (5.3:1 on `#F6F3EE`).
- **Surfaces**: grouped white 14px containers, no borders, inset 0.5px hairlines, one soft lift shadow; frosted material (`rgba(246,243,238,.72)` + blur) on the tab bar, scrolled nav bar and sheets. Ember is the only accent; success green only for "Kept on".
- **Icons**: lucide-react, one 1.75 stroke weight (replaces the hand-drawn marks).
- **Motion** (`motion/react`, springs only, `MotionConfig reducedMotion="user"`): see below.

## Per screen: before → after
- **Launch**: web loader showed a small logo + text at the top → centered logo on paper that continues the native splash; first screen fades in and rises 8px (splash 300ms + 200ms fade).
- **Nav bar (all screens)**: static header with a pill menu → large title collapsing to a centered 17px inline title with frosted material fading in on scroll; circular 36px actions; the old dropdown menu is now an action sheet.
- **Tab bar**: web tabs with a tinted blob → 49px + safe-area frosted bar, outline/filled icons, ember tint only, spring scale on the selected icon; 150ms crossfade + 6px settle between tabs.
- **Compare**: equal bordered cards, 24px KPIs, web segmented control → one 48px hero KPI (counts to new values in 400ms, delta pill pops on a spring) with two supporting tiles; iOS segmented control whose thumb slides on a spring; scenario summary row; full-bleed map with frosted floating zoom controls; totals in a grouped card.
- **Scenario editor**: browser `<input type=range>` + button row → 28px thumb stop slider with a floating label pill, fill in ember, haptic per stop; switch row for county concentration; Reset as a row.
- **Explore**: card around the map → full-bleed map; filters (county, layer, overlays, search) in a frosted bottom sheet; county and layer pickers are action sheets with a checkmark.
- **Zone details**: 120px two-state drawer → three-detent sheet (peek 140px / 50% / 92%), drag with flick projection, progressive dim, swipe down to dismiss, map stays live at peek. Facts are grouped rows; the zone `<select>` is a searchable action sheet. The map eases to the selected zone and the "Zone N" pin drops in on a spring.
- **Place lookup**: bordered input + dropdown → iOS search field (clear button, Cancel slides in on focus), results as a grouped list, place detail as a pushed screen.
- **Prepare**: bordered boxes → Export/Print as rows, centered empty state (icon circle, title, line, primary button), shortlist items enter with fade + slide and collapse on removal; follow-up `<select>` is an action sheet; undo banner is a floating pill.
- **Evidence / Methods**: web tabs → "View" picker row on phone; Methods is a pushed screen (old screen shifts 30% left and dims, edge-swipe back); document links are external-link rows.
- **My area (resident)**: bulleted list in a bordered card → progress ring + checklist rows: checkbox fills on a spring, check draws in (`pathLength`), ring animates, success haptic and a ring pulse at 5/5. Checked state is kept in `localStorage` only.
- **Status pills**: Cut = ink fill; Kept on = success 12% fill with a dot; Protected = neutral fill with a hatched dot.
- **Desktop 1440×900**: same components; sidebar rail, three-column KPI strip and right-hand area panel unchanged (see `desktop_1440x900.png`).

## Notes and deviations
- The brief mentions a "Plan screen", "Warmth" and a "place list"; this app has no such screens. Mapped to: pushed **Methods** and pushed **place detail**; "Warmth" is shown as Explore with the electric-heat layer (`explore.png`); the Home Cooling test card is not in the shipped data.
- The checklist (checkable, with progress) is new UI state added to make the specified checklist motion possible; no model data is involved.
- Style linter (`scripts/check-ui-source.mjs`) required deleting CSS for removed class names; ~190 legacy rules were pruned. The older `scripts/*smoke*.cjs` Playwright scripts reference the old `<select>` ids and were not updated.
- Bundle grew by about 120 kB gzip (motion + icons).
- Simulator stills were driven by an injected tap script served from a scratch server (no product code); `segmented_mid.png` is a frame cut from the recorded video at the moment the thumb is between segments. `motion.mp4` is a 30s Simulator recording of the transitions.
