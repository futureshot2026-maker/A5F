# A5F Social — Android Social Networking App

A native Android social app: Kotlin, Jetpack Compose, MVVM, Hilt, and a
Firebase backend (Auth, Firestore, Storage, Cloud Messaging, Cloud
Functions). Everything in this directory is real, working source — there is
no placeholder screen — but it has **not been compiled in this environment**
(no Android SDK / network access to Google's Maven repo here), so the first
thing to do is open it in Android Studio and let it sync. See
[Known limitations](#known-limitations-read-this-first) below.

## What's implemented

- **Auth**: email/password sign-up and login (Firebase Auth), password
  reset, session persistence, automatic navigation to/from the login flow
  when the auth state changes.
- **Profile**: Firestore-backed profile (name, username, bio, avatar),
  avatar upload to Firebase Storage, edit screen.
- **Realtime activity feed**: Firestore snapshot listeners push new posts,
  likes and comment counts to every device instantly — no polling. Text +
  optional photo posts, like/unlike, per-post comment thread (also
  realtime).
- **Messaging**: 1:1 chat with a realtime message stream, a chat list
  sorted by latest activity.
- **Push notifications**: FCM. A device registers its token on the user's
  profile; Cloud Functions trigger on new messages, comments and likes and
  push to the recipient's devices, pruning dead tokens automatically.
- **Media uploads**: images for posts and avatars go to Firebase Storage
  with size/content-type limits enforced by `storage.rules`.
- **Clean, scalable architecture**: MVVM + repository pattern per domain
  (`AuthRepository`, `UserRepository`, `PostRepository`, `ChatRepository`,
  `MediaRepository`), Hilt DI, Kotlin coroutines/Flow throughout, Compose
  Navigation. Adding a feature means adding a repository + ViewModel +
  screen — the pattern is consistent everywhere, and swapping Firebase for
  a custom backend later only touches the repository layer, not the UI.

```
android-app/
├── app/                          Android app module (Kotlin, Jetpack Compose)
│   └── src/main/java/com/a5f/social/
│       ├── data/model/           Firestore document models
│       ├── data/repository/      One repository per domain area
│       ├── di/                   Hilt modules
│       ├── notification/         FCM service
│       └── ui/                   auth/, feed/, chat/, profile/, nav/ (screens + ViewModels)
├── functions/                    Firebase Cloud Functions (TypeScript) — push notification backend
├── firestore.rules               Security rules (users only ever write their own data)
├── storage.rules                 Media upload rules (auth required, size/type limits)
└── firebase.json                 Firebase project config
```

## Known limitations — read this first

This was built in a cloud environment with **no Android SDK and no network
access to Google's Maven repositories**, so nothing here could be compiled,
run, or signed from this session. Concretely, before you have a working
build you still need to:

1. Open the project in a recent Android Studio (Ladybug/2024.2+) on a machine with the
   Android SDK — it will download the Gradle distribution and all
   dependencies (AndroidX, Compose, Hilt, Firebase) on first sync.
2. Create a Firebase project and drop in a real `google-services.json` (see
   below) — the placeholder committed here will not authenticate anything.
3. Generate a release keystore and sign a release build (see below).
4. Do a normal pass of manual QA on a device/emulator — this is a full
   first implementation, not a battle-tested one; treat it as a strong
   starting point, not as already Play Store-launched.

## Setup

### 1. Firebase project

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. Add an Android app with package name `com.a5f.social`.
3. Download `google-services.json` and save it to `app/google-services.json`
   (this path is gitignored on purpose — never commit real credentials).
4. Enable in the console:
   - **Authentication** → Sign-in method → Email/Password.
   - **Firestore Database** → create in production mode.
   - **Storage**.
   - **Cloud Messaging** (enabled by default).
5. Deploy the security rules and indexes:
   ```
   npm install -g firebase-tools
   firebase login
   firebase use --add          # pick your project
   firebase deploy --only firestore:rules,firestore:indexes,storage
   ```

### 2. Cloud Functions (push notification backend)

```
cd functions
npm install
npm run build
firebase deploy --only functions
```

This deploys three triggers: new chat message, new comment, new like — each
looks up the recipient's registered FCM tokens on their `users/{uid}`
document and sends a push.

### 3. Open in Android Studio

Open the `android-app/` folder directly (not the repo root) as an Android
Studio project. Let Gradle sync; it will fetch dependencies over the
network on first run.

### 4. Run it

Pick a device/emulator running API 26+ and hit Run. Sign up with a real
email/password — Firebase Auth handles verification.

## Building a signed release APK

1. Generate a keystore (once), e.g.:
   ```
   keytool -genkeypair -v -keystore a5f-release.jks -alias a5f \
     -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Copy `gradle.properties.example` to `gradle.properties` in this
   directory (or, better, to `~/.gradle/gradle.properties` so signing
   secrets never risk being committed) and fill in the real keystore path
   and passwords.
3. Build:
   ```
   ./gradlew assembleRelease
   ```
   The signed APK lands at `app/build/outputs/apk/release/app-release.apk`.
4. For the Play Store specifically, prefer an **App Bundle**:
   ```
   ./gradlew bundleRelease
   ```
   → `app/build/outputs/bundle/release/app-release.aab`, uploaded to Play
   Console. (Play App Signing is recommended — you still sign the upload
   with your own key as above, and Google re-signs for distribution.)

## Play Store checklist (beyond this codebase)

- Play Console developer account, app listing, screenshots, privacy policy
  URL, content rating questionnaire, data safety form (this app collects
  email, profile info, and user-generated content/media — declare
  accordingly).
- Target API level requirement for new/updated apps (currently API 35 —
  already set in `app/build.gradle.kts`, keep it current).
- A privacy policy is required because the app handles user accounts and
  media uploads.

## Source delivery

This source lives in the private Git repository this session is working
in, on the branch this work was pushed to — there is no separate delivery
step needed; `git clone` of that repo (or a `git pull` if you already have
it) gets you everything above.
