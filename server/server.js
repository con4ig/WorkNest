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

app.post('/api/auth/logout', (req, res) => { 
  res.clearCookie('token');
  res.json({ message: 'Wylogowano pomyślnie' });
});

// Bezpośrednio w MongoDB Compass albo przez endpoint (tymczasowy):
app.post('/api/dev/create-test-users', async (req, res) => {
  const users = [
    { username: 'Employee Test', email: 'employee@test.com', password: await bcrypt.hash('test123', 10), role: 'employee' },
    { username: 'HR Test', email: 'hr@test.com', password: await bcrypt.hash('test123', 10), role: 'hr' },
    { username: 'Admin Test', email: 'admin@test.com', password: await bcrypt.hash('test123', 10), role: 'admin' }
  ];
  
  await User.insertMany(users);
  res.json({ message: 'Test users created' });
});

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

app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});