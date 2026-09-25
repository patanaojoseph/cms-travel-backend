import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";

// Handle __dirname context inside modern ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment configuration variables explicitly
dotenv.config({ path: path.join(__dirname, "..", "config", "config.env") });
// Fallback to default .env if DB_URI is still not defined
if (!process.env.DB_URI) {
  dotenv.config({ path: path.join(__dirname, "..", ".env") });
}

const seedInitialAdmin = async () => {
  try {
    console.log("Initializing isolated database pipeline connection...");

    if (!process.env.DB_URI) {
      throw new Error(
        "DB_URI environment variable is missing. Check your config/config.env or .env file.",
      );
    }

    // Establish connection to cluster
    await mongoose.connect(process.env.DB_URI);
    console.log("Connected to MongoDB cluster for admin account seeding.");

    // Check if administrative user account profile already exists
    const adminExists = await User.findOne({ email: "joyce@gtravelcms.com" });

    if (adminExists) {
      console.log(
        "Seeding operation skipped: Administrative email account 'joyce@gtravelcms.com' already exists within registration indices.",
      );
      await mongoose.connection.close();
      process.exit(0);
    }

    // Instantiate permanent Administrative Master User account
    const superAdmin = await User.create({
      name: "Joyce Patanao",
      email: "joyce@gtravelcms.com",
      password: "TravelSecurePassword2026!", // Auto-hashed by userSchema pre-save hook
      role: "admin",
    });

    console.log("====================================================");
    console.log("SUCCESS: Master Administrative Credentials Injected!");
    console.log(`Name:     ${superAdmin.name}`);
    console.log(`Email:    ${superAdmin.email}`);
    console.log("Password:  [As set in scripts/seedAdmin.js]");
    console.log("====================================================");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Seeding Lifecycle Failure Error: ${error.message}`);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Fire execution pipeline
seedInitialAdmin();
