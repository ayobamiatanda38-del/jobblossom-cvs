import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { PLANS, USD_TO_NGN } from "./templates";

let cache: { rate: number; source: string; at: number } | null = null;

async function fetchRate(): Promise<{ rate: number; source: string; live: boolean }> {
  if (cache && Date.now() - cache.at < 60 * 60 * 1000) return { rate: cache.rate, source: cache.source, live: true };
  const sources: [string, string, (j: any) => number | undefined][] = [
    ["open.er-api.com", "https://open.er-api.com/v6/latest/USD", (j) => j?.rates?.NGN],
    ["fawazahmed0 currency-api", "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json", (j) => j?.usd?.ngn],
    ["currency-api mirror", "https://latest.currency-api.pages.dev/v1/currencies/usd.json", (j) => j?.usd?.ngn],
  ];
  for (const [name, url, pick] of sources) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (!r.ok) continue;
      const rate = Number(pick(await r.json()));
      if (rate > 100 && rate < 100000) {
        cache = { rate, source: name, at: Date.now() };
        return { rate, source: name, live: true };
      }
    } catch (e) { console.error(`Rate source ${name} failed`, e); }
  }
  if (cache) return { rate: cache.rate, source: cache.source, live: false };
  return { rate: USD_TO_NGN, source: "fallback", live: false };
}

export const getExchangeRate = createServerFn({ method: "GET" }).handler(async () => fetchRate());

const planIds = PLANS.map((p) => p.id) as [string, ...string[]];

export const startCheckout = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ plan: z.enum(planIds), email: z.string().email().max(255) }).parse(d))
  .handler(async ({ data }) => {
    const key = process.env["PAYSTACK_SECRET_KEY"];
    if (!key) return { error: "Payments are not configured yet." };
    const plan = PLANS.find((p) => p.id === data.plan)!;
    const { rate } = await fetchRate();
    const kobo = Math.round(plan.usd * rate) * 100;
    const origin = new URL(getRequest().url).origin;
    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.email, amount: kobo, currency: "NGN",
        callback_url: `${origin}/builder`,
        metadata: { plan: plan.id, usd: plan.usd, rate },
      }),
    });
    const body = await res.text();
    if (!res.ok) { console.error(`Paystack init failed [${res.status}]: ${body}`); return { error: "Could not start payment. Please try again." }; }
    const j = JSON.parse(body);
    return { url: j.data.authorization_url as string };
  });

export const verifyPayment = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ reference: z.string().min(1).max(200).regex(/^[\w.-]+$/) }).parse(d))
  .handler(async ({ data }) => {
    const key = process.env["PAYSTACK_SECRET_KEY"];
    if (!key) return { ok: false as const };
    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(data.reference)}`, { headers: { Authorization: `Bearer ${key}` } });
    const body = await res.text();
    if (!res.ok) { console.error(`Paystack verify failed [${res.status}]: ${body}`); return { ok: false as const }; }
    const t = JSON.parse(body).data;
    const plan = PLANS.find((p) => p.id === t?.metadata?.plan);
    if (t?.status !== "success" || t.currency !== "NGN" || !plan) return { ok: false as const };
    return { ok: true as const, plan: plan.id };
  });
