import mongoose, { Schema } from "mongoose";

export type UserRole = "admin" | "editor";

export type OrderPermission =
  | "orders.view"
  | "orders.create"
  | "orders.update"
  | "orders.cancel"
  | "orders.assignCourier"
  | "orders.verifyPayment"
  | "orders.rejectPayment"
  | "orders.viewPaymentProof"
  | "orders.export";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  permissions?: OrderPermission[];
  createdAt: string;
  updatedAt: string;
}

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "editor"], default: "editor" },
    permissions: { type: [String], default: undefined },
  },
  { timestamps: true }
);

export function defaultPermissions(role: UserRole): OrderPermission[] {
  if (role === "admin") {
    return [
      "orders.view",
      "orders.create",
      "orders.update",
      "orders.cancel",
      "orders.assignCourier",
      "orders.verifyPayment",
      "orders.rejectPayment",
      "orders.viewPaymentProof",
      "orders.export",
    ];
  }
  return ["orders.view", "orders.create", "orders.update"];
}

export function hasPermission(user: Pick<IUser, "role" | "permissions">, permission: OrderPermission): boolean {
  if (user.role === "admin" && !user.permissions) return true;
  const perms = user.permissions?.length ? user.permissions : defaultPermissions(user.role);
  return perms.includes(permission);
}

export const User = (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>("User", UserSchema);
