import mongoose, { Schema, Document } from "mongoose";

export const CreditCategories = [
  "Salary",
  "Bonus",
  "Investment",
  "Gift",
  "Other Income",
] as const;

export const DebitCategories = [
  "Food",
  "Shopping",
  "Bills",
  "Travel",
  "Entertainment",
  "Medical",
  "Rent",
  "Utilities",
  "Insurance",
  "Education",
  "Other Expense",
] as const;

export const AllCategories = [...CreditCategories, ...DebitCategories] as const;

export type CreditCategory = (typeof CreditCategories)[number];
export type DebitCategory = (typeof DebitCategories)[number];
export type TransactionCategory = (typeof AllCategories)[number];

export interface ITransaction extends Document {
  amount: number;
  type: "credit" | "debit";
  category: TransactionCategory;
  description: string;
  date: Date;
  notes?: string;
  groupId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    type: {
      type: String,
      enum: {
        values: ["credit", "debit"],
        message: "Type must be either 'credit' or 'debit'",
      },
      required: [true, "Transaction type is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: AllCategories,
        message: "Please select a valid category",
      },
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [2, "Description must be at least 2 characters"],
      maxlength: [100, "Description cannot exceed 100 characters"],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
      default: "",
    },
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: [true, "Group ID is required"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
  },
  {
    timestamps: true,
  },
);

// ✅ Indexes - Only here
TransactionSchema.index({ groupId: 1, date: -1 });
TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ type: 1 });
TransactionSchema.index({ category: 1 });
TransactionSchema.index({ date: -1 });

export const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  TransactionSchema,
);
