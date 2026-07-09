# Cuntas — Tuathan tax tracker

A fully self-contained, offline tax tracker for a sole trader in the North of Ireland.
No frameworks, no accounts, no AI, no external services. Everything runs and stays on your device.

## Files

- `index.html` — the whole app
- `sw.js` — service worker (makes it work offline)
- `manifest.webmanifest` + `icon-192.png` / `icon-512.png` — makes it installable (swap the icons for your logo: same names, square PNGs)
- `vendor/` — the on-device receipt reader (see below)

## Matching the Tuathan look exactly

Copy two files from your tuathan.com repo into this folder:
- your logo: `assets/logo/logo.svg` → save here as `logo.svg` (appears in the app header and on the report letterhead; falls back to the gold icon if missing)
- your display font: the BuiltTitling font file → save here as `built-titling.woff2` (or .woff / .ttf; headings fall back to Georgia if missing)

## One-time setup: the receipt reader (~15 MB)

The receipt scanner reads photos entirely on your phone using Tesseract, an open-source
OCR engine that runs inside the browser. To enable it, download these four files and put
them in the `vendor/` folder with exactly these names:

1. `tesseract.min.js`
   https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js
2. `worker.min.js`
   https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js
3. `tesseract-core-simd-lstm.wasm.js`
   https://cdn.jsdelivr.net/npm/tesseract.js-core@5/tesseract-core-simd-lstm.wasm.js
4. `eng.traineddata.gz`
   https://tessdata.projectnaptha.com/4.0.0_fast/eng.traineddata.gz

(Open each link, save the file, drop it into `vendor/`, commit, push.)

Without these files the app still works completely — photos are still compressed and
stored in the vault — you just type the amounts in yourself.

## Deploying

Push this folder to a GitHub repo, connect it to Netlify (no build settings — it's static),
open the URL in Chrome on your phone, and choose "Add to Home screen". After the first
load it works fully offline, reader included.

## Where your data lives

Entries and settings: your phone's local storage. Receipt images: your phone's IndexedDB,
compressed to tens of KB each. Nothing is sent anywhere, ever. Back up with the two
download buttons (CSV + receipts ZIP) every month or so.


## Optional: connect AI reading

In the app: Settings → "⚡ Connect AI reading" → paste an Anthropic API key
(console.anthropic.com) → Save. The app then uses AI to read receipts when online
(sharper on crumpled receipts and screenshots, can spot income vs expense) and
automatically falls back to the on-device reader when offline. Delete the key to
disconnect — the app never requires it.

## Building a real Android APK (sideloadable app file)

Note: there's no ".sdk" file — SDK is the *toolkit* used to build apps. The file you
sideload onto a phone is an **.apk**. Two routes:

**Easy route — PWABuilder (no coding):**
1. Deploy this folder to Netlify as usual.
2. Go to pwabuilder.com, paste your Netlify URL, choose Android, download the package.
3. On your Pixel: Settings → Apps → Special app access → Install unknown apps → allow
   your file manager, then open the .apk to install.
   (This wraps your hosted URL; it still works offline via the service worker cache.)

**Fully self-contained route — Capacitor (files live INSIDE the apk):**
On a computer with Node.js and Android Studio installed:
1. In this folder: `npm install @capacitor/core @capacitor/cli @capacitor/android`
2. `mkdir www` and copy index.html, sw.js, manifest.webmanifest, icons and vendor/ into www/
3. `npx cap add android` then `npx cap sync`
4. `npx cap open android` → in Android Studio: Build → Build APK(s)
5. Before building, open android/app/src/main/AndroidManifest.xml and add this line
   alongside the other <uses-permission> entries so the receipt camera works:
   <uses-permission android:name="android.permission.CAMERA" />
6. Copy the .apk to your phone and install it (same "unknown apps" toggle as above).
The capacitor.config.json in this folder is already set up (app id: com.tuathan.cuntas).
