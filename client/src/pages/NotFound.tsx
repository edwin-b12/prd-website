/* TalentKenya 404 — rebranded error page with brand colors, logo, and helpful links. */
import { Link } from "wouter";
import { Home, Search, Briefcase, Building2, Newspaper, GraduationCap, ArrowLeft } from "lucide-react";
import { LOGO } from "@/lib/brand";

export default function NotFound() {
  const quickLinks = [
    { href: "/jobs", label: "Browse all jobs", icon: Briefcase, desc: "Search 47 counties" },
    { href: "/companies", label: "Explore companies", icon: Building2, desc: "Verified employers" },
    { href: "/blog", label: "Career insights", icon: Newspaper, desc: "Guides & job market news" },
    { href: "/courses", label: "Upskill", icon: GraduationCap, desc: "Training courses" },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl text-center">
        <img src={LOGO} alt="TalentKenya" className="h-12 w-12 mx-auto mb-5" />
        <p className="font-heading font-bold text-xl mb-8">Talent<span className="text-[#166534]">Kenya</span></p>

        <div className="relative inline-flex mb-6">
          <span className="font-heading text-[7rem] leading-none font-bold text-[#166534]/15 select-none">404</span>
          <Search className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 text-[#166534]" />
        </div>

        <h1 className="font-heading text-3xl font-bold text-foreground mb-3">Page not found</h1>
        <p className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
          This page seems to have wandered off — it may have moved or been removed.
          Here are some useful places to get back on track.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {quickLinks.map(q => (
            <Link key={q.href} href={q.href}
              className="group bg-card border border-border rounded-lg p-4 text-center hover:border-[#166534] hover:shadow-md transition-all">
              <q.icon className="h-6 w-6 mx-auto mb-2 text-[#166534]" />
              <p className="text-sm font-semibold text-foreground group-hover:text-[#166534] transition-colors">{q.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{q.desc}</p>
            </Link>
          ))}
        </div>

        <Link href="/"
          className="btn-press inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[#166534] hover:bg-[#14532d] text-white font-semibold text-sm">
          <Home className="h-4 w-4" /> Go to homepage
        </Link>
        <button onClick={() => window.history.back()}
          className="btn-press ml-3 inline-flex items-center gap-1.5 px-4 py-3 rounded-md border border-border bg-card text-foreground hover:bg-secondary font-medium text-sm">
          <ArrowLeft className="h-4 w-4" /> Go back
        </button>
      </div>
    </div>
  );
}
