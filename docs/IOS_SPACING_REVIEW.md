# iOS spacing and icon cleanup

Existing layout and brand retained. Model, frozen inputs, calculations, and numerical test expectations are unchanged. Changes are published on `ios-shell`; main and production are unchanged.

## Fixed

- Prepare uses consistent section gaps; export actions no longer touch the empty-state card.
- Empty-state icon, heading, body, and action are centered with explicit shared spacing.
- Menu, close, search, plus, and minus controls use inline SVGs instead of font glyphs that could render as boxes on iOS.
- Shared icon buttons center their contents; map vulnerability legends use an explicit title/ramp layout.
- Footer actions do not split across lines.

## Verified

- npm test: 34 passed. Lint and production web build passed.
- Native Xcode Simulator build: BUILD SUCCEEDED; updated bundle installed on the review device.
- WebKit at 320, 375, 414, and 768px: Compare, Explore, Prepare, Evidence, every Evidence section, Changes, resident Albemarle, and populated shortlists checked.
- Prepare section gaps and horizontal icon/title centering have numerical layout assertions. Status pills fit; phone menus stay within screen bounds.
- Chrome 1440px: all primary tabs render without horizontal overflow. No page errors across the tested views.
- Selected browser preview screenshots: `docs/figures/ios-spacing/`.

The screenshots in this pass are browser app-mode previews, not new native captures. Simulator display automation did not expose the review device reliably and its screenshot command returned an image-creation error. The previous native touch and SE letterboxing follow-ups in `IOS_REVIEW.md` remain; this cleanup does not claim to resolve those separate issues.

## Files

- `web/app.css`
- `web/ResidentView.jsx`
- `web/components/InterfaceIcon.jsx`
- `web/components/Preparation.jsx`
- `web/components/StandaloneHeader.jsx`
- `web/components/AppHeader.jsx`
- `web/components/ScenarioControls.jsx`
- `web/components/SelectionPanel.jsx`
- `web/components/ZoneSheet.jsx`
- `web/components/TownLookup.jsx`
- `web/components/MapFilters.jsx`
- `web/components/MapControls.jsx`
- `scripts/ios-spacing-smoke.cjs`
- `docs/IOS_SPACING_REVIEW.md`
- `CHANGELOG.md`
- `docs/AI_DISCLOSURE.md`
