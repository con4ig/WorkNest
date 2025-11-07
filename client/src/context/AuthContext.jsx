import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get('/api/auth/me', {
                    withCredentials: true,
                });
                setUser(res.data);
            } catch (err) {
                console.error('Failed to fetch user:', err);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const login = async (email, password) => {
        const res = await axios.post(
            '/api/auth/login',
            { email, password },
            {
                withCredentials: true,
            },
        );
        setUser(res.data.user);
        return res.data;
    };

    const logout = async () => {
        await axios.post(
            '/api/auth/logout',
            {},
            {
                withCredentials: true,
            },
        );
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
