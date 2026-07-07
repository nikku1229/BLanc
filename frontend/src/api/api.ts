import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

// ==================== Configuration ====================

// ✅ API_URL - Remove duplicate /api
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ✅ Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000, // 30 seconds
  withCredentials: true, // ✅ For cookies/sessions if needed
});

// ==================== Request Interceptor ====================

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ Log request in development
    if (import.meta.env.DEV) {
      console.log(
        `📤 ${config.method?.toUpperCase()} ${config.url}`,
        config.data || "",
      );
    }

    return config;
  },
  (error: AxiosError) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  },
);

// ==================== Response Interceptor ====================

api.interceptors.response.use(
  (response) => {
    // ✅ Log response in development
    if (import.meta.env.DEV) {
      console.log(
        `📥 ${response.config.method?.toUpperCase()} ${response.config.url}`,
        response.data,
      );
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // ✅ Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // ✅ Try to refresh token
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { token } = response.data.data;

          // ✅ Update token
          localStorage.setItem("token", token);
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          originalRequest.headers.Authorization = `Bearer ${token}`;

          // ✅ Retry original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // ✅ Refresh failed - logout user
        console.error("❌ Token refresh failed:", refreshError);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        // ✅ Redirect to login if not already there
        if (
          window.location.pathname !== "/login" &&
          window.location.pathname !== "/register"
        ) {
          window.location.href = "/login";
        }
      }
    }

    // ✅ Handle other errors
    if (error.response) {
      // Server responded with error status
      console.error(
        `❌ ${error.response.status} - ${error.response.data || error.message}`,
      );
    } else if (error.request) {
      // Request made but no response
      console.error("❌ No response from server:", error.request);
    } else {
      // Something else happened
      console.error("❌ Error:", error.message);
    }

    return Promise.reject(error);
  },
);

// ==================== Helper Functions ====================

// ✅ Set auth token
export const setAuthToken = (token: string | null): void => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
  }
};

// ✅ Clear auth token
export const clearAuthToken = (): void => {
  delete api.defaults.headers.common["Authorization"];
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

// ✅ Get auth token
export const getAuthToken = (): string | null => {
  return localStorage.getItem("token");
};

// ✅ Check if authenticated
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("token");
};

// ==================== Export ====================

export default api;
