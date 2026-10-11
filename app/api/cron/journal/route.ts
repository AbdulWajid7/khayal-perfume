import { NextRequest, NextResponse } from "next/server";
import { runAutopilot } from "@/lib/content-autopilot";
import { sendEmail, getEmailFrom } from "@/lib/email";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";
// Topic research, writing and the cover image together can take a couple of minutes.
export const maxDuration = 300;

/** Daily journal autopilot. ?kind=blog (10:00 PKT) or ?kind=article (10:30 PKT). */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const kind = req.nextUrl.searchParams.get("kind") === "article" ? "article" : "blog";
  const result = await runAutopilot(kind);

  const to = process.env.ADMIN_EMAIL;
  if (to && result.note !== "Already ran today" && result.note !== "Autopilot is switched off") {
    const subject =
      result.status === "published"
        ? `Journal: new ${kind} published — ${result.title}`
        : result.status === "draft"
          ? `Journal: new ${kind} saved as draft — ${result.title}`
          : `Journal: today's ${kind} failed`;
    await sendEmail({
      to,
      from: getEmailFrom(),
      subject,
      text: [
        result.title ? `Title: ${result.title}` : "",
        result.note ? `Notes: ${result.note}` : "",
        "",
        result.postId ? `Edit: ${siteConfig.url}/admin/posts/${result.postId}` : `Check: ${siteConfig.url}/admin/posts`,
      ]
        .filter((l) => l !== undefined)
        .join("\n"),
    }).catch((error) => console.error("Journal autopilot email failed:", error));
  }

  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
