import mongoose from "mongoose";

export const connectDatabase = async () => {
  try {
    const DB_URI =
      process.env.NODE_ENV === "DEVELOPMENT"
        ? process.env.DB_LOCAL_URI
        : process.env.DB_URI;

    const conn = await mongoose.connect(DB_URI);
    console.log(`MongoDB Connected with HOST: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};
