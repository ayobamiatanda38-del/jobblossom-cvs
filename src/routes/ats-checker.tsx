import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/ats-checker")({
  head: () => ({ meta: [
    { title: "ATS CV Checker — JobPrimed" }, { name: "description", content: "Check your CV against a job description for keyword coverage and readability." },
    { property: "og:title", content: "ATS CV Checker — JobPrimed" }, { property: "og:description", content: "Compare your CV and a role description with actionable checks." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: AtsChecker,
});

const stop = new Set("about after again also and are been from have into more most only over that them there these this through under very were what when where which while with your their role team company work experience years must able will required preferred including strong good using across knowledge skills candidate looking seeking".split(" "));
function words(s: string) { return new Set((s.toLowerCase().match(/[a-z][a-z+#.-]{2,}/g) ?? []).filter(w => !stop.has(w))); }

function AtsChecker() {
  const [cv, setCv] = useState(""); const [job, setJob] = useState("");
  const result = useMemo(() => {
    const terms = [...words(job)].filter(w => w.length > 3);
    const present = words(cv);
    const matched = terms.filter(w => present.has(w));
    return { score: terms.length ? Math.round(100 * matched.length / terms.length) : 0, missing: terms.filter(w => !present.has(w)).slice(0, 18), matched: matched.slice(0, 18) };
  }, [cv, job]);
  return <div className="min-h-screen bg-background"><SiteHeader /><main className="mx-auto max-w-5xl px-5 py-12 sm:py-20">
    <Button variant="ghost" asChild><Link to="/"><ArrowLeft />Home</Link></Button>
    <h1 className="mt-6 font-display text-4xl sm:text-6xl">ATS CV checker</h1>
    <p className="mt-3 max-w-2xl text-muted-foreground">Compare the words in your CV with a job posting. This is a keyword guide, not an employer’s actual ATS score.</p>
    <div className="mt-9 grid gap-5 md:grid-cols-2"><div><Label htmlFor="cv">Your CV text</Label><Textarea id="cv" className="mt-2 min-h-72 bg-paper" placeholder="Paste the text of your CV here…" value={cv} onChange={e => setCv(e.target.value)} /></div><div><Label htmlFor="job">Job description</Label><Textarea id="job" className="mt-2 min-h-72 bg-paper" placeholder="Paste the job description here…" value={job} onChange={e => setJob(e.target.value)} /></div></div>
    {cv.trim() && job.trim() && <section className="mt-8 border-t border-line pt-8" aria-live="polite"><div className="flex items-baseline gap-3"><strong className="font-display text-5xl text-primary">{result.score}%</strong><span className="text-muted-foreground">keyword coverage</span></div><p className="mt-3 text-sm text-muted-foreground">Use relevant terms naturally and keep your CV honest. Exact wording can matter, but this check does not evaluate layout or guarantee an interview.</p><div className="mt-7 grid gap-7 sm:grid-cols-2"><div><h2 className="flex items-center gap-2 font-semibold"><CheckCircle2 className="size-4 text-mint-strong" />Found in your CV</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">{result.matched.join(" · ") || "No matching terms yet."}</p></div><div><h2 className="flex items-center gap-2 font-semibold"><AlertCircle className="size-4 text-primary" />Consider adding if relevant</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">{result.missing.join(" · ") || "Great coverage of the detected terms."}</p></div></div></section>}
  </main></div>;
}