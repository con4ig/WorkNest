import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import User from './models/User.js';
import authenticate from './middleware/authenticate.js';
import emailRoutes from './routes/email.js';
import authRoutes from './routes/auth.js';
import authorize from './middleware/authorize.js';

dotenv.config();

const app = express();
app.use(cors({
  origin: 'http://localhost:5173', // adres frontendu
  credentials: true // pozwala na przesyłanie ciasteczek
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

// GET /api/users - lista wszystkich pracowników (tylko HR i Admin)
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

app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});