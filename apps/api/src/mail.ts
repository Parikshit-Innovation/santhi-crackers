import nodemailer from "nodemailer";

export const DESTINATION_EMAIL = process.env.CONTACT_EMAIL || "shanthicracker@gmail.com";

export interface SendContactEmailParams {
  email: string;
  message: string;
  name?: string;
  phone?: string;
}

/**
 * Returns a configured nodemailer transporter.
 * Falls back gracefully to JSON transport if credentials are not provided.
 */
function getTransporter() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_PASS || process.env.GMAIL_APP_PASSWORD;

  // 1. Dedicated SMTP Host configured
  if (smtpHost && smtpUser && smtpPass) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  // 2. Gmail service credentials configured
  if (smtpUser && smtpPass) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  // 3. Fallback: Log in console and succeed without throwing
  return nodemailer.createTransport({
    jsonTransport: true,
  });
}

export async function sendContactEmail(params: SendContactEmailParams) {
  const { email, message, name, phone } = params;

  if (!email || !message) {
    throw new Error("Email and message are required.");
  }

  const transporter = getTransporter();
  const fromAddress =
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    process.env.GMAIL_USER ||
    `"Santhi Sivakasi Crackers" <noreply@santhicrackers.com>`;

  const subject = `[Website Inquiry] New message from ${name ? `${name} (${email})` : email}`;

  const htmlContent = `
    <div style="font-family: Arial, -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #dc2626; color: #ffffff; padding: 22px 24px; text-align: center;">
        <h2 style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.01em;">Santhi Sivakasi Crackers</h2>
        <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.95;">Official Store Contact Inquiry</p>
      </div>

      <div style="padding: 24px;">
        <div style="margin-bottom: 20px;">
          <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #0f172a;">Customer Details</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 100px;"><strong>Email:</strong></td>
              <td style="padding: 6px 0;"><a href="mailto:${email}" style="color: #0036f5; font-weight: 600; text-decoration: none;">${email}</a></td>
            </tr>
            ${
              name
                ? `<tr>
              <td style="padding: 6px 0; color: #64748b;"><strong>Name:</strong></td>
              <td style="padding: 6px 0; color: #1e293b; font-weight: 600;">${name}</td>
            </tr>`
                : ""
            }
            ${
              phone
                ? `<tr>
              <td style="padding: 6px 0; color: #64748b;"><strong>Phone:</strong></td>
              <td style="padding: 6px 0; color: #1e293b; font-weight: 600;"><a href="tel:${phone}" style="color: #0036f5;">${phone}</a></td>
            </tr>`
                : ""
            }
          </table>
        </div>

        <div style="background-color: #f8fafc; border-left: 4px solid #dc2626; border-radius: 6px; padding: 16px 18px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b;">Message Content:</p>
          <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #1e293b; white-space: pre-wrap;">${message}</p>
        </div>

        <div style="border-top: 1px solid #f1f5f9; padding-top: 18px; margin-top: 24px; font-size: 13px; color: #64748b; line-height: 1.5;">
          <p style="margin: 0 0 6px 0;">
            This inquiry was sent directly from the <strong>Santhi Sivakasi Crackers</strong> website contact form.
          </p>
          <p style="margin: 0;">
            Reply to this email to respond directly to <strong>${email}</strong>.
          </p>
        </div>
      </div>
    </div>
  `;

  const mailOptions = {
    from: fromAddress,
    to: DESTINATION_EMAIL,
    replyTo: email,
    subject,
    text: `New Website Inquiry:\n\nFrom: ${email}${name ? ` (${name})` : ""}${phone ? `\nPhone: ${phone}` : ""}\n\nMessage:\n${message}\n\nTarget: ${DESTINATION_EMAIL}`,
    html: htmlContent,
  };

  const result = await transporter.sendMail(mailOptions);

  console.log(`[Contact Mail API] Dispatched email from ${email} to ${DESTINATION_EMAIL}. Result:`, {
    messageId: result.messageId || "simulated-id",
  });

  return {
    success: true,
    destination: DESTINATION_EMAIL,
    messageId: result.messageId,
  };
}
