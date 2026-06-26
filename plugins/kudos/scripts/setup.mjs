// setup.mjs - materialize / upgrade a self-contained Kudos runtime in the data home
// (~/.kudos by default). NEVER destroys existing data, config, or HANDBOOK tuning.
//
// First run  : seeds an empty data home (timezone detected from the system).
// Upgrade run: refreshes bin/ scripts, merges any NEW config keys with defaults, cleans up
//              obsolete artifacts - and leaves your log, config values, and HANDBOOK intact.
//
// Usage: node setup.mjs --plugin-root <path> [--tone honest|warm|terse|coach]
// Prints a JSON line: { home, firstRun, addedKeys, tone, ok }.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { kudosHome, readJson } from './lib.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = {};
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i].startsWith('--')) args[process.argv[i].slice(2)] = process.argv[i + 1];
}
const pluginRoot = args['plugin-root'] || path.resolve(__dirname, '..');
const tone = args.tone || 'honest';
const home = kudosHome();

const TONES = {
  honest: 'True and specific over generic, no cheerleading, no inflation. State volume plainly. Light days count as days, said plainly.',
  warm:   'Encouraging and kind, but never inflated. Acknowledge effort and showing up; celebrate small wins without exclamation-mark hype. Light days still count, framed gently.',
  terse:  'Minimal. One short, factual clause per milestone. No adjectives, no framing sentences. Just what happened.',
  coach:  'A focused coach: name the win, then in one short line connect it to momentum or a next step. Never preachy, never inflated.'
};

const mkdirp = (p) => fs.mkdirSync(p, { recursive: true });
const exists = (p) => fs.existsSync(p);
const copy = (src, dst) => { mkdirp(path.dirname(dst)); fs.copyFileSync(src, dst); };

const configPath = path.join(home, 'config.json');
const firstRun = !exists(configPath);

mkdirp(home);
['data', 'bin', '.snapshots'].forEach((d) => mkdirp(path.join(home, d)));

// Stable copies of the runtime scripts the scheduler points at. Always refreshed.
for (const s of ['lib.mjs', 'snapshot.mjs']) {
  copy(path.join(pluginRoot, 'scripts', s), path.join(home, 'bin', s));
}

// Clean up artifacts from older versions (the file dashboard is gone - recap renders inline).
try { fs.rmSync(path.join(home, 'dashboard'), { recursive: true, force: true }); } catch { /* */ }
try { fs.rmSync(path.join(home, 'bin', 'sync-dashboard.mjs'), { force: true }); } catch { /* */ }

// Config: create on first run (with detected timezone), else merge in any new keys.
const tmpl = readJson(path.join(pluginRoot, 'assets', 'config.template.json'));
const addedKeys = [];
if (firstRun) {
  try { tmpl.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || tmpl.timezone; } catch { /* */ }
  fs.writeFileSync(configPath, JSON.stringify(tmpl, null, 2) + '\n');
} else {
  const cfg = readJson(configPath);
  for (const k of Object.keys(tmpl)) {
    if (!(k in cfg)) { cfg[k] = tmpl[k]; addedKeys.push(k); }
  }
  if (cfg.calendars && tmpl.calendars) {
    for (const k of Object.keys(tmpl.calendars)) {
      if (!(k in cfg.calendars)) { cfg.calendars[k] = tmpl.calendars[k]; addedKeys.push('calendars.' + k); }
    }
  }
  fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2) + '\n');
}

// Data + HANDBOOK: seed only if absent (preserve the user's log and tuning).
if (!exists(path.join(home, 'data', 'progress.json'))) {
  fs.writeFileSync(path.join(home, 'data', 'progress.json'), '{\n  "days": [],\n  "weeks": []\n}\n');
}
if (!exists(path.join(home, 'data', 'daily-log.md'))) {
  fs.writeFileSync(path.join(home, 'data', 'daily-log.md'),
    '# Progress Log\n\nYour incremental work, day by day. Written by /kudos:recap. Honest, not inflated.\n\n---\n');
}
if (!exists(path.join(home, 'HANDBOOK.md'))) {
  let hb = fs.readFileSync(path.join(pluginRoot, 'assets', 'HANDBOOK.default.md'), 'utf8');
  hb = hb.replace('{{TONE}}', TONES[tone] || TONES.honest);
  fs.writeFileSync(path.join(home, 'HANDBOOK.md'), hb);
}

console.log(JSON.stringify({ home, firstRun, addedKeys, tone, ok: true }));
console.log(firstRun ? `Kudos home created at ${home}` : `Kudos home upgraded at ${home}${addedKeys.length ? ' (added: ' + addedKeys.join(', ') + ')' : ' (no new config keys)'}`);
