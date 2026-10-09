import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { RESIGNATION_SAMPLES } from "@/lib/document-samples";

export const Route = createFileRoute("/resignation-letters")({ head: () => ({ meta: [
  { title: "Resignation Letter Templates — JobPrimed" }, { name: "description", content: "Write a clear, considerate resignation letter with an editable starting point." },
  { property: "og:title", content: "Resignation Letter Templates — JobPrimed" }, { property: "og:description", content: "Thoughtful resignation letter examples for a smooth transition." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
] }), component: ResignationLetters });

function ResignationLetters() {
  const [chosen, setChosen] = useState(0); const [copied, setCopied] = useState(false);
  const s = RESIGNATION_SAMPLES[chosen] ?? RESIGNATION_SAMPLES[0]!;
  const content = `Dear [Manager Name],\n\n${s.opening}\n\n${s.body}\n\n${s.closing}\n\nSincerely,\n[Your Name]`;
  return <div className="min-h-screen bg-background"><SiteHeader /><main className="mx-auto max-w-5xl px-5 py-12 sm:py-20"><Button variant="ghost" asChild><Link to="/"><ArrowLeft />Home</Link></Button><h1 className="mt-6 font-display text-4xl sm:text-6xl">Resignation letters</h1><p className="mt-3 text-muted-foreground">Choose a tone and personalize the bracketed details before sending.</p><div className="mt-8 flex flex-wrap gap-2">{RESIGNATION_SAMPLES.map((x,i) => <Button key={x.name} variant={chosen === i ? "ink" : "outline"} onClick={() => { setChosen(i); setCopied(false); }}>{x.name}</Button>)}</div><div className="mt-7 max-w-3xl border border-line bg-paper p-7 sm:p-12 paper-shadow"><p className="whitespace-pre-line text-base leading-8">{content}</p></div><Button className="mt-6" onClick={async () => { await navigator.clipboard.writeText(content); setCopied(true); }}><Copy />{copied ? "Copied" : "Copy letter"}</Button></main></div>;
}