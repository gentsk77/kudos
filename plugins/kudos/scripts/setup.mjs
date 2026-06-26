// setup.mjs - materialize a self-contained Kudos runtime in the data home (~/.kudos by default).
// Idempotent: never clobbers an existing config.json, data/, or HANDBOOK.md. Re-run safely after
// a plugin update to refresh bin/ scripts and the dashboard.
//
// Usage: node setup.mjs --plugin-root <path> [--tone honest|warm|terse|coach]
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { kudosHome } from './lib.mjs';

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

mkdirp(home);
['data', 'dashboard', 'bin', '.snapshots'].forEach((d) => mkdirp(path.join(home, d)));

// Stable copies of the runtime scripts (the scheduler + recap point here, not at the versioned cache).
for (const s of ['lib.mjs', 'snapshot.mjs', 'sync-dashboard.mjs']) {
  copy(path.join(pluginRoot, 'scripts', s), path.join(home, 'bin', s));
}
copy(path.join(pluginRoot, 'assets', 'dashboard', 'index.html'), path.join(home, 'dashboard', 'index.html'));

// Seed data + config + handbook only if absent (preserve the user's log and tuning).
if (!exists(path.join(home, 'config.json'))) {
  copy(path.join(pluginRoot, 'assets', 'config.template.json'), path.join(home, 'config.json'));
}
if (!exists(path.join(home, 'data', 'progress.json'))) {
  fs.writeFileSync(path.join(home, 'data', 'progress.json'), '{\n  "days": [],\n  "weeks": []\n}\n');
}
if (!exists(path.join(home, 'data', 'daily-log.md'))) {
  fs.writeFileSync(path.join(home, 'data', 'daily-log.md'),
    '# Progress Log\n\nYour incremental work, day by day. Written by /kudos:recap. Honest, not inflated.\n\n---\n');
}
if (!exists(path.join(home, 'dashboard', 'data.js'))) {
  fs.writeFileSync(path.join(home, 'dashboard', 'data.js'),
    '// Auto-generated. Do not edit by hand.\nwindow.PROGRESS = {\n  "days": [],\n  "weeks": []\n};\n');
}
if (!exists(path.join(home, 'HANDBOOK.md'))) {
  let hb = fs.readFileSync(path.join(pluginRoot, 'assets', 'HANDBOOK.default.md'), 'utf8');
  hb = hb.replace('{{TONE}}', TONES[tone] || TONES.honest);
  fs.writeFileSync(path.join(home, 'HANDBOOK.md'), hb);
}

console.log(JSON.stringify({ home, tone, ok: true }));
console.log(`Kudos home ready at ${home}`);
