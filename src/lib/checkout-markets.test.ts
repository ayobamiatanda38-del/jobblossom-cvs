import { describe, expect, it } from "vitest";
import { CHECKOUT_MARKETS, marketFor, quoteAmounts, paymentMatches } from "./checkout-markets";

describe("international checkout rules", () => {
  it("supports all six requested countries", () => {
    expect(CHECKOUT_MARKETS.map(m => m.country).sort()).toEqual(["CI", "GH", "KE", "NG", "US", "ZA"]);
  });
  it("defaults to the United States and USD", () => {
    expect(marketFor("unknown").country).toBe("US");
    expect(marketFor("US").currency).toBe("USD");
  });
  it.each([["NG", "NGN"], ["KE", "KES"], ["GH", "GHS"], ["ZA", "ZAR"], ["CI", "XOF"], ["US", "USD"]] as const)("shows %s in %s", (country, currency) => {
    expect(quoteAmounts(9.99, country, { NGN: 1500, KES: 130, GHS: 12, ZAR: 18, XOF: 600 }).currency).toBe(currency);
  });
  it("keeps the USD base price and settles the same NGN amount for every market", () => {
    const rates = { NGN: 1500, KES: 130, GHS: 12, ZAR: 18, XOF: 600 };
    for (const market of CHECKOUT_MARKETS) expect(quoteAmounts(9.99, market.country, rates).amountKobo).toBe(1498500);
    expect(quoteAmounts(9.99, "US", rates).localAmount).toBe(9.99);
    expect(quoteAmounts(9.99, "KE", rates).localAmount).toBeCloseTo(1298.7);
  });
  it("blocks payment without a current exchange rate", () => {
    expect(() => quoteAmounts(9.99, "NG", {})).toThrow();
  });
  it("requires matching owner, exact amount and NGN before granting Pro", () => {
    const quote = { user_id: "owner", plan: "month", amount_kobo: 1498500, reference: "ref" };
    const tx = { status: "success", currency: "NGN", amount: 1498500, reference: "ref", metadata: { user_id: "owner", plan: "month" } };
    expect(paymentMatches(quote, tx, "owner")).toBe(true);
    expect(paymentMatches(quote, { ...tx, amount: 1 }, "owner")).toBe(false);
    expect(paymentMatches(quote, { ...tx, currency: "USD" }, "owner")).toBe(false);
    expect(paymentMatches(quote, tx, "another-user")).toBe(false);
  });
});