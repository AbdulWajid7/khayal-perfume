import { NextRequest, NextResponse } from "next/server";
import { handleIncomingMessage } from "@/lib/whatsapp-bot";
import { markRead, whatsappConfigured } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  // Always ack fast — Meta retries on non-200
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  try {
    if (!whatsappConfigured()) return NextResponse.json({ ok: true });

    const entry = (body.entry as Record<string, unknown>[])?.[0];
    const change = (entry?.changes as Record<string, unknown>[])?.[0];
    const value = change?.value as Record<string, unknown> | undefined;
    const messages = value?.messages as Record<string, unknown>[] | undefined;
    const message = messages?.[0];
    if (!message) return NextResponse.json({ ok: true });

    const waId = String(message.from || "");
    const messageId = String(message.id || "");
    const msgType = String(message.type || "");
    if (!waId || !messageId) return NextResponse.json({ ok: true });

    let text = "";
    let replyId: string | undefined;

    if (msgType === "text") {
      text = String((message.text as { body?: string })?.body || "");
    } else if (msgType === "interactive") {
      const interactive = message.interactive as
        | { type?: string; button_reply?: { id?: string; title?: string }; list_reply?: { id?: string; title?: string } }
        | undefined;
      if (interactive?.type === "button_reply") {
        replyId = interactive.button_reply?.id;
        text = interactive.button_reply?.title || "";
      } else if (interactive?.type === "list_reply") {
        replyId = interactive.list_reply?.id;
        text = interactive.list_reply?.title || "";
      }
    } else {
      // Images, audio, etc. — nudge back to text flow
      await sendTextNudge(waId);
      return NextResponse.json({ ok: true });
    }

    markRead(messageId);
    await handleIncomingMessage(waId, messageId, msgType, text, replyId);
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
  }

  return NextResponse.json({ ok: true });
}

async function sendTextNudge(waId: string) {
  const { sendText } = await import("@/lib/whatsapp");
  await sendText(waId, "I work best with text and buttons 🙂 Type *menu* to start.");
}
