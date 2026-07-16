import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

// --------------------- Types ---------------------
interface ErrorResponse {
  success: false;
  message: string;
  errors?: any[];
  stack?: string;
}

// --------------------- Error Handler Middleware ---------------------
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // ✅ Log error with details
  console.error("❌ Error:", {
    name: err.name,
    message: err.message,
    status: err.status,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // ✅ Default error response
  let statusCode = err.status || 500;
  let message = err.message || "Internal server error";
  let errors: any[] | undefined;

  // ==================== Mongoose Errors ====================

  // ✅ Validation Error
  if (
    err.name === "ValidationError" ||
    err instanceof mongoose.Error.ValidationError
  ) {
    statusCode = 400;
    message = "Validation failed";
    errors = Object.values(err.errors).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // ✅ Duplicate Key Error (MongoDB 11000)
  else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern)[0];
    message = `Duplicate value for ${field}. Please use a different value.`;
  }

  // ✅ Cast Error (Invalid ObjectId)
  else if (
    err.name === "CastError" ||
    err instanceof mongoose.Error.CastError
  ) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // ==================== JWT Errors ====================

  // ✅ Invalid Token
  else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token. Please login again.";
  }

  // ✅ Token Expired
  else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Session expired. Please login again.";
  }

  // ==================== Multer Errors (if using file upload) ====================
  else if (err.name === "MulterError") {
    statusCode = 400;
    if (err.code === "LIMIT_FILE_SIZE") {
      message = "File too large. Maximum size is 5MB.";
    } else if (err.code === "LIMIT_FILE_COUNT") {
      message = "Too many files uploaded.";
    } else {
      message = err.message || "File upload error.";
    }
  }

  // ==================== Rate Limit Errors ====================
  else if (err.name === "RateLimitError") {
    statusCode = 429;
    message = "Too many requests. Please try again later.";
  }

  // ==================== Build Response ====================

  const response: ErrorResponse = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  // ✅ Include stack trace in development only
  if (process.env.NODE_ENV === "development" && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

// ==================== Not Found Handler ====================
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  (error as any).status = 404;
  next(error);
};

// ==================== Async Handler Wrapper ====================
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ==================== Unhandled Rejection Handler ====================
export const handleUnhandledRejection = (): void => {
  process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
    console.error("❌ Unhandled Rejection at:", promise);
    console.error("Reason:", reason);
    // Optional: process.exit(1) for production
  });

  process.on("uncaughtException", (error: Error) => {
    console.error("❌ Uncaught Exception:", error);
    // Optional: process.exit(1) for production
  });
};
