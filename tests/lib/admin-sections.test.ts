import { describe, expect, it } from "vitest";
import { canAccess, effectiveSections, homeFor, sanitizeSections, sectionForPath } from "@/lib/admin-sections";

describe("admin section rights", () => {
  it("maps URLs to sections, longest path first", () => {
    expect(sectionForPath("/admin")).toBe("dashboard");
    expect(sectionForPath("/admin/orders/abc")).toBe("orders");
    expect(sectionForPath("/admin/marketing/subscribers")).toBe("subscribers");
    expect(sectionForPath("/admin/marketing/config")).toBe("marketing");
    expect(sectionForPath("/admin/costs")).toBe("costs");
    expect(sectionForPath("/admin/login")).toBeNull();
  });

  it("gives the owner everything and sub-admins only what was ticked", () => {
    expect(canAccess({ role: "admin" }, "costs")).toBe(true);
    const sub = { role: "editor" as const, sections: ["orders", "commission"] };
    expect(canAccess(sub, "orders")).toBe(true);
    expect(canAccess(sub, "products")).toBe(false);
    expect(homeFor(sub)).toBe("/admin/orders");
  });

  it("never lets a sub-admin hold owner-only sections", () => {
    expect(sanitizeSections(["costs", "users", "orders", "orders", "nonsense"])).toEqual(["orders"]);
    expect(canAccess({ role: "editor", sections: ["costs"] }, "costs")).toBe(false);
  });

  it("keeps old editor accounts working until edited", () => {
    expect(effectiveSections({ role: "editor" })).toContain("orders");
    expect(effectiveSections({ role: "editor" })).not.toContain("costs");
    expect(effectiveSections({ role: "editor", sections: [] })).toEqual([]);
  });
});
