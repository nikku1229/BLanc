import mongoose, { Schema, Document } from "mongoose";

export type GroupType = "personal" | "family" | "friends" | "custom";

export interface IGroup extends Document {
  name: string;
  type: GroupType;
  description?: string;
  email?: string;
  phoneNumber?: string;
  createdBy: mongoose.Types.ObjectId;
  balance: number;
}

const GroupSchema = new Schema<IGroup>(
  {
    name: {
      type: String,
      required: [true, "Group name is required"],
      trim: true,
      minlength: [2, "Group name must be at least 2 characters"],
      maxlength: [50, "Group name cannot exceed 50 characters"],
    },
    type: {
      type: String,
      enum: {
        values: ["personal", "family", "friends", "custom"],
        message: "Type must be: personal, family, friends, or custom",
      },
      default: "personal",
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
      default: "",
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
      default: "",
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"],
      default: "",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "CreatedBy is required"],
    },
    balance: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// ✅ Indexes - Only here
GroupSchema.index({ createdBy: 1, createdAt: -1 });
GroupSchema.index({ name: 1 });

export const Group = mongoose.model<IGroup>("Group", GroupSchema);
