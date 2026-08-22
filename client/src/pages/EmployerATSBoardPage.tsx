/* TalentKenya ATS Board — Kanban pipeline. Drag cards between the 6 stages or use
   the per-card dropdown. Ratings, hiring notes, job-scoped CSV export, and
   interview scheduling (book slots with shortlisted candidates) included. */
import { useMemo, useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { Star, MessageSquare, Download, Mail, Phone, CalendarDays, Clock, MapPin, Video, Trash2, CalendarRange, LayoutGrid, ChevronLeft, ChevronRight, RefreshCw, TrendingUp, Check } from "lucide-react";
import { toast } from "sonner";
import { APPLICATIONS as SEED_APPLICATIONS, COMPANIES, JOBS as SEED_JOBS, STAGE_LABELS, type AppStatus } from "@/lib/data";
import { usePlatform, type PlatformCtx } from "@/lib/platform";
import { PortalHeader } from "@/components/Layout";

const STAGES: AppStatus[] = ["applied", "shortlisted", "interview", "offered", "hired", "rejected"];

interface ScheduleDraft { date: string; time: string; type: string; location: string; notes: string; email: string; }

const INTERVIEW_TYPES = ["Phone screen", "Video call", "On-site panel", "Technical assessment", "Final round"];
const TIME_SLOTS = ["08:00", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];

function next14Days(): { value: string; label: string }[] {
  const out: { value: string; label: string }[] = [];
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  for (let i = 0; i < 14; i++) {
    const d = new Date(Date.now() + i * 86400000);
    out.push({ value: d.toISOString().slice(0, 10), label: `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}` });
  }
  return out;
}

const CAL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CAL_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const employerDecideRescheduleStub = ((appId: string, decision: "approved" | "declined") => {
  void appId; void decision;
}) as NonNullable<PlatformCtx>["employerDecideReschedule"];

function RescheduleDecisionsPanel({ jobs, list, employerDecideReschedule }: {
  jobs: typeof SEED_JOBS;
  list: ReturnType<typeof usePlatform>["applications"];
  employerDecideReschedule: PlatformCtx["employerDecideReschedule"];
}) {
  const pending = useMemo(
    () => list.filter(a => a.interview?.response?.status === "reschedule_requested" && a.interview.response.employerResponse === "pending"),
    [list],
  );
  if (pending.length === 0) return <div className="container pb-2" />;
  return (
    <div className="container pb-4">
      <div className="bg-[#fef9ec] border border-[#eab308] rounded-lg p-4">
        <p className="font-heading font-bold text-sm flex items-center gap-2 mb-1">
          <RefreshCw className="h-4 w-4 text-[#b45309]" /> Reschedule requests awaiting your decision
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          {pending.map(a => {
            const j = [...jobs].find(x => x.id === a.jobId);
            const alt = a.interview!.response!.proposedAlternative!;
            return (
              <div key={a.id} className="bg-card rounded-md border border-[#eab308]/50 p-3 text-xs flex-1 min-w-[260px]">
                <p className="font-semibold">{a.candidateName} — {j?.title ?? "Role"}</p>
                <p className="text-muted-foreground mt-0.5">Current: {a.interview!.date} · {a.interview!.time}</p>
                <p className="text-[#b45309] font-semibold mt-1">Proposed: {alt.date} · {alt.time} — “{alt.reason}”</p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => { employerDecideReschedule(a.id, "approved"); toast.success(`Reschedule approved — new slot ${alt.date} at ${alt.time}`); }}
                    className="btn-press px-3 py-1.5 rounded-md bg-[#166534] text-white font-semibold">Approve</button>
                  <button onClick={() => { employerDecideReschedule(a.id, "declined"); toast.info("Reschedule declined — original slot stands"); }}
                    className="btn-press px-3 py-1.5 rounded-md border border-border font-semibold">Decline</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function EmployerATSBoardPage() {
  const { jobId } = useParams<{ jobId?: string }>();
  const [, nav] = useLocation();
  const { applications, moveApplication, rateApplication, noteApplication, scheduleInterview, cancelInterview, employerDecideReschedule, createOffer, offers, postedJobs, hiredJobs, finalizeOffer } = usePlatform();

  const [dragId, setDragId] = useState<string | null>(null);
  const [noteTarget, setNoteTarget] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [schedTarget, setSchedTarget] = useState<string | null>(null);
  const [offerTarget, setOfferTarget] = useState<string | null>(null);
  const [offer, setOffer] = useState({ amount: "", start: "", probationMonths: "3", terms: "" });
  const [sched, setSched] = useState<ScheduleDraft>({ date: "", time: "", type: "Video call", location: "", notes: "", email: "" });
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);
  const [view, setView] = useState<"board" | "calendar">("board");
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const jobs = useMemo(() => [...SEED_JOBS], []);
  const list = applications.filter(a => !jobId || a.jobId === jobId);
  const job = jobId ? [...jobs].find(j => j.id === jobId) : null;

  // Candidate availability hints (from the candidate's profile preferences)
  const { profile } = usePlatform();
  const DAY_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const windowOf = (t: string) => {
    const h = Number(t.split(":")[0]);
    return h < 12 ? "Morning (8–12)" : h < 17 ? "Afternoon (12–5)" : "Evening (5–8)";
  };

  const csvFileName = job ? `talentkenya-${job.slug}-applicants.csv` : "talentkenya-all-applicants.csv";

  const appFor = (id: string) => list.find(a => a.id === id);

  const candidateAvail = schedTarget ? (appFor(schedTarget)?.candidateId === "me" ? profile.interviewAvailability : undefined) : undefined;
  const fitsAvailability = (date: string, t: string) => {
    if (!candidateAvail || (!candidateAvail.days.length && !candidateAvail.windows.length)) return null;
    const dayOk = !candidateAvail.days.length || candidateAvail.days.includes(DAY_OF_WEEK[new Date(`${date}T00:00:00+03:00`).getDay()]);
    const winOk = !candidateAvail.windows.length || candidateAvail.windows.includes(windowOf(t));
    return dayOk && winOk;
  };


  const escape = (s: string | number | null | undefined) => {
    if (s === null || s === undefined) return "";
    const str = String(s).replace(/"/g, '""');
    return `"${str}"`;
  };

  const exportCSV = () => {
    const rows = [
      escape(job ? `${job.title} — pipeline export` : "TalentKenya pipeline export"),
      "id,candidate,role,email,phone,status,stage,rating,hiring_notes,applied_at,interview_date,interview_time,interview_type,interview_location,interview_notes",
      ...list.map(a => {
        const iv = a.interview;
        return [
          a.id, a.candidateName, a.candidateTitle, a.email ?? "", a.phone ?? "",
          a.status, STAGE_LABELS[a.status], a.rating ?? "", a.notes ?? "", a.appliedAt,
          iv?.date ?? "", iv?.time ?? "", iv?.type ?? "", iv?.location ?? "", iv?.notes ?? "",
        ].map(escape).join(",");
      }),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const el = document.createElement("a");
    el.href = url; el.download = csvFileName; el.click();
    URL.revokeObjectURL(url);
    toast.success(`${list.length} applicant${list.length === 1 ? "" : "s"} exported${job ? ` for "${job.title}"` : ""}`, {
      description: `Saved as ${csvFileName}`,
    });
  };

  const saveNote = () => {
    if (!noteTarget) return;
    noteApplication(noteTarget, noteText);
    setNoteTarget(null); setNoteText("");
    toast.success("Note saved — visible to your hiring team");
  };

  const saveSchedule = () => {
    if (!schedTarget) return;
    if (!sched.date) return toast.error("Pick a date");
    if (!sched.time) return toast.error("Pick a time slot");
    scheduleInterview(schedTarget, { date: sched.date, time: sched.time, type: sched.type, location: sched.location, notes: sched.notes });
    setSchedTarget(null); setSched({ date: "", time: "", type: "Video call", location: "", notes: "", email: "" });
    toast.success("Interview scheduled", { description: "Candidate notified via email and their portal." });
  };

  const doCancel = (appId: string) => {
    cancelInterview(appId);
    setCancelConfirm(null);
    toast.success("Interview cancelled");
  };

  const days = next14Days();
  const bookedSlots = useMemo(() => {
    const map = new Map<string, string[]>();
    list.forEach(a => {
      if (a.interview) {
        const key = `${a.interview.date}|${a.interview.time}`;
        map.set(key, [...(map.get(key) ?? []), a.candidateName]);
      }
    });
    return map;
  }, [list]);

  return (
    <>
      <PortalHeader role="employer" title={job ? job.title : "Applicant Tracking System"}
        subtitle={job ? `${list.length} applicant${list.length === 1 ? "" : "s"} in this pipeline` : `${list.length} applicant${list.length === 1 ? "" : "s"} across all stages`}
        action={
          <div className="flex items-center gap-2">
            {!jobId && (
              <select onChange={e => e.target.value && nav(`/employer/ats/${e.target.value}`)}
                className="select-std text-sm max-w-[240px]" defaultValue="">
                <option value="">All pipelines…</option>
                {jobs.slice(0, 20).map(j => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
            )}
            <button onClick={exportCSV} className="btn-press px-4 py-2 rounded-md bg-[#166534] text-white text-sm font-semibold flex items-center gap-1.5 hover:bg-[#14532d]">
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>
        } />

      {/* View switcher */}
      <div className="container py-3 flex items-center gap-2">
        <button onClick={() => setView("board")}
          className={`btn-press px-3.5 py-1.5 rounded-md text-sm font-semibold flex items-center gap-1.5 ${view === "board" ? "bg-[#166534] text-white" : "border border-border text-foreground/75 hover:border-[#166534]"}`}>
          <LayoutGrid className="h-3.5 w-3.5" /> Pipeline board
        </button>
        <button onClick={() => setView("calendar")}
          className={`btn-press px-3.5 py-1.5 rounded-md text-sm font-semibold flex items-center gap-1.5 ${view === "calendar" ? "bg-[#166534] text-white" : "border border-border text-foreground/75 hover:border-[#166534]"}`}>
          <CalendarDays className="h-3.5 w-3.5" /> Interview calendar
        </button>
      </div>

      {job && (
        <div className="container py-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{job.category}</span>
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.county}</span>
          <span>{job.jobType} · {job.workMode}</span>
          <span>Six-stage pipeline</span>
          <Link href="/employer/manage-jobs" className="text-[#166534] font-semibold hover:underline ml-auto">← All my jobs</Link>
        </div>
      )}

      {view === "board" && (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 items-start">
        {STAGES.map(stage => {
          const apps = list.filter(a => a.status === stage);
          return (
            <div key={stage}
              onDragOver={e => e.preventDefault()}
              onDrop={() => { if (dragId) { moveApplication(dragId, stage); setDragId(null); } }}
              className="rounded-lg border border-border bg-secondary/40 p-2 min-h-[200px]">
              <div className="flex items-center justify-between px-2 mb-2">
                <p className="text-xs font-bold uppercase tracking-wide">{STAGE_LABELS[stage]}</p>
                <span className="font-mono-num text-xs font-semibold">{apps.length}</span>
              </div>
              <div className="space-y-2">
                {apps.map(a => (
                  <div key={a.id} draggable
                    onDragStart={() => setDragId(a.id)}
                    className="bg-card rounded-md border border-border p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-sm font-semibold leading-tight">{a.candidateName}</p>
                      <select value={a.status} onChange={e => moveApplication(a.id, e.target.value as AppStatus)}
                        className="text-[10px] rounded-full px-1.5 py-0.5 border border-border bg-white font-semibold uppercase">
                        {STAGES.map(s => <option key={s} value={s}>{STAGE_LABELS[s].slice(0, 8)}</option>)}
                      </select>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{a.candidateTitle}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(n => (
                          <button key={n} onClick={() => { rateApplication(a.id, n); toast.success(`Rated ${n}/5`); }}
                            className="p-0.5">
                            <Star className={`h-3.5 w-3.5 ${n <= (a.rating ?? 0) ? "fill-[#ca8a04] text-[#ca8a04]" : "text-border"}`} />
                          </button>
                        ))}
                      </div>
                      <button onClick={() => { setNoteTarget(a.id); setNoteText(a.notes); }} className="p-1 text-muted-foreground hover:text-[#166534]" title="Hiring note">
                        <MessageSquare className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex gap-2 mt-2 text-[11px] text-muted-foreground">
                      {a.email && <span className="flex items-center gap-0.5" title={a.email}><Mail className="h-3 w-3" /></span>}
                      {a.phone && <span className="flex items-center gap-0.5" title={a.phone}><Phone className="h-3 w-3" /></span>}
                    </div>
                    {a.interview && (
                      <div className="mt-2 rounded-md bg-[#e0f2e9] border border-[#bbf7d0] p-2 text-[11px]">
                        <div className="flex items-center gap-1 text-[#14532d] font-semibold">
                          <CalendarDays className="h-3 w-3" /> {a.interview.type}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5 text-[#166534]">
                          <Clock className="h-3 w-3" /> {a.interview.date} · {a.interview.time}
                        </div>
                        {a.interview.location && (
                          <div className="flex items-center gap-1 text-[#166534]">
                            <MapPin className="h-3 w-3" /> {a.interview.location}
                          </div>
                        )}
                        <button onClick={() => setCancelConfirm(a.id)} className="mt-1 flex items-center gap-1 text-[#b91c1c] hover:underline font-semibold">
                          <Trash2 className="h-3 w-3" /> Cancel
                        </button>
                      </div>
                    )}
                    {(stage === "interview" || stage === "offered") && (
                      <button onClick={() => { setOfferTarget(a.id); const oj = jobs.find(j => j.id === a.jobId);
                        setOffer({ amount: oj?.minSalary ? String(Math.round((oj.minSalary + (oj.maxSalary ?? oj.minSalary)) / 2)) : "", start: "", probationMonths: "3", terms: "Medical cover, device allowance, leave days." }); }}
                        className={`btn-press mt-2 w-full py-1.5 rounded-md border text-[11px] font-semibold flex items-center justify-center gap-1 hover:bg-[#f0fdf4] ${offers.some(o => o.jobId === a.jobId) ? "border-[#ca8a04] text-[#b45309]" : "border-dashed border-[#166534] text-[#166534]"}`}>
                        {offers.some(o => o.jobId === a.jobId) ? "Send / update offer" : "Send offer"}
                      </button>
                    )}
                    {stage === "offered" && offers.some(o => o.jobId === a.jobId) && !hiredJobs.includes(a.jobId) && (() => {
                      const o = offers.find(x => x.jobId === a.jobId);
                      if (!o) return null;
                      return o.status === "accepted" || o.counterResponse === "accepted"
                        ? <p key={`hire-${a.id}`} className="mt-2 text-[11px] font-semibold text-[#14532d] bg-[#f0fdf4] border border-[#86efac] rounded-md px-2 py-1.5 text-center flex items-center justify-center gap-1"><Check className="h-3 w-3" /> Offer accepted — finalize in the offer modal</p>
                        : o.status === "negotiating"
                        ? <p key={`nego-${a.id}`} className="mt-2 text-[11px] font-semibold text-[#b45309] bg-[#fef9ec] border border-[#fde68a] rounded-md px-2 py-1.5 text-center">Counter-offer pending your review</p>
                        : null;
                    })()}
                    {!a.interview && (stage === "shortlisted" || stage === "interview" || stage === "applied") && (
                      <button onClick={() => { setSchedTarget(a.id); setSched({ date: "", time: "", type: "Video call", location: "", notes: "", email: a.email ?? "" }); }}
                        className="btn-press mt-2 w-full py-1.5 rounded-md border border-dashed border-[#166534] text-[11px] font-semibold text-[#166534] flex items-center justify-center gap-1 hover:bg-[#f0fdf4]">
                        <CalendarRange className="h-3 w-3" /> Schedule interview
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      )}
      {view === "calendar" && (
        <InterviewCalendar jobs={jobs} list={list} cancelInterview={cancelInterview} />
      )}
      {view === "calendar" && (
        <RescheduleDecisionsPanel jobs={jobs} list={list} employerDecideReschedule={employerDecideReschedule} />
      )}

      {noteTarget && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50" onClick={() => setNoteTarget(null)}>
          <div className="bg-card rounded-lg p-6 w-full max-w-md m-4" onClick={e => e.stopPropagation()}>
            <p className="font-heading font-bold mb-3">Hiring note — {appFor(noteTarget)?.candidateName}</p>
            <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={4}
              placeholder="Interview impressions, salary expectations, red flags..." className="input-std" />
            <div className="flex gap-2 mt-4">
              <button onClick={saveNote} className="btn-press flex-1 py-2.5 rounded-md bg-[#166534] text-white text-sm font-semibold">Save note</button>
              <button onClick={() => setNoteTarget(null)} className="btn-press flex-1 py-2.5 rounded-md border border-border text-sm font-semibold">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {schedTarget && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4" onClick={() => setSchedTarget(null)}>
          <div className="bg-card rounded-lg p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays className="h-5 w-5 text-[#166534]" />
              <p className="font-heading font-bold">Schedule interview</p>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Book a slot with <span className="font-semibold text-foreground">{appFor(schedTarget)?.candidateName}</span> — they're notified instantly{appFor(schedTarget)?.email ? ` at ${appFor(schedTarget)?.email}` : ""}.</p>
            {candidateAvail && (candidateAvail.days.length > 0 || candidateAvail.windows.length > 0) && (
              <div className="bg-[#f0fdf4] border border-[#166534]/40 rounded-md p-3 mb-4 text-xs">
                <p className="font-semibold flex items-center gap-1.5 mb-1"><CalendarDays className="h-3.5 w-3.5 text-[#166534]" /> Their preferred availability</p>
                <p className="text-muted-foreground">Days: {candidateAvail.days.join(", ") || "any"} · Windows: {candidateAvail.windows.join(", ") || "any"}</p>
                {sched.date && sched.time && fitsAvailability(sched.date, sched.time) === false && (
                  <p className="text-[#b91c1c] font-semibold mt-1">This slot falls outside their stated preferences — consider proposing an alternative.</p>
                )}
                {sched.date && sched.time && fitsAvailability(sched.date, sched.time) === true && (
                  <p className="text-[#14532d] font-semibold mt-1">This slot fits their preferences ✓</p>
                )}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date (next 14 days)</label>
                <select value={sched.date} onChange={e => setSched({ ...sched, date: e.target.value })} className="mt-1.5 w-full select-std">
                  <option value="">Select date…</option>
                  {days.map(d => <option key={d.value} value={d.value} disabled={scheduledOnDisabled(d.value)}>{d.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Type</label>
                <select value={sched.type} onChange={e => setSched({ ...sched, type: e.target.value })} className="mt-1.5 w-full select-std">
                  {INTERVIEW_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Time slot</label>
            <div className="flex flex-wrap gap-1.5 mt-1.5 mb-3">
              {TIME_SLOTS.map(t => {
                const booked = bookedSlots.get(`${sched.date}|${t}`) ?? [];
                const taken = booked.length >= 2;
                return (
                  <button key={t} type="button" disabled={taken} onClick={() => setSched({ ...sched, time: t })}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-semibold border transition-colors ${sched.time === t ? "bg-[#166534] text-white border-[#166534]" : taken ? "border-border bg-muted text-muted-foreground line-through opacity-50 cursor-not-allowed" : "border-border hover:border-[#166534]"}`}>
                    {t}
                  </button>
                );
              })}
            </div>
            {sched.time && bookedSlots.get(`${sched.date}|${sched.time}`)?.length === 1 && (
              <p className="text-[11px] text-muted-foreground mb-2">One other interview already booked at this slot — double-booking available with confirmation.</p>
            )}

            <div className="grid sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Location / link</label>
                <input value={sched.location} onChange={e => setSched({ ...sched, location: e.target.value })}
                  placeholder="Google Meet link or office address" className="mt-1.5 w-full input-std" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Candidate email</label>
                <input value={sched.email} onChange={e => setSched({ ...sched, email: e.target.value })}
                  placeholder="candidate@email.com" className="mt-1.5 w-full input-std" />
              </div>
            </div>
            <div className="mb-3">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes to candidate</label>
              <textarea value={sched.notes} onChange={e => setSched({ ...sched, notes: e.target.value })} rows={2}
                placeholder="What to prepare, who will join the call…" className="mt-1.5 w-full input-std" />
            </div>

            <div className="flex gap-2">
              <button onClick={saveSchedule} className="btn-press flex-1 py-2.5 rounded-md bg-[#166534] text-white text-sm font-semibold flex items-center justify-center gap-1.5">
                <CalendarDays className="h-4 w-4" /> Confirm booking
              </button>
              <button onClick={() => setSchedTarget(null)} className="btn-press flex-1 py-2.5 rounded-md border border-border text-sm font-semibold">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {offerTarget && (
        <OfferModal jobs={jobs} app={appFor(offerTarget)} offer={offer} setOffer={setOffer} postedJobs={postedJobs} offers={offers}
          existingOffer={offers.find(o => o.jobId === appFor(offerTarget)?.jobId)} finalizeOffer={finalizeOffer}
          onSend={() => {
            const a = appFor(offerTarget);
            if (!a) return;
            if (!offer.amount || Number(offer.amount) <= 0) return toast.error("Enter a monthly salary");
            if (!offer.start) return toast.error("Pick a start date");
            const j = jobs.find(x => x.id === a.jobId);
            const comp = COMPANIES.find(c => c.id === j?.companyId);
            createOffer(a.jobId, { title: j?.title ?? a.candidateTitle, company: comp?.name ?? "TalentKenya Employer", amount: Number(offer.amount), currency: "KES", start: offer.start, probationMonths: offer.probationMonths, terms: offer.terms });
            moveApplication(a.id, "offered");
            toast.success("Offer sent", { description: "The candidate is notified in their portal and can accept or negotiate." });
            setOfferTarget(null);
          }}
          onClose={() => setOfferTarget(null)} />
      )}

      {cancelConfirm && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50" onClick={() => setCancelConfirm(null)}>
          <div className="bg-card rounded-lg p-6 w-full max-w-sm m-4" onClick={e => e.stopPropagation()}>
            <p className="font-heading font-bold mb-2">Cancel interview?</p>
            <p className="text-sm text-muted-foreground mb-4">The candidate will be notified that the scheduled slot has been cancelled.</p>
            <div className="flex gap-2">
              <button onClick={() => doCancel(cancelConfirm)} className="btn-press flex-1 py-2.5 rounded-md bg-[#b91c1c] text-white text-sm font-semibold">Cancel interview</button>
              <button onClick={() => setCancelConfirm(null)} className="btn-press flex-1 py-2.5 rounded-md border border-border text-sm font-semibold">Keep it</button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  function scheduledOnDisabled(_date: string) { return false; }
}

// Salary benchmarking: derive a market range for the role from similar listings on TalentKenya.
export function salaryBenchmark(j: { id?: string; title: string; category: string; county: string } | undefined, allJobs: { id?: string; title: string; category: string; county: string; minSalary: number | null; maxSalary: number | null; salaryPublic: boolean }[]) {
  if (!j) return null;
  const key = j.title.toLowerCase().split(/[\s/(),-]+/).filter(w => w.length > 2 && !["and","for","with","the","in","of","to","a"].includes(w));
  const similar = allJobs.filter(b => {
    if (!b.salaryPublic || b.minSalary == null || b.maxSalary == null) return false;
    const titleOk = key.some(w => b.title.toLowerCase().includes(w)) || b.category === j.category;
    if (!titleOk) return false;
    if (j.id && b.id) return b.id !== j.id;
    return true;
  });
  if (!similar.length) return null;
  const lows = similar.map(b => b.minSalary!);
  const highs = similar.map(b => b.maxSalary!);
  const min = Math.round(Math.min(...lows) / 5000) * 5000;
  const max = Math.round(Math.max(...highs) / 5000) * 5000;
  return { min, max, count: similar.length };
}

function OfferModal({ jobs, app, offer, setOffer, onSend, onClose, postedJobs, offers, existingOffer, finalizeOffer }: {
  jobs: typeof SEED_JOBS;
  app: NonNullable<ReturnType<typeof usePlatform>["applications"]>[number] | undefined;
  offer: { amount: string; start: string; probationMonths: string; terms: string };
  setOffer: (o: { amount: string; start: string; probationMonths: string; terms: string }) => void;
  onSend: () => void;
  onClose: () => void;
  postedJobs: { minSalary: string; maxSalary: string; category: string; county: string; title: string }[];
  offers: ReturnType<typeof usePlatform>["offers"];
  existingOffer?: { id: string; status: string; counter?: { amount: number }; counterResponse?: "accepted" | "declined" };
  finalizeOffer?: (offerId: string) => void;
}) {
  const j = jobs.find(x => x.id === app?.jobId);
  const comp = COMPANIES.find(c => c.id === j?.companyId);
  const allComparable = useMemo(() => {
    const seedComparable = (jobs as { id?: string; title: string; category: string; county: string; minSalary: number | null; maxSalary: number | null; salaryPublic: boolean }[]).map(x => ({ ...x, id: x.id }));
    const posted = postedJobs.filter(p => p.minSalary && p.maxSalary).map(p => ({
      id: `posted-${p.title}`, title: p.title, category: p.category, county: p.county,
      minSalary: Number(p.minSalary), maxSalary: Number(p.maxSalary), salaryPublic: true,
    }));
    return [...seedComparable, ...posted];
  }, [jobs, postedJobs]);
  const bench = salaryBenchmark(j ?? undefined, allComparable);
  const offerReadyToHire = existingOffer && (existingOffer.status === "accepted" || existingOffer.counterResponse === "accepted");
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-card rounded-lg p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <p className="font-heading font-bold mb-1">Send offer — {app?.candidateName}</p>
        <p className="text-sm text-muted-foreground mb-4">The candidate receives it in their portal and can accept it or send back counter terms. {j ? `Role: ${j.title}${comp ? ` · ${comp.name}` : ""}` : ""}</p>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Monthly salary (KES)</label>
            <input value={offer.amount} onChange={e => setOffer({ ...offer, amount: e.target.value.replace(/[^0-9]/g, "") })} placeholder="e.g. 250000" className="mt-1.5 w-full input-std" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Start date</label>
            <input type="date" min={new Date().toISOString().slice(0, 10)} value={offer.start} onChange={e => setOffer({ ...offer, start: e.target.value })} className="mt-1.5 w-full input-std" />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Probation (months)</label>
            <select value={offer.probationMonths} onChange={e => setOffer({ ...offer, probationMonths: e.target.value })} className="mt-1.5 w-full select-std">
              {["0", "1", "3", "6"].map(m => <option key={m} value={m}>{m === "0" ? "None" : `${m} months`}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Benefits summary</label>
            <input value={offer.terms} onChange={e => setOffer({ ...offer, terms: e.target.value })} placeholder="Medical cover, device allowance…" className="mt-1.5 w-full input-std" />
          </div>
        </div>
        {bench && (
          <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-md p-3 text-xs mb-3">
            <p className="font-semibold text-[#0c4a6e] mb-1 flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" /> Market benchmark — similar roles on TalentKenya</p>
            <p className="text-muted-foreground">
              Comparable listings pay <span className="font-semibold text-foreground">KES {bench.min.toLocaleString()} – {bench.max.toLocaleString()}</span> per month.
              {Number(offer.amount || 0) > 0 ? (
                offer.amount < String(bench.min) ? " Your offer is below the market range — top talent may expect more." :
                offer.amount > String(bench.max) ? " Your offer is above the market range — competitive for senior candidates." :
                " Your offer sits within the market range."
              ) : null}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">Based on {bench.count} comparable active listing{bench.count === 1 ? "" : "s"} sharing keywords or category with this role.</p>
          </div>
        )}
        {offerReadyToHire && (
          <div className="bg-[#f0fdf4] border border-[#86efac] rounded-md p-3 text-xs mb-3">
            <p className="font-semibold text-[#14532d] mb-1 flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Offer accepted — ready to hire</p>
            <p className="text-muted-foreground mb-2">
              {existingOffer!.status === "accepted" ? "The candidate accepted your offer." : `The candidate's counter of KES ${existingOffer!.counter?.amount.toLocaleString()} was accepted.`} Confirm below to move them to <span className="font-semibold text-foreground">Hired</span> and mark this role as filled.
            </p>
            <button onClick={() => { if (finalizeOffer) { finalizeOffer(existingOffer!.id); toast.success("Hired!", { description: `${app?.candidateName} has been moved to the Hired stage and the position is now filled.` }); } }}
              className="btn-press px-4 py-2 rounded-md bg-[#166534] text-white text-xs font-semibold">Finalize hire — close the role</button>
          </div>
        )}
        <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-md p-3 text-xs mb-4">
          <p className="font-semibold text-[#14532d] mb-1">Offer preview</p>
          <p className="text-muted-foreground">{comp?.name ?? "Employer"} offers you <span className="font-semibold text-foreground">KES {Number(offer.amount || 0).toLocaleString()} per month</span>{offer.start ? `, starting ${offer.start}` : ""}, with {offer.probationMonths === "0" ? "no probation" : `${offer.probationMonths} months probation`}.{offer.terms ? ` ${offer.terms}` : ""}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onSend} className="btn-press flex-1 py-2.5 rounded-md bg-[#166534] text-white text-sm font-semibold">Send offer</button>
          <button onClick={onClose} className="btn-press flex-1 py-2.5 rounded-md border border-border text-sm font-semibold">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export function InterviewCalendar({ jobs, list, cancelInterview }: {
  jobs: typeof SEED_JOBS;
  list: ReturnType<typeof usePlatform>["applications"];
  cancelInterview: (id: string) => void;
}) {
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const scheduled = useMemo(
    () => [...list].filter(a => a.interview).sort((a, b) => (a.interview!.date + a.interview!.time).localeCompare(b.interview!.date + b.interview!.time)),
    [list],
  );
  const byDate = useMemo(() => {
    const map = new Map<string, NonNullable<ReturnType<typeof usePlatform>["applications"]>[number][]>();
    scheduled.forEach(a => map.set(a.interview!.date, [...(map.get(a.interview!.date) ?? []), a]));
    return map;
  }, [scheduled]);

  const shift = (delta: number) => {
    let month = calMonth.month + delta;
    let year = calMonth.year;
    if (month < 0) { month = 11; year -= 1; }
    if (month > 11) { month = 0; year += 1; }
    setCalMonth({ year, month });
  };

  const firstDay = new Date(calMonth.year, calMonth.month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday-based
  const daysInMonth = new Date(calMonth.year, calMonth.month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  void firstDay;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="container pb-8">
      <div className="bg-card rounded-lg border border-border p-4 mb-4 flex flex-wrap items-center gap-3">
        <button onClick={() => shift(-1)} className="btn-press p-1.5 rounded-md border border-border hover:border-[#166534]" aria-label="Previous month">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="font-heading font-bold text-lg min-w-[180px] text-center">{CAL_MONTHS[calMonth.month]} {calMonth.year}</p>
        <button onClick={() => shift(1)} className="btn-press p-1.5 rounded-md border border-border hover:border-[#166534]" aria-label="Next month">
          <ChevronRight className="h-4 w-4" />
        </button>
        <div className="ml-auto flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#166534]" /> Scheduled</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#b91c1c]" /> Today</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#ca8a04]" /> Reschedule requested</span>
        </div>
      </div>
      <RescheduleDecisionsPanel jobs={jobs} list={list} employerDecideReschedule={employerDecideRescheduleStub} />
      <div />

      <div className="grid grid-cols-7 gap-px bg-border border border-border rounded-lg overflow-hidden">
        {CAL_DAYS.map(d => <div key={d} className="bg-secondary/60 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{d}</div>)}
        {cells.map((day, i) => {
          const dateStr = day ? `${calMonth.year}-${String(calMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` : null;
          const dayApps = day && dateStr ? byDate.get(dateStr) ?? [] : [];
          const isToday = dateStr === today;
          return (
            <div key={i} className={`bg-card min-h-[96px] p-1.5 ${!day ? "bg-secondary/25" : ""}`}>
              {day && (
                <>
                  <p className={`text-[11px] font-semibold mb-1 ${isToday ? "text-[#b91c1c]" : "text-muted-foreground"}`}>{day}{isToday ? " · today" : ""}</p>
                  <div className="space-y-1">
                    {dayApps.map(a => {
                      const j = [...jobs].find(x => x.id === a.jobId);
                      const resched = a.interview?.response?.status === "reschedule_requested";
                      return (
                        <div key={a.id}
                          className={`rounded-md border p-1.5 text-[10px] leading-tight cursor-pointer hover:shadow-md transition-shadow ${resched ? "border-[#ca8a04] bg-[#fef9ec]" : "border-[#166534]/40 bg-[#e0f2e9]"}`}>
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold truncate">{a.interview!.time}</span>
                            <button onClick={e => { e.stopPropagation(); if (window.confirm(`Cancel ${a.candidateName}'s interview?`)) cancelInterview(a.id); }}
                              className="text-[#b91c1c] hover:underline" title="Cancel"><Trash2 className="h-2.5 w-2.5" /></button>
                          </div>
                          <p className="truncate font-semibold mt-0.5">{a.candidateName}</p>
                          <p className="truncate text-muted-foreground">{a.interview!.type} · {j?.title ?? ""}</p>
                          {resched && a.interview?.response?.proposedAlternative && (
                            <p className="text-[#b45309] font-semibold mt-0.5 truncate">
                              Alt: {a.interview.response.proposedAlternative.date} {a.interview.response.proposedAlternative.time}
                            </p>
                          )}
                          {a.interview?.response?.employerResponse === "declined" && (
                            <p className="text-[#b91c1c] mt-0.5">Declined</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {scheduled.length === 0 && (
        <div className="mt-4 bg-card rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground text-sm">
          No interviews scheduled yet. Pick a candidate on the Pipeline board and click “Schedule interview”.
        </div>
      )}
    </div>
  );
}
