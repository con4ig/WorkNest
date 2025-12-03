import express from "express";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import {
  updateProjectUsers,
  getProjects,
  getProjectStats,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getUserAssignedProjectsSummary,
  getStatsSummary,
} from "../controllers/projectController.js";

const router = express.Router();

router.patch(
  "/:id/users",
  authenticate,
  authorize("admin", "hr"),
  updateProjectUsers
);

// GET /api/projects - lista wszystkich projektów
router.get("/", authenticate, getProjects);

// GET /api/projects/stats - statystyki projektów (dla dashboard)
router.get("/stats", authenticate, getProjectStats);

// GET /api/projects/:id - szczegóły projektu
router.get("/:id", authenticate, getProjectById);

// POST /api/projects - utworzenie nowego projektu (admin/hr)
router.post("/", authenticate, authorize("admin", "hr"), createProject);

// PATCH /api/projects/:id - aktualizacja projektu (admin/hr)
router.patch("/:id", authenticate, authorize("admin"), updateProject);

// DELETE /api/projects/:id - usunięcie projektu (tylko admin)
router.delete("/:id", authenticate, authorize("admin"), deleteProject);

// GET /api/projects/:userId/assigned-projects/summary - statystyki projektów przypisanych do użytkownika
router.get(
  "/users/:userId/assigned-projects/summary",
  authenticate,
  getUserAssignedProjectsSummary
);

router.get(
  "/stats/summary",
  authenticate,
  authorize("admin", "hr"),
  getStatsSummary
);

export default router;
