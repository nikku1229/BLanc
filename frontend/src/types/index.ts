// ==================== Auth Types ====================

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  avatar?: string;
  notificationPreferences: {
    email: boolean;
    sms: boolean;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  initializeAuth: () => void;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// ==================== Group Types ====================

export type GroupType = "personal" | "family" | "friends" | "custom";

export interface Group {
  id: string;
  name: string;
  type: GroupType;
  description?: string;
  email?: string;
  phoneNumber?: string;
  createdBy: User;
  balance: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateGroupData {
  name: string;
  type: GroupType;
  description?: string;
  email?: string;
  phoneNumber?: string;
}

// ==================== Transaction Types ====================

export type TransactionType = "credit" | "debit";

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  date: string;
  notes?: string;
  groupId: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTransactionData {
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  date?: string;
  notes?: string;
  groupId: string;
}

// ==================== API Response Types ====================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  transactions: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ==================== Store State Types ====================

export interface GroupState {
  groups: Group[];
  currentGroup: Group | null;
  loading: boolean;
  error: string | null;
  fetchGroups: () => Promise<void>;
  fetchGroupById: (id: string) => Promise<void>;
  createGroup: (data: CreateGroupData) => Promise<void>;
  updateGroup: (id: string, data: Partial<Group>) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  clearError: () => void;
}

// ✅ Update TransactionState with pagination
export interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  totalTransactions: number;
  currentPage: number;
  fetchTransactionsByGroup: (
    groupId: string,
    page?: number,
    limit?: number,
  ) => Promise<void>;
  createTransaction: (data: CreateTransactionData) => Promise<void>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  clearError: () => void;
}

// ✅ Paginated response type
export interface PaginatedResponse<T> {
  transactions: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
