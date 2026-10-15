import { getSession, type SessionUser } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import { User } from "@/models/User";
import { canAccess, effectiveSections, type AdminSection } from "@/lib/admin-sections";

export interface AdminUser extends SessionUser {
  sections: AdminSection[];
}

/**
 * The signed-in admin, read fresh from the database on every call so a change of
 * rights (or switching an account off) applies at once, not at the next login.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const session = await getSession();
  if (!session) return null;
  await dbConnect();
  const user = await User.findById(session.id).select("role sections active name email").lean();
  if (!user || user.active === false) return null;
  const role = user.role;
  return {
    id: session.id,
    email: user.email,
    name: user.name,
    role,
    sections: effectiveSections({ role, sections: user.sections }),
  };
}

/** The admin if they may open this section, otherwise null. */
export async function requireSection(section: AdminSection): Promise<AdminUser | null> {
  const user = await getAdminUser();
  if (!user) return null;
  return canAccess(user, section) ? user : null;
}

/** Same, but throws: for server actions that must not run without the right. */
export async function assertSection(section: AdminSection): Promise<AdminUser> {
  const user = await requireSection(section);
  if (!user) throw new Error("You do not have access to this section");
  return user;
}
