import { login } from "@/lib/session";

export const metadata = {
  title: "Admin Login | Khayal",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-midnight px-4">
      <form
        action={login as unknown as (formData: FormData) => void | Promise<void>}
        className="w-full max-w-md p-8 rounded-2xl border border-border-subtle bg-charcoal space-y-6"
      >
        <h1 className="text-parchment text-2xl font-medium">Khayal Admin</h1>
        <div>
          <label className="block text-parchment text-sm font-medium mb-1">Email</label>
          <input
            name="email"
            type="email"
            required
            className="w-full px-3 py-2 rounded bg-midnight border border-border-subtle text-parchment focus:outline-none focus:ring-1 focus:ring-oud-gold"
          />
        </div>
        <div>
          <label className="block text-parchment text-sm font-medium mb-1">Password</label>
          <input
            name="password"
            type="password"
            required
            className="w-full px-3 py-2 rounded bg-midnight border border-border-subtle text-parchment focus:outline-none focus:ring-1 focus:ring-oud-gold"
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 rounded bg-oud-gold text-midnight font-medium hover:opacity-90"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
