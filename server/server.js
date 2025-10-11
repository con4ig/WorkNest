import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import User from './models/User.js';
import Project from './models/Project.js';
import authenticate from './middleware/authenticate.js';
import emailRoutes from './routes/email.js';
import authRoutes from './routes/auth.js';
import authorize from './middleware/authorize.js';

dotenv.config();

const app = express();
app.use(cors({
  origin: 'http://localhost:5173', // adres frontendu
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 5500;

// Połączenie z MongoDB
mongoose.connect(process.env.DB_URI)
.then(() => console.log('Połączono z MongoDB 💚'))
.catch((err) => console.error('Błąd połączenia:', err));

// Trasy
app.use('/api/email', emailRoutes);
app.use('/api/auth', authRoutes);

// Wylogowanie użytkownika
app.post('/api/auth/logout', (req, res) => { 
  res.clearCookie('token');
  res.json({ message: 'Wylogowano pomyślnie' });
});

// Pobieranie danych zalogowanego użytkownika
app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    });
  } catch (err) {
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

// GET /api/users - lista wszystkich pracowników (tylko HR `i Admin)
app.get('/api/users', authenticate, authorize('hr', 'admin'), async (req, res) => {
  try {
    // Pobierz wszystkich userów, ale bez hasła
    const users = await User.find().select('-password');
    
    res.json({
      count: users.length,
      users: users
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

// PATCH /api/users/:id/role - zmiana roli użytkownika (tylko Admin)
app.patch('/api/users/:id/role', authenticate, authorize('admin'), async (req, res) => {
  const { role } = req.body;
  
  // Walidacja roli
  if (!['employee', 'hr', 'admin'].includes(role)) {
    return res.status(400).json({ 
      message: 'Nieprawidłowa rola. Dozwolone: employee, hr, admin' 
    });
  }
  
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true } // zwróć zaktualizowanego usera
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
    }
    
    res.json({ 
      message: 'Rola zmieniona pomyślnie', 
      user 
    });
  } catch (err) {
    console.error('Error updating role:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

// GET /api/projects - lista wszystkich projektów
app.get('/api/projects', authenticate, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = {};
    
    // Jeśli user jest employee - pokaż tylko jego projekty
    if (req.user.role === 'employee') {
      query.assignedUsers = req.user.id;
    }
    
    // Filter by status (optional)
    if (status) {
      query.status = status;
    }
    
    const projects = await Project.find(query)
      .populate('assignedUsers', 'username email')
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
    
    res.json({ 
      count: projects.length, 
      projects 
    });
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

// GET /api/projects/stats - statystyki projektów (dla dashboard)
app.get('/api/projects/stats', authenticate, async (req, res) => {
  try {
    let query = {};
    
    // Employee widzi tylko swoje projekty
    if (req.user.role === 'employee') {
      query.assignedUsers = req.user.id;
    }
    
    const total = await Project.countDocuments(query);
    const pending = await Project.countDocuments({ ...query, status: 'pending' });
    const running = await Project.countDocuments({ ...query, status: 'running' });
    const completed = await Project.countDocuments({ ...query, status: 'completed' });
    
    res.json({
      total,
      pending,
      running,
      completed
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

// GET /api/projects/:id - szczegóły projektu
app.get('/api/projects/:id', authenticate, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('assignedUsers', 'username email role')
      .populate('createdBy', 'username');
    
    if (!project) {
      return res.status(404).json({ message: 'Projekt nie znaleziony' });
    }
    
    // Employee może zobaczyć tylko swoje projekty
    if (req.user.role === 'employee') {
      const isAssigned = project.assignedUsers.some(
        u => u._id.toString() === req.user.id
      );
      if (!isAssigned) {
        return res.status(403).json({ message: 'Brak dostępu do tego projektu' });
      }
    }
    
    res.json(project);
  } catch (err) {
    console.error('Error fetching project:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

// POST /api/projects - utworzenie nowego projektu (admin/hr)
app.post('/api/projects', authenticate, authorize('admin', 'hr'), async (req, res) => {
  const { name, description, status, priority, startDate, endDate, assignedUsers } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Nazwa projektu jest wymagana' });
  }
  
  try {
    const project = new Project({
      name,
      description,
      status: status || 'pending',
      priority: priority || 'medium',
      startDate,
      endDate,
      assignedUsers: assignedUsers || [],
      createdBy: req.user.id
    });
    
    await project.save();
    
    const populatedProject = await Project.findById(project._id)
      .populate('assignedUsers', 'username email')
      .populate('createdBy', 'username');
    
    res.status(201).json({ 
      message: 'Projekt utworzony pomyślnie', 
      project: project 
    });
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

// PATCH /api/projects/:id - aktualizacja projektu (admin/hr)
app.patch('/api/projects/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        const projectId = req.params.id;
        const updates = req.body; // Zawiera name, description, status, priority, progress, startDate, endDate

        // UWAGA: Zabezpiecz aktualizację, aby np. nie można było zmieniać 'createdBy'
        const result = await Project.findByIdAndUpdate(projectId, updates, { new: true, runValidators: true });

        if (!result) {
            return res.status(404).json({ message: 'Projekt nie znaleziony.' });
        }

        res.json({ message: 'Projekt zaktualizowany pomyślnie.', project: result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.patch('/api/projects/:id/users', authenticate, async (req, res) => {
  const { userId, action } = req.body;
  const projectId = req.params.id;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Projekt nie znaleziony' });
    }

    if (action === 'add') {
      if (!project.assignedUsers.includes(userId)) {
        project.assignedUsers.push(userId);
      }
    } else if (action === 'remove') {
      project.assignedUsers = project.assignedUsers.filter(
        id => id.toString() !== userId.toString() // Fix comparison
      );
    }

    await project.save();
    
    // Return updated project with populated users
    const updatedProject = await Project.findById(projectId)
      .populate('assignedUsers', 'username email role')
      .populate('createdBy', 'username');
      
    res.json({ 
      message: 'Użytkownicy zaktualizowani pomyślnie',
      project: updatedProject
    });
  } catch (err) {
    console.error('Error updating project users:', err);
    res.status(500).json({ message: 'Błąd serwera', error: err.message });
  }
});

// DELETE /api/projects/:id - usunięcie projektu (tylko admin)
app.delete('/api/projects/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Projekt nie znaleziony' });
    }
    
    res.json({ message: 'Projekt usunięty' });
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});