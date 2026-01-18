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
      BE: "/assets/img/sources/flag-be.svg",
      NL: "/assets/img/sources/flag-nl.svg",
      DE: "/assets/img/sources/flag-de.svg",
      UK: "/assets/img/sources/flag-uk.svg",
      IT: "/assets/img/sources/flag-it.svg",
      ES: "/assets/img/sources/flag-es.svg",
      FR: "/assets/img/sources/flag-fr.svg",
      INT: "/assets/img/sources/flag-int.svg"
    };

    function flagImg(code, sizeClass = "") {
      const c = String(code || "INT").trim().toUpperCase();
      const src = FLAG_SRC[c] || FLAG_SRC.INT;
      const alt =
        (c === "BE") ? "België" :
        (c === "NL") ? "Nederland" :
        (c === "DE") ? "Duitsland" :
        (c === "UK") ? "Verenigd Koninkrijk" :
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
          - live-updated mag enkel onder live-label bestaan
          - socials mogen enkel één keer bestaan
    ========================================================= */
    const keepLabelUpdated = labelEl.querySelector(".live-updated");

    banner.querySelectorAll(".live-updated").forEach((el) => {
      // we houden enkel degene die al in labelEl zit
      if (keepLabelUpdated && el === keepLabelUpdated) return;
      if (!labelEl.contains(el)) el.remove();
    });

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

    /* =========================================================
       2) Update-element: uitsluitend onder LIVE RESULTATEN (labelEl)
          - Tekst: "Laatst Bijgewerkt: uu:mm"
          - Geen duplicaten elders
    ========================================================= */
    let updatedEl = labelEl.querySelector(".live-updated");
    if (!updatedEl) {
      updatedEl = document.createElement("div");
      updatedEl.className = "live-updated";
      labelEl.appendChild(updatedEl);
    }

    function formatTime(d) {
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      return `${hh}:${mm}`;
    }

    function setUpdated(d) {
      updatedEl.textContent = d ? `Laatst Bijgewerkt: ${formatTime(d)}` : "";
    }

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
      { league: "EPL", cc: "UK", label: "Premier League" },
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
        .replace(/\[UK\]/gi, flagImg("UK"))
        .replace(/\[IT\]/gi, flagImg("IT"))
        .replace(/\[ES\]/gi, flagImg("ES"))
        .replace(/\[FR\]/gi, flagImg("FR"))
        .replace(/\[[A-Z]{2}\]/g, flagImg("INT"));

      // Clear eventuele vorige restart timer
      if (marqueeRestartTimer) {
        clearTimeout(marqueeRestartTimer);
        marqueeRestartTimer = null;
      }

      requestAnimationFrame(() => {
        const containerW = tickerWrap.clientWidth || 0;
        const textW = track.scrollWidth || 0;
        if (!containerW || !textW) return;

        // Start volledig rechts buiten beeld, eind volledig links buiten beeld
        const startX = containerW;
        const endX = -textW;

        // Snelheid (px/sec) -> bepaalt leesbaarheid
        const pxPerSec = 70;
        const distance = startX - endX;
        const durationSec = Math.max(14, distance / pxPerSec);

        track.style.setProperty("--live-marquee-start", `${startX}px`);
        track.style.setProperty("--live-marquee-end", `${endX}px`);
        track.style.setProperty("--live-marquee-duration", `${durationSec}s`);

        // Force restart animatie (betrouwbaar)
        track.style.animation = "none";
        void track.offsetHeight;
        track.style.animation = "";

        marqueeRestartTimer = setTimeout(() => {
          track.style.animation = "none";
          void track.offsetHeight;
          track.style.animation = "";
        }, Math.ceil(durationSec * 1000));
      });

      return true;
    }

    async function refresh() {
      try {
        setUpdated(null);

        const lines = await fetchFreeLiveLines();
        if (!lines || !lines.length) {
          renderFallback();
          setUpdated(new Date());
          return;
        }

        // Render pas opnieuw wanneer de oude cyclus klaar is (zie timer in renderMarquee)
        renderMarquee(lines);
        setUpdated(new Date());
      } catch (err) {
        console.warn("Live banner fout:", err);
        renderFallback();
        setUpdated(new Date());
      }
    }

    // Init
    refresh();

    // Let op: refresh elke minuut is ok, maar marquee restart timer voorkomt “mid-run reset”
    setInterval(refresh, 60 * 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
