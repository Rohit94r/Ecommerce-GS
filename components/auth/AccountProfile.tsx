"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { createClient } from "@/utils/supabase/client";

type Profile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
};

export function AccountProfile({ profile }: { profile: Profile }) {
  const supabase = createClient();
  const [form, setForm] = useState(profile);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function saveProfile() {
    setLoading(true);
    setMessage("");
    setError("");

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        name: form.name,
        phone: form.phone,
        address: form.address,
      })
      .eq("id", form.id);

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage("Profile updated.");
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-[#047068]">My account</p>
      <h1 className="mt-3 text-3xl font-black text-slate-950">Welcome, {form.name || "Customer"}</h1>
      <p className="mt-2 text-slate-600">{form.email}</p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-bold text-slate-700">
          Name
          <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        </label>
        <label className="text-sm font-bold text-slate-700">
          Phone
          <Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
        </label>
        <label className="text-sm font-bold text-slate-700 md:col-span-2">
          Address
          <Textarea value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
        </label>
      </div>

      {message ? <p className="mt-4 rounded-md bg-[#047068]/10 px-3 py-2 text-sm font-semibold text-[#047068]">{message}</p> : null}
      {error ? <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}

      <Button className="mt-6" onClick={saveProfile} disabled={loading}>
        {loading ? "Saving..." : "Save Profile"}
      </Button>
    </div>
  );
}
