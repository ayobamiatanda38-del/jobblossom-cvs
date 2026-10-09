import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";

/** Discreet bottom-left support chat with an always-online indicator. */
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<{ me: boolean; t: string }[]>([{ me: false, t: "Hi there! Need help with your resume? Ask us anything." }]);
  const send = (e: React.FormEvent) => {
    e.preventDefault(); const t = text.trim(); if (!t) return;
    setMsgs((m) => [...m, { me: true, t }, { me: false, t: "Thanks! A JobPrimed advisor will reply here shortly. Meanwhile, try our free ATS checker." }]); setText("");
  };
  return <div className="fixed bottom-4 left-4 z-50">
    {open && <div className="mb-3 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-line bg-paper soft-shadow animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center justify-between bg-ink px-4 py-3 text-paper"><div><p className="text-sm font-bold">JobPrimed support</p><p className="flex items-center gap-1.5 text-xs opacity-80"><span className="size-2 rounded-full bg-mint-strong" />Online now</p></div><button aria-label="Close chat" onClick={() => setOpen(false)}><X className="size-4" /></button></div>
      <div className="max-h-72 space-y-2 overflow-y-auto p-3">{msgs.map((m, i) => <p key={i} className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${m.me ? "ml-auto bg-primary text-primary-foreground" : "bg-muted"}`}>{m.t}</p>)}</div>
      <form onSubmit={send} className="flex gap-2 border-t border-line p-2"><input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" className="flex-1 rounded-md bg-muted px-3 py-2 text-sm outline-none" /><button aria-label="Send" className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground"><Send className="size-4" /></button></form>
    </div>}
    <button aria-label="Open chat" onClick={() => setOpen(!open)} className="relative grid size-12 place-items-center rounded-full bg-ink text-paper soft-shadow transition hover:scale-105">
      <MessageCircle className="size-5" /><span className="absolute right-0.5 top-0.5 size-3 rounded-sm border-2 border-paper bg-mint-strong" />
    </button>
  </div>;
}
