import { Link, useNavigate } from "@tanstack/react-router";
import { FileText, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { CreateResumeButton } from "@/components/create-resume-button";

const nav = [["Resume tools", "tools"], ["Examples", "examples"], ["How it works", "how"], ["Pricing", "pricing"], ["FAQ", "faq"]] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user } = useSession();
  const navigate = useNavigate();
  const signOut = async () => { await supabase.auth.signOut(); navigate({ to: "/", replace: true }); };
  const AuthButtons = ({ mobile }: { mobile?: boolean }) => user ? <>
    <span className="max-w-40 truncate text-sm text-muted-foreground">{user.email}</span>
    <Button variant="ghost" onClick={signOut}><LogOut />Sign out</Button>
  </> : <>
    <Button variant={mobile ? "outline" : "ghost"} asChild><Link to="/auth" search={{ mode: "signin" }}>Log in</Link></Button>
    <Button variant={mobile ? "outline" : "ghost"} asChild><Link to="/auth" search={{ mode: "signup" }}>Sign up</Link></Button>
  </>;
  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-background/95 backdrop-blur">
      <div className="site-header-inner">
        <Link to="/" className="flex shrink-0 items-center gap-2 whitespace-nowrap text-xl font-bold text-ink">
          <span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground"><FileText className="size-4" /></span>JobPrimed
        </Link>
        <nav className="desktop-navigation">
          {nav.map(([l, id]) => <Link key={id} to="/" hash={id} className="hover:text-ink">{l}</Link>)}
          <Link to="/resume-tailor" className="hover:text-ink">Resume tailor</Link>
          <Link to="/jobs" className="hover:text-ink">Jobs</Link>
          <Link to="/cover-letter-drafter" className="hover:text-ink">Cover letter AI</Link>
        </nav>
        <div className="desktop-account-actions">
          <AuthButtons />
          <CreateResumeButton />
        </div>
        <div className="compact-header-actions"><CreateResumeButton /><Button variant="ghost" size="icon" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</Button></div>
      </div>
      {open && <nav className="compact-navigation border-t border-line bg-background px-5 py-4">
        <div className="flex flex-col gap-2 text-sm font-medium">
          {nav.map(([l, id]) => <Link key={id} to="/" hash={id} onClick={() => setOpen(false)} className="py-2">{l}</Link>)}
          <Link to="/resume-tailor" onClick={() => setOpen(false)} className="py-2">Resume tailor</Link>
          <Link to="/jobs" onClick={() => setOpen(false)} className="py-2">Jobs</Link>
          <Link to="/cover-letter-drafter" onClick={() => setOpen(false)} className="py-2">Cover letter AI</Link>
          <AuthButtons mobile />
          <CreateResumeButton />
        </div>
      </nav>}
    </header>
  );
}
