/* TalentKenya Companies — directory of KYC-verified employers with open roles. */
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { MapPin, Search, ShieldCheck, Building2 } from "lucide-react";
import { COMPANIES, JOBS } from "@/lib/data";
import { Badge } from "@/components/primitives";
import { PublicLayout } from "@/components/Layout";

export default function CompaniesPage() {
  const [, nav] = useLocation();
  const [q, setQ] = useState("");
  const [industry, setIndustry] = useState("");
  const industries = Array.from(new Set(COMPANIES.map(c => c.industry)));

  const list = COMPANIES.filter(c => {
    if (q && !`${c.name} ${c.industry} ${c.county}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (industry && c.industry !== industry) return false;
    return true;
  });

  return (
    <PublicLayout>
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold">Company directory</h1>
        <p className="text-sm text-muted-foreground mt-1">Only KYC-verified employers appear here. Zero scam tolerance.</p>
      </div>
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex items-center gap-2 bg-card rounded-md border border-border px-3 flex-1">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search companies..." className="w-full py-2.5 text-sm bg-transparent outline-none" />
        </div>
        <select value={industry} onChange={e => setIndustry(e.target.value)} className="select-std md:w-56">
          <option value="">All industries</option>
          {industries.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map(c => {
          const jobs = JOBS.filter(j => j.companyId === c.id).length;
          return (
            <Link key={c.id} href={`/companies/${c.slug}`}
              className="bg-card rounded-lg border border-border p-5 hover:shadow-md hover:border-[#166534]/30 transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-md flex items-center justify-center text-white font-heading font-bold text-lg" style={{ backgroundColor: c.logoColor }}>{c.name.charAt(0)}</div>
                <div>
                  <h3 className="font-semibold leading-tight group-hover:text-[#166534] transition-colors">{c.name}</h3>
                  <p className="text-xs text-muted-foreground">{c.industry}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><MapPin className="h-3 w-3" />{c.town}, {c.county}</p>
              <p className="text-xs text-muted-foreground mb-4">est. {c.founded}</p>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <Badge variant="verified"><ShieldCheck className="h-3 w-3" /> Verified</Badge>
                <span className="text-xs font-semibold text-[#166534] flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{jobs} open role{jobs === 1 ? "" : "s"}</span>
              </div>
            </Link>
          );
        })}
      </div>
      {list.length === 0 && (
        <p className="text-center text-muted-foreground py-16">No companies match your search.</p>
      )}
    </div>
    </PublicLayout>
  );
}
