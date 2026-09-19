import { Resend } from "resend";

export type EmailResult = { ok: true; providerResponse?: string } | { ok: false; error: string };

export interface EmailPayload {
  to: string;
  from: string;
  replyTo?: string;
  subject: string;
  text?: string;
  html?: string;
}

export function getEmailFrom(): string {
  return process.env.EMAIL_FROM || "KHAYAL <official@khayalparfum.com>";
}

export function getEmailReplyTo(): string {
  return process.env.EMAIL_REPLY_TO || "official@khayalparfum.com";
}

export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  const provider = process.env.EMAIL_PROVIDER?.toLowerCase() || "resend";

  if (provider === "resend") {
    return sendWithResend(payload);
  }

  // Fallback for unsupported provider
  return {
    ok: false,
    error: `Unsupported email provider: ${provider}`,
  };
}

async function sendWithResend(payload: EmailPayload): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY is not configured" };
  }

  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from: payload.from,
      to: payload.to,
      replyTo: payload.replyTo,
      subject: payload.subject,
      text: payload.text || " ",
      html: payload.html,
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, providerResponse: data?.id || "resend-ok" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
