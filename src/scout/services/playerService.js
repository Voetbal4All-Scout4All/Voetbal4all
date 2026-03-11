const API_BASE = import.meta.env.VITE_SCOUT_API_URL || '/api/scout';

const getHeaders = () => {
    const token = localStorage.getItem('s4a_token');
    return {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

const playerService = {
    // Haal alle spelers op van de ingelogde scout
    getPlayers: async (params = {}) => {
          const query = new URLSearchParams(params).toString();
          const res = await fetch(`${API_BASE}/players${query ? `?${query}` : ''}`, {
                  headers: getHeaders(),
          });
          if (!res.ok) throw new Error('Fout bij ophalen spelers');
          return res.json();
    },

    // Haal één speler op
    getPlayer: async (id) => {
          const res = await fetch(`${API_BASE}/players/${id}`, { headers: getHeaders() });
          if (!res.ok) throw new Error('Speler niet gevonden');
          return res.json();
    },

    // Nieuwe speler aanmaken
    createPlayer: async (data) => {
          const res = await fetch(`${API_BASE}/players`, {
                  method: 'POST',
                  headers: getHeaders(),
                  body: JSON.stringify(data),
          });
          if (!res.ok) throw new Error('Fout bij aanmaken speler');
          return res.json();
    },

    // Speler bijwerken
    updatePlayer: async (id, data) => {
          const res = await fetch(`${API_BASE}/players/${id}`, {
                  method: 'PUT',
                  headers: getHeaders(),
                  body: JSON.stringify(data),
          });
          if (!res.ok) throw new Error('Fout bij bijwerken speler');
          return res.json();
    },

    // Speler archiveren
    archivePlayer: async (id) => {
          const res = await fetch(`${API_BASE}/players/${id}/archive`, {
                  method: 'PATCH',
                  headers: getHeaders(),
          });
          if (!res.ok) throw new Error('Fout bij archiveren speler');
          return res.json();
    },
};

export default playerService;
