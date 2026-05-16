import User from "../models/User.js";
import Invitation from "../models/Invitation.js";
import bcrypt from "bcryptjs";

export const getUsers = async (req, res) => {
  try {
    const { search } = req.query;

    let query = {};

    // Company isolation - safely fetch company ID
    if (req.user.role !== "superadmin") {
      const userCompanyId = req.user.company?._id || req.user.company;

      if (!userCompanyId) {
        return res.status(403).json({ message: "No company assigned" });
      }

      query.company = userCompanyId;
    }

    // If search param is provided - filter by username, email, firstName or lastName
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
    res.status(500).json({ message: "Server error" });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    // req.user is already available thanks to 'authenticate' middleware
    // and contains data from populate('company')
    res.json(req.user);
  } catch (err) {
    console.error("Error fetching current user:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    // Check if authenticate middleware set req.user
    if (!req.user) {
      console.error(
        "❌ req.user is undefined - authenticate middleware is not working"
      );
      return res.status(401).json({ message: "You are not logged in" });
    }

    let query = { _id: req.params.id };

    // Company isolation: Only allow fetching users from the same company
    if (req.user.role !== "superadmin") {
      if (!req.user.company) {
        return res
          .status(403)
          .json({
            message: "No company assigned to the current user.",
          });
      }
      query.company = req.user.company._id;
    }

    const user = await User.findOne(query);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Permission check: user can view their own data, HR/Admin can view everyone
    if (
      req.user._id.toString() !== req.params.id &&
      !["hr", "admin"].includes(req.user.role)
    ) {
      return res
        .status(403)
        .json({ message: "No permission to view this profile" });
    }

    // Return all available fields, even if empty
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
    res.status(500).json({ message: "Server error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const isOwnProfile = req.user._id.toString() === userId;
    const isAdmin = ["hr", "admin"].includes(req.user.role);

    // Permission check: only HR/Admin can edit other people's data
    if (!isOwnProfile && !isAdmin) {
      return res
        .status(403)
        .json({ message: "You can only edit your own data" });
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

    // Data validation
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
    }

    if (
      status &&
      !["active", "inactive", "on-leave", "terminated"].includes(status)
    ) {
      return res.status(400).json({
        message:
          "Invalid status. Allowed: active, inactive, on-leave, terminated",
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
          "Invalid contract type. Allowed: full-time, part-time, contract, temporary",
      });
    }

    if (role && !["employee", "hr", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Allowed: employee, hr, admin",
      });
    }

    // Employees cannot change their own role
    if (!isAdmin && role) {
      return res
        .status(403)
        .json({ message: "You cannot change your own role" });
    }

    if (salary !== undefined && salary < 0) {
      return res.status(400).json({ message: "Salary cannot be negative" });
    }
    
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ NOW CHECK COMPANY ISOLATION
    if (req.user.role !== "superadmin") {
      // Get company ID from object or directly
      const userCompanyId = req.user.company?._id || req.user.company;
      const existingUserCompanyId =
        existingUser.company?._id || existingUser.company;

      if (!userCompanyId) {
        return res.status(403).json({ message: "No company assigned" });
      }

      if (userCompanyId.toString() !== existingUserCompanyId.toString()) {
        return res.status(403).json({
          message:
            "You don't have permission to edit a user from another company",
        });
      }
    }

    // Check if email already exists (if email is being changed)
    if (email && email !== existingUser.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email is already in use" });
      }
    }

    // Prepare update object dynamically
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

    // Special handling for role (admin only)
    if (isAdmin && req.body.role !== undefined) {
      updateData.role = req.body.role;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.json({
      message: "Employee data updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error updating user:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

export const updateUserRole = async (req, res) => {
  const { role } = req.body;

  // Role validation
  if (!["employee", "hr", "admin"].includes(role)) {
    return res.status(400).json({
      message: "Invalid role. Allowed: employee, hr, admin",
    });
  }

  try {
    // ✅ FIRST FETCH THE USER
    const userToUpdate = await User.findById(req.params.id);

    if (!userToUpdate) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ NOW CHECK COMPANY ISOLATION
    if (req.user.role !== "superadmin") {
      // Get company ID from object or directly
      const adminCompanyId = req.user.company?._id || req.user.company;
      const userCompanyId = userToUpdate.company?._id || userToUpdate.company;

      if (!adminCompanyId) {
        return res.status(403).json({ message: "No company assigned" });
      }

      if (adminCompanyId.toString() !== userCompanyId.toString()) {
        return res.status(403).json({
          message:
            "You don't have permission to change the role of a user from another company",
        });
      }
    }

    // ✅ Change role
    userToUpdate.role = role;
    const updatedUser = await userToUpdate.save();

    res.json({
      message: "Role changed successfully",
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (err) {
    console.error("Error updating role:", err);
    res.status(500).json({ message: "Server error" });
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

    // Convert buffer to Base64 string
    const base64Image = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype;

    // Save as data URL (easier to display in the frontend)
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
    const { maxUses, expiresIn, role } = req.body; // Get parameters
    const companyId = req.user.company?._id || req.user.company;

    if (!companyId) {
      return res
        .status(400)
        .json({ message: "User is not assigned to a company." });
    }

    // Calculate expiration date
    let expirationDate = new Date();
    if (expiresIn) {
      // Support different time formats (e.g. "30m", "24h", "7d") or milliseconds
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
      invitation: newInvitation // Return the whole object
    });
  } catch (err) {
    console.error("Error generating invitation code:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getInvitations = async (req, res) => {
  try {
    const companyId = req.user.company?._id || req.user.company;
     if (!companyId) return res.status(400).json({ message: "No company" });

    // Lazy remove expired invitations
    await Invitation.deleteMany({ expiresAt: { $lt: new Date() } });

    // Get only active invitations (or all and filter in the frontend - better all for history?)
    // We fetch all that have not yet expired OR still have uses left
    // But admin may want to see a list of active codes.
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
     // Check that this invitation belongs to the admin's company (security)
     const invitation = await Invitation.findById(id);

     if (!invitation) return res.status(404).json({ message: "Invitation not found" });

     // Check company permissions
     const userCompanyId = req.user.company?._id || req.user.company;
     if (invitation.company.toString() !== userCompanyId.toString()) {
        return res.status(403).json({ message: "No permission" });
     }

     await Invitation.findByIdAndDelete(id);
     res.json({ message: "Invitation removed" });
  } catch (err) {
    console.error("Error revoking invitation:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const importUsersFromCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const companyId = req.user.company?._id || req.user.company;
    if (!companyId) {
      return res.status(400).json({ message: "User is not assigned to a company." });
    }

    const { password: tempPassword } = req.body;
    const passwordToUse = tempPassword || "WorkNest123!";

    let fileContent = req.file.buffer.toString("utf-8");
    if (fileContent.charCodeAt(0) === 0xFEFF) {
        fileContent = fileContent.slice(1);
    }

    const rows = fileContent.split(/\r?\n/);
    
    if (rows.length < 2) {
      return res.status(400).json({ message: "CSV file is empty or missing headers" });
    }

    const headers = rows[0].split(",").map(h => h.trim());
    
    const headerMap = {};
    headers.forEach((header, index) => {
        const cleanHeader = header.replace(/^"|"$/g, '').replace(/^\uFEFF/, '').trim();
        headerMap[index] = cleanHeader;
    });

    const failed = [];
    let processed = 0;
    let created = 0;

    for (let i = 1; i < rows.length; i++) {
        const rowString = rows[i].trim();
        if (!rowString) continue;

        const values = rowString.split(",");
        
        if (values.length < headers.length) {
            continue; 
        }

        const userData = {};
        
        Object.keys(headerMap).forEach(colIndex => {
            const field = headerMap[colIndex];
             if (values[colIndex]) {
                 userData[field] = values[colIndex].trim().replace(/^"|"$/g, '');
             }
        });

        if (!userData.email || !userData.username) {
            failed.push({ row: i + 1, message: "Missing required fields (email, username)" });
            continue;
        }

        try {
            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                 failed.push({ row: i + 1, email: userData.email, message: "A user with this email already exists" });
                 continue;
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(passwordToUse, salt);

            const newUser = new User({
                ...userData,
                password: hashedPassword,
                company: companyId,
                role: userData.role || 'employee',
                status: userData.status || 'active',
                mustChangePassword: true
            });
            
            await newUser.save();
            created++;

        } catch (err) {
            failed.push({ row: i + 1, email: userData.email, message: err.message });
        }
        processed++;
    }

    res.json({
        message: "Import completed",
        processed,
        created,
        failedCount: failed.length,
        failedSamples: failed.slice(0, 10),
        defaultPassword: passwordToUse
    });

  } catch (err) {
    console.error("CSV Import error:", err);
    res.status(500).json({ message: "Server error while processing CSV" });
  }
};
