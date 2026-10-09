"use client";

import { useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { subscribeToNewsletter } from "@/lib/subscribers";
import { trackMarketing } from "@/lib/analytics";

export default function NewsletterForm() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || status === "submitting") return;
    setStatus("submitting");
    setMessage("");
    try {
      const res = await subscribeToNewsletter(email, "footer", pathname);
      if (res.ok) {
        trackMarketing("newsletter_signup", { lead_type: "newsletter", placement: "footer" });
        setStatus("success");
        setMessage(res.message);
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
        {message || "Thank you — you'll hear from us soon."}
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
        className="input-lux flex-1 disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="btn-sweep inline-flex items-center justify-center bg-gold text-pure px-7 py-3.5 text-[12px] font-medium uppercase tracking-[0.2em] disabled:opacity-60"
      >
        {status === "submitting" ? "Subscribing..." : "Subscribe"}
      </button>
      {status === "error" && (
        <p className="w-full text-sale text-sm">{message}</p>
      )}
    </form>
  );
}
