import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import helmet from "helmet";
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/project.js";
import leaveRoutes from "./routes/leave.js";
import userRoutes from "./routes/user.js";
import taskRoutes from "./routes/task.js";
import commentRoutes from "./routes/comment.js";
import activityRoutes from "./routes/activity.js";

dotenv.config();

const app = express();
const envOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5500",
  "https://worknest-1.onrender.com",
  "https://worknest-production-10f0.up.railway.app",
  ...envOrigins
];

// Helmet configuration
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
        "img-src": ["'self'", "data:", "https:"],
        "connect-src": ["'self'", "https://worknest-production-10f0.up.railway.app", "https://worknest-1.onrender.com", "http://localhost:5500"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xFrameOptions: { action: "sameorigin" },
  })
);

// Permissions-Policy header
app.use((req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()"
  );
  next();
});

app.use(morgan("dev"));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());
app.set("trust proxy", 1);

// Health check endpoint
app.get("/api/health", (req, res) => {
  const readyState = mongoose.connection.readyState;
  // 1 = connected, 2 = connecting
  const isAvailable = readyState === 1 || readyState === 2;
  
  res.status(isAvailable ? 200 : 503).json({
    status: isAvailable ? "ok" : "unhealthy",
    db: readyState === 1 ? "connected" : readyState === 2 ? "connecting" : "disconnected",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10000,
  standardHeaders: true,
  legacyHeaders: false,
});

// Osobny, łagodniejszy limiter dla auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// Aplikuj różne limitery
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/refresh", authLimiter);
app.use("/api", apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/activities", activityRoutes);


// Simple ping endpoint for cron jobs
app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

// Root route
app.get("/", (req, res) => {
  res.send("WorkNest API działa poprawnie.");
});


const PORT = process.env.PORT || 5500;

// Połączenie z MongoDB i start serwera
const startServer = async () => {
  // Start server listening immediately so Render sees it as "live"
  const server = app.listen(PORT, () => {
    console.log(`🚀 Serwer działa na porcie ${PORT}`);
    console.log(`📁 Środowisko: ${process.env.NODE_ENV || "development"}`);
  });

  try {
    console.log("⏳ Łączenie z MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout po 5 sekundach
    });
    console.log(`✅ MongoDB Connected`);
  } catch (error) {
    console.error(`❌ Błąd połączenia z MongoDB: ${error.message}`);
    // Na produkcji lepiej zamknąć serwer, jeśli baza jest kluczowa
    if (process.env.NODE_ENV === 'production') {
      console.error("FATAL: Nie można połączyć się z bazą danych na produkcji.");
      // server.close(() => process.exit(1));
    }
  }
};

startServer();