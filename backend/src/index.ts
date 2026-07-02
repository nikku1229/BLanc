import express from "express";
import helmet from "helmet";
import dotenv from "dotenv";
import { connectDB } from "./config/database";
import { errorHandler } from "./middleware/error.middleware";
import { globalLimiter } from "./middleware/ratelimiter";
import { corsMiddleware } from "./middleware/cors";
import authRoutes from "./routes/auth.routes";
import groupRoutes from "./routes/group.routes";
import transactionRoutes from "./routes/transaction.routes";

dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(corsMiddleware);

app.use("/api", globalLimiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/transactions", transactionRoutes);

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
