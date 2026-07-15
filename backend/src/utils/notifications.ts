import { sendEmail, getTransactionEmailTemplate } from "../config/email";
import { sendSms, getSmsContent } from "../config/sms";

// --------------------- Types ---------------------
interface NotificationData {
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    notificationPreferences: {
      email: boolean;
      sms: boolean;
    };
  };
  group: {
    id: string;
    name: string;
    phoneNumber?: string;
    balance: number;
  };
  transaction: {
    id: string;
    amount: number;
    type: "credit" | "debit";
    category: string;
    date: Date;
  };
}

// --------------------- Main Function ---------------------
export const sendTransactionNotification = async (
  data: NotificationData,
): Promise<void> => {
  const { user, group, transaction } = data;

  // ✅ Check if notifications are enabled
  const emailEnabled = user.notificationPreferences?.email !== false;
  const smsEnabled = user.notificationPreferences?.sms !== false;

  if (!emailEnabled && !smsEnabled) {
    console.log(`🔕 Notifications disabled for user: ${user.email}`);
    return;
  }

  const amount = transaction.amount;
  const type = transaction.type;
  const typeText = type === "credit" ? "Credited" : "Debited";

  // ✅ Send Email Notification
  if (emailEnabled) {
    try {
      const emailHtml = getTransactionEmailTemplate({
        userName: user.name,
        groupName: group.name,
        amount,
        type,
        category: transaction.category,
        balance: group.balance,
        date: transaction.date,
      });

      await sendEmail(
        user.email,
        `Transaction ${typeText}! - BLanc`,
        emailHtml,
      );
    } catch (error) {
      console.error(
        `❌ Failed to send email notification to ${user.email}:`,
        error,
      );
    }
  }

  // ✅ Send SMS Notification
  if (smsEnabled) {
    // ✅ Check if phone number exists
    const phoneNumber = user.phoneNumber || group.phoneNumber;

    if (!phoneNumber) {
      console.warn(
        `⚠️ No phone number found for user: ${user.email} or group: ${group.name}`,
      );
      return;
    }

    try {
      const smsContent = getSmsContent({
        userName: user.name,
        groupName: group.name,
        amount,
        type,
        balance: group.balance,
        date: transaction.date,
      });

      await sendSms(phoneNumber, smsContent);
    } catch (error) {
      console.error(
        `❌ Failed to send SMS notification to ${phoneNumber}:`,
        error,
      );
    }
  }
};
