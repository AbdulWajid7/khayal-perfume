import type { EmailResult } from "@/lib/email";

export type WelcomeEmailResult = { ok: boolean; message: string };

export function welcomeEmailResult(result: EmailResult, successMessage: string): WelcomeEmailResult {
  return result.ok
    ? { ok: true, message: successMessage }
    : { ok: false, message: "We created your welcome code but couldn't send the email. Please try Resend Email in a moment." };
}
