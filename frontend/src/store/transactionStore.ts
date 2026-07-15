import { create } from "zustand";
import api from "../api/api";
import type {
  Transaction,
  TransactionState,
  CreateTransactionData,
  TransactionType,
  ApiResponse,
  PaginatedResponse,
} from "../types/index";

// ==================== Helper Functions ====================

const getErrorMessage = (error: any, defaultMessage: string): string => {
  if (error.response?.status === 401) {
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

// ✅ Helper to format transaction data from API
const formatTransaction = (data: any): Transaction => {
  return {
    id: data.id || data._id,
    amount: data.amount || 0,
    type: (data.type as TransactionType) || "debit",
    category: data.category || "",
    description: data.description || "",
    date: data.date || new Date().toISOString(),
    notes: data.notes || "",
    groupId: data.groupId || data.group?._id || "",
    userId: data.userId || data.user?._id || "",
    createdAt: data.createdAt || "",
    updatedAt: data.updatedAt || "",
  };
};

// ✅ Helper to format transactions array
const formatTransactions = (data: any[]): Transaction[] => {
  if (!data || !Array.isArray(data)) return [];
  return data.map((item) => formatTransaction(item));
};

// ==================== Transaction Store ====================

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  loading: false,
  error: null,
  totalPages: 1,
  totalTransactions: 0,
  currentPage: 1,

  // ✅ New: Total stats for the group
  totalIncome: 0,
  totalExpenses: 0,
  totalCount: 0,

  // ✅ Fetch transactions by group with pagination
  fetchTransactionsByGroup: async (
    groupId: string,
    page: number = 1,
    limit: number = 10,
  ) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<any>>>(
        `/transactions/group/${groupId}`,
        {
          params: { page, limit },
        },
      );

      const data = response.data.data;
      const transactions = formatTransactions(data?.transactions || []);

      set({
        transactions,
        loading: false,
        totalPages: data?.pagination?.pages || 1,
        totalTransactions: data?.pagination?.total || 0,
        currentPage: data?.pagination?.page || page,
      });

      await get().fetchTotalStats(groupId);
    } catch (error: any) {
      console.error("❌ Fetch transactions error:", error);
      const errorMessage = getErrorMessage(
        error,
        "Failed to fetch transactions",
      );
      set({ error: errorMessage, loading: false, transactions: [] });
    }
  },

  // ✅ NEW: Fetch total stats for the group (all transactions)
  fetchTotalStats: async (groupId: string) => {
    try {
      const response = await api.get<ApiResponse<any>>(
        `/transactions/summary/${groupId}`,
      );
      const data = response.data.data;

      set({
        totalIncome: data?.totalCredit || 0,
        totalExpenses: data?.totalDebit || 0,
        totalCount: data?.totalTransactions || 0,
      });
    } catch (error) {
      console.error("❌ Fetch total stats error:", error);
      // Don't set error state, just log
    }
  },

  // ✅ Create new transaction
  createTransaction: async (data: CreateTransactionData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post<ApiResponse<any>>("/transactions", data);
      const newTransaction = formatTransaction(response.data.data);

      set((state) => ({
        transactions: [newTransaction, ...state.transactions],
        totalTransactions: state.totalTransactions + 1,
        loading: false,
      }));
    } catch (error: any) {
      console.error("❌ Create transaction error:", error);
      const errorMessage = getErrorMessage(
        error,
        "Failed to create transaction",
      );
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // ✅ Update transaction
  updateTransaction: async (id: string, data: Partial<Transaction>) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put<ApiResponse<any>>(
        `/transactions/${id}`,
        data,
      );
      const updatedTransaction = formatTransaction(response.data.data);

      set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === id ? updatedTransaction : t,
        ),
        loading: false,
      }));
    } catch (error: any) {
      console.error("❌ Update transaction error:", error);
      const errorMessage = getErrorMessage(
        error,
        "Failed to update transaction",
      );
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // ✅ Delete transaction
  deleteTransaction: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/transactions/${id}`);

      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
        totalTransactions: state.totalTransactions - 1,
        loading: false,
      }));
    } catch (error: any) {
      console.error("❌ Delete transaction error:", error);
      const errorMessage = getErrorMessage(
        error,
        "Failed to delete transaction",
      );
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // ✅ Clear error
  clearError: () => set({ error: null }),
}));
