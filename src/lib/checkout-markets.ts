export const CHECKOUT_MARKETS = [
  { country: "NG", name: "Nigeria", currency: "NGN", locale: "en-NG", channels: ["card", "bank_transfer", "ussd"], methods: "Card, bank transfer or USSD" },
  { country: "GH", name: "Ghana", currency: "GHS", locale: "en-GH", channels: ["card", "mobile_money"], methods: "Card or mobile money" },
  { country: "ZA", name: "South Africa", currency: "ZAR", locale: "en-ZA", channels: ["card", "eft"], methods: "Card or EFT" },
  { country: "KE", name: "Kenya", currency: "KES", locale: "en-KE", channels: ["card", "mobile_money"], methods: "Card or M-PESA" },
  { country: "CI", name: "Côte d’Ivoire", currency: "XOF", locale: "fr-CI", channels: ["card", "mobile_money"], methods: "Carte ou mobile money" },
  { country: "US", name: "United States", currency: "USD", locale: "en-US", channels: ["card"], methods: "Debit or credit card" },
] as const;
export type Country = (typeof CHECKOUT_MARKETS)[number]["country"];
export const marketFor = (country: string) => CHECKOUT_MARKETS.find((m) => m.country === country) ?? CHECKOUT_MARKETS[0];
export const money = (amount: number, currency: string, locale: string) => new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: currency === "XOF" ? 0 : 2 }).format(amount);
export type CheckoutQuote = { country: Country; currency: string; rate: number; amount: number; live: boolean; ready: boolean; local: boolean; methods: string; error?: string };