import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/api";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timer, setTimer] = useState(0);

  // ✅ Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/auth/forgot-password", { email });
      setSuccess(`OTP sent to ${email}. Please check your inbox.`);
      setStep("otp");
      // Start timer (60 seconds cooldown)
      setTimer(60);
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/auth/verify-otp", { email, otp });
      setSuccess("OTP verified! Set your new password.");
      setStep("reset");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      await api.post("/auth/reset-password", { email, otp, newPassword });
      setSuccess("Password reset successfully!");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Resend OTP
  const handleResendOTP = async () => {
    if (timer > 0) return;
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/auth/forgot-password", { email });
      setSuccess(`OTP resent to ${email}`);
      setTimer(60);
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo">
          <h1>BLanc</h1>
          <p>Budget & Expense Tracker</p>
        </div>

        <h2>
          {step === "email"
            ? "Forgot Password"
            : step === "otp"
              ? "Verify OTP"
              : "Reset Password"}
        </h2>
        <p className="subtitle">
          {step === "email" && "Enter your email to receive OTP"}
          {step === "otp" && "Enter the 6-digit OTP sent to your email"}
          {step === "reset" && "Set your new password"}
        </p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* Step 1: Email */}
        {step === "email" && (
          <form onSubmit={handleSendOTP}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOTP}>
            <div className="form-group">
              <label htmlFor="otp">Enter OTP</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="Enter 6-digit OTP"
                required
                maxLength={6}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <p
              style={{
                marginTop: "12px",
                textAlign: "center",
                fontSize: "14px",
              }}
            >
              Didn't receive OTP?{" "}
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={timer > 0}
                style={{
                  background: "none",
                  border: "none",
                  color: timer > 0 ? "#a89f97" : "#d946ef",
                  cursor: timer > 0 ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
              </button>
            </p>
          </form>
        )}

        {/* Step 3: Reset Password */}
        {step === "reset" && (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                required
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>
            <Link to="/login">← Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
