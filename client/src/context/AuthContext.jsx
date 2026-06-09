import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { connectRealtime, disconnectRealtime } from '../services/realtime';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

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

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check login state on application start
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
                    const { data: refreshData } =
                        await api.post('/auth/refresh');
                    localStorage.setItem(
                        'accessToken',
                        refreshData.accessToken,
                    );
                    const { data: userData } = await api.get('/users/me');
                    setUser(userData);
                    connectRealtime(refreshData.accessToken);
                } catch (error) {
                    console.error(
                        'Session expired, failed to refresh token',
                        error,
                    );
                    localStorage.removeItem('accessToken');
                }
                setLoading(false);
                return;
            }

            // Token looks valid — verify with the server
            try {
                const { data } = await api.get('/users/me');
                setUser(data);
                connectRealtime(token);
            } catch (error) {
                console.error('Session expired or token error', error);
                localStorage.removeItem('accessToken');
            }
            setLoading(false);
        };
        checkLoggedIn();

        // Tear the socket down when the provider unmounts.
        return () => disconnectRealtime();
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('accessToken', data.accessToken);
            setUser(data.user);
            connectRealtime(data.accessToken);
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error; // Rethrow so the login component can handle it
        }
    };

    const logout = () => {
        disconnectRealtime();
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
                console.error('Missing accessToken in response!');
            }
            localStorage.setItem('accessToken', data.accessToken);
            setUser(data.user);
            connectRealtime(data.accessToken);
            return data;
        } catch (error) {
            console.error('Demo login error (Frontend):', error);
            throw error;
        }
    };

    // Function to refresh user data (e.g. after changing profile photo)
    const refreshUser = async () => {
        try {
            const { data } = await api.get('/users/me');
            setUser(data);
            return data;
        } catch (error) {
            console.error('Error refreshing user data:', error);
        }
    };

    const value = { user, loading, login, logout, demoLogin, refreshUser };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
