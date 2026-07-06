import express from "express";
import {
  register,
  login,
  refreshToken,
  getMe,
  updateProfile,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = express.Router();

// ==================== Public Routes ====================
router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);

// ==================== Private Routes ====================
router.get("/me", authenticate, getMe);
router.put("/profile", authenticate, updateProfile);

export default router;
