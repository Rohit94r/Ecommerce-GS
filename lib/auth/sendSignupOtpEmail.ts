import nodemailer from "nodemailer";

type SendSignupOtpEmailInput = {
  to: string;
  otp: string;
};

type MailTransportConfig = {
  host: string;
  port: number;
  secure: boolean;
  requireTLS?: boolean;
};

export class SignupOtpEmailError extends Error {
  constructor(
    message: string,
    public readonly publicMessage: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "SignupOtpEmailError";
  }
}

export async function sendSignupOtpEmail({ to, otp }: SendSignupOtpEmailInput) {
  const user = readEnvValue("GMAIL_SMTP_USER", "gargisurgical58@gmail.com");
  const pass = readEnvValue("GMAIL_SMTP_APP_PASSWORD", readEnvValue("GMAIL_APP_PASSWORD", "")).replace(/\s+/g, "");
  const fromEmail = readEnvValue("GMAIL_FROM_EMAIL", user);

  if (!pass) {
    throw new Error("Missing Gmail SMTP app password");
  }

  const mail = {
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
  };

  const transports: MailTransportConfig[] = [
    { host: "smtp.gmail.com", port: 465, secure: true },
    { host: "smtp.gmail.com", port: 587, secure: false, requireTLS: true },
  ];

  const errors: unknown[] = [];

  for (const transport of transports) {
    try {
      const transporter = nodemailer.createTransport({
        ...transport,
        auth: {
          user,
          pass,
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000,
      });

      await transporter.sendMail(mail);
      return;
    } catch (error) {
      errors.push(error);
    }
  }

  throw toSignupOtpEmailError(errors);
}

function toSignupOtpEmailError(errors: unknown[]) {
  const summary = errors.map((error) => describeMailError(error)).join(" | ");

  if (errors.some(isAuthError)) {
    return new SignupOtpEmailError(
      summary,
      "Gmail rejected the SMTP login. Check GMAIL_SMTP_USER and GMAIL_SMTP_APP_PASSWORD in Vercel, then redeploy.",
      "SMTP_AUTH_FAILED",
    );
  }

  if (errors.some(isTimeoutError)) {
    return new SignupOtpEmailError(
      summary,
      "Gmail SMTP timed out from Vercel. Try redeploying once; if it repeats, use an HTTP mail provider like Resend or SendGrid.",
      "SMTP_TIMEOUT",
    );
  }

  return new SignupOtpEmailError(
    summary,
    "Gmail could not send the OTP from the hosted server. Check Vercel function logs for the SMTP error.",
    "SMTP_SEND_FAILED",
  );
}

function readEnvValue(name: string, fallback: string) {
  const rawValue = process.env[name] ?? fallback;
  const withoutKey = rawValue.startsWith(`${name}=`) ? rawValue.slice(name.length + 1) : rawValue;
  return withoutKey.trim().replace(/^['"]|['"]$/g, "");
}

function describeMailError(error: unknown) {
  if (!(error instanceof Error)) return "Unknown mail error";
  const details = error as Error & { code?: string; command?: string; responseCode?: number };
  return [details.code, details.command, details.responseCode, details.message].filter(Boolean).join(" ");
}

function isAuthError(error: unknown) {
  const details = error as { code?: string; responseCode?: number; message?: string };
  return details.code === "EAUTH" || details.responseCode === 535 || details.message?.toLowerCase().includes("username and password not accepted");
}

function isTimeoutError(error: unknown) {
  const details = error as { code?: string; message?: string };
  return details.code === "ETIMEDOUT" || details.message?.toLowerCase().includes("timed out") || details.message?.toLowerCase().includes("timeout");
}
