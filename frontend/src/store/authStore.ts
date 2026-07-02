import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../api/api";

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  notificationPreferences: {
    email: boolean;
    sms: boolean;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,

      initializeAuth: () => {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");

        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            set({
              token,
              user,
              isAuthenticated: true,
            });
          } catch (error) {
            console.error("Error initializing auth:", error);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            set({
              user: null,
              token: null,
              isAuthenticated: false,
            });
          }
        }
      },

      login: async (email: string, password: string) => {
        set({ loading: true });
        try {
          const response = await api.post("/auth/login", {
            email,
            password,
          });

          const { user, token } = response.data.data;

          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));

          set({
            user,
            token,
            isAuthenticated: true,
            loading: false,
          });

          return response.data;
        } catch (error: any) {
          set({ loading: false });
          const message = error.response?.data?.message || "Login failed";
          throw new Error(message);
        }
      },

      register: async (userData) => {
        set({ loading: true });
        try {
          const response = await api.post("/auth/register", userData);

          const { user, token } = response.data.data;

          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));

          set({
            user,
            token,
            isAuthenticated: true,
            loading: false,
          });

          return response.data;
        } catch (error: any) {
          set({ loading: false });
          console.error("Registration API error:", error);
          const message =
            error.response?.data?.message || "Registration failed";
          throw new Error(message);
        }
      },

      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      setLoading: (loading: boolean) => set({ loading }),
    }),
    {
      name: "auth-storage",
    },
  ),
);
