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
    maxUses: {
      type: Number,
      default: 1, // Single-use by default
    },
    uses: {
      type: Number,
      default: 0,
    },
    role: {
      type: String,
      enum: ["employee", "hr", "admin"],
      default: "employee",
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

// Automatic removal of expired invitations (TTL Index)
// expiredAt: document will be removed immediately after 'expiresAt' date
// MongoDB checks this in the background roughly every 60 seconds.
invitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Invitation", invitationSchema);
