import mongoose, { Schema, Document } from "mongoose";

export interface IGroup extends Document {
  name: string;
  type: string;
  description?: string;
  email?: string;
  phoneNumber?: string;
  createdBy: mongoose.Types.ObjectId;
  // members: mongoose.Types.ObjectId[];
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
      trim: true,
      default: "personal",
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // members: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: "User",
    //   },
    // ],
    balance: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const Group = mongoose.model<IGroup>("Group", GroupSchema);
