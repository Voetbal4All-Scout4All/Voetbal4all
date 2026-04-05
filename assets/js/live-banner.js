(() => {
  function init() {
    const banner = document.querySelector(".live-banner");
    if (!banner) return;

    const FLAG_SRC = {
      BE: "/assets/img/sources/flag-be.svg",
      NL: "/assets/img/sources/flag-nl.svg",
      INT: "/assets/img/sources/flag-int.svg",
      DE: "data:image/svg+xml;utf8,<?xml version='1.0' encoding='UTF-8'?><svg xmlns='http://www.w3.org/2000/svg' width='18' height='12' viewBox='0 0 18 12'><rect width='18' height='4' y='0' fill='%23000'/><rect width='18' height='4' y='4' fill='%23dd0000'/><rect width='18' height='4' y='8' fill='%23ffce00'/></svg>",
      ES: "data:image/svg+xml;utf8,<?xml version='1.0' encoding='UTF-8'?><svg xmlns='http://www.w3.org/2000/svg' width='18' height='12' viewBox='0 0 18 12'><rect width='18' height='12' fill='%23c60b1e'/><rect x='0' y='3' width='18' height='6' fill='%23ffc400'/></svg>",
      IT: "data:image/svg+xml;utf8,<?xml version='1.0' encoding='UTF-8'?><svg xmlns='http://www.w3.org/2000/svg' width='18' height='12' viewBox='0 0 18 12'><rect width='6' height='12' x='0' fill='%23009246'/><rect width='6' height='12' x='6' fill='%23ffffff'/><rect width='6' height='12' x='12' fill='%23ce2b37'/></svg>",
      FR: "data:image/svg+xml;utf8,<?xml version='1.0' encoding='UTF-8'?><svg xmlns='http://www.w3.org/2000/svg' width='18' height='12' viewBox='0 0 18 12'><rect width='6' height='12' x='0' fill='%230054a5'/><rect width='6' height='12' x='6' fill='%23ffffff'/><rect width='6' height='12' x='12' fill='%23ef4135'/></svg>",
      GB: "data:image/svg+xml;utf8,<?xml version='1.0' encoding='UTF-8'?><svg xmlns='http://www.w3.org/2000/svg' width='18' height='12' viewBox='0 0 18 12'><rect width='18' height='12' fill='%23012169'/><rect x='0' y='5' width='18' height='2' fill='%23ffffff'/><rect x='8' y='0' width='2' height='12' fill='%23ffffff'/><rect x='0' y='5.5' width='18' height='1' fill='%23c8102e'/><rect x='8.5' y='0' width='1' height='12' fill='%23c8102e'/></svg>"
    };
    const API_BASE = "https://voetbal4all-backend-database.onrender.com";
    const REFRESH_INTERVAL_MS = 3 * 60 * 1000;
    const FETCH_TIMEOUT_MS = 4000;
    const LIVE_CACHE_KEY = "v4a-live-banner-cache-v1";
    const LIVE_CACHE_TTL_MS = 90 * 1000;
    const LIVE_LEAGUES = [
      { league: "JPL", cc: "BE", label: "JPL" },
      { league: "ERED", cc: "NL", label: "Eredivisie" },
      { league: "BUND", cc: "DE", label: "Bundesliga" },
      { league: "EPL", cc: "GB", label: "Premier League" },
      { league: "SA", cc: "IT", label: "Serie A" },
      { league: "LIGA", cc: "ES", label: "La Liga" },
      { league: "L1", cc: "FR", label: "Ligue 1" },
      { league: "BEL_W", cc: "BE", label: "Super League", isWomen: true },
      { league: "NED_W", cc: "NL", label: "Eredivisie Vrouwen", isWomen: true }
    ];

    const reduceMotionQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
    let prefersReducedMotion = !!reduceMotionQuery?.matches;

    function escapeHtml(value) {
      return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function flagImg(code, sizeClass = "", decorative = false) {
      const c = String(code || "INT").trim().toUpperCase();
      const src = FLAG_SRC[c] || (c === "UK" ? FLAG_SRC.GB : FLAG_SRC.INT);
      const alt =
        c === "BE"
          ? "Belgie"
          : c === "NL"
            ? "Nederland"
            : c === "DE"
              ? "Duitsland"
              : c === "GB" || c === "UK"
                ? "Verenigd Koninkrijk"
                : c === "IT"
                  ? "Italie"
                  : c === "ES"
                    ? "Spanje"
                    : c === "FR"
                      ? "Frankrijk"
                      : "Internationaal";
      const intClass = c === "INT" ? " v4a-flag--int" : "";
      const extraClass = sizeClass ? ` ${sizeClass}` : "";
      const ariaHidden = decorative ? ' aria-hidden="true"' : "";
      const altText = decorative ? "" : alt;
      return `<span class="v4a-flag${intClass}${extraClass}"${ariaHidden}><img class="v4a-flag__img" src="${src}" alt="${altText}" loading="lazy" decoding="async" width="18" height="12" onerror="this.onerror=null;this.src='${FLAG_SRC.INT}';"></span>`;
    }

    function ensureChild(parent, selector, tagName, className) {
      let child = parent.querySelector(selector);
      if (!child) {
        child = document.createElement(tagName);
        child.className = className;
        parent.appendChild(child);
      }
      return child;
    }

    function ensureLabel() {
      let labelEl = banner.querySelector(".live-label");
      if (!labelEl) {
        labelEl = document.createElement("div");
        labelEl.className = "live-label";
      }
      const pill = ensureChild(labelEl, ".live-label-pill", "div", "live-label-pill");
      ensureChild(pill, ".live-dot", "span", "live-dot");
      const title = ensureChild(pill, ".live-label-title", "span", "live-label-title");
      title.textContent = "LIVE";
      const meta = ensureChild(labelEl, ".live-label-meta", "div", "live-label-meta");
      meta.textContent = "Voetbal4All scores";
      return { labelEl, meta };
    }

    function ensureText() {
      let textEl = banner.querySelector(".live-text");
      if (!textEl) {
        textEl = document.createElement("div");
        textEl.className = "live-text";
      }
      textEl.setAttribute("aria-live", "polite");
      textEl.querySelectorAll(".live-updated").forEach((el) => el.remove());
      const mainTextEl = ensureChild(textEl, ".live-text-main", "span", "live-text-main");
      if (!mainTextEl.textContent.trim()) {
        mainTextEl.textContent = "Live scores laden...";
      }
      const tickerWrap = ensureChild(textEl, ".live-text-ticker", "div", "live-text-ticker");
      return { textEl, mainTextEl, tickerWrap };
    }

    function ensureSocials() {
      const socialsAll = banner.querySelectorAll(".live-socials");
      socialsAll.forEach((el, index) => {
        if (index > 0) el.remove();
      });
      let socials = banner.querySelector(".live-socials");
      if (!socials) {
        socials = document.createElement("div");
        socials.className = "live-socials";
      }
      socials.setAttribute("aria-label", "Volg Voetbal4All op social media");
      const label = ensureChild(
        socials,
        ".live-socials-label",
        "div",
        "live-socials-label"
      );
      label.textContent = "Volg ons";
      const iconsWrap = ensureChild(
        socials,
        ".live-socials-icons",
        "div",
        "live-socials-icons"
      );
      iconsWrap.innerHTML = "";

      const ICON_FB = `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06C2 17.08 5.66 21.2 10.44 22v-7.03H7.9v-2.9h2.54V9.85c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.9h-2.34V22C18.34 21.2 22 17.08 22 12.06z"/>
        </svg>`;
      const ICON_IG = `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <rect x="3" y="3" width="18" height="18" rx="5" ry="5" fill="none" stroke="currentColor" stroke-width="2"/>
          <circle cx="12" cy="12" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/>
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
        </svg>`;
      const ICON_TT = `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M21 8.5a6.6 6.6 0 0 1-4.3-1.6v7.2a6.5 6.5 0 1 1-6.5-6.5c.4 0 .8 0 1.2.1v3.3a3.2 3.2 0 1 0 2 3V2h3.3a6.6 6.6 0 0 0 4.3 4.3v2.2Z"/>
        </svg>`;

      function addSocial(href, labelText, svg, cls) {
        const link = document.createElement("a");
        link.className = `live-social ${cls}`;
        link.href = href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.setAttribute("aria-label", labelText);
        link.innerHTML = svg;
        iconsWrap.appendChild(link);
      }

      addSocial(
        "https://www.facebook.com/profile.php?id=61580843623593",
        "Voetbal4All op Facebook",
        ICON_FB,
        "is-facebook"
      );
      addSocial(
        "https://www.instagram.com/voetbal4all.eu",
        "Voetbal4All op Instagram",
        ICON_IG,
        "is-instagram"
      );
      addSocial(
        "https://www.tiktok.com/@voetbal4all.eu",
        "Voetbal4All op TikTok",
        ICON_TT,
        "is-tiktok"
      );
      return socials;
    }

    const { labelEl, meta: labelMetaEl } = ensureLabel();
    const { textEl, mainTextEl, tickerWrap } = ensureText();
    const socialsEl = ensureSocials();
    [labelEl, textEl, socialsEl].forEach((node) => banner.appendChild(node));
    banner.classList.add("is-ready");
    const countryLabel = {
      BE: "Belgie",
      NL: "Nederland",
      DE: "Duitsland",
      GB: "Verenigd Koninkrijk",
      IT: "Italie",
      ES: "Spanje",
      FR: "Frankrijk"
    };

    function formatStatus(minute, status) {
      if (minute != null && String(minute).trim() !== "") {
        return `${String(minute).trim()}\u2032`;
      }
      return String(status || "Live").trim() || "Live";
    }

    function formatLeagueLabel(leagueLabel, isWomen) {
      const baseLabel = String(leagueLabel || "").trim();
      if (!isWomen || !baseLabel) return baseLabel;
      return /\bvrouwen\b/i.test(baseLabel) ? baseLabel : `${baseLabel} Vrouwen`;
    }

    function buildMatchMarkup(item) {
      if (item.type === "empty") {
        return `<span class="live-score-item is-empty"><span class="live-score-empty-text">${escapeHtml(item.label)}</span></span>`;
      }
      if (item.type === "league") {
        return `<span class="live-score-item is-league"><span class="live-score-meta"><span class="live-score-chip live-score-chip--flag" title="${escapeHtml(item.countryLabel)}">${flagImg(item.cc, "live-score-flag", true)}</span><span class="live-score-chip">${escapeHtml(formatLeagueLabel(item.leagueLabel, item.isWomen))}</span></span></span>`;
      }
      const score =
        item.hs == null || item.as == null
          ? "\u2013\u2013"
          : `${item.hs}\u2013${item.as}`;
      return `<span class="live-score-item"><span class="live-score-meta"><span class="live-score-chip live-score-chip--flag" title="${escapeHtml(item.countryLabel)}">${flagImg(item.cc, "live-score-flag", true)}</span><span class="live-score-chip">${escapeHtml(formatLeagueLabel(item.leagueLabel, item.isWomen))}</span></span><span class="live-score-game"><span class="live-score-team">${escapeHtml(item.home)}</span><span class="live-score-score">${escapeHtml(score)}</span><span class="live-score-team">${escapeHtml(item.away)}</span></span><span class="live-score-status">${escapeHtml(formatStatus(item.minute, item.status))}</span></span>`;
    }

    function buildFallbackItems() {
      return [
        { type: "empty", label: "Momenteel geen live wedstrijden" },
        ...LIVE_LEAGUES.map((league) => ({
          type: "league",
          cc: league.cc,
          countryLabel: countryLabel[league.cc] || "Internationaal",
          leagueLabel: league.label,
          isWomen: !!league.isWomen
        }))
      ];
    }

    function readCachedLiveItems() {
      try {
        const raw = window.sessionStorage.getItem(LIVE_CACHE_KEY);
        if (!raw) return null;
        const cached = JSON.parse(raw);
        if (!cached || !Array.isArray(cached.items)) return null;
        if (Date.now() - Number(cached.savedAt || 0) > LIVE_CACHE_TTL_MS) return null;
        return hasLiveMatches(cached.items) ? cached.items : null;
      } catch (_error) {
        return null;
      }
    }

    function writeCachedLiveItems(items) {
      if (!hasLiveMatches(items)) return;
      try {
        window.sessionStorage.setItem(
          LIVE_CACHE_KEY,
          JSON.stringify({
            savedAt: Date.now(),
            items
          })
        );
      } catch (_error) {
        // Ignore storage failures; the banner can still run live-only.
      }
    }

    function clearCachedLiveItems() {
      try {
        window.sessionStorage.removeItem(LIVE_CACHE_KEY);
      } catch (_error) {
        // Ignore storage failures.
      }
    }

    async function fetchJsonWithTimeout(url, timeoutMs = FETCH_TIMEOUT_MS) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(url, {
          signal: controller.signal,
          cache: "no-store"
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } finally {
        clearTimeout(timeout);
      }
    }

    function normalizeLiveItems(request, data) {
      const matches = [];
      for (const match of Array.isArray(data?.items) ? data.items : []) {
        const home = String(match?.homeTeam || "").trim();
        const away = String(match?.awayTeam || "").trim();
        if (!home || !away) continue;
        matches.push({
          type: "match",
          cc: request.cc,
          countryLabel: countryLabel[request.cc] || "Internationaal",
          leagueLabel: request.label,
          isWomen: !!request.isWomen,
          home,
          away,
          hs: match?.homeScore ?? null,
          as: match?.awayScore ?? null,
          minute: match?.minute ?? null,
          status: match?.status ?? null
        });
      }
      return matches;
    }

    async function fetchFreeLiveItems(options = {}) {
      const { onPartialItems } = options;
      const requests = LIVE_LEAGUES.map((league) => ({
        ...league,
        url: `${API_BASE}/api/live-scores?league=${encodeURIComponent(league.league)}`
      }));

      const matchesByLeague = new Array(requests.length).fill(null);
      let partialSent = false;
      let successfulResponses = 0;

      await Promise.allSettled(
        requests.map(async (request, index) => {
          try {
            const data = await fetchJsonWithTimeout(request.url);
            successfulResponses += 1;
            matchesByLeague[index] = normalizeLiveItems(request, data);
            if (!partialSent && matchesByLeague[index].length) {
              partialSent = true;
              onPartialItems?.(matchesByLeague.flat().filter(Boolean));
            }
          } catch (_error) {
            matchesByLeague[index] = [];
          }
        })
      );

      return {
        items: matchesByLeague.flat().filter(Boolean),
        successfulResponses
      };
    }

    let lastItems = buildFallbackItems();
    let lastSignature = "";
    let refreshSeq = 0;

    function hasLiveMatches(items) {
      return Array.isArray(items) && items.some((item) => item.type === "match");
    }

    function getItemsSignature(items) {
      return JSON.stringify(items || []);
    }

    function updateBannerMeta(items) {
      const liveCount = items.filter((item) => item.type === "match").length;
      banner.classList.toggle("is-empty", liveCount === 0);
      labelMetaEl.textContent = "Voetbal4All scores";
      mainTextEl.textContent =
        liveCount > 0
          ? `${liveCount} live${liveCount === 1 ? " wedstrijd" : " wedstrijden"}`
          : "Momenteel geen live wedstrijden";
    }

    function renderRail(items, options = {}) {
      const { force = false } = options;
      if (!Array.isArray(items) || !items.length) return false;
      const signature = getItemsSignature(items);
      if (!force && signature === lastSignature) return false;
      lastSignature = signature;
      lastItems = items;
      updateBannerMeta(items);
      tickerWrap.classList.remove("is-scrollable");
      tickerWrap.innerHTML = '<div class="marquee-track"></div>';
      const track = tickerWrap.querySelector(".marquee-track");
      const segmentMarkup = items
        .map(buildMatchMarkup)
        .join('<span class="live-rail-separator" aria-hidden="true"></span>');
      track.innerHTML = `<span class="marquee-segment">${segmentMarkup}</span>`;

      requestAnimationFrame(() => {
        const containerWidth = tickerWrap.clientWidth || 0;
        const segment = track.querySelector(".marquee-segment");
        const segmentWidth = segment?.scrollWidth || 0;
        if (!containerWidth || !segmentWidth) {
          track.classList.add("is-static");
          return;
        }

        const overflow = segmentWidth > containerWidth + 12;
        if (!overflow || prefersReducedMotion) {
          track.classList.add("is-static");
          if (prefersReducedMotion && overflow) {
            tickerWrap.classList.add("is-scrollable");
          }
          return;
        }

        const loopSeparator = document.createElement("span");
        loopSeparator.className = "live-rail-separator live-rail-separator--loop";
        loopSeparator.setAttribute("aria-hidden", "true");
        const clone = segment.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        track.append(loopSeparator, clone);

        requestAnimationFrame(() => {
          if (!track.isConnected) return;
          const loopDistance = clone.offsetLeft || segmentWidth;
          const socialsWidth = Math.round(socialsEl.getBoundingClientRect().width || 0);
          const entryOffset = Math.max(8, Math.min(18, Math.round((socialsWidth || 0) * 0.08)));
          const startX = containerWidth + entryOffset;
          const endX = startX - loopDistance;
          const durationSec = Math.max(26, Math.min(34, loopDistance / 42));

          track.style.setProperty("--live-marquee-start", `${startX}px`);
          track.style.setProperty("--live-marquee-end", `${endX}px`);
          track.style.setProperty("--live-marquee-duration", `${durationSec}s`);
          track.classList.remove("is-static", "is-animated");
          void track.offsetWidth;
          track.classList.add("is-animated");
        });
      });
      return true;
    }

    function renderFallback() {
      renderRail(buildFallbackItems());
    }

    async function refresh() {
      const currentSeq = ++refreshSeq;
      try {
        const canQuickSwap = !hasLiveMatches(lastItems);
        const result = await fetchFreeLiveItems({
          onPartialItems(partialItems) {
            if (currentSeq !== refreshSeq || !canQuickSwap || !partialItems.length) return;
            writeCachedLiveItems(partialItems);
            renderRail(partialItems);
          }
        });
        if (currentSeq !== refreshSeq) return;
        const { items: liveItems, successfulResponses } = result;
        if (!liveItems.length) {
          if (successfulResponses === 0 && hasLiveMatches(lastItems)) return;
          clearCachedLiveItems();
          renderFallback();
          return;
        }
        writeCachedLiveItems(liveItems);
        renderRail(liveItems);
      } catch (error) {
        console.warn("Live banner fout:", error);
        if (hasLiveMatches(lastItems)) return;
        renderFallback();
      }
    }

    if (reduceMotionQuery) {
      const onMotionChange = (event) => {
        prefersReducedMotion = !!event.matches;
        renderRail(lastItems, { force: true });
      };
      if (typeof reduceMotionQuery.addEventListener === "function") {
        reduceMotionQuery.addEventListener("change", onMotionChange);
      } else if (typeof reduceMotionQuery.addListener === "function") {
        reduceMotionQuery.addListener(onMotionChange);
      }
    }

    const cachedItems = readCachedLiveItems();
    if (cachedItems?.length) {
      renderRail(cachedItems);
    } else {
      renderFallback();
    }
    refresh();
    window.setInterval(refresh, REFRESH_INTERVAL_MS);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
