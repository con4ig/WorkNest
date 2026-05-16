import axios from 'axios';

// In production we use the full backend URL on Render,
// while locally we use the /api proxy.
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Required for sending and receiving cookies (e.g. with refresh token)
  timeout: 15000, // Abort after 15 s — prevents infinite hang during Render cold start
});

// --- Request Interceptor ---
// This interceptor adds the authorization token to each outgoing request.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    // Do not add the token to the refresh request!
    if (token && config.url !== '/auth/refresh') {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // console.log(`🔑 Adding token to request: ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Response Interceptor ---
// This interceptor handles errors, particularly 401 Unauthorized,
// by attempting to refresh the token and retry the original request.

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

    // Timeout or network error during refresh — force logout immediately
    if (!error.response && originalRequest.url === '/auth/refresh') {
      console.error("🔴 No server response while refreshing token. Logging out...");
      localStorage.removeItem('accessToken');
      processQueue(error, null);
      window.dispatchEvent(new Event('auth-error'));
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && originalRequest.url === '/auth/refresh') {
      console.error("🔴 Refresh token expired. Logging out...");
      localStorage.removeItem('accessToken');
      window.dispatchEvent(new Event('auth-error'));
      return Promise.reject(error);
    }

    // Check whether the error is a 401 and is not a retry after a refresh
    if (error.response?.status === 401 && !originalRequest._retry) {

      // If another process is already refreshing the token, queue this request
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
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
        // Call the token refresh endpoint. Assumes httpOnly cookies are used for the refresh token.
        const { data } = await api.post('/auth/refresh');
        const newAccessToken = data.accessToken;

        localStorage.setItem('accessToken', newAccessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

        // Retry all queued requests with the new token
        processQueue(null, newAccessToken);

        // Retry the original request
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        console.error("🔴 Token refresh error. Logging out...", refreshError);
        processQueue(refreshError, null);
        // On refresh error, emit an event to log the user out
        // and redirect them in the React component.
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