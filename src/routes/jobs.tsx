import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ExternalLink, Search, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/jobs")({
  head: () => ({ meta: [
    { title: "Job Board — Find Jobs in the US & Africa | JobPrimed" }, { name: "description", content: "Search jobs across the US, Nigeria, Ghana, Kenya and South Africa on the top job sites, then tailor your resume." },
    { property: "og:title", content: "JobPrimed Job Board" }, { property: "og:description", content: "One search across the best job sites for the US and Africa." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: Jobs,
});

const COUNTRIES = {
  "United States": [["LinkedIn", (q: string, l: string) => `https://www.linkedin.com/jobs/search/?keywords=${q}&location=${l}`], ["Indeed", (q: string, l: string) => `https://www.indeed.com/jobs?q=${q}&l=${l}`], ["Glassdoor", (q: string) => `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${q}`]],
  Nigeria: [["Jobberman", (q: string) => `https://www.jobberman.com/jobs?q=${q}`], ["LinkedIn", (q: string, l: string) => `https://www.linkedin.com/jobs/search/?keywords=${q}&location=${l}`], ["Indeed", (q: string, l: string) => `https://ng.indeed.com/jobs?q=${q}&l=${l}`]],
  Ghana: [["Jobberman Ghana", (q: string) => `https://www.jobberman.com.gh/jobs?q=${q}`], ["LinkedIn", (q: string, l: string) => `https://www.linkedin.com/jobs/search/?keywords=${q}&location=${l}`]],
  Kenya: [["BrighterMonday", (q: string) => `https://www.brightermonday.co.ke/jobs?q=${q}`], ["LinkedIn", (q: string, l: string) => `https://www.linkedin.com/jobs/search/?keywords=${q}&location=${l}`]],
  "South Africa": [["PNet", (q: string) => `https://www.pnet.co.za/jobs/${q}`], ["Careers24", (q: string) => `https://www.careers24.com/jobs/kw-${q}/`], ["LinkedIn", (q: string, l: string) => `https://www.linkedin.com/jobs/search/?keywords=${q}&location=${l}`]],
  Remote: [["LinkedIn (remote)", (q: string) => `https://www.linkedin.com/jobs/search/?keywords=${q}&f_WT=2`], ["We Work Remotely", (q: string) => `https://weworkremotely.com/remote-jobs/search?term=${q}`]],
} as const;
type Country = keyof typeof COUNTRIES;
const POPULAR = ["Software Engineer", "Data Analyst", "Product Manager", "Accountant", "Nurse", "Customer Service", "Marketing", "Project Manager"];

function Jobs() {
  const [q, setQ] = useState(""); const [country, setCountry] = useState<Country>("United States");
  const enc = encodeURIComponent(q.trim()); const loc = encodeURIComponent(country === "Remote" ? "" : country);
  return <div className="min-h-screen bg-background"><SiteHeader /><main className="mx-auto max-w-5xl px-5 py-12 sm:py-20">
    <Button variant="ghost" asChild><Link to="/"><ArrowLeft />Home</Link></Button>
    <h1 className="mt-6 font-display text-4xl sm:text-6xl">Job board</h1>
    <p className="mt-3 max-w-2xl text-muted-foreground">Search the top job sites for your country in one place. Found a role? Tailor your resume to it before you apply.</p>
    <div className="mt-8 grid gap-4 border border-line bg-paper p-5 sm:grid-cols-[1fr_auto]">
      <div><Label htmlFor="q">Job title or keyword</Label><div className="relative mt-2"><Search className="absolute left-3 top-3.5 size-4 text-muted-foreground" /><Input id="q" className="h-11 pl-9" placeholder="e.g. Data Analyst" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="mt-3 flex flex-wrap gap-1.5">{POPULAR.map((p) => <button key={p} onClick={() => setQ(p)} className="rounded-full border border-line px-3 py-1 text-xs hover:border-primary">{p}</button>)}</div></div>
      <div><Label htmlFor="c">Where</Label><select id="c" className="mt-2 h-11 w-full rounded-md border border-input bg-paper px-3 text-sm" value={country} onChange={(e) => setCountry(e.target.value as Country)}>{Object.keys(COUNTRIES).map((c) => <option key={c}>{c}</option>)}</select></div>
    </div>
    <div className="mt-6 grid gap-3 sm:grid-cols-2">{COUNTRIES[country].map(([name, url]) => <a key={name} href={q.trim() ? url(enc, loc) : undefined} target="_blank" rel="noreferrer" aria-disabled={!q.trim()} className={`flex items-center justify-between border border-line bg-paper p-5 transition ${q.trim() ? "hover:-translate-y-0.5 hover:border-primary" : "pointer-events-none opacity-50"}`}><span><b>{name}</b><br /><span className="text-sm text-muted-foreground">{q.trim() ? `"${q.trim()}" jobs · ${country}` : "Type a job title first"}</span></span><ExternalLink className="size-4 text-primary" /></a>)}</div>
    <div className="mt-10 flex flex-col items-center gap-3 border-t border-line pt-8 text-center"><p className="font-bold">Got a job description?</p><Button size="lg" className="cta-shiny" asChild><Link to="/ats-checker"><Wand2 />Check my ATS score for it</Link></Button></div>
  </main></div>;
}
