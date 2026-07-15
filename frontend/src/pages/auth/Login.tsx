import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { FiEye, FiEyeOff } from "react-icons/fi";

// ==================== Login Component ====================

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading: authLoading } = useAuthStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Get redirect path from location state or localStorage
  const from =
    (location.state as any)?.from?.pathname ||
    localStorage.getItem("redirectPath") ||
    "/dashboard";

  // ✅ If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
    // ✅ Clear redirect path
    localStorage.removeItem("redirectPath");
  }, [isAuthenticated, navigate, from]);

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

    // ✅ Basic validation
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      await login(formData.email, formData.password);
      // ✅ Redirect to the page user tried to access
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error("❌ Login error:", err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // ✅ Check if loading (either from store or local)
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
        <h2>Welcome Back</h2>
        <p className="subtitle">Login to your account</p>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
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
                placeholder="Enter your password"
                autoComplete="current-password"
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
            <p className="forgot-password">
              <Link to="/forgot-password">Forgot password?</Link>
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
