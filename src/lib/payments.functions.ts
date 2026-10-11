import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { PLANS } from "./templates";
import { marketFor, paymentMatches, quoteAmounts } from "./checkout-markets";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getExchangeRate = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchRates } = await import("./exchange-rates.server");
  return fetchRates();
});

export const createCheckoutQuote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ plan: z.enum(["week", "month", "year"]), country: z.enum(["US", "NG", "KE", "GH", "ZA", "CI"]) }).parse(d))
  .handler(async ({ data, context }) => {
    const plan = PLANS.find(p => p.id === data.plan);
    if (!plan) throw new Error("Invalid plan");
    const { fetchRates } = await import("./exchange-rates.server");
    const snapshot = await fetchRates();
    const amounts = quoteAmounts(plan.usd, data.country, snapshot.rates);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: quote, error } = await supabaseAdmin.from("checkout_quotes").insert({ user_id: context.userId, plan: plan.id, country: data.country, usd_amount: plan.usd, amount_kobo: amounts.amountKobo, local_amount: amounts.localAmount, local_currency: amounts.currency, ngn_rate: amounts.ngnRate }).select("id, expires_at").single();
    if (error || !quote) throw new Error("Could not prepare your payment quote.");
    return { id: quote.id, expiresAt: quote.expires_at, ...amounts, usd: plan.usd, updatedAt: snapshot.updatedAt };
  });

export const startCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ quoteId: z.string().uuid(), email: z.string().email().max(255) }).parse(d))
  .handler(async ({ data, context }) => {
    const key = process.env["PAYSTACK_SECRET_KEY"];
    if (!key) return { error: "Payments are not available yet. Please try again later." };
    const { data: quote } = await context.supabase.from("checkout_quotes").select("*").eq("id", data.quoteId).eq("user_id", context.userId).single();
    if (!quote || Date.parse(quote.expires_at) <= Date.now()) return { error: "Your quote expired. Go back to refresh the amount." };
    const reference = quote.reference ?? `jp-${crypto.randomUUID()}`;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("checkout_quotes").update({ reference }).eq("id", quote.id).eq("user_id", context.userId);
    if (error) return { error: "Could not prepare your payment." };
    const origin = new URL(getRequest().url).origin;
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email, amount: quote.amount_kobo, currency: "NGN", reference, channels: marketFor(quote.country).channels, callback_url: `${origin}/builder`, metadata: { plan: quote.plan, user_id: context.userId, quote_id: quote.id, usd: quote.usd_amount, rate: quote.ngn_rate, country: quote.country } }),
    });
    const body = await response.text();
    if (!response.ok) { console.error(`Paystack initialize [${response.status}]: ${body}`); return { error: "Paystack could not start payment. Please try again." }; }
    const result = JSON.parse(body) as { status?: boolean; data?: { authorization_url?: string } };
    if (!result.status || !result.data?.authorization_url) return { error: "Paystack could not start payment." };
    return { url: result.data.authorization_url };
  });

export const getEntitlement = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from("cv_entitlements").select("expires_at").eq("user_id", context.userId).gt("expires_at", new Date().toISOString()).limit(1);
  if (error) throw new Error("Could not check your Pro access.");
  return { isPro: Boolean(data?.length) };
});

export const verifyPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ reference: z.string().min(1).max(200).regex(/^[\w.-]+$/) }).parse(d))
  .handler(async ({ data, context }) => {
    const key = process.env["PAYSTACK_SECRET_KEY"];
    if (!key) return { ok: false as const };
    const { data: quote } = await context.supabase.from("checkout_quotes").select("*").eq("reference", data.reference).eq("user_id", context.userId).single();
    if (!quote) return { ok: false as const };
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(data.reference)}`, { headers: { Authorization: `Bearer ${key}` } });
    const body = await response.text();
    if (!response.ok) { console.error(`Paystack verify [${response.status}]: ${body}`); return { ok: false as const }; }
    const transaction = JSON.parse(body).data;
    if (!paymentMatches(quote, transaction, context.userId)) return { ok: false as const };
    const paidAt = Date.parse(transaction.paid_at);
    if (!Number.isFinite(paidAt)) return { ok: false as const };
    const days = quote.plan === "week" ? 7 : quote.plan === "month" ? 30 : 365;
    const expiresAt = new Date(paidAt + days * 86400000).toISOString();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("cv_entitlements").upsert({ user_id: context.userId, reference: data.reference, plan: quote.plan, expires_at: expiresAt }, { onConflict: "reference", ignoreDuplicates: true });
    if (error) throw new Error("Your payment succeeded but access could not be saved. Please retry verification.");
    return { ok: Date.parse(expiresAt) > Date.now(), plan: quote.plan };
  });