/* TalentKenya Market Insights — county-level job demand & salary bands.
   Public page aggregated from the full job catalog (seed + employer postings).
   Brand: green #166534 accents, editorial serif headings, data-dense cards. */
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { MapPin, TrendingUp, Banknote, Briefcase, ArrowUpDown, BarChart3, FileSpreadsheet, FileDown, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import { JOBS, KES } from "@/lib/data";
import { usePlatform } from "@/lib/platform";
import { PublicLayout } from "@/components/Layout";

interface CountyStat {
  county: string; jobs: number; avgLow: number; avgHigh: number; topCategory: string; topCategoryCount: number;
}

export default function MarketInsightsPage() {
  const { postedJobs } = usePlatform();
  const [sortBy, setSortBy] = useState<"jobs" | "salary">("jobs");

  const all = useMemo(() => [...JOBS, ...postedJobs], [postedJobs]);

  const countyStats = useMemo(() => {
    const map = new Map<string, { jobs: number; lows: number[]; highs: number[]; cats: Record<string, number> }>();
    for (const job of all) {
      const c = map.get(job.county) ?? { jobs: 0, lows: [], highs: [], cats: {} };
      c.jobs += 1;
      const low = typeof job.minSalary === "string" ? Number(job.minSalary) || 0 : job.minSalary ?? 0;
      const high = typeof job.maxSalary === "string" ? Number(job.maxSalary) || 0 : job.maxSalary ?? 0;
      if (low) c.lows.push(low);
      if (high) c.highs.push(high);
      c.cats[job.category] = (c.cats[job.category] ?? 0) + 1;
      map.set(job.county, c);
    }
    const out: CountyStat[] = [];
    map.forEach((v, county) => {
      const topCat = Object.entries(v.cats).sort((a, b) => b[1] - a[1])[0];
      out.push({
        county,
        jobs: v.jobs,
        avgLow: v.lows.length ? Math.round(v.lows.reduce((a, b) => a + b, 0) / v.lows.length) : 0,
        avgHigh: v.highs.length ? Math.round(v.highs.reduce((a, b) => a + b, 0) / v.highs.length) : 0,
        topCategory: topCat?.[0] ?? "—",
        topCategoryCount: topCat?.[1] ?? 0,
      });
    });
    return out.sort((a, b) => sortBy === "jobs" ? b.jobs - a.jobs : b.avgHigh - a.avgHigh);
  }, [all, sortBy]);

  const sorted = countyStats;
  const totalJobs = all.length;
  const medianSalary = useMemo(() => {
    const lows = all.filter(j => j.minSalary).map(j => j.minSalary as number).sort((a, b) => a - b);
    if (!lows.length) return 0;
    return lows[Math.floor(lows.length / 2)];
  }, [all]);
  const hotCounty = sorted[0];
  const avgSalary = useMemo(() => {
    const lows = all.filter(j => j.minSalary).map(j => j.minSalary as number);
    return lows.length ? Math.round(lows.reduce((a, b) => a + b, 0) / lows.length) : 0;
  }, [all]);
  const maxAvg = Math.max(...sorted.map(c => c.jobs), 1);
  const maxHigh = Math.max(...sorted.map(c => c.avgHigh), 1);

  const csvData = useMemo(
    () => sorted.map((c, i) => ({
      rank: i + 1,
      county: c.county,
      openRoles: c.jobs,
      avgMinSalary: c.avgLow,
      avgMaxSalary: c.avgHigh,
      demandSharePct: Math.round((c.jobs / totalJobs) * 100),
      topCategory: c.topCategory,
      topCategoryRoles: c.topCategoryCount,
    })),
    [sorted, totalJobs],
  );

  const downloadCSV = () => {
    const header = "Rank,County,Open roles,Avg min salary (KES),Avg max salary (KES),Demand share %,Top category,Top category roles";
    const rows = csvData.map(r => [r.rank, `"${r.county}"`, r.openRoles, r.avgMinSalary, r.avgMaxSalary, r.demandSharePct, `"${r.topCategory}"`, r.topCategoryRoles].join(","));
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `talentkenya-county-insights-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV download started", { description: "County market data saved to your downloads." });
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(11, 42, 26);
    doc.rect(0, 0, 210, 32, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("TalentKenya County Market Insights", 14, 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Generated ${new Date().toISOString().slice(0, 10)} · ${totalJobs} live postings across ${sorted.length} counties`, 14, 24);
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    const headY = 42;
    const rowH = 9;
    const headers = ["#", "County", "Roles", "Avg min (KES)", "Avg max (KES)", "% demand", "Top category"];
    const xs = [12, 22, 58, 74, 100, 126, 146, 158];
    doc.setFillColor(233, 242, 238);
    doc.rect(12, headY - 5, 186, 7, "F");
    headers.forEach((h, i) => doc.text(h, xs[i] + 2, headY));
    doc.setFont("helvetica", "normal");
    csvData.slice(0, 40).forEach((r, i) => {
      const y = headY + 6 + i * rowH;
      if (y > 275) return;
      doc.text(String(r.rank), xs[0] + 2, y);
      doc.text(r.county.slice(0, 26), xs[1] + 2, y);
      doc.text(String(r.openRoles), xs[2] + 2, y);
      doc.text(r.avgMinSalary.toLocaleString(), xs[3] + 2, y);
      doc.text(r.avgMaxSalary.toLocaleString(), xs[4] + 2, y);
      doc.text(`${r.demandSharePct}%`, xs[5] + 2, y);
      doc.text(r.topCategory.slice(0, 30), xs[6] + 2, y);
      if (i % 2 === 1) { doc.setFillColor(248, 250, 249); doc.rect(12, y - 3.4, 186, 7, "F"); }
    });
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text("TalentKenya · talentkenya.manus.space — data reflects currently live postings", 14, 285);
    doc.save(`talentkenya-county-insights-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success("PDF download started", { description: "County market report saved to your downloads." });
  };

  return (
    <PublicLayout>
      <main>
        {/* Hero */}
        <section className="bg-[#0b2a1a] text-white">
          <div className="container py-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#86efac] mb-3">Market intelligence</p>
            <h1 className="font-heading text-4xl md:text-5xl font-bold max-w-3xl">County-level labour market insights.</h1>
            <p className="text-white/70 mt-4 max-w-2xl text-sm md:text-base">
              Aggregated across {totalJobs} live postings on TalentKenya — see where demand is hottest, what employers pay, and which skills lead each county.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
              {[
                { label: "Live postings", value: String(totalJobs), icon: Briefcase },
                { label: "Counties hiring", value: String(sorted.length), icon: MapPin },
                { label: "Median entry salary", value: KES(medianSalary), icon: Banknote },
                { label: "Average minimum", value: KES(avgSalary), icon: TrendingUp },
              ].map(s => (
                <div key={s.label} className="rounded-lg bg-white/5 border border-white/10 p-4">
                  <s.icon className="h-4 w-4 text-[#86efac] mb-2" />
                  <p className="font-mono-num text-xl font-bold">{s.value}</p>
                  <p className="text-[11px] text-white/60 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Controls */}
        <div className="container py-6 flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-heading text-2xl font-bold flex items-center gap-2"><BarChart3 className="h-5 w-5 text-[#166534]" />Job demand & salary bands by county</h2>
          <div className="flex gap-2 flex-wrap">
            {(["jobs", "salary"] as const).map(b => (
              <button key={b} onClick={() => setSortBy(b)}
                className={`btn-press px-3.5 py-1.5 rounded-md text-sm font-semibold flex items-center gap-1.5 ${sortBy === b ? "bg-[#166534] text-white" : "border border-border text-foreground/70"}`}>
                <ArrowUpDown className="h-3.5 w-3.5" />{b === "jobs" ? "Sort by demand" : "Sort by salary"}
              </button>
            ))}
            <button onClick={downloadCSV} className="btn-press px-3.5 py-1.5 rounded-md text-sm font-semibold flex items-center gap-1.5 border border-border text-foreground/70">
              <FileSpreadsheet className="h-3.5 w-3.5 text-[#166534]" />Export CSV
            </button>
            <button onClick={downloadPDF} className="btn-press px-3.5 py-1.5 rounded-md text-sm font-semibold flex items-center gap-1.5 border border-border text-foreground/70">
              <FileDown className="h-3.5 w-3.5 text-[#166534]" />Export PDF
            </button>
          </div>
        </div>

        {/* County table */}
        <div className="container pb-12">
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="hidden md:grid grid-cols-[2fr_1.2fr_1.5fr_1.5fr_1.8fr] gap-4 px-5 py-3 bg-secondary text-[11px] font-bold uppercase tracking-wide text-muted-foreground border-b border-border">
              <span>County</span><span className="text-right">Open roles</span><span>Salary band (KES/month)</span><span>Demand</span><span>Top category</span>
            </div>
            <ul>
              {sorted.map((c, i) => (
                <li key={c.county} className="grid grid-cols-2 md:grid-cols-[2fr_1.2fr_1.5fr_1.5fr_1.8fr] gap-3 md:gap-4 px-5 py-4 border-b border-border last:border-b-0 items-center hover:bg-secondary/40 transition-colors">
                  <Link href={`/jobs?county=${encodeURIComponent(c.county)}`} className="group flex items-center gap-2 min-w-0">
                    <span className={`font-mono-num text-xs font-bold ${i < 3 ? "text-[#166534]" : "text-muted-foreground"}`}>{String(i + 1).padStart(2, "0")}</span>
                    <span className="flex items-center gap-1.5 font-semibold truncate text-foreground group-hover:text-[#166534] group-hover:underline decoration-dotted underline-offset-4 transition-colors"><MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />{c.county}</span>
                    {i === 0 && <span className="text-[9px] font-bold uppercase bg-[#fef3c7] text-[#8a6d00] px-1.5 py-0.5 rounded-full shrink-0">Hottest</span>}
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 text-[#166534] transition-opacity shrink-0" />
                  </Link>
                  <p className="font-mono-num font-bold text-right md:text-left">{c.jobs}</p>
                  <div className="col-span-1">
                    {c.avgLow > 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold whitespace-nowrap">{KES(c.avgLow)} — {KES(c.avgHigh)}</span>
                        <div className="h-1.5 rounded-full bg-border flex-1 overflow-hidden hidden lg:block">
                          <div className="h-full bg-[#166534]/70" style={{ width: `${(c.avgHigh / maxHigh) * 100}%` }} />
                        </div>
                      </div>
                    ) : <span className="text-xs text-muted-foreground">Salary undisclosed</span>}
                  </div>
                  <div className="hidden md:block">
                    <div className="h-2 rounded-full bg-border overflow-hidden">
                      <div className="h-full bg-[#166534]" style={{ width: `${(c.jobs / maxAvg) * 100}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{Math.round((c.jobs / totalJobs) * 100)}% of demand</p>
                  </div>
                  <p className="text-xs text-muted-foreground truncate flex items-center gap-1" title={`${c.topCategory} · ${c.topCategoryCount} roles`}>
                    <span className="font-semibold text-foreground">{c.topCategory}</span> · {c.topCategoryCount} role{c.topCategoryCount === 1 ? "" : "s"}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Category demand */}
          <div className="mt-8">
            <h3 className="font-heading text-xl font-bold mb-4">Demand by category (all counties)</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {Object.entries(
                all.reduce<Record<string, number>>((acc, j) => { acc[j.category] = (acc[j.category] ?? 0) + 1; return acc; }, {})
              ).sort((a, b) => b[1] - a[1]).map(([cat, n]) => (
                <div key={cat} className="bg-card rounded-lg border border-border p-4 flex items-center gap-4">
                  <p className="text-sm font-semibold flex-1 min-w-0 truncate">{cat}</p>
                  <div className="h-2 rounded-full bg-border w-32 overflow-hidden">
                    <div className="h-full bg-[#166534]" style={{ width: `${(n / totalJobs) * 100}%` }} />
                  </div>
                  <p className="font-mono-num font-bold text-sm">{n}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">Explore the listings behind these numbers.</p>
            <Link href="/jobs" className="btn-press inline-flex items-center gap-2 mt-3 px-5 py-2.5 rounded-md bg-[#166534] text-white text-sm font-semibold hover:bg-[#14532d]">
              Browse jobs <TrendingUp className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    </PublicLayout>
  );
}
