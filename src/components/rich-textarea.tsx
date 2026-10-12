import { useRef } from "react";
import { Bold, Italic, Link2, List, ListOrdered, Strikethrough, Underline } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  id?: string;
  value: string;
  rows?: number;
  placeholder?: string;
  className?: string;
  onChange: (v: string) => void;
};

/** Textarea with a formatting toolbar (bold, italic, strikethrough, underline, lists, link). */
export function RichTextarea({ id, value, rows = 7, placeholder, className, onChange }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const wrap = (before: string, after = before) => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const sel = value.slice(s, e) || "text";
    onChange(value.slice(0, s) + before + sel + after + value.slice(e));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + before.length, s + before.length + sel.length);
    });
  };

  const eachLine = (fn: (line: string, i: number) => string) => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const block = value.slice(s, e) || value;
    const replaced = block.split("\n").map(fn).join("\n");
    onChange(value.slice(0, s) + replaced + value.slice(e));
    requestAnimationFrame(() => el.focus());
  };

  const link = () => {
    const url = window.prompt("Link address (https://…)");
    if (url) wrap("[", `](${url})`);
  };

  const tools = [
    { icon: Bold, label: "Bold", run: () => wrap("**") },
    { icon: Italic, label: "Italic", run: () => wrap("*") },
    { icon: Strikethrough, label: "Strikethrough", run: () => wrap("~~") },
    { icon: Underline, label: "Underline", run: () => wrap("__") },
    { icon: List, label: "Bullet list", run: () => eachLine((l) => (l.startsWith("• ") ? l : `• ${l}`)) },
    { icon: ListOrdered, label: "Numbered list", run: () => eachLine((l, i) => `${i + 1}. ${l.replace(/^\d+\.\s*/, "")}`) },
    { icon: Link2, label: "Insert link", run: link },
  ];

  return (
    <div className="overflow-hidden rounded-md border border-input bg-paper focus-within:ring-2 focus-within:ring-ring">
      <div className="flex items-center gap-0.5 border-b border-line px-2 py-1.5" role="toolbar" aria-label="Text formatting">
        {tools.map((t) => (
          <button
            key={t.label}
            type="button"
            title={t.label}
            aria-label={t.label}
            onClick={t.run}
            className="grid size-8 place-items-center rounded text-muted-foreground transition hover:bg-muted hover:text-ink"
          >
            <t.icon className="size-4" />
          </button>
        ))}
      </div>
      <Textarea
        ref={ref}
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`border-0 bg-transparent focus-visible:ring-0 ${className ?? ""}`}
      />
    </div>
  );
}
