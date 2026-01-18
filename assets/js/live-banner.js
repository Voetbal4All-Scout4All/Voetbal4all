(() => {
  function init() {
    const banner = document.querySelector(".live-banner");
    if (!banner) return;

    const textEl = banner.querySelector(".live-text");
    const labelEl = banner.querySelector(".live-label");
    if (!textEl || !labelEl) return;

    /* =========================================================
       Flags (single source of truth)
       - Always use local SVG files from assets/img/sources/
       - Avoid emoji flags (OS-dependent) and inline SVG variations
    ========================================================= */
    const FLAG_SRC = {
      // Local (existing)
      BE: "/assets/img/sources/flag-be.svg",
      NL: "/assets/img/sources/flag-nl.svg",
      INT: "/assets/img/sources/flag-int.svg",

      // Inline SVG fallbacks (no extra files needed)
      DE: "data:image/svg+xml;utf8,<?xml version='1.0' encoding='UTF-8'?><svg xmlns='http://www.w3.org/2000/svg' width='18' height='12' viewBox='0 0 18 12'><rect width='18' height='4' y='0' fill='%23000'/><rect width='18' height='4' y='4' fill='%23dd0000'/><rect width='18' height='4' y='8' fill='%23ffce00'/></svg>",
      ES: "data:image/svg+xml;utf8,<?xml version='1.0' encoding='UTF-8'?><svg xmlns='http://www.w3.org/2000/svg' width='18' height='12' viewBox='0 0 18 12'><rect width='18' height='12' fill='%23c60b1e'/><rect x='0' y='3' width='18' height='6' fill='%23ffc400'/></svg>",
      IT: "data:image/svg+xml;utf8,<?xml version='1.0' encoding='UTF-8'?><svg xmlns='http://www.w3.org/2000/svg' width='18' height='12' viewBox='0 0 18 12'><rect width='6' height='12' x='0' fill='%23009246'/><rect width='6' height='12' x='6' fill='%23ffffff'/><rect width='6' height='12' x='12' fill='%23ce2b37'/></svg>",
      FR: "data:image/svg+xml;utf8,<?xml version='1.0' encoding='UTF-8'?><svg xmlns='http://www.w3.org/2000/svg' width='18' height='12' viewBox='0 0 18 12'><rect width='6' height='12' x='0' fill='%230054a5'/><rect width='6' height='12' x='6' fill='%23ffffff'/><rect width='6' height='12' x='12' fill='%23ef4135'/></svg>",
      GB: "data:image/svg+xml;utf8,<?xml version='1.0' encoding='UTF-8'?><svg xmlns='http://www.w3.org/2000/svg' width='18' height='12' viewBox='0 0 18 12'><rect width='18' height='12' fill='%23012169'/><rect x='0' y='5' width='18' height='2' fill='%23ffffff'/><rect x='8' y='0' width='2' height='12' fill='%23ffffff'/><rect x='0' y='5.5' width='18' height='1' fill='%23c8102e'/><rect x='8.5' y='0' width='1' height='12' fill='%23c8102e'/></svg>"
    };

    function flagImg(code, sizeClass = "") {
      const c = String(code || "INT").trim().toUpperCase();
      const src = FLAG_SRC[c] || (c === "UK" ? FLAG_SRC.GB : FLAG_SRC.INT);
      const alt =
        (c === "BE") ? "België" :
        (c === "NL") ? "Nederland" :
        (c === "DE") ? "Duitsland" :
        (c === "GB" || c === "UK") ? "Verenigd Koninkrijk" :
        (c === "IT") ? "Italië" :
        (c === "ES") ? "Spanje" :
        (c === "FR") ? "Frankrijk" :
        "Internationaal";
      const intCls = (c === "INT") ? " v4a-flag--int" : "";
      const extra = sizeClass ? ` ${sizeClass}` : "";
      return `<span class="v4a-flag${intCls}${extra}">
  <img class="v4a-flag__img"
       src="${src}"
       alt="${alt}"
       loading="lazy"
       decoding="async"
       width="18"
       height="12"
       onerror="this.onerror=null;this.src='${FLAG_SRC.INT}';">
</span>`;
    }

    /* =========================================================
       0) Opruimen: verwijder ALLE oude/dubbele elementen
          - live-updated badge wordt volledig verwijderd (geen rode knop/badge)
          - socials mogen enkel één keer bestaan
    ========================================================= */
    // Verwijder ALLE live-updated badges (user request: geen rode knop/badge)
    banner.querySelectorAll(".live-updated").forEach((el) => el.remove());

    // Verwijder dubbele socials containers (houd de eerste)
    const socialsAll = banner.querySelectorAll(".live-socials");
    socialsAll.forEach((el, idx) => {
      if (idx > 0) el.remove();
    });

    /* =========================================================
       1) LIVE RESULTATEN terug op 2 regels (zonder HTML aan te passen)
          + Zorg dat dot naast tekst staat (niet erboven)
    ========================================================= */
    if (!labelEl.dataset.stacked) {
      const rawText = Array.from(labelEl.childNodes)
        .filter(
          (n) =>
            !(
              n.nodeType === 1 &&
              n.classList &&
              n.classList.contains("live-dot")
            )
        )
        .map((n) => n.textContent || "")
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      // reset label volledig
      labelEl.innerHTML = "";

      // wrapper: dot links + tekst rechts
      const labelRow = document.createElement("div");
      labelRow.className = "live-label-row";
      labelEl.appendChild(labelRow);

      // dot
      const newDot = document.createElement("span");
      newDot.className = "live-dot";
      labelRow.appendChild(newDot);

      // tekst (2 regels)
      const parts = rawText ? rawText.split(" ") : ["Live", "resultaten"];
      const first = (parts[0] || "Live").toUpperCase();
      const second = (parts.slice(1).join(" ") || "resultaten").toUpperCase();

      const wrap = document.createElement("div");
      wrap.className = "live-label-text";
      wrap.innerHTML = `
        <div class="live-label-top">${first}</div>
        <div class="live-label-bottom">${second}</div>
      `;
      labelRow.appendChild(wrap);

      labelEl.dataset.stacked = "1";
    }

    // (Blok 2 verwijderd: geen "Laatst Bijgewerkt" badge meer)

    /* =========================================================
       3) Ticker in .live-text (main text blijft leeg)
    ========================================================= */
    let mainTextEl = textEl.querySelector(".live-text-main");
    if (!mainTextEl) {
      mainTextEl = document.createElement("span");
      mainTextEl.className = "live-text-main";
      textEl.prepend(mainTextEl);
    }
    mainTextEl.textContent = "";

    let tickerWrap = textEl.querySelector(".live-text-ticker");
    if (!tickerWrap) {
      tickerWrap = document.createElement("div");
      tickerWrap.className = "live-text-ticker";
      textEl.appendChild(tickerWrap);
    }

    // Edge fades to ensure the ticker disappears cleanly at both sides
    // (JS-only solution; no CSS edits required)
    let fadeLeft = tickerWrap.querySelector(".v4a-ticker-fade-left");
    let fadeRight = tickerWrap.querySelector(".v4a-ticker-fade-right");

    function ensureTickerFades() {
      // We use a CSS mask on the ticker container (JS-only) so the text fades out
      // without drawing visible overlay "tunnel" blocks.
      tickerWrap.style.overflow = "hidden";

      // Remove old overlay fades if they exist (legacy from previous iterations)
      if (fadeLeft && fadeLeft.parentNode) fadeLeft.parentNode.removeChild(fadeLeft);
      if (fadeRight && fadeRight.parentNode) fadeRight.parentNode.removeChild(fadeRight);
      fadeLeft = null;
      fadeRight = null;

      // Dynamic fade widths (right accounts for socials block).
      // Left side should fade much later (closer to the LIVE SCORE block)
      // so keep it small.
      const socialsEl = banner.querySelector(".live-socials");
      const socialsW = socialsEl ? (socialsEl.getBoundingClientRect().width || 0) : 0;

      const rightW = Math.max(80, Math.min(220, Math.round(socialsW ? socialsW * 0.95 : 130)));
      // Left side should fade much later (closer to the LIVE SCORE block)
      // so keep it small.
      const leftW = 28;

      // Mask: transparent edges -> opaque middle. Works in Safari via -webkit-mask.
      const mask = `linear-gradient(to right,
        rgba(0,0,0,0) 0px,
        rgba(0,0,0,1) ${leftW}px,
        rgba(0,0,0,1) calc(100% - ${rightW}px),
        rgba(0,0,0,0) 100%)`;

      tickerWrap.style.webkitMaskImage = mask;
      tickerWrap.style.maskImage = mask;
      tickerWrap.style.webkitMaskRepeat = "no-repeat";
      tickerWrap.style.maskRepeat = "no-repeat";
      tickerWrap.style.webkitMaskSize = "100% 100%";
      tickerWrap.style.maskSize = "100% 100%";

      return { leftW, rightW };
    }

    /* =========================================================
       4) Verwijder oude CTA knop (Bekijk live) om 404 te vermijden
    ========================================================= */
    const oldCta = banner.querySelector(".live-cta");
    if (oldCta) oldCta.remove();

    /* =========================================================
       5) Socials rechts (één set)
          - label "Volg ons op:" (styling via CSS)
          - iconen naast elkaar
          - GEEN duplicaten
          - Instagram SVG = outline paths (geen "gevuld vierkant")
    ========================================================= */
    let socials = banner.querySelector(".live-socials");
    if (!socials) {
      socials = document.createElement("div");
      socials.className = "live-socials";
      banner.appendChild(socials);
    }

    // bouw intern DOM altijd opnieuw (voorkomt opbouw van extra iconen)
    socials.innerHTML = `
      <div class="live-socials-label">Volg ons op:</div>
      <div class="live-socials-icons"></div>
    `;

    const iconsWrap = socials.querySelector(".live-socials-icons");

    // Facebook (simple path)
    const ICON_FB = `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06C2 17.08 5.66 21.2 10.44 22v-7.03H7.9v-2.9h2.54V9.85c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.9h-2.34V22C18.34 21.2 22 17.08 22 12.06z"/>
      </svg>`;

    // Instagram (outline: geen gevulde achtergrond)
    const ICON_IG = `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="3" y="3" width="18" height="18" rx="5" ry="5" fill="none" stroke="currentColor" stroke-width="2"/>
        <circle cx="12" cy="12" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/>
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
      </svg>`;

	// TikTok (simple mark; gebruikt currentColor zoals de rest)
	const ICON_TT = `
 	 <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  	  <path d="M21 8.5a6.6 6.6 0 0 1-4.3-1.6v7.2a6.5 6.5 0 1 1-6.5-6.5c.4 0 .8 0 1.2.1v3.3a3.2 3.2 0 1 0 2 3V2h3.3a6.6 6.6 0 0 0 4.3 4.3v2.2Z"/>
 	 </svg>`;

    function addSocial(href, label, svg, cls) {
      const a = document.createElement("a");
      a.className = `live-social ${cls}`;
      a.href = href;
      a.target = "_blank";
      a.rel = "noopener";
      a.setAttribute("aria-label", label);
      a.innerHTML = svg;
      iconsWrap.appendChild(a);
    }

    addSocial(
      "https://www.facebook.com/voetbal4all",
      "Voetbal4All op Facebook",
      ICON_FB,
      "is-facebook"
    );
    addSocial(
      "https://www.instagram.com/voetbal.4.all/",
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

    /* =========================================================
       6) Data + marquee render (start buiten rechts, eind buiten links)
          - Extra spacing tussen scores
          - Reset pas nadat laatste karakter links uit beeld is
          - En start terug volledig rechts (geen “instant vullen”)
    ========================================================= */
    const API_BASE = "https://voetbal4all-backend-database.onrender.com";

    // De codes die jouw backend ondersteunt: JPL, ERED, BUND, EPL, SA, LIGA, L1
    const LIVE_LEAGUES = [
      { league: "JPL", cc: "BE", label: "JPL" },
      { league: "ERED", cc: "NL", label: "Eredivisie" },
      { league: "BUND", cc: "DE", label: "Bundesliga" },
      { league: "EPL", cc: "GB", label: "Premier League" },
      { league: "SA", cc: "IT", label: "Serie A" },
      { league: "LIGA", cc: "ES", label: "La Liga" },
      { league: "L1", cc: "FR", label: "Ligue 1" },
    ];
    
    async function fetchJsonWithTimeout(url, timeoutMs = 9000) {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
        if (!res.ok) throw new Error("HTTP " + res.status);
        return await res.json();
      } finally {
        clearTimeout(t);
      }
    }
    
    function formatScoreLine({ cc, home, away, hs, as, minute, status }) {
      const dash = "–";
      const score = (hs == null || as == null) ? `${dash}${dash}` : `${hs}${dash}${as}`;
      const tail = (minute != null && String(minute) !== "")
        ? ` (${minute}’)`
        : (status ? ` (${status})` : "");
      return `[${cc}] ${home} ${score} ${away}${tail}`;
    }
    
    async function fetchFreeLiveLines() {
      // Backend is source of truth; frontend doet geen third-party calls.
      const reqs = LIVE_LEAGUES.map((x) => ({
        ...x,
        url: `${API_BASE}/api/live-scores?league=${encodeURIComponent(x.league)}`
      }));
    
      const results = await Promise.all(
        reqs.map(async (r) => {
          try {
            const data = await fetchJsonWithTimeout(r.url, 9000);
            const items = Array.isArray(data?.items) ? data.items : [];
            return { ok: true, ...r, items };
          } catch (e) {
            return { ok: false, ...r, items: [] };
          }
        })
      );
    
      const lines = [];
      for (const r of results) {
        for (const m of (r.items || [])) {
          const home = m?.homeTeam || "";
          const away = m?.awayTeam || "";
          if (!home || !away) continue;
    
          lines.push(formatScoreLine({
            cc: r.cc,
            home,
            away,
            hs: (m?.homeScore ?? null),
            as: (m?.awayScore ?? null),
            minute: (m?.minute ?? null),
            status: (m?.status ?? null),
          }));
        }
      }
    
      return lines;
    }

    function renderFallback() {
      const competitions = [
        "Jupiler Pro League",
        "Eredivisie",
        "Bundesliga",
        "Premier League",
        "Serie A",
        "La Liga",
        "Ligue 1"
      ];
      mainTextEl.textContent = `Momenteel geen live wedstrijden (${competitions.join(
        " · "
      )}).`;
      tickerWrap.innerHTML = "";
      banner.classList.remove("is-marquee");
    }

    // Houd één timer bij om dubbele init te vermijden
    let marqueeRestartTimer = null;
    let marqueeCycleEndsAt = 0;
    let pendingLines = null;

    function renderMarquee(lines) {
      if (!Array.isArray(lines) || !lines.length) return false;

      banner.classList.add("is-marquee");
      mainTextEl.textContent = "";

      // Sanitize to plain text, and collapse whitespace to keep everything on one line
      const sanitizeLine = (s) => {
        const div = document.createElement("div");
        div.innerHTML = String(s ?? "");
        return (div.textContent || "").replace(/\s+/g, " ").trim();
      };

      // More “lucht” between scores
      const SEP =
        " \u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0 • \u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0 ";

      const joined = (lines || [])
        .map(sanitizeLine)
        .filter(Boolean)
        .join(SEP);

      tickerWrap.innerHTML = `<div class="marquee-track"></div>`;
      const track = tickerWrap.querySelector(".marquee-track");

      // Render as text first (prevents raw HTML or attributes like src=... showing up)
      track.textContent = joined;

      track.innerHTML = track.textContent
        .replace(/\[BE\]/gi, flagImg("BE"))
        .replace(/\[NL\]/gi, flagImg("NL"))
        .replace(/\[DE\]/gi, flagImg("DE"))
        .replace(/\[(GB|UK)\]/gi, flagImg("GB"))
        .replace(/\[IT\]/gi, flagImg("IT"))
        .replace(/\[ES\]/gi, flagImg("ES"))
        .replace(/\[FR\]/gi, flagImg("FR"))
        .replace(/\[[A-Z]{2}\]/g, flagImg("INT"));

      // Clear eventuele vorige restart timer
      if (marqueeRestartTimer) {
        clearTimeout(marqueeRestartTimer);
        marqueeRestartTimer = null;
      }

      // Ensure fades exist and get the widths for correct start/end math
      const fades = ensureTickerFades();

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const containerW = tickerWrap.clientWidth || 0;
          const textW = track.scrollWidth || 0;
          if (!containerW || !textW) return;

          // Start far enough behind the socials mask to avoid any visible first frame,
          // but not so far that we get long "empty" time.
          const pad = 18;
          const startX = containerW + (fades?.rightW || 130) + pad;

          // End later on the left: overshoot more aggressively so the text can travel
          // closer to the LIVE SCORE block before the cycle restarts.
          const endOvershoot = Math.max(
            260,
            Math.round(containerW * 0.22),
            (fades?.leftW || 28) + 220
          );
          const endX = -textW - endOvershoot;

          // Snelheid (px/sec) -> bepaalt leesbaarheid
          // Faster to reduce perceived gaps between cycles
          const pxPerSec = 95;
          const distance = startX - endX;
          const durationSec = Math.max(10, distance / pxPerSec);

          marqueeCycleEndsAt = Date.now() + Math.ceil(durationSec * 1000);

          track.style.setProperty("--live-marquee-start", `${startX}px`);
          track.style.setProperty("--live-marquee-end", `${endX}px`);
          track.style.setProperty("--live-marquee-duration", `${durationSec}s`);

          // Prevent first-cycle "pop in": make the FIRST visible frame already offscreen right.
          // 1) Place offscreen (behind right mask), with animation disabled.
          track.style.animation = "none";
          track.style.willChange = "transform";
          // Force GPU path to reduce Safari intermediate-frame glitches
          track.style.transform = `translate3d(${startX}px, 0, 0)`;
          track.style.visibility = "visible";
          // Keep fully transparent until animation is armed
          track.style.opacity = "0";
          void track.offsetHeight; // force layout commit before animation starts

          // Start animation on next frame, then reveal on the following frame
          requestAnimationFrame(() => {
            track.style.animation = "";
            track.style.transform = "";
            requestAnimationFrame(() => {
              track.style.opacity = "1";
            });
          });

          marqueeRestartTimer = setTimeout(() => {
            // Force the first visible frame of the next cycle to be offscreen right
            track.style.animation = "none";
            track.style.willChange = "transform";
            track.style.transform = `translate3d(${startX}px, 0, 0)`;
            track.style.opacity = "0";
            void track.offsetHeight;
            requestAnimationFrame(() => {
              track.style.animation = "";
              track.style.transform = "";
              requestAnimationFrame(() => {
                track.style.opacity = "1";
              });
            });

            // If refresh fetched new data during the previous run, apply it only at cycle boundary
            if (pendingLines && Array.isArray(pendingLines) && pendingLines.length) {
              const next = pendingLines;
              pendingLines = null;
              renderMarquee(next);
            }
          }, Math.ceil(durationSec * 1000));
        });
      });

      return true;
    }

    async function refresh() {
      try {
        const lines = await fetchFreeLiveLines();
        if (!lines || !lines.length) {
          // Stop marquee state cleanly
          if (marqueeRestartTimer) {
            clearTimeout(marqueeRestartTimer);
            marqueeRestartTimer = null;
          }
          pendingLines = null;
          marqueeCycleEndsAt = 0;

          renderFallback();
          return;
        }

        // If a marquee cycle is currently running, defer the update to the cycle boundary
        const now = Date.now();
        if (marqueeRestartTimer && now < marqueeCycleEndsAt - 250) {
          pendingLines = lines;
          return;
        }

        renderMarquee(lines);
      } catch (err) {
        console.warn("Live banner fout:", err);
        if (marqueeRestartTimer) {
          clearTimeout(marqueeRestartTimer);
          marqueeRestartTimer = null;
        }
        pendingLines = null;
        marqueeCycleEndsAt = 0;
        renderFallback();
      }
    }

    // Init
    refresh();

    // Let op: refresh elke minuut is ok, maar marquee restart timer voorkomt “mid-run reset”
    setInterval(refresh, 3 * 60 * 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
