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
      default: 1, // Domyślnie jednorazowy
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

// Automatyczne usuwanie wygasłych zaproszeń (TTL Index)
// expiredAt: dokument zostanie usunięty natychmiast po dacie 'expiresAt'
// MongoDB sprawdza to w tle co ok. 60 sekund.
invitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Invitation", invitationSchema);
