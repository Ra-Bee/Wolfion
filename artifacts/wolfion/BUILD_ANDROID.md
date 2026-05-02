# Building the Wolfion Android App Bundle (.aab)

This document explains how to produce a **signed `.aab`** ready to upload to the Google Play Console for the Wolfion app.

> **Important:** The `.aab` build itself **cannot run inside Replit** because it requires the Android SDK, JDK 17, and Gradle. Run the steps below on your own machine (macOS / Windows / Linux) or in a CI runner that has those installed.

---

## What's already configured

| Item | Value | Where |
|---|---|---|
| Application ID (package name) | `com.wolfion.app` | `android/app/build.gradle` + `capacitor.config.ts` |
| App name | `Wolfion` | `android/app/src/main/res/values/strings.xml` |
| `versionCode` | `2` | `android/app/build.gradle` |
| `versionName` | `1.0.1` | `android/app/build.gradle` |
| `compileSdk` / `targetSdk` | `36` (Android 15) | `android/variables.gradle` |
| `minSdk` | `24` (Android 7.0) | `android/variables.gradle` |
| Web output dir | `dist/public` | `vite.config.ts` ↔ `capacitor.config.ts` |
| Signing config | reads `keystore.properties` **or** `ANDROID_*` env vars | `android/app/build.gradle` |

The package name `com.wolfion.app` is locked in — make sure your Google Play Console listing uses **exactly** that string.

---

## One-time setup on your build machine

### 1. Install prerequisites

- **JDK 17** (Temurin / Zulu / Oracle, all fine) — `java -version` should print `17.x`.
- **Android Studio** (easiest path, gives you the SDK + build-tools + emulator). Or just the **Android command-line tools** + `sdkmanager "platforms;android-36" "build-tools;36.0.0"`.
- **Node 20+** and **pnpm 9+** (already used by this repo).

### 2. Generate your upload keystore (once, then keep it forever)

> ⚠️ **Generate this on YOUR machine, never in chat or in a shared environment.** Back it up somewhere safe (password manager, encrypted USB). If you lose it, you can recover via Google Play App Signing's key reset flow — but it's a multi-day process.

```bash
keytool -genkey -v \
  -keystore wolfion-upload.keystore \
  -alias wolfion-upload \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

Move the resulting `wolfion-upload.keystore` to `artifacts/wolfion/android/wolfion-upload.keystore` (this folder is gitignored — it will not be committed).

### 3. Create `android/keystore.properties`

Copy the example file and fill in your real passwords:

```bash
cd artifacts/wolfion/android
cp keystore.properties.example keystore.properties
# then edit keystore.properties and replace YOUR_STORE_PASSWORD / YOUR_KEY_PASSWORD
```

`keystore.properties` is gitignored. **Do not commit it.**

---

## Building the `.aab` (every release)

From the repository root:

```bash
# 1. Build the web bundle (outputs to artifacts/wolfion/dist/public)
pnpm --filter @workspace/wolfion run build

# 2. Sync the freshly built web assets into the Android project
cd artifacts/wolfion
npx cap sync android

# 3. Assemble the signed release bundle
cd android
./gradlew bundleRelease
```

The signed `.aab` lands at:

```
artifacts/wolfion/android/app/build/outputs/bundle/release/app-release.aab
```

That file is what you upload to the Google Play Console.

---

## Bumping the version for the next release

Edit `artifacts/wolfion/android/app/build.gradle`:

```gradle
versionCode 3          // must be strictly greater than the previous release
versionName "1.0.2"    // any human-readable string
```

Google Play rejects uploads where `versionCode` is not strictly greater than the previous release. `versionName` is what users see in the Play Store listing.

---

## Using CI (GitHub Actions, etc.) instead of `keystore.properties`

`android/app/build.gradle` will fall back to environment variables when `keystore.properties` is not present:

| Variable | Meaning |
|---|---|
| `ANDROID_STORE_FILE` | Absolute path to the `.keystore` file on the runner |
| `ANDROID_STORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | Key alias inside the keystore (e.g. `wolfion-upload`) |
| `ANDROID_KEY_PASSWORD` | Password for the alias |

Store the keystore as a base64-encoded GitHub Actions secret, decode it at the start of the job, and set those four env vars.

---

## Troubleshooting

- **`Release signing credentials are missing`** — you ran `bundleRelease` without setting up `keystore.properties` or the env vars. See step 3 above.
- **`SDK location not found`** — set `ANDROID_HOME` env var or create `android/local.properties` with `sdk.dir=/path/to/Android/sdk`.
- **`Could not find tools.jar`** — you're on JDK 8 or older. Install JDK 17.
- **Web changes not appearing in the app** — you forgot `npx cap sync android` after rebuilding the web bundle.
