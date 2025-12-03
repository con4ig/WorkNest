import Project from "../models/Project.js";

export const updateProjectUsers = async (req, res) => {
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
    let query = { _id: req.params.id };

    // Company isolation: Only allow modifying projects from the same company
    if (req.user.role !== "superadmin") {
      if (!req.user.company) {
        return res
          .status(403)
          .json({
            message: "Brak przypisanej firmy dla bieżącego użytkownika.",
          });
      }
      query.company = req.user.company._id;
    }

    const project = await Project.findOne(query);

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
};

export const getProjects = async (req, res) => {
  try {
    const { status, sortBy, limit, name } = req.query;

    let query = {};

    // ✅ KRYTYCZNE ZABEZPIECZENIE: Sprawdź, czy middleware zadziałało
    if (!req.user) {
      return res.status(401).json({ message: "Brak autoryzacji - req.user nie jest zdefiniowany." });
    }

    // Company isolation
    if (req.user.role !== "superadmin") {
      query.company = req.user.company;
    }

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
    if (limit && parseInt(limit) > 0) {
      // Zastosowanie limitu po sortowaniu
      projectsQuery = projectsQuery.limit(parseInt(limit));
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
};

export const getProjectStats = async (req, res) => {
  try {
    let query = {};

    // Company isolation
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
    res.status(500).json({ message: "Błąd serwera" });
  }
};

export const getProjectById = async (req, res) => {
  try {
    let query = { _id: req.params.id };

    // Company isolation: Only allow fetching projects from the same company
    if (req.user.role !== "superadmin") {
      if (!req.user.company) {
        return res
          .status(403)
          .json({
            message: "Brak przypisanej firmy dla bieżącego użytkownika.",
          });
      }
      query.company = req.user.company._id;
    }

    const project = await Project.findOne(query)
      .populate("assignedUsers", "username email role")
      .populate("createdBy", "username");

    if (!project) {
      return res.status(404).json({ message: "Projekt nie znaleziony" });
    }

    // Employee może zobaczyć tylko swoje projekty
    if (req.user.role === "employee") {
      const isAssigned = project.assignedUsers.some(
        (u) => u._id.toString() === req.user._id.toString()
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
      company: req.user.company,
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
      return res.status(404).json({ message: "Projekt nie znaleziony." });
    }

    res.json({ message: "Projekt zaktualizowany pomyślnie.", project: result });
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
      return res.status(404).json({ message: "Projekt nie znaleziony" });
    }

    res.json({ message: "Projekt usunięty" });
  } catch (err) {
    console.error("Error deleting project:", err);
    res.status(500).json({ message: "Błąd serwera" });
  }
};

export const getUserAssignedProjectsSummary = async (req, res) => {
  try {
    const { userId } = req.params;

    // Opcjonalne zabezpieczenie: użytkownik może pobrać tylko swoje dane
    if (req.user._id.toString() !== userId && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Brak dostępu do danych innych użytkowników" });
    }

    const companyQuery = {};
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
    console.error("Błąd podczas pobierania statystyk użytkownika:", error);
    res.status(500).json({ error: "Błąd podczas pobierania danych" });
  }
};

export const getStatsSummary = async (req, res) => {
  try {
    const query = {};
    if (req.user.role !== "superadmin") {
      // Pobierz ID firmy z zapytania lub od zalogowanego użytkownika
      const requestedCompanyId = req.query.company;
      const userCompanyId = req.user.company?._id.toString();

      // Sprawdź, czy admin/hr ma prawo dostępu do żądanej firmy
      if (requestedCompanyId && requestedCompanyId !== userCompanyId) {
        return res.status(403).json({ message: "Brak uprawnień do danych tej firmy." });
      }

      if (!userCompanyId) {
          return res.status(403).json({ message: "Użytkownik nie jest przypisany do firmy." });
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
    console.error("Błąd podczas pobierania statystyk:", error);
    res.status(500).json({ error: "Błąd podczas pobierania statystyk" });
  }
};
