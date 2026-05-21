import { StrictMode, Suspense, lazy } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { createRoot } from 'react-dom/client';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom';
import './styles/fonts.css';
import './styles/index.css';

// Auth + public pages — small, load eagerly (needed on first paint)
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Forgot from './pages/Forgot.jsx';
import Terms from './pages/Terms.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';

// Protected app pages — lazy loaded, split from main bundle
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const EmployeeList = lazy(() => import('./pages/EmployeeList.jsx'));
const Projects = lazy(() => import('./pages/Projects.jsx'));
const ProjectDetails = lazy(() => import('./pages/ProjectDetails.jsx'));
const MyLeaves = lazy(() => import('./pages/MyLeaves.jsx'));
const LeaveApprovals = lazy(() => import('./pages/LeaveApprovals.jsx'));
const UserDetails = lazy(() => import('./pages/UserDetails.jsx'));
const Upload = lazy(() => import('./pages/Upload.jsx'));
const GenerateCode = lazy(() => import('./pages/GenerateCode.jsx'));
const ForcePasswordChange = lazy(
    () => import('./pages/ForcePasswordChange.jsx'),
);
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './pages/ErrorBoundary.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';
import Layout from './components/layout/Layout.jsx';
import AuthErrorHandler from './components/AuthErrorHandler.jsx';

// ====================================================================
// Main application component
// ====================================================================
createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ErrorBoundary>
            <ThemeProvider>
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
                                            background: 'rgb(var(--card))',
                                            color: 'rgb(var(--card-foreground))',
                                            border: '1px solid rgb(var(--border))',
                                        },
                                    }}
                                />
                                <Routes>
                                    <Route
                                        path="/"
                                        element={
                                            <Navigate to="/login" replace />
                                        }
                                    />
                                    <Route path="/login" element={<Login />} />
                                    <Route
                                        path="/register"
                                        element={<Register />}
                                    />
                                    <Route
                                        path="/regulamin"
                                        element={<Terms />}
                                    />
                                    <Route
                                        path="/polityka-prywatnosci"
                                        element={<PrivacyPolicy />}
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
                                                element={<Projects />}
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
                                                element={
                                                    <ForcePasswordChange />
                                                }
                                            />
                                        </Route>
                                    </Route>
                                </Routes>
                            </Router>
                        </Suspense>
                    </I18nextProvider>
                </AuthProvider>
            </ThemeProvider>
        </ErrorBoundary>
    </StrictMode>,
);
