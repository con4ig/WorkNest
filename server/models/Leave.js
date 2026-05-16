import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    leaveType: {
      type: String,
      enum: [
        "vacation", // Vacation
        "on_demand", // On demand
        "unpaid", // Unpaid
        "occasional", // Occasional
        "maternity", // Maternity
        "paternity", // Paternity
        "parental", // Parental
        "childcare", // Childcare
        "care", // Care
        "training", // Training
        "job_search", // Job search
        "health", // Health/Rehabilitation (replaces sick in UI but kept for backward compatibility)
        "sick", 
        "personal", 
        "other"
      ],
      default: "vacation",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    reviewNote: {
      type: String,
    },
    days: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Leave", leaveSchema);
