"use client";

import { useActionState } from "react";
import { login } from "@/lib/session";

const initialState: { error?: string } = {};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <form
        action={formAction}
        className="w-full max-w-md p-8 rounded-2xl border border-border bg-pure shadow-sm space-y-6"
      >
        <h1 className="text-ink text-2xl font-medium font-serif-display">
          Khayal <span className="text-gold">Admin</span>
        </h1>

        {state?.error && (
          <div className="p-3 rounded-lg bg-red-50 text-sale text-sm break-words">
            {state.error}
          </div>
        )}

        <div>
          <label className="block text-ink text-sm font-medium mb-1">Email</label>
          <input
            name="email"
            type="email"
            required
            className="input-admin"
          />
        </div>
        <div>
          <label className="block text-ink text-sm font-medium mb-1">Password</label>
          <input
            name="password"
            type="password"
            required
            className="input-admin"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full px-4 py-2.5 rounded-lg bg-gold text-pure font-medium hover:bg-gold-light transition-colors disabled:opacity-50"
        >
          {isPending ? "Signing In..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
