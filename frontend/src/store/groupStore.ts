import { create } from "zustand";
import api from "../api/api";

interface Group {
  id: string;
  name: string;
  type: string;
  description?: string;
  email?: string;
  phoneNumber?: string;
  createdBy: any;
  balance: number;
  createdAt: string;
}

interface CreateGroupData {
  name: string;
  type: string;
  description?: string;
  email?: string;
  phoneNumber?: string;
}

interface GroupState {
  groups: Group[];
  currentGroup: Group | null;
  loading: boolean;
  error: string | null;
  fetchGroups: () => Promise<void>;
  fetchGroupById: (id: string) => Promise<void>;
  createGroup: (groupData: CreateGroupData) => Promise<void>;
  updateGroup: (id: string, groupData: Partial<Group>) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useGroupStore = create<GroupState>((set) => ({
  groups: [],
  currentGroup: null,
  loading: false,
  error: null,

  fetchGroups: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get("/groups");

      const groups = response.data.data.map((group: any) => ({
        ...group,
        id: group._id || group.id,
      }));

      set({ groups, loading: false });
    } catch (error: any) {
      let errorMessage = "Failed to fetch groups";

      if (error.response && error.response?.status === 401) {
        errorMessage = "Session expired. Please login again.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage = error.message;
      }

      set({
        error: errorMessage,
        loading: false,
        groups: [],
      });
    }
  },

  fetchGroupById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/groups/${id}`);

      const group = {
        ...response.data.data,
        id: response.data.data._id || response.data.data.id,
      };

      set({ currentGroup: group, loading: false });
    } catch (error: any) {
      console.error("Fetch group by id error:", error);
      let errorMessage = "Failed to fetch group details";

      if (error.response?.status === 401) {
        errorMessage = "Session expired. Please login again.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      set({ error: errorMessage, loading: false });
    }
  },

  createGroup: async (groupData: CreateGroupData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post("/groups", groupData);

      const newGroup = {
        ...response.data.data,
        id: response.data.data._id || response.data.data.id,
      };

      set((state) => ({
        groups: [newGroup, ...state.groups],
        loading: false,
      }));
    } catch (error: any) {
      console.error("Create group error:", error);
      let errorMessage = "Failed to create group";

      if (error.response?.status === 401) {
        errorMessage = "Session expired. Please login again.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  updateGroup: async (id: string, groupData: Partial<Group>) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/groups/${id}`, groupData);

      const updatedGroup = {
        ...response.data.data,
        id: response.data.data._id || response.data.data.id,
      };

      set((state) => ({
        groups: state.groups.map((group) =>
          group.id === id ? updatedGroup : group,
        ),
        currentGroup: updatedGroup,
        loading: false,
      }));
    } catch (error: any) {
      console.error("Update group error:", error);
      let errorMessage = "Failed to update group";

      if (error.response?.status === 401) {
        errorMessage = "Session expired. Please login again.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  deleteGroup: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/groups/${id}`); 

      set((state) => ({
        groups: state.groups.filter((group) => group.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      console.error("Delete group error:", error);
      let errorMessage = "Failed to delete group";

      if (error.response?.status === 401) {
        errorMessage = "Session expired. Please login again.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  clearError: () => set({ error: null }),
}));
