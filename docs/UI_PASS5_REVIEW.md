# HEARTH pass 5 review — feature freeze

Local production-build preview: http://127.0.0.1:4173/ . Resident: `?view=resident`; planner: `?view=planner`. Production remains the earlier deployed release; this pass was not pushed or deployed.

## 1. Entry and resident/planner paths — done

First-visit welcome, remembered local choice with storage-failure fallback, URL overrides, and Switch view in both desktop/browser and installed-app menus. No accounts, analytics or remote search. Resident counts derive from the same `status()` function for Elliott/Balanced/cap-off regardless of planner query parameters. One map, town label/context padding, readiness tips and full-planner link. Residents retain the household disclaimer and district total-household trade-off. The bottom planner tabs are absent in resident app mode.

Browser checks prove remembered choice, query override, blocked-storage fallback, switching and Albemarle's 8/2/0 area results. Node tests compare all place counts to zone statuses. Screenshots: welcome, resident desktop and resident iPhone app, planner Compare.

## 2. Independent cooling test — done; real measurement not supplied

Standard-library serial parser and least-squares fit with selected window, first observed start temperature, rate, R² and time-to-reference. Flat/warming tests yield null; already-below-reference starts yield zero. Overnight windows supported. Demo data is marked and cannot be written into runtime directories; the exporter refuses demo/unverified files. No `node_cooling.json` is shipped. The UI is absent without real input; the only cooling screenshot uses a private browser-response fixture and is named `cooling-card-fixture.png`, with an explicit fixture banner.

The supplied brief's WHO attribution was corrected: 18°C is 64.4°F. The 64°F chart line/calculation remains a separately labeled test reference, not an exact WHO minimum. This single-room heat-off/power-on demonstration does not imply outage operation or enter the planning model. README has the five-step procedure.

## 3. Pass 4 rechecks — done

Screenshots and assertions in `figures/ui-pass5/pass4/`: shared Cut/Kept on/Protected pills do not clip; panel shrinks content and keeps both maps/results visible; full-width controls; aligned KPI values; Safari tabs/toggle do not overlap; app Changes is reachable; an actual touchscreen tap inside a visible displayed-map tract opens peek. No horizontal page overflow at 320/375/414/768px. The older script now explicitly enters planner mode without weakening any assertions.

## 4. Pre-submission checks

- **Done:** web tests, lint, build and targeted Python cooling/audit tests. 33 web tests and 28 targeted Python tests passed; lint and build passed. Exact outputs are in this review directory.
- **Done:** source terminology review. Required district sentence, official identity strings and the quoted banned-term assertions in the existing test file are identified separately. No new forbidden user-facing terminology.
- **Done:** Codex/per-file disclosure updated; owner-review fields remain for the owners.
- **Not literally satisfied:** the requested raw history API-key grep returns 15 variable-name/reference lines. **No suspected credential literals** were found by the key-assignment/token/private-key pattern scan. Names and documentation are not secrets; no history rewriting was performed. This limited pattern scan is not a universal proof that every possible secret format is absent.
- **Done:** mobile Lighthouse on the local production build: welcome Performance **88**, Accessibility **100**; resident **91**, **100**; planner **88**, **100**. HTML/JSON reports retained. Hidden screens/maps mount on demand and repeated map bounds are reused; numerical outputs are unchanged.
- **Done:** earlier deployed Vercel site cold-loaded in a fresh private context, no console/page errors; `/data/app.json` returned 200. This checks the existing production release, not unpublished pass-5 features.
- **Not done:** physical iPhone installation/OS safe-area/VoiceOver testing. Installed-app display mode is emulated in WebKit.
- **Not done:** an actual home cooling measurement; none was fabricated.

## 5. Review handoff — done

Seven pass-4 recheck screenshots plus welcome, resident desktop/phone, planner and clearly labeled fixture screenshots are saved. Tests' existing expectations, existing frozen datasets, optimization/model code and configuration values are unchanged. Features are frozen after this pass; further work is fixes, validation, owner review and submission preparation.
