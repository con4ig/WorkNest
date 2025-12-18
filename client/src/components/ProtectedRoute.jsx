import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen'; // Importujemy nowy komponent

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    // Jeśli trwa weryfikacja autoryzacji, pokaż ekran ładowania
    if (loading) {
        return <LoadingScreen message="Weryfikacja dostępu..." />;
    }

    if (!loading && !user) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
