import { useRef, useState } from "react";
import { FileUp, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { extractResumeText } from "@/lib/doc-files";

export function ResumeUpload({ onText }: { onText: (text: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(""); const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  async function pick(f?: File) {
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { setErr("That file is over 10MB."); return; }
    setBusy(true); setErr("");
    try {
      const t = await extractResumeText(f);
      if (t.length < 50) throw new Error("We couldn't read enough text from that file. Try another copy of your CV (a scanned image won't work).");
      setName(f.name); onText(t);
    } catch (e) { setName(""); onText(""); setErr((e as Error).message); }
    finally { setBusy(false); if (input.current) input.current.value = ""; }
  }
  return <div className="mt-2">
    <div className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-md border border-dashed border-line bg-paper p-6 text-center"
      onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); pick(e.dataTransfer.files[0]); }}>
      {name ? <><FileText className="size-10 text-primary" /><p className="font-semibold break-all">{name}</p>
        <div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => input.current?.click()}>Replace</Button>
        <Button size="sm" variant="ghost" onClick={() => { setName(""); onText(""); }}><X />Remove</Button></div></>
        : <><FileUp className="size-10 text-muted-foreground" /><p className="text-sm text-muted-foreground">Drop your CV here, or</p>
        <Button size="sm" disabled={busy} onClick={() => input.current?.click()}>{busy ? "Reading…" : "Upload resume"}</Button>
        <p className="text-xs text-muted-foreground">PDF, Word (.docx) or text file</p></>}
    </div>
    <input ref={input} type="file" hidden accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" onChange={e => pick(e.target.files?.[0])} />
    {err && <p role="alert" className="mt-2 text-sm text-destructive">{err}</p>}
  </div>;
}
