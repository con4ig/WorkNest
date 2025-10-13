import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"
import './styles/index.css'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Forgot from './pages/Forgot.jsx'
import App from './App.jsx'
import EmployeeList from './pages/EmployeeList.jsx'
import Addproject from './pages/AddProjectModal.jsx'
import Projekty from './pages/Projekty.jsx'
import ProjectDetails from './pages/ProjectDetails.jsx'
import MyLeaves from './pages/MyLeaves.jsx'
import LeaveApprovals from './pages/LeaveApprovals.jsx'
import Regulamin from './pages/Regulamin.jsx'
import Polityka from './pages/Poltyka_prywatnosc.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />    
        <Route path="/dashboard" element={<Dashboard />} />    
        <Route path="/forgot-password" element={<Forgot />} />   
        <Route path="/employees" element={<EmployeeList />} />  
        <Route path="/employees/add" element={<Addproject />} />  
        <Route path="/projekty" element={<Projekty />} />
        <Route path="/projects/:id" element={<ProjectDetails />} /> 
        <Route path="/myleaves" element={<MyLeaves />} /> 
        <Route path="/leave-approvals" element={<LeaveApprovals />} />
        <Route path="/regulamin" element={<Regulamin />} />
        <Route path="/polityka-prywatnosci" element={<Polityka />} />
      </Routes>
    </Router>
  </StrictMode>
)