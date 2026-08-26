"use server";

import { revalidatePath } from "next/cache";
import { dbConnect, toJSON } from "@/lib/mongoose";
import { requireAuth, hashPassword } from "@/lib/auth";
import { User, type IUser } from "@/models/User";

export async function getUsers(): Promise<IUser[]> {
  const session = await requireAuth(["admin"]);
  if (!session) throw new Error("Unauthorized");
  await dbConnect();
  const users = await User.find().sort({ createdAt: -1 }).lean();
  return toJSON(users) as unknown as IUser[];
}

export async function createUser(formData: FormData) {
  const session = await requireAuth(["admin"]);
  if (!session) throw new Error("Unauthorized");
  await dbConnect();

  const name = getString(formData, "name");
  const email = getString(formData, "email").toLowerCase().trim();
  const password = getString(formData, "password");
  const role = getString(formData, "role") as "admin" | "editor";

  if (!name || !email || !password || !role) {
    throw new Error("All fields are required");
  }

  const existing = await User.findOne({ email });
  if (existing) throw new Error("A user with this email already exists");

  const passwordHash = await hashPassword(password);
  await User.create({ name, email, passwordHash, role });

  revalidatePath("/admin/users");
}

export async function deleteUser(id: string) {
  const session = await requireAuth(["admin"]);
  if (!session) throw new Error("Unauthorized");
  await dbConnect();

  const user = await User.findById(id);
  if (user?.email === session.email) {
    throw new Error("You cannot delete your own account");
  }

  await User.findByIdAndDelete(id);
  revalidatePath("/admin/users");
}

function getString(formData: FormData, name: string) {
  return formData.get(name)?.toString().trim() || "";
}
