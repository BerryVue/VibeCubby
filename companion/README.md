# VibeCubby for iOS (companion app)

One native app, published once, that gives every self-hosted cubby "real app"
powers: reliable push notifications, haptics, and a first-class home on the
phone. Users install it, type their cubby's address, and move in.

This is the legal version of "apps without the App Store process": the store
process happens once, for this shell - never for individual cubby apps.

## Architecture

- `www/` - the onboarding screen (enter cubby URL, validated against
  `/health`, stored with Preferences). After setup the WebView navigates to
  the cubby itself; `server.allowNavigation: ["*"]` keeps the native bridge
  (`window.Capacitor`) available there.
- The cubby's UI (in `../src/ui.js`) detects the bridge and: registers the
  device for push (`POST /api/push/register`), and fires haptics on actions.
- Push flow: cubby Worker -> `../relay/` (APNs relay on relay.vibecubby.com)
  -> Apple -> device. Cubbies without the companion pay zero cost - the
  notify hook is inert unless `PUSH_RELAY_URL` is set.

## Human checklist (in order)

1. **Apple Developer Program** (~$99/yr): enroll at
   https://developer.apple.com/programs/enroll/ . For an LLC, enroll as
   **Organization** - you need a D-U-N-S number for the legal entity
   (check/request free at https://developer.apple.com/enroll/duns-lookup/ ).
2. **Xcode** from the Mac App Store.
3. Open the project: `cd companion && npx cap open ios` -> in Xcode:
   Signing & Capabilities -> select your Team -> add capability
   **Push Notifications**.
4. **APNs key**: developer.apple.com -> Certificates, Identifiers & Profiles
   -> Keys -> new key with Apple Push Notifications service -> download the
   `.p8` (one chance!). Note the Key ID and your Team ID.
5. **Deploy the relay**: from `../relay/`:
       npx wrangler secret put APNS_AUTH_KEY   # paste the .p8 contents
       npx wrangler secret put APNS_KEY_ID
       npx wrangler secret put APNS_TEAM_ID
       npx wrangler deploy
6. Run on your iPhone from Xcode (free with membership), then archive and
   upload to TestFlight / App Store when ready.

## Development notes

- After changing `www/`: `npx cap sync ios`.
- **No CocoaPods needed.** The iOS project uses Swift Package Manager
  (`ios.packageManager: "SPM"` in `capacitor.config.json`, package manifest
  in `ios/App/CapApp-SPM`). Heads-up if you ever regenerate the platform:
  Capacitor CLI 7.6.x has a case-sensitivity bug where
  `cap add ios --packagemanager SPM` still demands CocoaPods; work around it
  with `CAPACITOR_COCOAPODS_PATH=/usr/bin/true npx cap add ios
  --packagemanager SPM`, ignore the final "update ios" error, then run
  `npx cap sync ios` (which detects SPM correctly and finishes the job).
- Simulator build without an Apple account:
  `xcodebuild -project ios/App/App.xcodeproj -scheme App
  -destination 'platform=iOS Simulator,name=iPhone 17'
  CODE_SIGNING_ALLOWED=NO build`
- Bundle id: `com.vibecubby.app` (change in `capacitor.config.json` AND in
  the relay's `APNS_TOPIC` var if you fork this).
- App icon assets live in `ios/App/App/Assets.xcassets` - replace with the
  cubby icon before shipping.
