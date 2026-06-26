// snapshot.mjs - capture working-tree state across watched repos/dirs. No AI, no network.
// Run by the OS scheduler (see scripts/scheduler/). Cross-platform node.
// Writes timestamped raw captures into <snapshotDir>/<name>/<date>/<HHmm>/.
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { kudosHome, loadConfig, resolveSnapshotDir, dateStr, timeStr, isTextFile, walkDir } from './lib.mjs';

const home = kudosHome();
let cfg;
try { cfg = loadConfig(home); }
catch { console.error(`Kudos: no config at ${home}. Run /kudos:setup first.`); process.exit(1); }

const git = (args, cwd) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });

const now = new Date();
const date = dateStr(now), time = timeStr(now);
const snapRoot = resolveSnapshotDir(home, cfg);

for (const w of cfg.watch || []) {
  const out = path.join(snapRoot, w.name, date, time);
  try {
    fs.mkdirSync(out, { recursive: true });
    if (w.type === 'dir') {
      const files = walkDir(w.path, w.ignore || []);
      fs.writeFileSync(path.join(out, 'manifest.json'),
        JSON.stringify({ name: w.name, type: 'dir', timestamp: now.toISOString(), files }, null, 2));
    } else {
      let head = '';
      try { head = git(['rev-parse', 'HEAD'], w.path).trim(); } catch { /* no commits yet */ }
      let patch = '';
      if (head) { try { patch = git(['diff', 'HEAD'], w.path); } catch { /* */ } }
      fs.writeFileSync(path.join(out, 'tracked.patch'), patch);
      let status = '';
      try { status = git(['status', '--porcelain'], w.path); } catch { /* */ }
      fs.writeFileSync(path.join(out, 'status.txt'), status);
      let untracked = [];
      try { untracked = git(['ls-files', '--others', '--exclude-standard'], w.path).split('\n').filter(Boolean); } catch { /* */ }
      for (const f of untracked) {
        if (!isTextFile(f)) continue;
        const src = path.join(w.path, f);
        try {
          if (fs.statSync(src).size > 1048576) continue;
          const dest = path.join(out, 'untracked', f);
          fs.mkdirSync(path.dirname(dest), { recursive: true });
          fs.copyFileSync(src, dest);
        } catch { /* */ }
      }
      fs.writeFileSync(path.join(out, 'meta.json'),
        JSON.stringify({ name: w.name, type: 'git', head, timestamp: now.toISOString() }, null, 2));
    }
  } catch (e) {
    console.error(`Kudos: snapshot failed for ${w.name}: ${e.message}`);
  }
}
console.log(`Kudos snapshot complete: ${date} ${time}`);
