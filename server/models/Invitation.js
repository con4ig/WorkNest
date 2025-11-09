import mongoose from "mongoose";
import crypto from "crypto";

const invitationSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Generate a unique code before saving
invitationSchema.pre("save", function (next) {
  if (!this.code) {
    this.code = crypto.randomBytes(8).toString("hex");
  }
  next();
});

export default mongoose.model("Invitation", invitationSchema);
