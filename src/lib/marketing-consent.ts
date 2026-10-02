import { supabase } from "@/integrations/supabase/client";

const PENDING = "jobprimed:newsletter-pending";

/** Remember the signup-screen choice so it survives the Google redirect. */
export function rememberNewsletterChoice(optIn: boolean) {
  localStorage.setItem(PENDING, optIn ? "1" : "0");
}

/** Save a pending choice against the signed-in user's record, once. */
export async function syncNewsletterChoice(userId: string, email: string) {
  const pending = localStorage.getItem(PENDING);
  if (pending === null) return;
  const optIn = pending === "1";
  const { error } = await supabase.from("marketing_preferences").upsert({
    user_id: userId,
    email,
    newsletter_opt_in: optIn,
    consented_at: optIn ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  });
  if (error) console.error("Could not save newsletter preference", error.message);
  else localStorage.removeItem(PENDING);
}
