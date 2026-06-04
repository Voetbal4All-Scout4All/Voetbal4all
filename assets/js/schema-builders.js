/**
 * V4ASchema — Shared JSON-LD @graph builders for Voetbal4All listing pages.
 * Used both client-side (browser <script>) and build-time (Node.js).
 *
 * Each builder accepts an array of normalised item objects and returns
 * a ready-to-serialise { "@context", "@graph" } object.
 *
 * GDPR: geen Person-objecten. Organizer alleen als echte club bekend is.
 */
(function () {
  "use strict";

  var SITE = "https://www.voetbal4all.eu";

  /** NFKC-normalise styled unicode (mathematical bold etc.) to plain ASCII */
  function plainText(s) {
    try { return String(s || "").normalize("NFKC").trim(); }
    catch (e) { return String(s || "").trim(); }
  }

  function wrap(graph) {
    return { "@context": "https://schema.org", "@graph": graph };
  }

  // ── JobPosting (clubvacatures) ──────────────────────────────────────
  // item: { title, club, province, country }
  function buildJobPostingGraph(items, max) {
    max = max || 50;
    var graph = [];
    for (var i = 0; i < items.length && i < max; i++) {
      var it = items[i];
      var t = plainText(it.title);
      if (!t) continue;
      var club = plainText(it.club);
      graph.push({
        "@type": "JobPosting",
        "title": t,
        "description": t + (club ? " bij " + club : ""),
        "datePosted": new Date().toISOString().split("T")[0],
        "validThrough": new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        "employmentType": "VOLUNTEER",
        "hiringOrganization": { "@type": "Organization", "name": club || "Voetbalclub" },
        "jobLocation": { "@type": "Place", "address": { "@type": "PostalAddress", "addressLocality": plainText(it.province) || undefined, "addressCountry": it.country || "BE" } }
      });
    }
    return wrap(graph);
  }

  // ── SportsEvent (events.html — sportieve events) ───────────────────
  // item: { title, startDate, slug, country, city }
  function buildSportsEventGraph(items, max) {
    max = max || 50;
    var graph = [];
    for (var i = 0; i < items.length && i < max; i++) {
      var it = items[i];
      var t = plainText(it.title);
      var d = (it.startDate || "").trim();
      if (!t || !d) continue;
      graph.push({
        "@type": "SportsEvent",
        "name": t,
        "startDate": d,
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "location": { "@type": "Place", "name": plainText(it.city) || it.country || "BE",
          "address": { "@type": "PostalAddress", "addressCountry": it.country || "BE" } },
        "url": SITE + "/event.html?slug=" + encodeURIComponent(it.slug || "")
      });
    }
    return wrap(graph);
  }

  // ── SocialEvent (algemene-events.html — club & fun) ────────────────
  // item: { title, startDate, slug, country, city, club }
  function buildSocialEventGraph(items, max) {
    max = max || 50;
    var graph = [];
    for (var i = 0; i < items.length && i < max; i++) {
      var it = items[i];
      var t = plainText(it.title);
      var d = (it.startDate || "").trim();
      if (!t || !d) continue;
      var club = plainText(it.club);
      var node = {
        "@type": "SocialEvent",
        "name": t,
        "startDate": d,
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "location": { "@type": "Place", "name": plainText(it.city) || it.country || "BE",
          "address": { "@type": "PostalAddress", "addressCountry": it.country || "BE" } },
        "url": SITE + "/event.html?slug=" + encodeURIComponent(it.slug || "")
      };
      // Only add organizer when a real club name is available
      if (club) {
        node.organizer = { "@type": "Organization", "name": club };
      }
      graph.push(node);
    }
    return wrap(graph);
  }

  // ── SportsEvent with SportsTeam (sportief-resultaten) ──────────────
  // item: { home, away, score, date (ISO or dd/mm) }
  function buildResultsSportsEventGraph(items, max) {
    max = max || 50;
    var graph = [];
    for (var i = 0; i < items.length && i < max; i++) {
      var it = items[i];
      var home = plainText(it.home);
      var away = plainText(it.away);
      if (!home || !away) continue;
      var node = {
        "@type": "SportsEvent",
        "name": home + " vs " + away,
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "homeTeam": { "@type": "SportsTeam", "name": home },
        "awayTeam": { "@type": "SportsTeam", "name": away }
      };
      var score = plainText(it.score);
      if (score && score !== "-") {
        node.description = home + " " + score + " " + away;
      }
      if (it.date) {
        var parts = String(it.date).split("/");
        if (parts.length === 2) {
          var year = new Date().getFullYear();
          node.startDate = year + "-" + parts[1].padStart(2, "0") + "-" + parts[0].padStart(2, "0");
        } else if (/^\d{4}-/.test(it.date)) {
          node.startDate = it.date;
        }
      }
      graph.push(node);
    }
    return wrap(graph);
  }

  var V4ASchema = {
    plainText: plainText,
    buildJobPostingGraph: buildJobPostingGraph,
    buildSportsEventGraph: buildSportsEventGraph,
    buildSocialEventGraph: buildSocialEventGraph,
    buildResultsSportsEventGraph: buildResultsSportsEventGraph
  };

  /* eslint-disable no-undef */
  // Export: browser → window, Node CJS → module.exports
  if (typeof window !== "undefined") { window.V4ASchema = V4ASchema; }
  if (typeof exports !== "undefined") {
    for (var _k in V4ASchema) { if (V4ASchema.hasOwnProperty(_k)) exports[_k] = V4ASchema[_k]; }
  }
})();
