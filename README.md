# Kudos

Give yourself credit for the work you actually do.

Kudos quietly watches the repos and folders you work in, then turns your incremental daily work into an honest log and a GitHub-style contribution heatmap. It is for the feeling of "I never notice my own progress, I only see the end result." Now you can see the days you showed up.

![daily heatmap with per-day drill-down]

## Install

### Claude Code (CLI)
```bash
claude plugin marketplace add gentsk77/kudos
claude plugin install kudos@kudos
```

### Cowork (desktop app)
Customize -> Plugins -> add marketplace `https://github.com/gentsk77/kudos`, then install **Kudos**.
Or: Customize -> Plugins -> Upload local plugin, and upload `dist/kudos.zip`.

## Get started
1. `/kudos:setup` - pick what to track, calendar, tone, and register the daily snapshot. (Needs Node.js on PATH.)
2. `/kudos:recap` - summarize today. Or `/kudos:recap 7d`, `/kudos:recap 2026-06-25`, `/kudos:recap 2026-06-20..2026-06-26`.
3. `/kudos:watch <path>` - add another repo or folder anytime.
4. Open `~/.kudos/dashboard/index.html` for the heatmap.

## How it works
- A small **node** snapshot script runs on a schedule (Windows Task Scheduler / cron) and captures working-tree state locally. No AI, no network.
- `/kudos:recap` reconstructs a day (or range) from git history + file mtimes + (optionally) your calendar, and writes the log + heatmap. The rules live in `~/.kudos/HANDBOOK.md` - yours to tune.
- Everything personal lives in your data home `~/.kudos/` (override with `KUDOS_HOME`). The plugin itself stores no data.

## Privacy
Your log, snapshots, and config never leave your machine. The published plugin contains no personal data.

## Layout
```
.claude-plugin/marketplace.json   marketplace manifest
plugins/kudos/                    the plugin
  .claude-plugin/plugin.json
  skills/{setup,watch,recap}/
  scripts/                        node core + per-OS scheduler + build
  assets/                         HANDBOOK, dashboard, config templates
dist/kudos.zip                    uploadable plugin bundle
```
