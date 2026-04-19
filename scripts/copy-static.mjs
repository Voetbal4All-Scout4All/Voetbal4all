// scripts/copy-static.mjs
import { cpSync, mkdirSync, readdirSync } from 'fs';
import { resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const dist = resolve(root, 'dist');

mkdirSync(dist, { recursive: true });

// Allowlist: alleen expliciet publieke sitebestanden en -mappen mogen naar dist.
const entries = readdirSync(root, { withFileTypes: true });
const allowedDirectories = new Set([
  'assets',
  'data',
  'scout',
  'share',
  'videos',
]);

const allowedFiles = new Set([
  'CNAME',
  '_redirects',
  'ads.txt',
  'favicon-16x16.png',
  'favicon-180x180.png',
  'favicon-192x192.png',
  'favicon-32x32.png',
  'favicon-48x48.png',
  'favicon-512x512.png',
  'favicon-96x96.png',
  'favicon.ico',
  'favicon.svg',
  'robots.txt',
  'site.webmanifest',
  'sitemap.xml',
  'style.css',
]);

function isAllowedEntry(entry) {
  if (entry.isDirectory()) {
    return allowedDirectories.has(entry.name);
  }

  if (entry.isFile()) {
    return entry.name.endsWith('.html') || allowedFiles.has(entry.name);
  }

  return false;
}

function isAllowedCopiedPath(sourcePath) {
  return !basename(sourcePath).startsWith('.');
}

for (const entry of entries) {
  if (!isAllowedEntry(entry)) continue;

  const src = resolve(root, entry.name);
  const dest = resolve(dist, entry.name);
  cpSync(src, dest, {
    recursive: true,
    force: true,
    filter: isAllowedCopiedPath,
  });
  console.log(`✓ ${entry.name}`);
}

console.log('\n✅ Statische bestanden gekopieerd naar dist/');
