import rateLimit from "express-rate-limit";

// --------------------- Types ---------------------
interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: {
    success: boolean;
    message: string;
    retryAfter?: number;
  };
  statusCode: number;
  skipSuccessfulRequests?: boolean;
}

// --------------------- Configuration ---------------------
const DEFAULT_WINDOW = 15 * 60 * 1000; // 15 minutes
const DEFAULT_MAX = 500;

// --------------------- Global Rate Limiter ---------------------
export const globalLimiter = rateLimit({
  windowMs: DEFAULT_WINDOW,
  max: DEFAULT_MAX,
  statusCode: 429,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
  standardHeaders: true, // ✅ Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // ✅ Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // ✅ Count successful requests too
});

// --------------------- Stricter Limiter for Auth Routes ---------------------
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per 15 minutes
  statusCode: 429,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

// --------------------- Stricter Limiter for Create/Update Operations ---------------------
export const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 requests per hour
  statusCode: 429,
  message: {
    success: false,
    message: "Too many creation/update attempts. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

// --------------------- Very Strict Limiter for OTP/Verification ---------------------
export const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // 5 requests per 5 minutes
  statusCode: 429,
  message: {
    success: false,
    message: "Too many OTP requests. Please wait a few minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

// --------------------- Limiter for Public APIs ---------------------
export const publicLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 200, // 200 requests per hour
  statusCode: 429,
  message: {
    success: false,
    message: "Too many public API requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

// --------------------- Helper Function ---------------------
export const createRateLimiter = (config: {
  windowMs?: number;
  max?: number;
  message?: string;
  statusCode?: number;
}) => {
  const { windowMs, max, message, statusCode } = config;

  return rateLimit({
    windowMs: windowMs || DEFAULT_WINDOW,
    max: max || DEFAULT_MAX,
    statusCode: statusCode || 429,
    message: {
      success: false,
      message: message || "Too many requests. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};
