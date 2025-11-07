import mongoose from "mongoose";
import User from "../models/User.js";
import Company from "../models/Company.js";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.DB_URI;

const migrateUsers = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    let defaultCompany = await Company.findOne({ name: "Default Company" });

    if (!defaultCompany) {
      console.log("Default company not found, creating one...");
      defaultCompany = new Company({
        name: "Default Company",
        invitationCode: Math.random().toString(36).substring(2, 15),
      });
      await defaultCompany.save();
      console.log("Default company created");
    }

    const usersToMigrate = await User.find({ company: { $exists: false } });

    if (usersToMigrate.length === 0) {
      console.log("No users to migrate.");
      return;
    }

    console.log(`Found ${usersToMigrate.length} users to migrate.`);

    for (const user of usersToMigrate) {
      user.company = defaultCompany._id;
      await user.save();
      console.log(`Migrated user ${user.username} to default company.`);
    }

    console.log("Migration completed successfully.");
  } catch (error) {
    console.error("Error during migration:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

migrateUsers();
