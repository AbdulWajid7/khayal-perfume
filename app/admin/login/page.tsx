"use client";

import { useActionState } from "react";
import { login } from "@/lib/session";

const initialState: { error?: string } = {};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <div className="min-h-screen flex items-center justify-center bg-midnight px-4">
      <form
        action={formAction}
        className="w-full max-w-md p-8 rounded-2xl border border-border-subtle bg-charcoal space-y-6"
      >
        <h1 className="text-parchment text-2xl font-medium">Khayal Admin</h1>

        {state?.error && (
          <div className="p-3 rounded bg-red-900/30 text-red-100 text-sm break-words">
            {state.error}
          </div>
        )}

        <div>
          <label className="block text-parchment text-sm font-medium mb-1">Email</label>
          <input
            name="email"
            type="email"
            required
            className="w-full px-3 py-2 rounded bg-midnight border border-border-subtle text-parchment focus:outline-none focus:ring-1 focus:ring-oud-gold"
          />
        </div>
        <div>
          <label className="block text-parchment text-sm font-medium mb-1">Password</label>
          <input
            name="password"
            type="password"
            required
            className="w-full px-3 py-2 rounded bg-midnight border border-border-subtle text-parchment focus:outline-none focus:ring-1 focus:ring-oud-gold"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full px-4 py-2 rounded bg-oud-gold text-midnight font-medium hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Signing In..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
