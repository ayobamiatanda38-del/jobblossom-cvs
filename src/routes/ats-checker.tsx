import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, AlertCircle, Upload, Loader2, Wand2, FilePlus2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SiteHeader } from "@/components/site-header";
import { FLOW_KEY, readResumeFile } from "@/lib/read-resume-file";

export const Route = createFileRoute("/ats-checker")({
  head: () => ({ meta: [
    { title: "ATS Resume Checker — JobPrimed" }, { name: "description", content: "Upload your resume and a job description to get an instant ATS keyword score." },
    { property: "og:title", content: "ATS Resume Checker — JobPrimed" }, { property: "og:description", content: "Upload your resume, get a real-time ATS score, then tailor or rebuild it." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: AtsChecker,
});

const stop = new Set("about after again also and are been from have into more most only over that them there these this through under very were what when where which while with your their role team company work experience years must able will required preferred including strong good using across knowledge skills candidate looking seeking".split(" "));
function words(s: string) { return new Set((s.toLowerCase().match(/[a-z][a-z+#.-]{2,}/g) ?? []).filter(w => !stop.has(w))); }

function AtsChecker() {
  const navigate = useNavigate();
  const [cv, setCv] = useState(""); const [job, setJob] = useState("");
  const [fileName, setFileName] = useState(""); const [reading, setReading] = useState(false); const [err, setErr] = useState("");
  const [checked, setChecked] = useState(false); const [popup, setPopup] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const result = useMemo(() => {
    const terms = [...words(job)].filter(w => w.length > 3);
    const present = words(cv);
    const matched = terms.filter(w => present.has(w));
    return { score: terms.length ? Math.round(100 * matched.length / terms.length) : 0, missing: terms.filter(w => !present.has(w)).slice(0, 18), matched: matched.slice(0, 18) };
  }, [cv, job]);
  const onFile = async (f?: File) => {
    if (!f) return; setErr(""); setReading(true);
    try { const t = await readResumeFile(f); if (!t.trim()) throw new Error("We couldn't read text from that file. Try another format."); setCv(t); setFileName(f.name); }
    catch (e) { setErr((e as Error).message); } finally { setReading(false); }
  };
  const check = () => { setChecked(true); setTimeout(() => setPopup(true), 1400); };
  const choose = (next: "tailor" | "builder") => {
    sessionStorage.setItem(FLOW_KEY, JSON.stringify({ resume: cv, job }));
    setPopup(false);
    navigate({ to: "/templates", search: { next } });
  };
  const ready = cv.trim() && job.trim();
  return <div className="min-h-screen bg-background"><SiteHeader /><main className="mx-auto max-w-5xl px-5 py-12 sm:py-20">
    <Button variant="ghost" asChild><Link to="/"><ArrowLeft />Home</Link></Button>
    <h1 className="mt-6 font-display text-4xl sm:text-6xl">ATS resume checker</h1>
    <p className="mt-3 max-w-2xl text-muted-foreground">Upload your resume and paste the job posting. You'll get an instant keyword score — a guide, not an employer's actual ATS result.</p>
    <div className="mt-9 grid gap-5 md:grid-cols-2">
      <div><Label>Your resume</Label>
        <button type="button" onClick={() => input.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}
          className="mt-2 flex min-h-72 w-full flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-line bg-paper p-6 text-center transition hover:border-primary">
          {reading ? <Loader2 className="size-8 animate-spin text-primary" /> : fileName ? <FileText className="size-8 text-mint-strong" /> : <Upload className="size-8 text-primary" />}
          <span className="font-bold">{fileName || "Upload your resume"}</span>
          <span className="text-sm text-muted-foreground">{fileName ? "Click to replace the file" : "PDF, Word (.docx) or .txt — drag & drop or click"}</span>
        </button>
        <input ref={input} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={e => onFile(e.target.files?.[0])} />
        {err && <p role="alert" className="mt-2 text-sm text-destructive">{err}</p>}
      </div>
      <div><Label htmlFor="job">Job description</Label><Textarea id="job" className="mt-2 min-h-72 bg-paper" placeholder="Paste the job description here…" value={job} onChange={e => setJob(e.target.value)} /></div>
    </div>
    <div className="mt-6 flex justify-center"><Button size="lg" variant="hero" disabled={!ready} onClick={check} className={ready && !checked ? "cta-shiny" : ""}>Check my ATS score now</Button></div>
    {checked && ready && <section className="mt-8 animate-in fade-in slide-in-from-bottom-4 border-t border-line pt-8 duration-500" aria-live="polite"><div className="flex items-baseline gap-3"><strong className="font-display text-5xl text-primary">{result.score}%</strong><span className="text-muted-foreground">keyword coverage</span></div><p className="mt-3 text-sm text-muted-foreground">Use relevant terms naturally and keep your resume honest. This check does not evaluate layout or guarantee an interview.</p><div className="mt-7 grid gap-7 sm:grid-cols-2"><div><h2 className="flex items-center gap-2 font-semibold"><CheckCircle2 className="size-4 text-mint-strong" />Found in your resume</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">{result.matched.join(" · ") || "No matching terms yet."}</p></div><div><h2 className="flex items-center gap-2 font-semibold"><AlertCircle className="size-4 text-primary" />Consider adding if relevant</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">{result.missing.join(" · ") || "Great coverage of the detected terms."}</p></div></div>
      <div className="mt-8 flex justify-center"><Button size="lg" className="cta-shiny" onClick={() => setPopup(true)}><Wand2 />Improve my score</Button></div></section>}
    <Dialog open={popup} onOpenChange={setPopup}><DialogContent className="max-w-md animate-in zoom-in-95 duration-300">
      <DialogHeader><DialogTitle className="font-display text-3xl">Your score: {result.score}%</DialogTitle><DialogDescription>Raise it before you apply. Pick how you'd like to continue — you'll choose a template first.</DialogDescription></DialogHeader>
      <div className="grid gap-3">
        <Button size="lg" className="cta-shiny h-14 justify-start" onClick={() => choose("tailor")}><Wand2 />Tailor my resume to this job</Button>
        <Button size="lg" variant="outline" className="h-14 justify-start" onClick={() => choose("builder")}><FilePlus2 />Build a new resume from scratch</Button>
      </div>
    </DialogContent></Dialog>
  </main></div>;
}
