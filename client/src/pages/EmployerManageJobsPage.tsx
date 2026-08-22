/* TalentKenya Manage Jobs — employer's posted listings with status controls. */
import { useMemo } from "react";
import { Link } from "wouter";
import { Eye, Users, ArrowRight, Clock3, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { JOBS } from "@/lib/data";
import { usePlatform } from "@/lib/platform";
import { PortalHeader, StatCard } from "@/components/Layout";

function daysBetween(d1: string, d2: string) {
  return Math.round((new Date(d2).getTime() - new Date(d1).getTime()) / 86400000);
}

export default function EmployerManageJobsPage() {
  const { postedJobs, applications } = usePlatform();
  const totalApps = useMemo(() => postedJobs.reduce((n, p) => n + applications.filter(a => a.jobId === p.id).length, 0) + JOBS.length, [postedJobs, applications]);

  return (
    <>
      <PortalHeader role="employer" title="Manage listings" subtitle={`${postedJobs.length} posted job${postedJobs.length === 1 ? "" : "s"}`}
        action={<Link href="/employer/post-job" className="btn-press px-4 py-2 rounded-md bg-[#166534] text-white text-sm font-semibold">Post a job</Link>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Live" value={String(postedJobs.filter(p => p.status === "active").length)} />
        <StatCard label="Under review" value={String(postedJobs.filter(p => p.status === "pending_approval").length)} />
        <StatCard label="Featured" value={String(postedJobs.filter(p => p.tier === "featured").length)} />
        <StatCard label="Total applicants" value={String(totalApps)} />
      </div>

      <div className="space-y-3">
        {postedJobs.length === 0 ? (
          <div className="bg-card rounded-lg border border-border p-12 text-center text-muted-foreground text-sm">
            No listings yet. <Link href="/employer/post-job" className="text-[#166534] font-semibold underline underline-offset-2">Post your first job</Link>.
          </div>
        ) : postedJobs.map(p => (
          <div key={p.id} className="bg-card rounded-lg border border-border p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-heading font-bold">{p.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{p.category} · {p.county} · {p.jobType} · posted {p.postedAt} · deadline {p.deadline}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`text-[11px] font-semibold uppercase px-2.5 py-1 rounded-full ${p.status === "active" ? "bg-[#e0f2e9] text-[#14532d]" : p.status === "pending_approval" ? "bg-[#fef3c7] text-[#8a6d00]" : "bg-muted text-muted-foreground"}`}>
                  {p.status === "active" ? "Live" : p.status === "pending_approval" ? "Under review" : p.status}
                </span>
                {p.tier === "featured" && <span className="text-[11px] font-semibold uppercase px-2.5 py-1 rounded-full bg-[#fef3c7] text-[#8a6d00]">Featured</span>}
                <span className={`text-[11px] font-semibold uppercase px-2.5 py-1 rounded-full ${p.paymentStatus === "paid" ? "bg-[#e0f2e9] text-[#14532d]" : "bg-[#fde8e7] text-[#b91c1c]"}`}>
                  {p.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                </span>
              </div>
            </div>
            {/* Engagement stats */}
            {(() => {
              const apps = applications.filter(a => a.jobId === p.id);
              const seedJob = JOBS.find(j => j.id === p.id);
              const views = (seedJob?.views ?? 0) + apps.length * 8;
              const responded = apps.filter(a => ["shortlisted", "interview", "offered", "hired"].includes(a.status));
              const responseRate = apps.length ? Math.round((responded.length / apps.length) * 100) : null;
              const shortlistDays = apps
                .filter(a => (a.statusHistory?.length ?? 0) > 1 && ["shortlisted", "interview", "offered", "hired"].includes(a.status))
                .map(a => daysBetween(a.appliedAt, a.statusHistory![1].changedAt));
              const avgToShortlist = shortlistDays.length
                ? Math.round(shortlistDays.reduce((a, b) => a + b, 0) / shortlistDays.length)
                : null;
              return (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="rounded-md bg-secondary/60 border border-border p-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold flex items-center gap-1"><Eye className="h-3 w-3" />Views</p>
                    <p className="font-mono-num text-lg font-bold">{views.toLocaleString()}</p>
                  </div>
                  <div className="rounded-md bg-secondary/60 border border-border p-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold flex items-center gap-1"><Users className="h-3 w-3" />Applicants</p>
                    <p className="font-mono-num text-lg font-bold">{apps.length}</p>
                  </div>
                  <div className="rounded-md bg-secondary/60 border border-border p-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold flex items-center gap-1"><TrendingUp className="h-3 w-3" />Response rate</p>
                    <p className="font-mono-num text-lg font-bold">{responseRate !== null ? `${responseRate}%` : "—"}</p>
                    {responseRate !== null && (
                      <div className="mt-1 h-1 rounded-full bg-border overflow-hidden">
                        <div className="h-full bg-[#166534]" style={{ width: `${responseRate}%` }} />
                      </div>
                    )}
                  </div>
                  <div className="rounded-md bg-secondary/60 border border-border p-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold flex items-center gap-1"><Clock3 className="h-3 w-3" />Avg. to shortlist</p>
                    <p className="font-mono-num text-lg font-bold">{avgToShortlist !== null ? `${avgToShortlist}d` : "—"}</p>
                  </div>
                </div>
              );
            })()}
            <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-border">
              <Link href={`/employer/ats/${p.id}`} className="btn-press px-4 py-2 rounded-md border border-border text-xs font-semibold flex items-center gap-1.5 hover:bg-muted">
                <Users className="h-3.5 w-3.5" /> View applicants <ArrowRight className="h-3 w-3" />
              </Link>
              <button onClick={() => toast.info("Boost feature included in Featured tier", { description: "Standard listings appear in search results for the full 30 days." })}
                className="btn-press px-4 py-2 rounded-md border border-border text-xs font-semibold flex items-center gap-1.5 hover:bg-muted">
                <Eye className="h-3.5 w-3.5" /> Boost to Featured
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
