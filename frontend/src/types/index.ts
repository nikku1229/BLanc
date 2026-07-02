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
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
}

// Group Types
export interface Group {
  id: string;
  name: string;
  type: string;
  description?: string;
  email?: string;
  phoneNumber?: string;
  createdBy: User;
  balance: number;
  createdAt: string;
}

// Transaction Types
export interface Transaction {
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

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
