import express from "express";
import Project from "../models/Project.js";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";

const router = express.Router();

router.patch(
  "/:id/users",
  authenticate,
  authorize("admin", "hr"),
  async (req, res) => {
    const { userId, action } = req.body;

    if (!userId || !action) {
      return res.status(400).json({ message: "userId i action są wymagane" });
    }

    if (!["add", "remove"].includes(action)) {
      return res
        .status(400)
        .json({ message: 'action musi być "add" lub "remove"' });
    }

    try {
      const project = await Project.findById(req.params.id);

      if (!project) {
        return res.status(404).json({ message: "Projekt nie znaleziony" });
      }

      if (action === "add") {
        // Dodaj użytkownika (jeśli nie jest już przypisany)
        if (!project.assignedUsers.includes(userId)) {
          project.assignedUsers.push(userId);
        }
      } else if (action === "remove") {
        // Usuń użytkownika (ale nie twórcy projektu)
        if (project.createdBy.toString() === userId) {
          return res
            .status(400)
            .json({ message: "Nie można usunąć twórcy projektu" });
        }
        project.assignedUsers = project.assignedUsers.filter(
          (id) => id.toString() !== userId
        );
      }

      await project.save();

      // Zwróć zaktualizowany projekt z populated users
      const updatedProject = await Project.findById(project._id)
        .populate("assignedUsers", "username email role")
        .populate("createdBy", "username");

      res.json({
        message: `Użytkownik ${
          action === "add" ? "dodany" : "usunięty"
        } pomyślnie`,
        project: updatedProject,
      });
    } catch (err) {
      console.error("Error updating project users:", err);
      res.status(500).json({ message: "Błąd serwera" });
    }
  }
);

// GET /api/projects - lista wszystkich projektów
router.get("/", authenticate, async (req, res) => {
  try {
    const { status, sortBy, limit, name } = req.query; // Dodano `name`
    const limitNum = parseInt(limit) || 0;

    let query = {};

    // Nowość: Filtrowanie po nazwie projektu (jeśli podano)
    if (name) {
      query.name = { $regex: name, $options: "i" }; 
    }

    // Domyślne opcje sortowania (można je nadpisać)
    let sortOptions = { createdAt: -1 };

    // 2. FILTROWANIE PO ROLI/UŻYTKOWNIKU
    // Jeśli user jest 'employee', filtrujemy po przypisanych użytkownikach
    if (req.user.role === "employee") {
      // Używamy ID użytkownika do filtrowania projektów, do których jest przypisany
      query.assignedUsers = req.user._id;
    }

    // 3. FILTROWANIE PO STATUSIE (OPCJONALNE)
    if (status) {
      query.status = status;
    }

    // 4. USTALANIE SORTOWANIA
    // Na podstawie parametru sortBy (np. ?sortBy=createdAt:desc)
    if (sortBy === "createdAt:desc") {
      sortOptions = { createdAt: -1 };
    } else if (sortBy === "name:asc") {
      // Przykład innego sortowania
      sortOptions = { name: 1 };
    }

    // 5. BUDOWANIE ZAPYTANIA
    let projectsQuery = Project.find(query)
      .populate("assignedUsers", "username email")
      .populate("createdBy", "username")
      .sort(sortOptions); // Zastosowanie dynamicznych opcji sortowania

    // 6. LIMITOWANIE (KLUCZOWY KROK DLA TWOJEGO ZAGADNIENIA)
    if (limitNum > 0) {
      // Zastosowanie limitu po sortowaniu
      projectsQuery = projectsQuery.limit(limitNum);
    }

    // 7. WYKONANIE ZAPYTANIA
    const projects = await projectsQuery.exec();

    res.json({
      count: projects.length,
      projects,
    });
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).json({ message: "Błąd serwera" });
  }
});

// GET /api/projects/stats - statystyki projektów (dla dashboard)
router.get("/stats", authenticate, async (req, res) => {
  try {
    let query = {};

    // Employee widzi tylko swoje projekty
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
    res.status(500).json({ message: "Błąd serwera" });
  }
});

// GET /api/projects/:id - szczegóły projektu
router.get("/:id", authenticate, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("assignedUsers", "username email role")
      .populate("createdBy", "username");

    if (!project) {
      return res.status(404).json({ message: "Projekt nie znaleziony" });
    }

    // Employee może zobaczyć tylko swoje projekty
    if (req.user.role === "employee") {
      const isAssigned = project.assignedUsers.some(
        (u) => u._id.toString() === req.user._id
      );
      if (!isAssigned) {
        return res
          .status(403)
          .json({ message: "Brak dostępu do tego projektu" });
      }
    }

    res.json(project);
  } catch (err) {
    console.error("Error fetching project:", err);
    res.status(500).json({ message: "Błąd serwera" });
  }
});

// POST /api/projects - utworzenie nowego projektu (admin/hr)
router.post("/", authenticate, authorize("admin", "hr"), async (req, res) => {
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
    return res.status(400).json({ message: "Nazwa projektu jest wymagana" });
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
    });

    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate("assignedUsers", "username email")
      .populate("createdBy", "username");

    res.status(201).json({
      message: "Projekt utworzony pomyślnie",
      project: project,
    });
  } catch (err) {
    console.error("Error creating project:", err);
    res.status(500).json({ message: "Błąd serwera" });
  }
});

// PATCH /api/projects/:id - aktualizacja projektu (admin/hr)
router.patch("/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    const projectId = req.params.id;
    const updates = req.body; // Zawiera name, description, status, priority, progress, startDate, endDate

    // UWAGA: Zabezpiecz aktualizację, aby np. nie można było zmieniać 'createdBy'
    const result = await Project.findByIdAndUpdate(projectId, updates, {
      new: true,
      runValidators: true,
    });

    if (!result) {
      return res.status(404).json({ message: "Projekt nie znaleziony." });
    }

    res.json({ message: "Projekt zaktualizowany pomyślnie.", project: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:id/users", authenticate, async (req, res) => {
  const { userId, action } = req.body;
  const projectId = req.params.id;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Projekt nie znaleziony" });
    }

    if (action === "add") {
      if (!project.assignedUsers.includes(userId)) {
        project.assignedUsers.push(userId);
      }
    } else if (action === "remove") {
      project.assignedUsers = project.assignedUsers.filter(
        (id) => id.toString() !== userId.toString() // Fix comparison
      );
    }

    await project.save();

    // Return updated project with populated users
    const updatedProject = await Project.findById(projectId)
      .populate("assignedUsers", "username email role")
      .populate("createdBy", "username");

    res.json({
      message: "Użytkownicy zaktualizowani pomyślnie",
      project: updatedProject,
    });
  } catch (err) {
    console.error("Error updating project users:", err);
    res.status(500).json({ message: "Błąd serwera", error: err.message });
  }
});

// DELETE /api/projects/:id - usunięcie projektu (tylko admin)
router.delete("/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Projekt nie znaleziony" });
    }

    res.json({ message: "Projekt usunięty" });
  } catch (err) {
    console.error("Error deleting project:", err);
    res.status(500).json({ message: "Błąd serwera" });
  }
});

// GET /api/projects/:userId/assigned-projects/summary - statystyki projektów przypisanych do użytkownika
router.get(
  '/users/:userId/assigned-projects/summary',
  authenticate,
  async (req, res) => {
    try {
      const { userId } = req.params;

      // Opcjonalne zabezpieczenie: użytkownik może pobrać tylko swoje dane
      if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Brak dostępu do danych innych użytkowników' });
      }

      const [assigned, completed, running, pending] = await Promise.all([
        Project.countDocuments({ assignedUsers: userId }),
        Project.countDocuments({ assignedUsers: userId, status: 'completed' }),
        Project.countDocuments({ assignedUsers: userId, status: 'running' }),
        Project.countDocuments({ assignedUsers: userId, status: 'pending' }),
      ]);

      res.json({
        assigned,
        completed,
        running,
        pending,
      });
    } catch (error) {
      console.error('Błąd podczas pobierania statystyk użytkownika:', error);
      res.status(500).json({ error: 'Błąd podczas pobierania danych' });
    }
  }
);



router.get(
  '/stats/summary',
  authenticate,
  authorize('admin', 'hr'),
  async (req, res) => {
    try {
      const [total, running, pending, completed] = await Promise.all([
        Project.countDocuments(),
        Project.countDocuments({ status: 'running' }),
        Project.countDocuments({ status: 'pending' }),
        Project.countDocuments({ status: 'completed' }),
      ]);

      res.json({
        total,
        running,
        pending,
        completed,
      });
    } catch (error) {
      console.error('Błąd podczas pobierania statystyk:', error);
      res.status(500).json({ error: 'Błąd podczas pobierania statystyk' });
    }
  }
);


export default router;
