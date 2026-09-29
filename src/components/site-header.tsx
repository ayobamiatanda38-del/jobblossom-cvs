import { Link } from "@tanstack/react-router";
import { FileText, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-17 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-ink">
          <span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground"><FileText className="size-4" /></span>
          JobPrimed
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground lg:flex">
          <a href="/#tools" className="hover:text-ink">CV tools</a>
          <a href="/#examples" className="hover:text-ink">Examples</a>
          <a href="/#how" className="hover:text-ink">How it works</a>
          <a href="/#pricing" className="hover:text-ink">Pricing</a>
          <a href="/#faq" className="hover:text-ink">FAQ</a>
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <Button variant="ghost">Log in</Button>
          <Button variant="hero" asChild><Link to="/builder">Create my CV</Link></Button>
        </div>
        <Button variant="ghost" size="icon" aria-label="Toggle menu" className="lg:hidden" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</Button>
      </div>
      {open && <nav className="border-t border-line bg-background px-5 py-4 lg:hidden">
        <div className="flex flex-col gap-1 text-sm font-medium">
          {[["CV tools","tools"],["Examples","examples"],["How it works","how"],["Pricing","pricing"],["FAQ","faq"]].map(([label,id]) => <a key={id} href={`/#${id}`} onClick={() => setOpen(false)} className="py-3">{label}</a>)}
          <Button className="mt-2" asChild><Link to="/builder">Create my CV</Link></Button>
        </div>
      </nav>}
    </header>
  );
}