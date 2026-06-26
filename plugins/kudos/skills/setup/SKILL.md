---
name: setup
description: Set up Kudos for this user - create the data home, choose what to track, configure calendar and tone, and register the daily snapshot. Use when the user types /kudos:setup or is installing/initializing Kudos for the first time.
---

You are running first-time setup for Kudos. Be conversational and quick. The plugin root is `${CLAUDE_PLUGIN_ROOT}`; the data home is `~/.kudos` (or `$KUDOS_HOME`).

Ask these four things (use the AskUserQuestion tool for clean choices; one topic at a time is fine). Then materialize and confirm.

## 1. What to track
Ask which repos/folders to watch. Offer to scan a parent folder (e.g. their main code directory) for git repos and present the list to confirm, or let them paste paths. For each, record `{ name, path, type }` where `type` is `git` if the path contains a `.git` dir, else `dir` (with an optional `ignore` glob list).

## 2. Calendar
Ask if they want to fold in interviews/calls/mocks. If yes and a Google Calendar tool is connected, list their calendars and let them pick which IDs to include (and which to ignore, e.g. holidays); set `calendars.enabled: true` with those ids. If no calendar tool is connected, explain they can connect one later and re-run setup; leave `calendars.enabled: false`.

## 3. Tone
Ask how the log should read, offer presets: `honest` (default, factual, no cheerleading), `warm` (encouraging), `terse` (minimal), `coach` (win + next step). Remember the chosen key.

## 4. Snapshot location
Ask where snapshots should live. Default (skip) = `~/.kudos/.snapshots`. If they pick another path, set `snapshotDir` to it.

## Then materialize
1. Run: `node "${CLAUDE_PLUGIN_ROOT}/scripts/setup.mjs" --plugin-root "${CLAUDE_PLUGIN_ROOT}" --tone <chosen>`. This creates `~/.kudos/` with `bin/`, `dashboard/`, seeded `data/`, `HANDBOOK.md`, and a template `config.json` (only if absent).
2. Write the user's real `~/.kudos/config.json` from their answers: the `watch` array, `calendars`, `snapshotTimes` (default 12:00/18:00/23:55), `snapshotDir`, `timezone`.
3. Offer to register the daily snapshot scheduler (skippable):
   - Windows: `powershell -NoProfile -ExecutionPolicy Bypass -File "${CLAUDE_PLUGIN_ROOT}/scripts/scheduler/win-task.ps1" -DataHome "<home>"`
   - macOS/Linux: `sh "${CLAUDE_PLUGIN_ROOT}/scripts/scheduler/cron.sh" "<home>"`
   If skipped, tell them `/kudos:recap` still works from git + mtime, just without intra-day buckets.
4. Initialize the dashboard data: `node "<home>/bin/sync-dashboard.mjs"`.
5. Report: confirm the home path, tell them to run `/kudos:recap` and open `<home>/dashboard/index.html`. Mention `/kudos:watch` to add more later.

Idempotent: re-running setup is safe (it never clobbers an existing config, log, or HANDBOOK).
