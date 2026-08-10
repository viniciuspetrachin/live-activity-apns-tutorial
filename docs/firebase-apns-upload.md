# Upload APNs Auth Key to Firebase

Use **your** Apple Developer APNs Auth Key (`.p8`). Do not commit the key file (this repo gitignores `*.p8` and `/credentials/`).

## What you need

| Field | Where to get it |
|-------|-----------------|
| `.p8` file | Apple Developer → Keys → Apple Push Notifications service (APNs) |
| Key ID | Shown when you create/download the key |
| Team ID | Apple Developer → Membership |
| Bundle ID | Same as `ios.bundleIdentifier` in `app.json` |

## Firebase Console

1. [Firebase Console](https://console.firebase.google.com/) → your project
2. ⚙️ Project settings → **Cloud Messaging**
3. Under Apple app configuration for your iOS app → **APNs Authentication Key** → Upload
4. Select the `.p8`, enter Key ID and Team ID → Save

## EAS

If you use EAS Build, also upload the same Push Key under your Expo project credentials so device builds get the correct push entitlement/environment.

## Local storage tip

Keep the `.p8` outside the repo or under a gitignored path such as `credentials/apns/`. Never paste Key ID / Team ID into public docs for a personal account.
