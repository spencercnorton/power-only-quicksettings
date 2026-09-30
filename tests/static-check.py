#!/usr/bin/env python3
"""Release invariants that need no GNOME Shell: one version everywhere, the
public UUID everywhere, and an extension.js that parses as an ES module."""
import json, pathlib, re, shutil, subprocess, sys, tempfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
UUID = "power-only-quicksettings@spencercnorton.github.io"
meta = json.loads((ROOT / "metadata.json").read_text())
failures = []

def check(ok, message):
    if not ok:
        failures.append(message)

check(meta["uuid"] == UUID, f"metadata uuid is {meta['uuid']}, not {UUID}")
check(re.fullmatch(r"\d+\.\d+\.\d+", meta.get("version-name", "")), "version-name is not X.Y.Z")
check(all(re.fullmatch(r"\d+", v) for v in meta["shell-version"]), "shell-version must list major versions")
check(meta.get("url") == "https://github.com/spencercnorton/power-only-quicksettings", "url is not the public repository")
version = meta.get("version-name", "")
changelog = (ROOT / "CHANGELOG.md").read_text()
check(f"## {version} — " in changelog, f"CHANGELOG.md has no entry for {version}")
deb = (ROOT / "debian/changelog").read_text().splitlines()[0]
check(f"({version})" in deb, f"debian/changelog does not start at {version}")
for line in (ROOT / "debian/install").read_text().splitlines():
    check(line.endswith(f"usr/share/gnome-shell/extensions/{UUID}"), f"debian/install installs outside {UUID}")
check(f"gnome-extensions enable {UUID}" in (ROOT / "debian/control").read_text(), "debian/control names another UUID")

if shutil.which("node"):
    with tempfile.TemporaryDirectory() as tmp:
        module = pathlib.Path(tmp, "extension.mjs")
        module.write_text((ROOT / "extension.js").read_text())
        result = subprocess.run(["node", "--check", str(module)], capture_output=True, text=True)
        check(result.returncode == 0, "extension.js does not parse: " + result.stderr.strip())
elif "--allow-missing-node" not in sys.argv:
    failures.append("node is not installed, so extension.js was not parsed")

for failure in failures:
    print("FAIL -", failure)
print(f"static check: {len(failures)} failure(s)")
sys.exit(1 if failures else 0)
