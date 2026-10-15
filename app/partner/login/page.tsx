"use client";

import { useActionState } from "react";
import { partnerLogin } from "@/lib/partner-session";

export default function PartnerLoginPage() {
  const [state, action, pending] = useActionState(partnerLogin, {} as { error?: string });
  return (
    <div className="flex justify-center">
      <form action={action} className="w-full max-w-md p-8 rounded-2xl border border-border bg-pure shadow-sm space-y-5">
        <div>
          <h1 className="font-serif-display text-2xl">Welcome, partner</h1>
          <p className="text-sm text-stone mt-1">Sign in to see the orders placed with your code and your commission.</p>
        </div>
        {state?.error && <div className="p-3 rounded-lg bg-red-50 text-sale text-sm">{state.error}</div>}
        <label className="block text-sm font-medium">
          Email
          <input name="email" type="email" required autoComplete="username" className="input-admin mt-1" />
        </label>
        <label className="block text-sm font-medium">
          Password
          <input name="password" type="password" required autoComplete="current-password" className="input-admin mt-1" />
        </label>
        <button type="submit" disabled={pending} className="w-full px-4 py-2.5 rounded-lg bg-gold text-pure font-medium hover:bg-gold-light disabled:opacity-50">
          {pending ? "Signing in…" : "Sign in"}
        </button>
        <p className="text-xs text-stone">Forgot your password? Message KHAYAL and we will reset it.</p>
      </form>
    </div>
  );
}
