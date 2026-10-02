import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const KEY = "jobprimed:cookie-choice";

export function CookieConsent() {
  const [choice, setChoice] = useState<string | null>(null);
  useEffect(() => { setChoice(localStorage.getItem(KEY)); }, []);
  const select = (value: "accepted" | "rejected") => {
    localStorage.setItem(KEY, value);
    setChoice(value);
  };
  if (choice !== null) return null;
  return <div role="dialog" aria-label="Cookie preferences" className="fixed inset-x-3 bottom-3 z-[80] mx-auto max-w-2xl border border-line bg-paper p-5 soft-shadow sm:bottom-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex-1"><p className="font-semibold text-ink">Your privacy matters</p><p className="mt-1 text-sm leading-6 text-muted-foreground">Essential storage remembers your draft and session. We don’t currently use optional tracking cookies. Save your preference for future optional cookies on this device.</p></div>
      <div className="flex shrink-0 gap-2"><Button variant="outline" onClick={() => select("rejected")}>Reject</Button><Button onClick={() => select("accepted")}>Accept</Button></div>
    </div>
  </div>;
}