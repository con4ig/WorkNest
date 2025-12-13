import User from "../models/User.js";
import Invitation from "../models/Invitation.js";

export const getUsers = async (req, res) => {
  try {
    const { search } = req.query;

    let query = {};

    // Company isolation - pobierz ID firmy bezpiecznie
    if (req.user.role !== "superadmin") {
      const userCompanyId = req.user.company?._id || req.user.company;

      if (!userCompanyId) {
        return res.status(403).json({ message: "Brak przypisanej firmy" });
      }

      query.company = userCompanyId;
    }

    // Jeśli jest parametr search - filtruj po username, email, firstName lub lastName
    if (search && search.trim().length >= 2) {
      const searchQuery = {
        $or: [
          { username: { $regex: search.trim(), $options: "i" } },
          { email: { $regex: search.trim(), $options: "i" } },
          { firstName: { $regex: search.trim(), $options: "i" } },
          { lastName: { $regex: search.trim(), $options: "i" } },
        ],
      };
      query = { $and: [query, searchQuery] };
    }

    const users = await User.find(query).select("-password");
    res.json({ count: users.length, users: users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Błąd serwera" });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    // req.user jest już dostępne dzięki middleware 'authenticate'
    // i zawiera dane z populate('company')
    res.json(req.user);
  } catch (err) {
    console.error("Error fetching current user:", err);
    res.status(500).json({ message: "Błąd serwera" });
  }
};

export const getUserById = async (req, res) => {
  try {
    // Sprawdzenie czy middleware authenticate ustawił req.user
    if (!req.user) {
      console.error(
        "❌ req.user jest undefined - middleware authenticate nie działa"
      );
      return res.status(401).json({ message: "Nie jesteś zalogowany" });
    }

    let query = { _id: req.params.id };

    // Company isolation: Only allow fetching users from the same company
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

    const user = await User.findOne(query);

    if (!user) {
      return res.status(404).json({ message: "Użytkownik nie znaleziony" });
    }

    // Sprawdzenie uprawnień: user może obejrzeć swoje dane, HR/Admin mogą obejrzeć każdego
    if (
      req.user._id.toString() !== req.params.id &&
      !["hr", "admin"].includes(req.user.role)
    ) {
      return res
        .status(403)
        .json({ message: "Brak uprawnień do przeglądania tego profilu" });
    }

    // Zwróć wszystkie dostępne pola, nawet jeśli są puste
    res.json({
      _id: user._id,
      username: user.username || "",
      email: user.email || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phoneNumber: user.phoneNumber || "",
      position: user.position || "",
      department: user.department || "",
      hireDate: user.hireDate || null,
      salary: user.salary || 0,
      status: user.status || "active",
      contractType: user.contractType || "full-time",
      role: user.role || "employee",
      address: user.address || "",
      city: user.city || "",
      peselOrId: user.peselOrId || "",
      notes: user.notes || "",
      employmentHistory: user.employmentHistory || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Błąd serwera" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const isOwnProfile = req.user._id.toString() === userId;
    const isAdmin = ["hr", "admin"].includes(req.user.role);

    // Sprawdzenie uprawnień: tylko HR/Admin mogą edytować cudze dane
    if (!isOwnProfile && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Możesz edytować tylko swoje dane" });
    }

    const {
      username,
      email,
      firstName,
      lastName,
      phoneNumber,
      position,
      department,
      hireDate,
      salary,
      status,
      contractType,
      role,
      address,
      city,
      peselOrId,
      notes,
      employmentHistory,
    } = req.body;

    // Walidacja danych
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Nieprawidłowy format email" });
      }
    }

    if (
      status &&
      !["active", "inactive", "on-leave", "terminated"].includes(status)
    ) {
      return res.status(400).json({
        message:
          "Nieprawidłowy status. Dozwolone: active, inactive, on-leave, terminated",
      });
    }

    if (
      contractType &&
      !["full-time", "part-time", "contract", "temporary"].includes(
        contractType
      )
    ) {
      return res.status(400).json({
        message:
          "Nieprawidłowy typ umowy. Dozwolone: full-time, part-time, contract, temporary",
      });
    }

    if (role && !["employee", "hr", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Nieprawidłowa rola. Dozwolone: employee, hr, admin",
      });
    }

    // Pracownicy nie mogą zmieniać swojej roli
    if (!isAdmin && role) {
      return res
        .status(403)
        .json({ message: "Nie możesz zmieniać swojej roli" });
    }

    if (salary !== undefined && salary < 0) {
      return res.status(400).json({ message: "Pensja nie może być ujemna" });
    }
    
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "Użytkownik nie znaleziony" });
    }

    // ✅ TERAZ SPRAWDŹ COMPANY ISOLATION
    if (req.user.role !== "superadmin") {
      // Pobierz ID firmy z obiektu lub bezpośrednio
      const userCompanyId = req.user.company?._id || req.user.company;
      const existingUserCompanyId =
        existingUser.company?._id || existingUser.company;

      if (!userCompanyId) {
        return res.status(403).json({ message: "Brak przypisanej firmy" });
      }

      if (userCompanyId.toString() !== existingUserCompanyId.toString()) {
        return res.status(403).json({
          message:
            "Nie masz uprawnień do edycji danych użytkownika z innej firmy",
        });
      }
    }

    // Sprawdzenie czy email już istnieje (jeśli zmienia się email)
    if (email && email !== existingUser.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email jest już w użyciu" });
      }
    }

    // Przygotowanie obiektu do aktualizacji w sposób dynamiczny
    const updateData = {};
    const allowedFields = [
      "username", "email", "firstName", "lastName", "phoneNumber",
      "position", "department", "hireDate", "salary", "status",
      "contractType", "address", "city", "peselOrId", "notes", "employmentHistory", "documents"
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Specjalna obsługa dla roli (tylko admin)
    if (isAdmin && req.body.role !== undefined) {
      updateData.role = req.body.role;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.json({
      message: "Dane pracownika zaktualizowane pomyślnie",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error updating user:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Błąd serwera" });
  }
};

export const updateUserRole = async (req, res) => {
  const { role } = req.body;

  // Walidacja roli
  if (!["employee", "hr", "admin"].includes(role)) {
    return res.status(400).json({
      message: "Nieprawidłowa rola. Dozwolone: employee, hr, admin",
    });
  }

  try {
    // ✅ NAJPIERW POBIERZ UŻYTKOWNIKA
    const userToUpdate = await User.findById(req.params.id);

    if (!userToUpdate) {
      return res.status(404).json({ message: "Użytkownik nie znaleziony" });
    }

    // ✅ TERAZ SPRAWDŹ COMPANY ISOLATION
    if (req.user.role !== "superadmin") {
      // Pobierz ID firmy z obiektu lub bezpośrednio
      const adminCompanyId = req.user.company?._id || req.user.company;
      const userCompanyId = userToUpdate.company?._id || userToUpdate.company;

      if (!adminCompanyId) {
        return res.status(403).json({ message: "Brak przypisanej firmy" });
      }

      if (adminCompanyId.toString() !== userCompanyId.toString()) {
        return res.status(403).json({
          message:
            "Nie masz uprawnień do zmiany roli użytkownika z innej firmy",
        });
      }
    }

    // ✅ Zmień rolę
    userToUpdate.role = role;
    const updatedUser = await userToUpdate.save();

    res.json({
      message: "Rola zmieniona pomyślnie",
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (err) {
    console.error("Error updating role:", err);
    res.status(500).json({ message: "Błąd serwera" });
  }
};

export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Konwertuj buffer na Base64 string
    const base64Image = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype;

    // Zapisz jako data URL (łatwiejsze do wyświetlenia w frontendzie)
    user.profileImage = `data:${mimeType};base64,${base64Image}`;

    await user.save();

    res.json({
      message: "Profile image updated successfully",
      profileImage: user.profileImage,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

export const getProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("profileImage");

    if (!user || !user.profileImage) {
      return res.status(404).json({ message: "No profile image found" });
    }

    res.json({ profileImage: user.profileImage });
  } catch (err) {
    console.error("Get image error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const deleteProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.profileImage = "";
    await user.save();

    res.json({ message: "Profile image deleted successfully" });
  } catch (err) {
    console.error("Delete image error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const generateInvitation = async (req, res) => {
  try {
    const { maxUses, expiresIn, role } = req.body; // Pobierz parametry
    const companyId = req.user.company?._id || req.user.company;

    if (!companyId) {
      return res
        .status(400)
        .json({ message: "User is not assigned to a company." });
    }

    // Oblicz datę wygaśnięcia
    let expirationDate = new Date();
    if (expiresIn) {
      // Obsługa różnych formatów czasu (np. "30m", "24h", "7d") lub milliseconds
      const timeValue = parseInt(expiresIn);
      const timeUnit = expiresIn.slice(-1);

      if (timeUnit === 'm') expirationDate.setMinutes(expirationDate.getMinutes() + timeValue);
      else if (timeUnit === 'h') expirationDate.setHours(expirationDate.getHours() + timeValue);
      else if (timeUnit === 'd') expirationDate.setDate(expirationDate.getDate() + timeValue);
      else expirationDate = new Date(Date.now() + 5 * 60 * 1000); // Default 5 min fallback
    } else {
       expirationDate = new Date(Date.now() + 5 * 60 * 1000); // Default 5 min
    }

    const newInvitation = new Invitation({
      company: companyId,
      createdBy: req.user._id,
      expiresAt: expirationDate,
      maxUses: maxUses || 1,
      role: role || 'employee',
    });

    await newInvitation.save();

    res.status(201).json({
      message: "Invitation code generated successfully.",
      invitationCode: newInvitation.code,
      invitation: newInvitation // Zwróć cały obiekt
    });
  } catch (err) {
    console.error("Error generating invitation code:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getInvitations = async (req, res) => {
  try {
    const companyId = req.user.company?._id || req.user.company;
     if (!companyId) return res.status(400).json({ message: "Brak firmy" });

    // Lazy remove expired invitations
    await Invitation.deleteMany({ expiresAt: { $lt: new Date() } });

    // Pobierz tylko aktywne zaproszenia (lub wszystkie i filtruj na froncie - lepiej wszystkie dla historii?)
    // Pobieramy wszystkie, które jeszcze nie wygasły LUB mają jeszcze użycia
    // Ale admin może chcieć widzieć listę aktywnych kodów.
    const invitations = await Invitation.find({ company: companyId })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'username');

    res.json(invitations);
  } catch (err) {
    console.error("Error fetching invitations:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const revokeInvitation = async (req, res) => {
  try {
     const { id } = req.params;
     // Sprawdź czy to zaproszenie należy do firmy admina (security)
     const invitation = await Invitation.findById(id);

     if (!invitation) return res.status(404).json({ message: "Nie znaleziono zaproszenia" });

     // Sprawdź uprawnienia firmy
     const userCompanyId = req.user.company?._id || req.user.company;
     if (invitation.company.toString() !== userCompanyId.toString()) {
        return res.status(403).json({ message: "Brak uprawnień" });
     }

     await Invitation.findByIdAndDelete(id);
     res.json({ message: "Zaproszenie usunięte" });
  } catch (err) {
    console.error("Error revoking invitation:", err);
    res.status(500).json({ message: "Server error" });
  }
};
