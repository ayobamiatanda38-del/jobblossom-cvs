import type { CSSProperties, ReactNode } from "react";
import { Mail, MapPin, Phone, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTemplate, type ResumeData, type Template } from "@/lib/templates";

export type { ResumeData };

type Props = { data?: ResumeData; template?: Template | string; className?: string; accent?: string | undefined };

/** Renders a full, A4-proportioned CV. Accent colour is template data applied via CSS var. */
export function ResumePreview({ data, template, className, accent }: Props) {
  const t = typeof template === "object" ? template : getTemplate(template);
  const d = data ?? t.sample;
  const style = { "--cv": accent ?? t.accent } as CSSProperties;
  const font = t.font === "serif" ? "font-display" : "font-sans";

  const Contact = ({ light }: { light?: boolean | undefined }) => (
    <div className={cn("flex flex-wrap gap-x-3 gap-y-1 text-[9px]", light ? "opacity-90" : "text-muted-foreground")}>
      {d.email && <span className="flex items-center gap-1"><Mail className="size-2.5" />{d.email}</span>}
      {d.phone && <span className="flex items-center gap-1"><Phone className="size-2.5" />{d.phone}</span>}
      {d.location && <span className="flex items-center gap-1"><MapPin className="size-2.5" />{d.location}</span>}
      {d.website && <span className="flex items-center gap-1"><Globe className="size-2.5" />{d.website}</span>}
    </div>
  );

  const H = ({ children }: { children: ReactNode }) => (
    <h3 className={cn("mb-1.5 text-[9px] font-bold uppercase tracking-[.14em] cv-accent", t.layout === "minimal" && "border-b border-line pb-1")}>{children}</h3>
  );

  const Experience = () => d.experience.length ? <section><H>Experience</H><div className="space-y-2.5">{d.experience.map((e, i) => (
    <div key={i} className={cn(t.layout === "timeline" && "relative border-l-2 cv-border pl-3")}>
      {t.layout === "timeline" && <span className="absolute -left-[5px] top-1 size-2 rounded-full cv-bg" />}
      <div className="flex items-baseline justify-between gap-2"><p className="text-[10.5px] font-bold">{e.role}</p><p className="shrink-0 text-[8.5px] text-muted-foreground">{e.period}</p></div>
      <p className="text-[9.5px] font-semibold cv-accent">{e.company}</p>
      <ul className="mt-1 list-disc space-y-0.5 pl-3 text-[9px] leading-snug">{e.details.split("\n").filter(Boolean).map((l, j) => <li key={j}>{l}</li>)}</ul>
    </div>))}</div></section> : null;

  const Education = () => d.education.length ? <section><H>Education</H><div className="space-y-1.5">{d.education.map((e, i) => (
    <div key={i}><p className="text-[10px] font-bold">{e.degree}</p><p className="text-[9px] text-muted-foreground">{e.school} · {e.period}</p></div>))}</div></section> : null;

  const Text = ({ label, value }: { label: string; value: string }) => value ? <section><H>{label}</H><p className="whitespace-pre-line text-[9px] leading-snug">{value}</p></section> : null;
  const Skills = ({ light }: { light?: boolean | undefined }) => d.skills ? <section><H>Skills</H><div className="flex flex-wrap gap-1">{d.skills.split(",").map((s) => s.trim()).filter(Boolean).map((s) => <span key={s} className={cn("rounded-sm px-1.5 py-0.5 text-[8.5px]", light ? "bg-paper/15" : "cv-soft")}>{s}</span>)}</div></section> : null;

  const Side = ({ light }: { light?: boolean | undefined }) => <div className="space-y-4">
    <Skills light={light} /><Text label="Strengths" value={d.strengths} /><Text label="Languages" value={d.languages} /><Text label="Courses" value={d.courses} /><Text label="Awards" value={d.awards} />
  </div>;
  const Main = () => <div className="space-y-4">
    <Text label="Profile" value={d.summary} /><Experience /><Text label="Projects" value={d.projects} /><Education /><Text label="References" value={d.references} />
  </div>;

  return (
    <article style={style} className={cn("cv-root aspect-[1/1.414] w-full overflow-hidden bg-paper text-ink paper-shadow", font, className)}>
      {t.layout === "sidebar" && <div className="grid h-full grid-cols-[36%_64%]">
        <aside className="cv-bg h-full space-y-4 p-5 text-paper [&_.cv-accent]:text-paper">
          <div className="grid size-14 place-items-center rounded-full bg-paper/20 text-lg font-bold">{initials(d.name)}</div>
          <div><h1 className="text-lg font-bold leading-tight">{d.name}</h1><p className="text-[10px] opacity-90">{d.title}</p></div>
          <div className="space-y-1 text-[9px] opacity-90"><p>{d.email}</p><p>{d.phone}</p><p>{d.location}</p><p>{d.website}</p></div>
          <Side light />
        </aside>
        <div className="p-5"><Main /></div>
      </div>}

      {t.layout === "banner" && <div>
        <header className="cv-bg px-6 py-5 text-paper"><h1 className="text-2xl font-bold">{d.name}</h1><p className="text-[11px] opacity-90">{d.title}</p><div className="mt-2"><Contact light /></div></header>
        <div className="grid grid-cols-[62%_38%] gap-5 p-6"><Main /><Side /></div>
      </div>}

      {t.layout === "split" && <div className="grid h-full grid-cols-[62%_38%]">
        <div className="space-y-4 p-6"><div className="border-l-4 cv-border pl-3"><h1 className="text-2xl font-bold leading-none">{d.name}</h1><p className="mt-1 text-[11px] cv-accent">{d.title}</p></div><Main /></div>
        <aside className="cv-soft h-full space-y-4 p-5"><div className="space-y-1 text-[9px]"><p>{d.email}</p><p>{d.phone}</p><p>{d.location}</p><p>{d.website}</p></div><Side /></aside>
      </div>}

      {(t.layout === "classic" || t.layout === "minimal" || t.layout === "timeline") && <div className="space-y-4 p-7">
        <header className={cn(t.layout === "minimal" ? "text-center" : "border-b-2 cv-border pb-3")}>
          <h1 className={cn("font-bold", t.layout === "minimal" ? "text-2xl tracking-wide" : "text-[26px] leading-none")}>{d.name}</h1>
          <p className="mt-1 text-[11px] cv-accent">{d.title}</p>
          <div className={cn("mt-2", t.layout === "minimal" && "flex justify-center")}><Contact /></div>
        </header>
        <div className="grid grid-cols-[64%_36%] gap-5"><Main /><Side /></div>
      </div>}
    </article>
  );
}

const initials = (n: string) => n.split(" ").map((w) => w[0]).slice(0, 2).join("");
