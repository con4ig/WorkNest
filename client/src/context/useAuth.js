import { use } from 'react';
import { AuthContext } from './AuthContext.jsx';

// Hook to simplify access to the auth context.
// Kept in its own file so the AuthContext module only exports React
// components (keeps Vite's fast-refresh happy — see
// react-refresh/only-export-components).
export const useAuth = () => {
    return use(AuthContext);
};
