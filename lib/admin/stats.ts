"use server";

import { dbConnect, toJSON } from "@/lib/mongoose";
import { requireAuth } from "@/lib/auth";
import { Product } from "@/models/Product";
import { Order, type IOrder } from "@/models/Order";
import { Subscriber } from "@/models/Subscriber";
import { Post } from "@/models/Post";
import { User } from "@/models/User";

export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  lowStock: number;
  totalOrders: number;
  pendingOrders: number;
  revenue: number;
  totalSubscribers: number;
  totalPosts: number;
  totalAdmins: number;
  ordersByDay: { date: string; count: number; revenue: number }[];
  revenueByMonth: { month: string; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
  recentOrders: IOrder[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const session = await requireAuth(["admin", "editor"]);
  if (!session) throw new Error("Unauthorized");
  await dbConnect();

  const [
    totalProducts,
    activeProducts,
    lowStock,
    totalOrders,
    pendingOrders,
    revenueResult,
    totalSubscribers,
    totalPosts,
    totalAdmins,
    ordersByDay,
    revenueByMonth,
    ordersByStatus,
    recentOrders,
  ] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ status: "active" }),
    Product.countDocuments({
      $expr: { $lte: ["$stock", { $ifNull: ["$lowStockThreshold", 5] }] },
    }),
    Order.countDocuments(),
    Order.countDocuments({ status: "pending" }),
    Order.aggregate([{ $group: { _id: null, total: { $sum: "$total" } } }]),
    Subscriber.countDocuments(),
    Post.countDocuments(),
    User.countDocuments(),
    getOrdersByDay(),
    getRevenueByMonth(),
    getOrdersByStatus(),
    getRecentOrders(),
  ]);

  return {
    totalProducts,
    activeProducts,
    lowStock,
    totalOrders,
    pendingOrders,
    revenue: revenueResult[0]?.total || 0,
    totalSubscribers,
    totalPosts,
    totalAdmins,
    ordersByDay,
    revenueByMonth,
    ordersByStatus,
    recentOrders,
  };
}

async function getOrdersByDay() {
  const start = new Date();
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);
  const orders = await Order.find({ createdAt: { $gte: start } }).lean();
  const byDay: Record<string, { count: number; revenue: number }> = {};

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split("T")[0];
    byDay[key] = { count: 0, revenue: 0 };
  }

  for (const order of toJSON(orders) || []) {
    const dateKey = new Date(order.createdAt).toISOString().split("T")[0];
    if (!byDay[dateKey]) byDay[dateKey] = { count: 0, revenue: 0 };
    byDay[dateKey].count += 1;
    byDay[dateKey].revenue += order.total || 0;
  }

  return Object.entries(byDay).map(([date, data]) => ({
    date,
    count: data.count,
    revenue: data.revenue,
  }));
}

async function getRevenueByMonth() {
  const start = new Date();
  start.setMonth(start.getMonth() - 5);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const orders = await Order.find({ createdAt: { $gte: start }, status: { $ne: "cancelled" } }).lean();
  const byMonth: Record<string, number> = {};

  for (let i = 0; i < 6; i++) {
    const d = new Date(start);
    d.setMonth(d.getMonth() + i);
    const key = d.toLocaleString("en-PK", { month: "short", year: "2-digit" });
    byMonth[key] = 0;
  }

  for (const order of toJSON(orders) || []) {
    const key = new Date(order.createdAt).toLocaleString("en-PK", {
      month: "short",
      year: "2-digit",
    });
    if (!byMonth[key]) byMonth[key] = 0;
    byMonth[key] += order.total || 0;
  }

  return Object.entries(byMonth).map(([month, revenue]) => ({
    month,
    revenue,
  }));
}

async function getOrdersByStatus(): Promise<{ status: string; count: number }[]> {
  const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
  const docs = await Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
  const typedDocs = docs as { _id: string; count: number }[];
  const map = new Map(typedDocs.map((d) => [d._id, d.count]));
  return statuses.map((status) => ({
    status,
    count: map.get(status) || 0,
  }));
}

async function getRecentOrders(): Promise<IOrder[]> {
  const orders = await Order.find().sort({ createdAt: -1 }).limit(6).lean();
  return toJSON(orders) as unknown as IOrder[];
}
