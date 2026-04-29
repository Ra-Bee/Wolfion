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

Release signing credentials are **never stored in source control**. The build
reads them from a local `android/keystore.properties` file or from environment
variables (for CI/CD).

### Option A — Local `keystore.properties` file (recommended for local builds)

1. Copy the example file and fill in the real values:
   ```bash
   cp android/keystore.properties.example android/keystore.properties
   ```
2. Edit `android/keystore.properties` with the path to your keystore and its credentials:
   ```
   storeFile=../wolfion-upload.keystore
   storePassword=YOUR_STORE_PASSWORD
   keyAlias=wolfion-upload
   keyPassword=YOUR_KEY_PASSWORD
   ```
3. Place your `.keystore` file at the path specified by `storeFile` (relative to `android/app/`).
   Keep the keystore file in a secure location outside the repository.
4. Build the signed APK:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
   APK ends up at:
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

> **Security note:** `android/keystore.properties` and `*.keystore` / `*.jks` files are
> listed in `.gitignore`. Never commit them to source control. Store them in a
> password manager or secret vault and share them securely with team members who need them.

### Option B — Environment variables (for CI/CD)

Set the following environment variables in your CI environment. They are used
automatically when `keystore.properties` is absent:

| Variable                | Description                                 |
|-------------------------|---------------------------------------------|
| `ANDROID_STORE_FILE`    | Absolute path to the `.keystore` file       |
| `ANDROID_STORE_PASSWORD`| Password for the keystore                   |
| `ANDROID_KEY_ALIAS`     | Key alias inside the keystore               |
| `ANDROID_KEY_PASSWORD`  | Password for the key alias                  |

### Keystore rotation

If a previous release keystore was exposed, generate a new one and re-register
it with the Google Play Console before publishing any new releases:

```bash
keytool -genkey -v \
  -keystore wolfion-upload.keystore \
  -alias wolfion-upload \
  -keyalg RSA -keysize 2048 \
  -validity 10000
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
