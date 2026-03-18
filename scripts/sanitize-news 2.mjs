import fs from "fs";

const file = new URL("../data/news.json", import.meta.url);
const raw = fs.readFileSync(file, "utf8");
const data = JSON.parse(raw);

// Ondersteun zowel {items:[...]} als [...] varianten
const items = Array.isArray(data) ? data : (data.items || []);
const stripKeys = [
  "source", "publisher", "sourceLabel", "sourceId", "originalSource",
  "originalUrl", "sourceUrl", "feedUrl", "link", "url", "domain", "site"
];

const cleaned = items.map(it => {
  const o = { ...it };
  for (const k of stripKeys) delete o[k];

  // optioneel: maak 'source' neutraal als je code het ergens verwacht
  // o.source = "Voetbal4All";

  return o;
});

const out = Array.isArray(data) ? cleaned : { ...data, items: cleaned };
fs.writeFileSync(file, JSON.stringify(out, null, 2), "utf8");
console.log(`Sanitized ${cleaned.length} items in data/news.json`);