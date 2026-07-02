import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
): Promise<void> => {
  try {
    await transporter.verify();
    await transporter.sendMail({
      from: `"BLanc" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw error;
  }
};

// Email templates
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

  return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 12px;">
        <div style="text-align: center; padding: 20px 0;">
          <h1 style="color: #4f46e5; margin: 0;">BLanc</h1>
          <p style="color: #6b7280; margin: 5px 0;">Budget & Expense Tracker</p>
        </div>
        
        <div style="background-color: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #1f2937; margin: 0; text-align: center;">Transaction ${typeText}!</h2>
          
          <div style="text-align: center; padding: 10px 0;">
            <p style="font-size: 14px; color: #6b7280; margin: 10px 0 0;">
              ${type === "credit" ? "Amount Credited" : "Amount Debited"}
            </p>
            <p style="font-size: 32px; font-weight: bold; margin: 10px 0;">
              ₹${amount.toFixed(2)}
            </p>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
            <table style="width: 100%;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Account</td>
                <td style="padding: 8px 0; text-align: right; color: #1f2937; font-weight: 500;">${userName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Group</td>
                <td style="padding: 8px 0; text-align: right; color: #1f2937; font-weight: 500;">${groupName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Category</td>
                <td style="padding: 8px 0; text-align: right; color: #1f2937; font-weight: 500;">${category}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Date</td>
                <td style="padding: 8px 0; text-align: right; color: #1f2937; font-weight: 500;">${new Date(date).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Available Balance</td>
                <td style="padding: 8px 0; text-align: right; color: #4f46e5; font-weight: bold; font-size: 18px;">₹${balance.toFixed(2)}</td>
              </tr>
            </table>
          </div>
        </div>

        <div style="text-align: center; padding: 20px 0; color: #6b7280; font-size: 12px;">
          <p>This is an automated notification from BLanc.</p>
          <p>© ${new Date().getFullYear()} BLanc. All rights reserved.</p>
        </div>
      </div>
    `;
};
