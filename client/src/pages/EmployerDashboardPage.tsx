/* TalentKenya Employer Dashboard — posting stats, pending items, quick actions. */
import { Link } from "wouter";
import { useMemo } from "react";
import { Plus, Users, BriefcaseBusiness, FileDown, Wallet, Gauge } from "lucide-react";
import { usePlatform } from "@/lib/platform";
import { PortalHeader, StatCard } from "@/components/Layout";

/* Response-rate benchmark helpers. "Responded" = any candidate moved past the
   inbox (shortlisted, interviewed, offered, or hired). Employer rate = share of
   their applicants responded to; platform rate = the same share across every
   application in the platform, used as the benchmark to compare against. */
const RESPONDED: string[] = ["shortlisted", "interview", "offered", "hired"];
function rateOf(apps: { status: string }[]) {
  if (apps.length === 0) return null;
  return apps.filter(a => RESPONDED.includes(a.status)).length / apps.length;
}

export default function EmployerDashboardPage() {
  const { postedJobs, profile, verifications, moderationQueue, applications } = usePlatform();
  const active = postedJobs.filter(p => p.status === "active").length;
  const pending = postedJobs.filter(p => p.status === "pending_approval").length;

  const benchmark = useMemo(() => {
    const perJob = postedJobs
      .map(p => rateOf(applications.filter(a => a.jobId === p.id)))
      .filter((r): r is number => r !== null);
    const employerRate = perJob.length === 0 ? null : perJob.reduce((a, b) => a + b, 0) / perJob.length;
    const platformRate = rateOf(applications);
    return { employerRate, platformRate };
  }, [postedJobs, applications]);

  const totalEmployerApps = postedJobs.reduce((n, p) => n + applications.filter(a => a.jobId === p.id).length, 0);
  const compared = benchmark.employerRate !== null && benchmark.platformRate !== null;

  return (
    <>
      <PortalHeader role="employer" title={`Employer dashboard${profile.firstName ? ` — ${profile.firstName}` : ""}`} subtitle="Your hiring pipeline at a glance."
        action={<Link href="/employer/post-job" className="btn-press px-4 py-2 rounded-md bg-[#166534] text-white text-sm font-semibold flex items-center gap-1.5"><Plus className="h-4 w-4" /> Post a job</Link>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Live listings" value={String(active)} />
        <StatCard label="Pending approval" value={String(pending)} delta={pending > 0 ? "KYC admin review in progress" : "All listings approved"} />
        <StatCard label="Total applicants" value={String(Math.floor(postedJobs.length * 12))} tone="green" />
        <StatCard label="Spend this month" value={KES(postedJobs.filter(p => p.paymentStatus === "paid").reduce((a, p) => a + p.amount, 0))} />
      </div>

      {/* Engagement benchmark */}
      <div className="bg-card rounded-lg border border-border p-5 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <p className="font-heading font-bold flex items-center gap-2"><Gauge className="h-4 w-4 text-[#166534]" /> Candidate response benchmark</p>
          {compared && (
            <span className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full ${benchmark.employerRate! >= benchmark.platformRate! ? "bg-[#e0f2e9] text-[#14532d]" : "bg-[#fef3c7] text-[#8a6d00]"}`}>
              {benchmark.employerRate! >= benchmark.platformRate! ? "▲ Above platform average" : "▼ Below platform average"}
            </span>
          )}
        </div>
        {totalEmployerApps === 0 ? (
          <p className="text-sm text-muted-foreground">Once your listings receive applications, this card compares how quickly you respond to candidates against the platform average.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {(
              [
                { label: "Your response rate", value: benchmark.employerRate, subtitle: "Share of your applicants you've shortlisted, interviewed, offered, or hired" },
                { label: "Platform average", value: benchmark.platformRate, subtitle: "Response rate across all employers and listings on TalentKenya" },
              ] as const
            ).map(m => (
              <div key={m.label}>
                <div className="flex items-end justify-between mb-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{m.label}</p>
                  <p className="font-mono-num text-xl font-bold">{m.value !== null ? `${Math.round(m.value * 100)}%` : "—"}</p>
                </div>
                <div className="h-2 rounded-full bg-border overflow-hidden">
                  <div className="h-full bg-[#166534] transition-all" style={{ width: m.value !== null ? `${Math.round(m.value * 100)}%` : "0%" }} />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5">{m.subtitle}</p>
              </div>
            ))}
            {compared && (
              <p className="sm:col-span-2 text-xs text-muted-foreground bg-secondary rounded-md px-3.5 py-2.5">
                {Math.round((benchmark.employerRate! - benchmark.platformRate!) * 100) >= 0
                  ? `You respond to ${Math.round((benchmark.employerRate! - benchmark.platformRate!) * 100)} points more candidates than the average employer — consistency like this earns faster hires and better reviews.`
                  : `You're ${Math.round((benchmark.platformRate! - benchmark.employerRate!) * 100)} points behind the platform average. Reviewing ${totalEmployerApps - Math.round(benchmark.employerRate! * totalEmployerApps)} unreviewed applicant${totalEmployerApps - Math.round(benchmark.employerRate! * totalEmployerApps) === 1 ? "" : "s"} would lift you to the average.`}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        <div className="bg-card rounded-lg border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-heading font-bold flex items-center gap-2"><BriefcaseBusiness className="h-4 w-4 text-[#166534]" /> Your listings</p>
            <Link href="/employer/manage-jobs" className="text-xs font-semibold text-[#166534] hover:underline">Manage all</Link>
          </div>
          {postedJobs.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground text-sm">No listings yet. Post your first role to start receiving applications.</p>
              <Link href="/employer/post-job" className="btn-press mt-4 px-5 py-2.5 rounded-md bg-[#166534] text-white text-sm font-semibold inline-flex items-center gap-1.5"><Plus className="h-4 w-4" /> Post a job</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {postedJobs.slice(0, 4).map(p => (
                <div key={p.id} className="flex items-center justify-between gap-3 p-3 rounded-md border border-border">
                  <div>
                    <p className="text-sm font-semibold">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.county} · {p.jobType} · posted {p.postedAt}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-[11px] font-semibold uppercase px-2.5 py-1 rounded-full ${p.status === "active" ? "bg-[#e0f2e9] text-[#14532d]" : p.status === "pending_approval" ? "bg-[#fef3c7] text-[#8a6d00]" : "bg-muted text-muted-foreground"}`}>
                      {p.status === "active" ? "Live" : p.status === "pending_approval" ? "Under review" : p.status}
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-1">{p.paymentStatus === "paid" ? "Paid" : "Unpaid"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-card rounded-lg border border-border p-5">
            <p className="font-heading font-bold mb-3 flex items-center gap-2"><FileDown className="h-4 w-4 text-[#166534]" /> Company verification</p>
            {verifications.filter(v => v.status === "pending").length > 0 ? (
              <p className="text-sm text-muted-foreground">KYC documents under review. You can post jobs meanwhile — they go live after approval.</p>
            ) : (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">All company documents verified.</p>
            )}
          </div>
          <div className="bg-card rounded-lg border border-border p-5">
            <p className="font-heading font-bold mb-3 flex items-center gap-2"><Users className="h-4 w-4 text-[#166534]" /> Quick actions</p>
            <div className="space-y-2">
              <Link href="/employer/talent-search" className="block text-sm text-[#166534] font-semibold hover:underline">Search talent pool</Link>
              <Link href="/employer/ats" className="block text-sm text-[#166534] font-semibold hover:underline">Open ATS board</Link>
              <Link href="/employer/billing" className="block text-sm text-[#166534] font-semibold hover:underline flex items-center gap-1"><Wallet className="h-3.5 w-3.5" /> Billing & invoices</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function KES(n: number) {
  return n === 0 ? "KES 0" : `KES ${n.toLocaleString("en-KE")}`;
}
