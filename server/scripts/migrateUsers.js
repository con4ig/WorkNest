// scripts/migrateUsers.js
// Run: node scripts/migrateUsers.js

import mongoose from "mongoose";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/hr-system";

async function migrateUsers() {
  try {
    console.log("🔄 Connecting to database...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to database");

    console.log("📝 Updating existing users...");

    const result = await User.updateMany(
      {},
      {
        $set: {
          firstName: {
            $cond: [{ $ifNull: ["$firstName", false] }, "$firstName", ""],
          },
          lastName: {
            $cond: [{ $ifNull: ["$lastName", false] }, "$lastName", ""],
          },
          phoneNumber: {
            $cond: [{ $ifNull: ["$phoneNumber", false] }, "$phoneNumber", ""],
          },
          position: {
            $cond: [{ $ifNull: ["$position", false] }, "$position", ""],
          },
          department: {
            $cond: [{ $ifNull: ["$department", false] }, "$department", ""],
          },
          hireDate: {
            $cond: [{ $ifNull: ["$hireDate", false] }, "$hireDate", null],
          },
          salary: { $cond: [{ $ifNull: ["$salary", false] }, "$salary", 0] },
          status: {
            $cond: [{ $ifNull: ["$status", false] }, "$status", "active"],
          },
          contractType: {
            $cond: [
              { $ifNull: ["$contractType", false] },
              "$contractType",
              "full-time",
            ],
          },
          address: {
            $cond: [{ $ifNull: ["$address", false] }, "$address", ""],
          },
          city: { $cond: [{ $ifNull: ["$city", false] }, "$city", ""] },
          peselOrId: {
            $cond: [{ $ifNull: ["$peselOrId", false] }, "$peselOrId", ""],
          },
          notes: { $cond: [{ $ifNull: ["$notes", false] }, "$notes", ""] },
        },
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} users`);

    // Display sample
    const sample = await User.findOne().select("-password");
    console.log("\n📊 Example of an updated user:");
    console.log(JSON.stringify(sample, null, 2));

    console.log("\n✅ Migration completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during migration:", error);
    process.exit(1);
  }
}

migrateUsers();
