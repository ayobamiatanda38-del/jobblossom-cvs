import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Check, FileCheck2, MessageSquareText, Sparkles, Star, Target, WandSparkles } from "lucide-react";
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ResumePreview } from "@/components/resume-preview";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "JobPrimed — Build a CV that gets you hired" },
    { name: "description", content: "Create a polished, ATS-ready CV with JobPrimed. Build, tailor and improve every application in minutes." },
    { property: "og:title", content: "JobPrimed — Build a CV that gets you hired" },
    { property: "og:description", content: "Create a polished, ATS-ready CV and apply with confidence." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: HomePage,
});

const tools = [
  { id: "build", label: "Build your CV", title: "Turn your experience into a CV worth reading.", copy: "Choose a polished template and fill each section with focused guidance. JobPrimed keeps formatting tidy while you focus on your story.", icon: WandSparkles, tone: "bg-coral-soft" },
  { id: "ats", label: "Check your ATS score", title: "Pass the systems before you impress the humans.", copy: "Spot missing keywords, weak phrases and formatting issues before you apply. Get clear, practical fixes in seconds.", icon: FileCheck2, tone: "bg-mint" },
  { id: "tailor", label: "Tailor each application", title: "Make every application feel written for the role.", copy: "Match your strongest experience to the job description without rebuilding your CV from scratch.", icon: Target, tone: "bg-sky" },
];

const samples = [
  { name: "Growth Marketer", field: "Marketing", score: 94, tone: "bg-coral-soft", person: "Noah Williams" },
  { name: "Product Designer", field: "Design", score: 91, tone: "bg-sky", person: "Maya Chen" },
  { name: "Financial Analyst", field: "Finance", score: 96, tone: "bg-mint", person: "Tobi Adebayo" },
];

function HomePage() {
  const [active, setActive] = useState("build");
  const [filter, setFilter] = useState("All");
  const tool = tools.find((item) => item.id === active) ?? tools[0];
  const visible = filter === "All" ? samples : samples.filter((s) => s.field === filter);
  return <div className="overflow-hidden bg-background text-foreground"><SiteHeader />
    <main>
      <section className="relative border-b border-line">
        <div className="mx-auto grid min-h-[calc(100svh-68px)] max-w-7xl items-center gap-14 px-5 py-14 sm:py-20 lg:grid-cols-[1.02fr_.98fr] lg:px-8 lg:py-24">
          <div className="relative z-10 animate-enter">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em]"><Sparkles className="size-3.5 text-primary" />Your career, properly presented</p>
            <h1 className="max-w-3xl font-display text-5xl leading-[.98] sm:text-7xl lg:text-[5.4rem]">Build a CV.<br/><span className="text-primary">Own the room.</span></h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">From first draft to final interview, JobPrimed helps you create a sharp, ATS-ready CV that sounds like you—on your best day.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Button size="lg" variant="hero" asChild><Link to="/builder">Create my CV <ArrowRight /></Link></Button><Button size="lg" variant="outline" asChild><a href="#examples">Browse examples</a></Button></div>
            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm"><div className="flex -space-x-2">{["AO","MC","TA"].map((x,i)=><span key={x} className={`grid size-9 place-items-center rounded-full border-2 border-background text-[10px] font-bold ${i===0?"bg-coral-soft":i===1?"bg-sky":"bg-mint"}`}>{x}</span>)}</div><div><div className="flex text-primary">{Array.from({length:5}).map((_,i)=><Star key={i} className="size-3.5 fill-current" />)}</div><p className="mt-1 text-xs text-muted-foreground">Trusted by 50,000+ job seekers</p></div></div>
          </div>
          <div className="relative mx-auto w-full max-w-[510px] lg:mr-0">
            <div className="absolute -inset-4 -rotate-3 rounded-md bg-mint sm:-inset-7" />
            <div className="relative animate-paper"><ResumePreview compact /></div>
            <div className="absolute -bottom-5 -left-3 flex items-center gap-3 rounded-md border border-line bg-paper px-4 py-3 soft-shadow sm:-left-10"><span className="grid size-10 place-items-center rounded-full bg-mint font-bold text-mint-strong">96</span><div><strong className="text-sm">Excellent ATS score</strong><p className="text-xs text-muted-foreground">Ready to send</p></div></div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-ink text-paper"><div className="mx-auto grid max-w-6xl grid-cols-2 gap-px md:grid-cols-4">{[["50,000+","CVs created"],["3.2×","more callbacks"],["9,400+","interviews practised"],["4.8 / 5","average rating"]].map(([a,b])=><div key={b} className="border-line/20 px-5 py-8 text-center md:border-r"><p className="font-display text-3xl">{a}</p><p className="mt-1 text-xs text-paper/60">{b}</p></div>)}</div></section>

      <section id="tools" className="mx-auto max-w-7xl px-5 py-20 sm:py-28 lg:px-8"><div className="mx-auto max-w-3xl text-center"><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">One toolkit. Better applications.</p><h2 className="mt-4 font-display text-4xl leading-tight sm:text-6xl">Everything you need to move from maybe to hired.</h2></div>
        <div className="mt-12 flex gap-2 overflow-x-auto border-b border-line pb-px">{tools.map((item)=><Button key={item.id} variant="ghost" onClick={()=>setActive(item.id)} className={`h-auto shrink-0 rounded-none border-b-2 px-4 py-4 ${active===item.id?"border-primary text-ink":"border-transparent text-muted-foreground"}`}><item.icon />{item.label}</Button>)}</div>
        <div className={`grid items-center gap-10 p-6 sm:p-10 lg:grid-cols-2 lg:p-16 ${tool.tone}`}><div><tool.icon className="size-9 text-primary"/><h3 className="mt-6 font-display text-4xl leading-tight sm:text-5xl">{tool.title}</h3><p className="mt-5 max-w-lg leading-7 text-muted-foreground">{tool.copy}</p><Button variant="ink" size="lg" className="mt-7" asChild><Link to="/builder">Try it now <ArrowRight /></Link></Button></div><div className="mx-auto w-full max-w-sm rotate-2"><ResumePreview compact /></div></div>
      </section>

      <section id="examples" className="border-y border-line bg-paper py-20 sm:py-28"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Curated CV gallery</p><h2 className="mt-3 max-w-2xl font-display text-4xl sm:text-6xl">Real structure. Real clarity. Your story.</h2></div><div className="flex gap-2 overflow-x-auto">{["All","Marketing","Design","Finance"].map((x)=><Button key={x} size="sm" variant={filter===x?"ink":"outline"} onClick={()=>setFilter(x)}>{x}</Button>)}</div></div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">{visible.map((s)=><article key={s.name} className="border border-line bg-background p-3"><div className={`${s.tone} p-5`}><div className="mx-auto max-w-[230px] bg-paper p-5 soft-shadow"><p className="text-[9px] font-bold">{s.person}</p><p className="mt-1 text-[6px] text-primary">{s.name}</p><div className="mt-3 h-px bg-ink"/><p className="mt-3 text-[6px] font-bold uppercase">Profile</p><p className="mt-1 text-[5px] leading-relaxed text-muted-foreground">Results-focused professional with a record of making complex work clear and valuable.</p><p className="mt-3 text-[6px] font-bold uppercase">Experience</p><div className="mt-1 h-8 bg-muted"/></div></div><div className="flex items-center justify-between p-4"><div><h3 className="font-semibold">{s.name}</h3><p className="text-xs text-muted-foreground">{s.field} CV template</p></div><span className="rounded-full bg-mint px-2 py-1 text-xs font-bold">ATS {s.score}</span></div></article>)}</div>
      </div></section>

      <section id="how" className="mx-auto max-w-7xl px-5 py-20 sm:py-28 lg:px-8"><div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">How it works</p><h2 className="mt-3 font-display text-4xl sm:text-6xl">A better CV in three focused steps.</h2><p className="mt-5 leading-7 text-muted-foreground">No blank-page panic. No formatting fights. Just clear prompts that help you tell your strongest career story.</p></div><ol className="divide-y divide-line border-y border-line">{[["01","Choose your direction","Start with a proven format for your role and experience level."],["02","Shape your story","Add your experience with practical prompts and polished wording."],["03","Review and apply","Check clarity and ATS compatibility, then download with confidence."]].map(([n,t,c])=><li key={n} className="grid grid-cols-[50px_1fr] gap-4 py-7"><span className="font-display text-2xl text-primary">{n}</span><div><h3 className="text-lg font-bold">{t}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{c}</p></div></li>)}</ol></div></section>

      <section className="bg-sky py-20 sm:py-28"><div className="mx-auto max-w-6xl px-5 text-center"><MessageSquareText className="mx-auto size-9 text-primary"/><blockquote className="mx-auto mt-6 max-w-4xl font-display text-3xl leading-tight sm:text-5xl">“For the first time, my CV sounded like the professional I knew I was.”</blockquote><p className="mt-6 font-semibold">Chidinma Eze · Operations Manager</p><p className="mt-1 text-sm text-muted-foreground">Hired within five weeks</p></div></section>

      <section id="pricing" className="mx-auto max-w-5xl px-5 py-20 sm:py-28"><div className="grid overflow-hidden border border-ink md:grid-cols-[1.25fr_.75fr]"><div className="bg-ink p-8 text-paper sm:p-12"><p className="text-xs font-bold uppercase tracking-[.16em] text-coral-soft">Start for free</p><h2 className="mt-4 font-display text-4xl sm:text-5xl">One great CV can change the conversation.</h2><p className="mt-5 max-w-lg text-paper/70">Build and preview your CV at no cost. Upgrade when you’re ready for unlimited versions and advanced tailoring.</p></div><div className="bg-coral-soft p-8 sm:p-12"><p className="text-sm font-bold">JobPrimed Pro</p><p className="mt-2 font-display text-5xl">₦4,500</p><p className="text-sm text-muted-foreground">per month</p><ul className="my-6 space-y-3 text-sm">{["Unlimited CVs","ATS checks","Job-specific tailoring","Priority expert review"].map(x=><li key={x} className="flex gap-2"><Check className="size-4 text-primary"/>{x}</li>)}</ul><Button variant="ink" size="lg" className="w-full" asChild><Link to="/builder">Start building</Link></Button></div></div></section>

      <section id="faq" className="border-t border-line bg-paper py-20"><div className="mx-auto grid max-w-5xl gap-10 px-5 md:grid-cols-[.65fr_1.35fr]"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Questions, answered</p><h2 className="mt-3 font-display text-4xl">Before you begin.</h2></div><Accordion type="single" collapsible>{[["Can I build a CV for free?","Yes. You can build and preview your CV for free, then choose whether you need advanced tools."],["Will my CV work with ATS software?","Our layouts are designed for clean parsing, clear hierarchy and readable formatting used by modern applicant tracking systems."],["Can I tailor one CV to different jobs?","Yes. Keep your core career history, then create focused versions for each role."],["Is JobPrimed only for experienced professionals?","Not at all. The guided flow works for students, career changers and experienced professionals alike."]].map(([q,a])=><AccordionItem value={q} key={q}><AccordionTrigger className="py-6 text-left text-base font-bold hover:no-underline">{q}</AccordionTrigger><AccordionContent className="max-w-xl pb-6 leading-6 text-muted-foreground">{a}</AccordionContent></AccordionItem>)}</Accordion></div></section>
    </main>
    <footer className="bg-ink text-paper"><div className="mx-auto max-w-7xl px-5 py-12 lg:px-8"><div className="flex flex-col justify-between gap-8 border-b border-paper/15 pb-10 sm:flex-row"><div><p className="font-display text-3xl">JobPrimed</p><p className="mt-2 max-w-xs text-sm text-paper/60">Build your story. Prime your future.</p></div><div className="grid grid-cols-2 gap-x-14 gap-y-3 text-sm text-paper/70"><a href="#tools">CV tools</a><a href="#examples">Examples</a><a href="#how">How it works</a><a href="#faq">FAQ</a></div></div><div className="flex flex-col justify-between gap-3 pt-6 text-xs text-paper/45 sm:flex-row"><p>© 2026 JobPrimed. All rights reserved.</p><p>Made for ambitious job seekers.</p></div></div></footer>
  </div>;
}