import type { RateSnapshot } from "./checkout-markets";

export async function fetchRates(): Promise<RateSnapshot> {
  const sources = [
    { name: "Open ExchangeRate API", url: "https://open.er-api.com/v6/latest/USD", field: "rates", time: "time_last_update_utc" },
    { name: "Currency API", url: "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json", field: "usd", time: "date" },
  ];
  for (const source of sources) {
    try {
      const response = await fetch(source.url, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) continue;
      const body = await response.json() as Record<string, unknown>;
      const raw = body[source.field] as Record<string, unknown> | undefined;
      const rates: Record<string, number> = { USD: 1 };
      for (const currency of ["NGN", "KES", "GHS", "ZAR", "XOF"]) {
        const rate = Number(raw?.[currency] ?? raw?.[currency.toLowerCase()]);
        if (!Number.isFinite(rate) || rate <= 0) throw new Error(`Missing ${currency} rate`);
        rates[currency] = rate;
      }
      const updatedAt = new Date(String(body[source.time])).toISOString();
      if (Date.now() - Date.parse(updatedAt) > 3 * 24 * 60 * 60 * 1000) continue;
      return { rates, source: source.name, updatedAt };
    } catch (error) { console.error("Exchange rate lookup failed", source.name, error instanceof Error ? error.message : "Unknown error"); }
  }
  throw new Error("Current exchange rates are unavailable. Please try again shortly.");
}