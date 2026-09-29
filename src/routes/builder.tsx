import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft, Award, BookOpen, BriefcaseBusiness, Check, ChevronDown, ChevronLeft,
  ChevronRight, CircleUserRound, Download, Eye, FileText, FolderKanban, GripVertical,
  GraduationCap, Languages, LayoutTemplate, Lightbulb, Link2, LockKeyhole, Minus,
  MoreHorizontal, Palette, Plus, Quote, Redo2, Settings2, Sparkles, Trash2, Undo2,
  Users, WandSparkles, ZoomIn,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ResumePreview, type ResumeData, type TemplateId } from "@/components/resume-preview";

export const Route = createFileRoute("/builder")({
  head: () => ({ meta: [
    { title: "CV Editor & Templates — JobPrimed" },
    { name: "description", content: "Create, style and download an ATS-ready CV with JobPrimed's guided editor and original templates." },
    { property: "og:title", content: "CV Editor & Templates — JobPrimed" },
    { property: "og:description", content: "Build your professional CV with guided sections, live preview and original ATS-friendly templates." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: BuilderPage,
});

const initial: ResumeData = {
  name: "Amara Okafor", title: "Product Marketing Manager", email: "amara@email.com", phone: "+234 801 234 5678", location: "Lagos, Nigeria",
  summary: "Strategic product marketer with 7+ years of experience turning customer insight into campaigns that drive adoption and sustainable growth.",
  company: "CloudNine Africa", role: "Senior Product Marketing Manager", experience: "Led go-to-market strategy across three markets, increasing qualified pipeline by 38%. Built a customer research programme that shaped two successful product launches.",
  school: "University of Lagos", degree: "B.Sc. Business Administration", skills: "Go-to-market strategy, Customer research, Analytics, Brand positioning",
  strengths: "Clear communication · Cross-functional leadership · Commercial thinking", projects: "Market expansion playbook — Built the launch system used across three regional teams.",
  languages: "English — Native · French — Conversational", courses: "Product Marketing Core · Google Analytics Certification", references: "Available on request",
};

type SectionId = "personal" | "profile" | "experience" | "education" | "skills" | "strengths" | "projects" | "languages" | "courses" | "references" | "design";
type Section = { id: SectionId; label: string; icon: typeof CircleUserRound; pro?: boolean; complete?: boolean };

const sections: Section[] = [
  { id: "personal", label: "Personal information", icon: CircleUserRound, complete: true },
  { id: "profile", label: "Profile", icon: FileText, complete: true },
  { id: "experience", label: "Work experience", icon: BriefcaseBusiness, complete: true },
  { id: "education", label: "Education", icon: GraduationCap, complete: true },
  { id: "skills", label: "Skills", icon: Lightbulb, complete: true },
  { id: "strengths", label: "Strengths", icon: Award, pro: true },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "languages", label: "Languages", icon: Languages },
  { id: "courses", label: "Courses", icon: BookOpen, pro: true },
  { id: "references", label: "References", icon: Users },
  { id: "design", label: "Design & formatting", icon: Palette },
];

const templates: { id: TemplateId; name: string; note: string; pro?: boolean }[] = [
  { id: "prime", name: "Prime", note: "Clean and dependable" },
  { id: "axis", name: "Axis", note: "Confident two-column" },
  { id: "mono", name: "Mono", note: "Minimal and precise", pro: true },
  { id: "folio", name: "Folio", note: "Bold editorial header", pro: true },
];

function BuilderPage() {
  const [data, setData] = useState<ResumeData>(initial);
  const [active, setActive] = useState<SectionId>("personal");
  const [template, setTemplate] = useState<TemplateId>("prime");
  const [mobilePreview, setMobilePreview] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutDone, setCheckoutDone] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [zoom, setZoom] = useState(90);
  const update = (key: keyof ResumeData, value: string) => setData((current) => ({ ...current, [key]: value }));
  const chosen = templates.find((item) => item.id === template) ?? templates[0];

  const chooseSection = (section: Section) => {
    if (section.pro && !isPro) { setCheckoutDone(false); setCheckoutOpen(true); return; }
    setActive(section.id); setMobilePreview(false);
  };
  const chooseTemplate = (item: (typeof templates)[number]) => {
    if (item.pro && !isPro) { setTemplateOpen(false); setCheckoutDone(false); setCheckoutOpen(true); return; }
    setTemplate(item.id); setTemplateOpen(false);
  };
  const download = () => {
    if (chosen?.pro && !isPro) { setCheckoutDone(false); setCheckoutOpen(true); return; }
    window.print();
  };

  return <div className="builder-shell min-h-screen bg-muted text-foreground">
    <header className="builder-topbar flex h-16 items-center justify-between border-b border-line bg-paper px-3 sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <Button variant="ghost" size="icon" asChild title="Back to JobPrimed"><Link to="/"><ArrowLeft /></Link></Button>
        <Link to="/" className="hidden items-center gap-2 font-bold sm:flex"><span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground"><FileText className="size-4" /></span>JobPrimed</Link>
        <div className="hidden h-6 w-px bg-line md:block" />
        <button className="hidden min-w-0 text-left md:block" type="button"><span className="block truncate text-sm font-semibold">Product Marketing CV</span><span className="text-[11px] text-muted-foreground">Saved just now</span></button>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <Button variant="ghost" size="icon" title="Undo"><Undo2 /></Button><Button variant="ghost" size="icon" title="Redo"><Redo2 /></Button>
        <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setMobilePreview((value) => !value)}><Eye />{mobilePreview ? "Edit" : "Preview"}</Button>
        {!isPro && <Button variant="secondary" size="sm" className="hidden sm:inline-flex" onClick={() => { setCheckoutDone(false); setCheckoutOpen(true); }}><Sparkles />Upgrade</Button>}
        {isPro && <span className="hidden rounded-full bg-mint px-3 py-1 text-xs font-bold text-mint-strong sm:inline">Pro active</span>}
        <Button variant="ink" size="sm" onClick={download}><Download />Download</Button>
      </div>
    </header>

    <div className="builder-workspace lg:grid lg:grid-cols-[220px_minmax(390px,480px)_minmax(520px,1fr)]">
      <nav className={`${mobilePreview ? "hidden" : "hidden lg:block"} min-h-[calc(100vh-64px)] border-r border-line bg-paper p-3`} aria-label="CV sections">
        <div className="mb-3 flex items-center justify-between px-2 pt-2"><p className="text-xs font-bold uppercase text-muted-foreground">CV content</p><span className="text-xs font-bold text-primary">72%</span></div>
        <div className="mb-4 h-1 overflow-hidden rounded-full bg-muted"><div className="h-full w-[72%] bg-primary" /></div>
        <div className="space-y-1">{sections.slice(0, 10).map((section) => <SectionButton key={section.id} section={section} active={active === section.id} isPro={isPro} onClick={() => chooseSection(section)} />)}</div>
        <div className="my-3 border-t border-line" />
        <SectionButton section={sections[10] ?? sections[0]} active={active === "design"} isPro={isPro} onClick={() => chooseSection(sections[10] ?? sections[0])} />
        <Button variant="ghost" className="mt-2 w-full justify-start text-muted-foreground"><Settings2 />Document settings</Button>
      </nav>

      <section className={`${mobilePreview ? "hidden" : "block"} min-h-[calc(100vh-64px)] border-r border-line bg-background lg:block`}>
        <EditorPanel active={active} data={data} update={update} setActive={setActive} openTemplates={() => setTemplateOpen(true)} templateName={chosen?.name ?? "Prime"} />
      </section>

      <main className={`${mobilePreview ? "block" : "hidden"} min-h-[calc(100vh-64px)] overflow-hidden bg-muted lg:block`}>
        <div className="flex h-14 items-center justify-between border-b border-line bg-paper px-4">
          <Button variant="outline" size="sm" onClick={() => setTemplateOpen(true)}><LayoutTemplate />{chosen?.name ?? "Prime"}<ChevronDown /></Button>
          <div className="flex items-center gap-1"><Button variant="ghost" size="icon" title="Previous page"><ChevronLeft /></Button><span className="px-2 text-xs font-semibold">1 / 1</span><Button variant="ghost" size="icon" title="Next page"><ChevronRight /></Button></div>
          <div className="hidden items-center gap-1 sm:flex"><Button variant="ghost" size="icon" title="Zoom out" onClick={() => setZoom((value) => Math.max(70, value - 10))}><Minus /></Button><span className="w-10 text-center text-xs font-semibold">{zoom}%</span><Button variant="ghost" size="icon" title="Zoom in" onClick={() => setZoom((value) => Math.min(110, value + 10))}><ZoomIn /></Button></div>
        </div>
        <div className="preview-stage flex min-h-[calc(100vh-120px)] justify-center overflow-auto p-5 sm:p-9">
          <div className="preview-scale w-full max-w-[650px] origin-top transition-transform" style={{ transform: `scale(${zoom / 100})` }}><ResumePreview data={data} template={template} /></div>
        </div>
      </main>
    </div>

    <Dialog open={templateOpen} onOpenChange={setTemplateOpen}><DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto p-0"><DialogHeader className="border-b border-line p-6"><DialogTitle className="font-display text-3xl">Choose your CV template</DialogTitle><DialogDescription>Every JobPrimed layout is original and ATS-friendly. Switch without losing your content.</DialogDescription></DialogHeader><div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">{templates.map((item) => <button key={item.id} type="button" onClick={() => chooseTemplate(item)} className={`group relative border p-2 text-left transition ${template === item.id ? "border-primary bg-coral-soft" : "border-line bg-background hover:border-ink"}`}><div className="pointer-events-none h-56 overflow-hidden bg-muted"><ResumePreview data={data} template={item.id} compact className="origin-top scale-[.47]" /></div><div className="flex items-start justify-between gap-2 p-2"><div><p className="font-bold">{item.name}</p><p className="text-xs text-muted-foreground">{item.note}</p></div>{item.pro && !isPro ? <span className="flex items-center gap-1 rounded-full bg-ink px-2 py-1 text-[10px] font-bold text-paper"><LockKeyhole className="size-3" />PRO</span> : template === item.id ? <Check className="size-4 text-primary" /> : null}</div></button>)}</div></DialogContent></Dialog>

    <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}><DialogContent className="max-w-md">{checkoutDone ? <div className="py-6 text-center"><span className="mx-auto grid size-14 place-items-center rounded-full bg-mint text-mint-strong"><Check className="size-7" /></span><DialogTitle className="mt-5 font-display text-3xl">JobPrimed Pro is active</DialogTitle><DialogDescription className="mt-3">All premium templates and CV sections are now unlocked in this preview.</DialogDescription><Button className="mt-6 w-full" onClick={() => setCheckoutOpen(false)}>Continue editing</Button></div> : <><DialogHeader><div className="mb-2 flex items-center gap-2 text-primary"><Sparkles className="size-5" /><span className="text-xs font-bold uppercase">JobPrimed Pro</span></div><DialogTitle className="font-display text-3xl">Unlock every CV tool</DialogTitle><DialogDescription>Access every template, premium section, and unlimited downloads.</DialogDescription></DialogHeader><div className="border-y border-line py-5"><div className="flex items-end justify-between"><div><p className="text-sm font-bold">Monthly plan</p><p className="text-xs text-muted-foreground">Cancel anytime</p></div><p className="font-display text-3xl">₦4,500<span className="font-sans text-xs text-muted-foreground"> / month</span></p></div><ul className="mt-5 space-y-3 text-sm">{["All original premium templates", "Strengths and courses sections", "Unlimited PDF downloads", "Job-specific CV versions"].map((item) => <li key={item} className="flex items-center gap-2"><Check className="size-4 text-mint-strong" />{item}</li>)}</ul></div><div className="rounded-md bg-muted p-3 text-xs leading-5 text-muted-foreground">Demo checkout: no payment will be taken. Confirming only unlocks Pro for this browser session.</div><DialogFooter><Button variant="outline" onClick={() => setCheckoutOpen(false)}>Not now</Button><Button onClick={() => { setIsPro(true); setCheckoutDone(true); }}>Confirm demo upgrade</Button></DialogFooter></>}</DialogContent></Dialog>
  </div>;
}

function SectionButton({ section, active, isPro, onClick }: { section: Section; active: boolean; isPro: boolean; onClick: () => void }) {
  const Icon = section.icon;
  return <Button type="button" variant="ghost" onClick={onClick} className={`h-10 w-full justify-start px-2 ${active ? "bg-coral-soft text-ink" : "text-muted-foreground"}`}><Icon /><span className="flex-1 text-left">{section.label}</span>{section.pro && !isPro ? <LockKeyhole className="size-3.5" /> : section.complete ? <Check className="size-3.5 text-mint-strong" /> : null}</Button>;
}

function EditorPanel({ active, data, update, setActive, openTemplates, templateName }: { active: SectionId; data: ResumeData; update: (key: keyof ResumeData, value: string) => void; setActive: (id: SectionId) => void; openTemplates: () => void; templateName: string }) {
  const definition = sections.find((section) => section.id === active) ?? sections[0];
  const titles: Record<SectionId, string> = { personal: "Personal information", profile: "Professional profile", experience: "Work experience", education: "Education", skills: "Skills", strengths: "Strengths", projects: "Projects", languages: "Languages", courses: "Courses", references: "References", design: "Design & formatting" };
  return <div className="mx-auto max-w-xl p-5 sm:p-7">
    <div className="mb-7 flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase text-primary">CV editor</p><h1 className="mt-1 font-display text-3xl">{titles[active]}</h1></div><Button variant="ghost" size="icon" title="More options"><MoreHorizontal /></Button></div>
    {active === "personal" && <div className="space-y-5"><div className="grid gap-5 sm:grid-cols-2"><Field label="Full name" value={data.name} onChange={(v) => update("name", v)} /><Field label="Professional title" value={data.title} onChange={(v) => update("title", v)} /></div><div className="grid gap-5 sm:grid-cols-2"><Field label="Email" value={data.email} onChange={(v) => update("email", v)} /><Field label="Phone" value={data.phone} onChange={(v) => update("phone", v)} /></div><Field label="Location" value={data.location} onChange={(v) => update("location", v)} /><Button variant="outline" className="w-full"><Link2 />Add website or social link</Button></div>}
    {active === "profile" && <div><div className="mb-3 flex items-center justify-between"><Label htmlFor="summary">Summary</Label><Button variant="secondary" size="sm" onClick={() => update("summary", "Results-driven product marketer who turns customer insight into focused go-to-market strategy, stronger adoption and measurable commercial growth.")}><WandSparkles />Improve with AI</Button></div><Textarea id="summary" rows={10} value={data.summary ?? ""} onChange={(e) => update("summary", e.target.value)} className="min-h-56 bg-paper" /><p className="mt-2 text-right text-xs text-muted-foreground">{data.summary?.length ?? 0} / 600</p></div>}
    {active === "experience" && <EntryCard title={data.role ?? "Role"} subtitle={data.company ?? "Company"}><div className="grid gap-5 sm:grid-cols-2"><Field label="Job title" value={data.role} onChange={(v) => update("role", v)} /><Field label="Employer" value={data.company} onChange={(v) => update("company", v)} /></div><Label className="mt-5 block" htmlFor="experience">Achievements and responsibilities</Label><Textarea id="experience" rows={8} value={data.experience ?? ""} onChange={(e) => update("experience", e.target.value)} className="mt-2 min-h-44 bg-paper" /><Button variant="secondary" size="sm" className="mt-3"><Sparkles />Generate stronger bullet points</Button></EntryCard>}
    {active === "education" && <EntryCard title={data.degree ?? "Qualification"} subtitle={data.school ?? "Institution"}><Field label="Degree or qualification" value={data.degree} onChange={(v) => update("degree", v)} /><div className="mt-5"><Field label="School or institution" value={data.school} onChange={(v) => update("school", v)} /></div></EntryCard>}
    {active === "skills" && <TextSection label="Skills and expertise" value={data.skills} onChange={(v) => update("skills", v)} hint="Separate skills with commas" />}
    {active === "strengths" && <TextSection label="Your strongest qualities" value={data.strengths} onChange={(v) => update("strengths", v)} />}
    {active === "projects" && <TextSection label="Selected projects" value={data.projects} onChange={(v) => update("projects", v)} />}
    {active === "languages" && <TextSection label="Languages and proficiency" value={data.languages} onChange={(v) => update("languages", v)} />}
    {active === "courses" && <TextSection label="Courses and certifications" value={data.courses} onChange={(v) => update("courses", v)} />}
    {active === "references" && <TextSection label="References" value={data.references} onChange={(v) => update("references", v)} />}
    {active === "design" && <div><button type="button" onClick={openTemplates} className="flex w-full items-center justify-between border border-line bg-paper p-4 text-left hover:border-ink"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center bg-coral-soft"><LayoutTemplate /></span><div><p className="font-bold">Template</p><p className="text-sm text-muted-foreground">{templateName}</p></div></div><ChevronRight /></button><div className="mt-5 border border-line bg-paper p-4"><p className="font-bold">Formatting</p><div className="mt-4 grid grid-cols-3 gap-2">{["Compact", "Balanced", "Airy"].map((item, index) => <Button key={item} variant={index === 1 ? "default" : "outline"} size="sm">{item}</Button>)}</div><div className="mt-5 flex items-center justify-between"><div><p className="text-sm font-semibold">Section dividers</p><p className="text-xs text-muted-foreground">Show lines between sections</p></div><span className="flex h-6 w-11 items-center justify-end rounded-full bg-primary p-1"><span className="size-4 rounded-full bg-primary-foreground" /></span></div></div></div>}
    {active !== "design" && <div className="mt-8 flex items-center justify-between border-t border-line pt-5"><Button variant="outline" size="sm"><Plus />Add another</Button><div className="flex gap-1"><Button variant="ghost" size="icon" title="Reorder section"><GripVertical /></Button><Button variant="ghost" size="icon" title="Delete section"><Trash2 /></Button></div></div>}
    <div className="mt-8 flex justify-between"><Button variant="ghost" disabled={active === "personal"} onClick={() => { const index = sections.findIndex((s) => s.id === active); const previous = sections[index - 1]; if (previous) setActive(previous.id); }}><ChevronLeft />Previous</Button><Button onClick={() => { const index = sections.findIndex((s) => s.id === active); const next = sections[index + 1]; if (next && !next.pro) setActive(next.id); }}>{active === "design" ? "Done" : "Next"}<ChevronRight /></Button></div>
  </div>;
}

function Field({ label, value, onChange }: { label: string; value?: string; onChange: (value: string) => void }) { const id = label.toLowerCase().replaceAll(" ", "-"); return <div><Label htmlFor={id}>{label}</Label><Input id={id} className="mt-2 h-11 bg-paper" value={value ?? ""} onChange={(event) => onChange(event.target.value)} /></div>; }
function TextSection({ label, value, onChange, hint }: { label: string; value?: string; onChange: (value: string) => void; hint?: string }) { return <div><Label htmlFor="section-text">{label}</Label><Textarea id="section-text" rows={8} className="mt-2 min-h-44 bg-paper" value={value ?? ""} onChange={(event) => onChange(event.target.value)} />{hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}<Button variant="outline" className="mt-5 w-full"><Plus />Add item</Button></div>; }
function EntryCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) { return <div><div className="mb-4 flex items-center gap-2 border border-line bg-paper p-3"><GripVertical className="size-4 text-muted-foreground" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{title}</p><p className="truncate text-xs text-muted-foreground">{subtitle}</p></div><Check className="size-4 text-mint-strong" /></div>{children}</div>; }