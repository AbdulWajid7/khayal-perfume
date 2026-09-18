"use client";

import { useState } from "react";
import Link from "next/link";
import { useConsentContext } from "@/components/analytics/ConsentProvider";
import { type ConsentPreferences } from "@/lib/consent";

const categoryLabels: Record<keyof ConsentPreferences, string> = {
  necessary: "Necessary",
  analytics: "Analytics",
  marketing: "Marketing",
  functional: "Functional",
};

const categoryDescriptions: Record<keyof ConsentPreferences, string> = {
  necessary: "Required for the site to work, such as cart and session cookies.",
  analytics: "Helps us understand how visitors use the site and improve it.",
  marketing: "Used to measure advertising and deliver relevant promotions.",
  functional: "Remembers your preferences for a better experience.",
};

export default function ConsentBanner() {
  const { status, preferences, mounted, acceptAll, rejectAll, saveCustom, updatePreferences } = useConsentContext();
  const [showCustomize, setShowCustomize] = useState(false);

  if (!mounted || status !== "undecided") return null;

  const draft = preferences;

  const toggle = (key: keyof ConsentPreferences) => {
    if (key === "necessary") return;
    const next: ConsentPreferences = { ...draft, [key]: !draft[key] };
    updatePreferences(next);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-cream-dark/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-5 md:px-8 md:py-6">
        {!showCustomize ? (
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-serif-display text-ink text-xl font-medium tracking-tight">
                We value your privacy
              </h2>
              <p className="mt-2 text-sm text-stone leading-relaxed">
                We use cookies and similar technologies to remember your cart, understand how our
                site is used, and support our marketing. You can choose which categories you allow.
                Read more in our{" "}
                <Link href="/privacy" className="underline hover:text-gold transition-colors">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={() => setShowCustomize(true)}
                className="px-5 py-2.5 text-sm font-medium text-ink underline-offset-4 hover:text-gold transition-colors"
              >
                Customize
              </button>
              <button
                onClick={rejectAll}
                className="rounded-sm border border-ink px-5 py-2.5 text-sm font-medium text-ink hover:bg-ink hover:text-cream transition-colors"
              >
                Reject all
              </button>
              <button
                onClick={acceptAll}
                className="rounded-sm bg-ink px-5 py-2.5 text-sm font-medium text-cream hover:bg-ink/90 transition-colors"
              >
                Accept all
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="max-w-2xl">
              <h2 className="font-serif-display text-ink text-xl font-medium tracking-tight">
                Manage cookie preferences
              </h2>
              <p className="mt-1 text-sm text-stone">
                Select which categories you allow. Necessary cookies are always enabled.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(Object.keys(categoryLabels) as Array<keyof ConsentPreferences>).map((key) => {
                const disabled = key === "necessary";
                const checked = draft[key];
                return (
                  <label
                    key={key}
                    className={`relative flex cursor-pointer items-start gap-3 rounded-sm border border-border bg-cream p-4 transition-colors ${
                      disabled ? "opacity-80" : "hover:border-ink/30"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggle(key)}
                      className="mt-0.5 h-4 w-4 cursor-pointer accent-ink disabled:cursor-not-allowed"
                    />
                    <div>
                      <span className="block text-sm font-medium text-ink">
                        {categoryLabels[key]}
                      </span>
                      <span className="mt-1 block text-xs text-stone leading-relaxed">
                        {categoryDescriptions[key]}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                onClick={() => setShowCustomize(false)}
                className="px-5 py-2.5 text-sm font-medium text-ink underline-offset-4 hover:text-gold transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => {
                  saveCustom(draft);
                  setShowCustomize(false);
                }}
                className="rounded-sm bg-ink px-5 py-2.5 text-sm font-medium text-cream hover:bg-ink/90 transition-colors"
              >
                Save preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
