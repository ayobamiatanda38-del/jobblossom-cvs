import { useRef, useState } from "react";
import { Sparkles, Square, Check, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const ROLES = ["Accountant","Administrative Assistant","Business Analyst","Customer Service Representative","Data Analyst","Data Scientist","Digital Marketer","Financial Analyst","Graphic Designer","Human Resources Manager","Nurse","Operations Manager","Product Manager","Product Designer","Project Manager","Sales Executive","Software Engineer","Frontend Developer","Backend Developer","Teacher","Marketing Manager","Supply Chain Manager","Social Media Manager","Civil Engineer","Pharmacist","Lawyer","Bank Teller","Content Writer"];

export function AiSuggest({ jobTitle, section, current, context, onUse }: { jobTitle: string; section: string; current: string; context?: string | undefined; onUse: (text: string, mode: "replace" | "append") => void }) {
  const [out, setOut] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const ctrl = useRef<AbortController | null>(null);
  const [ask, setAsk] = useState(false); const [role, setRole] = useState(jobTitle);
  const title = role.trim() || jobTitle.trim();

  async function run(t = title) {
    setOut(""); setErr(""); setBusy(true);
    const ac = new AbortController(); ctrl.current = ac;
    try {
      const res = await fetch("/api/suggest", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jobTitle: t, section, current, context }), signal: ac.signal });
      if (!res.ok || !res.body) { const j = await res.json().catch(() => ({})); setErr(j.error ?? "Couldn't get a suggestion."); return; }
      const reader = res.body.getReader(); const dec = new TextDecoder(); let text = "";
      for (;;) {
        const { done, value } = await reader.read(); if (done) break;
        text += dec.decode(value, { stream: true });
        const i = text.indexOf("[[ERROR]]");
        if (i >= 0) { setOut(text.slice(0, i).trim()); setErr(text.slice(i + 9)); } else setOut(text);
      }
    } catch (e) { if ((e as Error).name !== "AbortError") setErr("Connection lost. Please try again."); }
    finally { setBusy(false); ctrl.current = null; }
  }

  return <div className="mt-3 rounded-md border border-dashed border-primary/40 bg-primary/5 p-3">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-primary"><Sparkles className="size-3.5" />{title ? `AI suggestions for ${title}` : "AI assistant — get help writing this section"}</p>
      {busy ? <Button type="button" size="sm" variant="outline" onClick={() => ctrl.current?.abort()}><Square />Stop</Button>
        : <Button type="button" size="sm" variant="outline" onClick={() => { setRole(role || jobTitle); setAsk(true); }}><Sparkles />{out ? "Try again" : current.trim() ? "Improve with AI" : "Write with AI"}</Button>}
    </div>
    {busy && !out && <p className="mt-2 text-xs text-muted-foreground animate-pulse">Writing a suggestion…</p>}
    {out && <div className="mt-2 whitespace-pre-wrap rounded bg-paper p-3 text-sm leading-6">{out}</div>}
    {out && !busy && <div className="mt-2 flex flex-wrap gap-2">
      <Button type="button" size="sm" onClick={() => { onUse(out.trim(), "replace"); setOut(""); }}><Check />Use this</Button>
      {current.trim() && <Button type="button" size="sm" variant="outline" onClick={() => { onUse(out.trim(), "append"); setOut(""); }}><Plus />Add to mine</Button>}
      <Button type="button" size="sm" variant="ghost" onClick={() => setOut("")}><X />Dismiss</Button>
    </div>}
    <Dialog open={ask} onOpenChange={setAsk}><DialogContent className="max-w-md duration-300">
      <DialogHeader><DialogTitle className="font-display text-2xl">Which job is this for?</DialogTitle><DialogDescription>Type or pick a job title and the AI will write your {section.toLowerCase()} for it.</DialogDescription></DialogHeader>
      <Input autoFocus list="ai-roles" className="h-12" placeholder="e.g. Data Analyst" value={role} onChange={(e) => setRole(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && role.trim()) { setAsk(false); run(role.trim()); } }} />
      <datalist id="ai-roles">{ROLES.map((r) => <option key={r} value={r} />)}</datalist>
      <div className="flex flex-wrap gap-1.5">{ROLES.filter((r) => !role || r.toLowerCase().includes(role.toLowerCase())).slice(0, 6).map((r) => <button key={r} type="button" onClick={() => setRole(r)} className="rounded-full border border-line px-3 py-1 text-xs hover:border-primary">{r}</button>)}</div>
      <Button size="lg" disabled={!role.trim()} onClick={() => { setAsk(false); run(role.trim()); }}><Sparkles />Write with AI</Button>
    </DialogContent></Dialog>
    {err && <p role="alert" className="mt-2 text-xs text-destructive">{err}</p>}
  </div>;
}
