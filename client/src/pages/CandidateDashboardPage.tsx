/* TalentKenya Candidate Dashboard — profile score, application pipeline summary,
   recommended jobs, recent activity. */
import { Link } from "wouter";
import { useMemo } from "react";
import { ArrowRight, FileDown, BriefcaseBusiness, TrendingUp, BellRing, Clock, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { JOBS, STAGE_LABELS, type AppStatus } from "@/lib/data";
import { usePlatform, profileCompletion, type SavedSearch } from "@/lib/platform";
import { PortalHeader, StatCard } from "@/components/Layout";
import { Badge } from "@/components/primitives";

export default function CandidateDashboardPage() {
  const { profile, applications, savedJobs, savedSearches, runSavedSearch } = usePlatform();

  // Recommended = jobs matching the candidate's active saved searches, newest first
  const { pct, sections } = profileCompletion(profile);

  const byStatus = (s: AppStatus) => applications.filter(a => a.status === s).length;

  // Interviews within the next 48 hours
  const upcoming = useMemo(() => {
    const now = Date.now();
    const horizon = now + 48 * 3600000;
    return [...applications]
      .filter(a => a.interview && a.status === "interview")
      .map(a => ({ ...a, ts: new Date(`${a.interview!.date}T${a.interview!.time}:00+03:00`).getTime() }))
      .filter(a => a.ts >= now - 3600000 && a.ts <= horizon)
      .sort((a, b) => a.ts - b.ts);
  }, [applications]);

  // Recommended = jobs matching the candidate's active saved searches, newest first
  const recommended = savedSearches
    .filter(s => s.active)
    .flatMap(s => runSavedSearch(s).matched)
    .filter(j => j.status !== "archived")
    .reduce<NonNullable<ReturnType<typeof runSavedSearch>["matched"]>>((acc, j) => (acc.some(x => x.id === j.id) ? acc : [...acc, j]), [])
    .slice(0, 5);

  return (
    <>
      <PortalHeader role="candidate" title={`Karibu, ${profile.firstName || "Candidate"}`} subtitle="Here's what's happening with your job search."
        action={<Link href="/candidate/resume-builder" className="btn-press px-4 py-2 rounded-md bg-[#166534] text-white text-sm font-semibold flex items-center gap-1.5"><FileDown className="h-4 w-4" /> Download ATS CV</Link>} />

      {/* Profile completion */}
      <div className="bg-card rounded-lg border border-border p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-heading font-bold">Profile completion</p>
            <p className="text-xs text-muted-foreground mt-0.5">Jobs with incomplete profiles are skipped by employer ATS filters.</p>
          </div>
          <span className="font-mono-num font-bold text-2xl text-[#166534]">{pct}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden mb-4">
          <div className="h-full bg-[#166534] rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {sections.map(s => (
            <Link key={s.section} href="/candidate/profile"
              className={`flex items-center justify-between rounded-md border px-3 py-2 text-xs ${s.done ? "border-[#166534]/40 bg-[#e0f2e9]/60" : "border-dashed border-border text-muted-foreground"}`}>
              <span>{s.section}</span>
              {s.done ? <Badge variant="green">Done</Badge> : <Badge variant="outline">Add</Badge>}
            </Link>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Applications sent" value={String(applications.length)} />
        <StatCard label="Shortlisted" value={String(byStatus("shortlisted"))} delta={`${byStatus("interview")} interviews scheduled`} />
        <StatCard label="Saved jobs" value={String(savedJobs.length)} />
        <StatCard label="Active alerts" value={String(usePlatform().alerts.filter(a => a.active).length)} delta="Email digest enabled" />
      </div>

      {/* 48-hour interview reminders with .ics download */}
      {upcoming.length > 0 && (
        <div className="bg-[#f0fdf4] border border-[#166534]/40 rounded-lg p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="font-heading font-bold flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#166534]" /> Upcoming interviews — next 48 hours
            </p>
            <span className="font-mono-num text-xs font-semibold text-[#14532d]">{upcoming.length}</span>
          </div>
          <div className="space-y-2">
            {upcoming.map(a => {
              const j = JOBS.find(x => x.id === a.jobId);
              return (
                <div key={a.id} className="bg-card rounded-md border border-[#166534]/30 p-3 flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{a.interview!.type} — {j?.title ?? "Role"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.interview!.date} · {a.interview!.time}{a.interview!.location ? ` · ${a.interview!.location}` : ""}</p>
                  </div>
                  <button onClick={() => downloadIcs(a)}
                    className="btn-press px-3 py-1.5 rounded-md bg-[#166534] text-white text-xs font-semibold flex items-center gap-1.5">
                    <CalendarClock className="h-3.5 w-3.5" /> Add to calendar (.ics)
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pipeline */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
        {(Object.keys(STAGE_LABELS) as AppStatus[]).map(s => (
          <div key={s} className="bg-card rounded-md border border-border p-3 text-center">
            <p className="font-mono-num font-bold text-lg">{byStatus(s)}</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{STAGE_LABELS[s]}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        <div className="bg-card rounded-lg border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-heading font-bold flex items-center gap-2"><TrendingUp className="h-4 w-4 text-[#166534]" /> Recommended for you</p>
            <Link href="/jobs" className="text-xs font-semibold text-[#166534] flex items-center gap-1">Browse all <ArrowRight className="h-3 w-3" /></Link>
          </div>
          {recommended.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <p className="flex items-center justify-center gap-1.5 mb-2"><BellRing className="h-4 w-4" /> Nothing yet</p>
              <p className="mb-4">Save a search on the Jobs board and new matches will surface here.</p>
              <Link href="/jobs" className="btn-press inline-block px-4 py-2 rounded-md bg-[#166534] text-white text-xs font-semibold">Browse jobs</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recommended.map(j => {
                const match = recommendedSearchesFor(j, savedSearches, runSavedSearch);
                return (
                  <Link key={j.id} href={`/jobs/${j.slug}`} className="flex items-center gap-3 p-3 rounded-md border border-border hover:border-[#166534]/40 hover:bg-secondary/50 transition-colors">
                    <BriefcaseBusiness className="h-4 w-4 text-[#166534] shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">{j.title}</p>
                      <p className="text-xs text-muted-foreground">{j.county} · {j.jobType}</p>
                      {match && <p className="text-[10px] text-[#14532d] font-semibold mt-0.5 truncate">Matches your saved search: {match}</p>}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-card rounded-lg border border-border p-5">
          <p className="font-heading font-bold mb-4">Recent activity</p>
          {applications.slice(0, 5).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <p>No applications yet.</p>
              <Link href="/jobs" className="text-[#166534] font-semibold underline underline-offset-2 mt-2 inline-block">Start applying</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.slice(0, 5).map(a => {
                const j = JOBS.find(x => x.id === a.jobId);
                return (
                  <div key={a.id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{j?.title ?? "Job removed"}</p>
                      <p className="text-xs text-muted-foreground">Applied {a.appliedAt}</p>
                    </div>
                    <span className={`text-[11px] font-semibold uppercase px-2.5 py-1 rounded-full whitespace-nowrap ${statusBadge(a.status)}`}>{STAGE_LABELS[a.status as AppStatus]}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function escIcs(s: string) { return s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n"); }

function downloadIcs(a: NonNullable<ReturnType<typeof usePlatform>["applications"]>[number] & { ts?: number }) {
  const iv = a.interview;
  if (!iv) return;
  const pad = (n: number) => String(n).padStart(2, "0");
  const [hh, mm] = iv.time.split(":").map(Number);
  const start = new Date(`${iv.date}T00:00:00+03:00`);
  start.setHours(hh, mm, 0);
  const end = new Date(start.getTime() + 30 * 60000);
  const dtstart = `${start.getUTCFullYear()}${pad(start.getUTCMonth() + 1)}${pad(start.getUTCDate())}T${pad(start.getUTCHours())}${pad(start.getUTCMinutes())}${pad(start.getUTCSeconds())}Z`;
  const dtend = `${end.getUTCFullYear()}${pad(end.getUTCMonth() + 1)}${pad(end.getUTCDate())}T${pad(end.getUTCHours())}${pad(end.getUTCMinutes())}${pad(end.getUTCSeconds())}Z`;
  const cal = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TalentKenya//Interviews//EN",
    "BEGIN:VEVENT",
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${escIcs(`${iv.type} — ${a.candidateName}`)}`,
    `DESCRIPTION:${escIcs(`Interview for your application at TalentKenya.${iv.location ? ` Location: ${iv.location}` : ""}${iv.notes ? ` Notes: ${iv.notes}` : ""}`)}`,
    iv.location?.startsWith("http") ? `URL:${escIcs(iv.location)}` : iv.location ? `LOCATION:${escIcs(iv.location)}` : null,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n") + "\r\n";
  const blob = new Blob([cal], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const el = document.createElement("a");
  el.href = url; el.download = `interview-${iv.date}-${iv.time.replace(":", "-")}.ics`; el.click();
  URL.revokeObjectURL(url);
  toast.success("Calendar file downloaded", { description: "Open the .ics file to add this interview to Google Calendar, Outlook, or Apple Calendar." });
}

function recommendedSearchesFor(j: { id: string }, savedSearches: SavedSearch[], runSavedSearch: (s: SavedSearch) => { matched: { id: string }[]; count: number }) {
  for (const s of savedSearches) {
    if (s.active && runSavedSearch(s).matched.some(x => x.id === j.id)) return s.name;
  }
  return null;
}

function statusBadge(s: string) {
  const map: Record<string, string> = {
    applied: "bg-[#dbeafe] text-[#1d4ed8]",
    shortlisted: "bg-[#fef3c7] text-[#8a6d00]",
    interview: "bg-[#e0e7ff] text-[#4338ca]",
    offered: "bg-[#f3e8ff] text-[#7e22ce]",
    hired: "bg-[#e0f2e9] text-[#14532d]",
    rejected: "bg-[#fde8e7] text-[#b91c1c]",
  };
  return map[s] ?? "bg-muted text-muted-foreground";
}
