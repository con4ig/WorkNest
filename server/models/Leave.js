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
        "vacation", // Wypoczynkowy
        "on_demand", // Na żądanie
        "unpaid", // Bezpłatny
        "occasional", // Okolicznościowy
        "maternity", // Macierzyński
        "paternity", // Ojcowski
        "parental", // Rodzicielski
        "childcare", // Wychowawczy
        "care", // Opiekuńczy
        "training", // Szkoleniowy
        "job_search", // Na poszukiwanie pracy
        "health", // Zdrowotny/Rehabilitacyjny (zastępuje sick w ui ale zostawiamy dla wstecznej kompatybilności)
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
