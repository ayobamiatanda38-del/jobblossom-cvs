import type { CSSProperties, ReactNode } from "react";
import { Mail, MapPin, Phone, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTemplate, type ResumeData, type Template } from "@/lib/templates";
import { cvBackground } from "@/lib/cv-design";

export type { ResumeData };

type Props = { data?: ResumeData; template?: Template | string; className?: string; accent?: string | undefined };

/** Renders a full, A4-proportioned CV. Accent colour is template data applied via CSS var. */
export function ResumePreview({ data, template, className, accent }: Props) {
  const t = typeof template === "object" ? template : getTemplate(template);
  const d = data ?? t.sample;
  const style = { "--cv": cvBackground(accent ?? t.accent) } as CSSProperties;
  const font = t.font === "serif" ? "font-display" : "font-sans";

  const Contact = ({ light }: { light?: boolean | undefined }) => (
    <div className={cn("flex flex-wrap gap-x-3 gap-y-1 text-[9px] cv-small", light ? "opacity-90" : "text-muted-foreground")}>
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
      <div className="flex items-baseline justify-between gap-2"><p className="cv-role">{e.role}</p><p className="cv-small shrink-0 whitespace-nowrap text-muted-foreground">{e.period}</p></div>
      <p className="cv-small font-semibold cv-accent">{e.company}</p>
      <ul className="mt-1 list-disc space-y-0.5">{e.details.split("\n").filter(Boolean).map((l, j) => <li key={j}>{l}</li>)}</ul>
    </div>))}</div></section> : null;

  const Education = () => d.education.length ? <section><H>Education</H><div className="space-y-1.5">{d.education.map((e, i) => (
    <div key={i}><p className="cv-role">{e.degree}</p><p className="cv-small text-muted-foreground">{e.school} · {e.period}</p></div>))}</div></section> : null;

  const Text = ({ label, value }: { label: string; value: string }) => value ? <section><H>{label}</H><p className="cv-para">{value.split(/\n+/).filter(Boolean).map((l, i) => <span key={i}>{l}</span>)}</p></section> : null;
  const Skills = ({ light }: { light?: boolean | undefined }) => d.skills ? <section><H>Skills</H><div className="flex flex-wrap gap-1">{d.skills.split(",").map((s) => s.trim()).filter(Boolean).map((s) => <span key={s} className={cn("rounded-sm px-1.5 py-0.5 text-[8.5px]", light ? "bg-paper/15" : "cv-soft")}>{s}</span>)}</div></section> : null;

  const Side = ({ light }: { light?: boolean | undefined }) => <div className="space-y-4">
    <Skills light={light} /><Text label="Strengths" value={d.strengths} /><Text label="Languages" value={d.languages} /><Text label="Courses" value={d.courses} /><Text label="Awards" value={d.awards} />
  </div>;
  const Main = () => <div className="space-y-4">
    <Text label="Profile" value={d.summary} /><Experience /><Text label="Projects" value={d.projects} /><Education /><Text label="References" value={d.references} />
  </div>;

  return (
    <article data-layout={t.layout} style={style} className={cn("cv-root min-h-[141.4cqw] w-full bg-paper text-ink paper-shadow", font, className)}>
      {t.layout === "sidebar" && <div className="grid h-full grid-cols-[36%_64%]">
        <aside className="cv-bg h-full space-y-4 p-5 text-ink">
          <div className="grid size-14 place-items-center rounded-full bg-paper/20 text-lg font-bold">{initials(d.name)}</div>
          <div><h1 className="text-lg font-bold leading-tight">{d.name}</h1><p className="text-[10px] opacity-90">{d.title}</p></div>
          <div className="cv-small space-y-1 opacity-90"><p>{d.email}</p><p>{d.phone}</p><p>{d.location}</p><p>{d.website}</p></div>
          <Side light />
        </aside>
        <div className="p-5"><Main /></div>
      </div>}

      {t.layout === "banner" && <div>
        <header className="cv-bg px-6 py-5 text-ink"><h1 className="text-2xl font-bold">{d.name}</h1><p className="text-[11px] opacity-90">{d.title}</p><div className="mt-2"><Contact light /></div></header>
        <div className="grid grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)] gap-5 p-6"><Main /><Side /></div>
      </div>}

      {t.layout === "split" && <div className="grid h-full grid-cols-[62%_38%]">
        <div className="space-y-4 p-6"><div className="border-l-4 cv-border pl-3"><h1 className="text-2xl font-bold leading-none">{d.name}</h1><p className="mt-1 text-[11px] cv-accent">{d.title}</p></div><Main /></div>
        <aside className="cv-soft h-full space-y-4 p-5"><div className="cv-small space-y-1"><p>{d.email}</p><p>{d.phone}</p><p>{d.location}</p><p>{d.website}</p></div><Side /></aside>
      </div>}

      {(t.layout === "classic" || t.layout === "minimal" || t.layout === "timeline") && <div className="space-y-4 p-7">
        <header className={cn(t.layout === "minimal" ? "text-center" : "border-b-2 cv-border pb-3")}>
          <h1 className={cn("font-bold", t.layout === "minimal" ? "text-2xl tracking-wide" : "text-[26px] leading-none")}>{d.name}</h1>
          <p className="mt-1 text-[11px] cv-accent">{d.title}</p>
          <div className={cn("mt-2", t.layout === "minimal" && "flex justify-center")}><Contact /></div>
        </header>
        <div className="grid grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)] gap-5"><Main /><Side /></div>
      </div>}

      {t.layout === "ats" && <div className="p-7">
        <header>
          <h1>{d.name}</h1>
          <p className="cv-small mt-1 text-muted-foreground">{[d.title, d.location, d.phone, d.email, d.website].filter(Boolean).join(" | ")}</p>
        </header>
        <div className="mt-2 space-y-4 [&_h3]:border-b [&_h3]:border-ink/60 [&_h3]:pb-0.5 [&_h3]:text-ink">
          <Text label="Professional Summary" value={d.summary} />
          {d.skills && <section><H>Core Competencies</H><p>{d.skills.split(",").map((s) => s.trim()).filter(Boolean).join(" | ")}</p></section>}
          <section><H>Professional Experience</H><div className="space-y-2.5">{d.experience.map((e, i) => (
            <div key={i}>
              <p className="cv-role">{e.company}{d.location ? ` | ${d.location}` : ""}</p>
              <div className="flex items-baseline justify-between gap-2"><p className="italic">{e.role}</p><p className="cv-small shrink-0 whitespace-nowrap text-muted-foreground">{e.period}</p></div>
              <ul className="mt-1 list-disc space-y-0.5">{e.details.split("\n").filter(Boolean).map((l, j) => <li key={j}>{l}</li>)}</ul>
            </div>))}</div></section>
          {d.projects && <Text label="Key Achievements" value={d.projects} />}
          <Education />
          {d.courses && <Text label="Certifications" value={d.courses} />}
          <Text label="Strengths" value={d.strengths} />
          <Text label="Languages" value={d.languages} />
          <Text label="Awards" value={d.awards} />
          {d.references && <Text label="References" value={d.references} />}
        </div>
      </div>}

      {t.layout === "chronicle" && <div className="p-6 text-[0.92em]">
        <header className="border-b-2 cv-border pb-2">
          <h1>{d.name}</h1>
          <p className="cv-small mt-1 text-muted-foreground">{[d.title, d.location, d.phone, d.email, d.website].filter(Boolean).join(" · ")}</p>
        </header>
        <div className="mt-3 space-y-4">
          {d.summary && <section><H>Profile</H><p className="cv-para">{d.summary.split(/\n+/).filter(Boolean).map((l, i) => <span key={i}>{l}</span>)}</p></section>}
          {d.experience.length > 0 && <section><H>Work Experience</H><div className="space-y-3">{d.experience.map((e, i) => (
            <div key={i} className="space-y-1">
              <p className="cv-small font-semibold cv-accent">{e.period}</p>
              <div><p className="cv-role">{e.role}</p><p className="cv-small text-muted-foreground">{e.company}</p>
                <ul className="mt-1 list-disc space-y-0.5">{e.details.split("\n").filter(Boolean).map((l, j) => <li key={j}>{l}</li>)}</ul></div>
            </div>))}</div></section>}
          {d.education.length > 0 && <section><H>Education</H><div className="space-y-2">{d.education.map((e, i) => (
            <div key={i} className="space-y-1">
              <p className="cv-small font-semibold cv-accent">{e.period}</p>
              <div><p className="cv-role">{e.degree}</p><p className="cv-small text-muted-foreground">{e.school}</p></div>
            </div>))}</div></section>}
          {d.skills && <section><H>Skills</H><p>{d.skills.split(",").map((s) => s.trim()).filter(Boolean).join(", ")}</p></section>}
          <Text label="Key Areas" value={d.strengths} />
          <Text label="Awards & Achievements" value={d.awards} />
          <Text label="Certificates" value={d.courses} />
          <Text label="Languages" value={d.languages} />
          <Text label="Hobbies & Interests" value={d.projects} />
          <Text label="References" value={d.references} />
        </div>
      </div>}
    </article>
  );
}

const initials = (n: string) => n.split(" ").map((w) => w[0]).slice(0, 2).join("");
