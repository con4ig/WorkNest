// routes/authRoutes.js - NAPRAWIONY z lepszym zwracaniem danych

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
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
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
        profileImage: user.profileImage || "",
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
    console.log("🔍 GET /api/auth/me - req.user:", req.user);

    // req.user jest ustawiony przez middleware authenticate
    if (!req.user || !req.user._id) {
      console.log("❌ Brak req.user lub req.user._id");
      return res.status(401).json({ message: "Nie jesteś zalogowany" });
    }

    const user = await User.findById(req.user._id).select("-password");
    
    if (!user) {
      console.log("❌ Użytkownik nie znaleziony w bazie:", req.user._id);
      return res.status(404).json({ message: "Użytkownik nie znaleziony" });
    }

    console.log("✅ Użytkownik znaleziony:", {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      hasProfileImage: !!user.profileImage
    });

    // Zwróć dane w czytelnej formie
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: user.profileImage || "",
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (err) {
    console.error("❌ Get me error:", err);
    res.status(500).json({ message: "Błąd serwera", error: err.message });
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
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  res.json({ message: "Wylogowano pomyślnie" });
});

// ============================================
// POST /api/auth/reset-password
// Resetowanie hasła użytkownika
// ============================================
router.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res
      .status(400)
      .json({ message: "Brak adresu email lub nowego hasła." });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Użytkownik nie znaleziony." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashedPassword;
    await user.save();

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
