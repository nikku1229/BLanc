import HttpSms from "httpsms";
import dotenv from "dotenv";

dotenv.config();

// ✅ Helper function to get current time in ISO 8601 format with timezone
const getCurrentTimeISO = (): string => {
  const now = new Date();

  // Get timezone offset in minutes
  const offset = now.getTimezoneOffset();
  const offsetHours = Math.abs(Math.floor(offset / 60));
  const offsetMinutes = Math.abs(offset % 60);
  const offsetSign = offset <= 0 ? "+" : "-";

  // Format: YYYY-MM-DDTHH:MM:SS±HH:MM
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  const offsetStr = `${offsetSign}${String(offsetHours).padStart(2, "0")}:${String(offsetMinutes).padStart(2, "0")}`;

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetStr}`;
};

export const sendSms = async (to: string, content: string): Promise<void> => {
  try {
    const httpsApiKey = process.env.HTTPSMS_API_KEY;
    const smsVerifiedNumber = process.env.HTTPSMS_FROM_NUMBER;

    if (!httpsApiKey) throw Error("Sms Api key not found");

    const currentTime = getCurrentTimeISO();

    const client = new HttpSms(httpsApiKey);
    const msg = await client.messages.postSend({
      content: content,
      from: smsVerifiedNumber,
      to: `+91${to}`,
      encrypted: true,
      send_at: currentTime,
    });
  } catch (error) {
    console.error("❌ Sms sending failed:", error);
    throw error;
  }
};

// Message content
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

  return `Your account of ${userName} ${typeText} ₹${amount.toFixed(2)} in the ${groupName}. The available account is ₹${balance.toFixed(2)}`;
};
