"use server";

import { revalidatePath } from "next/cache";
import { authenticateUser, createSession, destroySession } from "@/lib/auth";
import { redirect } from "next/navigation";

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

  revalidatePath("/admin");
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}
