import { beforeEach, describe, expect, it, vi } from "vitest";

let aiRaw: string | null = null;
let lastSystem = "";
let lastTurns: { role: string; text: string }[] = [];
const products = [
  {
    _id: "p1", handle: "silk-royale", title: "SILK ROYALE", category: "Women", price: 4200, stock: 5, status: "active",
    scentNotesTop: ["Saffron"], scentNotesHeart: ["Tuberose"], scentNotesBase: ["Vanilla"], variants: [],
  },
  {
    _id: "p2", handle: "oud-musk", title: "OUD MUSK", category: "Unisex", price: 0, stock: 0, status: "active",
    scentNotesTop: ["Saffron"], scentNotesHeart: ["Oud"], scentNotesBase: ["White musk"], variants: [],
  },
];
const history = [
  { direction: "in", text: "my number is 0300 1234567, which scent for eid?", handledBy: "ai" },
];

const chain = (value: unknown) => ({ sort: () => chain(value), limit: () => chain(value), lean: async () => value });

vi.mock("@/lib/mongoose", () => ({ dbConnect: vi.fn(), toJSON: (d: unknown) => d }));
vi.mock("@/models/Product", () => ({ Product: { find: () => chain(products) } }));
vi.mock("@/models/BotAnswer", () => ({ BotAnswer: { find: () => chain([]), updateOne: vi.fn(async () => ({})) } }));
vi.mock("@/models/WhatsAppMessage", () => ({ WhatsAppMessage: { find: () => chain([...history].reverse()), create: vi.fn() } }));
vi.mock("@/lib/admin/bank-config", () => ({ getEnabledBankTransferConfig: vi.fn(async () => null) }));
vi.mock("@/lib/gemini", async (orig) => ({
  ...(await orig<typeof import("@/lib/gemini")>()),
  geminiGenerate: vi.fn(async (o: { system: string; turns: { role: string; text: string }[] }) => {
    lastSystem = o.system;
    lastTurns = o.turns;
    return aiRaw;
  }),
}));

import { answerCustomer } from "@/lib/bot-assistant";

describe("answerCustomer", () => {
  beforeEach(() => {
    aiRaw = null;
  });

  it("uses the AI reply and maps recommended scents to buttons", async () => {
    aiRaw = JSON.stringify({ reply: "Try *SILK ROYALE* for Eid.", productHandles: ["silk-royale", "made-up"], needsHuman: false, answered: true });
    const r = await answerCustomer("923001234567", "which scent for eid?");
    expect(r.source).toBe("ai");
    expect(r.products).toEqual([{ id: "p1", title: "SILK ROYALE" }]);
    expect(lastSystem).toContain("SILK ROYALE [handle: silk-royale]");
    expect(lastSystem).toContain("OUD MUSK [handle: oud-musk] (Unisex, 50 ml): price not announced yet");
  });

  it("never sends phone numbers to the AI", async () => {
    aiRaw = JSON.stringify({ reply: "ok", productHandles: [], needsHuman: false, answered: true });
    await answerCustomer("923001234567", "which scent for eid?");
    expect(JSON.stringify(lastTurns)).not.toContain("1234567");
  });

  it("rejects an AI reply that names another brand and falls back to the library", async () => {
    aiRaw = JSON.stringify({ reply: "It smells like Dior Sauvage.", productHandles: [], needsHuman: false, answered: true });
    const r = await answerCustomer("923001234567", "how long does it last?");
    expect(r.source).toBe("library");
    expect(r.reply).toContain("6–12 hours");
  });

  it("answers price questions without AI, never inventing a price", async () => {
    const r = await answerCustomer("923001234567", "price kitni hai?");
    expect(r.source).toBe("library");
    expect(r.reply).toContain("SILK ROYALE: PKR 4,200");
    expect(r.reply).toContain("OUD MUSK: price coming soon");
  });

  it("reports nothing found when neither AI nor library can answer", async () => {
    const r = await answerCustomer("923001234567", "do you sponsor cricket teams");
    expect(r.source).toBe("none");
  });
});
