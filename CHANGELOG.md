# Changelog

All notable changes to Power Only Quick Settings are documented here.

## 2.0.1 — 2026-09-30

- An indicator that turned on while the extension was enabled now shows again when the extension is disabled. Before, disabling restored each indicator's visibility from when the extension was enabled, so a microphone that went live meanwhile stayed hidden. GNOME Shell disables the extension on the lock screen, so the lock screen hid it too.

## 2.0.0 — 2026-09-29

The first public release.

- The UUID is `power-only-quicksettings@spencercnorton.github.io`. An installation under an earlier UUID is a different extension to GNOME Shell: disable and remove it before enabling this one.
- Indicators that GNOME Shell shows again after a state change are hidden again.
- Disabling restores each indicator's own visibility, recorded on the indicator itself, so a destroyed indicator leaves nothing behind.
