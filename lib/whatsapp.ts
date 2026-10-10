const TOKEN = () => process.env.WHATSAPP_TOKEN || "";
const PHONE_ID = () => process.env.WHATSAPP_PHONE_NUMBER_ID || "";

export function whatsappConfigured(): boolean {
  return Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

interface SendPayload {
  messaging_product: "whatsapp";
  to: string;
  type: string;
  [key: string]: unknown;
}

async function send(payload: SendPayload): Promise<void> {
  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${PHONE_ID()}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error("WhatsApp send error:", res.status, await res.text());
    }
  } catch (error) {
    console.error("WhatsApp send failed:", error);
  }
}

export function sendText(to: string, body: string) {
  return send({
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: body.slice(0, 4096) },
  });
}

export function sendButtons(
  to: string,
  body: string,
  buttons: { id: string; title: string }[]
) {
  return send({
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: body.slice(0, 1024) },
      action: {
        buttons: buttons.slice(0, 3).map((b) => ({
          type: "reply",
          reply: { id: b.id.slice(0, 256), title: b.title.slice(0, 20) },
        })),
      },
    },
  });
}

export function sendList(
  to: string,
  body: string,
  buttonLabel: string,
  rows: { id: string; title: string; description?: string }[]
) {
  return send({
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "list",
      body: { text: body.slice(0, 1024) },
      action: {
        button: buttonLabel.slice(0, 20),
        sections: [
          {
            title: "Products",
            rows: rows.slice(0, 10).map((r) => ({
              id: r.id.slice(0, 200),
              title: r.title.slice(0, 24),
              description: r.description?.slice(0, 72),
            })),
          },
        ],
      },
    },
  });
}

export function markRead(messageId: string) {
  return fetch(`https://graph.facebook.com/v21.0/${PHONE_ID()}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId,
    }),
  }).catch(() => {});
}

export function sendImage(to: string, link: string, caption?: string) {
  return send({
    messaging_product: "whatsapp",
    to,
    type: "image",
    image: { link, ...(caption ? { caption: caption.slice(0, 1024) } : {}) },
  });
}

/**
 * Send an approved WhatsApp message template (needed to message a customer outside the
 * 24-hour window after their last message). `params` fill {{1}}, {{2}}, ... in the body.
 */
export function sendTemplate(to: string, name: string, language: string, params: string[] = []) {
  return send({
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name,
      language: { code: language },
      components: params.length
        ? [{ type: "body", parameters: params.map((text) => ({ type: "text", text })) }]
        : [],
    },
  });
}
