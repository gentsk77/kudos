# Kudos Handbook

This is the living ruleset for how `/kudos:recap` turns raw file changes into your log and heatmap. It lives in your data home (`~/.kudos/HANDBOOK.md`), so edits are yours and private and survive plugin updates. When a summary feels off, change a rule here and add a dated Changelog note.

## Purpose

Make the incremental work visible so you can give yourself credit, not just see end results. Summaries must feel **true**, never inflated. A log you stop trusting is worse than no log.

## Tone

{{TONE}}

(First person in the prose log is fine. No em dashes.)

## What counts as a milestone

A meaningful unit of work, not a file or a line. Examples: shipped or fixed a feature; wrote or sharpened a doc/spec/story; completed a lesson; made a real decision recorded in notes; prepped for or attended an interview/call. One line per milestone. Group tightly related edits into a single milestone.

## What does NOT count

- Whitespace, formatting, typo-only, or auto-generated reflows. Roll up or omit.
- Pure renames/moves with no content change.
- Kudos's own generated output (the data home's `data/` and `.snapshots/`).

## Intensity scale (heatmap color)

Color tracks **milestone count**, not lines changed.

| Milestones | Level |
|-----------|-------|
| 0         | 0 (empty) |
| 1-2       | 1 |
| 3-4       | 2 |
| 5-6       | 3 |
| 7+        | 4 (darkest) |

## Sources

Every item carries a `source`:
- `repo` - work in a watched git repo (reconstructed from git).
- `dir` - work in a watched plain directory (detected by file mtime).
- `calendar` - interviews, calls, mocks (only if calendars are enabled in config). Ignore focus-time, out-of-office, holidays, and routine recurring meetings.

## Recap reconstruction rule

The day's total is reconstructed at recap time:
1. **git repos**: your own commits in the range (`git log --author=<your git email> --since --until --patch`; teammates' commits never count) PLUS current uncommitted work (`git diff HEAD` + untracked files).
2. **plain dirs**: files whose mtime falls in the range (filtered by the ignore list).
3. **calendar** (if enabled): the range's events, kept/ignored per the Sources rule.

**Date a milestone by when the work happened (file mtime), not commit time** - people commit in batches, often after midnight, so never let a midnight boundary split one continuous session, and never assume an uncommitted pile is old backlog without checking mtimes.

Snapshots under the snapshot dir are used only for intra-day bucketing (Morning/Afternoon/Evening) and for untracked/dir-file history. If no snapshots exist for a day, use a single "Today" bucket.

## Buckets

Morning = before 12:00, Afternoon = 12:00-17:59, Evening = 18:00 on. Attribute a milestone to the earliest bucket its change is detectable in.

## Ranges

`/kudos:recap` with no argument = today. With a range (`Nd`, an ISO date, or `start..end`) it upserts one entry per day in the range, and when the range spans more than one day it also writes a short "arc" summary for the span (into `progress.json` `weeks` and the log).

## Idempotency

Re-running for a day/range **replaces** those entries, never duplicates. `data/progress.json` is the source of truth; the heatmap renders inline in chat from it (there is no file dashboard).

## Changelog

- Created at setup.
