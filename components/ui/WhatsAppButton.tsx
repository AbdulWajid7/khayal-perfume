"use client";

import { usePathname } from "next/navigation";
import { getWhatsAppUrl, siteConfig } from "@/lib/site-config";
import { trackMarketing } from "@/lib/analytics";

export default function WhatsAppButton() {
  const pathname = usePathname();
  const isProductPage = /^\/shop\/[^/]+$/.test(pathname);
  const message = `Assalamualaikum, I need help choosing or ordering a KHAYAL fragrance. ${siteConfig.url}`;

  return (
    <a
      href={getWhatsAppUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackMarketing("whatsapp_click", { placement: "floating_button" })}
      className={`fixed ${isProductPage ? "bottom-24" : "bottom-5"} right-5 z-[75] inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 focus-visible:scale-105 md:bottom-7 md:right-7`}
      aria-label="Chat with KHAYAL on WhatsApp"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.52 3.48A11.8 11.8 0 0 0 12.1 0C5.56 0 .24 5.32.24 11.86c0 2.09.55 4.13 1.59 5.93L.14 24l6.35-1.66a11.86 11.86 0 0 0 5.6 1.42h.01c6.54 0 11.86-5.32 11.86-11.86 0-3.17-1.22-6.16-3.44-8.42Zm-8.42 18.3h-.01a9.88 9.88 0 0 1-5.04-1.38l-.36-.21-3.77.99 1.01-3.68-.24-.38a9.85 9.85 0 0 1-1.51-5.26c0-5.47 4.45-9.92 9.93-9.92a9.86 9.86 0 0 1 7.02 2.91 9.86 9.86 0 0 1 2.9 7.03c-.01 5.46-4.46 9.9-9.93 9.9Zm5.44-7.43c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.49a8.97 8.97 0 0 1-1.66-2.06c-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.21 5.1 4.5.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.12-.27-.19-.57-.34Z" />
      </svg>
    </a>
  );
}
