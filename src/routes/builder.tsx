import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft, Award, BookOpen, BriefcaseBusiness, Check, ChevronDown, ChevronLeft, ChevronRight,
  CircleUserRound, CloudCheck, Download, Eye, FileText, FolderKanban, GraduationCap, Languages,
  LayoutTemplate, Lightbulb, LockKeyhole, Loader2, Minus, Palette, Pencil, Plus, ShieldCheck,
  Sparkles, Trash2, Trophy, Users, ZoomIn,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ResumePreview } from "@/components/resume-preview";
import { AiSuggest } from "@/components/ai-suggest";
import { PLANS, TEMPLATES, INDUSTRIES, getTemplate, type ResumeData } from "@/lib/templates";
import { useSession } from "@/hooks/use-session";
import { useServerFn } from "@tanstack/react-start";
import { getCheckoutCountry, getCheckoutQuote, getProAccess, startCheckout, verifyPayment } from "@/lib/payments.functions";

import { CV_BACKGROUNDS } from "@/lib/cv-design";
import { CHECKOUT_MARKETS, marketFor, money, type Country, type CheckoutQuote } from "@/lib/checkout-markets";
import { exportCvPdf } from "@/lib/cv-pdf";

export const Route = createFileRoute("/builder")({
  validateSearch: z.object({ template: z.string().optional(), checkout: z.boolean().optional(), reference: z.string().optional(), trxref: z.string().optional() }),
  head: () => ({ meta: [
    { title: "CV Editor & Templates — JobPrimed" },
    { name: "description", content: "Fill in, style and download an ATS-ready CV with JobPrimed's guided editor and 16 original templates." },
    { property: "og:title", content: "CV Editor & Templates — JobPrimed" },
    { property: "og:description", content: "Guided CV sections, live preview, autosave and PDF download." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: BuilderPage,
});

type SectionId = "personal" | "profile" | "experience" | "education" | "skills" | "projects" | "languages" | "strengths" | "courses" | "awards" | "references" | "design";
const SECTIONS: { id: SectionId; label: string; icon: typeof FileText; pro?: boolean }[] = [
  { id: "personal", label: "Personal info", icon: CircleUserRound },
  { id: "profile", label: "Profile", icon: FileText },
  { id: "experience", label: "Experience", icon: BriefcaseBusiness },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "skills", label: "Skills", icon: Lightbulb },
  { id: "projects", label: "Projects", icon: FolderKanban, pro: true },
  { id: "languages", label: "Languages", icon: Languages, pro: true },
  { id: "references", label: "References", icon: Users, pro: true },
  { id: "strengths", label: "Strengths", icon: Award, pro: true },
  { id: "courses", label: "Certifications", icon: BookOpen, pro: true },
  { id: "awards", label: "Awards", icon: Trophy, pro: true },
  { id: "design", label: "Design", icon: Palette, pro: true },
];
const TIPS: Partial<Record<SectionId, string[]>> = {
  profile: ["Lead with your title and years of experience.", "Name 2–3 strengths the job ad asks for.", "Keep it to 3–4 lines."],
  experience: ["Start bullets with strong verbs: Led, Built, Grew.", "Quantify results — %, $, time saved.", "One line per achievement."],
  skills: ["Mirror keywords from the job description.", "Separate skills with commas."],
};
const STORE = "jobprimed:cv:v1";
const emptyCV = (t: string): ResumeData => ({ ...getTemplate(t).sample, name: "", title: "", email: "", phone: "", location: "", website: "", summary: "", experience: [], education: [], skills: "", strengths: "", projects: "", languages: "", courses: "", awards: "", references: "" });

function BuilderPage() {
  const search = Route.useSearch();
  const { user } = useSession();
  const navigate = useNavigate();
  const [templateId, setTemplateId] = useState(search.template ?? "prime");
  const [data, setData] = useState<ResumeData>(emptyCV(search.template ?? "prime"));
  const [accent, setAccent] = useState<string | undefined>();
  const [active, setActive] = useState<SectionId>("personal");
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [zoom, setZoom] = useState(100);
  const [isPro, setIsPro] = useState(false);
  const [saved, setSaved] = useState<"idle" | "saving" | "saved">("idle");
  const [loaded, setLoaded] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(!!search.checkout);
  const [exportOpen, setExportOpen] = useState(false);
  const t = getTemplate(templateId);

  // Restore autosaved draft (unless user arrived by picking a specific template).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE);
      if (raw) {
        const s = JSON.parse(raw) as { data: ResumeData; templateId: string; accent?: string };
        if (search.template && search.template !== s.templateId) { setTemplateId(search.template); setData(s.data); }
        else { setData(s.data); setTemplateId(s.templateId); setAccent(s.accent); }
      }
    } catch { /* ignore corrupt draft */ }
    setLoaded(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!loaded) return;
    setSaved("saving");
    const id = setTimeout(() => { localStorage.setItem(STORE, JSON.stringify({ data, templateId, accent })); setSaved("saved"); }, 600);
    return () => clearTimeout(id);
  }, [data, templateId, accent, loaded]);

  const accessFn = useServerFn(getProAccess);
  useEffect(() => {
    if (!user) { setIsPro(false); return; }
    accessFn().then((r) => setIsPro(r.active)).catch(() => setIsPro(false));
  }, [user, accessFn]);
  const verifyFn = useServerFn(verifyPayment);
  const [paid, setPaid] = useState(false);
  useEffect(() => {
    const ref = search.reference ?? search.trxref;
    if (!ref || !user) return;
    verifyFn({ data: { reference: ref } }).then((r) => {
      if (r.ok) { setIsPro(true); setPaid(true); setCheckoutOpen(true); }
      window.history.replaceState(null, "", "/builder");
    }).catch(() => {});
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps
  const up = <K extends keyof ResumeData>(k: K, v: ResumeData[K]) => setData((d) => ({ ...d, [k]: v }));
  const needPro = () => setCheckoutOpen(true);
  const pick = (id: SectionId) => setActive(id);
  const idx = SECTIONS.findIndex((s) => s.id === active);
  const go = (d: number) => {
    let next = idx + d;
    const n = SECTIONS[next];
    if (n) setActive(n.id);
  };
  const premiumItems = [
    ...(t.pro ? [`${t.name} template`] : []),
    ...SECTIONS.filter((s) => s.pro && s.id !== "design" && String(data[s.id as keyof ResumeData] ?? "").trim()).map((s) => s.label),
    ...(accent && (CV_BACKGROUNDS.find((c) => c.id === accent)?.pro ?? true) ? ["Premium background colour"] : []),
  ];
  const locked = premiumItems.length > 0 && !isPro;
  const download = () => {
    if (!user) { navigate({ to: "/auth", search: { mode: "signup" } }); return; }
    setExportOpen(true);
  };

  return <div className="min-h-screen bg-muted text-foreground">
    <header className="sticky top-0 z-40 grid h-14 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-line bg-paper px-2 sm:h-16 sm:px-5">
      <div className="flex min-w-0 items-center gap-2">
        <Button variant="ghost" size="icon" asChild title="Back"><Link to="/"><ArrowLeft /></Link></Button>
        <Link to="/" className="hidden items-center gap-2 font-bold sm:flex"><span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground"><FileText className="size-4" /></span>JobPrimed</Link>
        <div className="min-w-0 sm:ml-3 sm:border-l sm:border-line sm:pl-3">
          <p className="truncate text-sm font-semibold">{data.name || "Untitled"} — {t.name}</p>
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">{saved === "saving" ? <><Loader2 className="size-3 animate-spin" />Saving…</> : <><CloudCheck className="size-3" />Saved on this device</>}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        {!user && <Button variant="ghost" size="sm" className="hidden md:inline-flex" asChild><Link to="/auth" search={{ mode: "signin" }}>Log in</Link></Button>}
        {isPro ? <span className="hidden rounded-full bg-mint px-3 py-1 text-xs font-bold text-mint-strong sm:inline">Pro</span>
          : <Button variant="secondary" size="sm" onClick={needPro}><Sparkles /><span className="hidden sm:inline">Upgrade</span></Button>}
        <Button variant="ink" size="sm" onClick={download}><Download /><span className="hidden sm:inline">Download PDF</span></Button>
      </div>
    </header>

    {/* mobile section tabs */}
    <div className={`${view === "preview" ? "hidden" : "flex"} sticky top-14 z-30 gap-1 overflow-x-auto border-b border-line bg-paper px-2 py-2 lg:hidden`}>
      {SECTIONS.map((s) => <button key={s.id} onClick={() => pick(s.id)} className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${active === s.id ? "bg-ink text-paper" : "bg-muted text-muted-foreground"}`}><s.icon className="size-3.5" />{s.label}{s.pro && !isPro && <LockKeyhole className="size-3" />}</button>)}
    </div>

    <div className="cv-editor lg:grid lg:grid-cols-[210px_minmax(400px,500px)_1fr]">
      <nav className="sticky top-16 hidden h-[calc(100vh-64px)] overflow-y-auto border-r border-line bg-paper p-3 lg:block">
        <p className="px-2 pb-2 pt-1 text-xs font-bold uppercase text-muted-foreground">CV sections</p>
        {SECTIONS.map((s) => <Button key={s.id} variant="ghost" onClick={() => pick(s.id)} className={`h-10 w-full justify-start px-2 ${active === s.id ? "bg-coral-soft text-ink" : "text-muted-foreground"}`}><s.icon /><span className="flex-1 text-left">{s.label}</span>{s.pro && !isPro && <LockKeyhole className="size-3.5" />}</Button>)}
        <button onClick={() => setTemplateOpen(true)} className="mt-4 w-full border border-line p-2 text-left hover:border-ink"><div className="pointer-events-none"><ResumePreview data={data} template={t} accent={accent} /></div><p className="mt-2 flex items-center justify-between text-xs font-bold">Change template<ChevronRight className="size-3.5" /></p></button>
      </nav>

      <section className={`${view === "edit" ? "block" : "hidden"} border-r border-line bg-background pb-24 lg:block lg:pb-0`}>
        <div className="mx-auto max-w-xl p-4 sm:p-7">
          <p className="text-xs font-bold uppercase text-primary">Step {idx + 1} of {SECTIONS.length}</p>
          <h1 className="mt-1 font-display text-3xl">{SECTIONS[idx]?.label}</h1>
          <div className="mt-6"><Editor active={active} data={data} up={up} isPro={isPro} needPro={needPro} accent={accent ?? t.accent} setAccent={setAccent} openTemplates={() => setTemplateOpen(true)} templateName={t.name} /></div>
          {TIPS[active] && <div className="mt-6 border border-line bg-sky/60 p-4 text-sm"><p className="mb-2 flex items-center gap-2 font-bold"><Lightbulb className="size-4 text-primary" />Recruiter tips</p><ul className="list-disc space-y-1 pl-5 text-muted-foreground">{TIPS[active]?.map((x) => <li key={x}>{x}</li>)}</ul></div>}
          <div className="mt-8 flex justify-between"><Button variant="ghost" disabled={idx === 0} onClick={() => go(-1)}><ChevronLeft />Back</Button>
            {active === "design" ? <Button onClick={download}><Download />Finish & download</Button> : <Button onClick={() => go(1)}>Next<ChevronRight /></Button>}</div>
        </div>
      </section>

      <main className={`${view === "preview" ? "block" : "hidden"} bg-muted pb-24 lg:block lg:pb-0`}>
        <div className="sticky top-14 z-20 flex h-12 items-center justify-between border-b border-line bg-paper px-3 sm:top-16">
          <Button variant="outline" size="sm" onClick={() => setTemplateOpen(true)}><LayoutTemplate />{t.name}{t.pro && <LockKeyhole className={isPro ? "hidden" : ""} />}<ChevronDown /></Button>
          <div className="hidden items-center gap-1 sm:flex"><Button variant="ghost" size="icon" onClick={() => setZoom((z) => Math.max(60, z - 10))}><Minus /></Button><span className="w-10 text-center text-xs font-semibold">{zoom}%</span><Button variant="ghost" size="icon" onClick={() => setZoom((z) => Math.min(130, z + 10))}><ZoomIn /></Button></div>
        </div>
        <div className="flex justify-center overflow-auto p-3 sm:p-8">
          <div className="relative w-full max-w-[640px] origin-top transition-transform" style={{ transform: `scale(${zoom / 100})` }}>
            <ResumePreview data={data} template={t} accent={accent} />
            {locked && <div className="absolute inset-x-0 bottom-6 mx-auto w-fit rounded-full bg-ink px-4 py-2 text-xs font-bold text-paper">Pro template · <button className="underline" onClick={needPro}>Unlock to download</button></div>}
          </div>
        </div>
      </main>
    </div>

    {/* mobile bottom bar */}
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t border-line bg-paper p-3 lg:hidden">
      <Button variant={view === "edit" ? "ink" : "outline"} onClick={() => setView("edit")}><Pencil />Edit</Button>
      <Button variant={view === "preview" ? "ink" : "outline"} onClick={() => setView("preview")}><Eye />Preview</Button>
    </div>

    {/* hidden full-size render for PDF */}
    <div aria-hidden className="pointer-events-none fixed -left-[9999px] top-0 w-[794px]"><div id="cv-export"><ResumePreview data={data} template={t} accent={accent} className="shadow-none" /></div></div>

    <TemplateDialog open={templateOpen} onOpenChange={setTemplateOpen} data={data} current={templateId} isPro={isPro} onPick={(id) => { setTemplateId(id); setAccent(undefined); setTemplateOpen(false); }} />
    <CheckoutDialog open={checkoutOpen} onOpenChange={setCheckoutOpen} email={user?.email} paid={paid} premiumItems={premiumItems} />
    <ExportDialog open={exportOpen} onOpenChange={setExportOpen} name={data.name} locked={locked} premiumItems={premiumItems} onUpgrade={() => { setExportOpen(false); setCheckoutOpen(true); }} />
  </div>;
}

function Editor({ active, data, up, isPro, needPro, accent, setAccent, openTemplates, templateName }: {
  active: SectionId; data: ResumeData; up: <K extends keyof ResumeData>(k: K, v: ResumeData[K]) => void; isPro: boolean; needPro: () => void;
  accent: string; setAccent: (c: string) => void; openTemplates: () => void; templateName: string;
}) {
  void isPro; void needPro;
  const join = (a: string, b: string, sep: string) => (a.trim() ? `${a.trim()}${sep}${b}` : b);
  const text = (k: keyof ResumeData, label: string, hint?: string) => { const cur = (data[k] as string) ?? ""; const sep = k === "skills" || k === "strengths" ? ", " : "\n"; return <div><Label htmlFor={k}>{label}</Label><Textarea id={k} rows={7} className="mt-2 bg-paper" value={cur} placeholder={PLACEHOLDERS[k] ?? `Add your ${label.toLowerCase()} here…`} onChange={(e) => up(k, e.target.value as never)} />{hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}<AiSuggest jobTitle={data.title} section={label} current={cur} onUse={(t, m) => up(k, (m === "append" ? join(cur, t, sep) : t) as never)} /></div>; };
  switch (active) {
    case "personal": return <div className="grid gap-4 sm:grid-cols-2">
      <F label="Full name" v={data.name} on={(v) => up("name", v)} /><F label="Job title" v={data.title} on={(v) => up("title", v)} />
      <F label="Email" v={data.email} on={(v) => up("email", v)} /><F label="Phone" v={data.phone} on={(v) => up("phone", v)} />
      <F label="City, Country" v={data.location} on={(v) => up("location", v)} /><F label="Website / LinkedIn" v={data.website} on={(v) => up("website", v)} />
    </div>;
    case "profile": return <div>{text("summary", "Professional summary")}<p className="mt-1 text-right text-xs text-muted-foreground">{data.summary.length} characters</p></div>;
    case "experience": return <List items={data.experience} onChange={(v) => up("experience", v)} blank={{ role: "", company: "", period: "", details: "" }} title={(e) => e.role || "New position"}
      render={(e, set) => <div className="grid gap-3 sm:grid-cols-2"><F label="Job title" v={e.role} on={(v) => set({ ...e, role: v })} /><F label="Employer" v={e.company} on={(v) => set({ ...e, company: v })} /><div className="sm:col-span-2"><F label="Dates" v={e.period} on={(v) => set({ ...e, period: v })} /></div><div className="sm:col-span-2"><Label>Achievements (one per line)</Label><Textarea rows={5} className="mt-2 bg-paper" value={e.details} placeholder="Led a team of 5 to improve delivery time by 20%…" onChange={(x) => set({ ...e, details: x.target.value })} /><AiSuggest jobTitle={e.role || data.title} section="Work experience achievements" context={e.company ? `Employer: ${e.company}` : undefined} current={e.details} onUse={(t, m) => set({ ...e, details: m === "append" ? join(e.details, t, "\n") : t })} /></div></div>} />;
    case "education": return <List items={data.education} onChange={(v) => up("education", v)} blank={{ degree: "", school: "", period: "" }} title={(e) => e.degree || "New qualification"}
      render={(e, set) => <div className="grid gap-3 sm:grid-cols-2"><F label="Degree" v={e.degree} on={(v) => set({ ...e, degree: v })} /><F label="School" v={e.school} on={(v) => set({ ...e, school: v })} /><div className="sm:col-span-2"><F label="Dates" v={e.period} on={(v) => set({ ...e, period: v })} /></div></div>} />;
    case "skills": return text("skills", "Skills", "Separate with commas — each becomes a tag.");
    case "projects": return text("projects", "Projects");
    case "languages": return text("languages", "Languages", "e.g. English — Native · French — Conversational");
    case "references": return text("references", "References");
    case "strengths": return text("strengths", "Strengths");
    case "courses": return text("courses", "Certifications & courses");
    case "awards": return text("awards", "Awards & honours");
    case "design": return <div className="space-y-5">
      <button onClick={openTemplates} className="flex w-full items-center justify-between border border-line bg-paper p-4 text-left hover:border-ink"><span className="flex items-center gap-3"><LayoutTemplate className="text-primary" /><span><b>Template</b><br /><span className="text-sm text-muted-foreground">{templateName}</span></span></span><ChevronRight /></button>
      <div className="border border-line bg-paper p-4"><p className="font-bold">Background colour</p><div className="mt-3 grid grid-cols-4 gap-3">{CV_BACKGROUNDS.map((a) => <div key={a.id} className="text-center"><Button variant="outline" size="icon" title={`${a.name}${a.pro ? " · Premium" : ""}`} aria-label={`${a.name}${a.pro ? " premium background" : " background"}`} onClick={() => setAccent(a.id)} className={`relative size-10 rounded-full ${accent === a.id ? "ring-2 ring-ink ring-offset-2" : ""}`} style={{ background: `var(${a.token})` }}>{accent === a.id ? <Check className="size-4 text-ink" /> : a.pro ? <Sparkles className="size-3.5 text-ink" /> : null}</Button><p className="mt-1 text-xs text-muted-foreground">{a.name}</p></div>)}</div></div>
    </div>;
  }
}

const PLACEHOLDERS: Partial<Record<keyof ResumeData, string>> = { summary: "Experienced professional with a record of…", skills: "Project management, Data analysis, Communication", projects: "Describe a project and the impact it made…", languages: "English — Native", references: "Available on request", strengths: "Communication, Leadership", courses: "Certification — Issuer, Year", awards: "Award — Organization, Year" };
const FIELD_HINTS: Record<string, string> = { "Full name": "Your full name", "Job title": "e.g. Product Designer", "Email": "name@example.com", "Phone": "+234 000 000 0000", "City, Country": "Lagos, Nigeria", "Website / LinkedIn": "linkedin.com/in/yourname", "Dates": "Jan 2022 — Present", "Degree": "B.Sc. Computer Science", "School": "University name", "Employer": "Company name", "Email address": "name@example.com" };

function F({ label, v, on }: { label: string; v: string; on: (v: string) => void }) {
  const id = label.toLowerCase().replace(/\W+/g, "-");
  return <div><Label htmlFor={id}>{label}</Label><Input id={id} className="mt-2 h-11 bg-paper" value={v} placeholder={FIELD_HINTS[label] ?? label} onChange={(e) => on(e.target.value)} /></div>;
}

function List<T>({ items, onChange, blank, title, render }: { items: T[]; onChange: (v: T[]) => void; blank: T; title: (t: T) => string; render: (t: T, set: (t: T) => void) => React.ReactNode }) {
  const [open, setOpen] = useState(0);
  return <div className="space-y-3">{items.map((it, i) => <div key={i} className="border border-line bg-paper">
    <div className="flex items-center gap-2 p-3"><button className="min-w-0 flex-1 truncate text-left text-sm font-bold" onClick={() => setOpen(open === i ? -1 : i)}>{title(it)}</button><Button variant="ghost" size="icon" title="Delete" onClick={() => onChange(items.filter((_, j) => j !== i))}><Trash2 /></Button><ChevronDown className={`size-4 transition ${open === i ? "rotate-180" : ""}`} /></div>
    {open === i && <div className="border-t border-line p-3">{render(it, (n) => onChange(items.map((x, j) => (j === i ? n : x))))}</div>}
  </div>)}<Button variant="outline" className="w-full" onClick={() => { onChange([...items, blank]); setOpen(items.length); }}><Plus />Add another</Button></div>;
}

function TemplateDialog({ open, onOpenChange, data, current, isPro, onPick }: { open: boolean; onOpenChange: (o: boolean) => void; data: ResumeData; current: string; isPro: boolean; onPick: (id: string) => void }) {
  const [f, setF] = useState("All");
  const list = f === "All" ? TEMPLATES : TEMPLATES.filter((t) => t.industry === f);
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[92vh] w-[96vw] max-w-5xl overflow-y-auto p-0">
    <DialogHeader className="border-b border-line p-5"><DialogTitle className="font-display text-2xl sm:text-3xl">Choose a template</DialogTitle><DialogDescription>Switch anytime — your content stays. Pro templates can be previewed free.</DialogDescription></DialogHeader>
    <div className="flex gap-2 overflow-x-auto px-5 pt-4">{INDUSTRIES.map((x) => <Button key={x} size="sm" variant={f === x ? "ink" : "outline"} onClick={() => setF(x)}>{x}</Button>)}</div>
    <div className="grid grid-cols-2 gap-3 p-5 md:grid-cols-3 lg:grid-cols-4">{list.map((t) => <button key={t.id} onClick={() => onPick(t.id)} className={`border p-2 text-left transition ${current === t.id ? "border-primary bg-coral-soft" : "border-line hover:border-ink"}`}>
      <div className="pointer-events-none"><ResumePreview data={data.name ? data : t.sample} template={t} /></div>
      <div className="flex items-center justify-between gap-1 p-1 pt-2"><div className="min-w-0"><p className="truncate text-sm font-bold">{t.name}</p><p className="truncate text-[11px] text-muted-foreground">{t.industry}</p></div>{t.pro && !isPro ? <span className="flex shrink-0 items-center gap-1 rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold text-paper"><LockKeyhole className="size-3" />PRO</span> : current === t.id ? <Check className="size-4 shrink-0 text-primary" /> : null}</div>
    </button>)}</div>
  </DialogContent></Dialog>;
}

function CheckoutDialog({ open, onOpenChange, email, paid, premiumItems }: { open: boolean; onOpenChange: (o: boolean) => void; email?: string | undefined; paid: boolean; premiumItems: string[] }) {
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState<(typeof PLANS)[number]["id"]>("month");
  const [mail, setMail] = useState(email ?? "");
  const [country, setCountry] = useState<Country>("NG");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const countryFn = useServerFn(getCheckoutCountry);
  const quoteFn = useServerFn(getCheckoutQuote);
  const checkoutFn = useServerFn(startCheckout);
  useEffect(() => {
    countryFn().then((c) => setCountry(c)).catch(() => {
      const region = navigator.language.split("-")[1];
      if (CHECKOUT_MARKETS.some((m) => m.country === region)) setCountry(region as Country);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (open) { setStep(paid ? 3 : 0); setErr(""); } }, [open, paid]);
  useEffect(() => {
    if (!open) return;
    let current = true;
    setQuote(null);
    quoteFn({ data: { country, plan } }).then((q) => { if (current) setQuote(q); }).catch(() => { if (current) setErr("Unable to load payment details. Please try again."); });
    return () => { current = false; };
  }, [open, country, plan, quoteFn]);
  useEffect(() => { if (email) setMail(email); }, [email]);
  const p = PLANS.find((x) => x.id === plan) ?? PLANS[0];
  const market = marketFor(country);
  const label = quote?.live ? money(quote.amount, quote.currency, market.locale) : "…";
  const pay = async () => {
    setBusy(true); setErr("");
    try {
      const res = await checkoutFn({ data: { plan, email: mail, country } });
      if ("url" in res && res.url) { window.location.href = res.url; return; }
      setErr(("error" in res && res.error) || "Could not start payment.");
    } catch (e) { setErr(e instanceof Error ? e.message : "Could not start payment. Please try again."); }
    setBusy(false);
  };
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[94vh] w-[96vw] max-w-lg overflow-y-auto">
    {step < 3 && <div className="mb-1 flex gap-1">{["Plan", "Details", "Pay"].map((s, i) => <div key={s} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />)}</div>}
    {step < 3 && premiumItems.length > 0 && <div className="border-l-2 border-primary bg-coral-soft p-3 text-sm"><p className="flex items-center gap-2 font-semibold"><Sparkles className="size-4" />Your CV includes premium items</p><p className="mt-1 text-muted-foreground">{premiumItems.join(" · ")}</p></div>}
    {step === 0 && <><DialogHeader><DialogTitle className="font-display text-3xl">JobPrimed Pro</DialogTitle><DialogDescription>All templates, premium sections, backgrounds and PDF downloads for your pass duration. One payment; no automatic renewal.</DialogDescription></DialogHeader>
      <div className="flex items-center justify-between gap-3"><Label htmlFor="checkout-country">Billing country</Label><select id="checkout-country" value={country} onChange={(e) => setCountry(e.target.value as Country)} className="max-w-[65%] rounded-md border border-input bg-paper px-3 py-2 text-sm">{CHECKOUT_MARKETS.map((m) => <option key={m.country} value={m.country}>{m.name}</option>)}</select></div>
      <div className="space-y-2">{PLANS.map((x) => <Button key={x.id} variant="outline" onClick={() => setPlan(x.id)} className={`h-auto w-full justify-between whitespace-normal p-4 text-left ${plan === x.id ? "border-primary bg-coral-soft" : "border-line"}`}><span><b>{x.name}</b><br /><span className="text-xs text-muted-foreground">{x.id === "month" ? "30 days · one-time payment" : x.note}</span></span><span className="shrink-0 text-lg">{quote?.live ? money(x.usd * quote.rate, market.currency, market.locale) : "…"}</span></Button>)}</div>
      <Button size="lg" className="w-full" onClick={() => setStep(1)}>Continue<ChevronRight /></Button></>}
    {step === 1 && <><DialogHeader><DialogTitle className="font-display text-3xl">Your details</DialogTitle><DialogDescription>Your receipt will be sent to this email address.</DialogDescription></DialogHeader>
      <F label="Email address" v={mail} on={setMail} />
      {!email && <p className="text-sm text-muted-foreground">Sign in to attach your purchase to your account.</p>}
      <div className="flex gap-2"><Button variant="ghost" onClick={() => setStep(0)}><ChevronLeft />Back</Button>{email ? <Button className="flex-1" disabled={!/\S+@\S+\.\S+/.test(mail)} onClick={() => setStep(2)}>Review payment</Button> : <Button asChild className="flex-1"><Link to="/auth" search={{ mode: "signin" }}>Sign in</Link></Button>}</div></>}
    {step === 2 && <><DialogHeader><DialogTitle className="font-display text-3xl">Review & pay</DialogTitle><DialogDescription>{market.name} · {market.currency} checkout</DialogDescription></DialogHeader>
      <div className="space-y-3 border border-line bg-paper p-4 text-sm"><div className="flex justify-between"><span>{p.name}</span><b>{label}</b></div><div className="flex justify-between text-muted-foreground"><span>Payment type</span><span>One-time · no auto-renewal</span></div><div className="flex justify-between border-t border-line pt-3 text-base"><span className="font-bold">Total today</span><b>{label}</b></div></div>
      <p className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="size-4 shrink-0 text-mint-strong" />{market.methods} · secured by Paystack</p>
      {quote && !quote.ready && <p role="status" className="text-sm text-muted-foreground">{quote.error}</p>}
      {err && <p role="alert" className="break-words text-sm text-destructive">{err}</p>}
      <div className="flex gap-2"><Button variant="ghost" onClick={() => setStep(1)}><ChevronLeft />Back</Button><Button className="flex-1" size="lg" disabled={busy || !quote?.ready} onClick={pay}>{busy ? <Loader2 className="animate-spin" /> : <LockKeyhole />}Pay {label}</Button></div></>}
    {step === 3 && <div className="py-4 text-center"><span className="mx-auto grid size-14 place-items-center rounded-full bg-mint text-mint-strong"><Check className="size-7" /></span><DialogTitle className="mt-4 font-display text-3xl">You're Pro!</DialogTitle><DialogDescription className="mt-2">Your payment is verified. Every template, section and background is available for your pass duration.</DialogDescription><Button className="mt-6 w-full" onClick={() => onOpenChange(false)}>Continue editing</Button></div>}
  </DialogContent></Dialog>;
}

function ExportDialog({ open, onOpenChange, name, locked, premiumItems, onUpgrade }: { open: boolean; onOpenChange: (o: boolean) => void; name: string; locked: boolean; premiumItems: string[]; onUpgrade: () => void }) {
  const [file, setFile] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const opened = useRef(false);
  useEffect(() => { if (open && !opened.current) { setFile(`${(name || "CV").replace(/\s+/g, "_")}_CV`); } opened.current = open; if (open) setState("idle"); }, [open, name]);
  const run = async () => {
    setState("busy");
    try {
      if (locked) { setState("idle"); onUpgrade(); return; }
      const node = document.getElementById("cv-export");
      if (!node) throw new Error("CV render unavailable");
      await exportCvPdf(node, file, name);
      setState("done");
    } catch (e) { console.error(e); setState("error"); }
  };
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="w-[96vw] max-w-md">
    <DialogHeader><DialogTitle className="font-display text-3xl">Download your CV</DialogTitle><DialogDescription>High-resolution A4 PDF, ready to send.</DialogDescription></DialogHeader>
    {premiumItems.length > 0 && <div className="border-l-2 border-primary bg-coral-soft p-3 text-sm"><p className="font-semibold">This CV carries premium items</p><p className="mt-1 text-muted-foreground">{premiumItems.join(" · ")}</p>{locked && <p className="mt-2">Choose a Pro pass to export, or return to editing to remove these items.</p>}</div>}
    <div><Label htmlFor="fn">File name</Label><div className="mt-2 flex items-center gap-2"><Input id="fn" value={file} onChange={(e) => setFile(e.target.value)} /><span className="text-sm text-muted-foreground">.pdf</span></div></div>
    {state === "done" && <p className="flex items-center gap-2 text-sm text-mint-strong"><Check className="size-4" />Downloaded — good luck with your application!</p>}
    {state === "error" && <p className="text-sm text-destructive">Something went wrong creating the PDF. Please try again.</p>}
    {locked && <Button variant="outline" onClick={() => onOpenChange(false)}>Return to editing</Button>}
    <Button size="lg" disabled={state === "busy"} onClick={locked ? onUpgrade : run}>{state === "busy" ? <><Loader2 className="animate-spin" />Preparing PDF…</> : locked ? <><Sparkles />Continue to checkout</> : <><Download />Download PDF</>}</Button>
  </DialogContent></Dialog>;
}
