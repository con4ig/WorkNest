import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import router from './email.js';

const app = express.Router();

// Logowanie użytkownika
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie istnieje' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = jwt.sign({ id: user._id, role: user.role, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // tylko HTTPS w produkcji
      sameSite: 'Strict',
      maxAge: 3600000 // 1h
      });
      res.json({ message: 'Zalogowano pomyślnie' });
    } else {
      res.status(401).json({ message: 'Nieprawidłowe dane logowania' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

// Rejestracja użytkownika
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Użytkownik o tym adresie e-mail już istnieje' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'Użytkownik zarejestrowany pomyślnie' });
  } catch (err) {
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

app.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie istnieje' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    res.json({ message: 'Hasło zostało zmienione pomyślnie' });
  } catch (err) {
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

export default app;