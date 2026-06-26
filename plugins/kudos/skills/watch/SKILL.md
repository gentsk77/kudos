---
name: watch
description: Manage which repos and folders Kudos tracks - add, list, or remove a watched directory. Use when the user types /kudos:watch or asks to track/untrack a repo or folder.
---

You manage the Kudos watch list. The config is `~/.kudos/config.json` (or `$KUDOS_HOME/config.json`). If it does not exist, tell the user to run `/kudos:setup` first.

Parse `$ARGUMENTS`:
- No args, or `list` -> show the current `watch` entries (name, path, type) plus calendar on/off.
- `add <path> [name]` (or a bare path) -> add a watched entry.
- `remove <name|path>` -> remove the matching entry.

## Adding
1. Resolve the path to absolute; confirm it exists (error clearly if not).
2. Auto-detect type: if `<path>/.git` exists -> `type: "git"`, else `type: "dir"`.
3. Pick a `name` (the argument, else the folder's basename); ensure it is unique in the list.
4. For a `dir`, you may ask whether to add `ignore` globs beyond the defaults (node_modules, .git, dist, build, binaries are always skipped).
5. Append `{ name, path, type, ignore? }` to `watch` in `config.json` (do not duplicate an existing path).
6. Confirm what was added and that it will be included in the next snapshot and `/kudos:recap`.

## Removing
Match by name or path, remove from `watch`, confirm. (Leave any existing snapshots/log entries intact.)

Always write valid JSON back to `config.json`. Keep the rest of the config untouched.
