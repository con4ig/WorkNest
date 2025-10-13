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
import Leave from './models/Leave.js';

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
// app.get('/api/users', authenticate, authorize('hr', 'admin'), async (req, res) => {
//   try {
//     // Pobierz wszystkich userów, ale bez hasła
//     const users = await User.find().select('-password');
    
//     res.json({
//       count: users.length,
//       users: users
//     });
//   } catch (err) {
//     console.error('Error fetching users:', err);
//     res.status(500).json({ message: 'Błąd serwera' });
//   }
// });

app.get('/api/users', authenticate, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = {};
    
    // Jeśli jest parametr search - filtruj po username lub email
    if (search && search.trim().length >= 2) {
      query = {
        $or: [
          { username: { $regex: search.trim(), $options: 'i' } }, // case-insensitive
          { email: { $regex: search.trim(), $options: 'i' } }
        ]
      };
    }
    
    const users = await User.find(query).select('-password');
    res.json({ count: users.length, users: users });
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

// PATCH /api/projects/:id/users - dodaj/usuń użytkownika z projektu
app.patch('/api/projects/:id/users', authenticate, authorize('admin', 'hr'), async (req, res) => {
  const { userId, action } = req.body;
  
  if (!userId || !action) {
    return res.status(400).json({ message: 'userId i action są wymagane' });
  }
  
  if (!['add', 'remove'].includes(action)) {
    return res.status(400).json({ message: 'action musi być "add" lub "remove"' });
  }
  
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Projekt nie znaleziony' });
    }
    
    if (action === 'add') {
      // Dodaj użytkownika (jeśli nie jest już przypisany)
      if (!project.assignedUsers.includes(userId)) {
        project.assignedUsers.push(userId);
      }
    } else if (action === 'remove') {
      // Usuń użytkownika (ale nie twórcy projektu)
      if (project.createdBy.toString() === userId) {
        return res.status(400).json({ message: 'Nie można usunąć twórcy projektu' });
      }
      project.assignedUsers = project.assignedUsers.filter(
        id => id.toString() !== userId
      );
    }
    
    await project.save();
    
    // Zwróć zaktualizowany projekt z populated users
    const updatedProject = await Project.findById(project._id)
      .populate('assignedUsers', 'username email role')
      .populate('createdBy', 'username');
    
    res.json({
      message: `Użytkownik ${action === 'add' ? 'dodany' : 'usunięty'} pomyślnie`,
      project: updatedProject
    });
  } catch (err) {
    console.error('Error updating project users:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

// GET /api/projects - lista wszystkich projektów
app.get('/api/projects', authenticate, async (req, res) => {
    try {
        // 1. POBIERANIE PARAMETRÓW Z URL
        const { status, sortBy, limit } = req.query;
        const limitNum = parseInt(limit) || 0; // Przekształcamy limit na liczbę
        
        // Zmienna do budowania warunków Mongoose (find)
        let query = {};
        
        // Domyślne opcje sortowania (można je nadpisać)
        let sortOptions = { createdAt: -1 }; 

        // 2. FILTROWANIE PO ROLI/UŻYTKOWNIKU
        // Jeśli user jest 'employee', filtrujemy po przypisanych użytkownikach
        if (req.user.role === 'employee') {
            // Używamy ID użytkownika do filtrowania projektów, do których jest przypisany
            query.assignedUsers = req.user.id; 
        }
        
        // 3. FILTROWANIE PO STATUSIE (OPCJONALNE)
        if (status) {
            query.status = status;
        }

        // 4. USTALANIE SORTOWANIA
        // Na podstawie parametru sortBy (np. ?sortBy=createdAt:desc)
        if (sortBy === 'createdAt:desc') {
            sortOptions = { createdAt: -1 };
        } else if (sortBy === 'name:asc') {
            // Przykład innego sortowania
            sortOptions = { name: 1 };
        }
        
        // 5. BUDOWANIE ZAPYTANIA
        let projectsQuery = Project.find(query)
            .populate('assignedUsers', 'username email')
            .populate('createdBy', 'username')
            .sort(sortOptions); // Zastosowanie dynamicznych opcji sortowania

        // 6. LIMITOWANIE (KLUCZOWY KROK DLA TWOJEGO ZAGADNIENIA)
        if (limitNum > 0) {
            // Zastosowanie limitu po sortowaniu
            projectsQuery = projectsQuery.limit(limitNum);
        }
        
        // 7. WYKONANIE ZAPYTANIA
        const projects = await projectsQuery.exec();
        
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

// GET /api/leaves - lista urlopów
app.get('/api/leaves', authenticate, async (req, res) => {
  try {
    let query = {};
    
    // Employee widzi tylko swoje
    if (req.user.role === 'employee') {
      query.user = req.user.id;
    }
    
    // Optional filters
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    const leaves = await Leave.find(query)
      .populate('user', 'username email')
      .populate('reviewedBy', 'username')
      .sort({ createdAt: -1 });
    
    res.json({
      count: leaves.length,
      leaves
    });
  } catch (err) {
    console.error('Error fetching leaves:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

// GET /api/leaves/my - moje urlopy (dla employee dashboard)
app.get('/api/leaves/my', authenticate, async (req, res) => {
  try {
    const leaves = await Leave.find({ user: req.user.id })
      .populate('reviewedBy', 'username')
      .sort({ createdAt: -1 });
    
    const stats = {
      pending: leaves.filter(l => l.status === 'pending').length,
      approved: leaves.filter(l => l.status === 'approved').length,
      rejected: leaves.filter(l => l.status === 'rejected').length,
      totalDays: leaves
        .filter(l => l.status === 'approved')
        .reduce((sum, l) => sum + l.days, 0)
    };
    
    res.json({ leaves, stats });
  } catch (err) {
    console.error('Error fetching my leaves:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

// GET /api/leaves/:id - szczegóły urlopu
app.get('/api/leaves/:id', authenticate, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('user', 'username email')
      .populate('reviewedBy', 'username');
    
    if (!leave) {
      return res.status(404).json({ message: 'Wniosek nie znaleziony' });
    }
    
    // Employee może zobaczyć tylko swoje
    if (req.user.role === 'employee' && leave.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Brak dostępu' });
    }
    
    res.json(leave);
  } catch (err) {
    console.error('Error fetching leave:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

// POST /api/leaves - utworzenie wniosku urlopowego
app.post('/api/leaves', authenticate, async (req, res) => {
  const { leaveType, startDate, endDate, reason } = req.body;
  
  if (!startDate || !endDate || !reason) {
    return res.status(400).json({ 
      message: 'Data rozpoczęcia, zakończenia i powód są wymagane' 
    });
  }
  
  // Oblicz liczbę dni
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  
  if (days <= 0) {
    return res.status(400).json({ 
      message: 'Data zakończenia musi być po dacie rozpoczęcia' 
    });
  }
  
  try {
    const leave = new Leave({
      user: req.user.id,
      leaveType: leaveType || 'vacation',
      startDate,
      endDate,
      reason,
      days,
      status: 'pending'
    });
    
    await leave.save();
    
    const populatedLeave = await Leave.findById(leave._id)
      .populate('user', 'username email');
    
    res.status(201).json({
      message: 'Wniosek urlopowy złożony pomyślnie',
      leave: populatedLeave
    });
  } catch (err) {
    console.error('Error creating leave:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

// PATCH /api/leaves/:id/approve - zatwierdzenie urlopu (HR/Admin)
app.patch('/api/leaves/:id/approve', authenticate, authorize('hr', 'admin'), async (req, res) => {
  const { reviewNote } = req.body;
  
  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      {
        status: 'approved',
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
        reviewNote: reviewNote || ''
      },
      { new: true }
    )
      .populate('user', 'username email')
      .populate('reviewedBy', 'username');
    
    if (!leave) {
      return res.status(404).json({ message: 'Wniosek nie znaleziony' });
    }
    
    res.json({
      message: 'Wniosek zatwierdzony',
      leave
    });
  } catch (err) {
    console.error('Error approving leave:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

// PATCH /api/leaves/:id/reject - odrzucenie urlopu (HR/Admin)
app.patch('/api/leaves/:id/reject', authenticate, authorize('hr', 'admin'), async (req, res) => {
  const { reviewNote } = req.body;
  
  if (!reviewNote) {
    return res.status(400).json({ 
      message: 'Powód odrzucenia jest wymagany' 
    });
  }
  
  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
        reviewNote
      },
      { new: true }
    )
      .populate('user', 'username email')
      .populate('reviewedBy', 'username');
    
    if (!leave) {
      return res.status(404).json({ message: 'Wniosek nie znaleziony' });
    }
    
    res.json({
      message: 'Wniosek odrzucony',
      leave
    });
  } catch (err) {
    console.error('Error rejecting leave:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

// DELETE /api/leaves/:id - usunięcie wniosku (tylko swoje, tylko pending)
app.delete('/api/leaves/:id', authenticate, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({ message: 'Wniosek nie znaleziony' });
    }
    
    // Tylko własne wnioski
    if (leave.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Brak uprawnień' });
    }
    
    // Tylko pending można usunąć
    if (leave.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Można usunąć tylko oczekujące wnioski' 
      });
    }
    
    await Leave.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Wniosek usunięty' });
  } catch (err) {
    console.error('Error deleting leave:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

app.delete('api/projects/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);
    if (!deletedProject) {
      return res.status(404).json({ message: 'Projekt nie znaleziony' });
    }
    res.status(200).json({ message: 'Projekt usunięty pomyślnie' });
  } catch (error) {
    res.status(500).json({ message: 'Błąd serwera', error });
  }
});


app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});