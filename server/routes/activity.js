import express from "express";
import Activity from "../models/Activity.js";
import Authenticate from "../middleware/authenticate.js";

const router = express.Router();

// GET - Pobierz historię aktywności dla projektu
router.get("/project/:projectId", Authenticate, async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    
    const activities = await Activity.find({ project: req.params.projectId })
      .populate("user", "username email profileImage")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Activity.countDocuments({ project: req.params.projectId });

    res.json({
      activities,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST - Ręczne dodanie aktywności (opcjonalne, używane przez inne endpointy)
router.post("/", Authenticate, async (req, res) => {
  try {
    const { project, action, description, metadata } = req.body;

    const activity = new Activity({
      project,
      user: req.user._id,
      action,
      description,
      metadata: metadata || {},
    });

    const savedActivity = await activity.save();
    await savedActivity.populate("user", "username email profileImage");

    res.status(201).json(savedActivity);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;