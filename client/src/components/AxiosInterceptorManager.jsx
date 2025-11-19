import { useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AxiosInterceptorManager = ({ children }) => {
    const { setAccessToken, logout } = useAuth();

    useEffect(() => {
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

        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                const noRefreshEndpoints = ['/login', '/register', '/refresh', '/logout'];
                if (noRefreshEndpoints.some(endpoint => originalRequest.url.includes(endpoint))) {
                    return Promise.reject(error);
                }

                if (error.response?.status === 401 && !originalRequest._retry) {
                    if (isRefreshing) {
                        return new Promise((resolve, reject) => {
                            failedQueue.push({ resolve, reject });
                        })
                            .then(token => {
                                originalRequest.headers.Authorization = `Bearer ${token}`;
                                return axios(originalRequest);
                            })
                            .catch(err => Promise.reject(err));
                    }

                    originalRequest._retry = true;
                    isRefreshing = true;

                    try {
                        const res = await axios.post('/api/auth/refresh');
                        const newAccessToken = res.data.accessToken;
                        
                        setAccessToken(newAccessToken); // Użyj funkcji z kontekstu
                        
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        
                        processQueue(null, newAccessToken);
                        
                        return axios(originalRequest);
                    } catch (refreshError) {
                        processQueue(refreshError, null);
                        logout(); // Użyj funkcji logout z kontekstu
                        return Promise.reject(refreshError);
                    } finally {
                        isRefreshing = false;
                    }
                }

                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, [setAccessToken, logout]);

    return children;
};

export default AxiosInterceptorManager;
