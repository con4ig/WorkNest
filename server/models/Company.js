import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  invitationCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isDemo: {
    type: Boolean,
    default: false,
  },
  expiresAt: {
    type: Date,
    index: { expires: 0 },
  },
});

export default mongoose.model("Company", companySchema);
