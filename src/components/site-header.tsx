import { Link, useNavigate } from "@tanstack/react-router";
import { FileText, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";

const nav = [["CV tools", "tools"], ["Examples", "examples"], ["How it works", "how"], ["Pricing", "pricing"], ["FAQ", "faq"]] as const;

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
      <div className="mx-auto flex h-17 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-ink">
          <span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground"><FileText className="size-4" /></span>JobPrimed
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground lg:flex">
          {nav.map(([l, id]) => <Link key={id} to="/" hash={id} className="hover:text-ink">{l}</Link>)}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <AuthButtons />
          <Button variant="hero" asChild><Link to="/builder">Create my CV</Link></Button>
        </div>
        <Button variant="ghost" size="icon" aria-label="Toggle menu" className="lg:hidden" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</Button>
      </div>
      {open && <nav className="border-t border-line bg-background px-5 py-4 lg:hidden">
        <div className="flex flex-col gap-2 text-sm font-medium">
          {nav.map(([l, id]) => <Link key={id} to="/" hash={id} onClick={() => setOpen(false)} className="py-2">{l}</Link>)}
          <AuthButtons mobile />
          <Button asChild><Link to="/builder">Create my CV</Link></Button>
        </div>
      </nav>}
    </header>
  );
}
