import Link from "next/link";
import { headers } from "next/headers";
import AdminShell from "@/components/admin/AdminShell";
import { getAdminUser } from "@/lib/admin/access";
import { lowStockCount } from "@/lib/admin/stock";
import { ADMIN_SECTIONS, homeFor, sectionForPath } from "@/lib/admin-sections";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get("x-pathname") || "/admin";
  // The login page renders without a session.
  if (pathname === "/admin/login") return <>{children}</>;

  const user = await getAdminUser();
  const section = sectionForPath(pathname);
  const allowed = !user || !section || user.sections.includes(section);
  let lowStock = 0;
  if (user?.sections.includes("stock")) {
    try {
      lowStock = await lowStockCount();
    } catch {
      lowStock = 0;
    }
  }

  return (
    <AdminShell
      user={user ? { name: user.name, email: user.email, role: user.role } : null}
      sections={user?.sections ?? []}
      badges={lowStock ? { "/admin/stock": lowStock } : {}}
    >
      {allowed ? (
        children
      ) : (
        <div className="max-w-xl">
          <h1 className="font-serif-display text-3xl text-ink mb-3">No access</h1>
          <p className="text-stone mb-5">
            Your account does not include{" "}
            <strong>{ADMIN_SECTIONS.find((s) => s.key === section)?.label}</strong>. Ask the owner to add it
            under Sub-Admins.
          </p>
          {user && homeFor(user) && (
            <Link href={homeFor(user)!} className="text-gold underline">
              Go to your first section
            </Link>
          )}
        </div>
      )}
    </AdminShell>
  );
}
