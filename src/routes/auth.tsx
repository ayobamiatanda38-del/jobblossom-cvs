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

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({ mode: z.enum(["signin", "signup"]).optional() }),
  head: () => ({ meta: [
    { title: "Log in or sign up — JobPrimed" },
    { name: "description", content: "Sign in to JobPrimed to save your CVs and unlock Pro templates." },
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
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const { user } = useSession();
  const navigate = useNavigate();
  useEffect(() => { setMode(initial ?? "signin"); }, [initial]);
  useEffect(() => { if (user) navigate({ to: "/builder" }); }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setMsg(null);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
      setMsg(error ? { ok: false, text: error.message } : { ok: true, text: "Check your inbox to confirm your email, then log in." });
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg({ ok: false, text: error.message });
    }
    setBusy(false);
  };
  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) setMsg({ ok: false, text: String(r.error.message ?? r.error) });
  };

  return <div className="grid min-h-screen place-items-center bg-muted px-4">
    <div className="w-full max-w-md border border-line bg-paper p-8 soft-shadow">
      <Link to="/" className="flex items-center gap-2 font-bold"><span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground"><FileText className="size-4" /></span>JobPrimed</Link>
      <h1 className="mt-6 font-display text-4xl">{mode === "signup" ? "Create your account" : "Welcome back"}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{mode === "signup" ? "Save your CVs and pick up anywhere." : "Log in to continue building."}</p>
      <Button variant="outline" className="mt-6 w-full" onClick={google}>Continue with Google</Button>
      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" /></div>
      <form onSubmit={submit} className="space-y-4">
        <div><Label htmlFor="email">Email</Label><Input id="email" type="email" required className="mt-2" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><Label htmlFor="pw">Password</Label><Input id="pw" type="password" required minLength={6} className="mt-2" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        {msg && <p className={`text-sm ${msg.ok ? "text-mint-strong" : "text-destructive"}`}>{msg.text}</p>}
        <Button type="submit" variant="hero" className="w-full" disabled={busy}>{busy ? "Please wait…" : mode === "signup" ? "Sign up" : "Log in"}</Button>
      </form>
      <p className="mt-5 text-center text-sm text-muted-foreground">{mode === "signup" ? "Already have an account?" : "New to JobPrimed?"}{" "}
        <button type="button" className="font-semibold text-primary" onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setMsg(null); }}>{mode === "signup" ? "Log in" : "Sign up"}</button></p>
    </div>
  </div>;
}
