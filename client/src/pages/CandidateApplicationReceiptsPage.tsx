/* TalentKenya Application Receipts — formal submission receipts for candidates.
   Each receipt shows submission reference, timestamps, and a full status-change
   history timeline. TalentKenya brand: green #166534 accents, DM Serif Display headings. */
import { useMemo } from "react";
import { Link } from "wouter";
import { Clock, CheckCircle2, Building2, FileText, ArrowRight, ShieldCheck } from "lucide-react";
import { COMPANIES, JOBS, STAGE_LABELS, type Application } from "@/lib/data";
import { usePlatform } from "@/lib/platform";
import { PortalHeader } from "@/components/Layout";
import { Badge, statusColor } from "@/components/primitives";

const CHANGER_LABEL: Record<string, string> = {
  candidate: "Submitted by you",
  employer: "Updated by employer",
  system: "System (offer accepted)",
};

function receiptRef(a: Application) {
  return `TK-${a.appliedAt.replaceAll("-", "")}-${a.id.slice(-5).toUpperCase()}`;
}

function daysBetween(d1: string, d2: string) {
  return Math.round((new Date(d2).getTime() - new Date(d1).getTime()) / 86400000);
}

export default function CandidateApplicationReceiptsPage() {
  const { applications } = usePlatform();
  const apps = useMemo(
    () => [...applications].sort((a, b) => a.appliedAt.localeCompare(b.appliedAt)),
    [applications],
  );

  const totalProcessed = apps.filter(a => a.status === "hired" || a.status === "rejected" || a.status === "offered").length;
  const avgResponseDays = useMemo(() => {
    const withHistory = apps.filter(a => (a.statusHistory?.length ?? 0) > 1);
    if (withHistory.length === 0) return null;
    const days = withHistory.map(a => daysBetween(a.appliedAt, a.statusHistory![1].changedAt));
    return Math.round(days.reduce((a, b) => a + b, 0) / days.length);
  }, [apps]);

  return (
    <>
      <PortalHeader role="candidate" title="Application receipts" subtitle="Formal confirmation of every submission you've sent" />

      {/* Summary band */}
      <div className="container grid grid-cols-2 md:grid-cols-4 gap-3 pb-6">
        {[
          { label: "Receipts issued", value: apps.length, icon: FileText },
          { label: "Reached decision", value: totalProcessed, icon: CheckCircle2 },
          { label: "Avg. first response", value: avgResponseDays !== null ? `${avgResponseDays}d` : "—", icon: Clock },
          { label: "Still open", value: apps.filter(a => !["hired", "rejected"].includes(a.status)).length, icon: ArrowRight },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-lg border border-border p-4">
            <s.icon className="h-4 w-4 text-[#166534] mb-2" />
            <p className="font-mono-num text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {apps.length === 0 ? (
        <div className="container bg-card rounded-lg border border-border p-12 text-center">
          <p className="text-muted-foreground text-sm">No receipts yet — applications you submit appear here with a unique reference.</p>
          <Link href="/jobs" className="text-[#166534] font-semibold text-sm underline underline-offset-2 mt-2 inline-block">Browse open roles</Link>
        </div>
      ) : (
        <div className="container grid gap-4 lg:grid-cols-2 pb-10">
          {apps.map(a => {
            const job = JOBS.find(j => j.id === a.jobId);
            const company = job ? COMPANIES.find(c => c.id === job.companyId)?.name ?? "Company" : "—";
            const history = a.statusHistory && a.statusHistory.length > 0
              ? a.statusHistory
              : [{ status: a.status, changedAt: a.appliedAt, changedBy: "candidate" } as NonNullable<Application["statusHistory"]>[number]];
            return (
              <div key={a.id} className="bg-card rounded-lg border border-border overflow-hidden">
                {/* Receipt header */}
                <div className="bg-[#e9f2ee] border-b border-border px-5 py-3 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#166534]" />
                    <span className="font-mono-num text-xs font-semibold text-[#166534]">SUBMISSION RECEIPT {receiptRef(a)}</span>
                  </div>
                  <Badge variant={a.status === "rejected" ? "red" : a.status === "hired" ? "green" : a.status === "interview" ? "default" : "outline"} className={statusColor(a.status) + " capitalize"}>
                    {STAGE_LABELS[a.status]}
                  </Badge>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-heading font-bold truncate">{job?.title ?? "Unlisted role"}</h3>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-x-3 gap-y-0.5 flex-wrap">
                        <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{company}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Submitted {a.appliedAt}</span>
                      </p>
                    </div>
                  </div>

                  {/* Status history timeline */}
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mt-4 mb-2">Status history</p>
                  <div className="relative pl-5">
                    <div className="absolute left-[5px] top-1 bottom-1 w-px bg-border" />
                    <ul className="space-y-3">
                      {history.map((h, i) => (
                        <li key={i} className="relative">
                          <span className={`absolute -left-5 top-1 h-2.5 w-2.5 rounded-full border-2 border-background ${i === history.length - 1 ? "bg-[#166534]" : "bg-border"}`} />
                          <p className="text-sm font-semibold">{STAGE_LABELS[h.status]} <span className="text-xs font-normal text-muted-foreground">· {h.changedAt}</span></p>
                          <p className="text-xs text-muted-foreground">{CHANGER_LABEL[h.changedBy]}</p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border text-[11px] text-muted-foreground flex items-center justify-between gap-2 flex-wrap">
                    <span>This receipt confirms your submission is recorded. Keep the reference number for any enquiries.</span>
                    <Link href={`/jobs/${job?.slug ?? ""}`} className="text-[#166534] font-semibold hover:underline">View role →</Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
