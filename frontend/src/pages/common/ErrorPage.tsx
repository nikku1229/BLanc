import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

interface ErrorPageProps {
  statusCode?: number;
  message?: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ statusCode, message }) => {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuthStore();

  let errorMessage = message || "Something went wrong!";
  let errorCode = statusCode || 500;
  let errorTitle = "Oops! Something went wrong";

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    isAuthenticated && statusCode === 401 ? logout() : navigate("/dashboard");
  };

  return (
    <div className="error-page-container">
      <div className="error-page-card">
        <h1 className="error-code">{errorCode}</h1>
        <h2 className="error-message">{errorMessage}</h2>
        <p className="error-title">{errorTitle}</p>

        {/* Action Buttons */}
        <div className="error-actions">
          <button className="btn btn-secondary" onClick={handleGoBack}>
            ← Go Back
          </button>
          <button className="btn btn-primary" onClick={handleGoHome}>
            🏠 Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
