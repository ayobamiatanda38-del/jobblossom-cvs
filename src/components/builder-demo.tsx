import { useEffect, useState } from "react";
import { LockKeyhole, CloudCheck } from "lucide-react";
import { ResumePreview } from "@/components/resume-preview";
import { getTemplate, type ResumeData } from "@/lib/templates";

const DEMO_TEMPLATES = ["prime", "axis", "noir", "fresh"] as const;

type ScriptField = { key: string; label: string; value: string; group: "root" | "experience" | "education" };
const SCRIPT: ScriptField[] = [
  { key: "name", label: "Full name", value: "Amara Okafor", group: "root" },
  { key: "title", label: "Job title", value: "Product Designer", group: "root" },
  { key: "summary", label: "Professional summary", value: "Product designer with 6 years of experience shipping fintech tools used across Africa and the US.", group: "root" },
  { key: "role", label: "Job title", value: "Senior Product Designer", group: "experience" },
  { key: "company", label: "Employer", value: "Flux Bank", group: "experience" },
  { key: "period", label: "Dates", value: "2022 — Present", group: "experience" },
  { key: "details", label: "Achievements", value: "Led redesign of the savings flow, lifting activation 24%.", group: "experience" },
  { key: "degree", label: "Degree", value: "B.Sc. Computer Science", group: "education" },
  { key: "school", label: "School", value: "University of Lagos", group: "education" },
  { key: "skills", label: "Skills", value: "Product strategy, Figma, Design systems, User research", group: "root" },
];

type DemoState = { values: Record<string, string>; field: number; char: number; round: number };
const initial: DemoState = { values: {}, field: 0, char: 0, round: 0 };

function tick(s: DemoState): DemoState {
  const current = SCRIPT[s.field];
  if (!current) return s; // finished — handled by the pause/restart effect below
  if (s.char < current.value.length) {
    return { ...s, char: s.char + 1, values: { ...s.values, [current.key]: current.value.slice(0, s.char + 1) } };
  }
  return { ...s, field: s.field + 1, char: 0 };
}

export function BuilderDemo() {
  const [state, setState] = useState<DemoState>(initial);
  const [paused, setPaused] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const done = state.field >= SCRIPT.length;
    if (done && !paused) { setPaused(true); return; }
    const delay = done ? 2800 : state.char === 0 ? 420 : 30;
    const id = setTimeout(() => {
      if (done && paused) {
        // Smoothly cross-fade into the next template instead of snapping back.
        setFading(true);
        setTimeout(() => {
          setState({ ...initial, round: (state.round + 1) % DEMO_TEMPLATES.length });
          setPaused(false);
          setFading(false);
        }, 280);
        return;
      }
      setState(tick(state));
    }, delay);
    return () => clearTimeout(id);
  }, [state, paused]);

  const template = getTemplate(DEMO_TEMPLATES[state.round]!);
  const v = state.values;
  const educationStarted = SCRIPT.slice(0, state.field + 1).some((f) => f.group === "education");
  const data: ResumeData = {
    ...template.sample,
    name: v["name"] ?? "",
    title: v["title"] ?? "",
    summary: v["summary"] ?? "",
    skills: v["skills"] ?? "",
    experience: v["role"] || v["company"] || v["period"] || v["details"]
      ? [{ role: v["role"] ?? "", company: v["company"] ?? "", period: v["period"] ?? "", details: v["details"] ?? "" }]
      : [],
    education: educationStarted ? [{ degree: v["degree"] ?? "", school: v["school"] ?? "", period: "2015 — 2019" }] : [],
  };

  const activeField = SCRIPT[state.field];
  const stepNumber = Math.min(state.field + 1, SCRIPT.length);

  return (
    <div className="overflow-hidden border border-ink bg-paper soft-shadow">
      {/* browser chrome */}
      <div className="flex items-center gap-2 border-b border-line bg-muted px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-primary/70" /><span className="size-2.5 rounded-full bg-mint-strong/70" /><span className="size-2.5 rounded-full bg-line" />
        <span className="ml-2 flex-1 truncate rounded-md bg-paper px-3 py-1 text-xs text-muted-foreground">jobprimed.com/builder</span>
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><CloudCheck className="size-3.5" />Saved</span>
      </div>
      <div className={`grid sm:grid-cols-[280px_1fr] transition-opacity duration-300 ${fading ? "opacity-0" : "opacity-100"}`}>
        {/* form panel */}
        <div className="space-y-4 border-b border-line p-5 sm:border-b-0 sm:border-r">
          <p className="text-xs font-bold uppercase tracking-wide text-primary">
            Step {Math.min(Math.ceil((stepNumber / SCRIPT.length) * 12), 12)} of 12 · {activeField?.group === "experience" ? "Experience" : activeField?.group === "education" ? "Education" : "Personal info"}
          </p>
          {SCRIPT.map((f, i) => {
            if (i > state.field) return null; // only show fields reached so far, keeps the panel compact
            return (
              <div key={f.group + f.key}>
                <p className="text-xs font-semibold text-muted-foreground">{f.label}</p>
                <p className={`mt-1 min-h-9 border px-2.5 py-2 text-sm ${i === state.field ? "border-primary bg-coral-soft/40" : "border-line bg-background"}`}>
                  {state.values[f.key] ?? ""}
                  {i === state.field && <span className="ml-0.5 inline-block h-4 w-px animate-pulse bg-primary align-text-bottom" />}
                </p>
              </div>
            );
          })}
        </div>
        {/* live preview panel */}
        <div className="relative bg-muted p-5 sm:p-8">
          <div className="mb-4 flex items-center justify-between">
            <p className="flex items-center gap-2 text-xs font-bold"><span className="grid size-6 place-items-center rounded bg-ink text-paper">{state.round + 1}</span>Template: {template.name}</p>
            <span className="flex items-center gap-1 rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold text-paper"><LockKeyhole className="size-3" />LIVE PREVIEW</span>
          </div>
          <div className="mx-auto max-w-[420px] transition-opacity duration-500" key={template.id}>
            <ResumePreview data={data} template={template} />
          </div>
        </div>
      </div>
    </div>
  );
}
