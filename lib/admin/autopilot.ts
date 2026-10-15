"use server";

import { requireSection } from "@/lib/admin/access";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { dbConnect } from "@/lib/mongoose";
import { ContentAutopilot } from "@/models/ContentAutopilot";
import { runAutopilot } from "@/lib/content-autopilot";

async function guard() {
  const session = await requireSection("posts");
  if (!session) throw new Error("Unauthorized");
}

export async function updateAutopilot(formData: FormData) {
  await guard();
  await dbConnect();
  await ContentAutopilot.updateOne(
    {},
    {
      $set: {
        enabled: formData.get("enabled")?.toString() === "true",
        autoPublish: formData.get("autoPublish")?.toString() === "true",
      },
    },
    { upsert: true }
  );
  revalidatePath("/admin/posts");
}

export async function generateNow(formData: FormData) {
  await guard();
  const kind = formData.get("kind")?.toString() === "article" ? "article" : "blog";
  const result = await runAutopilot(kind, { force: true });
  revalidatePath("/admin/posts");
  redirect(`/admin/posts?autopilot=${result.status}`);
}
