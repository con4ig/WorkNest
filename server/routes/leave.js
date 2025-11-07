import express from "express";
import Leave from "../models/Leave.js";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  try {
    let query = {};

    // Company isolation
    if (req.user.role !== "superadmin") {
      query.company = req.user.company;
    }

    // Employee widzi tylko swoje
    if (req.user.role === "employee") {
      query.user = req.user._id;
    }

    // Optional filters
    if (req.query.status) {
      query.status = req.query.status;
    }

    const leaves = await Leave.find(query)
      .populate("user", "username email")
      .populate("reviewedBy", "username")
      .sort({ createdAt: -1 });

    res.json({
      count: leaves.length,
      leaves,
    });
  } catch (err) {
    console.error("Error fetching leaves:", err);
    res.status(500).json({ message: "Błąd serwera" });
  }
});

// GET /api/leaves/my - moje urlopy (dla employee dashboard)
router.get("/my", authenticate, async (req, res) => {
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
    res.status(500).json({ message: "Błąd serwera" });
  }
});

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

// POST /api/leaves - utworzenie wniosku urlopowego
router.post("/", authenticate, async (req, res) => {
  const { leaveType, startDate, endDate, reason } = req.body;

  if (!startDate || !endDate || !reason) {
    return res.status(400).json({
      message: "Data rozpoczęcia, zakończenia i powód są wymagane",
    });
  }

  // Oblicz liczbę dni
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = getWorkingDays(start, end);

  if (days <= 0) {
    return res.status(400).json({
      message: "Data zakończenia musi być po dacie rozpoczęcia",
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
      message: "Wniosek urlopowy złożony pomyślnie",
      leave: populatedLeave,
    });
  } catch (err) {
    console.error("Error creating leave:", err);
    res.status(500).json({ message: "Błąd serwera" });
  }
});

// PATCH /api/leaves/:id/approve - zatwierdzenie urlopu (HR/Admin)
router.patch(
  "/:id/approve",
  authenticate,
  authorize("hr", "admin"),
  async (req, res) => {
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
        return res.status(404).json({ message: "Wniosek nie znaleziony" });
      }

      res.json({
        message: "Wniosek zatwierdzony",
        leave,
      });
    } catch (err) {
      console.error("Error approving leave:", err);
      res.status(500).json({ message: "Błąd serwera" });
    }
  }
);

// PATCH /api/leaves/:id/reject - odrzucenie urlopu (HR/Admin)
router.patch(
  "/:id/reject",
  authenticate,
  authorize("hr", "admin"),
  async (req, res) => {
    const { reviewNote } = req.body;

    if (!reviewNote) {
      return res.status(400).json({
        message: "Powód odrzucenia jest wymagany",
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
        return res.status(404).json({ message: "Wniosek nie znaleziony" });
      }

      res.json({
        message: "Wniosek odrzucony",
        leave,
      });
    } catch (err) {
      console.error("Error rejecting leave:", err);
      res.status(500).json({ message: "Błąd serwera" });
    }
  }
);

// DELETE /api/leaves/:id - usunięcie wniosku (tylko swoje, tylko pending)
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role !== "superadmin") {
      query.company = req.user.company;
    }

    const leave = await Leave.findOne(query);

    if (!leave) {
      return res.status(404).json({ message: "Wniosek nie znaleziony" });
    }

    // Tylko własne wnioski
    if (leave.user.toString() !== req.user._id) {
      return res.status(403).json({ message: "Brak uprawnień" });
    }

    // Tylko pending można usunąć
    if (leave.status !== "pending") {
      return res.status(400).json({
        message: "Można usunąć tylko oczekujące wnioski",
      });
    }

    await leave.deleteOne();

    res.json({ message: "Wniosek usunięty" });
  } catch (err) {
    console.error("Error deleting leave:", err);
    res.status(500).json({ message: "Błąd serwera" });
  }
});

export default router;
