import fs from "node:fs";

const API_KEY = process.env.FOOTBALL_API_KEY;

if (!API_KEY) {
  console.error("Missing FOOTBALL_API_KEY. Add it as a GitHub Secret.");
  process.exit(1);
}

// TODO: VERVANG DIT BLOK door jouw provider calls.
// Je wil live matches voor:
// - Jupiler Pro League
// - Challenger/Proximus League
// - Eredivisie
// - Keuken Kampioen Divisie
async function fetchProviderData() {
  // return structure in ons eigen formaat
  return {
    updatedAt: new Date().toISOString(),
    leagues: [
      { key: "JPL", name: "Jupiler Pro League", matches: [] },
      { key: "CPL", name: "Challenger Pro League", matches: [] },
      { key: "ERE", name: "Eredivisie", matches: [] },
      { key: "KKD", name: "Keuken Kampioen Divisie", matches: [] }
    ]
  };
}

const data = await fetchProviderData();

fs.mkdirSync("data", { recursive: true });
fs.writeFileSync("data/live-scores.json", JSON.stringify(data, null, 2), "utf8");

console.log("Wrote data/live-scores.json");
