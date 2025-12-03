import express from "express";
import Authenticate from "../middleware/authenticate.js";
import {
  getCommentsByProject,
  createComment,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";

const router = express.Router();

// GET - Pobierz wszystkie komentarze dla projektu
router.get("/project/:projectId", Authenticate, getCommentsByProject);

// POST - Dodaj nowy komentarz
router.post("/", Authenticate, createComment);

// PATCH - Edytuj komentarz
router.patch("/:id", Authenticate, updateComment);

// DELETE - Usuń komentarz
router.delete("/:id", Authenticate, deleteComment);

export default router;
