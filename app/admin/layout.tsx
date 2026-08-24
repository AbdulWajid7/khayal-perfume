import { getSession } from "@/lib/auth";
import Link from "next/link";
import { logout } from "@/lib/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-midnight text-parchment">
      <nav className="border-b border-border-subtle bg-charcoal">
        <div className="mx-auto max-w-7xl px-4 md:px-8 flex h-14 items-center justify-between">
          <Link href="/admin" className="font-medium text-oud-gold">
            Khayal Admin
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/admin/posts" className="hover:text-oud-gold transition">
              Journal Posts
            </Link>
            {session && (
              <div className="flex items-center gap-4">
                <span className="text-warm-taupe">{session.name}</span>
                <form action={logout}>
                  <button
                    type="submit"
                    className="text-parchment hover:text-oud-gold transition"
                  >
                    Logout
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 md:px-8 py-10">{children}</main>
    </div>
  );
}
