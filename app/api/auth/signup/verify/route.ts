import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  incrementSignupOtpAttempts,
  normalizeAuthEmail,
  readSignupOtpCookie,
  SIGNUP_OTP_COOKIE,
  SIGNUP_OTP_MAX_AGE_SECONDS,
  verifySignupOtpCookie,
} from "@/lib/auth/signupOtp";

export const runtime = "nodejs";

type VerifySignupOtpRequest = {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  otp?: string;
};

const signupOtpCookieOptions = {
  httpOnly: true,
  maxAge: SIGNUP_OTP_MAX_AGE_SECONDS,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as VerifySignupOtpRequest;
    const name = body.name?.trim() ?? "";
    const email = normalizeAuthEmail(body.email ?? "");
    const phone = body.phone?.trim() ?? "";
    const password = body.password ?? "";
    const otp = body.otp?.trim() ?? "";

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
    if (!otp) {
      return NextResponse.json({ error: "Enter the OTP sent to your email." }, { status: 400 });
    }

    const otpCookie = readSignupOtpCookie(request.cookies.get(SIGNUP_OTP_COOKIE)?.value);
    if (!otpCookie) {
      return NextResponse.json({ error: "OTP expired. Please send a new OTP." }, { status: 400 });
    }

    const otpResult = verifySignupOtpCookie(otpCookie, email, otp);
    if (!otpResult.ok) {
      if (otpResult.reason === "otp") {
        const nextAttempts = otpCookie.attempts + 1;
        const response = NextResponse.json({ error: nextAttempts >= 5 ? "Too many wrong OTP attempts. Please send a new OTP." : "Invalid OTP." }, { status: 400 });

        if (nextAttempts >= 5) {
          clearSignupOtpCookie(response);
        } else {
          response.cookies.set(SIGNUP_OTP_COOKIE, incrementSignupOtpAttempts(otpCookie), signupOtpCookieOptions);
        }

        return response;
      }

      const response = NextResponse.json({ error: otpResult.reason === "expired" ? "OTP expired. Please send a new OTP." : "OTP does not match this email. Please send a new OTP." }, { status: 400 });
      clearSignupOtpCookie(response);
      return response;
    }

    const supabase = createAdminClient();
    const { error: createUserError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        full_name: name,
        phone,
      },
    });

    if (createUserError) {
      const alreadyExists = createUserError.message.toLowerCase().includes("already") || createUserError.message.toLowerCase().includes("registered");
      const response = NextResponse.json(
        { error: alreadyExists ? "This email already has an account. Please login with email and password." : "Could not create account. Please try again." },
        { status: alreadyExists ? 409 : 500 },
      );
      clearSignupOtpCookie(response);
      return response;
    }

    const response = NextResponse.json({ message: "Account verified. Logging you in..." });
    clearSignupOtpCookie(response);
    return response;
  } catch (error) {
    console.error("Signup OTP verify failed", error);
    return NextResponse.json({ error: "Could not verify OTP. Please try again." }, { status: 500 });
  }
}

function clearSignupOtpCookie(response: NextResponse) {
  response.cookies.set(SIGNUP_OTP_COOKIE, "", {
    path: "/",
    maxAge: 0,
  });
}
