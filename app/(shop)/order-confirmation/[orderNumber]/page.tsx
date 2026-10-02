import { notFound } from "next/navigation";
import { getOrderByAccessToken, getOrderByNumberAndPhone } from "@/lib/orders";
import { getEnabledBankTransferConfig } from "@/lib/admin/bank-config";
import OrderConfirmationClient from "@/components/checkout/OrderConfirmationClient";
import type { IOrder } from "@/models/Order";


export const metadata = {
  title: "Order Confirmation | KHAYAL Parfum",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function OrderConfirmationPage({ params, searchParams }: PageProps) {
  const { orderNumber } = await params;
  const query = await searchParams;
  const token = typeof query.token === "string" ? query.token : undefined;
  const phone = typeof query.phone === "string" ? query.phone : undefined;

  let order: IOrder | null = null;
  if (token) {
    order = await getOrderByAccessToken(token);
  } else if (phone) {
    order = await getOrderByNumberAndPhone(orderNumber, phone);
  }

  if (!order || order.orderNumber.toUpperCase() !== orderNumber.toUpperCase()) {
    notFound();
  }

  const bankConfig = await getEnabledBankTransferConfig();

  return (
    <main className="pt-32 pb-20 md:pt-40 md:pb-28 bg-cream min-h-screen">
      <div className="mx-auto max-w-3xl px-4 md:px-8 lg:px-12">
        <OrderConfirmationClient order={order} bankConfig={bankConfig || undefined} accessToken={token} />
      </div>
    </main>
  );
}
