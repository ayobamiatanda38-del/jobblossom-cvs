import { Mail, MapPin, Phone } from "lucide-react";

export type TemplateId = "prime" | "axis" | "mono" | "folio";

export type ResumeData = {
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  company?: string;
  role?: string;
  experience?: string;
  school?: string;
  degree?: string;
  skills?: string;
  strengths?: string;
  projects?: string;
  languages?: string;
  courses?: string;
  references?: string;
};

const defaults: Required<ResumeData> = {
  name: "Amara Okafor",
  title: "Product Marketing Manager",
  email: "amara@email.com",
  phone: "+234 801 234 5678",
  location: "Lagos, Nigeria",
  summary: "Strategic product marketer with 7+ years of experience turning customer insight into campaigns that drive adoption and sustainable growth.",
  company: "CloudNine Africa",
  role: "Senior Product Marketing Manager",
  experience: "Led go-to-market strategy across three markets, increasing qualified pipeline by 38%. Built a customer research programme that shaped two successful product launches.",
  school: "University of Lagos",
  degree: "B.Sc. Business Administration",
  skills: "Go-to-market strategy, Customer research, Analytics, Brand positioning",
  strengths: "Clear communication · Cross-functional leadership · Commercial thinking",
  projects: "Market expansion playbook — Built the launch system used across three regional teams.",
  languages: "English — Native · French — Conversational",
  courses: "Product Marketing Core · Google Analytics Certification",
  references: "Available on request",
};

type PreviewProps = { data?: ResumeData; compact?: boolean; template?: TemplateId; className?: string };

export function ResumePreview({ data = {}, compact = false, template = "prime", className = "" }: PreviewProps) {
  const d = { ...defaults, ...data };
  const sizing = compact ? "aspect-[0.707] p-4 text-[7px] sm:p-6 sm:text-[8px]" : "min-h-[760px] p-7 text-[9px] sm:p-10 sm:text-[10px]";

  if (template === "axis") {
    return <article className={`grid w-full grid-cols-[32%_68%] overflow-hidden bg-paper text-ink paper-shadow ${sizing} !p-0 ${className}`}>
      <aside className="bg-ink p-[2.4em] text-paper">
        <div className="grid aspect-square w-14 place-items-center rounded-full bg-coral-soft text-lg font-bold text-ink">AO</div>
        <h2 className="mt-5 font-display text-[2.7em] leading-none">{d.name}</h2>
        <p className="mt-2 font-semibold text-coral-soft">{d.title}</p>
        <PreviewHeading light>Contact</PreviewHeading>
        <Contact data={d} stacked />
        <PreviewHeading light>Skills</PreviewHeading><p className="leading-relaxed text-paper/70">{d.skills}</p>
        <PreviewHeading light>Languages</PreviewHeading><p className="leading-relaxed text-paper/70">{d.languages}</p>
      </aside>
      <div className="p-[3em]">
        <PreviewSection title="Profile"><p className="leading-relaxed text-muted-foreground">{d.summary}</p></PreviewSection>
        <PreviewSection title="Experience"><Role data={d} /></PreviewSection>
        <PreviewSection title="Education"><Education data={d} /></PreviewSection>
        <PreviewSection title="Selected project"><p className="leading-relaxed text-muted-foreground">{d.projects}</p></PreviewSection>
      </div>
    </article>;
  }

  if (template === "mono") {
    return <article className={`w-full bg-paper text-ink paper-shadow ${sizing} ${className}`}>
      <header className="text-center"><p className="text-[1em] uppercase text-muted-foreground">Curriculum Vitae</p><h2 className="mt-3 text-[3.8em] font-bold uppercase leading-none">{d.name}</h2><p className="mt-2 text-[1.2em]">{d.title}</p><div className="mt-4 flex justify-center"><Contact data={d} /></div></header>
      <div className="my-6 h-px bg-ink" />
      <div className="grid grid-cols-[1fr_2fr] gap-8">
        <div><PreviewSection title="Skills"><p className="leading-relaxed text-muted-foreground">{d.skills}</p></PreviewSection><PreviewSection title="Education"><Education data={d} /></PreviewSection><PreviewSection title="Courses"><p className="leading-relaxed text-muted-foreground">{d.courses}</p></PreviewSection></div>
        <div><PreviewSection title="Profile"><p className="leading-relaxed text-muted-foreground">{d.summary}</p></PreviewSection><PreviewSection title="Experience"><Role data={d} /></PreviewSection><PreviewSection title="Projects"><p className="leading-relaxed text-muted-foreground">{d.projects}</p></PreviewSection></div>
      </div>
    </article>;
  }

  if (template === "folio") {
    return <article className={`w-full overflow-hidden bg-paper text-ink paper-shadow ${sizing} !p-0 ${className}`}>
      <header className="bg-primary p-[3.2em] text-primary-foreground"><p className="mb-2 text-[1.1em] font-bold uppercase">{d.title}</p><h2 className="font-display text-[4.5em] leading-none">{d.name}</h2><div className="mt-5"><Contact data={d} inverse /></div></header>
      <div className="grid grid-cols-[1.7fr_1fr] gap-8 p-[3.2em]">
        <div><PreviewSection title="About"><p className="leading-relaxed text-muted-foreground">{d.summary}</p></PreviewSection><PreviewSection title="Experience"><Role data={d} /></PreviewSection><PreviewSection title="Projects"><p className="leading-relaxed text-muted-foreground">{d.projects}</p></PreviewSection></div>
        <aside className="border-l border-line pl-6"><PreviewSection title="Education"><Education data={d} /></PreviewSection><PreviewSection title="Expertise"><p className="leading-relaxed text-muted-foreground">{d.skills}</p></PreviewSection><PreviewSection title="Strengths"><p className="leading-relaxed text-muted-foreground">{d.strengths}</p></PreviewSection></aside>
      </div>
    </article>;
  }

  return <article className={`w-full bg-paper text-ink paper-shadow ${sizing} ${className}`}>
    <header className="border-b-2 border-ink pb-4">
      <h2 className="font-display text-[4em] leading-none">{d.name}</h2>
      <p className="mt-1 font-semibold text-primary">{d.title}</p>
      <div className="mt-3"><Contact data={d} /></div>
    </header>
    <PreviewSection title="Profile"><p className="leading-relaxed text-muted-foreground">{d.summary}</p></PreviewSection>
    <PreviewSection title="Experience"><Role data={d} /></PreviewSection>
    <div className="grid grid-cols-2 gap-6"><PreviewSection title="Education"><Education data={d} /></PreviewSection><PreviewSection title="Skills"><p className="leading-relaxed text-muted-foreground">{d.skills}</p></PreviewSection></div>
    <div className="grid grid-cols-2 gap-6"><PreviewSection title="Projects"><p className="leading-relaxed text-muted-foreground">{d.projects}</p></PreviewSection><PreviewSection title="Strengths"><p className="leading-relaxed text-muted-foreground">{d.strengths}</p></PreviewSection></div>
  </article>;
}

function Contact({ data, stacked = false, inverse = false }: { data: Required<ResumeData>; stacked?: boolean; inverse?: boolean }) {
  return <div className={`${stacked ? "space-y-2" : "flex flex-wrap gap-x-4 gap-y-1"} ${inverse ? "text-primary-foreground/80" : stacked ? "text-paper/70" : "text-muted-foreground"}`}>
    <span className="flex items-center gap-1"><Mail className="size-[1em]" />{data.email}</span><span className="flex items-center gap-1"><Phone className="size-[1em]" />{data.phone}</span><span className="flex items-center gap-1"><MapPin className="size-[1em]" />{data.location}</span>
  </div>;
}

function PreviewHeading({ children, light = false }: { children: React.ReactNode; light?: boolean }) { return <h3 className={`mb-2 mt-7 border-b pb-2 text-[1em] font-bold uppercase ${light ? "border-paper/20 text-paper" : "border-line"}`}>{children}</h3>; }
function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) { return <section className="mt-5"><PreviewHeading>{title}</PreviewHeading>{children}</section>; }
function Role({ data }: { data: Required<ResumeData> }) { return <><div className="flex justify-between gap-3"><div><strong>{data.role}</strong><p className="text-primary">{data.company}</p></div><span className="text-muted-foreground">2022 — Present</span></div><p className="mt-2 leading-relaxed text-muted-foreground">{data.experience}</p></>; }
function Education({ data }: { data: Required<ResumeData> }) { return <><strong className="block">{data.degree}</strong><p className="text-muted-foreground">{data.school}</p></>; }