import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { COVER_SAMPLES } from "@/lib/document-samples";

export const Route = createFileRoute("/cover-letters")({ head: () => ({ meta: [
  { title: "Cover Letter Templates — JobPrimed" }, { name: "description", content: "Choose an original cover letter starting point for your next application." },
  { property: "og:title", content: "Cover Letter Templates — JobPrimed" }, { property: "og:description", content: "Cover letter examples for professionals, career changers and graduates." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
] }), component: CoverLetters });

function CoverLetters() {
  const [chosen, setChosen] = useState(0); const [copied, setCopied] = useState(false);
  const s = COVER_SAMPLES[chosen] ?? COVER_SAMPLES[0]!;
  const content = `${s.greeting}\n\n${s.opening}\n\n${s.body}\n\n${s.closing}\n\nSincerely,\n[Your Name]`;
  return <div className="min-h-screen bg-background"><SiteHeader /><main className="mx-auto max-w-5xl px-5 py-12 sm:py-20"><Button variant="ghost" asChild><Link to="/"><ArrowLeft />Home</Link></Button><h1 className="mt-6 font-display text-4xl sm:text-6xl">Cover letter templates</h1><p className="mt-3 text-muted-foreground">Choose a starting point, then replace the bracketed details with your own story.</p><div className="mt-8 flex flex-wrap gap-2">{COVER_SAMPLES.map((x,i) => <Button key={x.name} variant={chosen === i ? "ink" : "outline"} onClick={() => { setChosen(i); setCopied(false); }}>{x.name}</Button>)}</div><div className="mt-7 max-w-3xl border border-line bg-paper p-7 sm:p-12 paper-shadow"><p className="whitespace-pre-line text-base leading-8">{content}</p></div><Button className="mt-6" onClick={async () => { await navigator.clipboard.writeText(content); setCopied(true); }}><Copy />{copied ? "Copied" : "Copy letter"}</Button></main></div>;
}