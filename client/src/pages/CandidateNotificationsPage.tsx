/* TalentKenya Notifications — inbox for saved-search matches, interview bookings,
   alert digests and application updates, with accept/reschedule actions. */
import { useState } from "react";
import { Link } from "wouter";
import { Bell, CalendarDays, Mail, Search, FileText, CheckCheck, CalendarCheck, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
const TIME_SLOTS = ["08:00", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];
import { usePlatform } from "@/lib/platform";
import { PortalHeader } from "@/components/Layout";

const ICONS: Record<string, typeof Bell> = { new_match: Search, interview: CalendarDays, alert_digest: Mail, application: FileText };

function next14Days(): string[] {
  const out: string[] = [];
  for (let i = 1; i <= 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export default function CandidateNotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead, acceptInterview, requestInterviewReschedule, applications } = usePlatform();
  const unread = notifications.filter(n => !n.read).length;
  const [reschedTarget, setReschedTarget] = useState<string | null>(null);
  const [resched, setResched] = useState({ date: "", time: "", reason: "" });

  return (
    <>
      <PortalHeader role="candidate" title="Notifications" subtitle={`${unread} unread · every saved-search match and interview update lands here`}
        action={unread > 0 ? (
          <button onClick={markAllNotificationsRead} className="btn-press px-4 py-2 rounded-md bg-[#166534] text-white text-sm font-semibold flex items-center gap-1.5 hover:bg-[#14532d]">
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        ) : undefined} />

      {notifications.length === 0 ? (
        <div className="container py-16 text-center">
          <Bell className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />
          <p className="font-heading font-bold text-lg">You're all caught up</p>
          <p className="text-sm text-muted-foreground mt-1 mb-5">Save a search on the Jobs board and interviews will appear here.</p>
          <Link href="/jobs" className="btn-press inline-block px-5 py-2.5 rounded-md bg-[#166534] text-white text-sm font-semibold">Browse jobs</Link>
        </div>
      ) : (
        <div className="container py-4 space-y-2">
          {notifications.map(n => {
            const Icon = ICONS[n.kind] ?? Bell;
            // Find the candidate's own application matching this interview notification
            const myApp = n.kind === "interview" ? applications.find(a => a.candidateId === "me" && a.interview && a.status === "interview") : undefined;
            return (
              <Link key={n.id} href={n.link}
                onClick={() => markNotificationRead(n.id)}
                className={`block bg-card rounded-lg border p-4 transition-colors hover:border-[#166534] ${n.read ? "border-border opacity-75" : "border-[#166534]/40 bg-[#fafffd]"}`}>
                <div className="flex items-start gap-3">
                  <div className={`rounded-full p-2 mt-0.5 ${n.read ? "bg-muted" : "bg-[#e0f2e9]"}`}>
                    <Icon className={`h-4 w-4 ${n.read ? "text-muted-foreground" : "text-[#166534]"}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.description}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{n.createdAt}</p>
                  </div>
                  {!n.read && <span className="ml-auto h-2 w-2 rounded-full bg-[#166534] shrink-0 mt-2" />}
                </div>
                {/* Interview response actions — appear for interview notifications with a proposed slot */}
                {n.kind === "interview" && myApp?.interview && (
                  <div className="mt-3 pt-3 border-t border-border">
                    {myApp.interview.response?.status === "accepted" && (
                      <p className="text-xs font-semibold text-[#14532d] flex items-center gap-1"><CalendarCheck className="h-3.5 w-3.5" /> You accepted this interview</p>
                    )}
                    {myApp.interview.response?.status === "reschedule_requested" && (
                      <div className="text-xs text-muted-foreground">
                        <p className="flex items-center gap-1"><RefreshCw className="h-3.5 w-3.5" /> Reschedule requested: {myApp.interview.response.proposedAlternative?.date} at {myApp.interview.response.proposedAlternative?.time}</p>
                        {myApp.interview.response.proposedAlternative?.reason && <p className="mt-1 italic">“{myApp.interview.response.proposedAlternative.reason}”</p>}
                        {myApp.interview.response.employerResponse === "approved" && <p className="mt-1 font-semibold text-[#14532d]">Employer approved the new time.</p>}
                        {myApp.interview.response.employerResponse === "declined" && <p className="mt-1 font-semibold text-[#b91c1c]">Employer declined — original slot stands.</p>}
                      </div>
                    )}
                    {myApp.interview.response?.status === "reschedule_requested" && myApp.interview.response.employerResponse !== "declined" && (
                      <button onClick={() => { requestInterviewReschedule(myApp.id, { date: "", time: "", reason: "" }); toast.info("Withdrawn"); }}
                        className="mt-2 px-3 py-1.5 rounded-md text-xs font-semibold text-muted-foreground border border-border hover:border-[#b91c1c] hover:text-[#b91c1c] flex items-center gap-1">
                        <X className="h-3.5 w-3.5" /> Withdraw reschedule request
                      </button>
                    )}
                    {myApp.interview.response?.status === "proposed" && !myApp.interview.response.proposedAlternative && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        <button onClick={() => { acceptInterview(myApp.id); toast.success("Interview accepted", { description: "The employer has been notified — see your Applications tab." }); }}
                          className="btn-press px-4 py-2 rounded-md bg-[#166534] text-white text-xs font-semibold flex items-center gap-1.5">
                          <CalendarCheck className="h-3.5 w-3.5" /> Accept interview
                        </button>
                        <button onClick={() => { setReschedTarget(myApp.id); setResched({ date: "", time: "", reason: "" }); }}
                          className="btn-press px-4 py-2 rounded-md border border-[#166534] text-[#166534] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#f0fdf4]">
                          <RefreshCw className="h-3.5 w-3.5" /> Request reschedule
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* Reschedule request dialog */}
      {reschedTarget && myAppFor(reschedTarget, applications) && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4" onClick={() => setReschedTarget(null)}>
          <div className="bg-card rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-1">
              <RefreshCw className="h-5 w-5 text-[#166534]" />
              <p className="font-heading font-bold">Request a new time</p>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Propose an alternative slot — the employer can approve or decline it.</p>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Proposed date (next 14 days)</label>
            <select value={resched.date} onChange={e => setResched({ ...resched, date: e.target.value })} className="select-std mt-1.5 mb-3 w-full">
              <option value="">Select a date…</option>
              {next14Days().map(d => <option key={d} value={d}>{new Date(d + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</option>)}
            </select>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Proposed time</label>
            <select value={resched.time} onChange={e => setResched({ ...resched, time: e.target.value })} className="select-std mt-1.5 mb-3 w-full">
              <option value="">Select a time…</option>
              {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reason</label>
            <input value={resched.reason} onChange={e => setResched({ ...resched, reason: e.target.value })} placeholder="e.g. prior commitment, network issues…"
              className="input-std mt-1.5 mb-4 w-full" />
            <div className="flex gap-2">
              <button onClick={() => {
                if (!resched.date || !resched.time || !resched.reason.trim()) return toast.error("Complete all three fields");
                requestInterviewReschedule(reschedTarget, { date: resched.date, time: resched.time, reason: resched.reason.trim() });
                setReschedTarget(null);
                toast.success("Reschedule requested", { description: "The employer will review your proposed time." });
              }} className="btn-press flex-1 py-2.5 rounded-md bg-[#166534] text-white text-sm font-semibold">Send request</button>
              <button onClick={() => setReschedTarget(null)} className="btn-press flex-1 py-2.5 rounded-md border border-border text-sm font-semibold">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function myAppFor(appId: string, applications: ReturnType<typeof usePlatform>["applications"]) {
  const app = applications.find(a => a.id === appId && a.candidateId === "me");
  return app ?? null;
}
