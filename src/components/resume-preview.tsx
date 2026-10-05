import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Mail, MapPin, Phone, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTemplate, type ResumeData, type Template } from "@/lib/templates";

export type { ResumeData };
type Props = { data?: ResumeData; template?: Template | string; className?: string; accent?: string | undefined };

/** One physical A4 layout, scaled uniformly for thumbnails and the editor. */
export function ResumePreview({ data, template, className, accent }: Props) {
  const t = typeof template === "object" ? template : getTemplate(template);
  const d = data ?? t.sample;
  const frame = useRef<HTMLElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const name = useRef<HTMLHeadingElement>(null);
  const [geometry, setGeometry] = useState({ scale: 1, height: 1123 });
  useEffect(() => {
    const outer = frame.current;
    const inner = sheet.current;
    if (!outer || !inner) return;
    const measure = () => {
      const heading = name.current;
      if (heading) {
        heading.style.fontSize = "20pt";
        heading.style.whiteSpace = "nowrap";
        if (heading.scrollWidth > heading.clientWidth) heading.style.fontSize = "16pt";
        if (heading.scrollWidth > heading.clientWidth) heading.style.whiteSpace = "normal";
      }
      const scale = outer.clientWidth / 794;
      const height = Math.max(1123, inner.offsetHeight);
      setGeometry((prev) => prev.scale === scale && prev.height === height ? prev : { scale, height });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(outer);
    observer.observe(inner);
    measure();
    document.fonts.ready.then(measure);
    return () => observer.disconnect();
  }, [d, t]);

  const H = ({ children }: { children: ReactNode }) => <h3 className="cv-section-title cv-accent">{children}</h3>;
  const Text = ({ label, value }: { label: string; value: string }) => value.trim() ? <section><H>{label}</H><div className="cv-paragraphs">{value.split(/\n\s*\n/).filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}</div></section> : null;
  const Contact = () => <div className="cv-contact">{[
    { value: d.email, icon: Mail }, { value: d.phone, icon: Phone },
    { value: d.location, icon: MapPin }, { value: d.website, icon: Globe },
  ].filter((c) => c.value).map((c) => <div key={c.value}><c.icon aria-hidden /><span>{c.value}</span></div>)}</div>;
  const Experience = () => d.experience.length ? <section><H>Experience</H><div className="cv-entries">{d.experience.map((e, i) => <div key={i} className={cn("cv-entry", t.layout === "timeline" && "cv-timeline cv-border")}>
    <div className="cv-entry-heading"><p className="cv-job">{e.role}</p><p className="cv-detail">{e.period}</p></div>
    <p className="cv-employer cv-accent">{e.company}</p>
    {e.details.trim() && <ul className="cv-bullets">{e.details.split("\n").filter((l) => l.trim()).map((l, j) => <li key={j}>{l.replace(/^\s*[•●▪*-]\s+/, "")}</li>)}</ul>}
  </div>)}</div></section> : null;
  const Education = () => d.education.length ? <section><H>Education</H><div className="cv-entries">{d.education.map((e, i) => <div key={i} className="cv-entry"><p className="cv-job">{e.degree}</p><p>{e.school}</p><p className="cv-detail">{e.period}</p></div>)}</div></section> : null;
  const Skills = () => d.skills.trim() ? <section><H>Skills</H><ul className="cv-skills">{d.skills.split(",").map((s) => s.trim()).filter(Boolean).map((s, i) => <li key={i}>{s}</li>)}</ul></section> : null;
  const Side = () => <div className="cv-stack"><Skills /><Text label="Strengths" value={d.strengths} /><Text label="Languages" value={d.languages} /><Text label="Certifications" value={d.courses} /><Text label="Awards" value={d.awards} /></div>;
  const Main = () => <div className="cv-stack"><Text label="Profile" value={d.summary} /><Experience /><Text label="Projects" value={d.projects} /><Education /><Text label="References" value={d.references} /></div>;
  const colored = t.layout === "banner";
  const sidebar = t.layout === "sidebar";
  const split = t.layout === "split";

  return <article ref={frame} aria-label={`${t.name} resume preview`} className={cn("cv-root w-full bg-paper text-ink paper-shadow", className)} style={{ "--cv": accent ?? t.accent, height: geometry.height * geometry.scale } as CSSProperties}>
    <div ref={sheet} className={cn("cv-sheet", t.font === "serif" ? "font-display" : "font-sans", `cv-layout-${t.layout}`)} style={{ transform: `scale(${geometry.scale})` }}>
      <header className={cn("cv-header", colored && "cv-bg text-paper")}>
        <h1 ref={name}>{d.name}</h1>
        {d.title && <p className={cn("cv-profession", !colored && "cv-accent")}>{d.title}</p>}
        {!sidebar && <Contact />}
      </header>
      {sidebar ? <div className="cv-columns cv-sidebar-columns"><aside className="cv-sidebar cv-bg text-paper"><Contact /><Side /></aside><div className="cv-main"><Main /></div></div>
        : split ? <div className="cv-columns cv-split-columns"><div className="cv-main"><Main /></div><aside className="cv-sidebar cv-soft"><Side /></aside></div>
        : <div className="cv-columns"><Main /><Side /></div>}
    </div>
  </article>;
}