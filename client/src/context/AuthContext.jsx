import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Poprawka dla ESLint: Dodanie displayName dla lepszego debugowania w React DevTools
AuthContext.displayName = 'AuthContext';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Start with loading true

    const fetchUser = useCallback(async () => {
        try {
            const res = await axios.get('/api/auth/me', { withCredentials: true });
            setUser(res.data);
        } catch {
            // Poprawka: Usunięto nieużywaną zmienną 'err'
            console.log('Failed to fetch user, likely not logged in.');
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const login = useCallback(async (email, password) => {
        const res = await axios.post('/api/auth/login', { email, password });
        if (res.data && res.data.user) {
            setUser(res.data.user);
        }
        return res.data;
    }, []);

    const logout = useCallback(async () => {
        try {
            await axios.post('/api/auth/logout');
        } catch (error) {
            console.error("Logout failed, but clearing user state anyway.", error);
        } finally {
            setUser(null);
        }
    }, []);

    // Memoizuj obiekt wartości, aby zapobiec niepotrzebnym re-renderom
    const value = useMemo(() => ({
        user,
        setUser,
        loading,
        login,
        logout,
    }), [user, loading, login, logout]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext); 
};
