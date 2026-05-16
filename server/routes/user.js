import express from "express";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import multer from "multer";
import {
  getUsers,
  getCurrentUser,
  getUserById,
  updateUser,
  updateUserRole,
  uploadProfileImage,
  getProfileImage,
  deleteProfileImage,
  generateInvitation,
  getInvitations,
  revokeInvitation,
  importUsersFromCSV,
} from "../controllers/userController.js";

const router = express.Router();

// Multer config - store in memory, not on disk
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

const csvUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    // Check mime type and extension
    if (
      file.mimetype === "text/csv" ||
      file.mimetype === "application/vnd.ms-excel" || // Excel often saves CSV with this mime
      file.originalname.toLowerCase().endsWith(".csv")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  },
});

/**
 * @openapi
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: List employees in the caller's company (hr/admin)
 *     description: |
 *       Tenant-scoped: returns only users from the caller's company unless
 *       the caller is a superadmin. Optional `search` performs a
 *       case-insensitive partial match across username, email, firstName and
 *       lastName.
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string, minLength: 2 }
 *         description: Free-text filter. Ignored if shorter than 2 chars.
 *     responses:
 *       200:
 *         description: User list.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count: { type: integer }
 *                 users:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/User' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get("/", authenticate, authorize("hr", "admin"), getUsers);

/**
 * @openapi
 * /api/users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get the currently authenticated user
 *     description: |
 *       Returns the user document already populated by the `authenticate`
 *       middleware (including the embedded `company` object). The frontend
 *       calls this on app boot to hydrate the auth context.
 *     responses:
 *       200:
 *         description: Current user.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.get("/me", authenticate, getCurrentUser);

/**
 * @openapi
 * /api/users/{id}:
 *   patch:
 *     tags: [Users]
 *     summary: Update employee data (self, or hr/admin for others)
 *     description: |
 *       Employees may edit their own profile only; HR/admin may edit any
 *       user inside the same tenant. Role changes are admin-only — an
 *       employee passing `role` gets 403. Email uniqueness is enforced.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:     { type: string }
 *               email:        { type: string, format: email }
 *               firstName:    { type: string }
 *               lastName:     { type: string }
 *               phoneNumber:  { type: string }
 *               position:     { type: string }
 *               department:   { type: string }
 *               hireDate:     { type: string, format: date }
 *               salary:       { type: number, minimum: 0 }
 *               status:
 *                 type: string
 *                 enum: [active, inactive, on-leave, terminated]
 *               contractType:
 *                 type: string
 *                 enum: [full-time, part-time, contract, temporary]
 *               role:
 *                 type: string
 *                 enum: [employee, hr, admin]
 *                 description: Admin only — ignored for non-admin callers.
 *               address:      { type: string }
 *               city:         { type: string }
 *               peselOrId:    { type: string }
 *               notes:        { type: string }
 *               employmentHistory:
 *                 type: array
 *                 items: { type: object }
 *     responses:
 *       200:
 *         description: User updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 user:    { $ref: '#/components/schemas/User' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.patch("/:id", authenticate, updateUser);

/**
 * @openapi
 * /api/users/{id}/role:
 *   patch:
 *     tags: [Users]
 *     summary: Change a user's role (admin only)
 *     description: |
 *       Dedicated endpoint so RBAC can audit role escalations independently
 *       of generic profile edits. Tenant-scoped: admins cannot change roles
 *       of users in another company.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [employee, hr, admin]
 *     responses:
 *       200:
 *         description: Role updated.
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.patch(
  "/:id/role",
  authenticate,
  authorize("admin"),
  updateUserRole
);

/**
 * @openapi
 * /api/users/generate-invitation:
 *   post:
 *     tags: [Users]
 *     summary: Generate an invitation code for new employees/HR (admin)
 *     description: |
 *       Issues a single-use (or multi-use) code bound to the admin's company.
 *       Recipients redeem it on `POST /api/auth/register` to be auto-attached
 *       to the right tenant — see ADR-0003.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               maxUses:
 *                 type: integer
 *                 minimum: 1
 *                 default: 1
 *               expiresIn:
 *                 type: string
 *                 description: 'Duration suffixed with `m`, `h` or `d` (e.g. "30m", "24h", "7d"). Defaults to 5 minutes.'
 *                 example: 24h
 *               role:
 *                 type: string
 *                 enum: [employee, hr]
 *                 default: employee
 *     responses:
 *       201:
 *         description: Invitation created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:        { type: string }
 *                 invitationCode: { type: string }
 *                 invitation:     { type: object }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.post(
  "/generate-invitation",
  authenticate,
  authorize("admin"),
  generateInvitation
);

/**
 * @openapi
 * /api/users/invitations:
 *   get:
 *     tags: [Users]
 *     summary: List invitation codes for the admin's company
 *     description: |
 *       Lazily purges expired invitations before returning the list, so the
 *       admin dashboard always sees a fresh state.
 *     responses:
 *       200:
 *         description: Invitations list.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { type: object }
 *       400:
 *         description: Caller has no company assigned.
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get(
  "/invitations",
  authenticate,
  authorize("admin"),
  getInvitations
);

/**
 * @openapi
 * /api/users/invitations/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Revoke an invitation code (admin)
 *     description: |
 *       Tenant-scoped: an admin can only revoke invitations belonging to
 *       their own company.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Invitation removed.
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.delete(
  "/invitations/:id",
  authenticate,
  authorize("admin"),
  revokeInvitation
);

/**
 * @openapi
 * /api/users/import-csv:
 *   post:
 *     tags: [Users]
 *     summary: Bulk-create users from a CSV file (hr/admin)
 *     description: |
 *       Accepts a UTF-8 CSV (max 5 MB) whose first row holds the column
 *       headers matching User schema fields. Each row becomes a new user
 *       inside the caller's company; duplicates by email are skipped and
 *       returned in `failedSamples`. Imported users are forced to change
 *       their password on first login.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: 'CSV file with headers matching user fields (e.g. "email,username,firstName,...").'
 *               password:
 *                 type: string
 *                 description: Temporary password for all imported users. Defaults to `WorkNest123!`.
 *     responses:
 *       200:
 *         description: Import summary.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:         { type: string }
 *                 processed:       { type: integer }
 *                 created:         { type: integer }
 *                 failedCount:     { type: integer }
 *                 failedSamples:
 *                   type: array
 *                   items: { type: object }
 *                 defaultPassword: { type: string }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.post(
  "/import-csv",
  authenticate,
  authorize("hr", "admin"),
  csvUpload.single("file"),
  importUsersFromCSV
);

/**
 * @openapi
 * /api/users/profile-image:
 *   put:
 *     tags: [Users]
 *     summary: Upload or replace the caller's profile image
 *     description: |
 *       Accepts an image file (max 5 MB). The file is stored inline as a
 *       base64 data URL on the User document so it can be served without an
 *       object store — see ADR-0006.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image saved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:      { type: string }
 *                 profileImage:
 *                   type: string
 *                   description: 'Data URL, e.g. "data:image/png;base64,iVBOR..."'
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.put(
  "/profile-image",
  authenticate,
  upload.single("image"),
  uploadProfileImage
);

/**
 * @openapi
 * /api/users/profile-image:
 *   get:
 *     tags: [Users]
 *     summary: Get the caller's profile image as a data URL
 *     responses:
 *       200:
 *         description: Image data URL.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profileImage: { type: string }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404:
 *         description: No profile image set.
 */
router.get("/profile-image", authenticate, getProfileImage);

/**
 * @openapi
 * /api/users/profile-image:
 *   delete:
 *     tags: [Users]
 *     summary: Remove the caller's profile image
 *     responses:
 *       200:
 *         description: Image cleared.
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.delete("/profile-image", authenticate, deleteProfileImage);



/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get full profile of a single user
 *     description: |
 *       Tenant-scoped (ADR-0002). Employees may only read their own profile;
 *       HR/admin may read any user in the same company. Declared LAST in
 *       this router so the `/invitations`, `/me`, `/profile-image`, etc.
 *       paths don't get swallowed by the `:id` wildcard.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User profile (all known fields, empty strings for unset).
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get("/:id", authenticate, getUserById);

export default router;
