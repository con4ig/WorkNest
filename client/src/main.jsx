import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/index.css';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Forgot from './pages/Forgot.jsx';
import App from './App.jsx';
import EmployeeList from './pages/EmployeeList.jsx';
import Addproject from './pages/AddProjectModal.jsx';
import Projekty from './pages/Projekty.jsx';
import ProjectDetails from './pages/ProjectDetails.jsx';
import MyLeaves from './pages/MyLeaves.jsx';
import LeaveApprovals from './pages/LeaveApprovals.jsx';
import Regulamin from './pages/Regulamin.jsx';
import Polityka from './pages/Poltyka_prywatnosc.jsx';
import UserDetails from './pages/UserDetails.jsx';
import Upload from './pages/Upload.jsx';
import GenerateCode from './pages/GenerateCode.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { Toaster } from 'react-hot-toast';

// ====================================================================
// Główny komponent aplikacji
// ====================================================================
createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AuthProvider>
            <Router>
                <Toaster
                    containerStyle={{ zIndex: 9999 }}
                    position="top-center"
                    reverseOrder={false}
                    toastOptions={{
                        duration: 5000,
                        style: { background: '#333', color: '#fff' },
                    }}
                />
                <Routes>
                    <Route path="/" element={<App />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<Forgot />} />
                    <Route path="/regulamin" element={<Regulamin />} />
                    <Route path="/polityka-prywatnosci" element={<Polityka />} />

                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/employees" element={<EmployeeList />} />
                        <Route path="/projekty" element={<Projekty />} />
                        
                        <Route path="/projects/:id" element={<ProjectDetails />} />
                        <Route path="/employees/:id" element={<UserDetails />} />
                        <Route path="/myleaves" element={<MyLeaves />} />
                        <Route path="/leave-approvals" element={<LeaveApprovals />} />
                        <Route path="/upload" element={<Upload />} />
                        <Route path="/generate-code" element={<GenerateCode />} />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    </StrictMode>
);
