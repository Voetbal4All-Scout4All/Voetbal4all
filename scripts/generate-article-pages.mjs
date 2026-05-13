#!/usr/bin/env node
// generate-article-pages.mjs — SSG: generate static HTML for every article at /artikel/{year}/{month}/{slug}/index.html
// Usage: node scripts/generate-article-pages.mjs
// Requires: backend sitemap API + news API running
import { writeFileSync, mkdirSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const distDir = resolve(root, "dist");

const BACKEND = process.env.SITEMAP_BACKEND_URL || "https://voetbal4all-backend-database.onrender.com";
const SITE = "https://www.voetbal4all.eu";
const BATCH_SIZE = 50;

function esc(s) { return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

function truncate(s, max) {
  const t = String(s || "").replace(/\s+/g, " ").trim();
  return t.length <= max ? t : t.slice(0, max - 3) + "...";
}

function resolveImage(img) {
  if (!img) return `${SITE}/assets/img/placeholder.svg`;
  const s = String(img).trim();
  if (s.startsWith("http")) return s;
  return `${BACKEND}${s.startsWith("/") ? s : "/" + s}`;
}

function stripHtml(html) { return String(html || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim(); }

function buildPage(article, canonicalUrl) {
  const title = esc(article.title || "Voetbalnieuws");
  const desc = esc(truncate(stripHtml(article.snippet || article.body), 160));
  const image = esc(resolveImage(article.image || article.image_path));
  const pubDate = article.publishedAt || article.published_at || article.createdAt || article.created_at || "";
  const modDate = pubDate; // news_items has no modified_at, use published_at
  const bodyHtml = article.body || article.snippet || "";
  const country = String(article.country || article.countryCode || "").toUpperCase();

  // Read the template (base HTML structure from artikel.html)
  // We generate a minimal but complete SEO-optimized page
  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${title} | Voetbal4All</title>
<meta name="description" content="${desc}"/>
<link rel="canonical" href="${esc(canonicalUrl)}"/>

<!-- Open Graph -->
<meta property="og:title" content="${title}"/>
<meta property="og:description" content="${desc}"/>
<meta property="og:image" content="${image}"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:type" content="article"/>
<meta property="og:url" content="${esc(canonicalUrl)}"/>
<meta property="og:site_name" content="Voetbal4All"/>
<meta property="article:published_time" content="${esc(pubDate)}"/>
<meta property="article:modified_time" content="${esc(modDate)}"/>

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${title}"/>
<meta name="twitter:description" content="${desc}"/>
<meta name="twitter:image" content="${image}"/>

<!-- Favicons -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="shortcut icon" href="/favicon.ico">
<link rel="apple-touch-icon" sizes="180x180" href="/favicon-180x180.png">
<meta name="theme-color" content="#0B1020">

<!-- AdSense -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4062633211824348" crossorigin="anonymous"></script>

<!-- GA4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-8H0LDE2SMS"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-8H0LDE2SMS');</script>

<!-- NewsArticle JSON-LD -->
<script type="application/ld+json">
${JSON.stringify({
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "mainEntityOfPage": { "@type": "WebPage", "@id": canonicalUrl },
  "headline": article.title || "Voetbalnieuws",
  "description": stripHtml(article.snippet || "").slice(0, 160),
  "image": [resolveImage(article.image || article.image_path)],
  "datePublished": pubDate,
  "dateModified": modDate,
  "author": { "@type": "Organization", "name": "Voetbal4All" },
  "publisher": {
    "@type": "Organization",
    "name": "Voetbal4All",
    "logo": { "@type": "ImageObject", "url": `${SITE}/assets/img/brand/logo-voetbal4all.png` }
  }
})}
</script>

<link rel="stylesheet" href="/style.css"/>
</head>
<body class="article-page">

<header>
  <nav>
    <a href="/" class="logo-link">
      <img src="/assets/img/brand/logo-voetbal4all.png" alt="Voetbal4All" width="120" height="40" loading="eager"/>
    </a>
    <a href="/artikels.html">Nieuws</a>
    <a href="/events.html">Events</a>
    <a href="/clubvacatures.html">Vacatures</a>
  </nav>
</header>

<main>
  <article>
    <h1>${title}</h1>
    ${image !== esc(`${SITE}/assets/img/placeholder.svg`) ? `<figure><img src="${image}" alt="${title}" loading="eager" width="1200" height="630" style="width:100%;height:auto;border-radius:8px;"/></figure>` : ""}
    <div class="article-body">
      ${bodyHtml}
    </div>
    <footer class="article-meta">
      <time datetime="${esc(pubDate)}">${pubDate ? new Date(pubDate).toLocaleDateString("nl-BE", { day: "numeric", month: "long", year: "numeric" }) : ""}</time>
      ${country ? `<span class="country-badge">${esc(country)}</span>` : ""}
    </footer>
  </article>
</main>

<footer>
  <p>&copy; ${new Date().getFullYear()} Voetbal4All — <a href="/contact.html">Contact</a></p>
</footer>

<!-- Client-side hydration: load full interactive artikel.html experience -->
<script>
  // Redirect to full interactive page if JS is available and user wants interactivity
  // This page is SEO-optimized static HTML; the interactive version adds comments, related articles, etc.
</script>
</body>
</html>`;
}

// ── Main ──
console.log(`[SSG] Fetching data from ${BACKEND}...`);

// Step 1: Fetch slug metadata from sitemap API (has correct slug/year/month)
const sitemapResp = await fetch(`${BACKEND}/api/sitemap/data`, { signal: AbortSignal.timeout(30000) });
if (!sitemapResp.ok) throw new Error(`Sitemap API error: HTTP ${sitemapResp.status}`);
const sitemapData = await sitemapResp.json();
const slugMap = new Map();
for (const a of sitemapData.articles) {
  if (a.slug && a.slug_year && a.slug_month) slugMap.set(a.id, a);
}
console.log(`[SSG] Sitemap: ${slugMap.size} articles with slugs`);

// Step 2: Fetch full article data in batches (for body/title/image)
let allArticles = [];
let offset = 0;
while (true) {
  const resp = await fetch(`${BACKEND}/api/news?limit=100&offset=${offset}&nocache=${Date.now()}`, {
    signal: AbortSignal.timeout(60000),
  });
  if (!resp.ok) throw new Error(`News API error: HTTP ${resp.status}`);
  const data = await resp.json();
  const items = data.items || [];
  if (!items.length) break;
  allArticles.push(...items);
  offset += items.length;
  if (items.length < 100) break;
  if (allArticles.length % 500 === 0) console.log(`[SSG] Fetched ${allArticles.length} articles...`);
}
console.log(`[SSG] Total articles fetched: ${allArticles.length}`);

// Merge: use slug data from sitemap, content from news API
const withSlug = allArticles.filter(a => slugMap.has(a.id)).map(a => {
  const sm = slugMap.get(a.id);
  return { ...a, slug: sm.slug, slug_year: sm.slug_year, slug_month: sm.slug_month };
});
console.log(`[SSG] Articles with slugs: ${withSlug.length}`);

let generated = 0;
for (const article of withSlug) {
  const year = article.slug_year || new Date(article.publishedAt || article.published_at || article.createdAt).getFullYear();
  const month = article.slug_month || (new Date(article.publishedAt || article.published_at || article.createdAt).getMonth() + 1);
  const mm = String(month).padStart(2, "0");
  const slug = article.slug;

  const dir = resolve(distDir, "artikel", String(year), mm, slug);
  mkdirSync(dir, { recursive: true });

  const canonicalUrl = `${SITE}/artikel/${year}/${mm}/${slug}`;
  const html = buildPage(article, canonicalUrl);
  writeFileSync(resolve(dir, "index.html"), html);
  generated++;
}

console.log(`[SSG] Generated ${generated} article pages in dist/artikel/`);
console.log(`[SSG] Done.`);
