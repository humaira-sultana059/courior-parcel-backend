import nodemailer from "nodemailer";

/**
 * Notification Service to handle Email and SMS (Simulated)
 */

// Email Transporter (Configure with your SMTP details)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.example.com",
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send Email Notification
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Plain text content
 */
export const sendEmail = async (to, subject, text) => {
  try {
    console.log(
      `[Email] Attempting to send email from: ${process.env.EMAIL_USER}`
    );
    console.log(`[Email] To: ${to}`);
    console.log(`[Email] Subject: ${subject}`);

    // Add HTML version for better email appearance
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #2563eb; border-bottom: 2px solid #7c3aed; padding-bottom: 10px;">
          BackStore Parcel System
        </h2>
        <div style="margin: 20px 0; line-height: 1.6;">
          ${text.replace(/\n/g, "<br>")}
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
          <p>This is an automated message from BackStore Parcel Management System.</p>
          <p>Please do not reply to this email.</p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Courior-Parcel-Task : BackStore Support" <${
        process.env.EMAIL_FROM || process.env.EMAIL_USER
      }>`,
      to,
      subject,
      text,
      html, // Add HTML version
    });

    console.log("[Email] Email sent successfully! Message ID:", info.messageId);
    console.log("[Email] Preview URL:", nodemailer.getTestMessageUrl(info));
    return true;
  } catch (error) {
    console.error("[Email] CRITICAL ERROR sending email:", error.message);
    console.error("[Email] Full error details:", error);
    console.log("[Email] EMAIL_USER exists:", !!process.env.EMAIL_USER);
    console.log("[Email] EMAIL_PASS exists:", !!process.env.EMAIL_PASS);
    return false;
  }
};

/**
 * Send SMS Notification (Simulated using console or Third-party API like Twilio)
 * @param {string} to - Recipient phone number
 * @param {string} message - SMS content
 */
export const sendSMS = async (to, message) => {
  try {
    console.log(`[v0] [SIMULATED SMS] To: ${to} | Message: ${message}`);

    /* 
    Example Twilio Integration:
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({ body: message, from: process.env.TWILIO_PHONE, to });
    */

    return true;
  } catch (error) {
    console.error("[v0] Error sending SMS:", error.message);
    return false;
  }
};

/**
 * Send Multi-channel Notification
 * @param {Object} user - User object with email and phone
 * @param {string} subject - Subject
 * @param {string} message - Message
 */
export const notifyUser = async (user, subject, message) => {
  const promises = [];
  if (user.email) promises.push(sendEmail(user.email, subject, message));
  if (user.phone) promises.push(sendSMS(user.phone, message));
  return Promise.all(promises);
};
