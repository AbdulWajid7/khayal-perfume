"use client";

import { createContext, useContext, type ReactNode } from "react";
import { type ConsentPreferences, type ConsentStatus, useConsent } from "@/lib/consent";

type ConsentContextValue = {
  status: ConsentStatus;
  preferences: ConsentPreferences;
  mounted: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  saveCustom: (preferences: ConsentPreferences) => void;
  updatePreferences: (preferences: ConsentPreferences) => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const value = useConsent();
  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsentContext() {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error("useConsentContext must be used within ConsentProvider");
  }
  return context;
}
