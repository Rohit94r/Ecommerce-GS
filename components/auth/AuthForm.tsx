"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/utils/supabase/client";

type Mode = "login" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (mounted && data.user) router.replace("/account");
    });

    return () => {
      mounted = false;
    };
  }, [router, supabase.auth]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if ((mode === "signup" || (mode === "login" && !otpSent)) && !name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (mode === "signup" && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    if (mode === "signup") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name.trim(),
            full_name: name.trim(),
          },
        },
      });

      setLoading(false);

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.session) {
        router.replace("/account");
        router.refresh();
        return;
      }

      setMessage("Account created. Please check your email to confirm your account, then log in.");
      return;
    }

    if (!otpSent) {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          data: {
            name: name.trim(),
            full_name: name.trim(),
          },
        },
      });

      setLoading(false);

      if (otpError) {
        setError(otpError.message);
        return;
      }

      setOtpSent(true);
      setMessage(`OTP sent to ${email}. Enter the code to continue.`);
      return;
    }

    if (!otp.trim()) {
      setLoading(false);
      setError("Enter the OTP sent to your email.");
      return;
    }

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp.trim(),
      type: "email",
    });

    setLoading(false);

    if (verifyError) {
      setError(verifyError.message);
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
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        data: {
          name: name.trim(),
          full_name: name.trim(),
        },
      },
    });
    setLoading(false);

    if (otpError) {
      setError(otpError.message);
      return;
    }

    setMessage(`New OTP sent to ${email}.`);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5">
      <h1 className="text-3xl font-black text-slate-950">{mode === "signup" ? "Create account" : "Login"}</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {mode === "signup" ? "Create your customer account to manage orders and checkout faster." : "Enter your details once, verify the email OTP and stay logged in on this device."}
      </p>

      <div className="mt-6 grid gap-4">
        {mode === "signup" || (mode === "login" && !otpSent) ? (
          <label className="text-sm font-bold text-slate-700">
            Name
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" autoComplete="name" disabled={otpSent} />
          </label>
        ) : null}
        <label className="text-sm font-bold text-slate-700">
          Email
          <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="you@example.com" autoComplete="email" disabled={otpSent} />
        </label>
        {mode === "signup" ? (
          <label className="text-sm font-bold text-slate-700">
            Password
            <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Minimum 6 characters" autoComplete="new-password" />
          </label>
        ) : null}
        {mode === "login" && otpSent ? (
          <label className="text-sm font-bold text-slate-700">
            OTP
            <Input value={otp} onChange={(event) => setOtp(event.target.value)} inputMode="numeric" placeholder="6 digit code" autoComplete="one-time-code" />
          </label>
        ) : null}
      </div>

      {error ? <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}
      {message ? <p className="mt-4 rounded-md bg-[#047068]/10 px-3 py-2 text-sm font-semibold text-[#047068]">{message}</p> : null}

      <Button className="mt-6 w-full" disabled={loading}>
        {loading ? "Please wait..." : mode === "signup" ? "Create account" : otpSent ? "Verify OTP & Login" : "Send OTP"}
      </Button>

      {mode === "login" && otpSent ? (
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
        {mode === "signup" ? "Already have an account?" : "New customer?"}{" "}
        <Link href={mode === "signup" ? "/login" : "/signup"} className="font-black text-[#047068]">
          {mode === "signup" ? "Login" : "Create account"}
        </Link>
      </p>
    </form>
  );
}
