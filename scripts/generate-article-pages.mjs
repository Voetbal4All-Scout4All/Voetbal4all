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
const ARTICLE_IMAGE_OVERRIDES = new Map([
]);

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
  const image = ARTICLE_IMAGE_OVERRIDES.get(String(article.id || "")) || resolveImage(article.image || article.image_path);
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
    "author": {
      "@type": "Organization",
      "name": "Voetbal4All Redactie",
      "url": `${SITE}/over-ons.html`,
      "logo": { "@type": "ImageObject", "url": publisherLogo, "width": 256, "height": 256 },
      "sameAs": ["https://www.facebook.com/voetbal4all", "https://www.instagram.com/voetbal4all.eu", "https://www.threads.com/@voetbal4all.eu", "https://www.tiktok.com/@voetbal4all"],
    },
    "publisher": {
      "@type": "Organization",
      "name": "Voetbal4All Redactie",
      "url": `${SITE}/over-ons.html`,
      "logo": { "@type": "ImageObject", "url": publisherLogo, "width": 256, "height": 256 },
      "sameAs": ["https://www.facebook.com/voetbal4all", "https://www.instagram.com/voetbal4all.eu", "https://www.threads.com/@voetbal4all.eu", "https://www.tiktok.com/@voetbal4all"],
    },
  });

  // BreadcrumbList JSON-LD (helps Google understand site hierarchy for articles)
  const breadcrumbLd = JSON.stringify({
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": `${SITE}/` },
      { "@type": "ListItem", "position": 2, "name": "Artikels", "item": `${SITE}/artikels.html` },
      { "@type": "ListItem", "position": 3, "name": title, "item": canonicalUrl },
    ],
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
    // SSG: article content is pre-rendered. Show content + init AdSense.
    document.addEventListener("DOMContentLoaded", function() {
      var c = document.getElementById("article-content");
      if (c) c.style.display = "block";
      var n = document.getElementById("article-not-found");
      if (n) n.style.display = "none";
      // Init all AdSense slots (push() calls were in the removed loader script)
      var slots = document.querySelectorAll("ins.adsbygoogle");
      for (var i = 0; i < slots.length; i++) {
        try { (adsbygoogle = window.adsbygoogle || []).push({}); }
        catch (e) { /* slot init failed, non-blocking */ }
      }
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
    `<script id="article-jsonld" type="application/ld+json">${jsonLd}</script>\n  <script id="breadcrumb-ld" type="application/ld+json">${breadcrumbLd}</script>`);
  // Hero-image preload hint (early discovery for LCP element)
  if (image && !image.includes("placeholder.svg")) {
    html = html.replace("</head>", `  <link rel="preload" as="image" href="${esc(image)}" fetchpriority="high">\n</head>`);
  }

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
  // Fill byline caption (replaces "Voetbal4All · Nieuws")
  const rawSource = String(article.source || "").trim();
  const authorByline = rawSource === "opinion-team-4all-ventures" ? "4All Ventures opinieteam" : "Voetbal4All Redactie";
  const titleLower = String(title).toLowerCase();
  const categorie = /\bvrouwen\b|\bdames\b|\bvrouw\b/i.test(titleLower) ? "Vrouwenvoetbal"
    : /\bu1[579]\b|\bjeugd\b|\bbeloften\b/i.test(titleLower) ? "Jeugdvoetbal"
    : country === "BE" ? "Belgisch voetbal"
    : country === "NL" ? "Nederlands voetbal"
    : country === "INT" ? "Internationaal"
    : "Voetbalnieuws";
  const bylineHtml = `Door <a href="/over-ons.html" rel="author">${esc(authorByline)}</a>` +
    (dateFormatted ? ` · ${esc(dateFormatted)}` : "") +
    ` · ${esc(categorie)}`;
  html = html.replace('>Voetbal4All · Nieuws</div>', `>${bylineHtml}</div>`);
  // Fill country badge
  if (country) html = html.replace('id="article-country"></span>', `id="article-country">${esc(country)}</span>`);
  // Date is now in byline caption — leave article-date empty to avoid duplicate
  html = html.replace('id="article-date"></span>', 'id="article-date"></span>');
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
  // Fill sidebar with related articles (Lees ook)
  const sidebarRelated = buildSidebarRelated(article.id || "", country);
  html = html.replace(/id="sidebar-lees-ook"[^>]*>\s*<!--[^>]*-->\s*<\/article>/, `id="sidebar-lees-ook" style="margin-top:12px;">${sidebarRelated}</article>`);

  // ── Share buttons: fill hrefs statically (the loader script that did this client-side is stripped) ──
  const articleId = article.id || "";
  const shareUrl = articleId
    ? `https://www.voetbal4all.eu/share/article/${encodeURIComponent(articleId)}/`
    : canonicalUrl;
  const encUrl = encodeURIComponent(shareUrl);
  const encTitle = encodeURIComponent(title);
  html = html.replace(/(<a\s+href=")[^"]*("\s+id="share-facebook")/i, `$1https://www.facebook.com/dialog/feed?app_id=1613462893224189&amp;display=popup&amp;link=${encUrl}&amp;redirect_uri=${encUrl}$2`);
  html = html.replace(/(<a\s+href=")[^"]*("\s+id="share-x")/i, `$1https://x.com/intent/post?url=${encUrl}&amp;text=${encTitle}$2`);
  html = html.replace(/(<a\s+href=")[^"]*("\s+id="share-whatsapp")/i, `$1https://wa.me/?text=${encTitle}%20${encUrl}$2`);
  html = html.replace(/(<a\s+href=")[^"]*("\s+id="share-linkedin")/i, `$1https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}$2`);

  // ── Inject small share-utility script (clipboard + Instagram) — separate from the stripped loader ──
  html = html.replace("</body>",
    `<script>
// SSG share utilities (clipboard + Instagram)
(function(){
  var url = ${JSON.stringify(shareUrl)};
  var copyBtn = document.getElementById("share-copy");
  var copyText = document.getElementById("copy-text");
  if (copyBtn && copyText) {
    copyBtn.addEventListener("click", function(){
      navigator.clipboard.writeText(url).then(function(){
        copyText.textContent = "\\u2713 Gekopieerd!";
        setTimeout(function(){ copyText.textContent = "Kopieer link"; }, 2000);
      }).catch(function(){ if(window.V4AFeedback) window.V4AFeedback.toast("Kon link niet kopi\\u00EBren.", {tone:"warning"}); });
    });
  }
  var igBtn = document.getElementById("share-instagram");
  if (igBtn) {
    igBtn.addEventListener("click", function(){
      navigator.clipboard.writeText(url).then(function(){
        igBtn.textContent = "Link gekopieerd!";
        setTimeout(function(){ igBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> Instagram'; }, 2000);
      });
    });
  }
})();
</script>\n</body>`);

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

// Step 2b: build related-articles pool (once, sorted by recency)
const relatedPool = slugEntries
  .map(e => {
    const c = contentMap.get(e.id);
    if (!c || !c.title) return null;
    const mm = String(e.slug_month).padStart(2, "0");
    const pubRaw = c.publishedAt || c.published_at || c.createdAt || c.created_at || "";
    return {
      id: e.id,
      title: c.title,
      country: String(c.country || c.countryCode || "").toUpperCase(),
      pubMs: pubRaw ? new Date(pubRaw).getTime() || 0 : 0,
      image: resolveImage(c.image || c.image_path),
      url: `${SITE}/artikel/${e.slug_year}/${mm}/${encodeURIComponent(e.slug)}/`,
    };
  })
  .filter(Boolean)
  .sort((a, b) => b.pubMs - a.pubMs);
console.log(`[SSG] Related pool: ${relatedPool.length} articles`);

const PLACEHOLDER_THUMB = `${SITE}/assets/img/placeholder.svg`;

function buildRelated(currentId, currentCountry) {
  try {
    const candidates = relatedPool.filter(a => a.id !== currentId);
    if (candidates.length === 0) return "";
    // Score: same country +10, keep date-desc as tiebreak (stable sort)
    const scored = candidates.map(a => ({ ...a, _score: (currentCountry && a.country === currentCountry) ? 10 : 0 }));
    scored.sort((a, b) => b._score - a._score || b.pubMs - a.pubMs);
    const picks = scored.slice(0, 5);
    let html = '\n<section id="v4-related-articles" style="margin-top:32px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.1);">';
    html += '\n  <h3 style="font-family:Montserrat,sans-serif;font-size:16px;font-weight:700;color:rgba(255,255,255,0.9);margin:0 0 16px;">Lees ook</h3>';
    for (const a of picks) {
      const t = esc(a.title);
      const img = esc(a.image || PLACEHOLDER_THUMB);
      const href = esc(a.url);
      html += `\n  <article style="display:flex;gap:12px;align-items:flex-start;margin-bottom:12px;">`;
      html += `<a href="${href}" style="flex-shrink:0;"><img src="${img}" alt="${t}" width="96" height="64" loading="lazy" decoding="async" referrerpolicy="no-referrer" style="width:96px;height:64px;object-fit:cover;border-radius:10px;" onerror="this.onerror=null;this.src='${esc(PLACEHOLDER_THUMB)}';"></a>`;
      html += `<a href="${href}" style="color:inherit;text-decoration:none;font-family:Montserrat,sans-serif;font-size:14px;font-weight:600;line-height:1.3;min-width:0;">${t}</a>`;
      html += `</article>`;
    }
    html += '\n</section>';
    return html;
  } catch (_) {
    return "";
  }
}

function buildSidebarRelated(currentId, currentCountry) {
  try {
    const candidates = relatedPool.filter(a => a.id !== currentId);
    if (candidates.length === 0) return "";
    const scored = candidates.map(a => ({ ...a, _score: (currentCountry && a.country === currentCountry) ? 10 : 0 }));
    scored.sort((a, b) => b._score - a._score || b.pubMs - a.pubMs);
    const picks = scored.slice(0, 5);
    let html = '\n<h3>Lees ook</h3>';
    for (const a of picks) {
      const t = esc(a.title);
      const img = esc(a.image || PLACEHOLDER_THUMB);
      const href = esc(a.url);
      html += `\n<a href="${href}" class="lees-ook-item">`;
      html += `<img src="${img}" alt="${t}" width="64" height="48" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='${esc(PLACEHOLDER_THUMB)}';">`;
      html += `<span class="lees-ook-item-title">${t}</span>`;
      html += `</a>`;
    }
    return html;
  } catch (_) {
    return "";
  }
}

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
  const canonicalUrl = `${SITE}/artikel/${entry.slug_year}/${mm}/${entry.slug}/`;
  writeFileSync(resolve(dir, "index.html"), buildPage(article, canonicalUrl));
  generated++;
  if (content) contentHit++; else titleOnly++;
  if (generated % 500 === 0) console.log(`[SSG] Generated ${generated}/${slugEntries.length}...`);
}

console.log(`[SSG] Done: ${generated} pages (${contentHit} with full content, ${titleOnly} title-only)`);
