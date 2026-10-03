import { dbConnect, toJSON } from "@/lib/mongoose";
import { AbandonedCart, type IAbandonedCart } from "@/models/AbandonedCart";
import { requireAuth } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cart Recovery | Khayal Admin",
};

async function getOpenCarts(): Promise<IAbandonedCart[]> {
  const session = await requireAuth(["admin", "editor"]);
  if (!session) return [];
  await dbConnect();
  const carts = await AbandonedCart.find({ status: "open" })
    .sort({ lastSeenAt: -1 })
    .limit(50)
    .lean();
  return (toJSON(carts) || []) as IAbandonedCart[];
}

function waRecoveryLink(cart: IAbandonedCart): string | null {
  const phone = (cart.phone || "").replace(/\D/g, "");
  if (!phone) return null;
  const normalized = phone.startsWith("92") ? phone : phone.startsWith("0") ? `92${phone.slice(1)}` : phone;
  const itemsList = cart.items.map((i) => `${i.title} × ${i.quantity}`).join(", ");
  const message = encodeURIComponent(
    `Assalamualaikum${cart.name ? ` ${cart.name}` : ""}! You left ${itemsList} in your KHAYAL cart. Can we help you complete your order? ${siteConfig.url}/checkout`
  );
  return `https://wa.me/${normalized}?text=${message}`;
}

export default async function CartRecoveryPage() {
  const carts = await getOpenCarts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif-display text-ink text-3xl font-medium">Cart Recovery</h1>
        <p className="text-stone text-sm mt-1">
          Customers who entered contact details at checkout but didn&apos;t finish. Reach out on WhatsApp.
        </p>
      </div>

      {carts.length === 0 ? (
        <p className="text-stone">No abandoned carts with contact details yet.</p>
      ) : (
        <div className="grid gap-4 max-w-3xl">
          {carts.map((cart) => {
            const waLink = waRecoveryLink(cart);
            return (
              <div key={cart._id} className="bg-pure border border-border rounded-xl p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-ink text-sm font-medium">{cart.name || "Unknown customer"}</p>
                    <p className="text-stone text-xs">
                      {cart.phone || cart.email} · {new Date(cart.lastSeenAt).toLocaleString("en-PK")}
                    </p>
                  </div>
                  <p className="text-gold font-medium tabular-nums">{formatPrice(cart.subtotal, "PKR")}</p>
                </div>
                <ul className="text-sm text-stone">
                  {cart.items.map((item, i) => (
                    <li key={i}>
                      {item.title}
                      {item.variantTitle ? ` — ${item.variantTitle}` : ""} × {item.quantity} ·{" "}
                      {formatPrice(item.price * item.quantity, "PKR")}
                    </li>
                  ))}
                </ul>
                {waLink && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs bg-[#25D366] text-white rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
                  >
                    Send WhatsApp reminder
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
