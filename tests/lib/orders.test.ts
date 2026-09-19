import { describe, it, expect } from "vitest";
import { generateOrderAccessToken, verifyOrderAccessToken } from "@/lib/orders";

describe("order access tokens", () => {

  it("generates and verifies a token for an order number", async () => {
    const token = await generateOrderAccessToken("K-20260920-ABCD");
    expect(token).toBeTruthy();
    const verified = await verifyOrderAccessToken(token);
    expect(verified?.orderNumber).toBe("K-20260920-ABCD");
  });

  it("rejects tampered tokens", async () => {
    const verified = await verifyOrderAccessToken("invalid-token");
    expect(verified).toBeNull();
  });
});
