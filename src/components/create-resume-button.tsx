import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ResumePreview } from "@/components/resume-preview";
import { INDUSTRIES, TEMPLATES } from "@/lib/templates";

export function CreateResumeButton({ large = false, className }: { large?: boolean; className?: string }) {
  const [open, setOpen] = useState(false);
  const [industry, setIndustry] = useState("All");
  const templates = industry === "All" ? TEMPLATES : TEMPLATES.filter(t => t.industry === industry);
  return <>
    <Button variant="hero" size={large ? "lg" : "default"} className={className} onClick={() => setOpen(true)}>Create my resume{large && <ArrowRight />}</Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="template-picker">
        <DialogHeader><p className="text-xs font-semibold uppercase text-primary">Your next chapter starts here</p><DialogTitle className="font-display text-3xl sm:text-4xl">Choose your resume template</DialogTitle><DialogDescription>A look that feels like you. Pick one and make it yours.</DialogDescription></DialogHeader>
        <div className="flex gap-2 overflow-x-auto py-2">{INDUSTRIES.map(value => <Button key={value} size="sm" variant={industry === value ? "ink" : "outline"} onClick={() => setIndustry(value)}>{value}</Button>)}</div>
        <div className="template-row">{templates.map(template => <Button key={template.id} asChild variant="template" className="template-option"><Link to="/builder" search={{ template: template.id }} onClick={() => setOpen(false)} aria-label={`Use ${template.name} template`}>
          <div className="pointer-events-none w-full"><ResumePreview template={template} /></div>
          <div className="flex w-full items-center justify-between gap-2 pt-3"><div><p className="font-semibold">{template.name}</p><p className="text-xs text-muted-foreground">{template.industry}</p></div>{template.pro ? <span className="flex items-center gap-1 text-xs text-muted-foreground"><LockKeyhole className="size-3" />Pro</span> : <span className="text-xs text-mint-strong">Free</span>}</div>
          <span className="mt-3 flex w-full items-center justify-between border-t border-line pt-3 text-xs font-semibold text-primary">Use this template<ArrowRight /></span>
        </Link></Button>)}</div>
        <p className="text-xs text-muted-foreground">You can change templates later without losing your content. Pro templates are free to preview.</p>
      </DialogContent>
    </Dialog>
  </>;
}