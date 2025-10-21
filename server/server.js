import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import User from './models/User.js';
import Leave from './models/Leave.js';
import authenticate from './middleware/authenticate.js';
import authorize from './middleware/authorize.js';
import emailRoutes from './routes/email.js';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/project.js';
import leaveRoutes from './routes/leave.js';
import userRoutes from './routes/user.js';

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
app.use('/api/projects', projectRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/users', userRoutes);

// Wylogowanie użytkownika
app.post('/api/auth/logout', (req, res) => { 
  res.clearCookie('token');
  res.json({ message: 'Wylogowano pomyślnie' });
});

// Pobieranie danych zalogowanego użytkownika
app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
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


app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});