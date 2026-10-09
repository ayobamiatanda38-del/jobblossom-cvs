import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useSession } from "@/hooks/use-session";
import { rememberNewsletterChoice, syncNewsletterChoice } from "@/lib/marketing-consent";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({ mode: z.enum(["signin", "signup"]).optional() }),
  head: () => ({ meta: [
    { title: "Log in or sign up — JobPrimed" },
    { name: "description", content: "Sign in to JobPrimed to save your resumes and unlock Pro templates." },
    { property: "og:title", content: "Log in or sign up — JobPrimed" },
    { property: "og:description", content: "Access your JobPrimed account." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ]}),
  component: AuthPage,
});

function AuthPage() {
  const { mode: initial } = Route.useSearch();
  const [mode, setMode] = useState(initial ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [left, setLeft] = useState(0);
  useEffect(() => { if (left <= 0) return; const t = setTimeout(() => setLeft(left - 1), 1000); return () => clearTimeout(t); }, [left]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const { user } = useSession();
  const navigate = useNavigate();
  useEffect(() => { setMode(initial ?? "signin"); }, [initial]);
  useEffect(() => {
    if (!user) return;
    syncNewsletterChoice(user.id, user.email ?? "").finally(() => navigate({ to: "/builder" }));
  }, [user, navigate]);
  const remember = () => { rememberNewsletterChoice(newsletter); };
  const canProceed = agreed;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canProceed) { setMsg({ ok: false, text: "Please tick both boxes below before continuing." }); return; }
    setBusy(true); setMsg(null); remember();
    if (mode === "signup") {
      if (left > 0) { setBusy(false); return; }
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth?mode=signin` } });
      const exists = (error && /already|registered|exists/i.test(error.message)) || (!error && data.user && (data.user.identities?.length ?? 0) === 0);
      if (exists) { setMsg({ ok: false, text: "This email is already registered. Please log in instead." }); setMode("signin"); }
      else if (error) setMsg({ ok: false, text: error.message });
      else { setMsg({ ok: true, text: "We've sent an activation link to your email. Click it, then come back here to log in." }); setLeft(59); }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg({ ok: false, text: error.message });
    }
    setBusy(false);
  };
  const google = async () => {
    if (!canProceed) { setMsg({ ok: false, text: "Please tick both boxes below before continuing." }); return; }
    setBusy(true); setMsg(null); remember();
    try {
      const onLovableHost = /\.lovable\.app$|^localhost$/.test(window.location.hostname);
      if (!onLovableHost) {
        // Off Lovable hosting (e.g. Vercel) the managed sign-in helper is unavailable; use the backend's OAuth directly.
        const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth` } });
        if (error) setMsg({ ok: false, text: error.message });
        return;
      }
      const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/auth` });
      if (r.error) setMsg({ ok: false, text: String(r.error.message ?? r.error) });
    } catch (e) { setMsg({ ok: false, text: e instanceof Error ? e.message : "Google sign-in could not open. Please try again." }); }
    finally { setBusy(false); }
  };

  return <div className="grid min-h-screen place-items-center bg-muted px-4">
    <div className="w-full max-w-md border border-line bg-paper p-8 soft-shadow">
      <Link to="/" className="flex items-center gap-2 font-bold"><span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground"><FileText className="size-4" /></span>JobPrimed</Link>
      <h1 className="mt-6 font-display text-4xl">{mode === "signup" ? "Create your account" : "Welcome back"}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{mode === "signup" ? "Save your resumes and pick up anywhere." : "Log in to continue building."}</p>

      <div className="mt-6 space-y-2.5">
        <label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-muted-foreground"><input type="checkbox" className="mt-1 accent-primary" checked={agreed} onChange={e => setAgreed(e.target.checked)} /> <span>I agree to the <Link to="/terms" className="text-primary underline">terms and conditions</Link> and acknowledge the <Link to="/privacy" className="text-primary underline">privacy notice</Link>.</span></label>
        <label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-muted-foreground"><input type="checkbox" className="mt-1 accent-primary" checked={newsletter} onChange={e => setNewsletter(e.target.checked)} /> <span>Send me job search tips and product updates. (Optional — you can unsubscribe anytime.)</span></label>
      </div>

      <Button variant="outline" className="mt-5 w-full" onClick={google} disabled={busy || !canProceed}><svg viewBox="0 0 48 48" aria-hidden="true" className="size-4"><path fill="#EA4335" d="M24 9.5c3.5 0 6.7 1.2 9.2 3.6l6.8-6.8C35.9 2.5 30.5 0 24 0 14.6 0 6.5 5.4 2.6 13.3l7.9 6.1C12.4 13.7 17.7 9.5 24 9.5Z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.2-3.2-.5-4.7H24v9h12.6c-.6 3-2.3 5.5-4.9 7.2l7.5 5.8c4.6-4.2 7.3-10.4 7.3-17.3Z"/><path fill="#FBBC05" d="M10.5 28.6a14.5 14.5 0 0 1 0-9.2l-7.9-6.1a24 24 0 0 0 0 21.4l7.9-6.1Z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-6.2L32.4 36c-2.1 1.4-4.9 2.2-8.4 2.2-6.3 0-11.6-4.2-13.5-9.9l-7.9 6.1C6.5 42.6 14.6 48 24 48Z"/></svg>{busy ? "Opening Google…" : "Continue with Google"}</Button>
      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-line" />or continue with email<span className="h-px flex-1 bg-line" /></div>
      <form onSubmit={submit} className="space-y-4">
        <div><Label htmlFor="email">Email</Label><Input id="email" type="email" required className="mt-2" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><Label htmlFor="pw">Password</Label><Input id="pw" type="password" required minLength={6} className="mt-2" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        {msg && <p className={`text-sm ${msg.ok ? "text-mint-strong" : "text-destructive"}`}>{msg.text}</p>}
        {mode === "signup" && left > 0 && <p className="text-sm font-semibold text-mint-strong" aria-live="polite">Activate your account within the next {left} second{left === 1 ? "" : "s"}. You can request a new link when the timer ends.</p>}
        <Button type="submit" variant="hero" className="w-full" disabled={busy || !canProceed || (mode === "signup" && left > 0)}>{busy ? "Please wait…" : mode === "signup" ? (left > 0 ? `Resend link in ${left}s` : "Sign up") : "Log in"}</Button>
      </form>
      {!canProceed && <p className="mt-3 text-center text-xs text-muted-foreground">Tick both boxes above to continue.</p>}
      <p className="mt-5 text-center text-sm text-muted-foreground">{mode === "signup" ? "Already have an account?" : "New to JobPrimed?"}{" "}
        <button type="button" className="font-semibold text-primary" onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setMsg(null); }}>{mode === "signup" ? "Log in" : "Sign up"}</button></p>
    </div>
  </div>;
}
