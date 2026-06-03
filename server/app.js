import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";
import requestLogger from "./middleware/requestLogger.js";
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/project.js";
import leaveRoutes from "./routes/leave.js";
import userRoutes from "./routes/user.js";
import taskRoutes from "./routes/task.js";
import commentRoutes from "./routes/comment.js";
import activityRoutes from "./routes/activity.js";

const isTest = process.env.NODE_ENV === "test";

const app = express();

const envOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [];
const allowedOrigins = [
  "http://localhost",
  "http://127.0.0.1",
  "http://localhost:5173",
  "http://localhost:5500",
  "https://worknest-1.onrender.com",
  "https://worknest-qpsw.onrender.com",
  "https://worknest-production-10f0.up.railway.app",
  ...envOrigins,
];

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        "style-src": [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
        ],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
        "img-src": ["'self'", "data:", "https:"],
        "connect-src": [
          "'self'",
          "https://worknest-production-10f0.up.railway.app",
          "https://worknest-1.onrender.com",
          "http://localhost:5500",
        ],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xFrameOptions: { action: "sameorigin" },
  }),
);

app.use((req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()",
  );
  next();
});

app.use(requestLogger);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(cookieParser());
app.set("trust proxy", 1);

app.get("/favicon.ico", (req, res) => res.status(204).end());

// Interactive API docs (Swagger UI) and machine-readable spec.
app.get("/api/docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: "WorkNest API — docs",
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: "list",
      defaultModelsExpandDepth: 1,
    },
  }),
);

/**
 * @openapi
 * /api/health:
 *   get:
 *     tags: [Health]
 *     summary: Liveness and DB readiness probe
 *     security: []
 *     responses:
 *       200:
 *         description: Service is up and DB is reachable (or connecting).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:    { type: string, example: ok }
 *                 db:        { type: string, example: connected }
 *                 uptime:    { type: number, example: 1234.56 }
 *                 timestamp: { type: string, format: date-time }
 *       503:
 *         description: DB is disconnected.
 */
app.get("/api/health", (req, res) => {
  const readyState = mongoose.connection.readyState;
  // 1 = connected, 2 = connecting
  const isAvailable = readyState === 1 || readyState === 2;

  res.status(isAvailable ? 200 : 503).json({
    status: isAvailable ? "ok" : "unhealthy",
    db:
      readyState === 1
        ? "connected"
        : readyState === 2
          ? "connecting"
          : "disconnected",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Rate limiters are skipped in test mode — they're correctness-irrelevant
// for the controller behaviour we exercise, and they make rapid-fire
// tests flaky.
if (!isTest) {
  const apiLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
  });

  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/register", authLimiter);
  app.use("/api/auth/refresh", authLimiter);
  app.use("/api", apiLimiter);
}

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
  res.send("WorkNest API is working correctly.");
});

export default app;
