"use client";

import { useState, type FormEvent } from "react";
import { subscribeToNewsletter } from "@/lib/subscribers";
import { trackMarketing } from "@/lib/analytics";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || status === "submitting") return;
    setStatus("submitting");
    setMessage("");
    try {
      const res = await subscribeToNewsletter(email, "footer");
      if (res.ok) {
        trackMarketing("newsletter_signup", { lead_type: "newsletter", placement: "footer" });
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(res.message);
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
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
        data-clarity-mask="true"
        required
        disabled={status === "submitting"}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="your@email.com"
        className="flex-1 bg-pure border border-border rounded-lg px-4 py-3 text-sm text-ink placeholder:text-stone-light focus:border-gold focus:outline-none transition-colors disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex items-center justify-center bg-gold text-pure rounded-lg px-6 py-3 text-sm font-medium hover:bg-gold-light transition-colors disabled:opacity-60"
      >
        {status === "submitting" ? "Subscribing..." : "Subscribe"}
      </button>
      {status === "error" && (
        <p className="w-full text-sale text-sm">{message}</p>
      )}
    </form>
  );
}
