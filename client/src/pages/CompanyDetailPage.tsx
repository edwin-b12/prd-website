/* TalentKenya Company Detail — employer branding page per PRD §Phase-2. */
import { Link, useParams } from "wouter";
import { ArrowLeft, MapPin, Building2, ShieldCheck, CheckCircle2, ArrowRight, BriefcaseBusiness, Eye } from "lucide-react";
import { COMPANIES, JOBS } from "@/lib/data";
import { Badge, daysAgo } from "@/components/primitives";
import { PublicLayout } from "@/components/Layout";

export default function CompanyDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const company = COMPANIES.find(c => c.slug === slug);
  const jobs = JOBS.filter(j => j.companyId === company?.id);

  if (!company) {
    return (
      <PublicLayout>
      <div className="container py-20 text-center">
        <p className="text-muted-foreground mb-4">Company not found.</p>
        <Link href="/companies" className="btn-press px-5 py-2.5 rounded-md bg-[#166534] text-white text-sm font-semibold">All companies</Link>
      </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
    <div className="container py-8">
      <Link href="/companies" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Company directory
      </Link>

      {/* Banner */}
      <div className="rounded-lg border border-border overflow-hidden bg-gradient-to-br from-[#062a17] to-[#166534] text-white">
        <div className="p-7 md:p-9">
          <div className="flex flex-wrap items-center gap-4">
            <div className="h-16 w-16 rounded-lg flex items-center justify-center text-white font-heading font-bold text-2xl shadow-lg" style={{ backgroundColor: company.logoColor }}>{company.name.charAt(0)}</div>
            <div>
              <h1 className="font-heading text-3xl font-bold flex items-center gap-2 flex-wrap">
                {company.name}
                <Badge variant="verified"><ShieldCheck className="h-3 w-3" /> KYC verified</Badge>
              </h1>
              <p className="text-white/70 text-sm mt-1">{company.industry} · est. {company.founded} · {jobs.length} open role{jobs.length === 1 ? "" : "s"}</p>
            </div>
          </div>
        </div>
        <div className="border-t border-white/15 bg-black/15 px-7 md:px-9 py-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
          <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{company.town}, {company.county}</span>
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-[#7fe0a0]" /> KRA PIN {company.kraPin}</span>
          <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4" /> Reg. {company.regNumber}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6 mt-6 items-start">
        <div className="bg-card rounded-lg border border-border p-6 md:p-8">
          <h2 className="font-heading text-xl font-bold mb-3">About {company.name}</h2>
          <p className="text-sm leading-relaxed text-foreground/85">{company.description}</p>
          <h2 className="font-heading text-xl font-bold mt-8 mb-3">What we look for</h2>
          <div className="grid grid-cols-2 gap-2">
            {["Talent development", "Integrity & trust", "Results over politics", "Community first"].map(v => (
              <div key={v} className="flex items-center gap-2 text-sm bg-secondary rounded-md px-3 py-2">
                <CheckCircle2 className="h-4 w-4 text-[#166534] shrink-0" /> {v}
              </div>
            ))}
          </div>
          <h2 className="font-heading text-xl font-bold mt-8 mb-3">Office</h2>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {company.town}, {company.county} County, Kenya</p>
        </div>

        <div>
          <h2 className="font-heading text-lg font-bold mb-3 flex items-center gap-2"><BriefcaseBusiness className="h-4 w-4" /> Open positions</h2>
          <div className="flex flex-col gap-3">
            {jobs.map(job => (
              <Link key={job.id} href={`/jobs/${job.slug}`}
                className="bg-card rounded-lg border border-border p-4 hover:shadow-md hover:border-[#166534]/30 transition-all group">
                <h3 className="font-semibold text-sm group-hover:text-[#166534] transition-colors flex items-start justify-between gap-2">
                  {job.title}
                  {job.featured && <Badge variant="featured">Featured</Badge>}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-x-3 gap-y-0.5 flex-wrap">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.county}</span>
                  <span>{job.jobType}</span>
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{job.views}</span>
                  <span>{daysAgo(job.posted)}</span>
                </p>
                <span className="text-xs text-[#166534] font-semibold mt-2 inline-flex items-center gap-1 group-hover:gap-2 transition-all">View role <ArrowRight className="h-3 w-3" /></span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
    </PublicLayout>
  );
}
