import express from "express";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import Company from "../models/Company.js";
import Invitation from "../models/Invitation.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();
const saltRounds = 10;

// ============================================
// POST /api/auth/register
// Rejestracja użytkownika i obsługa firm
// ============================================
router.post("/register", async (req, res) => {
  const { username, email, password, role, companyName, invitationCode } =
    req.body;

  if (!username || !email || !password || !role) {
    return res.status(400).json({ message: "Wszystkie pola są wymagane" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Użytkownik o tym adresie email już istnieje" });
    }

    // Rozpocznij sesję dla transakcji
    const session = await mongoose.startSession();

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    let companyId;

    if (role === "admin") {
      if (!companyName) {
        return res
          .status(400)
          .json({ message: "Nazwa firmy jest wymagana dla administratora" });
      }

      let savedUser, savedCompany;

      try {
        await session.withTransaction(async () => {
          // 1. Stwórz nową firmę
          const newCompany = new Company({
            name: companyName,
            owner: null, // Zostanie ustawiony po utworzeniu użytkownika
          });

          // 2. Stwórz użytkownika (administratora)
          const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: "admin",
            company: newCompany._id, // Przypisz ID firmy do użytkownika
          });

          // Zapisz użytkownika w ramach sesji
          const userResult = await newUser.save({ session });

          // 3. Ustaw właściciela firmy i zapisz firmę
          newCompany.owner = userResult._id;
          const companyResult = await newCompany.save({ session });

          savedUser = userResult;
          savedCompany = companyResult;
        });
      } finally {
        // Zakończ sesję
        session.endSession();
      }

      return res.status(201).json({
        message: "Firma i administrator zostali pomyślnie zarejestrowani",
        user: {
          _id: savedUser._id,
          username: savedUser.username,
          role: savedUser.role,
          company: savedCompany._id,
        },
        company: {
          _id: savedCompany._id,
          name: savedCompany.name,
        },
      });
    } else if (role === "employee") {
      if (!invitationCode) {
        return res
          .status(400)
          .json({ message: "Kod zaproszenia jest wymagany dla pracownika" });
      }

      // Znajdź zaproszenie, które pasuje do kodu i nie wygasło
      const invitation = await Invitation.findOne({
        code: invitationCode,
        expiresAt: { $gt: new Date() },
      });

      if (!invitation) {
        return res
          .status(404)
          .json({ message: "Nieprawidłowy lub wygasły kod zaproszenia" });
      }

      // Pobierz ID firmy z zaproszenia
      companyId = invitation.company;

      // Opcjonalnie: usuń zaproszenie po użyciu, aby zapobiec ponownemu wykorzystaniu
      await Invitation.findByIdAndDelete(invitation._id);

      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        role: "employee",
        company: companyId,
      });

      const savedUser = await newUser.save();

      return res.status(201).json({
        message: "Pracownik został pomyślnie zarejestrowany",
        user: {
          _id: savedUser._id,
          username: savedUser.username,
          role: savedUser.role,
        },
      });
    } else {
      return res
        .status(400)
        .json({ message: "Nieprawidłowa rola użytkownika" });
    }
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Błąd serwera podczas rejestracji" });
  }
});

// ============================================
// POST /api/auth/login
// Logowanie użytkownika
// ============================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email i hasło są wymagane" });
    }

    const user = await User.findOne({ email }).populate("company", "name");
    if (!user) {
      return res.status(401).json({ message: "Nieprawidłowe dane logowania" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Nieprawidłowe dane logowania" });
    }

    const tokenPayload = {
      _id: user._id,
      email: user.email,
      role: user.role,
      company: user.company ? user.company._id : null,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Zalogowano pomyślnie",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        company: user.company,
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
    // req.user jest już w pełni załadowany przez middleware authenticate
    if (!req.user) {
      return res.status(401).json({ message: "Nie jesteś zalogowany" });
    }

    res.json(req.user); // Zwróć cały obiekt użytkownika
  } catch (err) {
    console.error("Get me error:", err);
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

export default router;
