import Project from "../models/Project.js";
import { emitToCompany } from "../lib/realtime.js";

export const updateProjectUsers = async (req, res) => {
  const { userId, action } = req.body;

  if (!userId || !action) {
    return res.status(400).json({ message: "userId and action are required" });
  }

  if (!["add", "remove"].includes(action)) {
    return res
      .status(400)
      .json({ message: 'action must be "add" or "remove"' });
  }

  try {
    let query = { _id: req.params.id };

    // Company isolation: Only allow modifying projects from the same company
    if (req.user.role !== "superadmin") {
      if (!req.user.company) {
        return res.status(403).json({
          message: "No company assigned to the current user.",
        });
      }
      query.company = req.user.company._id;
    }

    const project = await Project.findOne(query);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (action === "add") {
      if (!project.assignedUsers.includes(userId)) {
        project.assignedUsers.push(userId);
      }
    } else if (action === "remove") {
      // Cannot remove project creator
      if (project.createdBy.toString() === userId) {
        return res
          .status(400)
          .json({ message: "Cannot remove the project creator" });
      }
      project.assignedUsers = project.assignedUsers.filter(
        (id) => id.toString() !== userId
      );
    }

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate("assignedUsers", "username email role")
      .populate("createdBy", "username");

    res.json({
      message: `User ${action === "add" ? "added" : "removed"} successfully`,
      project: updatedProject,
    });
  } catch (err) {
    console.error("Error updating project users:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProjects = async (req, res) => {
  try {
    const { status, sortBy, limit, name, isArchived } = req.query;

    let query = {};

    // ✅ Critical safeguard: verify middleware ran
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized - req.user is not defined.",
      });
    }

    // Company isolation
    if (req.user.role !== "superadmin") {
      query.company = req.user.company;
    }

    // Filter by archive (default to active only)
    // $ne: true handles cases: false, null, undefined (missing field)
    if (isArchived === "true") {
      query.isArchived = true;
    } else {
      query.isArchived = { $ne: true };
    }

    // Filter by project name (if provided)
    if (name) {
      query.name = { $regex: name, $options: "i" };
    }

    let sortOptions = { createdAt: -1 };

    // Role/user filtering
    if (req.user.role === "employee") {
      query.assignedUsers = req.user._id;
    }

    // Optional status filtering
    if (status) {
      query.status = status;
    }

    if (sortBy === "createdAt:desc") {
      sortOptions = { createdAt: -1 };
    } else if (sortBy === "name:asc") {
      sortOptions = { name: 1 };
    }

    let projectsQuery = Project.find(query)
      .populate("assignedUsers", "username email")
      .populate("createdBy", "username")
      .populate("tasks", "status")
      .sort(sortOptions);

    if (limit && parseInt(limit) > 0) {
      projectsQuery = projectsQuery.limit(parseInt(limit));
    }

    const projects = await projectsQuery.exec();

    res.json({
      count: projects.length,
      projects,
    });
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProjectStats = async (req, res) => {
  try {
    // Active projects only ($ne: true handles false, null, missing)
    let query = { isArchived: { $ne: true } };

    if (req.user.role !== "superadmin") {
      query.company = req.user.company;
    }
    if (req.user.role === "employee") {
      query.assignedUsers = req.user._id;
    }

    const total = await Project.countDocuments(query);
    const pending = await Project.countDocuments({
      ...query,
      status: "pending",
    });
    const running = await Project.countDocuments({
      ...query,
      status: "running",
    });
    const completed = await Project.countDocuments({
      ...query,
      status: "completed",
    });

    res.json({
      total,
      pending,
      running,
      completed,
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProjectById = async (req, res) => {
  try {
    let query = { _id: req.params.id };

    if (req.user.role !== "superadmin") {
      if (!req.user.company) {
        return res.status(403).json({
          message: "No company assigned to the current user.",
        });
      }
      query.company = req.user.company._id;
    }

    const project = await Project.findOne(query)
      .populate("assignedUsers", "username email role")
      .populate("createdBy", "username");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Employee can only see their own projects
    if (req.user.role === "employee") {
      const isAssigned = project.assignedUsers.some(
        (u) => u._id.toString() === req.user._id.toString()
      );
      if (!isAssigned) {
        return res
          .status(403)
          .json({ message: "Access denied to this project" });
      }
    }

    res.json(project);
  } catch (err) {
    console.error("Error fetching project:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const createProject = async (req, res) => {
  const {
    name,
    description,
    status,
    priority,
    startDate,
    endDate,
    assignedUsers,
  } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Project name is required" });
  }

  try {
    const project = new Project({
      name,
      description,
      status: status || "pending",
      priority: priority || "medium",
      startDate,
      endDate,
      assignedUsers: assignedUsers || [],
      createdBy: req.user._id,
      company: req.user.company,
    });

    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate("assignedUsers", "username email")
      .populate("createdBy", "username");

    res.status(201).json({
      message: "Project created successfully",
      project: project,
    });
  } catch (err) {
    console.error("Error creating project:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const updates = req.body;

    const query = { _id: projectId };
    if (req.user.role !== "superadmin") {
      query.company = req.user.company;
    }

    const result = await Project.findOneAndUpdate(query, updates, {
      new: true,
      runValidators: true,
    });

    if (!result) {
      return res.status(404).json({ message: "Project not found." });
    }

    res.json({ message: "Project updated successfully.", project: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role !== "superadmin") {
      query.company = req.user.company;
    }

    const project = await Project.findOneAndDelete(query);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "Project deleted" });
  } catch (err) {
    console.error("Error deleting project:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserAssignedProjectsSummary = async (req, res) => {
  try {
    const { userId } = req.params;

    // Optional safeguard: user can only fetch their own data
    if (req.user._id.toString() !== userId && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Access denied to other users' data" });
    }

    const companyQuery = { isArchived: { $ne: true } };
    if (req.user.role !== "superadmin") {
      companyQuery.company = req.user.company;
    }

    const [assigned, completed, running, pending] = await Promise.all([
      Project.countDocuments({ assignedUsers: userId, ...companyQuery }),
      Project.countDocuments({
        assignedUsers: userId,
        status: "completed",
        ...companyQuery,
      }),
      Project.countDocuments({
        assignedUsers: userId,
        status: "running",
        ...companyQuery,
      }),
      Project.countDocuments({
        assignedUsers: userId,
        status: "pending",
        ...companyQuery,
      }),
    ]);

    res.json({
      assigned,
      completed,
      running,
      pending,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ error: "Error fetching data" });
  }
};

export const getStatsSummary = async (req, res) => {
  try {
    const query = { isArchived: { $ne: true } };
    if (req.user.role !== "superadmin") {
      // Get company ID from query or from logged-in user
      const requestedCompanyId = req.query.company;
      const userCompanyId = req.user.company?._id.toString();

      // Check whether admin/hr has access to the requested company
      if (requestedCompanyId && requestedCompanyId !== userCompanyId) {
        return res
          .status(403)
          .json({ message: "Insufficient permissions for this company's data." });
      }

      if (!userCompanyId) {
        return res
          .status(403)
          .json({ message: "User is not assigned to a company." });
      }
      query.company = userCompanyId;
    }

    const [total, running, pending, completed] = await Promise.all([
      Project.countDocuments(query),
      Project.countDocuments({ ...query, status: "running" }),
      Project.countDocuments({ ...query, status: "pending" }),
      Project.countDocuments({ ...query, status: "completed" }),
    ]);

    res.json({
      total,
      running,
      pending,
      completed,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Error fetching stats" });
  }
};

// Archive project (soft delete)
export const archiveProject = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role !== "superadmin") {
      query.company = req.user.company;
    }

    const project = await Project.findOneAndUpdate(
      query,
      { isArchived: true },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    emitToCompany(project.company, "project:archived", {
      projectId: project._id,
      by: req.user._id,
      at: new Date().toISOString(),
    });

    res.json({ message: "Project archived successfully", project });
  } catch (err) {
    console.error("Error archiving project:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Restore project from archive
export const restoreProject = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role !== "superadmin") {
      query.company = req.user.company;
    }

    const project = await Project.findOneAndUpdate(
      query,
      { isArchived: false },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    emitToCompany(project.company, "project:restored", {
      projectId: project._id,
      by: req.user._id,
      at: new Date().toISOString(),
    });

    res.json({ message: "Project restored successfully", project });
  } catch (err) {
    console.error("Error restoring project:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Quick status update (for Kanban drag & drop)
export const updateProjectStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (
      !status ||
      !["pending", "running", "completed", "on-hold"].includes(status)
    ) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const query = { _id: req.params.id };
    if (req.user.role !== "superadmin") {
      query.company = req.user.company;
    }

    const project = await Project.findOneAndUpdate(
      query,
      { status },
      { new: true, runValidators: true }
    ).populate("assignedUsers", "username email");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    emitToCompany(project.company, "project:status-changed", {
      projectId: project._id,
      status: project.status,
      updatedBy: req.user._id,
      at: new Date().toISOString(),
    });

    res.json({ message: "Status updated successfully", project });
  } catch (err) {
    console.error("Error updating project status:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Bulk operations on projects
export const bulkProjectAction = async (req, res) => {
  try {
    const { projectIds, action, payload } = req.body;

    if (!Array.isArray(projectIds) || projectIds.length === 0) {
      return res.status(400).json({ message: "No projects selected" });
    }

    // Build query (per-company safeguard)
    const query = { _id: { $in: projectIds } };
    if (req.user.role !== "superadmin") {
      query.company = req.user.company;
    }

    let result;
    let message = "";

    switch (action) {
      case "archive":
        result = await Project.updateMany(query, { isArchived: true });
        message = `Archived ${result.modifiedCount} projects`;
        break;

      case "restore":
        result = await Project.updateMany(query, { isArchived: false });
        message = `Restored ${result.modifiedCount} projects`;
        break;

      case "delete":
        if (req.user.role !== "admin" && req.user.role !== "superadmin") {
          return res
            .status(403)
            .json({ message: "Insufficient permissions to delete" });
        }
        result = await Project.deleteMany(query);
        message = `Permanently deleted ${result.deletedCount} projects`;
        break;

      case "status":
        if (
          !payload ||
          !["pending", "running", "completed", "on-hold"].includes(
            payload.status
          )
        ) {
          return res.status(400).json({ message: "Invalid status" });
        }
        result = await Project.updateMany(query, { status: payload.status });
        message = `Changed status for ${result.modifiedCount} projects`;
        break;

      default:
        return res.status(400).json({ message: "Unknown action" });
    }

    res.json({ message, count: result.modifiedCount || result.deletedCount });
  } catch (err) {
    console.error("Error in bulk action:", err);
    res.status(500).json({ message: "Server error during bulk operation" });
  }
};

export const getWeeklyActivity = async (req, res) => {
  try {
    const query = { isArchived: { $ne: true } };
    if (req.user.role !== 'superadmin') {
      // Extract company ID if it's populated as an object
      const companyId = req.user.company?._id || req.user.company;
      if (!companyId) {
        return res.status(403).json({
          message: "User is not assigned to a company.",
        });
      }
      query.company = companyId;
    }

    // Get last 8 days from server time to provide a safe window
    const today = new Date();
    const eightDaysAgo = new Date();
    eightDaysAgo.setDate(today.getDate() - 7);

    query.createdAt = { $gte: eightDaysAgo };

    const activity = await Project.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
              timezone: 'Europe/Warsaw',
            },
          },
          count: { $sum: 1 },
        },
      },
      { $project: { date: '$_id', count: '$count', _id: 0 } },
      { $sort: { date: 1 } }
    ]);

    res.json(activity);
  } catch (error) {
    console.error('Error fetching weekly activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
