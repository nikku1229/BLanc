import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// --------------------- Types ---------------------
interface DecodedToken {
  userId: string;
}

// --------------------- Extend Express Request ---------------------
declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

// --------------------- Authentication Middleware ---------------------
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // ✅ Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Authentication required. Please login.",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Token not provided. Please login.",
      });
      return;
    }

    // ✅ Verify token
    try {
      const secret = process.env.JWT_SECRET || "default-secret";
      const decoded = jwt.verify(token, secret) as DecodedToken;

      req.userId = decoded.userId;
      next();
    } catch (error: any) {
      // ✅ Handle specific JWT errors
      if (error.name === "TokenExpiredError") {
        res.status(401).json({
          success: false,
          message: "Session expired. Please login again.",
        });
        return;
      }

      if (error.name === "JsonWebTokenError") {
        res.status(401).json({
          success: false,
          message: "Invalid token. Please login again.",
        });
        return;
      }

      // ✅ Handle other JWT errors
      res.status(401).json({
        success: false,
        message: "Authentication failed. Please login again.",
      });
      return;
    }
  } catch (error: any) {
    console.error("❌ Authentication middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during authentication",
    });
  }
};
