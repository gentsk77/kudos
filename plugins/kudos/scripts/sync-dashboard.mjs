// sync-dashboard.mjs - regenerate <home>/dashboard/data.js from <home>/data/progress.json.
// /kudos:recap calls this instead of hand-writing data.js, so they can never drift or truncate.
import fs from 'fs';
import path from 'path';
import { kudosHome, readText } from './lib.mjs';

const home = kudosHome();
const pj = path.join(home, 'data', 'progress.json');
const raw = readText(pj);

try { JSON.parse(raw); }
catch (e) { console.error(`Kudos: data/progress.json is not valid JSON - refusing to write data.js. ${e.message}`); process.exit(1); }

const header =
  '// Auto-generated from data/progress.json by sync-dashboard.mjs. Do not edit by hand.\n' +
  '// Mirrors data/progress.json so the dashboard loads over file:// without a server.\n';
fs.mkdirSync(path.join(home, 'dashboard'), { recursive: true });
fs.writeFileSync(path.join(home, 'dashboard', 'data.js'), header + 'window.PROGRESS = ' + raw.trim() + ';\n');

const days = JSON.parse(raw).days?.length ?? 0;
console.log(`Kudos: data.js synced from progress.json (${days} day(s)).`);
