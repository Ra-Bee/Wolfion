# Wolfion — Build the Google Play `.aab` (App Bundle)

This is the file Google Play requires for new app uploads. The Android project
in `android/` is **already configured** with:

- App id: `com.wolfion.app`
- App name: `Wolfion`
- Latest production web build synced into `android/app/src/main/assets/public/`
- Release signing configured in `android/app/build.gradle`
- Upload keystore bundled at `android/wolfion-upload.keystore`
  - alias: `wolfion-upload`
  - store password: `WolfionUpload2026`
  - key password: `WolfionUpload2026`

> **Important:** keep `wolfion-upload.keystore` safe. Google Play uses this same
> key signature for every future update. Losing it means you can't publish
> updates to the same listing.

---

## Easiest path — Android Studio (3 clicks)

1. Install **Android Studio** (Hedgehog or newer). It installs JDK 17 and the
   Android SDK automatically.
2. From this folder run:
   ```bash
   npx cap open android
   ```
   Android Studio opens the `android/` project. Wait for the Gradle sync to
   finish (1–3 minutes the first time).
3. Top menu: **Build → Generate Signed Bundle / APK → Android App Bundle → Next**
   - Key store path: pick `android/wolfion-upload.keystore`
   - Key store password: `WolfionUpload2026`
   - Key alias: `wolfion-upload`
   - Key password: `WolfionUpload2026`
   - Click **Next → release → Finish**
4. When it finishes, the toast says **"locate"** — the file is at:
   ```
   android/app/build/outputs/bundle/release/app-release.aab
   ```
5. Upload that `.aab` file to Google Play Console.

---

## Command-line path (if you have the Android SDK installed)

From inside the `android/` folder:

```bash
./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

---

## After you change the web app

```bash
pnpm install
BASE_PATH=/ PORT=5000 pnpm run build
npx cap sync android
```

Then re-build the bundle from Android Studio (step 3 above) or `./gradlew bundleRelease`.

---

## Why isn't the `.aab` already built and downloadable?

Building an Android App Bundle requires the Android SDK (~2 GB) and a Gradle
JVM build that typically needs 4–8 GB of RAM and 5–15 minutes of CPU time.
The Replit container can install the SDK but the Gradle daemon hangs partway
through `bundleRelease` — so the bundle has to be produced on a real desktop
(Android Studio) or in a CI runner with enough resources.

The good news: every other piece is ready, so the only step you do locally is
clicking "Generate Signed Bundle".
