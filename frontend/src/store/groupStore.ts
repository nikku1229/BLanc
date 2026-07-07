import { create } from "zustand";
import api from "../api/api";
import type {
  Group,
  GroupState,
  CreateGroupData,
  GroupType,
  ApiResponse,
} from "../types/index";

// ==================== Helper Functions ====================

const getErrorMessage = (error: any, defaultMessage: string): string => {
  if (error.response?.status === 401) {
    // Auto logout on 401
    import("./authStore").then(({ useAuthStore }) => {
      useAuthStore.getState().logout();
    });
    return "Session expired. Please login again.";
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.message) {
    return error.message;
  }

  return defaultMessage;
};

// ✅ Helper to format group data from API
const formatGroup = (data: any): Group => {
  return {
    id: data.id || data._id,
    name: data.name || "",
    type: (data.type as GroupType) || "personal",
    description: data.description || "",
    email: data.email || "",
    phoneNumber: data.phoneNumber || "",
    createdBy: data.createdBy || null,
    balance: data.balance || 0,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || "",
  };
};

// ✅ Helper to format groups array
const formatGroups = (data: any[]): Group[] => {
  if (!data || !Array.isArray(data)) return [];
  return data.map((item) => formatGroup(item));
};

// ==================== Group Store ====================

export const useGroupStore = create<GroupState>((set) => ({
  groups: [],
  currentGroup: null,
  loading: false,
  error: null,

  // ✅ Fetch all groups
  fetchGroups: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get<ApiResponse<any[]>>("/groups");

      const groups = formatGroups(response.data.data || []);
      set({ groups, loading: false });
    } catch (error: any) {
      console.error("❌ Fetch groups error:", error);
      const errorMessage = getErrorMessage(error, "Failed to fetch groups");
      set({ error: errorMessage, loading: false, groups: [] });
    }
  },

  // ✅ Fetch single group by ID
  fetchGroupById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get<ApiResponse<any>>(`/groups/${id}`);

      const group = formatGroup(response.data.data);
      set({ currentGroup: group, loading: false });
    } catch (error: any) {
      console.error("❌ Fetch group by id error:", error);
      const errorMessage = getErrorMessage(
        error,
        "Failed to fetch group details",
      );
      set({ error: errorMessage, loading: false });
    }
  },

  // ✅ Create new group
  createGroup: async (groupData: CreateGroupData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post<ApiResponse<any>>("/groups", groupData);

      const newGroup = formatGroup(response.data.data);

      set((state) => ({
        groups: [newGroup, ...state.groups],
        loading: false,
      }));
    } catch (error: any) {
      console.error("❌ Create group error:", error);
      const errorMessage = getErrorMessage(error, "Failed to create group");
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // ✅ Update group
  updateGroup: async (id: string, groupData: Partial<Group>) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put<ApiResponse<any>>(
        `/groups/${id}`,
        groupData,
      );

      const updatedGroup = formatGroup(response.data.data);

      set((state) => ({
        groups: state.groups.map((group) =>
          group.id === id ? updatedGroup : group,
        ),
        currentGroup: updatedGroup,
        loading: false,
      }));
    } catch (error: any) {
      console.error("❌ Update group error:", error);
      const errorMessage = getErrorMessage(error, "Failed to update group");
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // ✅ Delete group
  deleteGroup: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/groups/${id}`);

      set((state) => ({
        groups: state.groups.filter((group) => group.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      console.error("❌ Delete group error:", error);
      const errorMessage = getErrorMessage(error, "Failed to delete group");
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // ✅ Clear error
  clearError: () => set({ error: null }),
}));
