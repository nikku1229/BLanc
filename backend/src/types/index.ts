// --------------------- User Types ---------------------
export interface IUser {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  avatar?: string;
  isVerified: boolean;
  notificationPreferences: {
    email: boolean;
    sms: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ForgotPasswordData {
  email: string;
}

export interface VerifyOTPData {
  email: string;
  otp: string;
}

export interface ResetPasswordData {
  email: string;
  otp: string;
  newPassword: string;
}

// ✅ Password removed from IUser (never send password in responses)
// ✅ _id is required (not optional)

// --------------------- Group Types ---------------------
export type GroupType = "personal" | "family" | "friends" | "custom";

export interface IGroup {
  _id: string;
  name: string;
  type: GroupType;
  description?: string;
  email?: string;
  phoneNumber?: string;
  createdBy: string | IUser;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

// ✅ Removed 'members' field (not in schema)
// ✅ Used GroupType for type safety

// --------------------- Transaction Types ---------------------
export type TransactionType = "credit" | "debit";

export interface ITransaction {
  _id: string;
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  date: Date;
  notes?: string;
  groupId: string | IGroup;
  userId: string | IUser;
  createdAt: Date;
}

// --------------------- API Response Types ---------------------
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

// --------------------- Request Types ---------------------
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateGroupRequest {
  name: string;
  type?: GroupType;
  description?: string;
  email?: string;
  phoneNumber?: string;
}

export interface CreateTransactionRequest {
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  date?: Date;
  notes?: string;
  groupId: string;
}

// --------------------- Extend Express Request ---------------------
declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}
