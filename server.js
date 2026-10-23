import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";

// Route Imports
import authRoutes from "./routes/Auth.js";
import inquiryRoutes from "./routes/Inquiry.js";
import heroRoutes from "./routes/Hero.js";
import destinationRoutes from "./routes/Destination.js";

// Handle __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Environment Variables
dotenv.config({ path: path.resolve(__dirname, "config", "config.env") });

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 4000;

// Trust First Proxy (Required for Reverse Proxies like Render, Railway, Nginx)
app.set("trust proxy", 1);

// 1. Security Headers (Configured for Cross-Origin Media Support)
// app.use(
//   helmet({
//     crossOriginResourcePolicy: { policy: "cross-origin" },
//   }),
// );
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "https://cms-travel-client.vercel.app",
    credentials: true, // Importante para sa cookies/auth
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// 2. HTTP Request Logger
if (process.env.NODE_ENV === "DEVELOPMENT") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// 3. Response Compression
app.use(compression());

// 4. Rate Limiting Configurations
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: {
    success: false,
    message:
      "Too many requests from this IP. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit login attempts to 10 per window
  message: {
    success: false,
    message:
      "Too many authentication attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply Global Rate Limiting
app.use("/api/v1/", globalLimiter);

// 5. Dynamic CORS Configuration (Supports local dev + production origins)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy violation: Access denied"));
      }
    },
    credentials: true,
  }),
);

// 6. Body Parsers & Cookie Parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// 7. Data Sanitization against NoSQL Query Injection (Fixed req.query read-only error)
app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== "object") return;
    for (const key in obj) {
      if (key.startsWith("$") || key.includes(".")) {
        delete obj[key];
      } else if (typeof obj[key] === "object") {
        sanitize(obj[key]);
      }
    }
  };

  // Sanitize mutatable incoming data only
  if (req.body) sanitize(req.body);
  if (req.params) sanitize(req.params);

  next();
});

// Database Connection Function
const connectDB = async () => {
  try {
    const dbUri =
      process.env.NODE_ENV === "DEVELOPMENT"
        ? process.env.DB_LOCAL_URI
        : process.env.DB_URI;

    const conn = await mongoose.connect(dbUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Establish DB Connection
connectDB();

// Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Travel CMS API is running cleanly...",
    environment: process.env.NODE_ENV || "development",
  });
});

// API Routes
app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/inquiries", inquiryRoutes);
app.use("/api/v1/heroes", heroRoutes);
app.use("/api/v1/destinations", destinationRoutes);

// 8. 404 Unhandled Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found - ${req.originalUrl}`,
  });
});

// 9. Global Centralized Error Handler Middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "DEVELOPMENT" ? err.stack : undefined,
  });
});

// Start HTTP Server
const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
  );
});

// Handle Unhandled Promise Rejections
process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  server.close(() => process.exit(1));
});

// Handle Graceful Shutdowns
const shutdownGracefully = async () => {
  console.log("Shutting down server gracefully...");
  server.close(async () => {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
    process.exit(0);
  });
};

process.on("SIGINT", shutdownGracefully);
process.on("SIGTERM", shutdownGracefully);
