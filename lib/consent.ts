"use client";

import { useCallback, useEffect, useState } from "react";

export type ConsentCategory = "necessary" | "analytics" | "marketing" | "functional";

export type ConsentPreferences = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
};

export type ConsentStatus = "undecided" | "accepted" | "rejected" | "custom";

export type ConsentState = {
  status: ConsentStatus;
  preferences: ConsentPreferences;
};

export const CONSENT_STORAGE_KEY = "khayal-consent-preferences";

export const defaultConsent: ConsentPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  functional: false,
};

export const allGrantedConsent: ConsentPreferences = {
  necessary: true,
  analytics: true,
  marketing: true,
  functional: true,
};

export const allDeniedConsent: ConsentPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  functional: false,
};

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
    fbq?: ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue?: unknown[]; push?: unknown; loaded?: boolean; version?: string };
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[] };
    _fbq?: unknown;
  }
}

export function getSavedConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    if (!parsed.preferences || typeof parsed.preferences.necessary !== "boolean") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveConsent(state: ConsentState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors (e.g. private mode)
  }
}

function consentPreferencesToGtag(preferences: ConsentPreferences) {
  return {
    analytics_storage: preferences.analytics ? "granted" : "denied",
    ad_storage: preferences.marketing ? "granted" : "denied",
    ad_user_data: preferences.marketing ? "granted" : "denied",
    ad_personalization: preferences.marketing ? "granted" : "denied",
    functionality_storage: preferences.functional ? "granted" : "denied",
    personalization_storage: preferences.functional ? "granted" : "denied",
    security_storage: "granted" as const,
  };
}

let currentConsent: ConsentPreferences = defaultConsent;

export function setCurrentConsent(preferences: ConsentPreferences): void {
  currentConsent = preferences;
}

export function hasConsent(category: keyof ConsentPreferences): boolean {
  return currentConsent[category];
}

export function setDefaultConsentMode(preferences: ConsentPreferences = defaultConsent): void {
  if (typeof window === "undefined") return;
  setCurrentConsent(preferences);
  const consent = consentPreferencesToGtag(preferences);
  window.dataLayer = window.dataLayer || [];
  window.gtag?.("consent", "default", consent);
  window.dataLayer.push({ event: "consent_default", consent });
}

export function updateConsentMode(preferences: ConsentPreferences): void {
  if (typeof window === "undefined") return;
  setCurrentConsent(preferences);
  const consent = consentPreferencesToGtag(preferences);
  window.dataLayer = window.dataLayer || [];
  window.gtag?.("consent", "update", consent);
  window.dataLayer.push({ event: "consent_update", consent });
}

export function loadMetaPixelScript(pixelId: string): void {
  if (typeof window === "undefined" || typeof document === "undefined" || window.fbq) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);

  window.fbq = function (...args: unknown[]) {
    if (window.fbq?.callMethod) {
      window.fbq.callMethod(...args);
    } else {
      window.fbq?.queue?.push(args);
    }
  };

  if (!window._fbq) window._fbq = window.fbq;
  window.fbq.push = window.fbq;
  window.fbq.loaded = true;
  window.fbq.version = "2.0";
  window.fbq.queue = [];

  window.fbq("init", pixelId);
}

export function loadClarityScript(projectId: string): void {
  if (typeof window === "undefined" || typeof document === "undefined" || window.clarity) return;

  const queue: unknown[] = [];
  const clarityFn = function (...args: unknown[]) {
    queue.push(args);
  } as NonNullable<Window["clarity"]>;
  clarityFn.q = queue;
  window.clarity = clarityFn;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${projectId}`;
  document.head.appendChild(script);
}

export function useConsent() {
  const [state, setState] = useState<ConsentState>({ status: "undecided", preferences: defaultConsent });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = getSavedConsent();
    if (saved) {
      setState(saved);
      setCurrentConsent(saved.preferences);
    } else {
      setCurrentConsent(defaultConsent);
    }
  }, []);

  const acceptAll = useCallback(() => {
    const newState: ConsentState = { status: "accepted", preferences: allGrantedConsent };
    setState(newState);
    saveConsent(newState);
    updateConsentMode(allGrantedConsent);
  }, []);

  const rejectAll = useCallback(() => {
    const newState: ConsentState = { status: "rejected", preferences: allDeniedConsent };
    setState(newState);
    saveConsent(newState);
    updateConsentMode(allDeniedConsent);
  }, []);

  const saveCustom = useCallback((preferences: ConsentPreferences) => {
    const status: ConsentStatus =
      preferences.analytics && preferences.marketing && preferences.functional
        ? "accepted"
        : !preferences.analytics && !preferences.marketing && !preferences.functional
          ? "rejected"
          : "custom";
    const newState: ConsentState = { status, preferences };
    setState(newState);
    saveConsent(newState);
    updateConsentMode(preferences);
  }, []);

  const updatePreferences = useCallback((preferences: ConsentPreferences) => {
    setState((current) => ({ ...current, preferences }));
  }, []);

  return {
    ...state,
    mounted,
    acceptAll,
    rejectAll,
    saveCustom,
    updatePreferences,
  };
}
