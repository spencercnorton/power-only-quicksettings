#!/usr/bin/env bash
# Build the release assets from this tree: the extension zip that
# `gnome-extensions install` takes, and a Debian package that installs the
# extension system-wide. Reproducible under SOURCE_DATE_EPOCH.
#   scripts/build.sh [out-dir]      (default: dist/)
set -euo pipefail
root=$(cd "$(dirname "$0")/.." && pwd)
out=$(realpath -m "${1:-$root/dist}")
pkg=gnome-shell-extension-power-only-quicksettings
field() { python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))[sys.argv[2]])' "$root/metadata.json" "$1"; }
uuid=$(field uuid)
version=$(field version-name)
stamp=${SOURCE_DATE_EPOCH:-$(git -C "$root" log -1 --format=%ct 2>/dev/null || date +%s)}
export SOURCE_DATE_EPOCH="$stamp"
mkdir -p "$out"

stage=$(mktemp -d); trap 'rm -rf "$stage"' EXIT
cp "$root/extension.js" "$root/metadata.json" "$stage/"
touch -d "@$stamp" "$stage"/*
(cd "$stage" && TZ=UTC zip -qX "$out/power-only-quicksettings.shell-extension.zip" extension.js metadata.json)

(cd "$root" && dpkg-buildpackage -us -uc -b)
mv "$root/../${pkg}_${version}_all.deb" "$out/"
rm -f "$root/../${pkg}_${version}"_*.buildinfo "$root/../${pkg}_${version}"_*.changes
dpkg-deb -c "$out/${pkg}_${version}_all.deb" | grep -q "usr/share/gnome-shell/extensions/$uuid/extension.js"
ls -l "$out"
