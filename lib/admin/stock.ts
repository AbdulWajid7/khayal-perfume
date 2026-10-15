"use server";

import { revalidatePath } from "next/cache";
import { assertSection } from "@/lib/admin/access";
import { dbConnect, toJSON } from "@/lib/mongoose";
import { StockItem, type IStockItem, type StockCategory, type UsageBasis } from "@/models/StockItem";
import { StockMovement, type IStockMovement } from "@/models/StockMovement";
import { Product } from "@/models/Product";
import { isLow, purchasePrice, standardSupplies, weightedAverage } from "@/lib/stock";

const PAGE = "/admin/stock";
const CATEGORIES: StockCategory[] = ["oil", "bottle", "box", "tester", "packaging", "shipping", "other"];
const BASES: UsageBasis[] = ["none", "per_order", "per_bottle"];

const text = (f: FormData, k: string) => f.get(k)?.toString().trim() || "";
const num = (f: FormData, k: string) => {
  const n = parseFloat(text(f, k).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};
const dateOf = (f: FormData) => {
  const d = text(f, "date");
  return d ? new Date(`${d}T12:00:00+05:00`) : new Date();
};

export interface StockProduct {
  id: string;
  title: string;
  status: string;
  stock: number;
  lowStockThreshold: number;
  low: boolean;
}

export interface StockOverview {
  isOwner: boolean;
  products: StockProduct[];
  items: (IStockItem & { low: boolean; value?: number })[];
  movements: IStockMovement[];
  alerts: { name: string; quantity: number; unit: string; lowStockAt: number }[];
  stockValue?: number;
}

/** Sub-admins with this section see counts; prices, averages and value are owner-only. */
export async function getStockOverview(): Promise<StockOverview> {
  const user = await assertSection("stock");
  const isOwner = user.role === "admin";
  await dbConnect();
  const [productDocs, itemDocs, movementDocs] = await Promise.all([
    Product.find({ status: { $ne: "archived" } }).select("title status stock lowStockThreshold").sort({ title: 1 }).lean(),
    StockItem.find({ active: true }).sort({ category: 1, name: 1 }).lean(),
    StockMovement.find().sort({ date: -1, createdAt: -1 }).limit(60).lean(),
  ]);

  const products = productDocs.map((p) => ({
    id: String(p._id),
    title: p.title,
    status: p.status,
    stock: p.stock ?? 0,
    lowStockThreshold: p.lowStockThreshold ?? 5,
    low: (p.stock ?? 0) <= (p.lowStockThreshold ?? 5),
  }));
  const items = (toJSON(itemDocs) as unknown as IStockItem[]).map((i) => ({
    ...i,
    avgUnitCost: isOwner ? i.avgUnitCost : 0,
    low: isLow(i.quantity, i.lowStockAt),
    value: isOwner ? Math.round(Math.max(0, i.quantity) * i.avgUnitCost) : undefined,
  }));
  const movements = (toJSON(movementDocs) as unknown as IStockMovement[]).map((m) =>
    isOwner ? m : { ...m, unitCost: undefined, totalCost: undefined }
  );
  const alerts = [
    ...products
      .filter((p) => p.low && p.status === "active")
      .map((p) => ({ name: `${p.title} (ready to sell)`, quantity: p.stock, unit: "bottles", lowStockAt: p.lowStockThreshold })),
    ...items.filter((i) => i.low).map((i) => ({ name: i.name, quantity: i.quantity, unit: i.unit, lowStockAt: i.lowStockAt })),
  ];
  return {
    isOwner,
    products,
    items,
    movements,
    alerts,
    stockValue: isOwner ? items.reduce((s, i) => s + (i.value || 0), 0) : undefined,
  };
}

/** Count for the sidebar badge. */
export async function lowStockCount(): Promise<number> {
  await assertSection("stock");
  await dbConnect();
  const [items, products] = await Promise.all([
    StockItem.find({ active: true, lowStockAt: { $gt: 0 } }).select("quantity lowStockAt").lean(),
    Product.find({ status: "active" }).select("stock lowStockThreshold").lean(),
  ]);
  return (
    items.filter((i) => isLow(i.quantity, i.lowStockAt)).length +
    products.filter((p) => (p.stock ?? 0) <= (p.lowStockThreshold ?? 5)).length
  );
}

function itemFields(formData: FormData) {
  const category = text(formData, "category") as StockCategory;
  const usageBasis = text(formData, "usageBasis") as UsageBasis;
  return {
    name: text(formData, "name"),
    category: CATEGORIES.includes(category) ? category : "other",
    unit: text(formData, "unit") || "pcs",
    lowStockAt: Math.max(0, num(formData, "lowStockAt")),
    usageBasis: BASES.includes(usageBasis) ? usageBasis : "none",
    usageQty: Math.max(0, num(formData, "usageQty")),
    supplier: text(formData, "supplier") || undefined,
    sku: text(formData, "sku") || undefined,
    notes: text(formData, "notes") || undefined,
  };
}

export async function addStockItem(formData: FormData) {
  const user = await assertSection("stock");
  await dbConnect();
  const fields = itemFields(formData);
  if (!fields.name) throw new Error("Give the item a name");
  const opening = Math.max(0, num(formData, "quantity"));
  const price = purchasePriceOrZero(opening, num(formData, "unitPrice"));
  const item = await StockItem.create({ ...fields, quantity: opening, avgUnitCost: price?.unitCost ?? 0 });
  if (opening > 0) {
    await StockMovement.create({
      itemKind: "supply",
      itemId: String(item._id),
      itemName: item.name,
      category: item.category,
      type: "purchase",
      quantity: opening,
      unit: item.unit,
      unitCost: price?.unitCost,
      totalCost: price?.totalCost,
      supplier: fields.supplier,
      reason: "Opening stock",
      balanceAfter: opening,
      date: new Date(),
      by: user.name,
    });
  }
  revalidatePath(PAGE);
}

function purchasePriceOrZero(qty: number, unitPrice: number) {
  return qty > 0 ? purchasePrice(qty, unitPrice) : { unitCost: Math.max(0, unitPrice), totalCost: 0 };
}

export async function updateStockItem(id: string, formData: FormData) {
  await assertSection("stock");
  await dbConnect();
  const fields = itemFields(formData);
  if (!fields.name) throw new Error("Give the item a name");
  await StockItem.updateOne({ _id: id }, { $set: fields });
  revalidatePath(PAGE);
}

export async function archiveStockItem(id: string) {
  const user = await assertSection("stock");
  if (user.role !== "admin") throw new Error("Only the owner can remove items");
  await dbConnect();
  await StockItem.updateOne({ _id: id }, { $set: { active: false } });
  revalidatePath(PAGE);
}

/** Adds KHAYAL's standard supplies that are not there yet (by name). */
export async function addStandardSupplies() {
  await assertSection("stock");
  await dbConnect();
  const existing = new Set((await StockItem.find().select("name").lean()).map((i) => i.name.toLowerCase()));
  const missing = standardSupplies().filter((s) => !existing.has(s.name.toLowerCase()));
  if (missing.length) await StockItem.insertMany(missing.map((s) => ({ ...s, quantity: 0, avgUnitCost: 0, active: true })));
  revalidatePath(PAGE);
}

/** Changes a website product's stock (and its single variant) and returns the new count. */
async function changeProductStock(productId: string, delta: number): Promise<{ title: string; stock: number }> {
  const product = await Product.findById(productId);
  if (!product) throw new Error("Product not found");
  const next = Math.max(0, (product.stock ?? 0) + delta);
  product.stock = next;
  if (product.variants?.length === 1) {
    product.variants[0].stock = next;
    product.variants[0].availableForSale = next > 0;
  }
  await product.save();
  return { title: product.title, stock: next };
}

/** target is "supply:<id>" or "product:<id>". */
function parseTarget(raw: string) {
  const [kind, id] = raw.split(":");
  if ((kind !== "supply" && kind !== "product") || !id) throw new Error("Choose an item");
  return { kind: kind as "supply" | "product", id };
}

/** Stock bought: adds the quantity and records what was paid (for accounts). */
export async function recordPurchase(formData: FormData) {
  const user = await assertSection("stock");
  await dbConnect();
  const target = parseTarget(text(formData, "target"));
  const qty = num(formData, "quantity");
  const price = purchasePrice(qty, num(formData, "unitPrice"), num(formData, "totalPrice"));
  const supplier = text(formData, "supplier") || undefined;
  const base = {
    type: "purchase" as const,
    quantity: qty,
    unitCost: price.unitCost,
    totalCost: price.totalCost,
    supplier,
    note: text(formData, "note") || undefined,
    date: dateOf(formData),
    by: user.name,
  };

  if (target.kind === "supply") {
    const item = await StockItem.findById(target.id);
    if (!item) throw new Error("Item not found");
    item.avgUnitCost = weightedAverage(item.quantity, item.avgUnitCost, qty, price.unitCost);
    item.quantity = item.quantity + qty;
    if (supplier) item.supplier = supplier;
    await item.save();
    await StockMovement.create({ ...base, itemKind: "supply", itemId: target.id, itemName: item.name, category: item.category, unit: item.unit, balanceAfter: item.quantity });
  } else {
    const p = await changeProductStock(target.id, qty);
    await StockMovement.create({ ...base, itemKind: "product", itemId: target.id, itemName: p.title, category: "perfume", unit: "bottles", balanceAfter: p.stock });
  }
  revalidatePath(PAGE);
}

/** Count corrections, breakage, giveaways (e.g. testers at The Terrace). */
export async function adjustStock(formData: FormData) {
  const user = await assertSection("stock");
  await dbConnect();
  const target = parseTarget(text(formData, "target"));
  const mode = text(formData, "mode"); // "set" | "remove" | "add"
  const amount = num(formData, "amount");
  const reason = text(formData, "reason") || "Adjustment";
  if (amount < 0) throw new Error("Use a positive number");

  if (target.kind === "supply") {
    const item = await StockItem.findById(target.id);
    if (!item) throw new Error("Item not found");
    const delta = mode === "set" ? amount - item.quantity : mode === "add" ? amount : -amount;
    item.quantity = item.quantity + delta;
    await item.save();
    await StockMovement.create({
      itemKind: "supply", itemId: target.id, itemName: item.name, category: item.category, type: "adjust",
      quantity: delta, unit: item.unit, reason, note: text(formData, "note") || undefined,
      unitCost: item.avgUnitCost, totalCost: Math.round(Math.abs(delta) * item.avgUnitCost * 100) / 100,
      balanceAfter: item.quantity, date: dateOf(formData), by: user.name,
    });
  } else {
    const product = await Product.findById(target.id).select("stock").lean();
    if (!product) throw new Error("Product not found");
    const current = product.stock ?? 0;
    const delta = mode === "set" ? amount - current : mode === "add" ? amount : -amount;
    const p = await changeProductStock(target.id, delta);
    await StockMovement.create({
      itemKind: "product", itemId: target.id, itemName: p.title, category: "perfume", type: "adjust",
      quantity: p.stock - current, unit: "bottles", reason, note: text(formData, "note") || undefined,
      balanceAfter: p.stock, date: dateOf(formData), by: user.name,
    });
  }
  revalidatePath(PAGE);
}

/** Filling bottles: oil and empty bottles out, ready-to-sell perfume in. */
export async function fillBottles(formData: FormData) {
  const user = await assertSection("stock");
  await dbConnect();
  const productId = text(formData, "productId");
  const qty = Math.floor(num(formData, "quantity"));
  const mlEach = num(formData, "mlEach") || 50;
  if (!productId || qty <= 0) throw new Error("Choose the perfume and how many bottles");
  const date = dateOf(formData);
  const used: { id: string; amount: number }[] = [];
  const oilId = text(formData, "oilId");
  const bottleId = text(formData, "bottleId");
  if (oilId) used.push({ id: oilId, amount: qty * mlEach });
  if (bottleId) used.push({ id: bottleId, amount: qty });

  let costPerBottle = 0;
  for (const u of used) {
    const item = await StockItem.findByIdAndUpdate(u.id, { $inc: { quantity: -u.amount } }, { new: true });
    if (!item) continue;
    costPerBottle += (item.avgUnitCost * u.amount) / qty;
    await StockMovement.create({
      itemKind: "supply", itemId: u.id, itemName: item.name, category: item.category, type: "fill",
      quantity: -u.amount, unit: item.unit, unitCost: item.avgUnitCost,
      totalCost: Math.round(item.avgUnitCost * u.amount * 100) / 100, reason: "Used to fill bottles",
      balanceAfter: item.quantity, date, by: user.name,
    });
  }
  const p = await changeProductStock(productId, qty);
  await StockMovement.create({
    itemKind: "product", itemId: productId, itemName: p.title, category: "perfume", type: "fill",
    quantity: qty, unit: "bottles", unitCost: Math.round(costPerBottle * 100) / 100,
    reason: `Filled ${qty} × ${mlEach} ml`, balanceAfter: p.stock, date, by: user.name,
  });
  revalidatePath(PAGE);
}

export async function setProductLowAlert(productId: string, formData: FormData) {
  await assertSection("stock");
  await dbConnect();
  await Product.updateOne({ _id: productId }, { $set: { lowStockThreshold: Math.max(0, num(formData, "lowStockThreshold")) } });
  revalidatePath(PAGE);
}

export interface PurchaseReport {
  month: string;
  total: number;
  byCategory: { category: string; total: number }[];
  rows: IStockMovement[];
}

/** Owner only: what was spent on stock in a month (for accounts). */
export async function getPurchaseReport(month: string): Promise<PurchaseReport> {
  const user = await assertSection("stock");
  if (user.role !== "admin") throw new Error("Only the owner sees spending");
  await dbConnect();
  const m = /^\d{4}-\d{2}$/.test(month) ? month : new Date().toISOString().slice(0, 7);
  const start = new Date(`${m}-01T00:00:00+05:00`);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  const docs = await StockMovement.find({ type: "purchase", date: { $gte: start, $lt: end } }).sort({ date: -1 }).lean();
  const rows = toJSON(docs) as unknown as IStockMovement[];
  const map = new Map<string, number>();
  for (const r of rows) map.set(r.category, (map.get(r.category) || 0) + (r.totalCost || 0));
  return {
    month: m,
    total: Math.round(rows.reduce((s, r) => s + (r.totalCost || 0), 0)),
    byCategory: [...map.entries()].map(([category, total]) => ({ category, total: Math.round(total) })).sort((a, b) => b.total - a.total),
    rows,
  };
}
