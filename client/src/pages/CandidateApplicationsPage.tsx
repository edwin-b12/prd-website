/* TalentKenya Candidate Applications — tabbed pipeline with withdraw support. */
import { useState } from "react";
import { Link } from "wouter";
import { ExternalLink, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { JOBS, STAGE_LABELS, type AppStatus } from "@/lib/data";
import { usePlatform } from "@/lib/platform";
import { PortalHeader } from "@/components/Layout";
import { Badge, statusColor } from "@/components/primitives";

export default function CandidateApplicationsPage() {
  const { applications, withdrawApplication } = usePlatform();
  const [tab, setTab] = useState<AppStatus | "all">("all");

  const tabs: (AppStatus | "all")[] = ["all", "applied", "shortlisted", "interview", "offered", "hired", "rejected"];
  const list = applications.filter(a => tab === "all" || a.status === tab);

  return (
    <>
      <PortalHeader role="candidate" title="My applications" subtitle={`${applications.length} application${applications.length === 1 ? "" : "s"} sent`} />

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${tab === t ? "bg-[#166534] text-white" : "bg-card border border-border text-foreground/70"}`}>
            {t === "all" ? "All" : STAGE_LABELS[t]} <span className="font-mono-num">{t === "all" ? applications.length : applications.filter(a => a.status === t).length}</span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <p className="text-muted-foreground text-sm">No applications here yet.</p>
          <Link href="/jobs" className="text-[#166534] font-semibold text-sm underline underline-offset-2 mt-2 inline-block">Browse open roles</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map(a => {
            const job = JOBS.find(j => j.id === a.jobId);
            return (
              <div key={a.id} className="bg-card rounded-lg border border-border p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-heading font-bold">{job?.title ?? "Job no longer listed"}</h3>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-x-3 gap-y-0.5 flex-wrap">
                      <span>Ref: {a.id.toUpperCase()}</span>
                      <span className="flex items-center gap-1"><CalendarClock className="h-3 w-3" />Applied {a.appliedAt}</span>
                      <span className="flex items-center gap-1"><ExternalLink className="h-3 w-3" />Ref. {Math.floor(Math.random() * 90000 + 10000)}</span>
                    </p>
                  </div>
                  <Badge variant={a.status === "rejected" ? "red" : a.status === "hired" ? "green" : a.status === "interview" ? "default" : "outline"} className={statusColor(a.status) + " capitalize"}>
                    {STAGE_LABELS[a.status as AppStatus]}
                  </Badge>
                </div>
                {a.screenerAnswers.length > 0 && (
                  <div className="mt-3 bg-secondary rounded-md p-3 text-xs text-muted-foreground">
                    Screener answers: {a.screenerAnswers.map((s, i) => (
                      <span key={i} className="inline-flex items-center gap-1 mr-3">Q{i + 1}: <b className="text-foreground">{s}</b></span>
                    ))}
                  </div>
                )}
                {a.status !== "hired" && (
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                    <button onClick={() => { withdrawApplication(a.id); toast.success("Application withdrawn"); }}
                      className="text-xs font-semibold text-[#b91c1c] hover:underline">Withdraw application</button>
                    <span className="text-[11px] text-muted-foreground ml-auto">Employer sees your application within 24h of posting</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
