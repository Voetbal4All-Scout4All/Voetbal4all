// assets/js/ads-guard.js — Suppress ad/analytics loading for bots + test/admin traffic.
// Bot detection: prevents AdSense impressions + GA4 hits from known crawlers.
// Querystring: ?noads=1 sets localStorage flag + strips param; ?noads=0 clears it.
// When flag active or bot detected: removes adsbygoogle/GA4 scripts, stubs push().
(function () {
  // ── Bot detection (runs first, before any ad/analytics code) ──
  var BOT_PATTERNS = [
    // Social crawlers (link-preview bots)
    "facebookexternalhit", "facebot",
    "twitterbot", "linkedinbot",
    "whatsapp", "telegrambot",
    "slackbot", "discordbot",
    "pinterestbot", "redditbot",
    // Search engine bots (suppress ads, NOT indexing)
    "googlebot", "bingbot", "yandexbot", "baiduspider",
    "duckduckbot", "applebot",
    // AI crawlers
    "gptbot", "chatgpt-user", "claudebot", "anthropic-ai",
    "perplexitybot", "bytespider", "ccbot",
    // Generic bot indicators
    "bot/", "spider", "crawl", "headlesschrome", "phantomjs", "puppeteer"
  ];
  var ua = (navigator.userAgent || "").toLowerCase();
  var isBot = BOT_PATTERNS.some(function (p) { return ua.indexOf(p) !== -1; });

  // ── ?noads=1 / ?noads=0 toggle (admin/test) ──
  var params = new URLSearchParams(window.location.search);
  if (params.get('noads') === '1') {
    localStorage.setItem('v4a_ads_off', '1');
    params.delete('noads');
    var clean = window.location.pathname + (params.toString() ? '?' + params.toString() : '') + window.location.hash;
    window.history.replaceState(null, '', clean);
  } else if (params.get('noads') === '0') {
    localStorage.removeItem('v4a_ads_off');
    params.delete('noads');
    var clean = window.location.pathname + (params.toString() ? '?' + params.toString() : '') + window.location.hash;
    window.history.replaceState(null, '', clean);
  }

  var suppress = isBot || localStorage.getItem('v4a_ads_off') === '1';

  if (suppress) {
    // Stub AdSense: silently swallow push() calls → no ad impressions
    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.push = function () { return 0; };

    // Stub GA4: prevent dataLayer events + gtag calls → no analytics hits
    if (isBot) {
      window.dataLayer = [];
      window.dataLayer.push = function () { return 0; };
      window.gtag = function () {};
    }

    // Remove ad/analytics script tags + hide ad containers on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', function () {
      var scripts = document.querySelectorAll(
        'script[src*="adsbygoogle"],' +
        'script[src*="pagead2.googlesyndication.com"]' +
        (isBot ? ',script[src*="googletagmanager.com/gtag"],script[src*="fundingchoicesmessages.google.com"]' : '')
      );
      for (var i = 0; i < scripts.length; i++) scripts[i].remove();
      var ads = document.querySelectorAll('ins.adsbygoogle, .ad-slot, .ad-infeed, .v4a-ad-sidebar, .v4a-ad-bottom, .v4-ad-sticky');
      for (var j = 0; j < ads.length; j++) ads[j].style.display = 'none';
    });

    if (isBot) window.__V4A_BOT_DETECTED = true;
  }
})();
