<h1 align="center">Power Only Quick Settings</h1>

<p align="center">
  <strong>One power icon in the top bar, instead of a row of status icons.</strong><br>
  A GNOME Shell extension that hides every Quick Settings status icon except the power icon, while the full panel still opens on a click.
</p>

<p align="center">
  <a href="https://github.com/spencercnorton/norvi-os"><img alt="Part of NorviOS" src="https://img.shields.io/badge/NorviOS-component-FD8024.svg"></a>
  <a href="https://github.com/spencercnorton/power-only-quicksettings/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/spencercnorton/power-only-quicksettings/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://github.com/spencercnorton/power-only-quicksettings/tags"><img alt="Latest release" src="https://img.shields.io/github/v/tag/spencercnorton/power-only-quicksettings?label=release&sort=semver"></a>
  <a href="#install"><img alt="Install for GNOME Shell" src="https://img.shields.io/badge/install-GNOME%20Shell-4a86cf.svg"></a>
  <a href="LICENSE"><img alt="Licence" src="https://img.shields.io/badge/licence-GPL--3.0--or--later-blue.svg"></a>
  <a href="https://buy.stripe.com/8x26oH2U44f65TRe574wM04"><img alt="Donate" src="https://img.shields.io/badge/donate-Stripe-635bff.svg?logo=stripe&logoColor=white"></a>
</p>

<p align="center">
  <img alt="The system menu open from the single power icon in the top bar: volume, network, power mode, dark style and do not disturb." src="https://raw.githubusercontent.com/spencercnorton/norvi-os/main/docs/screenshots/quick-settings.png" width="445">
</p>

The screenshot comes from the [NorviOS](https://github.com/spencercnorton/norvi-os) desktop, captured on a fresh Ubuntu 26.04 virtual machine with a demo account.

GNOME Shell's top bar shows a status icon for the network, volume, battery, microphone and more. This extension keeps only one: a power icon. The Quick Settings panel behind it is unchanged, and a click still opens all of it. It supports GNOME Shell 48, 49 and 50.

## What it does

**Hides the status icons and keeps them hidden.** GNOME Shell shows an indicator again whenever its state changes, for example when the microphone goes live or a device is added. The extension hides it again each time, instead of hiding it once.

**Shows one power icon in their place.** It is an ordinary status icon at the end of the row. Clicking anywhere on it opens the same Quick Settings panel as before.

**Puts everything back when disabled.** Each indicator's visibility is recorded before the extension first hides it. Disabling restores exactly that state and removes the power icon.

## Install

### GNOME Shell — the release zip

Download `power-only-quicksettings.shell-extension.zip` and `SHA256SUMS.txt` from the [latest release](https://github.com/spencercnorton/power-only-quicksettings/releases/latest), then:

```bash
sha256sum --check --ignore-missing SHA256SUMS.txt
gnome-extensions install --force power-only-quicksettings.shell-extension.zip
```

Log out and back in once so GNOME Shell sees the new extension, then enable it:

```bash
gnome-extensions enable power-only-quicksettings@spencercnorton.github.io
```

### Ubuntu 26.04 — the release package

The same release carries `gnome-shell-extension-power-only-quicksettings_*_all.deb`, which installs the extension for every user: `sudo apt install ./gnome-shell-extension-power-only-quicksettings_*_all.deb`. Then log out and in, and enable it as above.

The extension is not on extensions.gnome.org.

## Documentation

- [CHANGELOG.md](CHANGELOG.md): one entry per release
- [NOTICE](NOTICE): provenance and licence

## Contributing and support

- Bugs and feature requests: [open an issue](https://github.com/spencercnorton/power-only-quicksettings/issues/new/choose). Questions: [Discussions](https://github.com/spencercnorton/power-only-quicksettings/discussions).
- Security reports: [private vulnerability reporting](https://github.com/spencercnorton/power-only-quicksettings/security/advisories/new). See [SECURITY.md](SECURITY.md). There is no e-mail address; that is deliberate.
- Pull requests are welcome; read [CONTRIBUTING.md](CONTRIBUTING.md) first. Changes are reviewed and merged on GitHub, then shipped in tagged releases.
- If this saves you time, you can [support its development](https://buy.stripe.com/8x26oH2U44f65TRe574wM04).

## Development

```bash
python3 tests/static-check.py       # what CI runs: one version and one UUID everywhere, extension.js parses
scripts/build.sh                    # the release zip and .deb, into dist/
```

The extension reaches into GNOME Shell's Quick Settings internals (`quickSettings._indicators`), which are not a stable API. Each new GNOME Shell major version needs a check before it is added to `metadata.json`.

## Licence

[GPL-3.0-or-later](LICENSE) © Spencer Norton
