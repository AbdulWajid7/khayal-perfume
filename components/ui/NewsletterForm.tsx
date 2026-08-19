"use client";

import { useState, type FormEvent } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitted">("idle");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) return;
    // Newsletter provider integration can be wired up here.
    setStatus("submitted");
    setEmail("");
  }

  if (status === "submitted") {
    return (
      <p className="text-oud-gold text-sm">
        Thank you — you&apos;ll hear from us soon.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="your@email.com"
        className="flex-1 bg-midnight border border-border-subtle rounded-lg px-4 py-2.5 text-sm text-parchment placeholder:text-warm-taupe focus:border-oud-gold focus:outline-none transition-colors"
      />
      <button
        type="submit"
        className="inline-flex items-center justify-center bg-oud-gold text-midnight rounded-lg px-6 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Subscribe
      </button>
    </form>
  );
}
