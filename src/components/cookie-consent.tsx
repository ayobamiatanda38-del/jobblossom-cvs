import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import cookie from "@/assets/privacy-cookie.png";

const KEY = "jobprimed:cookie-choice";

export function CookieConsent() {
  const [choice, setChoice] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    let stored: string | null = null;
    try { stored = localStorage.getItem(KEY); } catch { /* Storage may be disabled. */ }
    setChoice(stored);
    if (stored !== null) return;
    const timer = setTimeout(() => setVisible(true), 1800);
    return () => clearTimeout(timer);
  }, []);
  const select = (value: "accepted" | "rejected") => {
    try { localStorage.setItem(KEY, value); } catch { /* Respect choice even without storage. */ }
    setChoice(value);
  };
  if (choice !== null || !visible) return null;
  return <div role="dialog" aria-label="Cookie preferences" className="cookie-strip">
    <img src={cookie} width={104} height={104} alt="Chocolate chip cookie" className="cookie-photo" />
    <div className="cookie-content">
      <div className="min-w-0 flex-1"><p className="font-semibold text-ink">A little cookie. A lot of respect.</p><p className="mt-1 text-sm leading-6 text-muted-foreground">Essential storage keeps your draft and session. No optional tracking cookies are currently used. <Link to="/privacy" className="underline underline-offset-2">Privacy notice</Link></p></div>
      <div className="flex shrink-0 gap-2"><Button variant="outline" onClick={() => select("rejected")}>Only essential</Button><Button onClick={() => select("accepted")}>Accept</Button></div>
    </div>
  </div>;
}