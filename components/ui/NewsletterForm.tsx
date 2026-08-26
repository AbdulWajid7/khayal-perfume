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
      <p className="text-gold text-sm font-medium">
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
        className="flex-1 bg-pure border border-border rounded-lg px-4 py-3 text-sm text-ink placeholder:text-stone-light focus:border-gold focus:outline-none transition-colors"
      />
      <button
        type="submit"
        className="inline-flex items-center justify-center bg-gold text-pure rounded-lg px-6 py-3 text-sm font-medium hover:bg-gold-light transition-colors"
      >
        Subscribe
      </button>
    </form>
  );
}
