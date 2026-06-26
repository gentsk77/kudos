#!/usr/bin/env sh
# cron.sh - register the Kudos snapshot via cron (macOS / Linux).
# Called by /kudos:setup on non-Windows. Usage: sh cron.sh [DATA_HOME] [T1 T2 T3]
set -e

DATA_HOME="${1:-$HOME/.kudos}"
NODE_BIN="$(command -v node || true)"
SCRIPT="$DATA_HOME/bin/snapshot.mjs"

if [ -z "$NODE_BIN" ]; then
  echo "node not found on PATH. Install Node.js, then re-run /kudos:setup." >&2
  exit 1
fi

# Times default to 12:00 / 18:00 / 23:55. Edit here or pass as args "HH:MM HH:MM HH:MM".
TIMES="${2:-12:00} ${3:-18:00} ${4:-23:55}"

NEW=""
for t in $TIMES; do
  H="${t%%:*}"; M="${t##*:}"
  NEW="$NEW$M $H * * * KUDOS_HOME=$DATA_HOME $NODE_BIN $SCRIPT\n"
done

( crontab -l 2>/dev/null | grep -v 'kudos/bin/snapshot.mjs' ; printf "$NEW" ) | crontab -
echo "Kudos cron jobs installed at $TIMES (home: $DATA_HOME)"
