import { getSubscribers } from "@/lib/admin/marketing";

export default async function SubscribersPage() {
  const subscribers = await getSubscribers();

  const statusLabel = (sub: { welcomeCodeStatus?: string; unsubscribed: boolean }) => {
    if (sub.unsubscribed) return "Unsubscribed";
    if (sub.welcomeCodeStatus === "redeemed") return "Redeemed";
    if (sub.welcomeCodeStatus === "issued" || sub.welcomeCodeStatus === "resent") return "Code Issued";
    return "Subscribed";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif-display text-ink text-3xl font-medium">Subscribers</h1>
        <p className="mt-1 text-stone text-sm">Newsletter and welcome-offer subscribers.</p>
      </div>

      <div className="bg-pure border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream-dark text-stone">
            <tr>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Code Status</th>
              <th className="px-4 py-3 font-medium">Issued</th>
              <th className="px-4 py-3 font-medium">Expires</th>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Delivery</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((sub) => (
              <tr key={sub._id} className="border-t border-border">
                <td className="px-4 py-3 text-ink">{sub.email}</td>
                <td className="px-4 py-3 text-stone capitalize">{sub.source}</td>
                <td className="px-4 py-3 text-stone">{sub.subscribed ? "Subscribed" : "Unsubscribed"}</td>
                <td className="px-4 py-3 text-stone">{statusLabel(sub)}</td>
                <td className="px-4 py-3 text-stone">
                  {sub.welcomeCodeIssuedAt ? new Date(sub.welcomeCodeIssuedAt).toLocaleDateString("en-PK") : "—"}
                </td>
                <td className="px-4 py-3 text-stone">
                  {sub.welcomeCodeExpiresAt ? new Date(sub.welcomeCodeExpiresAt).toLocaleDateString("en-PK") : "—"}
                </td>
                <td className="px-4 py-3 text-stone">
                  {sub.relatedOrderId ? (
                    <a href={`/admin/orders/${sub.relatedOrderId}`} className="text-gold hover:text-gold-light">
                      View
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-stone capitalize">{sub.emailDeliveryStatus}</td>
              </tr>
            ))}
            {subscribers.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-stone">
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
