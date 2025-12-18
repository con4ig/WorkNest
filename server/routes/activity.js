import express from "express";
import Authenticate from "../middleware/authenticate.js";
import {
  getActivitiesByProject,
  createActivity,
} from "../controllers/activityController.js";

const router = express.Router();

// GET - Pobierz historię aktywności dla projektu
router.get("/project/:projectId", Authenticate, getActivitiesByProject);

// POST - Ręczne dodanie aktywności (opcjonalne, używane przez inne endpointy)
router.post("/", Authenticate, createActivity);

export default router;
