import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "project_created",
        "project_updated",
        "status_changed",
        "progress_updated",
        "user_added",
        "user_removed",
        "task_created",
        "task_updated",
        "task_completed",
        "task_deleted",
        "comment_added",
        "comment_replied",
        "comment_deleted",
        "priority_changed",
        "dates_changed",
      ],
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

activitySchema.index({ project: 1, createdAt: -1 });

export default mongoose.model("Activity", activitySchema);
