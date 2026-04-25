"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/utils/supabase/client";

type Mode = "login" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (mode === "signup" && !name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (password.length < 6) {
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

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (loginError) {
      setError(loginError.message);
      return;
    }

    router.replace("/account");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5">
      <h1 className="text-3xl font-black text-slate-950">{mode === "signup" ? "Create account" : "Login"}</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {mode === "signup" ? "Create your customer account to manage orders and checkout faster." : "Log in to continue shopping with Gargi Surgical & Healthcare."}
      </p>

      <div className="mt-6 grid gap-4">
        {mode === "signup" ? (
          <label className="text-sm font-bold text-slate-700">
            Name
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" autoComplete="name" />
          </label>
        ) : null}
        <label className="text-sm font-bold text-slate-700">
          Email
          <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="you@example.com" autoComplete="email" />
        </label>
        <label className="text-sm font-bold text-slate-700">
          Password
          <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Minimum 6 characters" autoComplete={mode === "signup" ? "new-password" : "current-password"} />
        </label>
      </div>

      {error ? <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}
      {message ? <p className="mt-4 rounded-md bg-[#047068]/10 px-3 py-2 text-sm font-semibold text-[#047068]">{message}</p> : null}

      <Button className="mt-6 w-full" disabled={loading}>
        {loading ? "Please wait..." : mode === "signup" ? "Create account" : "Login"}
      </Button>

      <p className="mt-5 text-center text-sm text-slate-600">
        {mode === "signup" ? "Already have an account?" : "New customer?"}{" "}
        <Link href={mode === "signup" ? "/login" : "/signup"} className="font-black text-[#047068]">
          {mode === "signup" ? "Login" : "Create account"}
        </Link>
      </p>
    </form>
  );
}
