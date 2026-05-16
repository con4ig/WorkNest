import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import LoadingScreen from './LoadingScreen';
import { useTranslation } from 'react-i18next';

const ProtectedRoute = () => {
    const { user, loading } = useAuth();
    const { t } = useTranslation();

    // While auth is being verified, show loading screen
    if (loading) {
        return <LoadingScreen message={t('common.verifyingAccess') || 'Verifying access...'} />;
    }

    if (!loading && !user) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
