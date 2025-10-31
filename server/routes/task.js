import express from "express";
import Task from "../models/Task.js";
import Activity from "../models/Activity.js";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";

const router = express.Router();

// GET - Pobierz wszystkie zadania dla projektu
router.get("/project/:projectId", authenticate, authorize("admin", "hr"), async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate("assignedTo", "username email")
      .populate("createdBy", "username")
      .sort({ order: 1, createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST - Utwórz nowe zadanie
router.post("/", authenticate, authorize("admin", "hr"), async (req, res) => {
  try {
    const { title, description, project, assignedTo, priority, dueDate } = req.body;

    const task = new Task({
      title,
      description,
      project,
      assignedTo: assignedTo || null,
      priority: priority || "medium",
      dueDate: dueDate || null,
      createdBy: req.user._id,
    });

    const savedTask = await task.save();
    await savedTask.populate("assignedTo", "username email");
    await savedTask.populate("createdBy", "username");

    // Dodaj aktywność
    await Activity.create({
      project,
      user: req.user._id,
      action: "task_created",
      description: `utworzył(a) zadanie "${title}"`,
      metadata: { taskId: savedTask._id },
    });

    res.status(201).json(savedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH - Aktualizuj zadanie
router.patch("/:id", authenticate, authorize("admin", "hr"), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Zadanie nie znalezione" });
    }

    const oldStatus = task.status;
    
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined) {
        task[key] = req.body[key];
      }
    });

    // Jeśli zadanie jest ukończone, ustaw datę ukończenia
    if (req.body.status === "completed" && oldStatus !== "completed") {
      task.completedAt = new Date();
      
      await Activity.create({
        project: task.project,
        user: req.user._id,
        action: "task_completed",
        description: `ukończył(a) zadanie "${task.title}"`,
        metadata: { taskId: task._id },
      });
    } else if (oldStatus !== req.body.status) {
      await Activity.create({
        project: task.project,
        user: req.user._id,
        action: "task_updated",
        description: `zmienił(a) status zadania "${task.title}" z "${oldStatus}" na "${req.body.status}"`,
        metadata: { taskId: task._id, oldStatus, newStatus: req.body.status },
      });
    }

    const updatedTask = await task.save();
    await updatedTask.populate("assignedTo", "username email");
    await updatedTask.populate("createdBy", "username");

    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE - Usuń zadanie
router.delete("/:id", authenticate, authorize("admin", "hr"), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Zadanie nie znalezione" });
    }

    // Dodaj aktywność
    await Activity.create({
      project: task.project,
      user: req.user._id,
      action: "task_deleted",
      description: `usunął(ęła) zadanie "${task.title}"`,
    });

    await task.deleteOne();
    res.json({ message: "Zadanie usunięte" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;