/* TalentKenya Blog — career insights, salary guides, market data per PRD. */
import { Link } from "wouter";
import { ArrowRight, Clock } from "lucide-react";
import { BLOG } from "@/lib/data";

export default function BlogPage() {
  const [featured, ...rest] = BLOG;
  return (
    <div className="container py-8">
      <h1 className="font-heading text-3xl font-bold">Career insights</h1>
      <p className="text-sm text-muted-foreground mt-1 mb-8">Salary guides, interview prep, and honest takes on the Kenyan job market.</p>

      {featured && (
        <Link href={`/blog/${featured.id}`} className="group block bg-card rounded-lg border border-border overflow-hidden mb-6 hover:shadow-md transition-all">
          <div className="grid md:grid-cols-[1.2fr_1fr] gap-0">
            <div className="h-56 md:h-auto bg-gradient-to-br from-[#062a17] to-[#166534] flex items-center justify-center p-8">
              <span className="font-heading text-white/20 text-6xl font-bold leading-none">TK</span>
            </div>
            <div className="p-7">
              <BadgeTinted cat={featured.category} />
              <h2 className="font-heading text-2xl font-bold mt-2 group-hover:text-[#166534] transition-colors">{featured.title}</h2>
              <p className="text-sm text-muted-foreground mt-2">{featured.excerpt}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-4">
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{featured.readMin} min read</span>
                <span>{featured.date}</span>
              </div>
            </div>
          </div>
        </Link>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rest.map(p => (
          <Link key={p.id} href={`/blog/${p.id}`}
            className="group bg-card rounded-lg border border-border p-5 hover:shadow-md hover:border-[#166534]/30 transition-all flex flex-col">
            <BadgeTinted cat={p.category} />
            <h3 className="font-heading font-bold mt-2 group-hover:text-[#166534] transition-colors leading-snug">{p.title}</h3>
            <p className="text-sm text-muted-foreground mt-2 flex-1">{p.excerpt}</p>
            <div className="flex items-center justify-between border-t border-border pt-3 mt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{p.readMin} min</span>
              <span className="flex items-center gap-1 text-[#166534] font-semibold">Read <ArrowRight className="h-3 w-3" /></span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function BadgeTinted({ cat }: { cat: string }) {
  const map: Record<string, string> = {
    "Salary Guide": "bg-[#e0f2e9] text-[#14532d]",
    "Interviews": "bg-[#e0e7ff] text-[#4338ca]",
    "Career Advice": "bg-[#fef3c7] text-[#8a6d00]",
    "Market Report": "bg-[#fde8e7] text-[#b91c1c]",
    "CV Tips": "bg-[#f3e8ff] text-[#7e22ce]",
  };
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${map[cat] ?? "bg-muted text-muted-foreground"}`}>{cat}</span>;
}
