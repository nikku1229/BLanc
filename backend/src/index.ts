import express from "express";
import helmet from "helmet";
import dotenv from "dotenv";
import { connectDB, disconnectDB } from "./config/database.ts";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware.ts";
import {
  globalLimiter,
  authLimiter,
  createLimiter,
} from "./middleware/ratelimiter.ts";
import { corsMiddleware } from "./middleware/cors.ts";
import authRoutes from "./routes/auth.routes.ts";
import groupRoutes from "./routes/group.routes.ts";
import transactionRoutes from "./routes/transaction.routes.ts";
import { verifyEmailTransporter } from "./config/email.ts";

// --------------------- Load Environment Variables ---------------------
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --------------------- Connect to Database ---------------------
connectDB();

// --------------------- Graceful Shutdown ---------------------
const gracefulShutdown = async () => {
  console.log("🔄 Shutting down gracefully...");
  await disconnectDB();
  process.exit(0);
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

// --------------------- Security Middleware ---------------------
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }),
);

app.use(corsMiddleware);

// --------------------- Rate Limiting ---------------------
app.use("/api", globalLimiter); // 500 requests / 15 min
app.use("/api/auth", authLimiter); // 30 requests / 15 min for auth
app.use("/api/groups", createLimiter); // 100 requests / hour for create/update
app.use("/api/transactions", createLimiter); // 100 requests / hour for create/update

// --------------------- Body Parsers ---------------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// --------------------- Health Check ---------------------
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// --------------------- Routes ---------------------
app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/transactions", transactionRoutes);

// --------------------- 404 Handler ---------------------
app.use(notFoundHandler);

// --------------------- Global Error Handler ---------------------
app.use(errorHandler);

// --------------------- Verify Services ---------------------
const initializeServices = async () => {
  try {
    // ✅ Verify Email
    await verifyEmailTransporter();
  } catch (error) {
    console.warn("⚠️ Some services failed to initialize:", error);
  }
};

initializeServices();

// --------------------- Start Server ---------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}/api`);
});
