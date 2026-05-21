import { NextResponse } from "next/server";
import { createSignupOtpCookie, generateSignupOtp, normalizeAuthEmail, SIGNUP_OTP_COOKIE, SIGNUP_OTP_MAX_AGE_SECONDS } from "@/lib/auth/signupOtp";
import { sendSignupOtpEmail, SignupOtpEmailError } from "@/lib/auth/sendSignupOtpEmail";

export const runtime = "nodejs";

type SignupOtpRequest = {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    assertSignupOtpConfig();

    const body = (await request.json()) as SignupOtpRequest;
    const name = body.name?.trim() ?? "";
    const email = normalizeAuthEmail(body.email ?? "");
    const phone = body.phone?.trim() ?? "";
    const password = body.password ?? "";

    if (!name) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }
    if (!phone) {
      return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const otp = generateSignupOtp();
    await sendSignupOtpEmail({ to: email, otp });

    const response = NextResponse.json({
      message: `OTP sent to ${email}. Enter the code to create your account.`,
    });

    response.cookies.set(SIGNUP_OTP_COOKIE, createSignupOtpCookie(email, otp), {
      httpOnly: true,
      maxAge: SIGNUP_OTP_MAX_AGE_SECONDS,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    console.error("Signup OTP send failed", error);
    return NextResponse.json({ error: getSignupOtpConfigMessage(error), code: getSignupOtpErrorCode(error) }, { status: 500 });
  }
}

function assertSignupOtpConfig() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase service role key");
  }
  if (!process.env.OTP_SECRET && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing OTP secret");
  }
  if (!process.env.GMAIL_SMTP_APP_PASSWORD && !process.env.GMAIL_APP_PASSWORD) {
    throw new Error("Missing Gmail SMTP app password");
  }
}

function getSignupOtpConfigMessage(error: unknown) {
  if (error instanceof SignupOtpEmailError) {
    return error.publicMessage;
  }

  if (error instanceof Error) {
    if (error.message.includes("service role")) {
      return "Signup OTP is not configured. Add SUPABASE_SERVICE_ROLE_KEY in .env.local.";
    }
    if (error.message.includes("OTP secret")) {
      return "Signup OTP is not configured. Add OTP_SECRET in .env.local.";
    }
    if (error.message.includes("Gmail")) {
      return "Signup OTP email is not configured. Add GMAIL_SMTP_USER and GMAIL_SMTP_APP_PASSWORD in .env.local.";
    }
  }

  return "Could not send OTP. Please try again.";
}

function getSignupOtpErrorCode(error: unknown) {
  if (error instanceof SignupOtpEmailError) return error.code;
  return "SIGNUP_OTP_SEND_FAILED";
}
