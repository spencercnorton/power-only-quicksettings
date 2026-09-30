# Contributing to Power Only Quick Settings

Thanks for your interest. This is a small project with one maintainer, so the
process is deliberately light.

## How changes land

GitHub is the development home. Branch from `main` and open a pull request
into `main`. The checks must pass before merge. Changes ship in tagged
releases.

Use a GitHub noreply address for commit authorship if you prefer to keep your
personal address private. Public history is public data.

## Working on the code

```bash
python3 tests/static-check.py       # what CI runs
scripts/build.sh                    # build the release zip and .deb
```

- Test a change in a real GNOME Shell session, and say which version in the
  pull request. The extension relies on Quick Settings internals, so every
  GNOME Shell major version is checked before it is added to `metadata.json`.
- Keep a change to one concern.
- Commits carry a `Signed-off-by:` line (`git commit -s`, the Developer
  Certificate of Origin). There is no CLA.
- No secrets, hostnames, personal data or personal paths in the diff; the
  privacy check rejects them.

## Out of scope

- Settings or preferences. The extension does one thing, with no knobs.
- Hiding or restyling anything other than the Quick Settings status icons.

## Pull request checklist

- [ ] `python3 tests/static-check.py` passes
- [ ] Tested in GNOME Shell (say which version)
- [ ] Commits are signed off
- [ ] `CHANGELOG.md` updated under `## Unreleased` if behaviour changed
