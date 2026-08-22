/* TalentKenya Home — hero w/ live search, stats bar, featured jobs, 8 category tiles,
   verified employer strip, career hub CTA. Two-column asymmetric hero. */
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, MapPin, ShieldCheck, ArrowRight, Zap, FileDown, Sparkles, Briefcase, Users, Building2, TrendingUp, CheckCircle2 } from "lucide-react";
import { JOBS, COMPANIES, INDUSTRIES, COUNTIES } from "@/lib/data";
import { Badge, daysAgo, KESAmount, MatchRing } from "@/components/primitives";
import { HERO_IMG, HERO_OFFICE_IMG } from "@/lib/brand";
import { usePlatform } from "@/lib/platform";
import { jobFitScore } from "@/lib/aiEngine";

export default function HomePage() {
  const [, nav] = useLocation();
  const [q, setQ] = useState("");
  const [county, setCounty] = useState("");
  const { role, profile } = usePlatform();

  const featured = JOBS.filter(j => j.featured).slice(0, 4);
  const urgent = JOBS.filter(j => j.urgent && !j.featured).slice(0, 4);
  const topCompanies = COMPANIES.filter(c => c.verified).slice(0, 6);

  const runSearch = () => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (county) params.set("county", county);
    nav(`/jobs${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <>
      {/* ── Hero: asymmetric two-column with live search ── */}
      <section className="relative overflow-hidden bg-[#062a17] text-white">
        <img src={HERO_IMG} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#062a17] via-[#062a17]/85 to-transparent" />
        <div className="container relative grid lg:grid-cols-[1.2fr_1fr] gap-10 items-center py-16 md:py-24">
          <div>
            <Badge variant="verified" className="mb-5">
              <ShieldCheck className="h-3 w-3" /> Zero-scam verified listings
            </Badge>
            <h1 className="font-heading text-4xl md:text-6xl font-bold leading-[1.05]">
              Kenya's most trusted path to <span className="text-[#7fe0a0]">meaningful work</span>.
            </h1>
            <p className="mt-5 text-white/70 text-lg max-w-xl">
              {JOBS.length}+ verified vacancies across all 47 counties. Apply in one click with your profile, track every stage, and get paid work — never pay to work.
            </p>

            <div className="mt-8 bg-white rounded-lg p-2 shadow-2xl grid md:grid-cols-[1fr_1fr_auto] gap-2">
              <div className="flex items-center gap-2 px-3">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === "Enter" && runSearch()}
                  placeholder="Job title, skills or keywords"
                  className="w-full py-3 text-sm text-foreground placeholder:text-muted-foreground bg-transparent outline-none" />
              </div>
              <div className="flex items-center gap-2 px-3 border-t md:border-t-0 md:border-l border-border">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <select value={county} onChange={e => setCounty(e.target.value)}
                  className="w-full py-3 text-sm bg-transparent outline-none text-foreground">
                  <option value="">All counties</option>
                  {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button onClick={runSearch} className="btn-press px-6 py-3 rounded-md bg-[#166534] hover:bg-[#14532d] text-white font-semibold text-sm flex items-center justify-center gap-2">
                <Search className="h-4 w-4" /> Search {JOBS.length}+ jobs
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-white/60">
              <span>Trending: <button onClick={() => { setQ("software"); nav("/jobs?q=software"); }} className="underline underline-offset-2">Software</button></span>
              <span><button onClick={() => { setCounty("Nairobi"); nav("/jobs?county=Nairobi"); }} className="underline underline-offset-2">Nairobi</button></span>
              <span><button onClick={() => { setQ("nurse"); nav("/jobs?q=nurse"); }} className="underline underline-offset-2">Nursing</button></span>
              <span><button onClick={() => { setCounty("Mombasa"); nav("/jobs?county=Mombasa"); }} className="underline underline-offset-2">Mombasa</button></span>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="relative rounded-lg overflow-hidden border border-white/15 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-300">
              <img src={HERO_OFFICE_IMG} alt="Kenyan professionals in a modern office" className="w-full h-96 object-cover" />
              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur text-foreground rounded-md px-4 py-3 shadow-lg">
                <p className="text-xs text-muted-foreground">New this week</p>
                <p className="font-semibold text-sm">127 verified roles posted</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <section className="border-b border-border bg-white">
        <div className="container py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Briefcase, v: `${JOBS.length}+`, l: "Active verified vacancies" },
            { icon: Building2, v: `${COMPANIES.filter(c => c.verified).length}+`, l: "KYC-verified employers" },
            { icon: Users, v: "47/47", l: "Counties covered" },
            { icon: TrendingUp, v: "92%+", l: "M-Pesa payment success" },
          ].map(({ icon: Icon, v, l }) => (
            <div key={l} className="flex items-center gap-3">
              <span className="h-10 w-10 rounded-md bg-[#e0f2e9] text-[#166534] flex items-center justify-center"><Icon className="h-5 w-5" /></span>
              <div>
                <p className="font-mono-num font-bold text-xl">{v}</p>
                <p className="text-xs text-muted-foreground">{l}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured jobs ── */}
      <section className="container py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <Badge variant="featured">Featured</Badge>
            <h2 className="font-heading text-3xl font-bold mt-2">Featured vacancies</h2>
          </div>
          <Link href="/jobs?featured=true" className="text-sm font-semibold text-[#166534] flex items-center gap-1 hover:gap-2 transition-all">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {featured.map(job => {
            const c = COMPANIES.find(x => x.id === job.companyId)!;
            const showMatch = role === "candidate" && (profile.skills.length > 0 || profile.title || profile.experience.length > 0);
            const match = showMatch ? jobFitScore(profile, { title: job.title, company: c.name, description: job.description, requirements: job.requirements, benefits: job.benefits }) : undefined;
            return (
              <Link key={job.id} href={`/jobs/${job.slug}`}
                className="group bg-card rounded-lg border border-border p-5 hover:shadow-md hover:border-[#166534]/30 transition-all flex flex-col gap-3">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 h-12 w-12 rounded-lg flex items-center justify-center text-white font-heading font-bold text-lg" style={{ backgroundColor: c.logoColor }}>{c.name.charAt(0)}</div>
                  {match !== undefined && <div className="ml-auto"><MatchRing score={match} /></div>}
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-1 mb-1.5">
                      <Badge variant="featured">Featured</Badge>
                      {job.urgent && <Badge variant="urgent">Urgent</Badge>}
                    </div>
                    <h3 className="font-heading font-bold group-hover:text-[#166534] transition-colors">{job.title}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5"><Building2 className="h-3.5 w-3.5" />{c.name}{c.verified && <CheckCircle2 className="h-3.5 w-3.5 text-[#166534]" />}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.county}</span>
                  <span>{job.jobType} · {job.experience}</span>
                  <span>{daysAgo(job.posted)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-3 mt-auto">
                  {job.salaryPublic ? <KESAmount value={job.minSalary} className="text-sm" /> : <span className="text-xs text-muted-foreground">Salary disclosed on application</span>}
                  <span className="text-xs font-semibold text-[#166534] flex items-center gap-1 group-hover:gap-2 transition-all">Apply now <ArrowRight className="h-3.5 w-3.5" /></span>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="mt-4">
          <h3 className="font-heading font-bold text-lg mb-3">Urgent hiring</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {urgent.map(job => {
              const c = COMPANIES.find(x => x.id === job.companyId)!;
              return (
                <Link key={job.id} href={`/jobs/${job.slug}`}
                  className="group flex items-center gap-4 bg-card rounded-lg border border-border p-4 hover:shadow-md transition-all">
                  <div className="shrink-0 h-10 w-10 rounded-md flex items-center justify-center text-white font-heading font-bold" style={{ backgroundColor: c.logoColor }}>{c.name.charAt(0)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-1 mb-1"><Badge variant="urgent">Urgent</Badge></div>
                    <h3 className="font-semibold text-sm truncate group-hover:text-[#166534]">{job.title}</h3>
                    <p className="text-xs text-muted-foreground">{c.name} · {job.county} · {daysAgo(job.posted)}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-[#166534] shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="bg-secondary/60">
        <div className="container py-14">
          <h2 className="font-heading text-3xl font-bold mb-8">Explore by industry</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {INDUSTRIES.slice(0, 8).map(cat => {
              const count = JOBS.filter(j => j.category === cat).length;
              return (
                <Link key={cat} href={`/jobs?category=${encodeURIComponent(cat)}`}
                  className="bg-card rounded-lg border border-border p-5 hover:border-[#166534] hover:shadow-md transition-all group">
                  <div className="h-10 w-10 rounded-md bg-[#e0f2e9] text-[#166534] flex items-center justify-center mb-3 group-hover:bg-[#166534] group-hover:text-white transition-colors">
                    <Zap className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-sm leading-snug">{cat}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{count} open role{count === 1 ? "" : "s"}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Verified employers ── */}
      <section className="container py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <Badge variant="verified"><ShieldCheck className="h-3 w-3" /> KYC verified</Badge>
            <h2 className="font-heading text-3xl font-bold mt-2">Employers hiring right now</h2>
          </div>
          <Link href="/companies" className="text-sm font-semibold text-[#166534] flex items-center gap-1 hover:gap-2 transition-all">
            All companies <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {topCompanies.map(c => (
            <Link key={c.id} href={`/companies/${c.slug}`}
              className="bg-card rounded-lg border border-border p-5 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-11 w-11 rounded-md flex items-center justify-center text-white font-heading font-bold" style={{ backgroundColor: c.logoColor }}>{c.name.charAt(0)}</div>
                <div>
                  <h3 className="font-semibold text-sm leading-tight">{c.name}</h3>
                  <p className="text-xs text-muted-foreground">{c.industry}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1"><MapPin className="h-3 w-3" />{c.town}, {c.county} · est. {c.founded}</p>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs font-semibold text-[#166534]">{c.openJobs} open roles</span>
                <span className="flex items-center gap-1 text-[#ca8a04]"><CheckCircle2 className="h-3.5 w-3.5" /><span className="text-xs font-semibold text-[#ca8a04]">Verified</span></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Split CTA ── */}
      <section className="container py-14">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative rounded-lg overflow-hidden min-h-72 flex items-end">
            <img src={HERO_IMG} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20" />
            <div className="relative p-7 text-white">
              <h3 className="font-heading text-2xl font-bold">Looking for work?</h3>
              <p className="text-sm text-white/75 mt-1 mb-4 max-w-sm">Build your ATS-ready profile once, apply everywhere in one click, and track every application.</p>
              <div className="flex flex-wrap gap-2">
                <Link href="/auth?mode=register" className="btn-press px-5 py-2.5 rounded-md bg-white text-[#062a17] font-semibold text-sm">Create free profile</Link>
                <Link href="/candidate/resume-builder" className="btn-press px-5 py-2.5 rounded-md bg-white/15 backdrop-blur text-white font-semibold text-sm flex items-center gap-1.5"><FileDown className="h-4 w-4" /> Download ATS CV</Link>
              </div>
            </div>
          </div>
          <div className="relative rounded-lg overflow-hidden min-h-72 flex items-end">
            <img src={HERO_OFFICE_IMG} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#062a17]/90 to-[#062a17]/30" />
            <div className="relative p-7 text-white">
              <h3 className="font-heading text-2xl font-bold">Hiring in Kenya?</h3>
              <p className="text-sm text-white/75 mt-1 mb-4 max-w-sm">Verified applicants, Kanban ATS, and pay per post from KES 4,999 — no subscriptions required.</p>
              <div className="flex flex-wrap gap-2">
                <Link href="/employers" className="btn-press px-5 py-2.5 rounded-md bg-[#166534] hover:bg-[#14532d] text-white font-semibold text-sm">See pricing</Link>
                <Link href="/employer/post-job" className="btn-press px-5 py-2.5 rounded-md bg-white/15 backdrop-blur text-white font-semibold text-sm flex items-center gap-1.5"><Sparkles className="h-4 w-4" /> Post a job</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Career hub teaser ── */}
      <section className="container pb-14">
        <div className="bg-[#062a17] rounded-lg p-8 md:p-12 grid md:grid-cols-[1fr_auto] gap-8 items-center text-white">
          <div>
            <Badge variant="remote">Free courses</Badge>
            <h2 className="font-heading text-3xl font-bold mt-3">Sharpen your edge with the Career Hub</h2>
            <p className="text-white/70 mt-2 max-w-lg text-sm">CV writing, interview prep, Excel, Python and more — free courses built for the Kenyan job market.</p>
          </div>
          <Link href="/courses" className="btn-press self-start md:self-auto px-6 py-3 rounded-md bg-white text-[#062a17] font-semibold text-sm">
            Browse courses <ArrowRight className="inline h-4 w-4 ml-1" />
          </Link>
        </div>
      </section>
    </>
  );
}
