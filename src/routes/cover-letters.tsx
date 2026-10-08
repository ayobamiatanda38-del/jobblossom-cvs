import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { LetterTemplateLibrary, slug } from "@/components/letter-template-library";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { COVER_SAMPLES } from "@/lib/document-samples";

export const Route = createFileRoute("/cover-letters")({ head: () => ({ meta: [
  { title: "Cover Letter Templates — JobPrimed" }, { name: "description", content: "Choose an original cover letter starting point for your next application." },
  { property: "og:title", content: "Cover Letter Templates — JobPrimed" }, { property: "og:description", content: "Cover letter examples for professionals, career changers and graduates." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
] }), component: CoverLetters });

function CoverLetters() {
  const files = COVER_SAMPLES.map(s => ({ name: s.name, filename: `jobprimed-cover-letter-${slug(s.name)}.pdf`, content: `${s.greeting}\n\n${s.opening}\n\n${s.body}\n\n${s.closing}\n\nSincerely,\n[Your Name]` }));
  return <div className="min-h-screen bg-background"><SiteHeader /><main className="mx-auto max-w-5xl px-5 py-12 sm:py-20"><Button variant="ghost" asChild><Link to="/"><ArrowLeft />Home</Link></Button><h1 className="mt-6 font-display text-4xl sm:text-6xl">Cover letter templates</h1><p className="mt-3 text-muted-foreground">Choose a starting point, then replace the bracketed details with your own story.</p><LetterTemplateLibrary files={files} /></main></div>;
}