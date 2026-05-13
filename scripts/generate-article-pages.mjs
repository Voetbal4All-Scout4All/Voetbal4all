#!/usr/bin/env node
// generate-article-pages.mjs — SSG: generate static HTML for every article at /artikel/{year}/{month}/{slug}/index.html
// Uses sitemap API for slug metadata + news API for content (body/title/image).
// Articles not in news API get a minimal title-only page.
import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, "..", "dist");

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

function buildPage(article, canonicalUrl) {
  const title = esc(article.title || "Voetbalnieuws");
  const desc = esc(truncate(stripHtml(article.snippet || article.body), 160));
  const image = esc(resolveImage(article.image || article.image_path));
  const pubDate = article.publishedAt || article.published_at || article.createdAt || article.created_at || "";
  const bodyHtml = article.body || article.snippet || `<p>${title}</p>`;
  const country = String(article.country || article.countryCode || "").toUpperCase();
  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${title} | Voetbal4All</title>
<meta name="description" content="${desc}"/>
<link rel="canonical" href="${esc(canonicalUrl)}"/>
<meta property="og:title" content="${title}"/><meta property="og:description" content="${desc}"/>
<meta property="og:image" content="${image}"/><meta property="og:image:width" content="1200"/><meta property="og:image:height" content="630"/>
<meta property="og:type" content="article"/><meta property="og:url" content="${esc(canonicalUrl)}"/>
<meta property="og:site_name" content="Voetbal4All"/>
<meta property="article:published_time" content="${esc(pubDate)}"/>
<meta name="twitter:card" content="summary_large_image"/><meta name="twitter:title" content="${title}"/>
<meta name="twitter:description" content="${desc}"/><meta name="twitter:image" content="${image}"/>
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="shortcut icon" href="/favicon.ico">
<meta name="theme-color" content="#0B1020">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4062633211824348" crossorigin="anonymous"></script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-8H0LDE2SMS"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-8H0LDE2SMS');</script>
<script type="application/ld+json">${JSON.stringify({
  "@context":"https://schema.org","@type":"NewsArticle",
  "mainEntityOfPage":{"@type":"WebPage","@id":canonicalUrl},
  "headline":article.title||"Voetbalnieuws",
  "description":stripHtml(article.snippet||"").slice(0,160),
  "image":[resolveImage(article.image||article.image_path)],
  "datePublished":pubDate,
  "author":{"@type":"Organization","name":"Voetbal4All"},
  "publisher":{"@type":"Organization","name":"Voetbal4All","logo":{"@type":"ImageObject","url":SITE+"/assets/img/brand/logo-voetbal4all.png"}}
})}</script>
<link rel="stylesheet" href="/style.css"/>
</head>
<body class="article-page">
<header><nav>
<a href="/" class="logo-link"><img src="/assets/img/brand/logo-voetbal4all.png" alt="Voetbal4All" width="120" height="40" loading="eager"/></a>
<a href="/artikels.html">Nieuws</a><a href="/events.html">Events</a><a href="/clubvacatures.html">Vacatures</a>
</nav></header>
<main><article>
<h1>${title}</h1>
${image !== esc(`${SITE}/assets/img/placeholder.svg`) ? `<figure><img src="${image}" alt="${title}" loading="eager" width="1200" height="630" style="width:100%;height:auto;border-radius:8px;"/></figure>` : ""}
<div class="article-body">${bodyHtml}</div>
<footer class="article-meta">
<time datetime="${esc(pubDate)}">${pubDate ? new Date(pubDate).toLocaleDateString("nl-BE",{day:"numeric",month:"long",year:"numeric"}) : ""}</time>
${country ? `<span class="country-badge">${esc(country)}</span>` : ""}
</footer>
</article></main>
<footer><p>&copy; ${new Date().getFullYear()} Voetbal4All — <a href="/contact.html">Contact</a></p></footer>
</body></html>`;
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
