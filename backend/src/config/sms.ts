import HttpSms from "httpsms";
import dotenv from "dotenv";

dotenv.config();

const getCurrentTimeISO = (): string => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const sign = offset <= 0 ? "+" : "-";
  const pad = (n: number) => String(n).padStart(2, "0");

  const offsetHours = pad(Math.abs(Math.floor(offset / 60)));
  const offsetMinutes = pad(Math.abs(offset % 60));

  return (
    now.getFullYear() +
    "-" +
    pad(now.getMonth() + 1) +
    "-" +
    pad(now.getDate()) +
    "T" +
    pad(now.getHours()) +
    ":" +
    pad(now.getMinutes()) +
    ":" +
    pad(now.getSeconds()) +
    sign +
    offsetHours +
    ":" +
    offsetMinutes
  );
};

// ✅ Send SMS via httpSMS
export const sendSms = async (to: string, content: string): Promise<void> => {
  const httpsApiKey = process.env.HTTPSMS_API_KEY;
  const smsVerifiedNumber = process.env.HTTPSMS_FROM_NUMBER;

  if (!httpsApiKey) {
    throw new Error("❌ httpSMS API Key not configured");
  }
  if (!smsVerifiedNumber) {
    throw new Error("❌ httpSMS FROM number not configured");
  }

  try {
    const client = new HttpSms(httpsApiKey);

    const response = await client.messages.postSend({
      content,
      from: smsVerifiedNumber,
      to: `+91${to}`,
      encrypted: true,
    });
  } catch (error) {
    console.error("❌ SMS sending failed:", error);
    throw error;
  }
};

// ✅ Generate SMS content for transaction notification
export const getSmsContent = (data: {
  userName: string;
  groupName: string;
  amount: number;
  type: "credit" | "debit";
  balance: number;
  date: Date;
}): string => {
  const { userName, groupName, amount, type, balance, date } = data;
  const typeText = type === "credit" ? "Credited" : "Debited";
  const dateStr = new Date(date).toLocaleDateString("en-IN");

  return `${userName} ${typeText} ₹${amount.toFixed(2)} in ${groupName}. Balance: ₹${balance.toFixed(2)} (${dateStr})`;
};
