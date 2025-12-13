import mongoose from "mongoose";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Must be 32 chars
const IV_LENGTH = 16; // For AES, this is always 16

function encrypt(text) {
  if (!text) return text;
  if (!ENCRYPTION_KEY) {
    console.warn("⚠️ ENCRYPTION_KEY is missing in .env! Saving unencrypted.");
    return text;
  }
  try {
    // Ensure key is correct length for aes-256-cbc (32 bytes)
    // We expect a 64-character hex string which converts to 32 bytes
    const key = Buffer.from(ENCRYPTION_KEY, "hex");

    if (key.length !== 32) {
      console.warn(
        "⚠️ ENCRYPTION_KEY must be a 64-character hex string (32 bytes)!"
      );
      return text;
    }

    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
  } catch (error) {
    console.error("Encryption error:", error);
    return text; // Fallback to plain text on error to avoid data loss
  }
}

function decrypt(text) {
  if (!text) return text;
  if (!ENCRYPTION_KEY) return text;

  try {
    let textParts = text.split(":");
    if (textParts.length !== 2) {
      // Not encrypted or legacy data
      return text;
    }

    let iv = Buffer.from(textParts[0], "hex");
    let encryptedText = Buffer.from(textParts[1], "hex");
    let decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(ENCRYPTION_KEY, "hex"),
      iv
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    // If decryption fails (e.g. wrong key, or not actually encrypted), return original
    // This handles legacy data that might contain ":" but isn't valid ciphertext
    return text;
  }
}

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
      set: encrypt,
      get: decrypt,
    },
    notes: {
      type: String,
      default: "",
    },
    employmentHistory: [
      {
        company: { type: String },
        position: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        description: { type: String },
      },
    ],
    documents: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        category: {
          type: String,
          enum: ["documentation", "agreement"],
          required: true,
        },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    profileImage: {
      type: String,
      default: "", // lub np. null
    },
  },

  {
    timestamps: true,
    toJSON: { getters: true }, // Important: apply getters when converting to JSON
    toObject: { getters: true },
  }
);

schema.pre("save", function (next) {
  if (this.profileImage && this.profileImage.length > 10 * 1024 * 1024) {
    // 10MB jako string (Base64 jest ~33% większy niż oryginalny plik)
    return next(new Error("Profile image is too large (max 10MB as Base64)"));
  }
  next();
});

export default mongoose.model("User", schema);
