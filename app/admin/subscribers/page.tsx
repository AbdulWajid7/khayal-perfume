import { getSubscribersForAdmin } from "@/lib/subscribers";

export default async function SubscribersListPage() {
  const subscribers = await getSubscribersForAdmin();
  const activeEmails = subscribers
    .filter((s) => s.subscribed)
    .map((s) => s.email)
    .join(", ");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-parchment text-2xl font-medium">Newsletter Subscribers</h1>
        <span className="text-warm-taupe text-sm">
          {subscribers.length} subscriber{subscribers.length !== 1 ? "s" : ""}
        </span>
      </div>

      {activeEmails && (
        <div className="border border-border-subtle rounded-xl p-4 bg-charcoal space-y-3">
          <h2 className="text-parchment text-sm font-medium">Active email list (for campaigns)</h2>
          <p className="text-warm-taupe text-xs break-all font-mono">{activeEmails}</p>
        </div>
      )}

      <div className="border border-border-subtle rounded-xl overflow-hidden bg-charcoal">
        <table className="w-full text-left text-sm">
          <thead className="bg-midnight text-warm-taupe">
            <tr>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Subscribed on</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((subscriber) => (
              <tr key={subscriber._id} className="border-t border-border-subtle">
                <td className="px-4 py-3 text-parchment">{subscriber.email}</td>
                <td className="px-4 py-3 text-warm-taupe capitalize">{subscriber.source}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      subscriber.subscribed
                        ? "bg-green-900/40 text-green-100"
                        : "bg-amber-900/40 text-amber-100"
                    }`}
                  >
                    {subscriber.subscribed ? "Active" : "Unsubscribed"}
                  </span>
                </td>
                <td className="px-4 py-3 text-warm-taupe">
                  {new Date(subscriber.createdAt).toLocaleDateString("en-PK", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
              </tr>
            ))}
            {subscribers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-warm-taupe">
                  No subscribers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
