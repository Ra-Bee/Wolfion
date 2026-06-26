# Wolfion — Build Android APK

This project is wrapped with **Capacitor**. The Android project is in `android/`
and already contains the latest production web build (`dist/public`).

## Requirements (one-time)

- **Android Studio** (Hedgehog or newer) — installs the Android SDK, JDK 17, and Gradle.
- After install, open Android Studio once and let it download the SDK
  (API 34 / Build-Tools 34.x) and the Android Emulator if you want to test on PC.

## Build a debug APK (fastest)

1. Open a terminal inside this project folder.
2. Open the Android project:
   ```bash
   npx cap open android
   ```
   This launches Android Studio with the `android/` project loaded.
3. In Android Studio, top menu: **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
4. When the build finishes, click **Locate** in the toast — the file is at:
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```
5. Copy that APK to your phone and install it (enable "Install from unknown sources").

## Build a release APK (signed, for sharing / Play Store)

1. In Android Studio: **Build → Generate Signed Bundle / APK → APK**.
2. Create a new keystore the first time (keep the `.jks` file safe — you'll need
   it for every future update).
3. Choose **release** build variant.
4. APK ends up at:
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

## After you change the web app

If you edit anything in `src/`, rebuild the web bundle and re-sync to Android:

```bash
pnpm install
BASE_PATH=/ PORT=5000 pnpm run build
npx cap sync android
```

Then build the APK again from Android Studio.

## App identity

- **App ID**: `com.wolfion.app`
- **App Name**: `Wolfion`

Change these in `capacitor.config.ts` and `android/app/build.gradle`
(`applicationId`) if you need a different package name.
