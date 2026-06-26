---
name: recap
description: Summarize your incremental progress into an honest log and contribution heatmap. With no argument it recaps the last day (today); pass a range like "7d", a single date "2026-06-25", or "2026-06-20..2026-06-26" to recap that span. Use when the user types /kudos:recap or asks for a progress recap.
---

You are running a Kudos recap. Data home is `~/.kudos` (or `$KUDOS_HOME`). If `<home>/config.json` is missing, tell the user to run `/kudos:setup` first.

**First, read `<home>/HANDBOOK.md`** and follow ALL its rules (what counts, the chosen tone, intensity = milestone count, the reconstruction rule, buckets, sources, idempotency).

## 1. Resolve the range (from `$ARGUMENTS`)
- none -> just **today** (the current date in the config timezone). This is the default.
- `Nd` (e.g. `7d`) -> the rolling last N days, ending today.
- a single ISO date `YYYY-MM-DD` -> that day.
- `YYYY-MM-DD..YYYY-MM-DD` -> that inclusive range.

## 2. Reconstruct each day in the range (per HANDBOOK "Recap reconstruction rule")
For each watched entry in `config.json`:
- `git`: `git -C <path> log --since="<day> 00:00" --until="<day> 23:59" --patch --no-merges` PLUS `git -C <path> diff HEAD` and untracked files. **Date by work-time (mtime), not commit time**; never split a past-midnight session.
- `dir`: files under `<path>` whose mtime falls in the day (respect the ignore list); read changed files.
- `calendar` (only if `calendars.enabled`): list the day's events from each included calendar id with the connected calendar tool; keep interviews/calls/mocks, ignore focus-time/OOO/holidays/routine. If no calendar tool is available, skip silently.
Use `<snapshotDir>/<name>/<day>/<HHmm>/` to bucket into Morning/Afternoon/Evening; if none, use a single "Today" bucket.

## 3. Turn diffs into honest milestones
Apply the HANDBOOK tone. Roll up trivial/whitespace/typo changes. Do NOT count Kudos's own generated output.

## 4. Write (idempotent - replace, never duplicate)
- For each day in range, upsert its object in `<home>/data/progress.json` `days`: `{ date, milestones (count), summary, buckets:[{label, items:[{repo, source, text}]}] }`. Keep newest day first.
- Prepend/replace each day's `## <date>` section in `<home>/data/daily-log.md` (newest on top).
- If the range spans more than one day, also write an **arc**: upsert a `weeks` entry `{ weekStart, weekEnd, activeDays, summary, highlights:[...] }` and a `## <range>` arc section at the top of the log.
- Regenerate the dashboard by running `node "<home>/bin/sync-dashboard.mjs"`. Do NOT hand-write `data.js`.

## 5. Report
Tell the user, in the HANDBOOK's tone, 1-3 honest lines about the day or the arc, and remind them to open `<home>/dashboard/index.html`. A light day still counts as a logged day.
