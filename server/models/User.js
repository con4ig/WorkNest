import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "hr", "employee", "superadmin"],
      default: "employee",
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    // Dane HR
    firstName: {
      type: String,
      default: "",
    },
    lastName: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: String,
      default: "",
    },
    position: {
      type: String,
      default: "",
    },
    department: {
      type: String,
      default: "",
    },
    hireDate: {
      type: Date,
      default: null,
    },
    salary: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "on-leave", "terminated"],
      default: "active",
    },
    contractType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "temporary"],
      default: "full-time",
    },
    address: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    peselOrId: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    profileImage: {
      type: String,
      default: "", // lub np. null
    },
  },

  { timestamps: true }
);

schema.pre("save", function (next) {
  if (this.profileImage && this.profileImage.length > 10 * 1024 * 1024) {
    // 10MB jako string (Base64 jest ~33% większy niż oryginalny plik)
    return next(new Error("Profile image is too large (max 10MB as Base64)"));
  }
  next();
});

export default mongoose.model("User", schema);
