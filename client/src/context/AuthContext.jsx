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

  // Sprawdzanie stanu zalogowania przy starcie aplikacji
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          // 2. UŻYJ `api` ZAMIAST `axios`
          const { data } = await api.get('/users/me'); // POPRAWNY ENDPOINT: /users/me
          setUser(data);
        } catch (error) {
          console.error("Sesja wygasła lub błąd tokenu", error);
          localStorage.removeItem('accessToken'); // Czyścimy zły token
        }
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
      console.error("Błąd logowania:", error);
      throw error; // Rzuć błąd dalej, aby komponent logowania mógł go obsłużyć
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
    // Opcjonalnie wywołanie endpointu wylogowującego na backendzie
    // api.post('/auth/logout');
  };

  const demoLogin = async () => {
    try {
      const { data } = await api.post('/auth/demo-login');
      localStorage.setItem('accessToken', data.accessToken);
      setUser(data.user);
      return data;
    } catch (error) {
      console.error("Błąd logowania demo:", error);
      throw error;
    }
  };

  const value = { user, loading, login, logout, demoLogin };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
