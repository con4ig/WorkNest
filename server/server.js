import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/project.js";
import leaveRoutes from "./routes/leave.js";
import userRoutes from "./routes/user.js";
import taskRoutes from "./routes/task.js";
import commentRoutes from "./routes/comment.js";
import activityRoutes from "./routes/activity.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "https://worknest.totalh.net",
  "https://worknest-1.onrender.com",
];

// Helmet configuration
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", ...allowedOrigins],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
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
app.use(
  rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ========== WAŻNE: TRASY API MUSZĄ BYĆ PRZED STATIC FILES ==========
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/activities", activityRoutes);

// ========== PRODUKCJA: Serwowanie React App ==========
if (process.env.NODE_ENV === "production") {
  // Reguła 1: Serwuj zasoby z /assets z długim czasem cache'owania
  // Pliki te mają hashe w nazwach, więc są niezmienne (immutable).
  app.use('/assets', express.static(path.join(__dirname, '../client/dist/assets'), {
    maxAge: '1y',       // 1 rok
    immutable: true     // Powiedz przeglądarce, że plik nigdy się nie zmieni
  }));

  // Reguła 2: Serwuj pozostałe pliki statyczne (np. favicon.ico) bez specjalnego cache'owania
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // Reguła 3: Catch-all dla wszystkich innych zapytań (routing SPA)
  // Serwuj index.html, ale powiedz przeglądarce, żeby zawsze sprawdzała, czy jest nowa wersja.
  app.get("/*", (req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.sendFile(path.resolve(__dirname, "../client/dist", "index.html"), (err) => {
        if (err) {
            // Jeśli plik index.html nie istnieje, to znaczy, że build się nie udał.
            // Wyślij pomocną wiadomość.
            res.status(404).send(
              "Plik index.html nie został znaleziony. " +
              "Upewnij się, że uruchomiłeś komendę 'npm run build --prefix client' " +
              "i że proces budowania na Render zakończył się sukcesem."
            );
        }
    });
  });
} else {
  // Development - opcjonalne
  app.get("/", (req, res) => {
    res.send("API is running...");
  });
}

const PORT = process.env.PORT || 5500;

// Połączenie z MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Serwer działa na porcie ${PORT}`);
  console.log(`📁 Środowisko: ${process.env.NODE_ENV || "development"}`);
});