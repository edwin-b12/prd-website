/* TalentKenya Jobs — advanced search & filter engine per PRD §US-2.1:
   keyword, 47 counties, experience, job type, industry, salary min/max,
   disclosed-salary toggle, remote/hybrid. Mobile filter drawer. */
import { useMemo, useState, useEffect } from "react";
import { useLocation, useSearchParams } from "wouter";
import { SlidersHorizontal, X, MapPin, TrendingUp, BookmarkPlus, CheckCircle2, Bell } from "lucide-react";
import { toast } from "sonner";
import { JOBS, COUNTIES, EXPERIENCE_LEVELS, JOB_TYPES, INDUSTRIES, KES, COMPANIES } from "@/lib/data";
import { KESAmount } from "@/components/primitives";
import JobCard from "@/components/JobCard";
import { usePlatform } from "@/lib/platform";
import { jobFitScore, matchBreakdown } from "@/lib/aiEngine";
import { PublicLayout } from "@/components/Layout";

export default function JobsPage() {
  const { role, profile, saveSearch, runSavedSearch, addNotification, savedSearches } = usePlatform();
  const [params, setParams] = useSearchParams();
  const [, nav] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileFilters, setMobileFilters] = useState<Record<string, string>>({});
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [savedConfirm, setSavedConfirm] = useState<{ matches: number } | null>(null);

  const fromUrl = (k: string) => params.get(k) ?? "";
  const [q, setQ] = useState(fromUrl("q"));
  const [county, setCounty] = useState(fromUrl("county"));
  const [experience, setExperience] = useState(fromUrl("experience"));
  const [jobType, setJobType] = useState(fromUrl("jobType"));
  const [workMode, setWorkMode] = useState(fromUrl("workMode"));
  const [category, setCategory] = useState(fromUrl("category"));
  const [salaryMin, setSalaryMin] = useState(fromUrl("salaryMin"));
  const [salaryMax, setSalaryMax] = useState(fromUrl("salaryMax"));
  const [salaryPublic, setSalaryPublic] = useState(params.get("salaryPublic") === "true");
  const [featured, setFeatured] = useState(params.get("featured") === "true");
  const [sort, setSort] = useState<"recent" | "salary" | "relevance">(fromUrl("sort") as "recent" || "recent");

  // Sync state with URL changes (nav from home hero)
  useEffect(() => {
    setQ(fromUrl("q")); setCounty(fromUrl("county")); setExperience(fromUrl("experience"));
    setJobType(fromUrl("jobType")); setWorkMode(fromUrl("workMode")); setCategory(fromUrl("category"));
    setSalaryMin(fromUrl("salaryMin")); setSalaryMax(fromUrl("salaryMax"));
    setSalaryPublic(params.get("salaryPublic") === "true"); setFeatured(params.get("featured") === "true");
    setSort((fromUrl("sort") as never) || "recent");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.toString()]);

  const applyFilters = () => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (county) p.set("county", county);
    if (experience) p.set("experience", experience);
    if (jobType) p.set("jobType", jobType);
    if (workMode) p.set("workMode", workMode);
    if (category) p.set("category", category);
    if (salaryMin) p.set("salaryMin", salaryMin);
    if (salaryMax) p.set("salaryMax", salaryMax);
    if (salaryPublic) p.set("salaryPublic", "true");
    if (featured) p.set("featured", "true");
    if (sort !== "recent") p.set("sort", sort);
    nav(`/jobs${p.toString() ? `?${p.toString()}` : ""}`);
    setDrawerOpen(false);
  };

  const resetFilters = () => {
    setQ(""); setCounty(""); setExperience(""); setJobType(""); setWorkMode(""); setCategory("");
    setSalaryMin(""); setSalaryMax(""); setSalaryPublic(false); setFeatured(false); setSort("recent");
    nav("/jobs");
  };

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    let list = JOBS.filter(job => {
      if (ql) {
        const hay = `${job.title} ${job.category} ${job.description} ${job.county}`.toLowerCase();
        if (!ql.split(/\s+/).every(t => hay.includes(t))) return false;
      }
      if (county && job.county !== county) return false;
      if (experience && job.experience !== experience) return false;
      if (jobType && job.jobType !== jobType) return false;
      if (workMode && job.workMode !== workMode) return false;
      if (category && job.category !== category) return false;
      if (salaryPublic && !job.salaryPublic) return false;
      if (featured && !job.featured) return false;
      if (salaryMin && job.maxSalary && job.maxSalary < Number(salaryMin)) return false;
      if (salaryMax && job.minSalary && job.minSalary > Number(salaryMax)) return false;
      return true;
    });
    if (sort === "salary") list = [...list].sort((a, b) => (b.maxSalary ?? 0) - (a.maxSalary ?? 0));
    else if (sort === "relevance") list = [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    else list = [...list].sort((a, b) => new Date(b.posted).getTime() - new Date(a.posted).getTime());
    return list;
  }, [q, county, experience, jobType, workMode, category, salaryMin, salaryMax, salaryPublic, featured, sort]);

  const showMatch = role === "candidate" && (profile.skills.length > 0 || profile.title || profile.experience.length > 0);

  const scored = useMemo(() => {
    if (!showMatch) return filtered.map(job => ({ job, match: undefined as number | undefined, matched: undefined as string[] | undefined, missing: undefined as string[] | undefined }));
    const withScores = filtered.map(job => {
      const company = COMPANIES.find(c => c.id === job.companyId);
      const match = jobFitScore(profile, {
        title: job.title,
        company: company?.name ?? "",
        description: job.description,
        requirements: job.requirements,
        benefits: job.benefits,
      });
      const bd = matchBreakdown(profile, {
        title: job.title,
        company: company?.name ?? "",
        description: job.description,
        requirements: job.requirements,
        benefits: job.benefits,
      });
      return { job, match, matched: bd.matched, missing: bd.missing };
    });
    if (sort === "relevance") withScores.sort((a, b) => (b.match ?? 0) - (a.match ?? 0));
    return withScores;
  }, [filtered, showMatch, profile, sort]);

  const filterCount = [q, county, experience, jobType, workMode, category, salaryMin, salaryMax].filter(Boolean).length + (salaryPublic ? 1 : 0) + (featured ? 1 : 0);

  const currentFilters = useMemo(() => ({
    q, county, experience, jobType, workMode, category, salaryMin, salaryMax, salaryPublic, featured,
  }), [q, county, experience, jobType, workMode, category, salaryMin, salaryMax, salaryPublic, featured]);

  const saveCurrentSearch = () => {
    if (!saveName.trim() && !filterCount) return toast.error("Name your search or set at least one filter");
    saveSearch(saveName.trim(), currentFilters);
    const { count } = runSavedSearch({ id: "", name: saveName.trim(), filters: currentFilters, active: true, createdAt: "" });
    addNotification({ kind: "alert_digest", title: `Saved search: ${saveName.trim() || "My search"}`, description: `${count} current vacancy${count === 1 ? "" : "ies"} match your filters${count > 0 ? " — results shown on this page" : ""}.`, link: "/jobs", });
    setSavedConfirm({ matches: count });
    setSaveDialogOpen(false);
    setSaveName("");
  };

  const filterUI = (
    <div className="flex flex-col gap-5">
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Keyword</label>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="e.g. software, nurse, driver"
          className="mt-1.5 w-full input-std" onKeyDown={e => e.key === "Enter" && applyFilters()} />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">County / location</label>
        <select value={county} onChange={e => setCounty(e.target.value)} className="mt-1.5 w-full select-std">
          <option value="">All locations</option>
          {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Industry</label>
        <select value={category} onChange={e => setCategory(e.target.value)} className="mt-1.5 w-full select-std">
          <option value="">All industries</option>
          {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Experience</label>
        <select value={experience} onChange={e => setExperience(e.target.value)} className="mt-1.5 w-full select-std">
          <option value="">Any level</option>
          {EXPERIENCE_LEVELS.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Job type</label>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {JOB_TYPES.map(t => (
            <button key={t} onClick={() => setJobType(jobType === t ? "" : t)}
              className={`px-2.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${jobType === t ? "bg-[#166534] text-white border-[#166534]" : "border-border text-muted-foreground hover:border-[#166534] hover:text-[#166534]"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Work mode</label>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {["On-site", "Remote", "Hybrid"].map(t => (
            <button key={t} onClick={() => setWorkMode(workMode === t ? "" : t)}
              className={`px-2.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${workMode === t ? "bg-[#166534] text-white border-[#166534]" : "border-border text-muted-foreground hover:border-[#166534] hover:text-[#166534]"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Salary range (KES / month)</label>
        <div className="mt-2">
          <div className="flex gap-2">
            <input type="range" min={0} max={500000} step={5000} value={salaryMin || 0} onChange={e => setSalaryMin(e.target.value)} className="w-full accent-[#166534]" />
          </div>
          <div className="flex gap-2">
            <input type="range" min={0} max={500000} step={5000} value={salaryMax || 500000} onChange={e => setSalaryMax(e.target.value)} className="w-full accent-[#166534]" />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
            <span>{KES(Number(salaryMin) || 0)}</span>
            <span>{KES(Number(salaryMax) || 500000)}</span>
          </div>
        </div>
        <label className="flex items-center gap-2 mt-3 text-sm cursor-pointer">
          <input type="checkbox" checked={salaryPublic} onChange={e => setSalaryPublic(e.target.checked)} className="accent-[#166534]" />
          Only show jobs with disclosed salary
        </label>
        <label className="flex items-center gap-2 mt-2 text-sm cursor-pointer">
          <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} className="accent-[#166534]" />
          Featured listings only
        </label>
      </div>
      <div className="flex gap-2">
        <button onClick={applyFilters} className="btn-press flex-1 py-2.5 rounded-md bg-[#166534] text-white text-sm font-semibold hover:bg-[#14532d]">
          Apply filters
        </button>
        <button onClick={resetFilters} className="btn-press px-4 py-2.5 rounded-md border border-border text-sm font-semibold hover:bg-muted">
          Reset
        </button>
      </div>
    </div>
  );

  return (
    <PublicLayout>
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold">Find your next role</h1>
        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-[#166534]" /> {filtered.length} of {JOBS.length} vacancies match your filters
        </p>
      </div>

      <div className="grid lg:grid-cols-[270px_1fr] gap-6 items-start">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block bg-card rounded-lg border border-border p-5 sticky top-24">
          {filterUI}
        </aside>

        {/* Mobile filter drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-[70] lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[88vw] bg-white p-5 overflow-y-auto fade-up">
              <div className="flex items-center justify-between mb-4">
                <span className="font-heading font-bold">Filters{filterCount > 0 ? ` (${filterCount})` : ""}</span>
                <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-md hover:bg-muted"><X className="h-4 w-4" /></button>
              </div>
              {filterUI}
            </div>
          </div>
        )}

        {/* Results */}
        <div>
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => setDrawerOpen(true)}
                className="lg:hidden btn-press inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-border text-sm font-semibold">
                <SlidersHorizontal className="h-4 w-4" /> Filters{filterCount > 0 ? ` (${filterCount})` : ""}
              </button>
              {role === "candidate" && (
                <button onClick={() => { setSaveDialogOpen(true); setSavedConfirm(null); }}
                  className="btn-press inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-[#166534] text-[#166534] text-sm font-semibold hover:bg-[#f0fdf4]">
                  <BookmarkPlus className="h-4 w-4" /> Save this search{savedSearches.length > 0 ? ` (${savedSearches.length})` : ""}
                </button>
              )}
              {savedConfirm && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#166534] bg-[#e0f2e9] rounded-full px-2.5 py-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Saved — {savedConfirm.matches} matches now, alerts when new ones arrive
                </span>
              )}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden sm:block text-xs text-muted-foreground">Sort:</span>
              <select value={sort} onChange={e => setSort(e.target.value as never)} className="select-std !py-2 text-sm">
                <option value="recent">Most recent</option>
                <option value="salary">Highest salary</option>
                <option value="relevance">Best match for you</option>
              </select>
              {showMatch && <span className="hidden md:inline text-[11px] font-semibold text-[#166534] bg-[#e0f2e9] rounded-full px-2.5 py-1">Match scores live — your fit %</span>}
            </div>
          </div>

          {scored.length === 0 ? (
            <>
            <div className="bg-card rounded-lg border border-dashed border-border p-12 text-center">
              <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="font-heading font-bold">No vacancies found</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Try broadening your search — e.g. clear the keyword or pick a larger county.</p>
              {role === "candidate" ? (
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <button onClick={resetFilters} className="btn-press px-4 py-2 rounded-md bg-[#166534] text-white text-sm font-semibold">Clear all filters</button>
                  <button onClick={() => { setSaveDialogOpen(true); setSavedConfirm(null); }} className="btn-press px-4 py-2 rounded-md border border-[#166534] text-[#166534] text-sm font-semibold flex items-center justify-center gap-1.5">
                    <Bell className="h-4 w-4" /> Save this search anyway
                  </button>
                </div>
              ) : (
                <button onClick={resetFilters} className="btn-press px-4 py-2 rounded-md bg-[#166534] text-white text-sm font-semibold">Clear all filters</button>
              )}
            </div>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              {scored.map(({ job, match, matched, missing }) => <JobCard key={job.id} job={job} match={match} matched={matched} missing={missing} showMatch={match !== undefined} />)}
            </div>
          )}
        </div>
      </div>
    </div>

      {saveDialogOpen && role === "candidate" && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4" onClick={() => setSaveDialogOpen(false)}>
          <div className="bg-card rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-1">
              <BookmarkPlus className="h-5 w-5 text-[#166534]" />
              <p className="font-heading font-bold">Save this search</p>
            </div>
            <p className="text-sm text-muted-foreground mb-4">We'll watch for new vacancies matching your current filters and notify you instantly.</p>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Give it a name</label>
            <input value={saveName} onChange={e => setSaveName(e.target.value)} autoFocus
              placeholder={summaryLabel(currentFilters)}
              className="mt-1.5 mb-3 w-full input-std" onKeyDown={e => e.key === "Enter" && saveCurrentSearch()} />
            <div className="rounded-md bg-secondary/60 border border-border p-3 text-xs text-muted-foreground mb-4 space-y-0.5">
              {Object.entries(filterSummary(currentFilters)).map(([k, v]) => (
                <p key={k}><span className="font-semibold text-foreground">{k}:</span> {v}</p>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={saveCurrentSearch} className="btn-press flex-1 py-2.5 rounded-md bg-[#166534] text-white text-sm font-semibold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Save & get alerts
              </button>
              <button onClick={() => setSaveDialogOpen(false)} className="btn-press flex-1 py-2.5 rounded-md border border-border text-sm font-semibold">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </PublicLayout>
  );
}

function summaryLabel(f: { q: string; county: string; jobType: string; workMode: string; category: string }): string {
  const parts = [f.q, f.county, f.jobType, f.workMode, f.category].filter(Boolean);
  return parts.length ? parts.join(" · ") : "All jobs";
}

function filterSummary(f: {
  q: string; county: string; experience: string; jobType: string; workMode: string;
  category: string; salaryMin: string; salaryMax: string; salaryPublic: boolean; featured: boolean;
}): Record<string, string> {
  const out: Record<string, string> = {};
  if (f.q) out.Keyword = f.q;
  if (f.county) out.County = f.county;
  if (f.experience) out.Experience = f.experience;
  if (f.jobType) out["Job type"] = f.jobType;
  if (f.workMode) out["Work mode"] = f.workMode;
  if (f.category) out.Industry = f.category;
  if (f.salaryMin || f.salaryMax) out.Salary = `KES ${Number(f.salaryMin) || 0} – ${f.salaryMax ? `KES ${f.salaryMax}` : "500,000+"}`;
  if (f.salaryPublic) out.Salary = (out.Salary ? `${out.Salary} · ` : "") + "Disclosed salary only";
  if (f.featured) out.Listing = "Featured only";
  if (!Object.keys(out).length) out.All = "All jobs, no filters";
  return out;
}
