// scripts/generate-sitemap.mjs — Fetch sitemap data from backend, generate 5 XML files
// Usage: node scripts/generate-sitemap.mjs
// Requires Node 18+ (native fetch)
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const BACKEND_URL = process.env.SITEMAP_BACKEND_URL || "https://voetbal4all-backend-database.onrender.com";
const SITE_BASE = "https://www.voetbal4all.eu";

// ── Fetch data from backend ──
console.log(`[sitemap] Fetching data from ${BACKEND_URL}/api/sitemap/data ...`);
const resp = await fetch(`${BACKEND_URL}/api/sitemap/data`, { signal: AbortSignal.timeout(30_000) });
if (!resp.ok) throw new Error(`Backend returned HTTP ${resp.status}`);
const data = await resp.json();

if (!Array.isArray(data.articles) || !Array.isArray(data.events) || !Array.isArray(data.jobs)) {
  throw new Error("Invalid response shape: expected articles, events, jobs arrays");
}

console.log(`[sitemap] Received: ${data.articles.length} articles, ${data.events.length} events, ${data.jobs.length} jobs`);

const today = new Date().toISOString().split("T")[0];

// ── XML helpers ──
function escXml(s) {
  return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function urlEntry(loc, lastmod) {
  return `  <url>\n    <loc>${escXml(loc)}</loc>\n    <lastmod>${lastmod || today}</lastmod>\n  </url>`;
}

function wrapUrlset(entries) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;
}

// ── Generate sitemap-static.xml ──
const staticUrls = [
  `${SITE_BASE}/`,
  `${SITE_BASE}/artikels.html`,
  `${SITE_BASE}/clubvacatures.html`,
  `${SITE_BASE}/spelers.html`,
  `${SITE_BASE}/trainers.html`,
  `${SITE_BASE}/events.html`,
  `${SITE_BASE}/algemene-events.html`,
  `${SITE_BASE}/sportief-resultaten.html`,
  `${SITE_BASE}/contact.html`,
  `${SITE_BASE}/aanmelden.html`,
  `${SITE_BASE}/event-aanmelden.html`,
];
const staticXml = wrapUrlset(staticUrls.map(u => urlEntry(u, today)));

// ── Generate sitemap-articles.xml ──
const articleEntries = data.articles.map(a => {
  // Use slug-based URL if available, fallback to ?id= for un-backfilled articles
  const loc = (a.slug && a.slug_year && a.slug_month)
    ? `${SITE_BASE}/artikel/${a.slug_year}/${String(a.slug_month).padStart(2, "0")}/${encodeURIComponent(a.slug)}`
    : `${SITE_BASE}/artikel.html?id=${encodeURIComponent(a.id)}`;
  return urlEntry(loc, a.lastmod || today);
});
const articlesXml = wrapUrlset(articleEntries);

// ── Generate sitemap-events.xml ──
const eventEntries = data.events.map(e => {
  const loc = e.slug
    ? `${SITE_BASE}/event.html?slug=${encodeURIComponent(e.slug)}`
    : `${SITE_BASE}/event.html?id=${encodeURIComponent(e.id)}`;
  return urlEntry(loc, e.lastmod || today);
});
const eventsXml = wrapUrlset(eventEntries);

// ── Generate sitemap-jobs.xml ──
const jobEntries = data.jobs.map(j => {
  const loc = `${SITE_BASE}/event.html?type=clubvacature&id=${encodeURIComponent(j.id)}`;
  return urlEntry(loc, j.lastmod || today);
});
const jobsXml = wrapUrlset(jobEntries);

// ── Generate sitemap-index (sitemap-index.xml) ──
const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_BASE}/sitemap-static.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_BASE}/sitemap-articles.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_BASE}/sitemap-events.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_BASE}/sitemap-jobs.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>
`;

// ── Write files to repo root ──
writeFileSync(resolve(root, "sitemap-index.xml"), indexXml);
writeFileSync(resolve(root, "sitemap-static.xml"), staticXml);
writeFileSync(resolve(root, "sitemap-articles.xml"), articlesXml);
writeFileSync(resolve(root, "sitemap-events.xml"), eventsXml);
writeFileSync(resolve(root, "sitemap-jobs.xml"), jobsXml);

console.log(`[sitemap] Generated 5 files:`);
console.log(`  sitemap-index.xml (index) — 4 sub-sitemaps`);
console.log(`  sitemap-static.xml — ${staticUrls.length} URLs`);
console.log(`  sitemap-articles.xml — ${articleEntries.length} URLs`);
console.log(`  sitemap-events.xml — ${eventEntries.length} URLs`);
console.log(`  sitemap-jobs.xml — ${jobEntries.length} URLs`);
console.log(`  Total: ${staticUrls.length + articleEntries.length + eventEntries.length + jobEntries.length} URLs`);
