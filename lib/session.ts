"use server";

import { revalidatePath } from "next/cache";
import { authenticateUser, createSession, destroySession } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email")?.toString().trim() || "";
  const password = formData.get("password")?.toString() || "";

  const user = await authenticateUser(email, password);
  if (!user) {
    return { error: "Invalid email or password" };
  }

  await createSession(user);
  revalidatePath("/admin");
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}
