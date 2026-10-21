# HEARTH iOS Simulator shell

This branch wraps the existing React interface with Capacitor. It bundles the same frozen results and local place lookup; Python calculations, data, and scenario choices are unchanged. It is for Simulator review, with no App Store submission or production deployment.

## Run

1. Install dependencies with `npm ci`.
2. Run `npm run ios` to build the web bundle, sync it into the native project, and open Xcode.
3. Select an iPhone Simulator and press Run. No Apple Developer account is required for Simulator.

`npm run ios:run` builds, syncs, and invokes Capacitor's device picker. The native project is `ios/App/App.xcodeproj`; Swift Package Manager resolves the native libraries. Build output and generated web bundles are ignored. After editing web files, rebuild and sync before running Xcode.

## Native behavior

- Native detection enables the existing app header, bottom tabs, and area sheet.
- Entry choice and shortlist remain in local WKWebView storage.
- Scenario JSON and shortlist CSV are written to the app cache and presented through the iOS share sheet. Canceling sharing is harmless. Print is hidden in native mode.
- External source and preparedness links open in an in-app Safari sheet. Bundled Methods documents use file sharing, keeping the app screen intact.
- Native light haptics accompany tract selection, a changed priority stop, and adding a new shortlist item. Simulator cannot verify physical vibration.
- Native page zoom is disabled; the map retains its own pinch gesture. Website page zoom remains available.
- Search focus hides bottom navigation; picking a town dismisses the keyboard.
- The icon is an opaque original H on paper. Launch uses a paper background with centered HEARTH text; iPhone orientation is portrait.

## Verification record

See `IOS_REVIEW.md` for build results, Simulator captures, limitations, and the changed-file inventory. Production stays unchanged.
