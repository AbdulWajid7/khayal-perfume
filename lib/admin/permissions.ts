"use server";

import { requireAuth } from "@/lib/auth";
import { hasPermission, type OrderPermission, type IUser } from "@/models/User";

export async function requireOrderPermission(permission: OrderPermission) {
  const session = await requireAuth(["admin", "editor"]);
  if (!session) {
    return { allowed: false, error: "Unauthorized" } as const;
  }
  const userLike: Pick<IUser, "role" | "permissions"> = {
    role: session.role,
    permissions: undefined,
  };
  if (!hasPermission(userLike, permission)) {
    return { allowed: false, error: `Permission denied: ${permission}` } as const;
  }
  return { allowed: true, session } as const;
}
