/* TalentKenya Career Hub — free upskilling courses per PRD §Phase-3. */
import { useState } from "react";
import { Clock, GraduationCap, PlayCircle } from "lucide-react";
import { COURSES } from "@/lib/data";
import { Badge } from "@/components/primitives";
import { toast } from "sonner";
import { PublicLayout } from "@/components/Layout";

export default function CoursesPage() {
  const [cat, setCat] = useState("");
  const cats = Array.from(new Set(COURSES.map(c => c.category)));
  const list = cat ? COURSES.filter(c => c.category === cat) : COURSES;

  return (
    <PublicLayout>
    <div className="container py-8">
      <div className="bg-[#062a17] rounded-lg p-8 md:p-10 text-white mb-8 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
        <Badge variant="remote">Career Hub</Badge>
        <h1 className="font-heading text-3xl md:text-4xl font-bold mt-3">Upskill for the Kenyan job market</h1>
        <p className="text-white/70 mt-2 max-w-xl text-sm">Practical, free courses on the skills Kenyan employers actually filter for. New content added weekly.</p>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        <button onClick={() => setCat("")} className={cat === "" ? "bg-[#166534] text-white" : "bg-secondary text-foreground"} style={{ padding: "7px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600 }}>All</button>
        {cats.map(c => (
          <button key={c} onClick={() => setCat(c)} className={cat === c ? "bg-[#166534] text-white" : "bg-secondary text-foreground"} style={{ padding: "7px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600 }}>{c}</button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map(c => (
          <div key={c.id} className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-md transition-all flex flex-col">
            <div className="h-28 bg-gradient-to-br from-[#062a17] to-[#166534] flex items-center justify-center">
              <GraduationCap className="h-10 w-10 text-[#7fe0a0]" />
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex flex-wrap gap-1.5 mb-2">
                <Badge variant={c.free ? "remote" : "gray"}>{c.free ? "Free" : "Premium"}</Badge>
                <Badge variant="outline">{c.level}</Badge>
              </div>
              <h3 className="font-heading font-bold text-lg leading-snug">{c.title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5 flex-1">{c.description}</p>
              <div className="flex items-center justify-between border-t border-border pt-3 mt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{c.duration}</span>
                <span>{c.lessons} lessons</span>
              </div>
              <button onClick={() => toast.success(c.free ? "Course opened — start learning!" : "Enroll via TalentKenya Pro (coming soon)", { description: c.description })}
                className="btn-press mt-3 w-full py-2.5 rounded-md bg-[#166534] text-white text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-[#14532d]">
                <PlayCircle className="h-4 w-4" /> {c.free ? "Start learning" : "Join waitlist"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
    </PublicLayout>
  );
}
