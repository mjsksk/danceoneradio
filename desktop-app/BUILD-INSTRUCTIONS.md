# Build Instructions for Desktop App

## Portable Windows Build

This desktop app packages the existing web app into an Electron shell and produces a portable Windows `.exe`.

### Prerequisites
1. Node.js 18 or later
2. Root dependencies installed
3. Desktop dependencies installed in `desktop-app/`

### One-Time Setup

From the repository root:

```bash
npm install
npm --prefix desktop-app install
```

### Build Command

From the repository root:

```bash
npm run build:desktop:portable
```

That command will:
1. Build the main web app into `dist/`
2. Copy the renderer bundle into `desktop-app/app/`
3. Package the Electron shell into a Windows portable executable

### Output

The packaged Windows app is written to:

```bash
desktop-app/release/
```

### Troubleshooting

- If `electron-builder` is missing, run `npm --prefix desktop-app install`
- If the renderer is stale, rerun `npm run build:desktop:portable`
- If Windows Defender blocks the final `.exe`, build on a different machine or sign the app before distribution
