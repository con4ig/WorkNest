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
  archiveProject,
  restoreProject,
  updateProjectStatus,
  bulkProjectAction,
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

// PATCH /api/projects/bulk-action - operacje masowe (admin/hr)
router.patch(
  "/bulk-action",
  authenticate,
  authorize("admin", "hr"),
  bulkProjectAction
);

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

// PATCH /api/projects/:id/archive - archiwizuj projekt (admin/hr)
router.patch(
  "/:id/archive",
  authenticate,
  authorize("admin", "hr"),
  archiveProject
);

// PATCH /api/projects/:id/restore - przywróć projekt (admin/hr)
router.patch(
  "/:id/restore",
  authenticate,
  authorize("admin", "hr"),
  restoreProject
);

// PATCH /api/projects/:id/status - szybka zmiana statusu dla Kanban (admin/hr)
router.patch(
  "/:id/status",
  authenticate,
  authorize("admin", "hr"),
  updateProjectStatus
);

export default router;
