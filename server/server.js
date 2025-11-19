import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import User from "./models/User.js";
import authenticate from "./middleware/authenticate.js";
import authorize from "./middleware/authorize.js";
// import emailRoutes from "./routes/email.js";
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/project.js";
import leaveRoutes from "./routes/leave.js";
import userRoutes from "./routes/user.js";
import taskRoutes from "./routes/task.js";
import commentRoutes from "./routes/comment.js";
import activityRoutes from "./routes/activity.js";

dotenv.config();

const app = express();
const allowedOrigins = ['http://localhost:5173', 'https://worknest.totalh.net', "https://worknest-1.onrender.com"];

// app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Zezwalaj na żądania bez 'origin' (np. z Postmana lub mobilnych aplikacji)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ['Content-Type', 'Authorization'] // WAŻNE: Dodano 'Authorization'
  })
);
app.use(express.json());
app.use(cookieParser());
app.set('trust proxy', 1);
app.use(
  rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 300, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  })
);

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

// Trasy
// app.use("/api/email", emailRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/activities", activityRoutes);

app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
