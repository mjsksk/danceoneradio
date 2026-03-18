# Dance One Radio Desktop App

This folder contains the Electron wrapper for the Windows desktop app.

## Build

From the repository root:

```bash
npm install
npm --prefix desktop-app install
npm run desktop:build
npm --prefix desktop-app run build:win
```

## Output

The renderer bundle is written to `desktop-app/app-dist`.
The Windows installer is written to `desktop-app/dist`.

## Notes

- The renderer bundle is built from `desktop.html` through `vite.config.desktop.ts`.
- The Electron entry points are `main.js` and `preload.js`.
- Packaging is configured in `electron-builder.json`.
