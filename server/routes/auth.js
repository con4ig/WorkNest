// routes/authRoutes.js (POST /api/auth/login) - NAPRAWIONY

import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

const saltRounds = 10;

// ============================================
// POST /api/auth/login
// Logowanie użytkownika
// ============================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Walidacja
    if (!email || !password) {
      return res.status(400).json({ message: "Email i hasło są wymagane" });
    }

    // Znajdź użytkownika
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Nieprawidłowe dane logowania" });
    }

    // Sprawdź hasło
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Nieprawidłowe dane logowania" });
    }

    // Utwórz JWT token
    const token = jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Ustaw cookie z tokenem
    res.cookie("token", token, {
      httpOnly: true, // Nie dostępny z JS (zabezpieczenie XSS)
      secure: process.env.NODE_ENV === "production", // HTTPS tylko w produkcji
      sameSite: "lax", // CSRF protection
      maxAge: 24 * 60 * 60 * 1000, // 24 godziny
    });

    res.json({
      message: "Zalogowano pomyślnie",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Błąd serwera" });
  }
});

// ============================================
// GET /api/auth/me
// Pobierz dane aktualnie zalogowanego użytkownika
// ============================================
router.get("/me", authenticate, async (req, res) => {
  try {
    // req.user jest ustawiony przez middleware authenticate
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Nie jesteś zalogowany" });
    }

    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Użytkownik nie znaleziony" });
    }

    res.json(user);
  } catch (err) {
    console.error("Get me error:", err);
    res.status(500).json({ message: "Błąd serwera" });
  }
});

// ============================================
// POST /api/auth/logout
// Wylogowanie użytkownika
// ============================================
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.json({ message: "Wylogowano pomyślnie" });
});

router.post("/reset-password", async (req, res) => {
  // 1. Odbierz dane z ciała zapytania
  const { email, newPassword } = req.body;

  // 2. Prosta walidacja obecności danych
  if (!email || !newPassword) {
    return res
      .status(400)
      .json({ message: "Brak adresu email lub nowego hasła." });
  }

  try {
    // 3. Znajdź użytkownika po emailu
    const user = await User.findOne({ email });

    if (!user) {
      // W celach bezpieczeństwa, aby nie ujawniać, czy konto istnieje,
      // można zwrócić ogólny komunikat.
      return res.status(404).json({ message: "Użytkownik nie znaleziony." });
    }

    // 4. Zahashuj nowe hasło
    // Użyj bcryptjs (lub innej biblioteki) do bezpiecznego hashowania
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // 5. Zaktualizuj hasło w bazie danych
    user.password = hashedPassword;
    await user.save(); // Zapisanie zmian w dokumencie

    // 6. Odpowiedź sukcesu
    return res
      .status(200)
      .json({ message: "Hasło zostało pomyślnie zresetowane." });
  } catch (err) {
    console.error("❌ Błąd resetowania hasła:", err);
    return res.status(500).json({
      message: "Wystąpił błąd serwera podczas zmiany hasła.",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

export default router;
