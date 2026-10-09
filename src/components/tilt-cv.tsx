import { useRef, useState } from "react";
import { ResumePreview } from "@/components/resume-preview";
import { getTemplate } from "@/lib/templates";

/** Interactive 3D resume stack: cursor-driven tilt, glare, and layered floating parts. */
export function TiltCV() {
  const ref = useRef<HTMLDivElement>(null);
  const [r, setR] = useState({ x: -6, y: 12, gx: 50, gy: 30 });
  const move = (e: React.PointerEvent) => {
    const b = ref.current?.getBoundingClientRect();
    if (!b) return;
    const px = (e.clientX - b.left) / b.width, py = (e.clientY - b.top) / b.height;
    setR({ x: (0.5 - py) * 22, y: (px - 0.5) * 26, gx: px * 100, gy: py * 100 });
  };
  const layer = (z: number) => ({ transform: `translateZ(${z}px)` });
  return (
    <div ref={ref} onPointerMove={move} onPointerLeave={() => setR({ x: -6, y: 12, gx: 50, gy: 30 })} className="perspective-card relative mx-auto w-full max-w-[470px] cursor-grab select-none py-6">
      <div className="preserve-3d relative transition-transform duration-200 ease-out" style={{ transform: `rotateX(${r.x}deg) rotateY(${r.y}deg)` }}>
        <div className="absolute inset-0 translate-x-6 translate-y-6 rotate-3 rounded-md bg-mint" style={layer(-80)} />
        <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-md bg-paper opacity-70 paper-shadow" style={layer(-40)}>
          <ResumePreview template={getTemplate("axis")} className="opacity-40" />
        </div>
        <div className="relative" style={layer(0)}>
          <ResumePreview template={getTemplate("prime")} />
          <div className="pointer-events-none absolute inset-0 mix-blend-soft-light" style={{ background: `radial-gradient(circle at ${r.gx}% ${r.gy}%, color-mix(in oklab, var(--paper) 90%, transparent), transparent 55%)` }} />
        </div>
        <div className="absolute -right-6 top-16 rounded-md border border-line bg-paper px-3 py-2 text-xs font-bold soft-shadow" style={layer(90)}>✦ Keyword match 92%</div>
        <div className="absolute -left-8 bottom-10 flex items-center gap-3 rounded-md border border-line bg-paper px-4 py-3 soft-shadow" style={layer(120)}>
          <span className="grid size-10 place-items-center rounded-full bg-mint font-bold text-mint-strong">96</span>
          <div><strong className="text-sm">Excellent ATS score</strong><p className="text-xs text-muted-foreground">Ready to send</p></div>
        </div>
        <div className="absolute -top-3 left-10 rounded-full bg-ink px-3 py-1 text-[11px] font-bold text-paper" style={layer(60)}>Live preview</div>
      </div>
    </div>
  );
}
