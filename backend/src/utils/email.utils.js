import nodemailer from 'nodemailer';

// ── Transport ─────────────────────────────────────────────────────────────────
const createTransport = () => {
    // In dev/test we use Ethereal (fake SMTP) if no credentials are set
    if (process.env.NODE_ENV === 'test' || !process.env.SMTP_USER) {
        return nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: { user: 'ethereal_user', pass: 'ethereal_pass' },
        });
    }

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

const transporter = createTransport();

// ── Base send ─────────────────────────────────────────────────────────────────
const sendEmail = async ({ to, subject, html, text }) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM || '"ZakatAid" <noreply@zakataid.com>',
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''), // fallback plain-text
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        if (process.env.NODE_ENV !== 'production') {
            console.log(`📧  Email sent to ${to} | MessageId: ${info.messageId}`);
        }
        return info;
    } catch (err) {
        console.error('❌  Email send failed:', err.message);
        throw err;
    }
};

// ── Branded templates ─────────────────────────────────────────────────────────
const brandedTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ZakatAid</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#F0F7F6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0F7F6;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#1B5E44;padding:32px 40px;text-align:center;">
              <p style="margin:0;color:#fff;font-size:24px;font-weight:900;letter-spacing:-0.5px;">
                ZAKAT<span style="color:#F6921E;">AID</span>
              </p>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.6);font-size:11px;letter-spacing:3px;text-transform:uppercase;">
                Digital Endowment Platform
              </p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #F0F7F6;text-align:center;">
              <p style="margin:0;color:#9CA3AF;font-size:12px;">
                © ${new Date().getFullYear()} ZakatAid · Transparent Giving in West Africa
              </p>
              <p style="margin:8px 0 0;color:#9CA3AF;font-size:11px;">
                If you didn't request this, please ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ── Email: OTP verification ───────────────────────────────────────────────────
export const sendOTPEmail = async ({ to, name, otp, purpose = 'email_verification' }) => {
    const purposeLabel = purpose === 'password_reset' ? 'password reset' : 'email verification';

    const content = `
      <h2 style="margin:0 0 8px;font-size:22px;color:#111;font-weight:800;">Your OTP Code</h2>
      <p style="color:#6B7280;font-size:15px;margin:0 0 28px;">
        Hi <strong>${name}</strong>, use the code below to complete your ${purposeLabel}.
      </p>
      <div style="background:#F0F7F6;border-radius:16px;padding:28px;text-align:center;margin-bottom:28px;">
        <p style="font-size:40px;font-weight:900;letter-spacing:16px;color:#1B5E44;margin:0;">
          ${otp}
        </p>
        <p style="margin:12px 0 0;color:#9CA3AF;font-size:12px;">
          Expires in ${process.env.OTP_EXPIRES_MINUTES || 10} minutes
        </p>
      </div>
      <p style="color:#9CA3AF;font-size:13px;margin:0;">
        Never share this code with anyone, including ZakatAid support.
      </p>
    `;

    return sendEmail({
        to,
        subject: `Your ZakatAid OTP — ${otp}`,
        html: brandedTemplate(content),
    });
};

// ── Email: Welcome ────────────────────────────────────────────────────────────
export const sendWelcomeEmail = async ({ to, name }) => {
    const content = `
      <h2 style="margin:0 0 8px;font-size:22px;color:#111;font-weight:800;">Welcome to ZakatAid 🕌</h2>
      <p style="color:#6B7280;font-size:15px;margin:0 0 24px;">
        Assalamu Alaikum <strong>${name}</strong>,<br/>
        Your account has been created. You can now calculate your Zakat and give with full transparency.
      </p>
      <a href="${process.env.CLIENT_URL}/auth" 
         style="display:inline-block;background:#1B5E44;color:#fff;padding:14px 32px;border-radius:50px;font-weight:800;font-size:13px;text-decoration:none;letter-spacing:1px;text-transform:uppercase;">
        Sign In to Dashboard
      </a>
    `;

    return sendEmail({
        to,
        subject: 'Welcome to ZakatAid — Account Created',
        html: brandedTemplate(content),
    });
};

// ── Email: Password reset ─────────────────────────────────────────────────────
export const sendPasswordResetEmail = async ({ to, name, resetLink }) => {
    const content = `
      <h2 style="margin:0 0 8px;font-size:22px;color:#111;font-weight:800;">Reset Your Password</h2>
      <p style="color:#6B7280;font-size:15px;margin:0 0 24px;">
        Hi <strong>${name}</strong>, click the button below to reset your password.
        This link expires in 1 hour.
      </p>
      <a href="${resetLink}" 
         style="display:inline-block;background:#F6921E;color:#fff;padding:14px 32px;border-radius:50px;font-weight:800;font-size:13px;text-decoration:none;letter-spacing:1px;text-transform:uppercase;">
        Reset Password
      </a>
      <p style="color:#9CA3AF;font-size:12px;margin-top:24px;">
        Or copy this link: <span style="color:#1B5E44;">${resetLink}</span>
      </p>
    `;

    return sendEmail({
        to,
        subject: 'ZakatAid — Password Reset Request',
        html: brandedTemplate(content),
    });
};

export default sendEmail;
