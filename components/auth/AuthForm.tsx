"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/utils/supabase/client";

type Mode = "login" | "signup";
type AuthApiResponse = {
  error?: string;
  message?: string;
};

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const isSignup = mode === "signup";

  useEffect(() => {
    if (isSignup) return;

    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (mounted && data.user) router.replace("/account");
    });

    return () => {
      mounted = false;
    };
  }, [isSignup, router, supabase.auth]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (isSignup && !otpSent && !name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (isSignup && !otpSent && !phone.trim()) {
      setError("Phone number is required.");
      return;
    }
    if (!otpSent && !password) {
      setError("Password is required.");
      return;
    }
    if (!otpSent && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const emailValue = email.trim();

    if (!isSignup) {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: emailValue,
        password,
      });

      setLoading(false);

      if (loginError) {
        setError(loginError.message);
        return;
      }

      router.replace("/account");
      router.refresh();
      return;
    }

    if (!otpSent) {
      const otpResponse = await fetch("/api/auth/signup/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: emailValue,
          phone: phone.trim(),
          password,
        }),
      });
      const otpResult = await readAuthApiResponse(otpResponse);

      setLoading(false);

      if (!otpResponse.ok) {
        setError(otpResult.error ?? "Could not send OTP. Please try again.");
        return;
      }

      setOtpSent(true);
      setMessage(otpResult.message ?? `OTP sent to ${emailValue}. Enter the code to create your account.`);
      return;
    }

    if (!otp.trim()) {
      setLoading(false);
      setError("Enter the OTP sent to your email.");
      return;
    }

    const verifyResponse = await fetch("/api/auth/signup/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name.trim(),
        email: emailValue,
        phone: phone.trim(),
        password,
        otp: otp.trim(),
      }),
    });
    const verifyResult = await readAuthApiResponse(verifyResponse);

    if (!verifyResponse.ok) {
      setLoading(false);
      setError(verifyResult.error ?? "Could not verify OTP. Please try again.");
      return;
    }

    await supabase.auth.signOut();
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: emailValue,
      password,
    });

    setLoading(false);

    if (loginError) {
      setError("Account verified, but login failed. Please login with email and password.");
      return;
    }

    router.replace("/account");
    router.refresh();
  }

  async function resendOtp() {
    setError("");
    setMessage("");
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    setLoading(true);
    const emailValue = email.trim();
    const otpResponse = await fetch("/api/auth/signup/send-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name.trim(),
        email: emailValue,
        phone: phone.trim(),
        password,
      }),
    });
    const otpResult = await readAuthApiResponse(otpResponse);
    setLoading(false);

    if (!otpResponse.ok) {
      setError(otpResult.error ?? "Could not send OTP. Please try again.");
      return;
    }

    setMessage(otpResult.message ?? `New OTP sent to ${emailValue}.`);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5">
      <h1 className="text-3xl font-black text-slate-950">{isSignup ? "Create account" : "Login"}</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {isSignup ? "Create your account with email OTP verification." : "Login with your email and password."}
      </p>

      <div className="mt-6 grid gap-4">
        {isSignup ? (
          <label className="text-sm font-bold text-slate-700">
            Name
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" autoComplete="name" disabled={otpSent} />
          </label>
        ) : null}
        <label className="text-sm font-bold text-slate-700">
          Email
          <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="you@example.com" autoComplete="email" disabled={otpSent} />
        </label>
        {isSignup ? (
          <label className="text-sm font-bold text-slate-700">
            Phone
            <Input value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" placeholder="+91 98765 43210" autoComplete="tel" disabled={otpSent} />
          </label>
        ) : null}
        <label className="text-sm font-bold text-slate-700">
          Password
          <Input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            placeholder="Minimum 6 characters"
            autoComplete={isSignup ? "new-password" : "current-password"}
            disabled={otpSent}
          />
        </label>
        {isSignup && otpSent ? (
          <label className="text-sm font-bold text-slate-700">
            OTP
            <Input value={otp} onChange={(event) => setOtp(event.target.value)} inputMode="numeric" placeholder="6 digit code" autoComplete="one-time-code" />
          </label>
        ) : null}
      </div>

      {error ? <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}
      {message ? <p className="mt-4 rounded-md bg-[#047068]/10 px-3 py-2 text-sm font-semibold text-[#047068]">{message}</p> : null}

      <Button className="mt-6 w-full" disabled={loading}>
        {loading ? "Please wait..." : isSignup ? otpSent ? "Verify OTP & Create Account" : "Send OTP" : "Login"}
      </Button>

      {isSignup && otpSent ? (
        <div className="mt-3 flex flex-wrap justify-center gap-3 text-sm">
          <button type="button" onClick={resendOtp} disabled={loading} className="font-black text-[#047068] disabled:opacity-50">
            Resend OTP
          </button>
          <button type="button" onClick={() => { setOtpSent(false); setOtp(""); setMessage(""); setError(""); }} className="font-black text-slate-500">
            Change email
          </button>
        </div>
      ) : null}

      <p className="mt-5 text-center text-sm text-slate-600">
        {isSignup ? "Already have an account?" : "New customer?"}{" "}
        <Link href={isSignup ? "/login" : "/signup"} className="font-black text-[#047068]">
          {isSignup ? "Login" : "Create account"}
        </Link>
      </p>
    </form>
  );
}

async function readAuthApiResponse(response: Response): Promise<AuthApiResponse> {
  try {
    return (await response.json()) as AuthApiResponse;
  } catch {
    return {};
  }
}
