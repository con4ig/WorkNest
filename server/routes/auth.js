import express from "express";
import {
  register,
  login,
  refresh,
  logout,
  changePassword,
  demoLogin,
} from "../controllers/authController.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new admin (with new company) or invited employee/HR
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password, role]
 *             properties:
 *               username: { type: string, example: jane.doe }
 *               email:    { type: string, format: email, example: jane@example.com }
 *               password: { type: string, format: password, minLength: 6 }
 *               role:     { type: string, enum: [admin, hr, employee] }
 *               companyName:
 *                 type: string
 *                 description: Required when role is `admin`.
 *               invitationCode:
 *                 type: string
 *                 description: Required when role is `hr` or `employee`.
 *     responses:
 *       201:
 *         description: User (and optionally company) created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 user:    { $ref: '#/components/schemas/User' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       409:
 *         description: Email already in use.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post("/register", register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Exchange email/password for an access token + refresh cookie
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, format: email }
 *               password: { type: string, format: password }
 *     responses:
 *       200:
 *         description: Login successful. Refresh token set as `httpOnly` cookie.
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: refreshToken=eyJhbGc...; HttpOnly; Secure; Path=/
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AuthResponse' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401:
 *         description: Invalid credentials.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post("/login", login);

/**
 * @openapi
 * /api/auth/demo-login:
 *   post:
 *     tags: [Auth]
 *     summary: Provision a fresh isolated demo tenant and log in as its admin
 *     description: |
 *       Creates a unique `Company` with `isDemo: true`, seeds sample users,
 *       one project, one task and one approved leave, and returns auth
 *       tokens for the demo admin. The sandbox self-destructs on `/logout`
 *       and via a 24-hour TTL index. See ADR-0004.
 *     security: []
 *     responses:
 *       200:
 *         description: Demo sandbox ready, tokens issued.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AuthResponse' }
 *       500:
 *         description: Error provisioning the demo sandbox.
 */
router.post("/demo-login", demoLogin);

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Issue a new access token from the refresh cookie
 *     security:
 *       - refreshCookie: []
 *     responses:
 *       200:
 *         description: New access token.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AuthResponse' }
 *       401:
 *         description: Refresh cookie missing.
 *       403:
 *         description: Refresh token invalid or expired.
 */
router.post("/refresh", refresh);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Clear auth cookies; for demo users, wipe the sandbox
 *     security:
 *       - refreshCookie: []
 *     responses:
 *       200:
 *         description: Logged out. Cookies cleared.
 */
router.post("/logout", logout);

/**
 * @openapi
 * /api/auth/change-password:
 *   post:
 *     tags: [Auth]
 *     summary: Change password for the authenticated user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [newPassword]
 *             properties:
 *               newPassword: { type: string, format: password, minLength: 6 }
 *     responses:
 *       200:
 *         description: Password updated.
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.post("/change-password", authenticate, changePassword);

export default router;
