import React, { createContext, useState, useEffect, useContext } from 'react';
// 1. ZMIEŃ IMPORT: Importujemy naszą skonfigurowaną instancję `api`
import api from '../services/api'; // Upewnij się, że ścieżka jest poprawna!

export const AuthContext = createContext();

// Dodaj ten hook, aby ułatwić dostęp do kontekstu
export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Decode JWT payload without verification (only for expiry check — trust is still server-side)
    const isTokenExpired = (token) => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            // Treat as expired if it expires within the next 30 s (avoids races near boundary)
            return payload.exp * 1000 < Date.now() + 30_000;
        } catch {
            return true; // Malformed token — treat as expired
        }
    };

    // Sprawdzanie stanu zalogowania przy starcie aplikacji
    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('accessToken');

            if (!token) {
                setLoading(false);
                return;
            }

            // Fast path: token is already expired — skip /users/me and go straight
            // to /auth/refresh. Saves one cold-start round trip on Render.
            if (isTokenExpired(token)) {
                try {
                    const { data: refreshData } = await api.post('/auth/refresh');
                    localStorage.setItem('accessToken', refreshData.accessToken);
                    const { data: userData } = await api.get('/users/me');
                    setUser(userData);
                } catch (error) {
                    console.error('Sesja wygasła, nie udało się odświeżyć tokenu', error);
                    localStorage.removeItem('accessToken');
                }
                setLoading(false);
                return;
            }

            // Token looks valid — verify with the server
            try {
                const { data } = await api.get('/users/me');
                setUser(data);
            } catch (error) {
                console.error('Sesja wygasła lub błąd tokenu', error);
                localStorage.removeItem('accessToken');
            }
            setLoading(false);
        };
        checkLoggedIn();
    }, []);

    const login = async (email, password) => {
        try {
            // 3. UŻYJ `api` ZAMIAST `axios`
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('accessToken', data.accessToken);
            setUser(data.user);
            return data;
        } catch (error) {
            console.error('Błąd logowania:', error);
            throw error; // Rzuć błąd dalej, aby komponent logowania mógł go obsłużyć
        }
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        setUser(null);
        // Clear the httpOnly refresh-token cookie on the server so it can't
        // be replayed after logout
        api.post('/auth/logout').catch(() => {});
    };

    const demoLogin = async () => {
        try {
            const { data } = await api.post('/auth/demo-login');
            console.log('Demo login response data:', data);
            if (!data.accessToken) {
                console.error('Brak accessToken w odpowiedzi!');
            }
            localStorage.setItem('accessToken', data.accessToken);
            setUser(data.user);
            return data;
        } catch (error) {
            console.error('Błąd logowania demo (Frontend):', error);
            throw error;
        }
    };

    // Funkcja do odświeżania danych użytkownika (np. po zmianie zdjęcia profilowego)
    const refreshUser = async () => {
        try {
            const { data } = await api.get('/users/me');
            setUser(data);
            return data;
        } catch (error) {
            console.error('Błąd odświeżania danych użytkownika:', error);
        }
    };

    const value = { user, loading, login, logout, demoLogin, refreshUser };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
