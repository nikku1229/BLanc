import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../api/api";
import type {
  User,
  AuthState,
  RegisterData,
  ApiResponse,
} from "../types/index";

// ==================== Auth Store ====================
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,

      // ✅ Initialize auth from localStorage
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
              loading: false,
            });
            // ✅ Set default axios header
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          } catch (error) {
            console.error("❌ Error initializing auth:", error);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              loading: false,
            });
          }
        }
      },

      // ✅ Login
      login: async (email: string, password: string) => {
        set({ loading: true });
        try {
          const response = await api.post<
            ApiResponse<{ user: User; token: string }>
          >("/auth/login", { email, password });

          const { user, token } = response.data.data!;

          // ✅ Save to localStorage
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));

          // ✅ Set axios header
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          set({
            user,
            token,
            isAuthenticated: true,
            loading: false,
          });
        } catch (error: any) {
          console.error("❌ Login error:", error);
          set({ loading: false });
          const message = error.response?.data?.message || "Login failed";
          throw new Error(message);
        }
      },

      // ✅ Register
      register: async (userData: RegisterData) => {
        set({ loading: true });
        try {
          const response = await api.post<
            ApiResponse<{ user: User; token: string }>
          >("/auth/register", userData);

          const { user, token } = response.data.data!;

          // ✅ Save to localStorage
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));

          // ✅ Set axios header
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          set({
            user,
            token,
            isAuthenticated: true,
            loading: false,
          });
        } catch (error: any) {
          console.error("❌ Registration error:", error);
          set({ loading: false });
          const message =
            error.response?.data?.message || "Registration failed";
          throw new Error(message);
        }
      },

      // ✅ Logout
      logout: () => {
        // ✅ Clear localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // ✅ Remove axios header
        delete api.defaults.headers.common["Authorization"];

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
        });
      },

      // ✅ Set loading
      setLoading: (loading: boolean) => set({ loading }),
    }),
    {
      name: "auth-storage",
      // ✅ Only persist these fields
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
