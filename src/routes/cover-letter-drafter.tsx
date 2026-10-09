import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowLeft, Copy, PenLine, Sparkles, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/cover-letter-drafter")({
  head: () => ({ meta: [
    { title: "AI Cover Letter Drafter — JobPrimed" }, { name: "description", content: "Paste a job description and your resume to get a tailored cover letter grounded only in your real experience." },
    { property: "og:title", content: "AI Cover Letter Drafter — JobPrimed" }, { property: "og:description", content: "A tailored cover letter that never invents experience you don't have." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: Drafter,
});

const TONES = [
  { id: "professional", label: "Professional" },
  { id: "warm", label: "Warm" },
  { id: "confident", label: "Confident" },
] as const;

function Drafter() {
  const [resume, setResume] = useState(""); const [job, setJob] = useState("");
  const [tone, setTone] = useState<(typeof TONES)[number]["id"]>("professional");
  const [out, setOut] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const ctrl = useRef<AbortController | null>(null);

  async function run() {
    setOut(""); setErr(""); setBusy(true);
    const ac = new AbortController(); ctrl.current = ac;
    try {
      const res = await fetch("/api/cover-letter", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ resume, job, tone }), signal: ac.signal });
      if (!res.ok || !res.body) { const j = await res.json().catch(() => ({})); setErr(j.error ?? "Something went wrong. Please try again."); return; }
      const reader = res.body.getReader(); const dec = new TextDecoder(); let text = "";
      for (;;) {
        const { done, value } = await reader.read(); if (done) break;
        text += dec.decode(value, { stream: true });
        const i = text.indexOf("[[ERROR]]");
        if (i >= 0) { setOut(text.slice(0, i).trim()); setErr(text.slice(i + 9)); } else setOut(text);
      }
    } catch (e) { if ((e as Error).name !== "AbortError") setErr("Connection lost. Please try again."); }
    finally { setBusy(false); ctrl.current = null; }
  }

  const ready = resume.trim().length >= 50 && job.trim().length >= 50;
  return <div className="min-h-screen bg-background"><SiteHeader /><main className="mx-auto max-w-5xl px-5 py-12 sm:py-20">
    <Button variant="ghost" asChild><Link to="/"><ArrowLeft />Home</Link></Button>
    <h1 className="mt-6 font-display text-4xl sm:text-6xl">AI cover letter drafter</h1>
    <p className="mt-3 max-w-2xl text-muted-foreground">Get a tailored cover letter built only from experience you actually have. Nothing is invented — gaps are handled honestly.</p>
    <div className="mt-9 grid gap-5 md:grid-cols-2">
      <div><Label htmlFor="job">Job description</Label><Textarea id="job" className="mt-2 min-h-72 bg-paper" placeholder="Paste the job posting here…" value={job} onChange={e => setJob(e.target.value)} /></div>
      <div><Label htmlFor="Resume">Your resume</Label><Textarea id="Resume" className="mt-2 min-h-72 bg-paper" placeholder="Paste the text of your resume here…" value={resume} onChange={e => setResume(e.target.value)} /></div>
    </div>
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <div className="flex gap-2" role="group" aria-label="Tone">
        {TONES.map(t => <Button key={t.id} size="sm" variant={tone === t.id ? "ink" : "outline"} onClick={() => setTone(t.id)}>{t.label}</Button>)}
      </div>
      {busy ? <Button variant="outline" onClick={() => ctrl.current?.abort()}><Square />Stop</Button>
        : <Button disabled={!ready} onClick={run}><Sparkles />Draft my cover letter</Button>}
      {out && !busy && <Button variant="ghost" onClick={() => navigator.clipboard.writeText(out)}><Copy />Copy letter</Button>}
    </div>
    {!ready && <p className="mt-2 text-xs text-muted-foreground">Paste a few lines in both boxes to begin.</p>}
    {err && <p role="alert" className="mt-6 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{err}</p>}
    {(busy || out) && <section aria-live="polite" className="mt-8 border-t border-line pt-8">
      {busy && !out && <p className="text-sm text-muted-foreground animate-pulse">Reading the job and your resume…</p>}
      <div className="max-w-3xl border border-line bg-paper p-7 whitespace-pre-line text-base leading-8 paper-shadow sm:p-10">{out}</div>
      {out && !busy && <p className="mt-6 text-xs text-muted-foreground">Review every line and only keep what is true for you. Fill in the bracketed details before sending.</p>}
    </section>}
    <section className="mt-12 border-t border-line pt-8">
      <h2 className="flex items-center gap-2 text-lg font-bold"><PenLine className="size-5 text-primary" />Prefer to start from a template?</h2>
      <p className="mt-2 text-sm text-muted-foreground">Browse our <Link to="/cover-letters" className="font-semibold text-primary underline underline-offset-2">cover letter templates</Link>, or <Link to="/resume-tailor" className="font-semibold text-primary underline underline-offset-2">tailor your resume</Link> to the same job first.</p>
    </section>
  </main></div>;
}
