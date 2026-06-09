import { createServer } from "http";
import dns from "dns";
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.js";
import logger from "./lib/logger.js";
import { initRealtime } from "./lib/realtime.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config();

const PORT = process.env.PORT || 5500;

const startServer = async () => {
  // Wrap Express in a raw http.Server so we can bolt Socket.IO onto
  // the same listener — one port serves both HTTP and WS.
  const httpServer = createServer(app);

  // Start listening immediately so platform health checks (Render, Railway)
  // see the process as "live" while we are still negotiating the DB connection.
  httpServer.listen(PORT, () => {
    logger.info(
      { port: PORT, env: process.env.NODE_ENV || "development" },
      `🚀 Server running on port ${PORT}`,
    );
  });

  // Bind Socket.IO. Use the same CORS allowlist as Express; the array
  // is computed from `ALLOWED_ORIGINS` env at module load.
  const corsOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : true;
  initRealtime(httpServer, { corsOrigins });

  try {
    logger.info("⏳ Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info("✅ MongoDB connected");
  } catch (error) {
    logger.error(
      { err: error },
      `❌ MongoDB connection error: ${error.message}`,
    );
    if (process.env.NODE_ENV === "production") {
      logger.fatal("FATAL: Unable to connect to the database in production.");
    }
  }
};

startServer();
