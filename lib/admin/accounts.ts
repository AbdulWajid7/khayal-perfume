"use server";

import { revalidatePath } from "next/cache";
import { assertSection } from "@/lib/admin/access";
import { dbConnect } from "@/lib/mongoose";
import { Expense } from "@/models/Expense";
import { CapitalEntry } from "@/models/CapitalEntry";
import { Order } from "@/models/Order";
import { buildAccounts } from "@/lib/accounts-data";
import { cleanAccount, cleanCategory, PERIODS, type PeriodKey } from "@/lib/accounts";

const PAGE = "/admin/accounts";
const text = (f: FormData, k: string) => f.get(k)?.toString().trim() || "";
const amountOf = (f: FormData) => {
  const n = parseFloat(text(f, "amount").replace(/,/g, ""));
  if (!Number.isFinite(n) || n <= 0) throw new Error("Enter an amount");
  return Math.round(n * 100) / 100;
};
const dateOf = (f: FormData, k = "date") => {
  const d = text(f, k);
  return d ? new Date(`${d}T12:00:00+05:00`) : new Date();
};

/** Accounts are the owner's: never grantable to sub-admins. */
export async function getAccounts(period: string) {
  await assertSection("accounts");
  const p = (PERIODS.some((x) => x.key === period) ? period : "month") as PeriodKey;
  return buildAccounts(p);
}

export async function addExpense(formData: FormData) {
  const user = await assertSection("accounts");
  await dbConnect();
  const status = text(formData, "status") === "due" ? "due" : "paid";
  const description = text(formData, "description");
  if (!description) throw new Error("Describe the expense");
  await Expense.create({
    date: dateOf(formData),
    category: cleanCategory(text(formData, "category")),
    description,
    amount: amountOf(formData),
    account: cleanAccount(text(formData, "account")),
    vendor: text(formData, "vendor") || undefined,
    status,
    dueDate: status === "due" && text(formData, "dueDate") ? dateOf(formData, "dueDate") : undefined,
    paidAt: status === "paid" ? dateOf(formData) : undefined,
    note: text(formData, "note") || undefined,
    by: user.name,
  });
  revalidatePath(PAGE);
}

export async function markExpensePaid(id: string, formData: FormData) {
  await assertSection("accounts");
  await dbConnect();
  await Expense.updateOne(
    { _id: id },
    { $set: { status: "paid", paidAt: dateOf(formData), account: cleanAccount(text(formData, "account")) } }
  );
  revalidatePath(PAGE);
}

export async function deleteExpense(id: string) {
  await assertSection("accounts");
  await dbConnect();
  await Expense.deleteOne({ _id: id });
  revalidatePath(PAGE);
}

export async function addCapital(formData: FormData) {
  const user = await assertSection("accounts");
  await dbConnect();
  const person = text(formData, "person");
  if (!person) throw new Error("Whose money is it?");
  await CapitalEntry.create({
    type: text(formData, "type") === "withdrawal" ? "withdrawal" : "investment",
    person,
    amount: amountOf(formData),
    date: dateOf(formData),
    account: cleanAccount(text(formData, "account") || "bank"),
    note: text(formData, "note") || undefined,
    by: user.name,
  });
  revalidatePath(PAGE);
}

export async function deleteCapital(id: string) {
  await assertSection("accounts");
  await dbConnect();
  await CapitalEntry.deleteOne({ _id: id });
  revalidatePath(PAGE);
}

/** COD collected (or courier settled), or a transfer received: the money is in. */
export async function markPaymentReceived(orderId: string, formData: FormData) {
  const user = await assertSection("accounts");
  await dbConnect();
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");
  const account = cleanAccount(text(formData, "account"));
  const date = dateOf(formData);
  order.paymentStatus = "paid";
  order.paymentReceivedAt = date;
  order.paymentAccount = account;
  order.auditHistory.push({
    actor: user.name,
    actorId: user.id,
    action: "payment_received",
    after: { paymentStatus: "paid", paymentAccount: account },
    createdAt: new Date(),
  });
  await order.save();
  revalidatePath(PAGE);
  revalidatePath(`/admin/orders/${orderId}`);
}

/** One click for a courier settlement: every delivered COD order not yet marked paid. */
export async function markAllDeliveredReceived(formData: FormData) {
  const user = await assertSection("accounts");
  await dbConnect();
  const account = cleanAccount(text(formData, "account"));
  const date = dateOf(formData);
  await Order.updateMany(
    { orderStatus: "delivered", paymentMethod: "cod", paymentStatus: { $ne: "paid" }, paymentReceivedAt: { $exists: false } },
    {
      $set: { paymentStatus: "paid", paymentReceivedAt: date, paymentAccount: account },
      $push: { auditHistory: { actor: user.name, actorId: user.id, action: "payment_received", note: "Bulk: courier settlement", createdAt: new Date() } },
    }
  );
  revalidatePath(PAGE);
}
