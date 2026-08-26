import { getUsers, createUser, deleteUser } from "@/lib/admin/users";

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif-display text-ink text-3xl font-medium">Sub-Admins</h1>
        <p className="mt-1 text-stone text-sm">Create and manage team members who can access the admin panel.</p>
      </div>

      <form
        action={createUser}
        className="bg-pure border border-border rounded-2xl p-6 space-y-4 shadow-sm"
      >
        <h2 className="text-ink font-medium">Create New User</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <input name="name" required placeholder="Full name" className="input-admin" />
          <input name="email" required type="email" placeholder="Email" className="input-admin" />
          <input name="password" required type="password" placeholder="Password" className="input-admin" />
          <select name="role" defaultValue="editor" className="input-admin">
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            className="bg-gold text-pure rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-gold-light transition-colors"
          >
            Create User
          </button>
        </div>
      </form>

      <div className="bg-pure border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream-dark text-stone">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-t border-border">
                <td className="px-4 py-3 text-ink font-medium">{user.name}</td>
                <td className="px-4 py-3 text-stone">{user.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      user.role === "admin"
                        ? "bg-gold/20 text-gold"
                        : "bg-stone/10 text-stone"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteUser.bind(null, user._id)}>
                    <button type="submit" className="text-sale text-xs hover:opacity-80">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-stone">
                  No users yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
