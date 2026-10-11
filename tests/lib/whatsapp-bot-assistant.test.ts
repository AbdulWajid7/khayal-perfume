import { beforeEach, describe, expect, it, vi } from "vitest";

// ---- mocks -------------------------------------------------------------
const sent: { kind: string; to: string; body: string; buttons?: { id: string; title: string }[] }[] = [];
let session: Record<string, unknown> = { waId: "923001234567", state: "menu" };
const logged: Record<string, unknown>[] = [];
const emails: { subject: string; text?: string }[] = [];
let assistantReply: Record<string, unknown> = {};

vi.mock("@/lib/mongoose", () => ({ dbConnect: vi.fn(), toJSON: (d: unknown) => d }));
vi.mock("@/lib/whatsapp", () => ({
  sendText: vi.fn(async (to: string, body: string) => (sent.push({ kind: "text", to, body }), true)),
  sendButtons: vi.fn(async (to: string, body: string, buttons: { id: string; title: string }[]) =>
    (sent.push({ kind: "buttons", to, body, buttons }), true)
  ),
  sendList: vi.fn(async (to: string, body: string) => (sent.push({ kind: "list", to, body }), true)),
  sendImage: vi.fn(async () => true),
}));
vi.mock("@/models/WhatsAppSession", () => ({
  WhatsAppSession: {
    findOneAndUpdate: vi.fn(async (_q: unknown, update: { $set?: Record<string, unknown> }) => {
      if (update?.$set) session = { ...session, ...update.$set };
      return session;
    }),
  },
}));
vi.mock("@/models/WhatsAppMessage", () => ({ WhatsAppMessage: { updateOne: vi.fn(() => Promise.resolve()) } }));
vi.mock("@/models/WhatsAppOptIn", () => ({
  WhatsAppOptIn: { findOneAndUpdate: vi.fn(), findOne: () => ({ lean: async () => null }) },
}));
vi.mock("@/models/Product", () => ({ Product: {} }));
vi.mock("@/models/Order", () => ({ Order: {} }));
vi.mock("@/lib/checkout", () => ({ createOrder: vi.fn() }));
vi.mock("@/lib/admin/bank-config", () => ({ getEnabledBankTransferConfig: vi.fn(async () => null) }));
vi.mock("@/lib/email", () => ({
  getEmailFrom: () => "KHAYAL <x@y.z>",
  sendEmail: vi.fn(async (p: { subject: string; text?: string }) => (emails.push(p), { ok: true })),
}));
vi.mock("@/lib/bot-assistant", () => ({
  TESTER_LINE: "tester",
  logMessage: vi.fn(async (entry: Record<string, unknown>) => (logged.push(entry), { _id: `m${logged.length}` })),
  answerCustomer: vi.fn(async () => assistantReply),
}));

import { handleIncomingMessage } from "@/lib/whatsapp-bot";
import { answerCustomer } from "@/lib/bot-assistant";

const WA = "923001234567";
let n = 0;
const message = (text: string, replyId?: string) => handleIncomingMessage(WA, `wamid.${++n}`, "text", text, replyId);

describe("WhatsApp bot with the assistant", () => {
  beforeEach(() => {
    sent.length = 0;
    logged.length = 0;
    emails.length = 0;
    session = { waId: WA, state: "menu" };
    process.env.ADMIN_EMAIL = "owner@example.com";
    vi.mocked(answerCustomer).mockClear();
    assistantReply = {
      reply: "For a wedding, try *SILK ROYALE*.",
      products: [{ id: "p1", title: "SILK ROYALE" }],
      needsHuman: false,
      answered: true,
      source: "ai",
    };
  });

  it("opens the menu for a bare greeting", async () => {
    await message("Assalam");
    expect(answerCustomer).not.toHaveBeenCalled();
    expect(sent[0].body).toContain("Welcome to *KHAYAL*");
  });

  it("sends a typed question to the assistant, with product buttons", async () => {
    await message("which perfume is best for a wedding?");
    expect(answerCustomer).toHaveBeenCalledWith(WA, "which perfume is best for a wedding?");
    expect(sent[0].body).toContain("SILK ROYALE");
    expect(sent[0].buttons?.map((b) => b.id)).toEqual(["prod_p1", "menu_browse"]);
    expect(logged.at(-1)).toMatchObject({ direction: "out", handledBy: "ai" });
  });

  it("does not swallow a question that starts with a greeting", async () => {
    await message("hi what is the price of silk royale?");
    expect(answerCustomer).toHaveBeenCalled();
  });

  it("hands over to the team and emails the owner when nothing can answer", async () => {
    assistantReply = { reply: "", products: [], needsHuman: false, answered: false, source: "none" };
    await message("can you deliver to Gilgit tomorrow?");
    expect(sent[0].body).toContain("team member will reply");
    expect(emails[0].subject).toContain("needs a reply");
  });

  it("alerts the team when a customer types human", async () => {
    await message("human");
    expect(answerCustomer).not.toHaveBeenCalled();
    expect(sent[0].body).toContain("team member will reply");
    expect(emails).toHaveLength(1);
  });

  it("never logs names or addresses typed during checkout", async () => {
    session = { waId: WA, state: "address" };
    await message("House 12, Street 4, Block L, North Nazimabad");
    expect(logged[0]).toMatchObject({ direction: "in", text: "[customer details]", handledBy: "flow" });
    expect(answerCustomer).not.toHaveBeenCalled();
  });
});
