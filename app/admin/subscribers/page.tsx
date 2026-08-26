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
        <h1 className="font-serif-display text-ink text-3xl font-medium">Newsletter Subscribers</h1>
        <span className="text-stone text-sm">
          {subscribers.length} subscriber{subscribers.length !== 1 ? "s" : ""}
        </span>
      </div>

      {activeEmails && (
        <div className="bg-pure border border-border rounded-2xl p-4 space-y-3 shadow-sm">
          <h2 className="text-ink text-sm font-medium">Active email list (for campaigns)</h2>
          <p className="text-stone text-xs break-all font-mono">{activeEmails}</p>
        </div>
      )}

      <div className="bg-pure border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream-dark text-stone">
            <tr>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Subscribed on</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((subscriber) => (
              <tr key={subscriber._id} className="border-t border-border">
                <td className="px-4 py-3 text-ink">{subscriber.email}</td>
                <td className="px-4 py-3 text-stone capitalize">{subscriber.source}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      subscriber.subscribed
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {subscriber.subscribed ? "Active" : "Unsubscribed"}
                  </span>
                </td>
                <td className="px-4 py-3 text-stone">
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
                <td colSpan={4} className="px-4 py-8 text-center text-stone">
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
