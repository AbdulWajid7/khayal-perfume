import { getSession } from "@/lib/auth";
import Link from "next/link";
import { logout } from "@/lib/session";

const adminLinks = [
  { label: "Dashboard", href: "/admin" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Inventory", href: "/admin/inventory" },
  { label: "Journal Posts", href: "/admin/posts" },
  { label: "Subscribers", href: "/admin/subscribers" },
  { label: "Sub-Admins", href: "/admin/users" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-cream text-ink">
      <nav className="sticky top-0 z-50 border-b border-border bg-pure/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 md:px-8 flex h-16 items-center justify-between">
          <Link href="/admin" className="font-serif-display text-ink text-xl font-medium tracking-tight">
            Khayal <span className="text-gold">Admin</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm">
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-stone hover:text-gold transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {session && (
              <form action={logout}>
                <button
                  type="submit"
                  className="text-stone hover:text-gold transition-colors"
                >
                  Logout
                </button>
              </form>
            )}
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 md:px-8 py-10">{children}</main>
    </div>
  );
}
