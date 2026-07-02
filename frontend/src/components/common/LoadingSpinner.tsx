import React from "react";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "medium",
  message = "Loading...",
}) => {
  const sizeMap = {
    small: "20px",
    medium: "40px",
    large: "60px",
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <div
        className="spinner"
        style={{
          width: sizeMap[size],
          height: sizeMap[size],
          margin: "0 auto",
        }}
      />
      {message && (
        <p style={{ marginTop: "12px", color: "#6b7280" }}>{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
