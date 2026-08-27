"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { logout } from "@/lib/session";

const navGroups = [
  {
    title: "Overview",
    links: [
      { label: "Dashboard", href: "/admin" },
    ],
  },
  {
    title: "Product Management",
    links: [
      { label: "Manage Products", href: "/admin/inventory" },
      { label: "Orders", href: "/admin/orders" },
    ],
  },
  {
    title: "Content",
    links: [
      { label: "Journal Posts", href: "/admin/posts" },
      { label: "Subscribers", href: "/admin/subscribers" },
    ],
  },
  {
    title: "User Management",
    links: [
      { label: "Sub-Admins", href: "/admin/users" },
    ],
  },
];

export default function AdminShell({
  user,
  children,
}: {
  user: { name: string; email: string; role: string } | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Sidebar */}
      <aside className="w-64 bg-pure border-r border-border flex flex-col fixed h-screen z-30">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/admin" className="font-serif-display text-ink text-lg font-medium tracking-tight">
            Khayal <span className="text-gold">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
          {navGroups.map((group) => (
            <div key={group.title}>
              <p className="px-3 text-[10px] font-semibold tracking-[0.15em] uppercase text-stone mb-2">
                {group.title}
              </p>
              <ul className="space-y-1">
                {group.links.map((link) => {
                  const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                          active
                            ? "bg-gold/10 text-gold font-medium"
                            : "text-stone hover:bg-cream-dark hover:text-ink"
                        }`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <form action={logout}>
            <button
              type="submit"
              className="w-full text-left px-3 py-2 text-sm text-stone hover:text-gold transition-colors"
            >
              Log out
            </button>
          </form>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top header */}
        <header className="h-16 bg-pure border-b border-border flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="relative w-80">
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-cream border border-border rounded-lg pl-3 pr-3 py-1.5 text-sm text-ink placeholder:text-stone-light focus:outline-none focus:border-gold"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-ink">{user?.name || "Admin"}</p>
              <p className="text-xs text-stone capitalize">{user?.role}</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-gold/20 text-gold flex items-center justify-center text-sm font-medium">
              {(user?.name || "A")[0]}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
