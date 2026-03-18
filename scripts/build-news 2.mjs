import fs from "fs";
import Parser from "rss-parser";
import { classifyCountry } from "./countryClassifier.mjs";

const parser = new Parser({
  timeout: 15000,
  customFields: {
    item: [
      ["dc:date", "dcDate"],
      ["published", "published"],
      ["updated", "updated"],
    ],
  },
});

const config = JSON.parse(fs.readFileSync("data/feeds.json", "utf-8"));
const feeds  = config.feeds || [];
const maxItems = config.maxItems || 30;

function pickDate(item) {
  const raw =
    item.isoDate || item.pubDate || item.dcDate ||
    item.published || item.updated || null;
  const d = raw ? new Date(raw) : null;
  return d && !isNaN(d.getTime()) ? d.toISOString() : null;
}

function cleanText(str) {
  return (str || "")
    .replace(/\s+/g, " ")
    .trim();
}

function makeKey(obj) {
  if (obj.link) return "link:" + obj.link;
  return ("title:" + obj.source + "|" + obj.title).toLowerCase();
}

function metaFromSource(sourceName) {
  const s = (sourceName || "").trim().toLowerCase();
  if (s.includes("sporza"))    return { country: "BE", flag: "🇧🇪" };
  if (s.includes("hln"))       return { country: "BE", flag: "🇧🇪" };
  if (s.includes("walfoot"))   return { country: "BE", flag: "🇧🇪" };
  if (s.includes("voetbalkrant")) return { country: "BE", flag: "🇧🇪" };
  if (s.includes("voetbal international")) return { country: "NL", flag: "🇳🇱" };
  if (s.includes("nos"))       return { country: "NL", flag: "🇳🇱" };
  if (s.includes("bbc"))       return { country: "INT", flag: "🌍" };
  if (s.includes("the guardian")) return { country: "INT", flag: "🌍" };
  if (s.includes("sky sports")) return { country: "INT", flag: "🌍" };
  if (s.includes("espn"))      return { country: "INT", flag: "🌍" };
  if (s.includes("uefa"))      return { country: "INT", flag: "🌍" };
  if (s.includes("fifa"))      return { country: "INT", flag: "🌍" };
  return { country: "INT", flag: "🌍" };
}

const allItems = [];

function countryFromSourceName(name) {
  const n = (name || "").toLowerCase();
  if (n.includes("sporza") || n.includes("hln") || n.includes("walfoot") || n.includes("voetbalkrant")) return "BE";
  if (n.includes("voetbal international") || n.includes("nos")) return "NL";
  if (n.includes("bbc") || n.includes("guardian") || n.includes("sky sports")) return "UK";
  if (n.includes("espn")) return "US";
  if (n.includes("uefa") || n.includes("fifa")) return "INT";
  return "INT";
}

function flagFromCountry(code) {
  switch (code) {
    case "BE": return "🇧🇪";
    case "NL": return "🇳🇱";
    case "UK": return "🇬🇧";
    case "US": return "🇺🇸";
    default:   return "🌍";
  }
}

for (const feed of feeds) {
  try {
    const result = await parser.parseURL(feed.url);
    const perFeedLimit = feed.limit || 5;
    const items = (result.items || []).slice(0, perFeedLimit);
    items.forEach((item) => {
      const title = cleanText(item.title);
      const link  = item.link || item.guid || null;
      const sourceSlug = feed.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const sourceCountry = countryFromSourceName(feed.name);
      const contentCountry = classifyCountry(title, cleanText(item.contentSnippet || item.content || ""));
      const finalCountry = contentCountry || sourceCountry;
      const flag = flagFromCountry(finalCountry);
      allItems.push({
        type: "rss",
        source: feed.name,
        sourceSlug,
        country: finalCountry,
        flag,
        title: title || "Zonder titel",
        link,
        summary: cleanText(item.contentSnippet || item.content || ""),
        publishedAt: pickDate(item),
      });
    });
  } catch (err) {
    console.error("Fout bij feed:", feed.name, err.message);
  }
}

allItems.sort((a, b) => {
  const ad = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
  const bd = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
  return bd - ad;
});

const seen   = new Set();
const unique = [];
for (const it of allItems) {
  const key = makeKey(it);
  if (seen.has(key)) continue;
  seen.add(key);
  unique.push(it);
}

// -- Quota systeem: reserveer minimum slots per land --
const MIN_BE = 5;
const MIN_NL = 5;

const beBucket  = [];
const nlBucket  = [];
const restPool  = [];

for (const it of unique) {
  if (it.country === "BE" && beBucket.length < MIN_BE) {
    beBucket.push(it);
  } else if (it.country === "NL" && nlBucket.length < MIN_NL) {
    nlBucket.push(it);
  } else {
    restPool.push(it);
  }
}

const reserved = [...beBucket, ...nlBucket];
const remaining = maxItems - reserved.length;
const finalItems = [...reserved, ...restPool.slice(0, Math.max(0, remaining))];

finalItems.sort((a, b) => {
  const ad = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
  const bd = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
  return bd - ad;
});

console.log("Quota: BE=" + beBucket.length + "/" + MIN_BE + ", NL=" + nlBucket.length + "/" + MIN_NL + ", totaal=" + finalItems.length + "/" + maxItems);

fs.mkdirSync("data", { recursive: true });
fs.writeFileSync(
  "data/news.json",
  JSON.stringify(
    { generatedAt: new Date().toISOString(), items: finalItems },
    null,
    2
  )
);

console.log("news.json gegenereerd:", finalItems.length, "items (unique)");
