const API_BASE = import.meta.env.VITE_SCOUT_API_URL || '/api/scout';

const getHeaders = () => {
    const token = localStorage.getItem('s4a_token');
    return {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

const reportService = {
    // Rapporten voor een speler
    getReportsByPlayer: async (playerId) => {
          const res = await fetch(`${API_BASE}/players/${playerId}/reports`, { headers: getHeaders() });
          if (!res.ok) throw new Error('Fout bij ophalen rapporten');
          return res.json();
    },

    // Één rapport
    getReport: async (id) => {
          const res = await fetch(`${API_BASE}/reports/${id}`, { headers: getHeaders() });
          if (!res.ok) throw new Error('Rapport niet gevonden');
          return res.json();
    },

    // Nieuw rapport aanmaken
    createReport: async (data) => {
          const res = await fetch(`${API_BASE}/reports`, {
                  method: 'POST',
                  headers: getHeaders(),
                  body: JSON.stringify(data),
          });
          if (!res.ok) throw new Error('Fout bij aanmaken rapport');
          return res.json();
    },

    // Rapport bijwerken
    updateReport: async (id, data) => {
          const res = await fetch(`${API_BASE}/reports/${id}`, {
                  method: 'PUT',
                  headers: getHeaders(),
                  body: JSON.stringify(data),
          });
          if (!res.ok) throw new Error('Fout bij bijwerken rapport');
          return res.json();
    },

    // Beschikbare posities ophalen
    getPositions: async () => {
          const res = await fetch(`${API_BASE}/positions`, { headers: getHeaders() });
          if (!res.ok) throw new Error('Fout bij ophalen posities');
          return res.json();
    },

    // Evaluatiecriteria per positie ophalen
    getCriteria: async (positionCode) => {
          const url = positionCode
            ? `${API_BASE}/criteria?position=${positionCode}`
                  : `${API_BASE}/criteria`;
          const res = await fetch(url, { headers: getHeaders() });
          if (!res.ok) throw new Error('Fout bij ophalen criteria');
          return res.json();
    },

    // Recente rapporten van de scout zelf
    getMyRecentReports: async (limit = 5) => {
          const res = await fetch(`${API_BASE}/reports/me?limit=${limit}`, { headers: getHeaders() });
          if (!res.ok) throw new Error('Fout bij ophalen rapporten');
          return res.json();
    },
};

export default reportService;
