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
router.get("/:id", authenticate, getUserById);

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

router.post(
  "/generate-invitation",
  authenticate,
  authorize("admin"),
  generateInvitation
);

export default router;
