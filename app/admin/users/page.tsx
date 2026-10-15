import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth";
import { getUsers, createUser, deleteUser, updateUser } from "@/lib/admin/users";
import { effectiveSections, GRANTABLE_SECTIONS } from "@/lib/admin-sections";

export const metadata: Metadata = { title: "Sub-Admins | Khayal Admin" };
export const dynamic = "force-dynamic";

const card = "bg-pure border border-border rounded-2xl p-6 shadow-sm";

function SectionBoxes({ selected }: { selected: string[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {GRANTABLE_SECTIONS.map((s) => (
        <label key={s.key} className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" name="sections" value={s.key} defaultChecked={selected.includes(s.key)} />
          {s.label}
        </label>
      ))}
    </div>
  );
}

export default async function UsersPage() {
  const session = await requireAuth(["admin"]);
  if (!session) return <p className="text-stone">Only the owner can manage sub-admins.</p>;
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif-display text-ink text-3xl font-medium">Sub-Admins</h1>
        <p className="mt-1 text-stone text-sm max-w-3xl">
          Give each team member only the sections they need. Sub-admins never see Cost &amp; Profit (supplier
          prices and reference names) or this page. In Price &amp; Commission they see KHAYAL names, selling
          prices and commission only.
        </p>
      </div>

      <form action={createUser} className={`${card} space-y-4`}>
        <h2 className="text-ink font-medium">Add a team member</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input name="name" required placeholder="Full name" className="input-admin" />
          <input name="email" required type="email" placeholder="Email (their login)" className="input-admin" />
          <input name="password" required type="password" minLength={8} placeholder="Password (8+ characters)" className="input-admin" />
          <select name="role" defaultValue="editor" className="input-admin">
            <option value="editor">Sub-admin (choose sections)</option>
            <option value="admin">Owner (full access)</option>
          </select>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-stone mb-2">Sections this sub-admin can open</p>
          <SectionBoxes selected={["dashboard", "orders", "commission"]} />
        </div>
        <button type="submit" className="bg-gold text-pure rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-gold-light transition-colors">
          Create account
        </button>
      </form>

      <div className="space-y-4">
        {users.map((user) => {
          const isSelf = user.email === session.email;
          const sections = effectiveSections({ role: user.role, sections: user.sections });
          return (
            <div key={user._id} className={card}>
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-ink font-medium">
                    {user.name}{" "}
                    <span className={`ml-2 inline-flex px-2 py-0.5 rounded text-xs font-medium ${user.role === "admin" ? "bg-gold/20 text-gold" : "bg-stone/10 text-stone"}`}>
                      {user.role === "admin" ? "Owner" : "Sub-admin"}
                    </span>
                    {user.active === false && <span className="ml-2 inline-flex px-2 py-0.5 rounded text-xs bg-red-50 text-sale">Switched off</span>}
                  </p>
                  <p className="text-sm text-stone">{user.email}</p>
                </div>
                {!isSelf && (
                  <form action={deleteUser.bind(null, user._id)}>
                    <button type="submit" className="text-sale text-xs hover:opacity-80">Delete account</button>
                  </form>
                )}
              </div>
              <form action={updateUser.bind(null, user._id)} className="space-y-4">
                {user.role === "editor" ? (
                  <SectionBoxes selected={sections} />
                ) : (
                  <p className="text-sm text-stone">Owner accounts open every section.</p>
                )}
                <div className="flex flex-wrap items-center gap-4">
                  {!isSelf && (
                    <label className="flex items-center gap-2 text-sm text-ink">
                      <input type="checkbox" name="active" defaultChecked={user.active !== false} /> Can sign in
                    </label>
                  )}
                  <input name="password" type="password" minLength={8} placeholder="New password (optional)" className="input-admin max-w-xs" />
                  <button type="submit" className="border border-border rounded-lg px-4 py-2 text-sm hover:bg-cream">Save</button>
                </div>
              </form>
            </div>
          );
        })}
        {users.length === 0 && <p className="text-stone">No users yet.</p>}
      </div>
    </div>
  );
}
