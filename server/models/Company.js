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
    required: true,
    unique: true,
  },
});

export default mongoose.model("Company", companySchema);
