/**
 * Takes packing supplies out of stock when an order is packed or dispatched.
 * Server module (not a server action). Runs once per order (Order.suppliesUsedAt).
 */
import { dbConnect } from "@/lib/mongoose";
import { StockItem } from "@/models/StockItem";
import { StockMovement } from "@/models/StockMovement";
import { Order } from "@/models/Order";
import { orderUsage } from "@/lib/stock";

export async function takeSuppliesForOrder(orderId: string, by?: string): Promise<number> {
  await dbConnect();
  // Claim the order atomically so two clicks never take supplies twice.
  const order = await Order.findOneAndUpdate(
    { _id: orderId, suppliesUsedAt: { $exists: false } },
    { $set: { suppliesUsedAt: new Date() } },
    { new: true }
  )
    .select("orderNumber items")
    .lean();
  if (!order) return 0;

  const bottles = order.items.reduce((s, i) => s + (Number(i.quantity) || 0), 0);
  const items = await StockItem.find({ active: true, usageBasis: { $ne: "none" }, usageQty: { $gt: 0 } }).lean();
  const usage = orderUsage(
    items.map((i) => ({ id: String(i._id), usageBasis: i.usageBasis, usageQty: i.usageQty })),
    bottles
  );
  for (const u of usage) {
    const item = await StockItem.findByIdAndUpdate(u.id, { $inc: { quantity: -u.quantity } }, { new: true }).lean();
    if (!item) continue;
    await StockMovement.create({
      itemKind: "supply",
      itemId: u.id,
      itemName: item.name,
      category: item.category,
      type: "order",
      quantity: -u.quantity,
      unit: item.unit,
      unitCost: item.avgUnitCost,
      totalCost: Math.round(item.avgUnitCost * u.quantity * 100) / 100,
      orderNumber: order.orderNumber,
      balanceAfter: item.quantity,
      date: new Date(),
      by,
      reason: "Packed for order",
    });
  }
  return usage.length;
}
