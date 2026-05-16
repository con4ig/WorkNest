import { useContext } from 'react';
import { ThemeContext } from './ThemeContext.jsx';

// Hook to simplify access to the theme context.
// Kept in its own file so the ThemeContext module only exports React
// components (keeps Vite's fast-refresh happy — see
// react-refresh/only-export-components).
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
