#!/usr/bin/env node
// generate-article-pages.mjs — SSG: generate static HTML for every article at /artikel/{year}/{month}/{slug}/index.html
// Uses artikel.html as full template (Optie A: visual parity with legacy pages).
// Replaces head meta-tags + injects body content into existing container.
import { writeFileSync, mkdirSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const distDir = resolve(root, "dist");

const BACKEND = process.env.SITEMAP_BACKEND_URL || "https://voetbal4all-backend-database.onrender.com";
const SITE = "https://www.voetbal4all.eu";
const MAX_ARTICLES = 3000;

function esc(s) { return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function truncate(s, max) { const t = String(s || "").replace(/\s+/g, " ").trim(); return t.length <= max ? t : t.slice(0, max - 3) + "..."; }
function stripHtml(html) { return String(html || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim(); }
function resolveImage(img) {
  if (!img) return `${SITE}/assets/img/placeholder.svg`;
  const s = String(img).trim();
  return s.startsWith("http") ? s : `${BACKEND}${s.startsWith("/") ? s : "/" + s}`;
}

// Read artikel.html template ONCE at startup
const TEMPLATE = readFileSync(resolve(root, "artikel.html"), "utf8");

function buildPage(article, canonicalUrl) {
  const title = article.title || "Voetbalnieuws";
  const titleEsc = esc(title);
  const desc = esc(truncate(stripHtml(article.snippet || article.body), 160));
  const image = resolveImage(article.image || article.image_path);
  const imageEsc = esc(image);
  const pubDate = article.publishedAt || article.published_at || article.createdAt || article.created_at || "";
  const bodyHtml = article.body || article.snippet || `<p>${titleEsc}</p>`;
  const country = String(article.country || article.countryCode || "").toUpperCase();
  const publisherLogo = `${SITE}/assets/img/brand/logo-voetbal4all.png`;
  const dateFormatted = pubDate ? new Date(pubDate).toLocaleDateString("nl-BE", { day: "numeric", month: "long", year: "numeric" }) : "";

  // Build JSON-LD with explicit values (no template-literal-in-stringify bugs)
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org", "@type": "NewsArticle",
    "mainEntityOfPage": { "@type": "WebPage", "@id": canonicalUrl },
    "headline": title,
    "description": stripHtml(article.snippet || "").slice(0, 160),
    "image": [image],
    "datePublished": pubDate,
    "dateModified": pubDate,
    "author": { "@type": "Organization", "name": "Voetbal4All" },
    "publisher": { "@type": "Organization", "name": "Voetbal4All",
      "logo": { "@type": "ImageObject", "url": publisherLogo } },
  });

  let html = TEMPLATE;

  // ── Strip loader placeholders (SSG content is pre-rendered, these cause visual gaps) ──
  // Remove "Artikel laden..." loading placeholder (exact structure: outer div + inner card div)
  html = html.replace(/\s*<div\s+id="loading-state"[^>]*>\s*<div\s+class="card"><p>Artikel laden\.\.\.<\/p><\/div>\s*<\/div>/i, "");
  // Remove error-state placeholder (exact structure: outer div + inner card div with h2+p+a)
  html = html.replace(/\s*<div\s+id="error-state"[^>]*style="display:none;"[^>]*>[\s\S]*?Terug naar overzicht<\/a>\s*<\/div>\s*<\/div>/i, "");

  // ── FIX A: Rewrite relative paths to absolute (SSG pages are 4 levels deep) ──
  // href="style.css" → href="/style.css", src="assets/..." → src="/assets/...", etc.
  html = html.replace(/(href|src)="(?!https?:\/\/|\/\/|\/|#|data:|mailto:|tel:)([^"]+)"/g, '$1="/$2"');

  // ── FIX B: Prevent JS article-loader from overwriting static SSG content ──
  // Remove the entire inline loader script (543→1600+). It fetches article via API
  // and overwrites the DOM — useless for SSG where content is already in HTML.
  // Keep small utility scripts (year, nav-mobile, etc.)
  html = html.replace(/<script>\s*\/\/ Repair truncated[\s\S]*?<\/script>\s*(?=<\/body>)/i,
    `<script>
    // SSG: article content is pre-rendered. Only run non-loader scripts.
    document.addEventListener("DOMContentLoaded", function() {
      var c = document.getElementById("article-content");
      if (c) c.style.display = "block";
      var n = document.getElementById("article-not-found");
      if (n) n.style.display = "none";
    });
    </script>`);

  // ── HEAD replacements ──
  // Remove noindex (SSG pages SHOULD be indexed)
  html = html.replace(/<meta\s+name="robots"\s+content="noindex"[^>]*>/gi, "");
  // Title
  html = html.replace(/<title[^>]*>.*?<\/title>/i, `<title>${titleEsc} | Voetbal4All</title>`);
  // Description
  html = html.replace(/(<meta\s+name="description"\s+id="page-description"\s+content=")[^"]*(")/i, `$1${desc}$2`);
  // Canonical
  html = html.replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/i, `$1${esc(canonicalUrl)}$2`);
  // OG tags
  html = html.replace(/(<meta\s+property="og:title"\s+id="og-title"\s+content=")[^"]*(")/i, `$1${titleEsc}$2`);
  html = html.replace(/(<meta\s+property="og:description"\s+id="og-description"\s+content=")[^"]*(")/i, `$1${desc}$2`);
  html = html.replace(/(<meta\s+property="og:image"\s+id="og-image"\s+content=")[^"]*(")/i, `$1${imageEsc}$2`);
  html = html.replace(/(<meta\s+property="og:url"\s+id="og-url"\s+content=")[^"]*(")/i, `$1${esc(canonicalUrl)}$2`);
  // Twitter tags
  html = html.replace(/(<meta\s+name="twitter:title"\s+id="twitter-title"\s+content=")[^"]*(")/i, `$1${titleEsc}$2`);
  html = html.replace(/(<meta\s+name="twitter:description"\s+id="twitter-description"\s+content=")[^"]*(")/i, `$1${desc}$2`);
  html = html.replace(/(<meta\s+name="twitter:image"\s+id="twitter-image"\s+content=")[^"]*(")/i, `$1${imageEsc}$2`);
  // Article dates
  html = html.replace(/(<meta\s+property="article:published_time"\s+id="meta-published"\s+content=")[^"]*(")/i, `$1${esc(pubDate)}$2`);
  html = html.replace(/(<meta\s+property="article:modified_time"\s+id="meta-modified"\s+content=")[^"]*(")/i, `$1${esc(pubDate)}$2`);
  // JSON-LD
  html = html.replace(/<script\s+id="article-jsonld"\s+type="application\/ld\+json">[^<]*<\/script>/i,
    `<script id="article-jsonld" type="application/ld+json">${jsonLd}</script>`);

  // ── BODY: inject SSG flag + pre-rendered content ──
  // Add SSG flag so client JS knows content is already rendered
  html = html.replace("<body", `<body data-ssg="true"`);
  // Hide "Artikel nog niet beschikbaar" fallback
  html = html.replace('id="article-not-found"', 'id="article-not-found" style="display:none"');
  // Show the article content container
  html = html.replace('id="article-content" style="display:none;"', 'id="article-content"');
  // Fill article title
  html = html.replace('id="article-title">Laden...</h1>', `id="article-title">${titleEsc}</h1>`);
  // Fill breadcrumb
  html = html.replace('id="breadcrumb-title">Artikel</span>', `id="breadcrumb-title">${titleEsc}</span>`);
  // Fill country badge
  if (country) html = html.replace('id="article-country"></span>', `id="article-country">${esc(country)}</span>`);
  // Fill date
  if (dateFormatted) html = html.replace('id="article-date"></span>', `id="article-date">${esc(dateFormatted)}</span>`);
  // Fill image
  if (image && !image.includes("placeholder.svg")) {
    html = html.replace(
      /(<img\s+id="article-image"\s+src=")[^"]*("\s+alt=")[^"]*("[^>]*class="article-hero-image)\s+is-empty(")/i,
      `$1${imageEsc}$2${titleEsc}$3$4`
    );
  }
  // Fill body content (inject after standfirst div)
  html = html.replace(
    'id="article-standfirst" style="font-size:18px; font-weight:500; line-height:1.6; margin-bottom:24px;"></div>',
    `id="article-standfirst" style="font-size:18px; font-weight:500; line-height:1.6; margin-bottom:24px;">${article.snippet ? esc(stripHtml(article.snippet).slice(0, 300)) : ""}</div>\n<div class="article-body-text" id="article-body">${bodyHtml}</div>`
  );

  return html;
}

// ── Main ──
console.log(`[SSG] Fetching from ${BACKEND}...`);

// Step 1: slug metadata (complete, all 2000+ articles)
const sitemapResp = await fetch(`${BACKEND}/api/sitemap/data`, { signal: AbortSignal.timeout(30000) });
if (!sitemapResp.ok) throw new Error(`Sitemap API: HTTP ${sitemapResp.status}`);
const sitemapData = await sitemapResp.json();
const slugEntries = sitemapData.articles.filter(a => a.slug && a.slug_year && a.slug_month).slice(0, MAX_ARTICLES);
console.log(`[SSG] ${slugEntries.length} articles with slugs (cap ${MAX_ARTICLES})`);

// Step 2: fetch full content (body/title/image) via SSG-specific endpoint (no dedupe filters)
const contentResp = await fetch(`${BACKEND}/api/news/all-for-ssg`, { signal: AbortSignal.timeout(60000) });
if (!contentResp.ok) throw new Error(`SSG API: HTTP ${contentResp.status}`);
const contentData = await contentResp.json();
const contentMap = new Map();
for (const item of (contentData.items || [])) {
  contentMap.set(item.id, item);
}
console.log(`[SSG] Content fetched for ${contentMap.size} articles (via all-for-ssg)`);

// Step 3: generate pages
let generated = 0, contentHit = 0, titleOnly = 0;
for (const entry of slugEntries) {
  const content = contentMap.get(entry.id);
  const article = content
    ? { ...content, slug: entry.slug, slug_year: entry.slug_year, slug_month: entry.slug_month }
    : { id: entry.id, title: entry.id.replace(/^ni-news-\w+-/, "").replace(/-/g, " "), slug: entry.slug, slug_year: entry.slug_year, slug_month: entry.slug_month };

  const mm = String(entry.slug_month).padStart(2, "0");
  const dir = resolve(distDir, "artikel", String(entry.slug_year), mm, entry.slug);
  mkdirSync(dir, { recursive: true });
  const canonicalUrl = `${SITE}/artikel/${entry.slug_year}/${mm}/${entry.slug}`;
  writeFileSync(resolve(dir, "index.html"), buildPage(article, canonicalUrl));
  generated++;
  if (content) contentHit++; else titleOnly++;
  if (generated % 500 === 0) console.log(`[SSG] Generated ${generated}/${slugEntries.length}...`);
}

console.log(`[SSG] Done: ${generated} pages (${contentHit} with full content, ${titleOnly} title-only)`);
