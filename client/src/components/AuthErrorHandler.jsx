import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

// Listens for the global `auth-error` event (dispatched from the axios
// interceptor on a hard 401) and forces logout + redirect to /login.
// Lives in its own file so main.jsx exports only its entrypoint —
// keeps Vite's fast-refresh happy.
const AuthErrorHandler = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        const handleAuthError = () => {
            console.log(
                'Authorization error detected. Logging out and redirecting.',
            );
            logout();
            navigate('/login');
        };

        window.addEventListener('auth-error', handleAuthError);

        return () => {
            window.removeEventListener('auth-error', handleAuthError);
        };
    }, [navigate, logout]);

    return null; // This component renders nothing
};

export default AuthErrorHandler;
