import { siteConfig } from "@/lib/site-config";

const socialLinks = [
  {
    label: "Instagram",
    href: siteConfig.social.instagram,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: siteConfig.social.facebook,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M14 9h3V6h-3c-1.66 0-3 1.34-3 3v2H8v3h3v6h3v-6h2.5l.5-3H14V9z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: siteConfig.social.tiktok,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M15 4v9.5a3.5 3.5 0 1 1-3.5-3.5" />
        <path d="M15 4c0 2.5 2 4.5 4.5 4.5" />
      </svg>
    ),
  },
  {
    label: "Pinterest",
    href: siteConfig.social.pinterest,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M11 8.5c2.6-.6 4.7.9 4.4 3.2-.3 2.2-2.1 3.2-3.4 2.6-.8-.4-1-1.2-.9-1.9" />
        <path d="M11.6 11 10 20" />
      </svg>
    ),
  },
  {
    label: "Threads",
    href: siteConfig.social.threads,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M16.5 11.2c-.4-2.3-2-3.6-4.3-3.6-2.6 0-4.2 1.8-4.2 4.4 0 2.8 1.7 4.6 4.3 4.6 2 0 3.5-1.1 3.5-2.8 0-1.9-1.9-2.7-4-2.4-1.5.2-2.3 1-2.2 2 .1 1 1 1.6 2.2 1.5 1.9-.1 2.8-1.6 2.8-4" />
        <path d="M19 12c0 4.4-2.8 7-7 7s-7-2.6-7-7 2.8-7 7-7c3.1 0 5.4 1.4 6.4 4" />
      </svg>
    ),
  },
];

export default function SocialIcons({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {socialLinks.map((social) => (
        <a
          key={social.label}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={social.label}
          className="text-stone hover:text-gold transition-colors"
        >
          <span className="block h-5 w-5">{social.icon}</span>
        </a>
      ))}
    </div>
  );
}
