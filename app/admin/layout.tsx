import { getSession } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <AdminShell
      user={
        session
          ? { name: session.name, email: session.email, role: session.role }
          : null
      }
    >
      {children}
    </AdminShell>
  );
}
