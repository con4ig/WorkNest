import Leave from "../models/Leave.js";
import mongoose from "mongoose";

const getWorkingDays = (start, end) => {
  let count = 0;
  const current = new Date(start);
  const endDate = new Date(end);

  while (current <= endDate) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
};

export const getLeaves = async (req, res) => {
  try {
    let query = {};

    // Company isolation
    if (req.user.role !== "superadmin") {
      query.company = req.user.company;
    }

    // Employee sees only their own
    if (req.user.role === "employee") {
      query.user = req.user._id;
    }

    // Optional filters
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Admin/HR can filter by specific user
    if ((req.user.role === "admin" || req.user.role === "hr") && req.query.userId) {
      query.user = req.query.userId;
    }

    // Text search (username or email)
    if (req.query.search) {
      // Find users matching the search term first
      const users = await mongoose.model('User').find({
        $or: [
            { username: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } }
        ]
      }).select('_id');
      
      const userIds = users.map(u => u._id);
      
      // Add user IDs to query
      if (query.user) {
        // If user is already filtered (e.g. by role or userId param), valid intersection
        // But simplifying: if searching text, we look for leaves of those users
         query.user = { $in: userIds, $eq: query.user }; // Intersection (simplified logic below)
         // Complex intersection might be needed if query.user is already set. 
         // Let's refine:
         if(Array.isArray(query.user)) {
             // hard case, skip for MVP
         } else if (typeof query.user === 'string' || query.user instanceof mongoose.Types.ObjectId) {
             const match = userIds.find(id => id.toString() === query.user.toString());
             query.user = match ? match : null; // If searched user doesn't match selected user, 0 results
         }
      } else {
        query.user = { $in: userIds };
      }
    }

    const leaves = await Leave.find(query)
      .populate("user", "username email firstName lastName profileImage")
      .populate("reviewedBy", "username")
      .sort({ createdAt: -1 });

    // Calculate usage stats for each user (only for pending/relevant leaves to avoid huge overhead if list is massive, but for now map all)
    // Optimization: aggregate usage per user in one go? 
    // For simplicity efficiently:
    const leavesWithStats = await Promise.all(leaves.map(async (doc) => {
        const leave = doc.toObject();
        if (leave.user) {
             const startOfYear = new Date(new Date().getFullYear(), 0, 1);
             const endOfYear = new Date(new Date().getFullYear(), 11, 31);
             
             // Count APPROVED days used this year
             const usedLeaves = await Leave.find({
                 user: leave.user._id,
                 status: 'approved',
                 startDate: { $gte: startOfYear, $lte: endOfYear }
             });
             
             const usedDays = usedLeaves.reduce((sum, l) => sum + (l.days || 0), 0);
             leave.user.stats = { usedDaysThisYear: usedDays };
        }
        return leave;
    }));

    res.json({
      count: leavesWithStats.length,
      leaves: leavesWithStats,
    });
  } catch (err) {
    console.error("Error fetching leaves:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ user: req.user._id })
      .populate("reviewedBy", "username")
      .sort({ createdAt: -1 });

    const leavesWithDays = leaves.map((l) => ({
      ...l.toObject(),
      days: getWorkingDays(l.startDate, l.endDate),
    }));

    const stats = {
      pending: leaves.filter((l) => l.status === "pending").length,
      approved: leaves.filter((l) => l.status === "approved").length,
      rejected: leaves.filter((l) => l.status === "rejected").length,
      totalDays: leaves
        .filter((l) => l.status === "approved")
        .reduce((sum, l) => sum + getWorkingDays(l.startDate, l.endDate), 0),
    };

    res.json({ leaves: leavesWithDays, stats });
  } catch (err) {
    console.error("Error fetching my leaves:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const createLeave = async (req, res) => {
  const { leaveType, startDate, endDate, reason } = req.body;

  if (!startDate || !endDate) {
    return res.status(400).json({
      message: "Start and end dates are required",
    });
  }

  // Calculate number of days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = getWorkingDays(start, end);

  if (days <= 0) {
    return res.status(400).json({
      message: "End date must be after start date",
    });
  }

  try {
    const leave = new Leave({
      user: req.user._id,
      company: req.user.company,
      leaveType: leaveType || "vacation",
      startDate,
      endDate,
      reason,
      days,
      status: "pending",
    });

    await leave.save();

    const populatedLeave = await Leave.findById(leave._id).populate(
      "user",
      "username email"
    );

    res.status(201).json({
      message: "Leave request submitted successfully",
      leave: populatedLeave,
    });
  } catch (err) {
    console.error("Error creating leave:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const approveLeave = async (req, res) => {
  const { reviewNote } = req.body;

  try {
    const query = { _id: req.params.id };
    if (req.user.role !== "superadmin") {
      query.company = req.user.company;
    }

    const leave = await Leave.findOneAndUpdate(
      query,
      {
        status: "approved",
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
        reviewNote: reviewNote || "",
      },
      { new: true }
    )
      .populate("user", "username email")
      .populate("reviewedBy", "username");

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    res.json({
      message: "Leave request approved",
      leave,
    });
  } catch (err) {
    console.error("Error approving leave:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const rejectLeave = async (req, res) => {
  const { reviewNote } = req.body;

  if (!reviewNote) {
    return res.status(400).json({
      message: "Rejection reason is required",
    });
  }

  try {
    const query = { _id: req.params.id };
    if (req.user.role !== "superadmin") {
      query.company = req.user.company;
    }

    const leave = await Leave.findOneAndUpdate(
      query,
      {
        status: "rejected",
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
        reviewNote,
      },
      { new: true }
    )
      .populate("user", "username email")
      .populate("reviewedBy", "username");

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    res.json({
      message: "Leave request rejected",
      leave,
    });
  } catch (err) {
    console.error("Error rejecting leave:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteLeave = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role !== "superadmin") {
      query.company = req.user.company;
    }

    const leave = await Leave.findOne(query);

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    // Only own requests
    if (leave.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    // Only pending can be deleted
    if (leave.status !== "pending") {
      return res.status(400).json({
        message: "Only pending requests can be deleted",
      });
    }

    await leave.deleteOne();

    res.json({ message: "Leave request deleted" });
  } catch (err) {
    console.error("Error deleting leave:", err);
    res.status(500).json({ message: "Server error" });
  }
};
