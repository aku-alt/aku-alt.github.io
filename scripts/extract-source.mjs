// One-time mechanical extraction of the existing, readable bundle. No library upgrade.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const html = readFileSync('streak.html', 'utf8');
const start = html.lastIndexOf('  // workoutstreak.tsx');
const end = html.indexOf('  // ../../../tmp/app-entry.tsx', start);
if (start < 0 || end < start) throw Error('Unexpected bundle layout');
mkdirSync('src', { recursive: true });
writeFileSync('src/shell-start.txt', html.slice(0, start));
writeFileSync('src/app.js', html.slice(start, end));
writeFileSync('src/shell-end.txt', html.slice(end));
