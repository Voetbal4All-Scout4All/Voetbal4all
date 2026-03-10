// scripts/copy-static.mjs
import { cpSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const dist = resolve(root, 'dist');

mkdirSync(dist, { recursive: true });

// Kopieer alle .html bestanden en mappen uit de root (niet src/, niet dist/)
const entries = readdirSync(root, { withFileTypes: true });
const skip = new Set(['dist', 'src', 'node_modules', '.git', '.github', 'scripts']);

for (const entry of entries) {
    if (skip.has(entry.name)) continue;
    // Kopieer mappen en bestanden (html, css, png, ico, json, txt, etc.)
  const src = resolve(root, entry.name);
    const dest = resolve(dist, entry.name);
    // Sla .md en config bestanden over (niet nodig in dist)
  const skipExt = new Set(['.md', '.mjs', '.js']);
    if (!entry.isDirectory() && skipExt.has(extname(entry.name))) continue;
    cpSync(src, dest, { recursive: true, force: true });
    console.log(`✓ ${entry.name}`);
}

console.log('\n✅ Statische bestanden gekopieerd naar dist/');
