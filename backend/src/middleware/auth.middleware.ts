import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../types";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Authentication required. Please login.",
      } as ApiResponse);
      return;
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "default-secret",
      ) as { userId: string };

      req.userId = decoded.userId;
      next();
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        res.status(401).json({
          success: false,
          message: "Token expired. Please login again.",
        } as ApiResponse);
      } else {
        res.status(401).json({
          success: false,
          message: "Invalid token. Please login again.",
        } as ApiResponse);
      }
      return;
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Authentication error",
      error: error.message,
    } as ApiResponse);
  }
};
