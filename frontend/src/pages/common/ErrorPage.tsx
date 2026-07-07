import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

// ==================== Types ====================

interface ErrorPageProps {
  statusCode?: number;
  message?: string;
  error?: Error;
}

// ==================== ErrorPage Component ====================

const ErrorPage: React.FC<ErrorPageProps> = ({
  statusCode = 500,
  message,
  error,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isAuthenticated } = useAuthStore();

  // ✅ Get error details from location state if available
  const state = location.state as {
    statusCode?: number;
    message?: string;
  } | null;
  const finalStatusCode = statusCode || state?.statusCode || 500;
  const finalMessage = message || state?.message || "Something went wrong!";

  // ✅ Determine error type
  const isAuthError = finalStatusCode === 401;
  const isNotFound = finalStatusCode === 404;
  const isServerError = finalStatusCode >= 500;

  // ✅ Set error title and emoji based on status code
  let errorTitle = "Oops! Something went wrong";
  let errorEmoji = "😅";
  let errorDescription = finalMessage;

  if (isAuthError) {
    errorTitle = "Unauthorized Access";
    errorEmoji = "🔒";
    errorDescription = finalMessage || "Please login to continue.";
  } else if (isNotFound) {
    errorTitle = "Page Not Found";
    errorEmoji = "🔍";
    errorDescription =
      finalMessage || "The page you're looking for doesn't exist.";
  } else if (isServerError) {
    errorTitle = "Server Error";
    errorEmoji = "🔥";
    errorDescription =
      finalMessage ||
      "Something went wrong on our end. Please try again later.";
  }

  // ✅ Auto logout on 401
  useEffect(() => {
    if (isAuthError && isAuthenticated) {
      logout();
    }
  }, [isAuthError, isAuthenticated, logout]);

  // ✅ Handle navigation
  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    if (isAuthError) {
      navigate("/login", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  };

  const handleLogin = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="error-page-container">
      <div className="error-page-card">
        {/* Error Emoji */}
        <div className="error-emoji">{errorEmoji}</div>

        {/* Error Code */}
        <h1 className="error-code">{finalStatusCode}</h1>

        {/* Error Title */}
        <h2 className="error-title">{errorTitle}</h2>

        {/* Error Message */}
        <p className="error-message">{errorDescription}</p>

        {/* Technical Details (Development Only) */}
        {import.meta.env.DEV && error && (
          <div className="error-details">
            <details>
              <summary>Technical Details</summary>
              <pre>{error.stack || error.message}</pre>
            </details>
          </div>
        )}

        {/* Action Buttons */}
        <div className="error-actions">
          {isAuthError ? (
            // ✅ Show Login button for auth errors
            <button className="btn btn-primary" onClick={handleLogin}>
              🔑 Go to Login
            </button>
          ) : (
            <>
              <button className="btn btn-secondary" onClick={handleGoBack}>
                ← Go Back
              </button>
              <button className="btn btn-primary" onClick={handleGoHome}>
                🏠 Go Home
              </button>
              {isServerError && (
                <button className="btn btn-primary" onClick={handleReload}>
                  🔄 Reload
                </button>
              )}
            </>
          )}
        </div>

        {/* Help Text */}
        <div className="error-help">
          <p>
            Need help?{" "}
            <a href="mailto:support@blanc.com" className="help-link">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
