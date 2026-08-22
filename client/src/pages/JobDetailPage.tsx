/* TalentKenya Job Detail — PRD §US-2.3: 1-click apply with screener questions,
   custom/templated cover letter, instant confirmation. Salary-gated sections. */
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, ArrowRight, MapPin, Building2, Clock, CalendarClock, Eye, BriefcaseBusiness, CheckCircle2, Sparkles, Bookmark, Share2, ShieldCheck, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { JOBS, COMPANIES, STAGE_LABELS } from "@/lib/data";
import { generateCoverLetter } from "@/lib/aiEngine";
import { RichTextEditor, htmlToText } from "@/components/RichTextEditor";
import { Badge, KESAmount, daysAgo, MatchRing } from "@/components/primitives";
import { usePlatform } from "@/lib/platform";


export default function JobDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const job = JOBS.find(j => j.slug === slug);
  const { role, profile, applyToJob, savedJobs, toggleSaveJob, candidateMatches } = usePlatform();
  const [modalOpen, setModalOpen] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [coverLetter, setCoverLetter] = useState("");
  const [applied, setApplied] = useState(false);
  const [appRef, setAppRef] = useState("");

  const company = useMemo(() => COMPANIES.find(c => c.id === job?.companyId), [job]);
  const match = candidateMatches.find(m => m.jobId === job?.id)?.score ?? null;
  const [letterGenerating, setLetterGenerating] = useState(false);

  useEffect(() => {
    setModalOpen(false); setApplied(false);
  }, [slug]);

  if (!job || !company) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground mb-4">This vacancy is no longer available.</p>
        <Link href="/jobs" className="btn-press px-5 py-2.5 rounded-md bg-[#166534] text-white text-sm font-semibold">Browse jobs</Link>
      </div>
    );
  }

  const saved = savedJobs.includes(job.id);

  const openApply = () => {
    if (!role) { toast.info("Sign in required", { description: "Create a free candidate account to apply with your profile in one click." }); return; }
    if (role !== "candidate") { toast.error("Employers and admins cannot apply to jobs"); return; }
    setAnswers(job.screenerQuestions.map(q => (q.type === "yesno" ? "yes" : q.type === "mcq" ? q.q.split("|").length > 1 ? "option1" : "" : "")));
    setCoverLetter("");
    setModalOpen(true);
  };

  const generateLetter = async () => {
    setLetterGenerating(true);
    try {
      const { text, engine } = await generateCoverLetter(profile, {
        title: job.title,
        company: company?.name ?? "the employer",
        description: job.description,
        requirements: job.requirements,
        benefits: job.benefits,
      });
      setCoverLetter(text);
      toast.success(engine === "ai" ? "AI draft generated" : "Draft generated from your profile", {
        description: engine === "ai" ? "The letter was tailored by AI to this job. Review and adjust freely." : "An offline draft was created — the AI service is currently unavailable.",
      });
    } catch {
      toast.error("Could not generate a draft — please write one or try again.");
    } finally {
      setLetterGenerating(false);
    }
  };

  const submitApplication = () => {
    const missing = answers.some(a => !a);
    if (missing) { toast.error("Please answer all screener questions"); return; }
    const ref = `TK-${Math.floor(Math.random() * 90000) + 10000}`;
    applyToJob(job.id, answers, htmlToText(coverLetter));
    setAppRef(ref);
    setApplied(true);
  };

  return (
    <>
      <div className="container py-8">
        <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to job board
        </Link>

        <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
          <div>
            {/* Header */}
            <div className="bg-card rounded-lg border border-border p-6 md:p-8">
              <div className="flex flex-wrap gap-2 mb-4">
                {job.featured && <Badge variant="featured">Featured</Badge>}
                {job.urgent && <Badge variant="urgent">Urgent hiring</Badge>}
                {job.workMode === "Remote" && <Badge variant="remote">Remote OK</Badge>}
                {company.verified && <Badge variant="verified"><ShieldCheck className="h-3 w-3" /> Verified employer</Badge>}
              </div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold">{job.title}</h1>
              <Link href={`/companies/${company.slug}`} className="text-[#166534] font-semibold text-sm flex items-center gap-1.5 mt-2 w-fit">
                <Building2 className="h-4 w-4" /> {company.name} {company.verified && <CheckCircle2 className="h-3.5 w-3.5" />}
              </Link>
              <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{job.town ? `${job.town}, ` : ""}{job.county}</span>
                <span className="flex items-center gap-1.5"><BriefcaseBusiness className="h-4 w-4" />{job.jobType}</span>
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{job.experience}</span>
                <span className="flex items-center gap-1.5"><CalendarClock className="h-4 w-4" />Deadline {job.deadline}</span>
                <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" />{job.views} views · {daysAgo(job.posted)}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-border">
                {job.salaryPublic ? (
                  <div>
                    <p className="text-xs text-muted-foreground">Monthly salary</p>
                    <p className="font-mono-num font-bold text-lg"><KESAmount value={job.minSalary} /> – <KESAmount value={job.maxSalary} /></p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Competitive salary — disclosed after application</p>
                )}
                <button onClick={openApply} className="btn-press ml-auto px-6 py-3 rounded-md bg-[#166534] hover:bg-[#14532d] text-white font-semibold text-sm">
                  1-Click Apply
                </button>
                <button onClick={() => { toggleSaveJob(job.id); toast.success(saved ? "Removed from saved" : "Saved for later"); }}
                  className={saved ? "text-[#166534]" : "text-muted-foreground hover:text-[#166534]"}>
                  <Bookmark className={saved ? "h-5 w-5 fill-current" : "h-5 w-5"} />
                </button>
                <button onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success("Link copied"); }} className="text-muted-foreground hover:text-[#166534]">
                  <Share2 className="h-5 w-5" />
                </button>
                {match !== null && (
                  <div className="flex items-center gap-2 border-l border-border pl-3">
                    <MatchRing score={match} />
                    <span className="text-xs text-muted-foreground">Profile match</span>
                  </div>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="bg-card rounded-lg border border-border p-6 md:p-8 mt-4">
              <h2 className="font-heading text-xl font-bold mb-3">About the role</h2>
              <p className="text-sm leading-relaxed text-foreground/85 whitespace-pre-line">{job.description}</p>
              <h2 className="font-heading text-xl font-bold mt-8 mb-3">Requirements</h2>
              <ul className="space-y-2">
                {job.requirements.map(r => (
                  <li key={r} className="flex gap-2.5 text-sm text-foreground/85">
                    <CheckCircle2 className="h-4 w-4 text-[#166534] shrink-0 mt-0.5" /> {r}
                  </li>
                ))}
              </ul>
              {job.benefits.length > 0 && (
                <>
                  <h2 className="font-heading text-xl font-bold mt-8 mb-3">Benefits</h2>
                  <ul className="space-y-2">
                    {job.benefits.map(b => (
                      <li key={b} className="flex gap-2.5 text-sm text-foreground/85"><Sparkles className="h-4 w-4 text-[#ca8a04] shrink-0 mt-0.5" /> {b}</li>
                    ))}
                  </ul>
                </>
              )}
              <div className="bg-[#e0f2e9] rounded-md p-4 mt-8 text-sm">
                <p className="font-semibold text-[#14532d] mb-1">TalentKenya Safety Promise</p>
                <p className="text-[#14532d]/80">This employer is KYC-verified. We never allow employers to charge candidates fees, medical charges, or training deposits. Report anything suspicious via the footer contact form.</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="bg-card rounded-lg border border-border p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-md flex items-center justify-center text-white font-heading font-bold text-lg" style={{ backgroundColor: company.logoColor }}>{company.name.charAt(0)}</div>
                <div>
                  <p className="font-semibold text-sm">{company.name}</p>
                  <p className="text-xs text-muted-foreground">{company.industry} · est. {company.founded}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><MapPin className="h-3 w-3" />{company.town}, {company.county}</p>
              <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-[#166534]" /> KRA PIN: {company.kraPin} · Verified</p>
              <Link href={`/companies/${company.slug}`} className="block text-center text-sm font-semibold text-[#166534] border border-[#166534]/30 rounded-md py-2 hover:bg-[#e0f2e9]">
                View company profile
              </Link>
            </div>
            <div className="bg-card rounded-lg border border-border p-5 text-sm">
              <p className="font-semibold mb-2">Similar in {job.category}</p>
              <ul className="space-y-2">
                {JOBS.filter(j => j.category === job.category && j.id !== job.id).slice(0, 3).map(j => (
                  <li key={j.id}>
                    <Link href={`/jobs/${j.slug}`} className="text-[#166534] hover:underline text-sm leading-snug block">{j.title}</Link>
                    <span className="text-xs text-muted-foreground">{j.county} · {daysAgo(j.posted)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {/* ── Apply modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-[80] flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-t-xl md:rounded-lg w-full md:max-w-lg max-h-[92vh] overflow-y-auto p-6 fade-up">
            {!applied ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading text-xl font-bold">Apply: {job.title}</h2>
                  <button onClick={() => setModalOpen(false)} className="p-2 rounded-md hover:bg-muted"><X className="h-4 w-4" /></button>
                </div>
                {role === "candidate" && (
                  <div className="bg-secondary rounded-md p-3 mb-5 text-sm flex items-center gap-3">
                    <span className="h-9 w-9 rounded-full bg-[#166534] text-white flex items-center justify-center font-bold shrink-0">
                      {(profile.firstName?.[0] || "A") + (profile.lastName?.[0] || "C")}
                    </span>
                    <span>Applying with your TalentKenya profile: <b>{profile.firstName || "Anonymous"} {profile.lastName || "Candidate"}</b>{profile.title ? ` · ${profile.title}` : ""}</span>
                  </div>
                )}
                <div className="mb-5">
                  <p className="text-sm font-semibold mb-2">Screener questions <span className="text-[#b91c1c]">*</span></p>
                  <div className="space-y-3">
                    {job.screenerQuestions.map((sq, i) => (
                      <div key={i} className="border border-border rounded-md p-3.5">
                        <p className="text-sm font-medium mb-2">{sq.q}</p>
                        {sq.type === "yesno" ? (
                          <div className="flex gap-2">
                            {["Yes", "No"].map(o => (
                              <button key={o} onClick={() => setAnswers(a => a.map((v, j) => j === i ? o.toLowerCase() : v))}
                                className={answers[i] === o.toLowerCase() ? "bg-[#166534] text-white" : "bg-secondary text-foreground"}
                                style={{ padding: "8px 18px", borderRadius: 999, fontSize: 13, fontWeight: 600 }}>{o}</button>
                            ))}
                          </div>
                        ) : sq.type === "mcq" ? (
                          <select value={answers[i] || ""} onChange={e => setAnswers(a => a.map((v, j) => j === i ? e.target.value : v))} className="select-std text-sm">
                            <option value="">Select an option</option>
                            {sq.q.split("|").map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : (
                          <input value={answers[i] || ""} onChange={e => setAnswers(a => a.map((v, j) => j === i ? e.target.value : v))}
                            placeholder="Type your answer..." className="input-std text-sm" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mb-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Cover letter <span className="text-muted-foreground font-normal">(optional)</span></p>
                    <button onClick={generateLetter} disabled={letterGenerating}
                      className="text-xs font-semibold text-[#166534] flex items-center gap-1 hover:underline disabled:opacity-50 disabled:cursor-not-allowed">
                      {letterGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                      {letterGenerating ? "Generating…" : "Generate with AI"}
                    </button>
                  </div>
                  <RichTextEditor value={coverLetter} onChange={setCoverLetter}
                    placeholder="Tell the employer why you're a great fit — use the toolbar to format your letter..."
                    className="mt-2" />
                </div>
                <button onClick={submitApplication} className="btn-press w-full py-3 rounded-md bg-[#166534] hover:bg-[#14532d] text-white font-semibold text-sm">
                  Submit application
                </button>
                <p className="text-[11px] text-muted-foreground text-center mt-3">You'll receive an email confirmation with reference number instantly.</p>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="h-14 w-14 rounded-full bg-[#e0f2e9] text-[#166534] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h2 className="font-heading text-2xl font-bold">Application received!</h2>
                <p className="text-sm text-muted-foreground mt-2">Your application was sent to <b>{company.name}</b>.</p>
                <div className="bg-secondary rounded-md p-4 mt-4 text-sm inline-block">
                  <p className="text-xs text-muted-foreground">Reference</p>
                  <p className="font-mono-num font-bold">{appRef}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-4 max-w-xs mx-auto">A confirmation email has been sent. Track this application's status anytime in your candidate portal.</p>
                <div className="flex gap-2 mt-6">
                  <Link href="/candidate/applications" className="btn-press flex-1 py-2.5 rounded-md bg-[#166534] text-white text-sm font-semibold">Track application</Link>
                  <button onClick={() => setModalOpen(false)} className="btn-press flex-1 py-2.5 rounded-md border border-border text-sm font-semibold">Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
