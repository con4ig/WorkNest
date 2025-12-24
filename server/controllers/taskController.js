import Task from "../models/Task.js";
import Activity from "../models/Activity.js";
import Project from "../models/Project.js";

export const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Check if project exists and belongs to the company
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

    const tasks = await Task.find(query)
      .populate("assignedTo", "username email")
      .populate("createdBy", "username")
      .sort({ order: 1, createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, project, assignedTo, priority, dueDate } =
      req.body;

    // Find the project to get the company ID
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

    const task = new Task({
      title,
      description,
      project,
      assignedTo: assignedTo || null,
      priority: priority || "medium",
      dueDate: dueDate || null,
      createdBy: req.user._id,
      company: projectDoc.company, // Set company from project
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
      metadata: { taskId: savedTask._id, title },
      company: projectDoc.company,
    });

    res.status(201).json(savedTask);
  } catch (err) {
    console.error("Error adding task:", err);
    res.status(400).json({ message: err.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    let taskQuery = { _id: req.params.id };
    if (req.user.role !== "superadmin") {
      if (!req.user.company) {
        return res
          .status(403)
          .json({
            message: "Brak przypisanej firmy dla bieżącego użytkownika.",
          });
      }
      taskQuery.company = req.user.company._id;
    }
    const task = await Task.findOne(taskQuery);
    if (!task) {
      return res
        .status(404)
        .json({ message: "Zadanie nie znalezione lub brak dostępu." });
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
        metadata: { taskId: task._id, title: task.title },
        company: task.company,
      });
    } else if (oldStatus !== req.body.status) {
      await Activity.create({
        project: task.project,
        user: req.user._id,
        action: "task_updated",
        description: `zmienił(a) status zadania "${task.title}" z "${oldStatus}" na "${req.body.status}"`,
        metadata: { taskId: task._id, title: task.title, oldStatus, newStatus: req.body.status },
        company: task.company,
      });
    }

    const updatedTask = await task.save();
    await updatedTask.populate("assignedTo", "username email");
    await updatedTask.populate("createdBy", "username");

    res.json(updatedTask);
  } catch (err) {
    console.error("Error updating task status:", err);
    res.status(400).json({ message: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    let taskQuery = { _id: req.params.id };
    if (req.user.role !== "superadmin") {
      if (!req.user.company) {
        return res
          .status(403)
          .json({
            message: "Brak przypisanej firmy dla bieżącego użytkownika.",
          });
      }
      taskQuery.company = req.user.company._id;
    }
    const task = await Task.findOne(taskQuery);
    if (!task) {
      return res
        .status(404)
        .json({ message: "Zadanie nie znalezione lub brak dostępu." });
    }

    // Dodaj aktywność
    await Activity.create({
      project: task.project,
      user: req.user._id,
      action: "task_deleted",
      description: `usunął(ęła) zadanie "${task.title}"`,
      metadata: { title: task.title },
      company: task.company,
    });

    await task.deleteOne();
    res.json({ message: "Zadanie usunięte" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
