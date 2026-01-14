import { StrictMode, useEffect, Suspense } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { createRoot } from 'react-dom/client';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    useNavigate,
} from 'react-router-dom';
import './styles/fonts.css';
import './styles/index.css';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Forgot from './pages/Forgot.jsx';
import App from './App.jsx';
import EmployeeList from './pages/EmployeeList.jsx';
import Addproject from './components/AddProjectModal.jsx';
import Projekty from './pages/Projekty.jsx';
import ProjectDetails from './pages/ProjectDetails.jsx';
import MyLeaves from './pages/MyLeaves.jsx';
import LeaveApprovals from './pages/LeaveApprovals.jsx';
import Regulamin from './pages/Regulamin.jsx';
import Polityka from './pages/Polityka_prywatnosc.jsx';
import UserDetails from './pages/UserDetails.jsx';
import Upload from './pages/Upload.jsx';
import GenerateCode from './pages/GenerateCode.jsx';
import ForcePasswordChange from './pages/ForcePasswordChange.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './pages/ErrorBoundary.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';
import Layout from './components/layout/Layout.jsx';

// Komponent do obsługi globalnych błędów autoryzacji
const AuthErrorHandler = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        const handleAuthError = () => {
            console.log(
                'Wykryto błąd autoryzacji. Wylogowywanie i przekierowywanie.',
            );
            logout();
            navigate('/login');
        };

        window.addEventListener('auth-error', handleAuthError);

        return () => {
            window.removeEventListener('auth-error', handleAuthError);
        };
    }, [navigate, logout]);

    return null; // Ten komponent niczego nie renderuje
};

// ====================================================================
// Główny komponent aplikacji
// ====================================================================
createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ErrorBoundary>
            <AuthProvider>
                <I18nextProvider i18n={i18n}>
                    <Suspense fallback={<LoadingScreen />}>
                        <Router>
                            <AuthErrorHandler />
                            <Toaster
                                containerStyle={{ zIndex: 9999 }}
                                position="top-center"
                                reverseOrder={false}
                                toastOptions={{
                                    duration: 5000,
                                    style: {
                                        background: '#333',
                                        color: '#fff',
                                    },
                                }}
                            />
                            <Routes>
                                <Route path="/" element={<App />} />
                                <Route path="/login" element={<Login />} />
                                <Route
                                    path="/register"
                                    element={<Register />}
                                />
                                <Route
                                    path="/forgot-password"
                                    element={<Forgot />}
                                />
                                <Route
                                    path="/regulamin"
                                    element={<Regulamin />}
                                />
                                <Route
                                    path="/polityka-prywatnosci"
                                    element={<Polityka />}
                                />

                                <Route element={<ProtectedRoute />}>
                                    <Route element={<Layout />}>
                                        <Route
                                            path="/dashboard"
                                            element={<Dashboard />}
                                        />
                                        <Route
                                            path="/employees"
                                            element={<EmployeeList />}
                                        />
                                        <Route
                                            path="/projects"
                                            element={<Projekty />}
                                        />

                                        <Route
                                            path="/projects/:id"
                                            element={<ProjectDetails />}
                                        />
                                        <Route
                                            path="/employees/:id"
                                            element={<UserDetails />}
                                        />
                                        <Route
                                            path="/myleaves"
                                            element={<MyLeaves />}
                                        />
                                        <Route
                                            path="/leave-approvals"
                                            element={<LeaveApprovals />}
                                        />
                                        <Route
                                            path="/upload"
                                            element={<Upload />}
                                        />
                                        <Route
                                            path="/generate-code"
                                            element={<GenerateCode />}
                                        />
                                        <Route
                                            path="/force-password-change"
                                            element={<ForcePasswordChange />}
                                        />
                                    </Route>
                                </Route>
                            </Routes>
                        </Router>
                    </Suspense>
                </I18nextProvider>
            </AuthProvider>
        </ErrorBoundary>
    </StrictMode>,
);
