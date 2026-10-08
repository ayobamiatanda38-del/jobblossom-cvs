import { useState } from "react";
import { Copy, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadTextPdf } from "@/lib/doc-files";

export type LetterFile = { name: string; content: string; filename: string };

export function LetterTemplateLibrary({ files }: { files: LetterFile[] }) {
  const [chosen, setChosen] = useState(0); const [copied, setCopied] = useState(false);
  const f = files[chosen] ?? files[0]!;
  return <>
    <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {files.map((x, i) => <li key={x.filename} className={`flex flex-col gap-3 border bg-paper p-4 ${chosen === i ? "border-primary" : "border-line"}`}>
        <button className="flex items-center gap-3 text-left" onClick={() => { setChosen(i); setCopied(false); }}>
          <FileText className="size-8 shrink-0 text-primary" />
          <span><span className="block font-semibold">{x.name}</span><span className="block text-xs text-muted-foreground">{x.filename}</span></span>
        </button>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => { setChosen(i); setCopied(false); }}>Preview</Button>
          <Button size="sm" onClick={() => downloadTextPdf("", x.content, x.filename)}><Download />PDF</Button>
        </div>
      </li>)}
    </ul>
    <div className="mt-7 max-w-3xl border border-line bg-paper p-7 sm:p-12 paper-shadow"><p className="whitespace-pre-line text-base leading-8">{f.content}</p></div>
    <div className="mt-6 flex gap-3">
      <Button onClick={() => downloadTextPdf("", f.content, f.filename)}><Download />Download PDF</Button>
      <Button variant="outline" onClick={async () => { await navigator.clipboard.writeText(f.content); setCopied(true); }}><Copy />{copied ? "Copied" : "Copy letter"}</Button>
    </div>
  </>;
}

export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
