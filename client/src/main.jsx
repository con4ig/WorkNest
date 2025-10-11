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
import Add_project from './pages/Add_project.jsx'

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
        <Route path="/employees/add" element={<Add_project />} />  
      </Routes>
    </Router>
  </StrictMode>
)