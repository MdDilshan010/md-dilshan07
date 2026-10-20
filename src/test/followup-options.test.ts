import { describe, it, expect } from "vitest";
import { ownsExplanation } from "@/lib/followup-options";

describe("Saved explanation access", () => {
  it("allows the signed-in owner to ask follow-up questions", () => {
    expect(ownsExplanation("owner-user", "owner-user")).toBe(true);
  });
  it("rejects questions about another user's saved explanation", () => {
    expect(ownsExplanation("owner-user", "other-user")).toBe(false);
  });
});