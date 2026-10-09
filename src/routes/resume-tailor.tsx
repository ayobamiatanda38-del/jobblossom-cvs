import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { FLOW_KEY } from "@/lib/read-resume-file";
import { ArrowLeft, Sparkles, Square, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/resume-tailor")({
  validateSearch: z.object({ template: z.string().optional() }),
  head: () => ({ meta: [
    { title: "AI Resume Tailor — JobPrimed" }, { name: "description", content: "Paste a job description and your resume to get honest, tailored edit suggestions." },
    { property: "og:title", content: "AI Resume Tailor — JobPrimed" }, { property: "og:description", content: "Tailor your resume to any job without inventing experience." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: Tailor,
});

function Tailor() {
  const [resume, setResume] = useState(""); const [job, setJob] = useState("");
  const [out, setOut] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const ctrl = useRef<AbortController | null>(null);
  const { template } = Route.useSearch();
  useEffect(() => { try { const f = JSON.parse(sessionStorage.getItem(FLOW_KEY) ?? "null"); if (f) { setResume(f.resume ?? ""); setJob(f.job ?? ""); } } catch { /* ignore */ } }, []);

  async function run() {
    setOut(""); setErr(""); setBusy(true);
    const ac = new AbortController(); ctrl.current = ac;
    try {
      const res = await fetch("/api/tailor", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ resume, job }), signal: ac.signal });
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
    <h1 className="mt-6 font-display text-4xl sm:text-6xl">AI resume tailor</h1>
    <p className="mt-3 max-w-2xl text-muted-foreground">Get suggested edits that match your resume to a job — using only experience you already have. Nothing is invented.</p>
    <div className="mt-9 grid gap-5 md:grid-cols-2">
      <div><Label htmlFor="job">Job description</Label><Textarea id="job" className="mt-2 min-h-72 bg-paper" placeholder="Paste the job posting here…" value={job} onChange={e => setJob(e.target.value)} /></div>
      <div><Label htmlFor="Resume">Your resume</Label><Textarea id="Resume" className="mt-2 min-h-72 bg-paper" placeholder="Paste the text of your resume here…" value={resume} onChange={e => setResume(e.target.value)} /></div>
    </div>
    <div className="mt-5 flex flex-wrap gap-3">
      {busy ? <Button variant="outline" onClick={() => ctrl.current?.abort()}><Square />Stop</Button>
        : <Button disabled={!ready} onClick={run}><Sparkles />Suggest tailored edits</Button>}
      {out && !busy && <Button variant="ghost" onClick={() => navigator.clipboard.writeText(out)}><Copy />Copy suggestions</Button>}
      {template && <Button variant="outline" asChild><Link to="/builder" search={{ template }}>Open in the {template} template</Link></Button>}
    </div>
    {!ready && <p className="mt-2 text-xs text-muted-foreground">Paste a few lines in both boxes to begin.</p>}
    {err && <p role="alert" className="mt-6 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{err}</p>}
    {(busy || out) && <section aria-live="polite" className="mt-8 border-t border-line pt-8">
      {busy && !out && <p className="text-sm text-muted-foreground animate-pulse">Reading the job and your resume…</p>}
      <div className="whitespace-pre-wrap text-sm leading-7">{out}</div>
      {out && !busy && <p className="mt-6 text-xs text-muted-foreground">Review every suggestion and only keep what is true for you.</p>}
    </section>}
  </main></div>;
}
