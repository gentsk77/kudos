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
- `git`: `git -C <path> log --author="$(git -C <path> config user.email)" --since="<day> 00:00" --until="<day> 23:59" --patch --no-merges` PLUS `git -C <path> diff HEAD` and untracked files. **Date by work-time (mtime), not commit time**; never split a past-midnight session.
- `dir`: files under `<path>` whose mtime falls in the day (respect the ignore list); read changed files.
- `calendar` (only if `calendars.enabled`): list the day's events from each included calendar id with the connected calendar tool; keep interviews/calls/mocks, ignore focus-time/OOO/holidays/routine. If no calendar tool is available, skip silently.
Use `<snapshotDir>/<name>/<day>/<HHmm>/` to bucket into Morning/Afternoon/Evening; if none, use a single "Today" bucket.

## 3. Turn diffs into honest milestones
Milestones are your own commits only: the `--author` filter above keeps teammates' commits in shared repos out of your log. If `git config user.email` is empty for a repo, say so and skip that repo's commits rather than counting everyone's.
Apply the HANDBOOK tone. Roll up trivial/whitespace/typo changes. Do NOT count Kudos's own generated output.

## 4. Write (idempotent - replace, never duplicate)
- For each day in range, upsert its object in `<home>/data/progress.json` `days`: `{ date, milestones (count), summary, buckets:[{label, items:[{repo, source, text}]}] }`. Keep newest day first.
- Prepend/replace each day's `## <date>` section in `<home>/data/daily-log.md` (newest on top).
- If the range spans more than one day, also write an **arc**: upsert a `weeks` entry `{ weekStart, weekEnd, activeDays, summary, highlights:[...] }` and a `## <range>` arc section at the top of the log.
- `data/progress.json` is the source of truth for the heatmap. There is no file dashboard - it renders inline (next step).

## 5. Show it inline (this is the output - render it in the conversation)
- **Heatmap, inline:** read `${CLAUDE_PLUGIN_ROOT}/assets/inline-heatmap.html`, replace the token `__PROGRESS__` with the full contents of `<home>/data/progress.json`, and render it with your inline visualization capability (e.g. the visualize / show_widget tool). If no inline-visualization tool is available, fall back to a compact unicode strip for the range (one row, a shaded square per day by milestone count) so something always shows.
- **Recap text, inline:** in the HANDBOOK's tone, print the result as markdown -
  - single day: the one-line summary, then the bucketed milestones (with a calendar tag where relevant);
  - range: the arc summary, then each day as `YYYY-MM-DD · N · <one line>`, then the notable milestones.

A light day still counts as a logged day - say so plainly rather than padding it.
