# 3D Car Showcase

This project is packaged as a Flutter Android app. Flutter hosts the existing Three.js scene in a local, hardware-accelerated Android WebView so the procedural cars, four routes, driving physics, camera orbit, and touch controls continue to work.

## Build and run

```powershell
npm install
npm run build
flutter pub get
flutter run
```

`npm run build` bundles the Three.js experience into `assets/web/`, which Flutter packages with the app. Run it again after changing `main.js`, `index.html`, or files in `public/` so the Flutter app gets the latest scene.

## Project layout

- `lib/main.dart` — Flutter app entry point and full-screen scene host.
- `android/` — Flutter Android project and the local WebView asset bridge.
- `assets/web/` — self-contained browser build bundled into the Flutter app.
- `main.js`, `index.html`, `public/` — Three.js scene and presentation source.
- `legacy-capacitor/android/` — preserved Android project from the previous Capacitor setup.

The app identifier remains `com.raijin.carshowcase` so Android recognizes it as the same app.
