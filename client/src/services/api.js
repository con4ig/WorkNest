import axios from 'axios';

// Pobierz URL API ze zmiennych środowiskowych lub użyj wartości domyślnej
const API_URL = import.meta.env.PROD ? 'https://worknest-qpsw.onrender.com/api' : 'http://localhost:5500/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Niezbędne do wysyłania i odbierania ciasteczek (np. z refresh tokenem)
});

// --- Interceptor Żądania (Request Interceptor) ---
// Ten interceptor dodaje token autoryzacyjny do każdego wychodzącego żądania.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken'); 
    // Nie dodawaj tokenu do żądania odświeżającego!
    if (token && config.url !== '/auth/refresh') {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // console.log(`🔑 Dodawanie tokena do żądania: ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Interceptor Odpowiedzi (Response Interceptor) ---
// Ten interceptor obsługuje błędy, w szczególności 401 Unauthorized,
// próbując odświeżyć token i ponowić oryginalne zapytanie.

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Sprawdzamy, czy błąd to 401 i czy nie jest to ponowna próba po odświeżeniu
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Jeśli inny proces już odświeża token, dodaj to zapytanie do kolejki
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
        .then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        })
        .catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Wywołaj endpoint do odświeżania tokenu. Zakładam, że używasz ciasteczek httpOnly dla refresh tokenu.
        const { data } = await api.post('/auth/refresh'); 
        const newAccessToken = data.accessToken;

        localStorage.setItem('accessToken', newAccessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        
        // Ponów wszystkie zapytania z kolejki z nowym tokenem
        processQueue(null, newAccessToken);

        // Ponów oryginalne zapytanie
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        console.error("🔴 Błąd odświeżania tokenu. Wylogowywanie...", refreshError);
        processQueue(refreshError, null);
        // W przypadku błędu odświeżania, emituj zdarzenie, aby wylogować użytkownika
        // i przekierować go w komponencie React.
        window.dispatchEvent(new Event('auth-error'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;