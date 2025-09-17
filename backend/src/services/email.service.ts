import nodemailer from "nodemailer";
import { config } from "../config/config";
import logger from "../utils/logger";

// Check if email is enabled
const isEmailEnabled = process.env.EMAIL_ENABLED !== "false";

let transporter: nodemailer.Transporter | null = null;

if (isEmailEnabled) {
    try {
        transporter = nodemailer.createTransport({
            host: config.email.host,
            port: config.email.port,
            secure: config.email.port === 465, // true for 465, false for other ports
            auth: {
                user: config.email.user,
                pass: config.email.pass,
            },
        });

        // Verify SMTP connection configuration
        transporter.verify((error, success) => {
            if (error) {
                logger.error("SMTP connection failed:", error);
                logger.warn(
                    "Email service disabled due to SMTP configuration issues"
                );
                transporter = null;
            } else {
                logger.info("SMTP server is ready to take our messages");
            }
        });
    } catch (error) {
        logger.error("Failed to create email transporter:", error);
        transporter = null;
    }
} else {
    logger.info("Email service disabled via EMAIL_ENABLED=false");
}

export const sendWarrantyReminderEmail = async (
    email: string,
    productName: string,
    expiryDate: string
): Promise<boolean> => {
    // Check if email service is available
    if (!transporter) {
        logger.warn(
            "Email service not available - skipping warranty reminder email",
            {
                email,
                productName,
                expiryDate,
            }
        );
        return false;
    }

    const mailOptions = {
        from: '"eWallet - Warranty Reminder" <noreply@ewallet.com>',
        to: email,
        subject: `⚠️ Warranty Reminder: ${productName}`,
        text: `Your warranty for ${productName} is expiring on ${expiryDate}. Please take necessary action if needed.`,
        html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Warranty Reminder</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #333; margin: 0 0 20px 0;">Product: ${productName}</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">Your warranty is expiring on <strong>${expiryDate}</strong>.</p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">Please check if you need to take any action before the warranty expires.</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="color: #6c757d; margin: 0; font-size: 14px;">This is an automated reminder from your eWallet app. Please do not reply to this email.</p>
          </div>
        </div>
      </div>
    `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        logger.info("Warranty reminder email sent successfully", {
            messageId: info.messageId,
            email,
            productName,
            expiryDate,
        });

        // Log preview URL for test emails
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            logger.info("Preview URL: " + previewUrl);
        }

        return true;
    } catch (error) {
        logger.error("Error sending warranty reminder email:", {
            error: error instanceof Error ? error.message : error,
            email,
            productName,
        });
        return false;
    }
};
