import express from "express";
import { register, login, refresh, logout, changePassword } from "../controllers/authController.js";

const router = express.Router();

// ============================================
// POST /api/auth/register
// ============================================
router.post("/register", register);

// ============================================
// POST /api/auth/login
// ============================================
router.post("/login", login);

// ============================================
// POST /api/auth/refresh
// ============================================
router.post("/refresh", refresh);

// ============================================
// POST /api/auth/logout
// ============================================
router.post("/logout", logout);

// ============================================
// POST /api/auth/change-password
// ============================================
// Middleware authentication handles verifying the user is logged in
import authenticate from "../middleware/authenticate.js";
router.post("/change-password", authenticate, changePassword);

export default router;
