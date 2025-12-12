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
} from "../controllers/userController.js";

const router = express.Router();

// Konfiguracja multer - przechowuj w pamięci, nie na dysku
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

// ============================================
// GET /api/users
// Lista wszystkich pracowników (HR i Admin)
// ============================================
router.get("/", authenticate, authorize("hr", "admin"), getUsers);

// ============================================
// GET /api/users/me
// Pobieranie danych zalogowanego użytkownika
// ============================================
router.get("/me", authenticate, getCurrentUser);

// ============================================
// GET /api/users/:id
// Pobieranie danych konkretnego pracownika
// ============================================
// router.get("/:id", authenticate, getUserById); // Moved down to avoid collision with /invitations

// ============================================
// PATCH /api/users/:id
// Aktualizacja danych pracownika
// ============================================
router.patch("/:id", authenticate, updateUser);

// ============================================
// PATCH /api/users/:id/role
// Zmiana roli użytkownika (tylko Admin)
// ============================================
router.patch(
  "/:id/role",
  authenticate,
  authorize("admin"),
  updateUserRole
);

router.post(
  "/generate-invitation",
  authenticate,
  authorize("admin"),
  generateInvitation
);

router.get(
  "/invitations",
  authenticate,
  authorize("admin"),
  getInvitations
);

router.delete(
  "/invitations/:id",
  authenticate,
  authorize("admin"),
  revokeInvitation
);

// Endpoint do uploadu zdjęcia profilowego
router.put(
  "/profile-image",
  authenticate,
  upload.single("image"),
  uploadProfileImage
);

// Endpoint do pobierania zdjęcia profilowego (opcjonalny)
router.get("/profile-image", authenticate, getProfileImage);

// Endpoint do usunięcia zdjęcia profilowego
router.delete("/profile-image", authenticate, deleteProfileImage);



// ============================================
// GET /api/users/:id
// Pobieranie danych konkretnego pracownika
// ============================================
// To musi być NA SAMYM KOŃCU, żeby nie przechwytywać innych tras (np. /invitations)
router.get("/:id", authenticate, getUserById);

export default router;
