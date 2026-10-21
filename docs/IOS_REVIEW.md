# HEARTH iOS Simulator review

Branch: `ios-shell`, based on `734a544`. Main and production are unchanged. The native app bundles existing frozen results; it does not run a live Python solver.

## Verified

- Xcode 26.2 Simulator build: **BUILD SUCCEEDED**. Installed and launched on iPhone 16 Pro, iOS 26.1.
- `npm test`: **34 passed**. `npm run lint`: passed. `npm run build`: passed.
- Full Python suite: **193 passed, 7 skipped**. The initial sandbox run could not bind a local test server; the successful full run used browser access and installed Chromium/WebKit.
- Existing browser smoke checks: desktop and phone layout, resident lookup, panel/map layout, no page errors. No website production deployment was performed.
- Native resident lookup: Albemarle returns eight areas and the expected plan statuses.
- Entry choice persists after termination/relaunch; native shortlist persists across reinstall/relaunch.
- Native Compare, Explore, Prepare, and Evidence screens render. Area lookup opens the sheet at peek; keyboard controls expand it. One area was added to the shortlist.
- Scenario JSON and shortlist CSV each open an actual iOS share sheet with nonempty files. Canceling returns to the app without an error alert.
- Native printing is hidden. Paper background, original opaque H icon, portrait orientation, and local bundled data are configured.
- Simulator screenshots and a nominal 20-second recording are in `docs/figures/ios/`. These are genuine native captures, not browser emulation.

## Review limits and remaining checks

The computer-control tool repeatedly rejected Simulator pointer actions with `noWindowsAvailable`. Keyboard navigation was used instead. Direct tract taps, dragging the sheet, map pinch gestures, and touch keyboard behavior still require a manual Simulator check. Physical haptics cannot be verified in Simulator.

The final native-only adjustment preserves top inset measurements, temporarily hides app chrome during text entry, and caps expanded sheets below the top safe area. It builds successfully, but the complete final touch/safe-area flow has not been re-captured. The requested final expanded-sheet and Changes screenshots are still missing. External links are routed through Capacitor Browser, but their Safari-sheet interaction has not been verified in Simulator.

The iPhone SE capture shows a letterboxed launch layout. Suggested next fix: inspect the launch-screen/device-family configuration and rebuild specifically for SE before calling that device ready. Do not treat SE safe-area verification as passed.

## Native polish observations

- The planner view remains information dense on a small phone. A later design pass could shorten the Explore introduction and reduce empty space above preparation content.
- The map legend's vulnerability labels wrap awkwardly at narrow widths; give the ramp a dedicated row in a later UI pass.
- Some captures show orange keyboard focus outlines because keyboard navigation was required; these are keyboard focus states, not selected-tab backgrounds.
- Native HTML select menus are long for the zone list. A searchable native-style area picker could improve this later; no new picker was added.
- Dependency audit: zero runtime advisories; three moderate development-tool advisories in the Capacitor CLI/xcode/uuid chain. Latest stable exact versions were retained as requested, without a forced downgrade.

## Captures

- `01-first-screen.png`: raw first launch capture.
- `02-welcome.png`: entry chooser.
- `03-resident-albemarle.png`: resident result and town map.
- `04-planner-compare.png`: planner first screen.
- `05-sheet-peek.png`: area selected through lookup, not a verified tract tap.
- `08-prepare-shortlist.png`: one saved area.
- `09-csv-share-sheet.png`: native CSV sharing.
- `10-evidence.png`: Evidence screen.
- `scenario-share-sheet.png`: native JSON sharing.
- `se-welcome.png`: SE launch capture; letterboxing needs follow-up.
- `demo_test.mp4`: Simulator test recording.

## Changed files

- `.gitignore`
- `CHANGELOG.md`
- `README.md`
- `capacitor.config.json`
- `docs/AI_DISCLOSURE.md`
- `docs/IOS_REVIEW.md`
- `docs/IOS_SIMULATOR.md`
- `docs/figures/ios/01-first-screen.png`
- `docs/figures/ios/02-welcome.png`
- `docs/figures/ios/03-resident-albemarle.png`
- `docs/figures/ios/04-planner-compare.png`
- `docs/figures/ios/05-sheet-peek.png`
- `docs/figures/ios/08-prepare-shortlist.png`
- `docs/figures/ios/09-csv-share-sheet.png`
- `docs/figures/ios/10-evidence.png`
- `docs/figures/ios/demo_test.mp4`
- `docs/figures/ios/npm-build.txt`
- `docs/figures/ios/npm-lint.txt`
- `docs/figures/ios/npm-test.txt`
- `docs/figures/ios/python-tests.txt`
- `docs/figures/ios/runtime-audit.json`
- `docs/figures/ios/scenario-share-sheet.png`
- `docs/figures/ios/se-welcome.png`
- `docs/figures/ios/web-smoke.txt`
- `docs/figures/ios/xcode-build.txt`
- `ios/.gitignore`
- `ios/App/App.xcodeproj/project.pbxproj`
- `ios/App/App.xcodeproj/project.xcworkspace/xcshareddata/IDEWorkspaceChecks.plist`
- `ios/App/App.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved`
- `ios/App/App/AppDelegate.swift`
- `ios/App/App/Assets.xcassets/AppIcon.appiconset/Contents.json`
- `ios/App/App/Assets.xcassets/AppIcon.appiconset/icon-ios-marketing-1024-1.png`
- `ios/App/App/Assets.xcassets/AppIcon.appiconset/icon-ipad-20-1.png`
- `ios/App/App/Assets.xcassets/AppIcon.appiconset/icon-ipad-20-2.png`
- `ios/App/App/Assets.xcassets/AppIcon.appiconset/icon-ipad-29-1.png`
- `ios/App/App/Assets.xcassets/AppIcon.appiconset/icon-ipad-29-2.png`
- `ios/App/App/Assets.xcassets/AppIcon.appiconset/icon-ipad-40-1.png`
- `ios/App/App/Assets.xcassets/AppIcon.appiconset/icon-ipad-40-2.png`
- `ios/App/App/Assets.xcassets/AppIcon.appiconset/icon-ipad-76-1.png`
- `ios/App/App/Assets.xcassets/AppIcon.appiconset/icon-ipad-76-2.png`
- `ios/App/App/Assets.xcassets/AppIcon.appiconset/icon-ipad-83.5-2.png`
- `ios/App/App/Assets.xcassets/AppIcon.appiconset/icon-iphone-20-2.png`
- `ios/App/App/Assets.xcassets/AppIcon.appiconset/icon-iphone-20-3.png`
- `ios/App/App/Assets.xcassets/AppIcon.appiconset/icon-iphone-29-2.png`
- `ios/App/App/Assets.xcassets/AppIcon.appiconset/icon-iphone-29-3.png`
- `ios/App/App/Assets.xcassets/AppIcon.appiconset/icon-iphone-40-2.png`
- `ios/App/App/Assets.xcassets/AppIcon.appiconset/icon-iphone-40-3.png`
- `ios/App/App/Assets.xcassets/AppIcon.appiconset/icon-iphone-60-2.png`
- `ios/App/App/Assets.xcassets/AppIcon.appiconset/icon-iphone-60-3.png`
- `ios/App/App/Assets.xcassets/Contents.json`
- `ios/App/App/Assets.xcassets/Splash.imageset/Contents.json`
- `ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732-1.png`
- `ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732-2.png`
- `ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732.png`
- `ios/App/App/Base.lproj/LaunchScreen.storyboard`
- `ios/App/App/Base.lproj/Main.storyboard`
- `ios/App/App/Info.plist`
- `ios/App/App/SceneDelegate.swift`
- `ios/App/CapApp-SPM/.gitignore`
- `ios/App/CapApp-SPM/Package.swift`
- `ios/App/CapApp-SPM/README.md`
- `ios/App/CapApp-SPM/Sources/CapApp-SPM/CapApp-SPM.swift`
- `ios/debug.xcconfig`
- `package-lock.json`
- `package.json`
- `web/app.css`
- `web/components/Preparation.jsx`
- `web/components/ScenarioControls.jsx`
- `web/components/TownLookup.jsx`
- `web/components/Welcome.jsx`
- `web/hooks/useAppShell.js`
- `web/hooks/useShortlist.js`
- `web/hooks/useWorkspace.js`
- `web/main.jsx`
- `web/planning.js`
- `web/platform.js`
- `web/platform.test.js`
