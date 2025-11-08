import express from "express";
import Activity from "../models/Activity.js";
import Project from "../models/Project.js";
import Authenticate from "../middleware/authenticate.js";

const router = express.Router();

// GET - Pobierz historię aktywności dla projektu
router.get("/project/:projectId", Authenticate, async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const { projectId } = req.params;

    let projectQuery = { _id: projectId };
    if (req.user.role !== "superadmin") {
      if (!req.user.company) {
        return res
          .status(403)
          .json({
            message: "Brak przypisanej firmy dla bieżącego użytkownika.",
          });
      }
      projectQuery.company = req.user.company._id;
    }
    const project = await Project.findOne(projectQuery);
    if (!project) {
      return res
        .status(404)
        .json({ message: "Projekt nie znaleziony lub brak dostępu." });
    }

    const query = { project: projectId };
    if (req.user.role !== "superadmin") {
      query.company = req.user.company;
    }

    const activities = await Activity.find(query)
      .populate("user", "username email profileImage")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Activity.countDocuments({
      project: req.params.projectId,
    });

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

    let projectQuery = { _id: project };
    if (req.user.role !== "superadmin") {
      if (!req.user.company) {
        return res
          .status(403)
          .json({
            message: "Brak przypisanej firmy dla bieżącego użytkownika.",
          });
      }
      projectQuery.company = req.user.company._id;
    }
    const projectDoc = await Project.findOne(projectQuery);
    if (!projectDoc) {
      return res
        .status(404)
        .json({ message: "Projekt nie znaleziony lub brak dostępu." });
    }

    const activity = new Activity({
      project,
      user: req.user._id,
      action,
      description,
      metadata: metadata || {},
      company: projectDoc.company,
    });

    const savedActivity = await activity.save();
    await savedActivity.populate("user", "username email profileImage");

    res.status(201).json(savedActivity);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
