import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import User from "./models/User.js";
import authenticate from "./middleware/authenticate.js";
import authorize from "./middleware/authorize.js";
import emailRoutes from "./routes/email.js";
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/project.js";
import leaveRoutes from "./routes/leave.js";
import userRoutes from "./routes/user.js";
import taskRoutes from "./routes/task.js";
import commentRoutes from "./routes/comment.js";
import activityRoutes from "./routes/activity.js";

dotenv.config();

const app = express();
const allowedOrigins = ['http://localhost:5173', 'https://worknesthr.ct.ws', 'https://worknest.totalh.net'];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS blocked: origin not allowed'));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  })
);
app.use(express.json());
app.use(cookieParser());
app.set('trust proxy', 1);
app.use(
  rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  })
);

const PORT = process.env.PORT || 5500;

// Połączenie z MongoDB
mongoose
  .connect(process.env.DB_URI)
  .then(() => console.log("Połączono z MongoDB 💚"))
  .catch((err) => console.error("Błąd połączenia:", err));

// Trasy
// app.use("/api/email", emailRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/activities", activityRoutes);

// Wylogowanie użytkownika
app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Wylogowano pomyślnie" });
});

app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
