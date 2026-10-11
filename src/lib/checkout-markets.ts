export const CHECKOUT_MARKETS = [
  { country: "US", name: "United States", currency: "USD", locale: "en-US", channels: ["card"], methods: "Debit or credit card" },
  { country: "NG", name: "Nigeria", currency: "NGN", locale: "en-NG", channels: ["card", "bank_transfer", "ussd"], methods: "Card, bank transfer or USSD" },
  { country: "KE", name: "Kenya", currency: "KES", locale: "en-KE", channels: ["card"], methods: "Debit or credit card" },
  { country: "GH", name: "Ghana", currency: "GHS", locale: "en-GH", channels: ["card"], methods: "Debit or credit card" },
  { country: "ZA", name: "South Africa", currency: "ZAR", locale: "en-ZA", channels: ["card"], methods: "Debit or credit card" },
  { country: "CI", name: "Côte d’Ivoire", currency: "XOF", locale: "fr-CI", channels: ["card"], methods: "Debit or credit card" },
] as const;
export type Country = (typeof CHECKOUT_MARKETS)[number]["country"];
export const marketFor = (country: string) => CHECKOUT_MARKETS.find((m) => m.country === country) ?? CHECKOUT_MARKETS[0];
export const money = (amount: number, currency: string, locale: string) => new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: currency === "XOF" ? 0 : 2 }).format(amount);
export type CheckoutQuote = { country: Country; currency: string; rate: number; amount: number; live: boolean; ready: boolean; local: boolean; methods: string; error?: string };

export type RateSnapshot = { rates: Record<string, number>; source: string; updatedAt: string };
export function quoteAmounts(usd: number, country: Country, rates: Record<string, number>) {
  const market = marketFor(country);
  const ngnRate = rates["NGN"];
  const localRate = country === "US" ? 1 : rates[market.currency];
  if (!ngnRate || ngnRate <= 0 || !localRate || localRate <= 0 || !Number.isFinite(usd) || usd <= 0) throw new Error("A current exchange rate is unavailable.");
  const amountKobo = Math.round(usd * ngnRate * 100);
  return { amountKobo, ngnAmount: amountKobo / 100, localAmount: usd * localRate, currency: market.currency, ngnRate };
}

export function paymentMatches(quote: { user_id: string; plan: string; amount_kobo: number; reference: string | null }, transaction: { status?: string; currency?: string; amount?: number; reference?: string; metadata?: { user_id?: string; plan?: string } }, userId: string) {
  return quote.user_id === userId && transaction.status === "success" && transaction.currency === "NGN" && transaction.amount === quote.amount_kobo && transaction.reference === quote.reference && transaction.metadata?.user_id === userId && transaction.metadata?.plan === quote.plan;
}