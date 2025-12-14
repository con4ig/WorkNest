import bcrypt from "bcrypt";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import Company from "../models/Company.js";
import Invitation from "../models/Invitation.js";
import Task from "../models/Task.js";
import Leave from "../models/Leave.js";
import Project from "../models/Project.js";

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

      // Sprawdź czy kod nie został zużyty (dla bezpieczeństwa, choć expiresAt powinno wystarczyć, jeśli usuwamy)
      if (invitation.maxUses > 0 && invitation.uses >= invitation.maxUses) {
         return res.status(400).json({ message: "Limit użyć tego kodu został wyczerpany" });
      }

      companyId = invitation.company;
      
      // Zwiększ licznik użyć
      invitation.uses += 1;
      
      // Jeśli osiągnięto limit -> usuń kod, w przeciwnym razie zapisz zaktualizowany licznik
      if (invitation.maxUses > 0 && invitation.uses >= invitation.maxUses) {
         await Invitation.findByIdAndDelete(invitation._id);
      } else {
         await invitation.save();
      }

      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        role: invitation.role || role, // Użyj roli z zaproszenia (jeśli jest), fallback do roli z requestu (ale z zaproszenia bezpieczniej)
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
        mustChangePassword: user.mustChangePassword,
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
        mustChangePassword: user.mustChangePassword,
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

export const changePassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const userId = req.user._id;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: "Hasło musi mieć co najmniej 6 znaków" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Użytkownik nie znaleziony" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        user.mustChangePassword = false;
        await user.save();

        res.json({ message: "Hasło zostało zmienione pomyślnie" });

    } catch (err) {
        console.error("Change password error:", err);
        res.status(500).json({ message: "Błąd serwera podczas zmiany hasła" });
    }
};

export const demoLogin = async (req, res) => {
    try {
        const DEMO_EMAIL = 'demo@worknest.com';
        const DEMO_COMPANY_NAME = 'Demo Company';

        const session = await mongoose.startSession();
        
        try {
            await session.withTransaction(async () => {
                // 1. Find existing Demo Company
                const existingCompany = await Company.findOne({ name: DEMO_COMPANY_NAME }).session(session);
                
                if (existingCompany) {
                    // Wipe everything related to this company
                    const companyId = existingCompany._id;
                    await User.deleteMany({ company: companyId }).session(session);
                    await Leave.deleteMany({ company: companyId }).session(session);
                    await Project.deleteMany({ company: companyId }).session(session);
                    await Task.deleteMany({ company: companyId }).session(session);
                    await Company.deleteOne({ _id: companyId }).session(session);
                }

                // 2. Create Fresh Demo Environment & Users (Circular dependency handling)
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash('demo123', salt);
                const invitationCode = crypto.randomBytes(8).toString("hex");

                // Prepare Company instance (do not save yet)
                const newCompany = new Company({
                    name: DEMO_COMPANY_NAME,
                    invitationCode,
                    // owner will be set below
                });

                // Prepare Admin instance
                const demoAdmin = new User({
                    username: 'Demo Admin',
                    email: DEMO_EMAIL,
                    password: hashedPassword,
                    role: 'admin',
                    company: newCompany._id,
                    position: 'CEO',
                    department: 'Management'
                });

                // Link Owner to Company
                newCompany.owner = demoAdmin._id;

                // Save both (order doesn't strict matter for validation as long as fields are set)
                await newCompany.save({ session });
                await demoAdmin.save({ session });

                // HR
                const demoHR = new User({
                    username: 'Anna HR',
                    email: 'hr@demo.com',
                    password: hashedPassword,
                    role: 'hr',
                    company: newCompany._id,
                    position: 'HR Manager',
                    department: 'HR'
                });
                await demoHR.save({ session });

                // Employee
                const demoEmp = new User({
                    username: 'Jan Pracownik',
                    email: 'employee@demo.com',
                    password: hashedPassword,
                    role: 'employee',
                    company: newCompany._id,
                    position: 'Developer',
                    department: 'IT',
                    salary: 8000
                });
                await demoEmp.save({ session });

                // 4. Create Sample Data (Leaves)
                const today = new Date();
                
                // Active leave for employee (Approved)
                const approvedLeave = new Leave({
                    user: demoEmp._id,
                    company: newCompany._id,
                    leaveType: 'vacation',
                    startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
                    endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
                    days: 5,
                    reason: 'Wakacje na Majorce',
                    status: 'approved',
                    reviewedBy: demoHR._id,
                    reviewedAt: new Date()
                });
                await approvedLeave.save({ session });

                // Pending leave for employee
                const pendingLeave = new Leave({
                    user: demoEmp._id,
                    company: newCompany._id,
                    leaveType: 'sick',
                    startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10),
                    endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 12),
                    days: 3,
                    reason: 'Planowany zabieg',
                    status: 'pending'
                });
                await pendingLeave.save({ session });

                 // Rejected leave for employee
                 const rejectedLeave = new Leave({
                    user: demoEmp._id,
                    company: newCompany._id,
                    leaveType: 'on_demand',
                    startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5),
                    endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 4),
                    days: 2,
                    reason: 'Nagła sprawa',
                    status: 'rejected',
                    reviewedBy: demoAdmin._id,
                    reviewedAt: new Date(),
                    reviewNote: 'Brak dostępnych dni'
                });
                await rejectedLeave.save({ session });
                // 5. Create Sample Projects
                const projectWeb = new Project({
                    name: 'Nowa Strona Internetowa',
                    description: 'Kompleksowa przebudowa strony firmowej z nowym designem i funkcjonalnościami e-commerce.',
                    status: 'running',
                    priority: 'high',
                    startDate: new Date(),
                    endDate: new Date(today.getFullYear(), today.getMonth() + 2, today.getDate()),
                    createdBy: demoAdmin._id,
                    company: newCompany._id,
                    assignedUsers: [demoAdmin._id, demoEmp._id],
                    progress: 35
                });
                await projectWeb.save({ session });

                const projectMarketing = new Project({
                    name: 'Kampania Q4',
                    description: 'Przygotowanie materiałów promocyjnych na czwarty kwartał.',
                    status: 'pending',
                    priority: 'medium',
                    startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
                    endDate: new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()),
                    createdBy: demoAdmin._id,
                    company: newCompany._id,
                    assignedUsers: [demoHR._id],
                    progress: 0
                });
                await projectMarketing.save({ session });

                const projectLegacy = new Project({
                    name: 'Migracja Bazy Danych',
                    description: 'Przeniesienie danych ze starego systemu ERP. Projekt zakończony sukcesem.',
                    status: 'completed',
                    priority: 'critical',
                    startDate: new Date(today.getFullYear(), today.getMonth() - 2, today.getDate()),
                    endDate: new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()),
                    createdBy: demoAdmin._id,
                    company: newCompany._id,
                    assignedUsers: [demoAdmin._id],
                    progress: 100
                });
                await projectLegacy.save({ session });

                // 6. Create Sample Tasks
                const task1 = new Task({
                    title: 'Przygotowanie makiet UX',
                    description: 'Stworzenie wstępnych makiet strony głównej i podstrony oferty.',
                    status: 'in-progress',
                    priority: 'high',
                    dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7),
                    project: projectWeb._id,
                    assignedUser: demoEmp._id,
                    createdBy: demoAdmin._id,
                    company: newCompany._id
                });
                await task1.save({ session });

                const task2 = new Task({
                    title: 'Konfiguracja serwera',
                    description: 'Postawienie środowiska deweloperskiego i konfiguracja bazy danych.',
                    status: 'completed',
                    priority: 'medium',
                    dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2),
                    project: projectWeb._id,
                    assignedUser: demoEmp._id,
                    createdBy: demoAdmin._id,
                    company: newCompany._id
                });
                await task2.save({ session });

                const task3 = new Task({
                    title: 'Lista słów kluczowych',
                    description: 'Analiza słów kluczowych pod kątem SEO.',
                    status: 'todo',
                    priority: 'low',
                    dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14),
                    project: projectMarketing._id,
                    assignedUser: demoHR._id,
                    createdBy: demoAdmin._id,
                    company: newCompany._id
                });
                await task3.save({ session });
            });
        } finally {
            session.endSession();
        }

        // 5. Login as Demo Admin
        const user = await User.findOne({ email: DEMO_EMAIL }).populate("company", "name");
        
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/",
        };

        res.cookie("refreshToken", refreshToken, cookieOptions);

        res.json({
            message: "Zalogowano do wersji Demo",
            accessToken,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                company: user.company,
                profileImage: user.profileImage || "",
                mustChangePassword: false,
            },
        });

    } catch (err) {
        console.error("Demo login error:", err);
        res.status(500).json({ message: "Błąd podczas generowania wersji demo" });
    }
};
