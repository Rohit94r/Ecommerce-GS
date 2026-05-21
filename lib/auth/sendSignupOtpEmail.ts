import nodemailer from "nodemailer";

type SendSignupOtpEmailInput = {
  to: string;
  otp: string;
};

export async function sendSignupOtpEmail({ to, otp }: SendSignupOtpEmailInput) {
  const user = process.env.GMAIL_SMTP_USER || "gargisurgical58@gmail.com";
  const pass = process.env.GMAIL_SMTP_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD;
  const fromEmail = process.env.GMAIL_FROM_EMAIL || user;

  if (!pass) {
    throw new Error("Missing Gmail SMTP app password");
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user,
      pass,
    },
  });

  await transporter.sendMail({
    from: `"Gargi Surgical & Healthcare" <${fromEmail}>`,
    to,
    subject: "Your Gargi Surgical OTP",
    text: `Your Gargi Surgical OTP is ${otp}. This code expires in 10 minutes. Do not share it with anyone.`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
        <h2 style="margin: 0 0 12px;">Your Gargi Surgical OTP</h2>
        <p>Please enter this code to verify your account:</p>
        <p style="font-size: 32px; letter-spacing: 6px; font-weight: 700; margin: 16px 0;">${otp}</p>
        <p>This code expires in 10 minutes. Do not share it with anyone.</p>
      </div>
    `,
  });
}
