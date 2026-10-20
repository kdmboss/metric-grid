# HEARTH UI pass 3 review

Preview: http://127.0.0.1:5175/ . Production has not been pushed or deployed in this pass.

## Done

- [x] Real, frozen Census place lookup: 79 places; required towns present; all IDs valid. Built independently with `make places`, without recomputing plans.
- [x] Current-setting town summaries and shared multi-zone highlighting; mandatory household-prediction disclaimer.
- [x] Compact controls, county cap/how-to menu, five-step spacing, centered legend, exact per-plan MW retained and band retained in Methods.
- [x] Desktop 360px overlay drawer; Escape clears it; explicit zone links preserved; no initial zone selection on a bare URL.
- [x] Paired desktop maps, taller Explore, three map controls, cursor hover cleanup.
- [x] Shortlist first, county import collapsed at the bottom; plain priority/robustness copy.
- [x] Conditional installed-app header/bottom tabs, original local line icons, nonmodal peek/half/full sheet, safe-area rules, horizontal phone KPIs, reduced-motion handling.
- [x] Presentation flag/P shortcut ignores text inputs; no outcome changes.
- [x] Chrome 1440×900 and WebKit 393×852 screenshots in `figures/ui-pass3/`; regular browser and standalone emulation checked separately.
- [x] `npm test`: 30 passed. `npm run lint`: passed. `npm run build`: passed. Targeted Python place/audit suite: 23 passed (one existing missing-SVI warning).
- [x] Apple home-screen icon verified opaque RGB, 180×180; local manifest/icons retained.

## Device review still needed

- [ ] Physical iPhone Add to Home Screen, real notch/home-indicator insets, OS keyboard and VoiceOver. Browser automation emulates standalone mode and viewport; it does not install the app on iOS.
- [ ] Owner visual approval before commit/push/deployment.

The static app still replays existing Python optimization results. There is no new live solver or network geocoder. All preexisting model/config/frozen result files are unchanged; the only new frozen file is the place lookup. `checks.json` records browser assertions, exceptions and external requests. The browser script is `scripts/ui-pass3-smoke.cjs`; it accepts `PLAYWRIGHT_MODULE`, `PLAYWRIGHT_BROWSERS_PATH` and `PREVIEW_URL` for the existing local runtime.
