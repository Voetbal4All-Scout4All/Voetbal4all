const fs = require("fs");
const Parser = require("rss-parser");
const parser = new Parser({
  timeout: 15000,
  headers: { "User-Agent": "Voetbal4All RSS Bot (GitHub Actions)" },
});

const FEEDS = [
  { name: "VI", url: "https://www.vi.nl/rss/nieuws.xml" },
  { name: "BBC", url: "https://feeds.bbci.co.uk/sport/football/rss.xml" },
  { name: "The Guardian", url: "https://www.theguardian.com/football/rss" },
  { name: "Sky Sports", url: "https://www.skysports.com/rss/12040" },
  { name: "ESPN", url: "https://www.espn.com/espn/rss/soccer/news" },

  // Vul aan/finetune later (optioneel):
  // { name: "Goal", url: "https://www.goal.com/feeds/en/news" },
];

const MAX_ITEMS_TOTAL = 20;

function safeDate(d) {
  const dt = d ? new Date(d) : null;
  return dt && !isNaN(dt.getTime()) ? dt.toISOString() : null;
}

(async () => {
  const all = [];

  for (const feed of FEEDS) {
    try {
      const data = await parser.parseURL(feed.url);
      for (const item of data.items || []) {
        all.push({
          source: feed.name,
          title: (item.title || "").trim(),
          link: item.link || "",
          publishedAt: safeDate(item.isoDate || item.pubDate),
          summary: (item.contentSnippet || item.content || "").toString().trim().slice(0, 240),
        });
      }
    } catch (e) {
      // Feed faalt? Niet alles blokkeren.
      all.push({
        source: feed.name,
        title: "Feed tijdelijk niet beschikbaar",
        link: feed.url,
        publishedAt: new Date().toISOString(),
        summary: "Deze bron kon niet worden ingelezen. Wordt automatisch opnieuw geprobeerd.",
        error: String(e?.message || e),
      });
    }
  }

  // Sorteren op datum (nieuwste eerst)
  all.sort((a, b) => {
    const da = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const db = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return db - da;
  });

  // Dedup op link+title
  const seen = new Set();
  const deduped = [];
  for (const it of all) {
    const key = `${it.link}__${it.title}`;
    if (!it.title || !it.link) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(it);
  }

  const output = {
    generatedAt: new Date().toISOString(),
    items: deduped.slice(0, MAX_ITEMS_TOTAL),
  };

  fs.mkdirSync("data", { recursive: true });
  fs.writeFileSync("data/news.json", JSON.stringify(output, null, 2), "utf8");

  console.log(`Wrote data/news.json with ${output.items.length} items`);
})();
