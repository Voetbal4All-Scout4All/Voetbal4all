// scripts/generate-sitemap.mjs — Fetch sitemap data from backend, generate XML files + pre-render listing JSON-LD
// Usage: node scripts/generate-sitemap.mjs
// Requires Node 18+ (native fetch)
import { writeFileSync, readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const BACKEND_URL = process.env.SITEMAP_BACKEND_URL || "https://voetbal4all-backend-database.onrender.com";
const SITE_BASE = "https://www.voetbal4all.eu";

// ── Shared schema builders (same module used client-side) ──
// Load as CJS module via vm to avoid ESM/CJS interop issues
import { createContext, Script } from "vm";
const _schemaCode = readFileSync(resolve(root, "assets/js/schema-builders.js"), "utf8");
const _schemaModule = { exports: {} };
const _schemaScript = new Script(`(function(module,exports){${_schemaCode}})(module,module.exports);`);
_schemaScript.runInNewContext({ module: _schemaModule, exports: _schemaModule.exports });
const V4ASchema = _schemaModule.exports;

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
  `${SITE_BASE}/over-ons.html`,
  `${SITE_BASE}/sportief-resultaten.html`,
  `${SITE_BASE}/contact.html`,
  `${SITE_BASE}/aanmelden.html`,
  `${SITE_BASE}/event-aanmelden.html`,
];
const staticXml = wrapUrlset(staticUrls.map(u => urlEntry(u, today)));

// ── Generate sitemap-articles.xml ──
// Strategy: if dist/artikel/ exists (SSG ran before sitemap), walk it to get the REAL set.
// Otherwise fall back to API data (standalone sitemap.yml runs without SSG).
function articleUrl(a) {
  return `${SITE_BASE}/artikel/${a.slug_year}/${String(a.slug_month).padStart(2, "0")}/${encodeURIComponent(a.slug)}/`;
}

const distArtikelDir = resolve(root, "dist", "artikel");
let articleEntries;

if (existsSync(distArtikelDir)) {
  // Walk dist/artikel/{year}/{month}/{slug}/index.html → derive sitemap entries
  const { readdirSync } = await import("fs");
  const ssgArticles = [];
  try {
    for (const year of readdirSync(distArtikelDir)) {
      const yearDir = resolve(distArtikelDir, year);
      if (!existsSync(resolve(yearDir)) || !/^\d{4}$/.test(year)) continue;
      for (const month of readdirSync(yearDir)) {
        const monthDir = resolve(yearDir, month);
        if (!existsSync(monthDir) || !/^\d{2}$/.test(month)) continue;
        for (const slug of readdirSync(monthDir)) {
          if (existsSync(resolve(monthDir, slug, "index.html"))) {
            ssgArticles.push({ slug_year: year, slug_month: month, slug });
          }
        }
      }
    }
  } catch (e) { console.warn(`[sitemap] dist walk failed: ${e.message}`); }

  // Match with API data for lastmod (optional enrichment)
  const apiLookup = new Map();
  for (const a of data.articles) {
    if (a.slug) apiLookup.set(`${a.slug_year}/${String(a.slug_month).padStart(2,"0")}/${a.slug}`, a.lastmod);
  }

  articleEntries = ssgArticles.map(a => {
    const key = `${a.slug_year}/${a.slug_month}/${a.slug}`;
    return urlEntry(articleUrl(a), apiLookup.get(key) || today);
  });
  console.log(`[sitemap] Articles in sitemap: ${articleEntries.length} (from dist/artikel/ walk, guaranteed 200)`);
} else {
  // Fallback: API-based (for standalone sitemap.yml runs without SSG)
  const allWithSlug = data.articles.filter(a => a.slug && a.slug_year && a.slug_month);
  const articlesWithBody = allWithSlug.filter(a => a.has_body !== false);
  const filtered = allWithSlug.length - articlesWithBody.length;
  if (filtered > 0) console.log(`[sitemap] Filtered ${filtered} thin-content articles (body < 50 chars)`);
  articleEntries = articlesWithBody.map(a => urlEntry(articleUrl(a), a.lastmod || today));
  console.log(`[sitemap] Articles in sitemap: ${articleEntries.length} / ${allWithSlug.length} total (API fallback, dist not found)`);
}

const articlesXml = wrapUrlset(articleEntries);

// ── Deel A: Generate sitemap-news.xml (last 48h, max 1000 URLs) ──
const NEWS_MAX = 1000;
const cutoff48h = Date.now() - 48 * 60 * 60 * 1000;

const recentArticles = articlesWithBody
  .filter(a => {
    const pub = a.published_at || a.lastmod;
    if (!pub) return false;
    return new Date(pub).getTime() >= cutoff48h;
  })
  .sort((a, b) => new Date(b.published_at || b.lastmod).getTime() - new Date(a.published_at || a.lastmod).getTime())
  .slice(0, NEWS_MAX);

function newsEntry(a) {
  const loc = articleUrl(a);
  const pubDate = a.published_at || a.lastmod || new Date().toISOString();
  const title = escXml(a.title || a.slug || "");
  return `  <url>
    <loc>${escXml(loc)}</loc>
    <news:news>
      <news:publication>
        <news:name>Voetbal4All</news:name>
        <news:language>nl</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${title}</news:title>
    </news:news>
  </url>`;
}

const newsXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${recentArticles.map(newsEntry).join("\n")}
</urlset>
`;

// ── Generate sitemap-events.xml (empty — event detail pages removed from frontend) ──
const eventsXml = wrapUrlset([]);

// ── Generate sitemap-jobs.xml (empty — event detail pages removed from frontend) ──
const jobsXml = wrapUrlset([]);

// ── Generate sitemap-index.xml ──
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
    <loc>${SITE_BASE}/sitemap-news.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>
`;

// ── Assert: sitemap-index must have exactly 3 children ──
const sitemapCount = (indexXml.match(/<sitemap>/g) || []).length;
if (sitemapCount !== 3) {
  throw new Error(`[sitemap] FATAL: sitemap-index.xml has ${sitemapCount} <sitemap> entries, expected 3 (static, articles, news)`);
}
console.log(`[sitemap] ✓ sitemap-index.xml has ${sitemapCount} children (static, articles, news)`);

// ── Deel D: Build-time pre-render listing JSON-LD ──
// Fetch live event + vacancy data and inject @graph into HTML files
// Uses the SAME V4ASchema module as the client-side populate

function isoDateOnly(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

async function preRenderListingSchemas() {
  console.log("[sitemap] Pre-rendering listing JSON-LD...");

  // Fetch events + vacancies from backend
  const [evRes, vacRes] = await Promise.allSettled([
    fetch(`${BACKEND_URL}/api/events?limit=200&nocache=1`, { signal: AbortSignal.timeout(15_000) }),
    fetch(`${BACKEND_URL}/api/club-vacancies?limit=200&nocache=1`, { signal: AbortSignal.timeout(15_000) }),
  ]);

  // ─ Events (sportieve) ─
  let sportieveEvents = [];
  let clubFunEvents = [];
  if (evRes.status === "fulfilled" && evRes.value.ok) {
    try {
      const evJson = await evRes.value.json();
      const allEvents = (evJson && evJson.ok && Array.isArray(evJson.items)) ? evJson.items : [];
      const visible = allEvents.filter(ev => !ev.is_deleted && (!ev.status || ev.status === "published"));

      sportieveEvents = visible.filter(ev => {
        const cat = String(ev.category || "").toLowerCase();
        if (cat) return cat === "sportief";
        const raw = String(ev.event_type || "").toLowerCase();
        return !raw.startsWith("club & fun");
      });
      clubFunEvents = visible.filter(ev => String(ev.category || "").toLowerCase() === "club & fun");
    } catch (_) {}
  }

  // ─ Vacancies ─
  let vacancies = [];
  if (vacRes.status === "fulfilled" && vacRes.value.ok) {
    try {
      const vacJson = await vacRes.value.json();
      vacancies = Array.isArray(vacJson) ? vacJson : (vacJson && Array.isArray(vacJson.items)) ? vacJson.items : [];
    } catch (_) {}
  }

  // Build schemas via shared module — pass all available fields for rich results
  const BACKEND_IMG = "https://voetbal4all-backend-database.onrender.com";
  function resolveEventImage(ev) {
    const img = ev.cover_image_url || ev.flyer_image_url || "";
    if (!img) return "";
    return img.startsWith("http") ? img : `${BACKEND_IMG}${img.startsWith("/") ? img : "/" + img}`;
  }

  const sportsItems = sportieveEvents.filter(ev => ev.title && ev.start_at).map(ev => ({
    title: ev.title, startDate: isoDateOnly(ev.start_at), slug: ev.slug || ev.id,
    country: String(ev.country || "BE").toUpperCase(), city: ev.city || "",
    endDate: ev.end_at ? isoDateOnly(ev.end_at) : "",
    organizer: ev.organizer_name || ev.club_name || ev.club || "",
    image: resolveEventImage(ev),
    description: ev.description || "",
  }));
  const sportsLd = V4ASchema.buildSportsEventGraph(sportsItems);

  const clubFunItems = clubFunEvents.filter(ev => ev.title && ev.start_at).map(ev => ({
    title: ev.title, startDate: isoDateOnly(ev.start_at), slug: ev.slug || ev.id,
    country: String(ev.country || "BE").toUpperCase(), city: ev.city || "",
    club: ev.club_name || ev.club || ev.organizer_name || "",
    endDate: ev.end_at ? isoDateOnly(ev.end_at) : "",
    image: resolveEventImage(ev),
    description: ev.description || "",
  }));
  const clubFunLd = V4ASchema.buildSocialEventGraph(clubFunItems);

  const vacItems = vacancies.filter(v => v.title || v.function_title).map(v => ({
    title: v.title || v.function_title || "", club: v.club_name || v.club || "",
    city: v.city || "", province: v.province || v.region || "",
    country: String(v.country || "BE").toUpperCase(),
    description: v.description || "",
  }));
  const vacLd = V4ASchema.buildJobPostingGraph(vacItems);

  // Inject into HTML files (replace existing seed JSON-LD)
  const injections = [
    { file: "events.html", id: "events-ld", ld: sportsLd },
    { file: "algemene-events.html", id: "clubfun-ld", ld: clubFunLd },
    { file: "clubvacatures.html", id: "jobpostings-ld", ld: vacLd },
    // sportief-resultaten: left empty at build time (requires league selection)
  ];

  for (const { file, id, ld } of injections) {
    const filePath = resolve(root, file);
    if (!existsSync(filePath)) continue;
    let html = readFileSync(filePath, "utf8");

    // Replace the content of the <script id="..."> tag
    const re = new RegExp(`(<script\\s+id="${id}"\\s+type="application/ld\\+json">)[\\s\\S]*?(</script>)`);
    const match = html.match(re);
    if (match) {
      const replacement = match[1] + JSON.stringify(ld) + match[2];
      html = html.replace(re, replacement);
      writeFileSync(filePath, html);
      console.log(`  ${file}: injected ${ld["@graph"].length} ${id} nodes`);
    } else {
      console.log(`  ${file}: script#${id} not found, skipping`);
    }
  }
}

try {
  await preRenderListingSchemas();
} catch (e) {
  console.warn("[sitemap] Pre-render failed (non-fatal):", e.message);
}

// ── Write sitemap files to repo root ──
writeFileSync(resolve(root, "sitemap-index.xml"), indexXml);
writeFileSync(resolve(root, "sitemap.xml"), indexXml);
writeFileSync(resolve(root, "sitemap-static.xml"), staticXml);
writeFileSync(resolve(root, "sitemap-articles.xml"), articlesXml);
writeFileSync(resolve(root, "sitemap-news.xml"), newsXml);
writeFileSync(resolve(root, "sitemap-events.xml"), eventsXml);
writeFileSync(resolve(root, "sitemap-jobs.xml"), jobsXml);

console.log(`[sitemap] Generated 7 files:`);
console.log(`  sitemap-index.xml (index) — 3 sub-sitemaps`);
console.log(`  sitemap-static.xml — ${staticUrls.length} URLs`);
console.log(`  sitemap-articles.xml — ${articleEntries.length} URLs`);
console.log(`  sitemap-news.xml — ${recentArticles.length} URLs (last 48h, max ${NEWS_MAX})`);
console.log(`  sitemap-events.xml — 0 URLs (disabled)`);
console.log(`  sitemap-jobs.xml — 0 URLs (disabled)`);
console.log(`  Total: ${staticUrls.length + articleEntries.length + recentArticles.length} URLs`);
