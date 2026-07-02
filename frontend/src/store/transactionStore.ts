import { create } from "zustand";
import api from "../api/api";

interface Transaction {
  id: string;
  amount: number;
  type: "credit" | "debit";
  category: string;
  description: string;
  date: string;
  notes?: string;
  groupId: string;
  userId: string;
}

interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  fetchTransactionsByGroup: (groupId: string) => Promise<void>;
  createTransaction: (data: any) => Promise<void>;
  updateTransaction: (id: string, data: any) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  loading: false,
  error: null,

  fetchTransactionsByGroup: async (groupId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/transactions/group/${groupId}`);

      const transactions = response.data.data.transactions.map((t: any) => ({
        ...t,
        id: t._id || t.id,
      }));

      set({ transactions, loading: false });
    } catch (error: any) {
      console.error("Fetch transactions error:", error);
      set({
        error: error.response?.data?.message || "Failed to fetch transactions",
        loading: false,
      });
    }
  },

  createTransaction: async (data: any) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post("/transactions", data);

      const newTransaction = {
        ...response.data.data,
        id: response.data.data._id || response.data.data.id,
      };

      set((state) => ({
        transactions: [newTransaction, ...state.transactions],
        loading: false,
      }));
    } catch (error: any) {
      console.error("Create transaction error:", error);
      set({
        error: error.response?.data?.message || "Failed to create transaction",
        loading: false,
      });
      throw error;
    }
  },

  updateTransaction: async (id: string, data: any) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/transactions/${id}`, data);

      const updatedTransaction = {
        ...response.data.data,
        id: response.data.data._id || response.data.data.id,
      };

      set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === id ? updatedTransaction : t,
        ),
        loading: false,
      }));
    } catch (error: any) {
      console.error("Update transaction error:", error);
      set({
        error: error.response?.data?.message || "Failed to update transaction",
        loading: false,
      });
      throw error;
    }
  },

  deleteTransaction: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/transactions/${id}`);

      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      console.error("Delete transaction error:", error);
      set({
        error: error.response?.data?.message || "Failed to delete transaction",
        loading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
