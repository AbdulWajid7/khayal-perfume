import { getWelcomeOffers } from "@/lib/admin/marketing";

export default async function WelcomeOffersPage() {
  const offers = await getWelcomeOffers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif-display text-ink text-3xl font-medium">Welcome Offers</h1>
        <p className="mt-1 text-stone text-sm">Generated first-order welcome codes.</p>
      </div>

      <div className="bg-pure border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream-dark text-stone">
            <tr>
              <th className="px-4 py-3 font-medium">Code Hint</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Issued</th>
              <th className="px-4 py-3 font-medium">Expires</th>
              <th className="px-4 py-3 font-medium">Redeemed</th>
              <th className="px-4 py-3 font-medium">Order</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => (
              <tr key={offer._id} className="border-t border-border">
                <td className="px-4 py-3 text-ink font-mono">{offer.codeHint}</td>
                <td className="px-4 py-3 text-stone">{offer.normalizedEmail}</td>
                <td className="px-4 py-3 text-stone capitalize">{offer.status}</td>
                <td className="px-4 py-3 text-stone">
                  {new Date(offer.issuedAt).toLocaleDateString("en-PK")}
                </td>
                <td className="px-4 py-3 text-stone">
                  {new Date(offer.expiresAt).toLocaleDateString("en-PK")}
                </td>
                <td className="px-4 py-3 text-stone">
                  {offer.redeemedAt ? new Date(offer.redeemedAt).toLocaleDateString("en-PK") : "—"}
                </td>
                <td className="px-4 py-3 text-stone">
                  {offer.orderId ? (
                    <a href={`/admin/orders/${offer.orderId}`} className="text-gold hover:text-gold-light">
                      View
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
            {offers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-stone">
                  No welcome offers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
