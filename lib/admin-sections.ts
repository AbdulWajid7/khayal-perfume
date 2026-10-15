/**
 * Admin sections and who may open them. Pure and shared by the server guards,
 * the admin layout and the sidebar.
 *
 * - The owner (role "admin") opens everything.
 * - A sub-admin (role "editor") opens only the sections ticked for them.
 * - Owner-only sections (costs with supplier prices and reference names, sub-admin
 *   management) can never be granted.
 */
export const ADMIN_SECTIONS = [
  { key: "dashboard", label: "Dashboard", paths: ["/admin"], exact: true },
  { key: "products", label: "Manage Products", paths: ["/admin/inventory"] },
  { key: "orders", label: "Orders", paths: ["/admin/orders"] },
  { key: "stock", label: "Stock & Supplies", paths: ["/admin/stock"] },
  { key: "recovery", label: "Cart Recovery", paths: ["/admin/recovery"] },
  { key: "payments", label: "Payment Settings", paths: ["/admin/payments"] },
  { key: "commission", label: "Price & Commission", paths: ["/admin/commission"] },
  { key: "whatsapp", label: "WhatsApp Assistant", paths: ["/admin/whatsapp"] },
  { key: "posts", label: "Journal Posts", paths: ["/admin/posts"] },
  { key: "subscribers", label: "Subscribers", paths: ["/admin/subscribers", "/admin/marketing/subscribers"] },
  { key: "coupons", label: "Discount Codes", paths: ["/admin/coupons"] },
  { key: "promoters", label: "Promoters", paths: ["/admin/promoters"] },
  { key: "marketing", label: "Welcome Offers", paths: ["/admin/marketing"] },
  { key: "accounts", label: "Accounts", paths: ["/admin/accounts"], ownerOnly: true },
  { key: "costs", label: "Cost & Profit", paths: ["/admin/costs"], ownerOnly: true },
  { key: "users", label: "Sub-Admins", paths: ["/admin/users"], ownerOnly: true },
] as const;

export type AdminSection = (typeof ADMIN_SECTIONS)[number]["key"];

export const ALL_SECTION_KEYS = ADMIN_SECTIONS.map((s) => s.key) as AdminSection[];

/** Sections a sub-admin can be given. */
export const GRANTABLE_SECTIONS = ADMIN_SECTIONS.filter((s) => !("ownerOnly" in s && s.ownerOnly));

/**
 * Sub-admins created before section rights existed keep what they could open before
 * (everything an editor could reach), until the owner edits them.
 */
export const LEGACY_EDITOR_SECTIONS: AdminSection[] = [
  "dashboard",
  "products",
  "orders",
  "recovery",
  "payments",
  "whatsapp",
  "posts",
  "subscribers",
];

export interface SectionUser {
  role: "admin" | "editor";
  sections?: string[] | null;
}

export function isGrantable(key: string): key is AdminSection {
  return GRANTABLE_SECTIONS.some((s) => s.key === key);
}

/** Cleans a submitted list down to grantable section keys, no duplicates. */
export function sanitizeSections(input: unknown[]): AdminSection[] {
  const keys = input.map((v) => String(v)).filter(isGrantable);
  return [...new Set(keys)];
}

export function effectiveSections(user: SectionUser): AdminSection[] {
  if (user.role === "admin") return [...ALL_SECTION_KEYS];
  if (!user.sections) return [...LEGACY_EDITOR_SECTIONS];
  return sanitizeSections(user.sections);
}

export function canAccess(user: SectionUser, section: AdminSection): boolean {
  return effectiveSections(user).includes(section);
}

/** Which section a URL belongs to (longest matching path wins). Null for login and unknown paths. */
export function sectionForPath(pathname: string): AdminSection | null {
  const path = pathname.replace(/\/+$/, "") || "/";
  let best: { key: AdminSection; len: number } | null = null;
  for (const s of ADMIN_SECTIONS) {
    for (const p of s.paths) {
      const exact = "exact" in s && s.exact;
      const hit = exact ? path === p : path === p || path.startsWith(`${p}/`);
      if (hit && (!best || p.length > best.len)) best = { key: s.key, len: p.length };
    }
  }
  return best?.key ?? null;
}

/** First page a user may open (where to send them after login or a refused page). */
export function homeFor(user: SectionUser): string | null {
  const allowed = effectiveSections(user);
  const first = ADMIN_SECTIONS.find((s) => allowed.includes(s.key));
  return first ? first.paths[0] : null;
}
