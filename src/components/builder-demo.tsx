import { useEffect, useReducer, useState } from "react";
import { LockKeyhole, CloudCheck } from "lucide-react";
import { ResumePreview } from "@/components/resume-preview";
import { getTemplate, type ResumeData } from "@/lib/templates";

const DEMO_TEMPLATES = ["prime", "axis", "noir", "fresh"] as const;
const SCRIPT: { key: keyof ResumeData; label: string; value: string }[] = [
  { key: "name", label: "Full name", value: "Amara Okafor" },
  { key: "title", label: "Job title", value: "Product Designer" },
  { key: "summary", label: "Professional summary", value: "Product designer with 6 years of experience shipping fintech tools used across Africa and the US." },
  { key: "skills", label: "Skills", value: "Product strategy, Figma, Design systems, User research" },
];

type DemoState = { values: Record<string, string>; field: number; char: number; round: number };
const initial: DemoState = { values: {}, field: 0, char: 0, round: 0 };

function tick(s: DemoState): DemoState {
  const current = SCRIPT[s.field];
  if (!current) {
    // Finished a round: pause, then restart with the next template.
    return { ...initial, round: (s.round + 1) % DEMO_TEMPLATES.length };
  }
  if (s.char < current.value.length) {
    return { ...s, char: s.char + 1, values: { ...s.values, [current.key]: current.value.slice(0, s.char + 1) } };
  }
  return { ...s, field: s.field + 1, char: 0 };
}

export function BuilderDemo() {
  const [state, setState] = useState<DemoState>(initial);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const done = state.field >= SCRIPT.length;
    const delay = done ? 2600 : state.char === 0 ? 420 : 34;
    const id = setTimeout(() => {
      if (done && paused) { setPaused(false); setState(tick(state)); return; }
      if (done) { setPaused(true); return; }
      setState(tick(state));
    }, delay);
    return () => clearTimeout(id);
  }, [state, paused]);

  const template = getTemplate(DEMO_TEMPLATES[state.round]!);
  const data: ResumeData = { ...template.sample, name: state.values["name"] ?? "", title: state.values["title"] ?? "", summary: state.values["summary"] ?? "", skills: state.values["skills"] ?? "", experience: [], education: [] };

  return (
    <div className="overflow-hidden border border-ink bg-paper soft-shadow">
      {/* browser chrome */}
      <div className="flex items-center gap-2 border-b border-line bg-muted px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-primary/70" /><span className="size-2.5 rounded-full bg-mint-strong/70" /><span className="size-2.5 rounded-full bg-line" />
        <span className="ml-2 flex-1 truncate rounded-md bg-paper px-3 py-1 text-xs text-muted-foreground">jobprimed.com/builder</span>
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><CloudCheck className="size-3.5" />Saved</span>
      </div>
      <div className="grid sm:grid-cols-[280px_1fr]">
        {/* form panel */}
        <div className="space-y-4 border-b border-line p-5 sm:border-b-0 sm:border-r">
          <p className="text-xs font-bold uppercase tracking-wide text-primary">Step 1 of 12 · Personal info</p>
          {SCRIPT.map((f, i) => (
            <div key={f.key}>
              <p className="text-xs font-semibold text-muted-foreground">{f.label}</p>
              <p className={`mt-1 min-h-9 border px-2.5 py-2 text-sm ${i === state.field ? "border-primary bg-coral-soft/40" : "border-line bg-background"}`}>
                {state.values[f.key] ?? ""}
                {i === state.field && <span className="ml-0.5 inline-block h-4 w-px animate-pulse bg-primary align-text-bottom" />}
              </p>
            </div>
          ))}
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
