import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  amount: number;
  type: "credit" | "debit";
  category: string;
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
      enum: ["credit", "debit"],
      required: [true, "Transaction type is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Salary",
        "Bonus",
        "Investment",
        "Gift",
        "Other Income",
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
      ],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
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
    },
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

TransactionSchema.index({ groupId: 1, date: -1 });
TransactionSchema.index({ userId: 1, date: -1 });

export const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  TransactionSchema,
);
