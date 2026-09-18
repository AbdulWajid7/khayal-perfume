"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { trackPageView } from "@/lib/analytics";
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
      <RouteTracker />
    </>
  );
}
