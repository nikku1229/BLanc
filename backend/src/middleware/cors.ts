import cors from "cors";

// --------------------- CORS Configuration ---------------------
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((url) => url.trim())
  : ["http://localhost:5173", "http://localhost:3000"];

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // ✅ Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) {
      callback(null, true);
      return;
    }

    // ✅ Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  exposedHeaders: ["Content-Length", "X-Total-Count"],
  maxAge: 86400, // 24 hours
});
