"use server";

import { getSession } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import { hasPermission, User, type OrderPermission } from "@/models/User";
import { canAccess, type AdminSection } from "@/lib/admin-sections";

/**
 * Order-level permission check, scoped to the admin section the action belongs to
 * (orders by default; payment settings and the WhatsApp inbox reuse it).
 */
export async function requireOrderPermission(permission: OrderPermission, section: AdminSection = "orders") {
  const session = await getSession();
  if (!session) {
    return { allowed: false, error: "Unauthorized" } as const;
  }
  await dbConnect();
  const user = await User.findById(session.id).select("role permissions sections active").lean();
  if (!user || user.active === false) {
    return { allowed: false, error: "Unauthorized" } as const;
  }
  if (!canAccess({ role: user.role, sections: user.sections }, section)) {
    return { allowed: false, error: "You do not have access to this section" } as const;
  }
  if (!hasPermission({ role: user.role, permissions: user.permissions }, permission)) {
    return { allowed: false, error: `Permission denied: ${permission}` } as const;
  }
  return { allowed: true, session } as const;
}
