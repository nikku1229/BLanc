import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
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
  resetOTP?: string;
  resetOTPExpiry?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // ✅ unique automatically creates index
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true, // ✅ unique automatically creates index
      trim: true,
      match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"],
    },
    avatar: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    notificationPreferences: {
      email: {
        type: Boolean,
        default: true,
      },
      sms: {
        type: Boolean,
        default: true,
      },
    },
    resetOTP: {
      type: String,
      select: false,
    },
    resetOTPExpiry: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete (ret as any).password;
        delete (ret as any).__v;
        delete (ret as any).resetOTP;
        delete (ret as any).resetOTPExpiry;
        return ret;
      },
    },
  },
);

// ✅ Pre-save hook - Hash password
UserSchema.pre("save", function () {
  const user = this as IUser;

  if (!user.isModified("password")) {
    return;
  }

  const salt = bcrypt.genSaltSync(12);
  user.password = bcrypt.hashSync(user.password, salt);
});

// ✅ Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// ✅ Only additional indexes (not already covered by unique)
UserSchema.index({ createdAt: -1 });

export const User = mongoose.model<IUser>("User", UserSchema);
