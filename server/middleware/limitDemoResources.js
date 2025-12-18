import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Leave from "../models/Leave.js";
import User from "../models/User.js";

export const limitDemoResources = async (req, res, next) => {
  try {
    // Check if user belongs to "Demo Company"
    if (req.user.company?.name !== 'Demo Company') {
      return next();
    }

    const path = req.baseUrl + req.path; // e.g., /api/projects/
    
    // Limits
    const LIMITS = {
        projects: 5,
        tasks: 20,
        leaves: 20, 
        users: 10
    };

    // Check Projects
    if (req.method === 'POST' && req.baseUrl.includes('projects')) {
        const count = await Project.countDocuments({ company: req.user.company });
        if (count >= LIMITS.projects) {
            return res.status(403).json({ message: `Limit projektów (max ${LIMITS.projects}) w wersji Demo został osiągnięty.` });
        }
    }

    // Check Tasks
    if (req.method === 'POST' && req.baseUrl.includes('tasks')) {
        const count = await Task.countDocuments({ company: req.user.company });
        if (count >= LIMITS.tasks) {
            return res.status(403).json({ message: `Limit zadań (max ${LIMITS.tasks}) w wersji Demo został osiągnięty.` });
        }
    }

    // Check Leaves
    if (req.method === 'POST' && req.baseUrl.includes('leaves')) {
        const count = await Leave.countDocuments({ company: req.user.company });
        if (count >= LIMITS.leaves) {
            return res.status(403).json({ message: `Limit wniosków (max ${LIMITS.leaves}) w wersji Demo został osiągnięty.` });
        }
    }

    // Check Users (e.g. import csv or register)
    // Note: 'users' base url might be /api/users
    if (req.method === 'POST' && req.baseUrl.includes('users')) {
         const count = await User.countDocuments({ company: req.user.company });
         if (count >= LIMITS.users) {
             return res.status(403).json({ message: `Limit użytkowników (max ${LIMITS.users}) w wersji Demo został osiągnięty.` });
         }
    }

    next();
  } catch (error) {
    console.error("Demo limit check error:", error);
    next(); // Fail open or closed? Let's fail open to not block normal usage if check fails, but log it.
  }
};
