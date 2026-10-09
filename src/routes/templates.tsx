import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { ResumePreview } from "@/components/resume-preview";
import { INDUSTRIES, TEMPLATES } from "@/lib/templates";

export const Route = createFileRoute("/templates")({
  validateSearch: z.object({ next: z.enum(["tailor", "builder"]).optional() }),
  head: () => ({ meta: [
    { title: "Resume Templates & Examples — JobPrimed" }, { name: "description", content: "Browse 16 ATS-friendly resume templates and examples. Pick one to start building or tailoring." },
    { property: "og:title", content: "Resume Templates & Examples — JobPrimed" }, { property: "og:description", content: "ATS-friendly resume templates for every industry." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: Templates,
});

function Templates() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const [f, setF] = useState("All");
  const [leaving, setLeaving] = useState(false);
  const list = f === "All" ? TEMPLATES : TEMPLATES.filter((t) => t.industry === f);
  const pick = (id: string) => {
    setLeaving(true);
    setTimeout(() => next === "tailor" ? navigate({ to: "/resume-tailor", search: { template: id } }) : navigate({ to: "/builder", search: { template: id } }), 250);
  };
  return <div className={`min-h-screen bg-background transition-opacity duration-300 ${leaving ? "opacity-0" : "opacity-100"}`}><SiteHeader /><main className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
    <Button variant="ghost" asChild><Link to="/"><ArrowLeft />Home</Link></Button>
    <h1 className="mt-6 font-display text-4xl sm:text-6xl">Choose your resume template</h1>
    <p className="mt-3 text-muted-foreground">{next === "tailor" ? "Pick a template, then we'll tailor your resume to the job." : next === "builder" ? "Pick a template, then fill it in step by step." : "Every template is ATS-friendly. Switch anytime — your content stays."}</p>
    <div className="mt-6 flex gap-2 overflow-x-auto">{INDUSTRIES.map((x) => <Button key={x} size="sm" variant={f === x ? "ink" : "outline"} onClick={() => setF(x)}>{x}</Button>)}</div>
    <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{list.map((t) => <button key={t.id} onClick={() => pick(t.id)} className="group border border-line bg-paper p-2 text-left transition hover:-translate-y-1 hover:border-primary">
      <div className="pointer-events-none"><ResumePreview data={t.sample} template={t} /></div>
      <div className="flex items-center justify-between p-1 pt-2"><div className="min-w-0"><p className="truncate text-sm font-bold">{t.name}</p><p className="truncate text-[11px] text-muted-foreground">{t.industry}</p></div>{t.pro && <span className="flex items-center gap-1 rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold text-paper"><LockKeyhole className="size-3" />PRO</span>}</div>
    </button>)}</div>
  </main></div>;
}
