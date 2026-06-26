---
name: setup
description: Set up or upgrade Kudos - create the data home and choose what to track, or non-destructively migrate an existing install after a plugin update. Use when the user types /kudos:setup, is installing Kudos, or just updated the plugin.
---

You are running Kudos setup. Plugin root is `${CLAUDE_PLUGIN_ROOT}`; data home is `~/.kudos` (or `$KUDOS_HOME`). Be conversational and quick.

## Step 0 - first run or upgrade? (decide before anything else)
Check whether `~/.kudos/config.json` already exists.

- **It EXISTS -> UPGRADE. Do NOT ask the setup questions, and do NOT rewrite config or touch any data.** Just run:
  ```
  node "${CLAUDE_PLUGIN_ROOT}/scripts/setup.mjs" --plugin-root "${CLAUDE_PLUGIN_ROOT}"
  ```
  This refreshes the runtime scripts in `~/.kudos/bin`, merges any NEW config keys with safe defaults, removes obsolete files, and **preserves the user's log, config values, and HANDBOOK tuning**. Read its JSON output: tell the user it upgraded, list `addedKeys` if any (and only ask the user about a new key if it genuinely needs their decision), and confirm nothing was lost. Re-register the scheduler only if the user asks. Then stop.

- **It is MISSING -> FIRST RUN.** Continue below.

## First-run questions (ask all of them with AskUserQuestion - do not silently default the directory or timezone)
1. **What to track** - which repos/folders to watch. Offer to scan a parent folder for git repos and confirm the list. Record each as `{ name, path, type }` (`git` if `<path>/.git` exists, else `dir`).
2. **Calendar** - fold in interviews/calls/mocks? If yes and a calendar tool is connected, list their calendars and let them pick which ids to include/ignore.
3. **Tone** - `honest` (default) / `warm` / `terse` / `coach`.
4. **Snapshot directory** - where snapshots live. Offer the default `~/.kudos/.snapshots`, but ask rather than assume.
5. **Timezone** - run `node -e "console.log(Intl.DateTimeFormat().resolvedOptions().timeZone)"`, offer that as the default, and let them override.

## Materialize (first run only)
1. `node "${CLAUDE_PLUGIN_ROOT}/scripts/setup.mjs" --plugin-root "${CLAUDE_PLUGIN_ROOT}" --tone <chosen>`.
2. Write `~/.kudos/config.json` from the answers: `watch`, `calendars`, `snapshotTimes` (default 12:00/18:00/23:55), `snapshotDir`, `timezone`, `buckets`.
3. Offer to register the daily snapshot (skippable):
   - Windows: `powershell -NoProfile -ExecutionPolicy Bypass -File "${CLAUDE_PLUGIN_ROOT}/scripts/scheduler/win-task.ps1" -DataHome "<home>"`
   - macOS/Linux: `sh "${CLAUDE_PLUGIN_ROOT}/scripts/scheduler/cron.sh" "<home>"`
   If skipped, note that `/kudos:recap` still works from git + mtime.
4. Confirm the home path and tell them to run `/kudos:recap`. There is no dashboard file - the recap renders inline.

**Never wipe or reset existing data, in either path.** When in doubt, preserve.
