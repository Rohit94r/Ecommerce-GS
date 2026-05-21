import { createHmac, randomInt, timingSafeEqual } from "crypto";

export const SIGNUP_OTP_COOKIE = "gargi_signup_otp";
export const SIGNUP_OTP_MAX_AGE_SECONDS = 10 * 60;

type SignupOtpPayload = {
  email: string;
  purpose: "signup";
  otpHash: string;
  expiresAt: number;
  attempts: number;
};

export function normalizeAuthEmail(email: string) {
  return email.trim().toLowerCase();
}

export function generateSignupOtp() {
  return randomInt(100000, 1000000).toString();
}

export function createSignupOtpCookie(email: string, otp: string) {
  const now = Date.now();
  const payload: SignupOtpPayload = {
    email: normalizeAuthEmail(email),
    purpose: "signup",
    otpHash: hashOtp(email, otp),
    expiresAt: now + SIGNUP_OTP_MAX_AGE_SECONDS * 1000,
    attempts: 0,
  };

  return signPayload(payload);
}

export function readSignupOtpCookie(value: string | undefined) {
  if (!value) return null;

  const [encodedPayload, signature] = value.split(".");
  if (!encodedPayload || !signature) return null;

  if (!secureEqual(signature, signEncodedPayload(encodedPayload))) return null;

  try {
    const parsed = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as Partial<SignupOtpPayload>;
    if (
      parsed.purpose !== "signup" ||
      typeof parsed.email !== "string" ||
      typeof parsed.otpHash !== "string" ||
      typeof parsed.expiresAt !== "number" ||
      typeof parsed.attempts !== "number"
    ) {
      return null;
    }

    return parsed as SignupOtpPayload;
  } catch {
    return null;
  }
}

export function verifySignupOtpCookie(payload: SignupOtpPayload, email: string, otp: string) {
  if (payload.email !== normalizeAuthEmail(email)) {
    return { ok: false, reason: "email" as const };
  }

  if (payload.expiresAt < Date.now()) {
    return { ok: false, reason: "expired" as const };
  }

  if (payload.attempts >= 5) {
    return { ok: false, reason: "attempts" as const };
  }

  if (!secureEqual(payload.otpHash, hashOtp(email, otp))) {
    return { ok: false, reason: "otp" as const };
  }

  return { ok: true, reason: null };
}

export function incrementSignupOtpAttempts(payload: SignupOtpPayload) {
  return signPayload({
    ...payload,
    attempts: payload.attempts + 1,
  });
}

function hashOtp(email: string, otp: string) {
  return createHmac("sha256", getOtpSecret())
    .update(`${normalizeAuthEmail(email)}:${otp.trim()}`)
    .digest("hex");
}

function signPayload(payload: SignupOtpPayload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encodedPayload}.${signEncodedPayload(encodedPayload)}`;
}

function signEncodedPayload(encodedPayload: string) {
  return createHmac("sha256", getOtpSecret()).update(encodedPayload).digest("base64url");
}

function getOtpSecret() {
  const secret = process.env.OTP_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    throw new Error("Missing OTP secret environment variable");
  }
  return secret;
}

function secureEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) return false;

  return timingSafeEqual(leftBuffer, rightBuffer);
}
