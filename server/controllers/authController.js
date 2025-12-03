import bcrypt from "bcrypt";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import Company from "../models/Company.js";
import Invitation from "../models/Invitation.js";

const saltRounds = 10;

// Pomocnicze funkcje do generowania tokenów
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      role: user.role,
      company: user.company ? user.company._id : null,
    },
    process.env.JWT_SECRET,
    { expiresIn: "15m" } // Krótki czas życia - 15 minut
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { _id: user._id },
    process.env.JWT_REFRESH_SECRET, // Osobny secret dla refresh token
    { expiresIn: "7d" } // Długi czas życia - 7 dni
  );
};

export const register = async (req, res) => {
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
          const invitationCode = crypto.randomBytes(8).toString("hex");

          const newCompany = new Company({
            name: companyName,
            owner: null,
            invitationCode,
          });

          const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: "admin",
            company: newCompany._id,
          });

          const userResult = await newUser.save({ session });
          newCompany.owner = userResult._id;
          const companyResult = await newCompany.save({ session });

          savedUser = userResult;
          savedCompany = companyResult;
        });
      } finally {
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
    } else if (role === "employee" || role === "hr") {
      if (!invitationCode) {
        return res
          .status(400)
          .json({ message: "Kod zaproszenia jest wymagany" });
      }

      const invitation = await Invitation.findOne({
        code: invitationCode,
        expiresAt: { $gt: new Date() },
      });

      if (!invitation) {
        return res
          .status(404)
          .json({ message: "Nieprawidłowy lub wygasły kod zaproszenia" });
      }

      companyId = invitation.company;
      await Invitation.findByIdAndDelete(invitation._id);

      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        role: invitation.role, // Użyj roli z zaproszenia
        company: companyId,
      });

      const savedUser = await newUser.save();

      return res.status(201).json({
        message: "Użytkownik został pomyślnie zarejestrowany",
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
};

export const login = async (req, res) => {
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

    // Generuj oba tokeny
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Ustaw refresh token w HttpOnly cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    };

    res.cookie("refreshToken", refreshToken, cookieOptions);

    // Zwróć access token w body (będzie przechowywany w pamięci React)
    res.json({
      message: "Zalogowano pomyślnie",
      accessToken, // Krótki token do pamięci
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
};

export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Brak refresh tokena" });
    }

    // Weryfikuj refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Pobierz użytkownika
    const user = await User.findById(decoded._id).populate("company", "name");

    if (!user) {
      return res.status(401).json({ message: "Użytkownik nie znaleziony" });
    }

    // Wygeneruj nowy access token
    const newAccessToken = generateAccessToken(user);

    res.json({
      accessToken: newAccessToken,
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
    console.error("Refresh token error:", err);
    // Czyść cookie jeśli refresh token jest zły
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: "/",
    });
    return res.status(403).json({ message: "Nieprawidłowy lub wygasły refresh token" });
  }
};

export const logout = (req, res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: "/",
  };

  res.clearCookie("refreshToken", cookieOptions);
  res.clearCookie("token", cookieOptions);

  res.json({ message: "Wylogowano pomyślnie" });
};
