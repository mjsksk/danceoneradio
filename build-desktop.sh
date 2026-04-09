#!/bin/bash

set -euo pipefail

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "build-desktop.sh packages the macOS desktop app and must be run on macOS."
  exit 1
fi

npm run build:desktop:mac
