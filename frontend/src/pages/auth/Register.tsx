import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { FiEye, FiEyeOff } from "react-icons/fi";

// ==================== Register Component ====================

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, loading: authLoading } = useAuthStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ✅ If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // ✅ Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  // ✅ Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // ✅ Validate name
    if (!formData.name || formData.name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      setLoading(false);
      return;
    }

    // ✅ Validate email
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    // ✅ Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // ✅ Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    // ✅ Validate phone number
    if (
      formData.phoneNumber.length !== 10 ||
      !/^[0-9]{10}$/.test(formData.phoneNumber)
    ) {
      setError("Phone number must be exactly 10 digits");
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;

      // ✅ Call register function from store
      await register(registerData);

      // ✅ If successful, navigate to dashboard
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      console.error("❌ Registration error:", err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // ✅ Check if loading
  const isLoading = loading || authLoading;

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Logo */}
        <div className="logo">
          <h1>BLanc</h1>
          <p>Budget & Expense Tracker</p>
        </div>

        {/* Heading */}
        <h2>Create Account</h2>
        <p className="subtitle">Start managing your finances</p>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Register Form */}
        <form onSubmit={handleSubmit}>
          {/* Name Field */}
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              autoComplete="name"
              required
              minLength={2}
            />
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
              required
            />
          </div>

          {/* Phone Number Field */}
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter 10-digit phone number"
              autoComplete="tel"
              required
              pattern="[0-9]{10}"
              maxLength={10}
            />
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password (min 6 characters)"
                autoComplete="new-password"
                required
                minLength={6}
              />
              <button
                type="button"
                className={`toggle-pass ${showPassword ? "hide" : "show"}`}
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <>
                    <FiEyeOff className="icon-light" />
                  </>
                ) : (
                  <>
                    <FiEye className="icon-light" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                autoComplete="new-password"
                required
                minLength={6}
              />
              <button
                type="button"
                className={`toggle-pass ${showConfirmPassword ? "hide" : "show"}`}
                onClick={toggleConfirmPasswordVisibility}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <>
                    <FiEyeOff className="icon-light" />
                  </>
                ) : (
                  <>
                    <FiEye className="icon-light" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
