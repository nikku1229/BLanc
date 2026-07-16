import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model.ts";
import {
  sendEmail,
  getOTPEmailTemplate,
  getPasswordResetSuccessTemplate,
} from "../config/email.ts";

// --------------------- Helpers ---------------------
const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || "default-secret";
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign({ userId }, secret, { expiresIn: expiresIn as any });
};

const generateRefreshToken = (userId: string): string => {
  const secret = process.env.JWT_REFRESH_SECRET || "default-refresh-secret";
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "30d";
  return jwt.sign({ userId }, secret, { expiresIn: expiresIn as any });
};

// --------------------- Controllers ---------------------

// @desc    Register User
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phoneNumber } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phoneNumber) {
      res.status(400).json({
        success: false,
        message: "All fields (name, email, password, phoneNumber) are required",
      });
      return;
    }

    // Check existing user
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase().trim() },
        { phoneNumber: phoneNumber.trim() },
      ],
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "User already exists with this email or phone number",
      });
      return;
    }

    // Create and save user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phoneNumber: phoneNumber.trim(),
    });
    await user.save();

    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          notificationPreferences: user.notificationPreferences,
        },
        token,
        refreshToken, // optionally send refreshToken if needed by client
      },
    });
  } catch (error: any) {
    console.error("❌ Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

// @desc    Login User
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
      return;
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          notificationPreferences: user.notificationPreferences,
        },
        token,
        refreshToken,
      },
    });
  } catch (error: any) {
    console.error("❌ Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// @desc    Refresh Token
// @route   POST /api/auth/refresh-token
// @access  Public
export const refreshToken = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: "Refresh token required",
      });
      return;
    }

    const secret = process.env.JWT_REFRESH_SECRET || "default-refresh-secret";
    const decoded = jwt.verify(refreshToken, secret) as { userId: string };

    const newToken = generateToken(decoded.userId);

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: { token: newToken },
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
      error: error.message,
    });
  }
};

// @desc    Get Current User
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select("-password -__v");
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error: any) {
    console.error("❌ GetMe error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};

// @desc    Update User Profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name, phoneNumber, notificationPreferences } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Update fields if provided
    if (name) user.name = name.trim();
    if (phoneNumber) user.phoneNumber = phoneNumber.trim();
    if (notificationPreferences) {
      user.notificationPreferences = {
        ...user.notificationPreferences,
        ...notificationPreferences,
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        notificationPreferences: user.notificationPreferences,
      },
    });
  } catch (error: any) {
    console.error("❌ Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

// ==================== Forget Password Functions ====================

// @desc    Request OTP for Password Reset
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: "Email is required",
      });
      return;
    }

    // ✅ Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found with this email",
      });
      return;
    }

    // ✅ Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryMinutes = 15;
    const expiryDate = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // ✅ Save OTP to user
    user.resetOTP = otp;
    user.resetOTPExpiry = expiryDate;
    await user.save();

    // ✅ Send OTP via email
    const emailHtml = getOTPEmailTemplate({
      name: user.name,
      otp: otp,
      expiryMinutes: expiryMinutes,
    });

    await sendEmail(user.email, "Reset Your Password - BLanc", emailHtml);

    res.status(200).json({
      success: true,
      message: `OTP sent to ${user.email}. Valid for ${expiryMinutes} minutes.`,
    });
  } catch (error: any) {
    console.error("❌ Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};

// @desc    Verify OTP and Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;

    // ✅ Validate input
    if (!email || !otp || !newPassword) {
      res.status(400).json({
        success: false,
        message: "Email, OTP, and new password are required",
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
      return;
    }

    // ✅ Find user
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+resetOTP +resetOTPExpiry");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // ✅ Check if OTP exists
    if (!user.resetOTP || !user.resetOTPExpiry) {
      res.status(400).json({
        success: false,
        message: "No OTP request found. Please request a new OTP.",
      });
      return;
    }

    // ✅ Check if OTP is expired
    if (new Date() > user.resetOTPExpiry) {
      res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
      return;
    }

    // ✅ Verify OTP
    if (user.resetOTP !== otp) {
      res.status(400).json({
        success: false,
        message: "Invalid OTP. Please try again.",
      });
      return;
    }

    // ✅ Update password
    user.password = newPassword;
    user.resetOTP = undefined;
    user.resetOTPExpiry = undefined;
    await user.save();

    // ✅ Send success email
    const successHtml = getPasswordResetSuccessTemplate({
      name: user.name,
    });

    await sendEmail(
      user.email,
      "Password Reset Successful - BLanc",
      successHtml,
    );

    res.status(200).json({
      success: true,
      message:
        "Password reset successfully. You can now login with your new password.",
    });
  } catch (error: any) {
    console.error("❌ Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password",
      error: error.message,
    });
  }
};

// @desc    Verify OTP only (without resetting password)
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
      return;
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+resetOTP +resetOTPExpiry");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    if (!user.resetOTP || !user.resetOTPExpiry) {
      res.status(400).json({
        success: false,
        message: "No OTP request found",
      });
      return;
    }

    if (new Date() > user.resetOTPExpiry) {
      res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
      return;
    }

    if (user.resetOTP !== otp) {
      res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error: any) {
    console.error("❌ Verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
      error: error.message,
    });
  }
};
