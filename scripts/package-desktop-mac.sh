#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

PRODUCT_NAME="Dance One Radio"
TAURI_CONFIG_PATH="src-tauri/tauri.conf.json"
VERSION="$(node -e "const fs=require('fs'); const config=JSON.parse(fs.readFileSync(process.argv[1], 'utf8')); process.stdout.write(config.version);" "$TAURI_CONFIG_PATH")"

case "$(uname -m)" in
  arm64|aarch64)
    ASSET_ARCH="arm64"
    ;;
  x86_64)
    ASSET_ARCH="x64"
    ;;
  *)
    ASSET_ARCH="$(uname -m)"
    ;;
esac

APP_PATH="$ROOT_DIR/src-tauri/target/release/bundle/macos/$PRODUCT_NAME.app"
DMG_DIR="$ROOT_DIR/src-tauri/target/release/bundle/dmg"
OUTPUT_DMG="$DMG_DIR/dance-one-radio-$VERSION-macos-$ASSET_ARCH.dmg"
STAGE_DIR="$(mktemp -d "${TMPDIR:-/tmp}/dor-mac-package.XXXXXX")"

cleanup() {
  rm -rf "$STAGE_DIR"
}

trap cleanup EXIT

npx tauri build --bundles app --no-sign

if [[ ! -d "$APP_PATH" ]]; then
  echo "Expected app bundle not found at $APP_PATH" >&2
  exit 1
fi

# Hide the .app suffix in Finder when the user's global Finder preference allows it.
/usr/bin/SetFile -a E "$APP_PATH" || true

mkdir -p "$DMG_DIR"
rm -f "$OUTPUT_DMG"

cp -R "$APP_PATH" "$STAGE_DIR/$PRODUCT_NAME.app"
/usr/bin/SetFile -a E "$STAGE_DIR/$PRODUCT_NAME.app" || true
ln -s /Applications "$STAGE_DIR/Applications"

hdiutil create \
  -volname "$PRODUCT_NAME" \
  -srcfolder "$STAGE_DIR" \
  -ov \
  -format UDZO \
  "$OUTPUT_DMG"

echo "Built application at:"
echo "  $APP_PATH"
echo "Built DMG at:"
echo "  $OUTPUT_DMG"
