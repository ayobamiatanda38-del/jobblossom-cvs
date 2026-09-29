import { Mail, MapPin, Phone } from "lucide-react";

type ResumeData = {
  name?: string; title?: string; email?: string; phone?: string; location?: string;
  summary?: string; company?: string; role?: string; experience?: string;
  school?: string; degree?: string; skills?: string;
};

export function ResumePreview({ data = {}, compact = false }: { data?: ResumeData; compact?: boolean }) {
  const d = { name: "Amara Okafor", title: "Product Marketing Manager", email: "amara@email.com", phone: "+234 801 234 5678", location: "Lagos, Nigeria", summary: "Strategic product marketer with 7+ years of experience turning customer insight into campaigns that drive adoption and sustainable growth.", company: "CloudNine Africa", role: "Senior Product Marketing Manager", experience: "Led go-to-market strategy across three markets, increasing qualified pipeline by 38%. Built a customer research programme that shaped two successful product launches.", school: "University of Lagos", degree: "B.Sc. Business Administration", skills: "Go-to-market strategy, Customer research, Analytics, Brand positioning", ...data };
  return (
    <article className={`bg-paper text-ink paper-shadow ${compact ? "aspect-[0.73] w-full p-4 text-[7px] sm:p-6 sm:text-[8px]" : "min-h-[720px] w-full p-6 text-[9px] sm:p-10 sm:text-[10px]"}`}>
      <header className="border-b-2 border-ink pb-4">
        <h2 className={`${compact ? "text-xl sm:text-2xl" : "text-3xl sm:text-4xl"} font-display`}>{d.name}</h2>
        <p className="mt-1 font-semibold text-primary">{d.title}</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
          <span className="flex items-center gap-1"><Mail className="size-2.5" />{d.email}</span><span className="flex items-center gap-1"><Phone className="size-2.5" />{d.phone}</span><span className="flex items-center gap-1"><MapPin className="size-2.5" />{d.location}</span>
        </div>
      </header>
      <section className="mt-5"><CvTitle>Profile</CvTitle><p className="mt-2 leading-relaxed text-muted-foreground">{d.summary}</p></section>
      <section className="mt-5"><CvTitle>Experience</CvTitle><div className="mt-2 flex justify-between gap-3"><div><strong>{d.role}</strong><p className="text-primary">{d.company}</p></div><span className="text-muted-foreground">2022 — Present</span></div><p className="mt-2 leading-relaxed text-muted-foreground">{d.experience}</p></section>
      <div className="mt-5 grid grid-cols-2 gap-5"><section><CvTitle>Education</CvTitle><strong className="mt-2 block">{d.degree}</strong><p className="text-muted-foreground">{d.school}</p></section><section><CvTitle>Skills</CvTitle><p className="mt-2 leading-relaxed text-muted-foreground">{d.skills}</p></section></div>
    </article>
  );
}

function CvTitle({ children }: { children: React.ReactNode }) { return <h3 className="text-[1em] font-bold uppercase tracking-[0.16em]">{children}</h3>; }