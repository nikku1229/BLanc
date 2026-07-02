// User Types
export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password: string;
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

// Group Types
export interface IGroup {
  _id?: string;
  name: string;
  type: "personal" | "family" | "friends" | "custom";
  description?: string;
  email?: string;
  phoneNumber?: string;
  createdBy: string | IUser;
  members: string[] | IUser[];
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

// Transaction Types
export interface ITransaction {
  _id?: string;
  amount: number;
  type: "credit" | "debit";
  category: string;
  description: string;
  date: Date;
  notes?: string;
  groupId: string | IGroup;
  userId: string | IUser;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}
