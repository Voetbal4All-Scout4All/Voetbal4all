import axios from 'axios';

const API_BASE = import.meta.env.VITE_SCOUT_API_URL || '/api/scout';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('s4a_token');
  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});

// Handle 401 responses — attempt token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await api.post('/auth/refresh');
        localStorage.setItem('s4a_token', data.token);
        original.headers.Authorization = 'Bearer ' + data.token;
        return api(original);
      } catch (refreshError) {
        localStorage.removeItem('s4a_token');
        localStorage.removeItem('s4a_user');
        window.location.href = '/scout/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
