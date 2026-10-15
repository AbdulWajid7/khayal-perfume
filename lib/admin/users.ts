"use server";

import { revalidatePath } from "next/cache";
import { dbConnect, toJSON } from "@/lib/mongoose";
import { requireAuth, hashPassword } from "@/lib/auth";
import { User, type IUser } from "@/models/User";
import { sanitizeSections } from "@/lib/admin-sections";

/** Only the owner (role admin) manages sub-admins. */
async function guard() {
  const session = await requireAuth(["admin"]);
  if (!session) throw new Error("Only the owner can manage sub-admins");
  return session;
}

export async function getUsers(): Promise<IUser[]> {
  await guard();
  await dbConnect();
  const users = await User.find().select("-passwordHash").sort({ createdAt: -1 }).lean();
  return toJSON(users) as unknown as IUser[];
}

export async function createUser(formData: FormData) {
  await guard();
  await dbConnect();

  const name = getString(formData, "name");
  const email = getString(formData, "email").toLowerCase().trim();
  const password = getString(formData, "password");
  const role = getString(formData, "role") === "admin" ? "admin" : "editor";

  if (!name || !email || !password) throw new Error("Name, email and password are required");
  if (password.length < 8) throw new Error("Password must be at least 8 characters");

  const existing = await User.findOne({ email });
  if (existing) throw new Error("A user with this email already exists");

  const passwordHash = await hashPassword(password);
  await User.create({
    name,
    email,
    passwordHash,
    role,
    sections: role === "editor" ? sanitizeSections(formData.getAll("sections")) : undefined,
    active: true,
  });

  revalidatePath("/admin/users");
}

/** Saves a sub-admin's section rights, on/off switch and (optionally) a new password. */
export async function updateUser(id: string, formData: FormData) {
  const session = await guard();
  await dbConnect();
  const user = await User.findById(id);
  if (!user) throw new Error("User not found");

  const isSelf = user.email === session.email;
  if (user.role === "editor") {
    user.sections = sanitizeSections(formData.getAll("sections"));
  }
  if (!isSelf) user.active = formData.get("active") === "on";

  const password = getString(formData, "password");
  if (password) {
    if (password.length < 8) throw new Error("Password must be at least 8 characters");
    user.passwordHash = await hashPassword(password);
  }
  await user.save();
  revalidatePath("/admin/users");
}

export async function deleteUser(id: string) {
  const session = await guard();
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
