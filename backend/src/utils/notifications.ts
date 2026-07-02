import { sendEmail, getTransactionEmailTemplate } from "../config/email";
import { sendSms, getSmsContent } from "../config/sms";

interface NotificationData {
  user: any;
  group: any;
  transaction: any;
}

export const sendTransactionNotification = async (data: NotificationData) => {
  const { user, group, transaction } = data;

  // Check notification preferences
  if (
    !user.notificationPreferences.email &&
    !user.notificationPreferences.sms
  ) {
    return;
  }

  const amount = transaction.amount;
  const type = transaction.type;
  const typeText = type === "credit" ? "Credited" : "Debited";

  // Email notification
  if (user.notificationPreferences.email) {
    try {
      const emailHtml = getTransactionEmailTemplate({
        userName: user.name,
        groupName: group.name,
        amount: amount,
        type: type,
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
      console.error("Failed to send email notification:", error);
    }
  }

  // SMS notification
  if (user.notificationPreferences.sms) {
    try {
      const smsContent = getSmsContent({
        userName: user.name,
        groupName: group.name,
        amount: amount,
        type: type,
        balance: group.balance,
        date: transaction.date,
      });

      await sendSms(group.phoneNumber, smsContent);
    } catch (error) {
      console.error("Failed to send SMS notification:", error);
    }
  }
};
