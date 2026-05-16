import bcrypt from "bcrypt";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import Company from "../models/Company.js";
import Invitation from "../models/Invitation.js";
import Task from "../models/Task.js";
import Leave from "../models/Leave.js";
import Project from "../models/Project.js";

const saltRounds = 10;

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      role: user.role,
      company: user.company ? user.company._id : null,
    },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { _id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

export const register = async (req, res) => {
  const { username, email, password, role, companyName, invitationCode } =
    req.body;

  if (!username || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "A user with this email already exists" });
    }

    const session = await mongoose.startSession();
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    let companyId;

    if (role === "admin") {
      if (!companyName) {
        return res
          .status(400)
          .json({ message: "Company name is required for an administrator" });
      }

      let savedUser, savedCompany;

      try {
        await session.withTransaction(async () => {
          const invitationCode = crypto.randomBytes(8).toString("hex");

          const newCompany = new Company({
            name: companyName,
            owner: null,
            invitationCode,
          });

          const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: "admin",
            company: newCompany._id,
          });

          const userResult = await newUser.save({ session });
          newCompany.owner = userResult._id;
          const companyResult = await newCompany.save({ session });

          savedUser = userResult;
          savedCompany = companyResult;
        });
      } finally {
        session.endSession();
      }

      return res.status(201).json({
        message: "Company and administrator registered successfully",
        user: {
          _id: savedUser._id,
          username: savedUser.username,
          role: savedUser.role,
          company: savedCompany._id,
        },
        company: {
          _id: savedCompany._id,
          name: savedCompany.name,
        },
      });
    } else if (role === "employee" || role === "hr") {
      if (!invitationCode) {
        return res
          .status(400)
          .json({ message: "Invitation code is required" });
      }

      const invitation = await Invitation.findOne({
        code: invitationCode,
        expiresAt: { $gt: new Date() },
      });

      if (!invitation) {
        return res
          .status(404)
          .json({ message: "Invalid or expired invitation code" });
      }

      if (invitation.maxUses > 0 && invitation.uses >= invitation.maxUses) {
        return res.status(400).json({ message: "Usage limit for this code has been exhausted" });
      }

      companyId = invitation.company;

      invitation.uses += 1;

      // If limit reached -> delete code, otherwise save updated counter
      if (invitation.maxUses > 0 && invitation.uses >= invitation.maxUses) {
        await Invitation.findByIdAndDelete(invitation._id);
      } else {
        await invitation.save();
      }

      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        role: invitation.role || role,
        company: companyId,
      });

      const savedUser = await newUser.save();

      return res.status(201).json({
        message: "User registered successfully",
        user: {
          _id: savedUser._id,
          username: savedUser.username,
          role: savedUser.role,
        },
      });
    } else {
      return res
        .status(400)
        .json({ message: "Invalid user role" });
    }
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).populate("company", "name");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    };

    res.cookie("refreshToken", refreshToken, cookieOptions);

    res.json({
      message: "Logged in successfully",
      accessToken,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        company: user.company,
        profileImage: user.profileImage || "",
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Missing refresh token" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded._id).populate("company", "name");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const newAccessToken = generateAccessToken(user);

    res.json({
      accessToken: newAccessToken,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        company: user.company,
        profileImage: user.profileImage || "",
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch (err) {
    console.error("Refresh token error:", err);
    // Clear cookie if refresh token is bad
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: "/",
    });
    return res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};

export const logout = async (req, res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: "/",
  };

  try {
    // If this is a demo user, clean up the entire sandbox on logout
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded._id);
      if (user && user.isDemo && user.company) {
        const companyId = user.company;
        console.log(`🧹 Cleaning demo sandbox for company: ${companyId}`);
        await User.deleteMany({ company: companyId, isDemo: true });
        await Leave.deleteMany({ company: companyId });
        await Project.deleteMany({ company: companyId });
        await Task.deleteMany({ company: companyId });
        await Company.deleteOne({ _id: companyId, isDemo: true });
        console.log(`✅ Demo sandbox cleaned.`);
      }
    }
  } catch (err) {
    // Cleanup failure shouldn't block logout
    console.warn("Error while cleaning demo sandbox:", err.message);
  }

  res.clearCookie("refreshToken", cookieOptions);
  res.clearCookie("token", cookieOptions);
  res.json({ message: "Logged out successfully" });
};

export const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userId = req.user._id;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.mustChangePassword = false;
    await user.save();

    res.json({ message: "Password changed successfully" });

  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Server error during password change" });
  }
};

export const demoLogin = async (req, res) => {
  try {
    // 1. Generate unique suffix for this demo session
    const demoSuffix = crypto.randomBytes(4).toString("hex");
    const DEMO_EMAIL = `demo-${demoSuffix}@worknest.com`;
    const DEMO_COMPANY_NAME = `Demo Company ${demoSuffix}`;

    // TTL: 24 hours fallback (logout cleanup is the primary method)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        // DO NOT wipe anymore - we create unique sessions

        // 2. Create Fresh Demo Environment & Users
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('demo123', salt);
        const invitationCode = crypto.randomBytes(8).toString("hex");

        const newCompany = new Company({
          name: DEMO_COMPANY_NAME,
          invitationCode,
          isDemo: true,
          expiresAt
        });

        const demoAdmin = new User({
          username: `Demo Admin ${demoSuffix}`,
          email: DEMO_EMAIL,
          password: hashedPassword,
          role: 'admin',
          company: newCompany._id,
          position: 'CEO',
          department: 'Management',
          isDemo: true,
          expiresAt
        });

        newCompany.owner = demoAdmin._id;

        await newCompany.save({ session });
        await demoAdmin.save({ session });

        // Create auxiliary demo users
        const demoHR = new User({
          username: `Anna HR (Demo ${demoSuffix})`,
          email: `hr-${demoSuffix}@demo.com`,
          password: hashedPassword,
          role: 'hr',
          company: newCompany._id,
          position: 'HR Manager',
          department: 'HR',
          isDemo: true,
          expiresAt
        });
        await demoHR.save({ session });

        const demoEmp = new User({
          username: `John Employee (Demo ${demoSuffix})`,
          email: `employee-${demoSuffix}@demo.com`,
          password: hashedPassword,
          role: 'employee',
          company: newCompany._id,
          position: 'Developer',
          department: 'IT',
          salary: 8000,
          isDemo: true,
          expiresAt
        });
        await demoEmp.save({ session });

        // 3. Create Sample Data (Leads, Projects, Tasks etc.)
        const today = new Date();

        const approvedLeave = new Leave({
          user: demoEmp._id,
          company: newCompany._id,
          leaveType: 'vacation',
          startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
          endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
          days: 5,
          reason: 'Sandbox vacation',
          status: 'approved',
          reviewedBy: demoHR._id,
          reviewedAt: new Date(),
          expiresAt
        });
        await approvedLeave.save({ session });

        const projectWeb = new Project({
          name: 'Portfolio Build',
          description: 'Demo project successfully isolated in your own sandbox!',
          status: 'running',
          priority: 'high',
          startDate: new Date(),
          endDate: new Date(today.getFullYear(), today.getMonth() + 2, today.getDate()),
          createdBy: demoAdmin._id,
          company: newCompany._id,
          assignedUsers: [demoAdmin._id, demoEmp._id],
          progress: 75
        });
        await projectWeb.save({ session });

        const task1 = new Task({
          title: 'Isolation Verification',
          description: 'Check that your changes are not visible to other demo users.',
          status: 'in-progress',
          priority: 'high',
          dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
          project: projectWeb._id,
          assignedUser: demoEmp._id,
          createdBy: demoAdmin._id,
          company: newCompany._id
        });
        await task1.save({ session });
      });
    } finally {
      session.endSession();
    }

    // 4. Return Login Response
    const user = await User.findOne({ email: DEMO_EMAIL }).populate("company", "name");

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    };

    res.cookie("refreshToken", refreshToken, cookieOptions);

    console.log(`🔑 Tokens generated for: ${DEMO_EMAIL}`);
    console.log(`👤 Demo user data:`, { id: user._id, role: user.role });

    res.json({
      message: "Your personal Demo sandbox is running. Data expires in 2 hours.",
      accessToken,
      user: {
        id: user._id,
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        company: user.company,
        profileImage: user.profileImage || "",
        mustChangePassword: false,
        isDemo: true
      },
    });

  } catch (err) {
    console.error("Demo login error:", err);
    res.status(500).json({ message: "Error generating demo version" });
  }
};
