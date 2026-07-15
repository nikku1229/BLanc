import nodemailer, { Transporter } from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// ✅ Singleton transporter - ek baar create, baar baar use
let transporter: Transporter | null = null;

const createTransporter = (): Transporter => {
  if (transporter) return transporter;

  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;

  if (!emailUser || !emailPassword) {
    throw new Error(
      "Email credentials are not configured. Set EMAIL_USER and EMAIL_PASSWORD in .env",
    );
  }

  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });

  return transporter;
};

// ✅ Verify transporter (call once on startup)
export const verifyEmailTransporter = async (): Promise<boolean> => {
  try {
    const transport = createTransporter();
    await transport.verify();
    return true;
  } catch (error) {
    console.error("❌ Email transporter verification failed:", error);
    return false;
  }
};

// ✅ Add this to existing email.ts

// OTP Email Template
export const getOTPEmailTemplate = (data: {
  name: string;
  otp: string;
  expiryMinutes: number;
}): string => {
  const { name, otp, expiryMinutes } = data;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Password - BLanc</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 12px;">
      <div style="text-align: center; padding: 20px 0;">
        <h1 style="color: #4f46e5; margin: 0; font-size: 32px;">BLanc</h1>
        <p style="color: #6b7280; margin: 4px 0;">Budget & Expense Tracker</p>
      </div>
      
      <div style="background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <h2 style="color: #1f2937; margin-top: 0;">Reset Your Password</h2>
        
        <p style="color: #4b5563; font-size: 16px;">Hello ${name},</p>
        
        <p style="color: #4b5563; font-size: 16px;">
          We received a request to reset your password. Use the OTP below to reset it.
          This OTP is valid for <strong>${expiryMinutes} minutes</strong>.
        </p>

        <div style="text-align: center; padding: 24px 0;">
          <div style="display: inline-block; background: #f3f4f6; padding: 16px 32px; border-radius: 12px; letter-spacing: 8px;">
            <span style="font-size: 36px; font-weight: 700; color: #4f46e5;">${otp}</span>
          </div>
        </div>

        <p style="color: #6b7280; font-size: 14px;">
          If you didn't request this, please ignore this email.
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />

        <p style="color: #6b7280; font-size: 12px;">
          This is an automated notification from BLanc.
        </p>
      </div>

      <div style="text-align: center; padding: 20px 0; color: #9ca3af; font-size: 12px;">
        <p style="margin: 0;">© ${new Date().getFullYear()} BLanc. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
};

// Password Reset Success Email
export const getPasswordResetSuccessTemplate = (data: {
  name: string;
}): string => {
  const { name } = data;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Successful - BLanc</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 12px;">
      <div style="text-align: center; padding: 20px 0;">
        <h1 style="color: #4f46e5; margin: 0; font-size: 32px;">BLanc</h1>
        <p style="color: #6b7280; margin: 4px 0;">Budget & Expense Tracker</p>
      </div>
      
      <div style="background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <div style="text-align: center;">
          <span style="font-size: 48px;">✅</span>
          <h2 style="color: #1f2937; margin-top: 8px;">Password Reset Successful!</h2>
        </div>
        
        <p style="color: #4b5563; font-size: 16px;">Hello ${name},</p>
        
        <p style="color: #4b5563; font-size: 16px;">
          Your password has been successfully reset. You can now login with your new password.
        </p>

        <div style="text-align: center; padding: 20px 0;">
          <a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; padding: 12px 32px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
            Login Now
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />

        <p style="color: #6b7280; font-size: 12px;">
          If you didn't perform this action, please contact support immediately.
        </p>
      </div>

      <div style="text-align: center; padding: 20px 0; color: #9ca3af; font-size: 12px;">
        <p style="margin: 0;">© ${new Date().getFullYear()} BLanc. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
};

// ✅ Send Email - Optimized
export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
): Promise<void> => {
  try {
    const transport = createTransporter();
    const emailUser = process.env.EMAIL_USER;

    await transport.sendMail({
      from: `"BLanc" <${emailUser}>`,
      to,
      subject,
      html,
    });
  } catch (error: any) {
    console.error(`❌ Email sending failed to ${to}:`, error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// ✅ Email Template - Cleaner version
export const getTransactionEmailTemplate = (data: {
  userName: string;
  groupName: string;
  amount: number;
  type: "credit" | "debit";
  category: string;
  balance: number;
  date: Date;
}): string => {
  const { userName, groupName, amount, type, category, balance, date } = data;

  const typeText = type === "credit" ? "Credited" : "Debited";
  const color = type === "credit" ? "#22c55e" : "#ef4444";
  const formattedDate = new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>BLanc Transaction</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 12px;">
      <div style="text-align: center; padding: 20px 0;">
        <h1 style="color: #4f46e5; margin: 0; font-size: 32px;">BLanc</h1>
        <p style="color: #6b7280; margin: 4px 0;">Budget & Expense Tracker</p>
      </div>
      
      <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <div style="text-align: center;">
          <h2 style="color: #1f2937; margin: 0; font-size: 24px;">Transaction ${typeText}</h2>
        </div>
        
        <div style="text-align: center; padding: 16px 0;">
          <p style="font-size: 14px; color: #6b7280; margin: 0;">Amount ${type === "credit" ? "Credited" : "Debited"}</p>
          <p style="font-size: 36px; font-weight: 700; color: ${color}; margin: 4px 0;">₹${amount.toFixed(2)}</p>
        </div>

        <div style="border-top: 1px solid #e5e7eb; padding-top: 16px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
            <tr>
              <td style="padding: 6px 0; color: #6b7280;">Account</td>
              <td style="padding: 6px 0; text-align: right; color: #1f2937; font-weight: 500;">${userName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6b7280;">Group</td>
              <td style="padding: 6px 0; text-align: right; color: #1f2937; font-weight: 500;">${groupName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6b7280;">Category</td>
              <td style="padding: 6px 0; text-align: right; color: #1f2937; font-weight: 500;">${category}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6b7280;">Date</td>
              <td style="padding: 6px 0; text-align: right; color: #1f2937; font-weight: 500;">${formattedDate}</td>
            </tr>
            <tr style="border-top: 2px solid #4f46e5;">
              <td style="padding: 12px 0 0 0; color: #4f46e5; font-weight: 700; font-size: 16px;">Available Balance</td>
              <td style="padding: 12px 0 0 0; text-align: right; color: #4f46e5; font-weight: 700; font-size: 20px;">₹${balance.toFixed(2)}</td>
            </tr>
          </table>
        </div>
      </div>

      <div style="text-align: center; padding: 20px 0; color: #9ca3af; font-size: 12px;">
        <p style="margin: 0;">This is an automated notification from BLanc.</p>
        <p style="margin: 4px 0;">© ${new Date().getFullYear()} BLanc. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
};

export const getTransporter = (): Transporter => createTransporter();
