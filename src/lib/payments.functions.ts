import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { PLANS, USD_TO_NGN } from "./templates";
import { CHECKOUT_MARKETS, marketFor, type Country, type CheckoutQuote } from "./checkout-markets";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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

const countrySchema = z.enum(["NG", "GH", "ZA", "KE", "CI", "US"]);
const planSchema = z.enum(["week", "month", "year"]);
const days = { week: 7, month: 30, year: 365 };
function merchantKey(country: Country) {
  return process.env[`PAYSTACK_SECRET_KEY_${country}`] ?? (country === "NG" || country === "US" ? process.env["PAYSTACK_SECRET_KEY"] : undefined);
}
async function provider(key: string, path: string, body?: object) {
  const res = await fetch(`https://api.paystack.co${path}`, { method: body ? "POST" : "GET", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(10000) });
  const text = await res.text();
  if (!res.ok) { console.error(`Paystack [${res.status}]: ${text}`); throw new Error(`Payment provider [${res.status}]: ${text}`); }
  const json = JSON.parse(text);
  if (!json.status) throw new Error(`Payment provider: ${json.message ?? "Request failed"}`);
  return json.data;
}
async function quote(country: Country, planId: string): Promise<CheckoutQuote> {
  const market = marketFor(country);
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) throw new Error("Unknown plan");
  const key = merchantKey(country);
  const currency = market.currency;
  let rate = 1;
  let live = currency === "USD";
  if (currency === "NGN") { const fx = await fetchRate(); rate = fx.rate; live = fx.live; }
  else if (currency !== "USD") {
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/USD", { signal: AbortSignal.timeout(4000) });
      if (res.ok) { const fx = await res.json(); const value = Number(fx.rates?.[currency]); if (Number.isFinite(value) && value > 0) { rate = value; live = true; } }
    } catch { /* unavailable quotes cannot be charged */ }
  }
  const amount = currency === "XOF" ? Math.round(plan.usd * rate) : Math.round(plan.usd * rate * 100) / 100;
  let ready = false;
  let error = key ? "Payment availability could not be confirmed. Please try again." : "Payments are not available yet. Your CV remains saved.";
  if (key && live) {
    try {
      const balances = await provider(key, "/balance");
      ready = Array.isArray(balances) && balances.some((b: { currency: string }) => b.currency === currency);
      if (!ready) error = "Local-currency payments are awaiting activation. Your CV remains saved.";
    } catch (e) { error = e instanceof Error ? e.message : error; }
  }
  if (!live) error = "A current exchange rate is unavailable. Please try again shortly.";
  return { country, currency, rate, amount, live, ready, local: true, methods: market.methods, ...(!ready ? { error } : {}) };
}
export const getCheckoutQuote = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ country: countrySchema, plan: planSchema }).parse(d))
  .handler(({ data }) => quote(data.country, data.plan));

export const getCheckoutCountry = createServerFn({ method: "GET" }).handler(() => {
  const headers = getRequest().headers;
  const country = headers.get("cf-ipcountry") ?? "NG";
  return marketFor(country).country;
});

export const getProAccess = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from("cv_entitlements").select("expires_at").gt("expires_at", new Date().toISOString()).limit(1);
  if (error) throw new Error(error.message);
  return { active: Boolean(data?.length) };
});

export const startCheckout = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ plan: planSchema, email: z.string().email().max(255), country: countrySchema }).parse(d))
  .handler(async ({ data, context }) => {
    const q = await quote(data.country, data.plan);
    const key = merchantKey(data.country);
    if (!key || !q.ready) return { error: q.error ?? "Payments are not available." };
    const reference = `jp_${data.country}_${crypto.randomUUID()}`;
    const amount = Math.round(q.amount * 100);
    const j = await provider(key, "/transaction/initialize", { email: data.email, amount, currency: q.currency, reference,
      channels: marketFor(data.country).channels,
      callback_url: `${new URL(getRequest().url).origin}/builder`,
      metadata: { plan: data.plan, userId: context.userId, country: data.country, expectedAmount: amount, rate: q.rate },
    });
    return { url: j.authorization_url as string };
  });

export const verifyPayment = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ reference: z.string().min(1).max(200).regex(/^[\w.-]+$/) }).parse(d))
  .handler(async ({ data, context }) => {
    const country = countrySchema.safeParse(data.reference.split("_")[1]);
    if (!country.success) return { ok: false as const };
    const key = merchantKey(country.data);
    if (!key) return { ok: false as const };
    const t = await provider(key, `/transaction/verify/${encodeURIComponent(data.reference)}`);
    const plan = planSchema.safeParse(t?.metadata?.plan);
    const expected = Number(t?.metadata?.expectedAmount);
    if (t.status !== "success" || t.reference !== data.reference || t.metadata?.userId !== context.userId || t.currency !== marketFor(country.data).currency || !Number.isFinite(expected) || expected <= 0 || t.amount !== expected || !plan.success || !t.paid_at) return { ok: false as const };
    const expires = new Date(new Date(t.paid_at).getTime() + days[plan.data] * 86400000).toISOString();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("cv_entitlements").upsert({ user_id: context.userId, reference: data.reference, plan: plan.data, expires_at: expires }, { onConflict: "reference", ignoreDuplicates: true });
    if (error) throw new Error(error.message);
    return { ok: new Date(expires).getTime() > Date.now(), plan: plan.data };
  });
