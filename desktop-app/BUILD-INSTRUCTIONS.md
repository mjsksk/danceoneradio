# Desktop Build Instructions

## What this build produces

The desktop app is an Electron wrapper around the dedicated `desktop.html` renderer. The renderer bundle is written to `desktop-app/app-dist`, and packaging produces a standard Windows installer (`nsis`) in `desktop-app/dist`.

## Prerequisites

1. Node.js 18 or later
2. Dependencies installed in both locations:
   - repo root
   - `desktop-app`

## Install dependencies

From the repository root:

```bash
npm install
npm --prefix desktop-app install
```

## Build and package

From the repository root:

```bash
npm run desktop:package
```

On Windows you can also run:

```bash
build-desktop.bat
```

## Output

Look in `desktop-app/dist` for the generated `.exe` files.

## Notes

- The Electron main process loads `desktop.html` in development and the built `dist/desktop.html` file in production.
- The installer and portable builds share the same renderer bundle from `vite.config.desktop.ts`.
- If you want a custom Windows icon, replace `desktop-app/assets/icon.png` and `desktop-app/assets/tray-icon.png`.
