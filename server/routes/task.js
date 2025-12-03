import express from "express";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import {
  getTasksByProject,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";

const router = express.Router();

// GET - Pobierz wszystkie zadania dla projektu
router.get("/project/:projectId", authenticate, getTasksByProject);

// POST - Utwórz nowe zadanie
router.post("/", authenticate, authorize("admin", "hr"), createTask);

// PATCH - Aktualizuj zadanie
router.patch("/:id", authenticate, updateTask);

// DELETE - Usuń zadanie
router.delete("/:id", authenticate, authorize("admin", "hr"), deleteTask);

export default router;
