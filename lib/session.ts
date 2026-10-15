"use server";

import { revalidatePath } from "next/cache";
import { authenticateUser, createSession, destroySession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { dbConnect } from "@/lib/mongoose";
import { User } from "@/models/User";
import { homeFor } from "@/lib/admin-sections";

export async function login(_prevState: { error?: string }, formData: FormData) {
  const email = formData.get("email")?.toString().trim() || "";
  const password = formData.get("password")?.toString() || "";

  let user;
  try {
    user = await authenticateUser(email, password);
  } catch (err) {
    console.error("Login authenticateUser error:", err);
    return { error: `Server error: ${err instanceof Error ? err.message : String(err)}` };
  }

  if (!user) {
    return { error: "Invalid email or password" };
  }

  try {
    await createSession(user);
  } catch (err) {
    console.error("Login createSession error:", err);
    return { error: `Server error: ${err instanceof Error ? err.message : String(err)}` };
  }

  // Sub-admins land on the first section they may open.
  await dbConnect();
  const account = await User.findById(user.id).select("role sections").lean();
  const home = account ? homeFor({ role: account.role, sections: account.sections }) : null;
  revalidatePath("/admin");
  redirect(home || "/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}
