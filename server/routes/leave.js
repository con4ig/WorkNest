import express from "express";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import {
  getLeaves,
  getMyLeaves,
  createLeave,
  approveLeave,
  rejectLeave,
  deleteLeave,
} from "../controllers/leaveController.js";

const router = express.Router();

// GET /api/leaves - pobranie wszystkich wniosków (z filtrowaniem)
router.get("/", authenticate, getLeaves);

// GET /api/leaves/my - moje urlopy (dla employee dashboard)
router.get("/my", authenticate, getMyLeaves);

// POST /api/leaves - utworzenie wniosku urlopowego
import { limitDemoResources } from "../middleware/limitDemoResources.js";
router.post("/", authenticate, limitDemoResources, createLeave);

// PATCH /api/leaves/:id/approve - zatwierdzenie urlopu (HR/Admin)
router.patch(
  "/:id/approve",
  authenticate,
  authorize("hr", "admin"),
  approveLeave
);

// PATCH /api/leaves/:id/reject - odrzucenie urlopu (HR/Admin)
router.patch(
  "/:id/reject",
  authenticate,
  authorize("hr", "admin"),
  rejectLeave
);

// DELETE /api/leaves/:id - usunięcie wniosku (tylko swoje, tylko pending)
router.delete("/:id", authenticate, deleteLeave);

export default router;
