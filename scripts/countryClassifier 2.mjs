// scripts/countryClassifier.mjs
// Content-based country classification using keyword matching.
// Weights: clubs=3, competitions=2, players=2, cities=1.
// Returns country code or null (fallback to source-based).

const KEYWORD_MAP = {
  BE: {
    clubs: [
      "Club Brugge", "Anderlecht", "KRC Genk", "Standard Luik", "Standard Li\u00E8ge",
      "AA Gent", "KAA Gent", "Antwerp FC", "Royal Antwerp", "Union Saint-Gilloise",
      "Union SG", "Cercle Brugge", "OH Leuven", "KV Mechelen", "Charleroi",
      "Sint-Truiden", "STVV", "KV Kortrijk", "Westerlo", "Eupen", "Beerschot",
      "RWD Molenbeek", "Zulte Waregem", "FCV Dender", "Lommel"
    ],
    competitions: [
      "Jupiler Pro League", "Pro League", "Belgische competitie", "Beker van Belgi\u00EB",
      "Croky Cup", "Belgisch voetbal", "Eerste klasse A", "Eerste klasse B",
      "Super League BE"
    ],
    players: [
      "De Bruyne", "Lukaku", "Courtois", "Hazard", "Trossard",
      "Onana", "Doku", "Carrasco", "Mertens", "Witsel",
      "Op\u00E9nda", "Theate", "Debast", "De Ketelaere"
    ],
    cities: [
      "Brugge", "Brussel", "Gent", "Antwerpen", "Luik", "Li\u00E8ge",
      "Genk", "Mechelen", "Leuven", "Charleroi", "Kortrijk"
    ]
  },
  NL: {
    clubs: [
      "Ajax", "PSV", "Feyenoord", "AZ Alkmaar", "FC Twente",
      "FC Utrecht", "Vitesse", "SC Heerenveen", "Willem II", "NEC",
      "Go Ahead Eagles", "Sparta Rotterdam", "Heracles", "PEC Zwolle",
      "RKC Waalwijk", "Fortuna Sittard", "FC Groningen", "Excelsior",
      "FC Volendam", "Almere City"
    ],
    competitions: [
      "Eredivisie", "KNVB Beker", "Nederlandse competitie", "Eerste Divisie",
      "Johan Cruijff Schaal", "Nederlands voetbal"
    ],
    players: [
      "Van Dijk", "Depay", "Memphis", "De Jong", "Frenkie",
      "Gakpo", "Dumfries", "De Ligt", "Xavi Simons", "Timber",
      "Koopmeiners", "Wijnaldum", "Blind", "Berghuis"
    ],
    cities: [
      "Amsterdam", "Eindhoven", "Rotterdam", "Alkmaar", "Utrecht",
      "Enschede", "Arnhem", "Den Haag", "Groningen", "Heerenveen"
    ]
  },
  UK: {
    clubs: [
      "Manchester United", "Manchester City", "Liverpool", "Chelsea", "Arsenal",
      "Tottenham", "Newcastle", "Aston Villa", "West Ham", "Brighton",
      "Wolves", "Crystal Palace", "Everton", "Fulham", "Bournemouth",
      "Nottingham Forest", "Brentford", "Luton Town", "Burnley", "Sheffield United"
    ],
    competitions: [
      "Premier League", "FA Cup", "Carabao Cup", "EFL Cup", "Championship",
      "League Cup", "English football"
    ],
    players: [
      "Salah", "Saka", "Rice", "Palmer", "Haaland",
      "Son", "Kane", "Rashford", "Foden", "Bellingham"
    ],
    cities: [
      "London", "Manchester", "Liverpool", "Birmingham", "Leeds",
      "Newcastle", "Sheffield"
    ]
  },
  ES: {
    clubs: [
      "Real Madrid", "Barcelona", "Atletico Madrid", "Sevilla", "Real Sociedad",
      "Villarreal", "Athletic Bilbao", "Real Betis", "Valencia", "Girona",
      "Celta Vigo", "Osasuna", "Getafe", "Mallorca", "Las Palmas", "Rayo Vallecano"
    ],
    competitions: [
      "La Liga", "Copa del Rey", "Supercopa", "Segunda Divisi\u00F3n",
      "Spaans voetbal"
    ],
    players: [
      "Vinicius", "Pedri", "Gavi", "Yamal", "Morata",
      "Rodri", "Olmo"
    ],
    cities: [
      "Madrid", "Barcelona", "Sevilla", "Bilbao", "Valencia"
    ]
  },
  DE: {
    clubs: [
      "Bayern M\u00FCnchen", "Bayern Munich", "Borussia Dortmund", "Dortmund", "BVB",
      "RB Leipzig", "Bayer Leverkusen", "Leverkusen", "Eintracht Frankfurt",
      "VfB Stuttgart", "Wolfsburg", "Borussia M\u00F6nchengladbach", "Freiburg",
      "Union Berlin", "Hoffenheim", "Werder Bremen", "Augsburg", "Mainz",
      "K\u00F6ln", "Hertha BSC"
    ],
    competitions: [
      "Bundesliga", "DFB-Pokal", "DFL-Supercup", "2. Bundesliga",
      "Duits voetbal"
    ],
    players: [
      "M\u00FCller", "Neuer", "Gnabry", "Sane", "Musiala",
      "Havertz", "Wirtz", "F\u00FCllkrug"
    ],
    cities: [
      "M\u00FCnchen", "M\u00FCnich", "Dortmund", "Berlin", "Frankfurt",
      "Hamburg", "Stuttgart", "Leipzig"
    ]
  },
  IT: {
    clubs: [
      "Juventus", "AC Milan", "Inter Milan", "Internazionale", "Napoli",
      "AS Roma", "Lazio", "Atalanta", "Fiorentina", "Bologna",
      "Torino", "Udinese", "Sassuolo", "Monza", "Lecce", "Cagliari"
    ],
    competitions: [
      "Serie A", "Coppa Italia", "Supercoppa Italiana",
      "Italiaans voetbal", "Serie B"
    ],
    players: [
      "Chiesa", "Barella", "Bastoni", "Dimarco", "Donnarumma",
      "Tonali", "Osimhen"
    ],
    cities: [
      "Milaan", "Milan", "Rome", "Roma", "Napels", "Turijn", "Turin",
      "Florence", "Firenze", "Bologna"
    ]
  },
  FR: {
    clubs: [
      "PSG", "Paris Saint-Germain", "Marseille", "Lyon", "Monaco",
      "Lille", "Nice", "Rennes", "Lens", "Toulouse",
      "Strasbourg", "Montpellier", "Nantes", "Reims", "Brest"
    ],
    competitions: [
      "Ligue 1", "Coupe de France", "Trophee des Champions",
      "Frans voetbal", "Ligue 2"
    ],
    players: [
      "Mbapp\u00E9", "Mbappe", "Griezmann", "Giroud", "Kolo Muani",
      "Dembele", "Camavinga", "Tchouameni"
    ],
    cities: [
      "Parijs", "Paris", "Marseille", "Lyon", "Nice", "Lille", "Bordeaux"
    ]
  },
  INT: {
    clubs: [],
    competitions: [
      "Champions League", "Europa League", "Conference League",
      "Nations League", "EK", "WK", "World Cup", "Euro 2024",
      "Euro 2028", "FIFA", "UEFA", "EURO"
    ],
    players: [],
    cities: []
  }
};

// Weights per category
const WEIGHT = { clubs: 3, competitions: 2, players: 2, cities: 1 };

/**
 * Classify an article's country based on title and body text.
 * Uses whole-word matching and weighted scoring.
 * @param {string} title - Article title
 * @param {string} body  - Article body/summary text
 * @returns {string|null} Country code (BE, NL, UK, ES, DE, IT, FR, INT) or null
 */
export function classifyCountry(title, body) {
  const text = ((title || "") + " " + (body || "")).toLowerCase();
  if (!text.trim()) return null;

  const scores = {};

  for (const [country, categories] of Object.entries(KEYWORD_MAP)) {
    let score = 0;
    for (const [cat, keywords] of Object.entries(categories)) {
      const w = WEIGHT[cat] || 1;
      for (const kw of keywords) {
        // Whole-word matching with word boundaries
        const escaped = kw.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const re = new RegExp("\\b" + escaped + "\\b", "i");
        if (re.test(text)) {
          score += w;
        }
      }
    }
    if (score > 0) {
      scores[country] = score;
    }
  }

  if (Object.keys(scores).length === 0) return null;

  // Sort by score descending
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  // On tie: BE and NL get priority (target audience)
  if (sorted.length > 1 && sorted[0][1] === sorted[1][1]) {
    for (const [cc] of sorted) {
      if (cc === "BE" || cc === "NL") return cc;
    }
  }

  return sorted[0][0];
}

export default classifyCountry;
