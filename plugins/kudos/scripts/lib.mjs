// Shared helpers for Kudos node scripts. Cross-platform (Windows / macOS / Linux).
import os from 'os';
import path from 'path';
import fs from 'fs';

// The per-user data home. Default ~/.kudos, overridable with KUDOS_HOME.
export function kudosHome() {
  return process.env.KUDOS_HOME || path.join(os.homedir(), '.kudos');
}

// Read text, dropping a UTF-8 BOM if present (PowerShell/editors often add one).
export function readText(p) {
  const s = fs.readFileSync(p, 'utf8');
  return s.charCodeAt(0) === 0xFEFF ? s.slice(1) : s;
}

export function readJson(p) {
  return JSON.parse(readText(p));
}

export function loadConfig(home = kudosHome()) {
  return readJson(path.join(home, 'config.json'));
}

export function resolveSnapshotDir(home, cfg) {
  const s = cfg.snapshotDir || '.snapshots';
  return path.isAbsolute(s) ? s : path.join(home, s);
}

export const pad = (n) => String(n).padStart(2, '0');
export const dateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const timeStr = (d) => `${pad(d.getHours())}${pad(d.getMinutes())}`;

const BINARY = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.webp', '.pdf', '.zip', '.gz',
  '.7z', '.exe', '.dll', '.bin', '.woff', '.woff2', '.ttf', '.otf', '.eot',
  '.mp4', '.mov', '.mp3', '.wav', '.sqlite', '.db', '.lock'
]);
export const isTextFile = (f) => !BINARY.has(path.extname(f).toLowerCase());

const DEFAULT_IGNORE = ['.git', 'node_modules', 'dist', 'build', '.next', 'out',
  '.snapshots', '.venv', 'venv', '__pycache__', '.cache', 'target', 'bin', 'obj'];

// Convert a simple glob (supports *) to a RegExp matched against the basename.
function globToRe(g) {
  return new RegExp('^' + g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
}

// Walk a plain directory, returning { path (relative), mtimeMs, size } for text files,
// skipping default + custom ignores and binaries.
export function walkDir(root, customIgnore = []) {
  const ignoreNames = new Set([...DEFAULT_IGNORE]);
  const ignoreGlobs = customIgnore.map(globToRe);
  const out = [];
  const skip = (name) => ignoreNames.has(name) || ignoreGlobs.some((re) => re.test(name));
  (function walk(dir) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (skip(e.name)) continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.isFile() && isTextFile(e.name)) {
        try {
          const st = fs.statSync(full);
          if (st.size <= 1048576) out.push({ path: path.relative(root, full).split(path.sep).join('/'), mtimeMs: Math.round(st.mtimeMs), size: st.size });
        } catch { /* ignore */ }
      }
    }
  })(root);
  return out;
}
