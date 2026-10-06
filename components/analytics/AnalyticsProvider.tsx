"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { trackPageView, trackMarketing } from "@/lib/analytics";
import { siteConfig } from "@/lib/site-config";
import {
  loadClarityScript,
  loadMetaPixelScript,
  updateConsentMode,
} from "@/lib/consent";
import { useConsentContext } from "./ConsentProvider";

const enabled =
  process.env.NODE_ENV === "production" ||
  process.env.NEXT_PUBLIC_ANALYTICS_TESTING === "true";

function consentDefaultScript() {
  return `
    (function(){
      try {
        var raw = localStorage.getItem('khayal-consent-preferences');
        var p = raw ? JSON.parse(raw).preferences : {necessary:true,analytics:false,marketing:false,functional:false};
        window.gtag('consent','default',{
          analytics_storage: p.analytics ? 'granted' : 'denied',
          ad_storage: p.marketing ? 'granted' : 'denied',
          ad_user_data: p.marketing ? 'granted' : 'denied',
          ad_personalization: p.marketing ? 'granted' : 'denied',
          functionality_storage: p.functional ? 'granted' : 'denied',
          personalization_storage: p.functional ? 'granted' : 'denied',
          security_storage: 'granted'
        });
      } catch (e) {}
    })();
  `;
}

const AI_REFERRER_HOSTS = [
  "chatgpt.com",
  "chat.openai.com",
  "perplexity.ai",
  "claude.ai",
  "gemini.google.com",
  "copilot.microsoft.com",
  "you.com",
  "phind.com",
  "meta.ai",
];

function RouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPath = useRef("");

  useEffect(() => {
    const query = searchParams.toString();
    const path = `${pathname}${query ? `?${query}` : ""}`;
    if (pathname.startsWith("/admin") || lastPath.current === path) return;
    lastPath.current = path;
    trackPageView(path);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    if (typeof document === "undefined" || !document.referrer) return;
    if (sessionStorage.getItem("khayal-ai-referral")) return;
    try {
      const host = new URL(document.referrer).hostname.replace(/^www\./, "");
      const source = AI_REFERRER_HOSTS.find((h) => host === h || host.endsWith(`.${h}`));
      if (source) {
        sessionStorage.setItem("khayal-ai-referral", "true");
        trackMarketing("ai_referral", { source, page_path: pathname });
      }
    } catch {
      /* malformed referrer */
    }
  }, [pathname]);

  return null;
}

export default function AnalyticsProvider() {
  const pathname = usePathname();
  const { status, preferences, mounted } = useConsentContext();
  const { ga4Id, gtmId, metaPixelId, clarityProjectId } = siteConfig.analytics;

  useEffect(() => {
    if (!enabled || pathname.startsWith("/admin")) return;
    if (!mounted || status === "undecided") return;
    updateConsentMode(preferences);
    if (preferences.marketing) loadMetaPixelScript(metaPixelId);
    if (preferences.analytics) loadClarityScript(clarityProjectId);
  }, [mounted, pathname, status, preferences, metaPixelId, clarityProjectId]);

  if (!enabled || pathname.startsWith("/admin")) return null;

  return (
    <>
      {ga4Id && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
            strategy="afterInteractive"
          />
          <Script id="khayal-ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;${consentDefaultScript()}gtag('js',new Date());gtag('config','${ga4Id}',{send_page_view:false});`}
          </Script>
        </>
      )}
      {gtmId && (
        <Script id="khayal-gtm" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;${consentDefaultScript()}(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
        </Script>
      )}
      {metaPixelId && (
        <>
          <Script id="meta-pixel-base" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');`}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element -- plain 1x1 tracking pixel for no-JS fallback */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}
      <RouteTracker />
    </>
  );
}
