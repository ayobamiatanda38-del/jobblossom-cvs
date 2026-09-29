import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Download, Eye, FileText, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ResumePreview } from "@/components/resume-preview";

export const Route = createFileRoute("/builder")({
  head: () => ({ meta: [
    { title: "CV Builder — JobPrimed" },
    { name: "description", content: "Build and preview your professional JobPrimed CV step by step." },
    { property: "og:title", content: "CV Builder — JobPrimed" },
    { property: "og:description", content: "Build a clear, professional and ATS-ready CV with JobPrimed." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ]}), component: BuilderPage,
});

const initial = { name: "Amara Okafor", title: "Product Marketing Manager", email: "amara@email.com", phone: "+234 801 234 5678", location: "Lagos, Nigeria", summary: "Strategic product marketer with 7+ years of experience turning customer insight into campaigns that drive adoption and sustainable growth.", company: "CloudNine Africa", role: "Senior Product Marketing Manager", experience: "Led go-to-market strategy across three markets, increasing qualified pipeline by 38%. Built a customer research programme that shaped two successful product launches.", school: "University of Lagos", degree: "B.Sc. Business Administration", skills: "Go-to-market strategy, Customer research, Analytics, Brand positioning" };
const steps = ["Personal", "Profile", "Experience", "Education", "Skills"];

function BuilderPage() {
  const [data, setData] = useState(initial); const [step, setStep] = useState(0); const [preview, setPreview] = useState(false);
  const update = (key: keyof typeof data, value: string) => setData((old) => ({...old,[key]:value}));
  const fields = useMemo(() => [
    [["name","Full name"],["title","Professional title"],["email","Email"],["phone","Phone"],["location","Location"]],
    [["summary","Professional summary"]], [["role","Role"],["company","Company"],["experience","Impact and achievements"]],
    [["degree","Degree or qualification"],["school","School or institution"]], [["skills","Key skills"]],
  ] as const, []);
  return <div className="min-h-screen bg-muted"><header className="flex h-16 items-center justify-between border-b border-line bg-paper px-4 sm:px-6"><Link to="/" className="flex items-center gap-2 font-bold"><span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground"><FileText className="size-4"/></span>JobPrimed</Link><div className="flex items-center gap-2"><Button variant="outline" size="sm" className="lg:hidden" onClick={()=>setPreview(!preview)}><Eye />{preview?"Edit":"Preview"}</Button><Button variant="ink" size="sm" onClick={()=>window.print()}><Download />Download</Button></div></header>
    <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[540px_1fr]">
      <aside className={`${preview?"hidden":"block"} min-h-[calc(100vh-64px)] border-r border-line bg-paper p-5 sm:p-8 lg:block`}><Link to="/" className="mb-7 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-ink"><ArrowLeft className="size-4"/>Back to home</Link><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-primary">Step {step+1} of {steps.length}</p><h1 className="mt-1 font-display text-3xl">{steps[step]}</h1></div><span className="text-sm font-bold">{Math.round(((step+1)/steps.length)*100)}%</span></div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-all" style={{width:`${((step+1)/steps.length)*100}%`}}/></div>
        <div className="mt-8 space-y-5">{fields[step].map(([key,label])=><div key={key}><Label htmlFor={key}>{label}</Label>{["summary","experience","skills"].includes(key)?<Textarea id={key} rows={key==="experience"?6:4} className="mt-2 min-h-28 bg-background" value={data[key]} onChange={(e)=>update(key,e.target.value)}/>:<Input id={key} className="mt-2 h-11 bg-background" value={data[key]} onChange={(e)=>update(key,e.target.value)}/>}</div>)}</div>
        {step===1&&<Button variant="secondary" className="mt-4 w-full" onClick={()=>update("summary","Results-driven professional known for turning customer insight into focused campaigns, stronger adoption and measurable commercial growth.")}><Sparkles/>Polish this summary</Button>}
        <div className="mt-9 flex justify-between"><Button variant="outline" disabled={step===0} onClick={()=>setStep(s=>Math.max(0,s-1))}>Previous</Button>{step<steps.length-1?<Button onClick={()=>setStep(s=>Math.min(steps.length-1,s+1))}>Continue</Button>:<Button variant="ink" onClick={()=>setPreview(true)}><Check/>Finish CV</Button>}</div>
      </aside>
      <main className={`${preview?"block":"hidden"} min-h-[calc(100vh-64px)] p-4 sm:p-8 lg:block lg:p-12`}><div className="mx-auto max-w-[670px]"><div className="mb-4 hidden items-center justify-between lg:flex"><p className="text-sm font-semibold">Live preview</p><span className="rounded-full bg-mint px-3 py-1 text-xs font-bold text-mint-strong">ATS friendly</span></div><ResumePreview data={data}/></div></main>
    </div>
  </div>;
}