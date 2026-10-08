import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { LetterTemplateLibrary, slug } from "@/components/letter-template-library";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { RESIGNATION_SAMPLES } from "@/lib/document-samples";

export const Route = createFileRoute("/resignation-letters")({ head: () => ({ meta: [
  { title: "Resignation Letter Templates — JobPrimed" }, { name: "description", content: "Write a clear, considerate resignation letter with an editable starting point." },
  { property: "og:title", content: "Resignation Letter Templates — JobPrimed" }, { property: "og:description", content: "Thoughtful resignation letter examples for a smooth transition." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
] }), component: ResignationLetters });

function ResignationLetters() {
  const files = RESIGNATION_SAMPLES.map(s => ({ name: s.name, filename: `jobprimed-resignation-letter-${slug(s.name)}.pdf`, content: `Dear [Manager Name],\n\n${s.opening}\n\n${s.body}\n\n${s.closing}\n\nSincerely,\n[Your Name]` }));
  return <div className="min-h-screen bg-background"><SiteHeader /><main className="mx-auto max-w-5xl px-5 py-12 sm:py-20"><Button variant="ghost" asChild><Link to="/"><ArrowLeft />Home</Link></Button><h1 className="mt-6 font-display text-4xl sm:text-6xl">Resignation letters</h1><p className="mt-3 text-muted-foreground">Choose a tone and personalize the bracketed details before sending.</p><LetterTemplateLibrary files={files} /></main></div>;
}