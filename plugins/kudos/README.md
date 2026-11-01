# Kudos plugin

Version 1.2.1. See the repo root [README](../../README.md) for install and usage.

- `skills/setup` - `/kudos:setup`, interactive onboarding.
- `skills/watch` - `/kudos:watch`, manage tracked repos/folders.
- `skills/recap` - `/kudos:recap [range]`, the recap (default: today). Counts your own commits only.
- `scripts/` - cross-platform node core (`snapshot.mjs`, `setup.mjs`, `lib.mjs`), per-OS scheduler in `scheduler/`, and the author-side `build-plugin-zip.ps1`.
- `assets/` - `HANDBOOK.default.md` (seeded into the data home, with a `{{TONE}}` slot), `inline-heatmap.html` (the heatmap template the recap renders), `config.template.json`.

Runtime data lives in the user's data home (`~/.kudos` or `$KUDOS_HOME`), never in the plugin.
