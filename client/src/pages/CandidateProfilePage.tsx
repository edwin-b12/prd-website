/* TalentKenya Candidate Profile Builder — form sections, live completion bar,
   persistent save, Download ATS CV entry. */
import { useState } from "react";
import { Link } from "wouter";
import { Save, Plus, Trash2, ArrowRight, FileDown, FileText, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { usePlatform, profileCompletion } from "@/lib/platform";
import { PortalHeader } from "@/components/Layout";
import { COUNTIES } from "@/lib/data";
import ResumeImportModal from "@/components/ResumeImportModal";
import LinkedInImportModal from "@/components/LinkedInImportModal";

const EXP = { company: "", role: "", start: "", end: "", achievements: "" };
const EDU = { institution: "", degree: "", field: "", year: "" };

export default function CandidateProfilePage() {
  const { profile, updateProfile } = usePlatform();
  const { pct } = profileCompletion(profile);
  const [exp, setExp] = useState(profile.experience.length ? profile.experience : [EXP]);
  const [edu, setEdu] = useState(profile.education.length ? profile.education : [EDU]);
  const [skillInput, setSkillInput] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [linkedinOpen, setLinkedinOpen] = useState(false);
  const [wizardMode, setWizardMode] = useState(true);
  const [wizardStep, setWizardStep] = useState(0);

  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
  const WINDOWS = ["Morning (8–12)", "Afternoon (12–5)", "Evening (5–8)"] as const;
  const avail = profile.interviewAvailability ?? { days: [] as string[], windows: [] as string[] };
  const toggleDay = (d: string) => updateProfile({ interviewAvailability: { days: avail.days.includes(d) ? avail.days.filter(x => x !== d) : [...avail.days, d], windows: avail.windows } });
  const toggleWindow = (w: string) => updateProfile({ interviewAvailability: { days: avail.days, windows: avail.windows.includes(w) ? avail.windows.filter(x => x !== w) : [...avail.windows, w] } });

  const STEPS = [
    { label: "Basics", desc: "Name, contact & location" },
    { label: "Experience", desc: "Your work history" },
    { label: "Education", desc: "Degrees & certificates" },
    { label: "Skills", desc: "What you're great at" },
    { label: "Review", desc: "Check & finish" },
  ];
  const stepPct = Math.round(((wizardStep) / (STEPS.length - 1)) * 100);

  const onImportDone = (engine: "ai" | "deterministic") => {
    setExp(profile.experience.length ? profile.experience : [EXP]);
    setEdu(profile.education.length ? profile.education : [EDU]);
    if (engine === "ai") toast.success("AI parsed your CV — check each section and save.");
    else toast.success("CV parsed — check each section and save.");
  };

  const save = () => {
    const skills = skillInput ? profile.skills : profile.skills;
    updateProfile({ experience: exp, education: edu, skills });
    toast.success("Profile saved");
  };

  return (
    <>
      <PortalHeader role="candidate" title="Build your profile" subtitle="A complete profile gets 3x more recruiter views. It also powers your 1-click applications."
        action={<div className="flex gap-2 flex-wrap">
          <button onClick={() => setLinkedinOpen(true)} className="btn-press px-4 py-2 rounded-md bg-[#166534] text-white text-sm font-semibold flex items-center gap-1.5 hover:bg-[#14532d]"><FileText className="h-4 w-4" /> Import from LinkedIn</button>
          <button onClick={() => setImportOpen(true)} className="btn-press px-4 py-2 rounded-md border border-border text-sm font-semibold flex items-center gap-1.5 hover:bg-muted"><FileDown className="h-4 w-4" /> Import from CV</button>
          <Link href="/candidate/resume-builder" className="btn-press px-4 py-2 rounded-md border border-border text-sm font-semibold flex items-center gap-1.5 hover:bg-muted"><FileDown className="h-4 w-4" /> Download ATS CV</Link>
        </div>} />

      {/* Completion */}
      <div className="bg-card rounded-lg border border-border p-5 mb-6">
        <div className="flex items-center justify-between">
          <p className="font-heading font-bold">Completion</p>
          <span className="font-mono-num font-bold text-xl text-[#166534]">{pct}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden mt-3">
          <div className="h-full bg-[#166534] rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        {pct < 100 && <p className="text-xs text-muted-foreground mt-2">Fill the sections below to reach 100% and appear in more employer searches.</p>}
      </div>

      <div className="grid lg:grid-cols-[1fr_1fr] gap-4 mb-6">
        <div className="bg-card rounded-lg border border-border p-5">
          <h2 className="font-heading font-bold mb-4">Personal details</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <input value={profile.firstName} onChange={e => updateProfile({ firstName: e.target.value })} placeholder="First name" className="input-std" />
            <input value={profile.lastName} onChange={e => updateProfile({ lastName: e.target.value })} placeholder="Last name" className="input-std" />
            <input value={profile.phone} onChange={e => updateProfile({ phone: e.target.value })} placeholder="Phone, e.g. 254712345678" className="input-std" />
            <input value={profile.email} onChange={e => updateProfile({ email: e.target.value })} placeholder="Email" className="input-std" />
            <input value={profile.title} onChange={e => updateProfile({ title: e.target.value })} placeholder="Professional title, e.g. Digital Marketer" className="input-std" />
            <input value={profile.linkedin} onChange={e => updateProfile({ linkedin: e.target.value })} placeholder="LinkedIn URL (optional)" className="input-std" />
            <select value={profile.county} onChange={e => updateProfile({ county: e.target.value })} className="select-std">
              <option value="">County</option>
              {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input value={profile.town} onChange={e => updateProfile({ town: e.target.value })} placeholder="Town / suburb" className="input-std" />
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-5">
          <h2 className="font-heading font-bold mb-4">Skills <span className="text-xs font-normal text-muted-foreground">(3+ recommended)</span></h2>
          <div className="flex gap-2">
            <input value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="Add a skill and press Enter"
              className="input-std"
              onKeyDown={e => { if (e.key === "Enter" && skillInput.trim()) { e.preventDefault(); updateProfile({ skills: [...profile.skills, skillInput.trim()] }); setSkillInput(""); } }} />
            <button onClick={() => { if (skillInput.trim()) { updateProfile({ skills: [...profile.skills, skillInput.trim()] }); setSkillInput(""); } }}
              className="btn-press px-4 rounded-md bg-[#166534] text-white font-semibold text-sm">Add</button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {profile.skills.map((s, i) => (
              <span key={s} className="inline-flex items-center gap-1.5 bg-[#e0f2e9] text-[#14532d] rounded-full pl-3 pr-1.5 py-1 text-xs font-semibold">
                {s}
                <button onClick={() => updateProfile({ skills: profile.skills.filter((_, j) => j !== i) })} className="p-0.5 hover:text-[#b91c1c]"><Trash2 className="h-3 w-3" /></button>
              </span>
            ))}
            {profile.skills.length === 0 && <p className="text-xs text-muted-foreground">No skills added yet. Add at least 3 to unlock match scoring.</p>}
          </div>
        </div>
      </div>

      {/* Experience */}
      <div className="bg-card rounded-lg border border-border p-5 mb-6">
        <h2 className="font-heading font-bold mb-4">Work experience</h2>
        <div className="space-y-4">
          {exp.map((e, i) => (
            <div key={i} className="border border-border rounded-md p-4 relative">
              {exp.length > 1 && (
                <button onClick={() => setExp(exp.filter((_, j) => j !== i))} className="absolute right-3 top-3 text-muted-foreground hover:text-[#b91c1c]"><Trash2 className="h-4 w-4" /></button>
              )}
              <div className="grid sm:grid-cols-2 gap-3">
                <input value={e.role} onChange={e2 => setExp(exp.map((x, j) => j === i ? { ...x, role: e2.target.value } : x))} placeholder="Job title" className="input-std" />
                <input value={e.company} onChange={e2 => setExp(exp.map((x, j) => j === i ? { ...x, company: e2.target.value } : x))} placeholder="Company" className="input-std" />
                <input value={e.start} onChange={e2 => setExp(exp.map((x, j) => j === i ? { ...x, start: e2.target.value } : x))} placeholder="Start (e.g. 2022-01)" className="input-std" />
                <input value={e.end} onChange={e2 => setExp(exp.map((x, j) => j === i ? { ...x, end: e2.target.value } : x))} placeholder="End (or 'Present')" className="input-std" />
              </div>
              <textarea value={e.achievements} onChange={e2 => setExp(exp.map((x, j) => j === i ? { ...x, achievements: e2.target.value } : x))}
                placeholder="Key achievements..." rows={2} className="input-std mt-3" />
            </div>
          ))}
          <button onClick={() => setExp([...exp, EXP])} className="text-sm font-semibold text-[#166534] flex items-center gap-1.5 hover:underline">
            <Plus className="h-4 w-4" /> Add experience
          </button>
        </div>
      </div>

      {/* Interview availability */}
      <div className="bg-card rounded-lg border border-border p-5 mb-6">
        <h2 className="font-heading font-bold mb-1 flex items-center gap-2"><CalendarClock className="h-4 w-4 text-[#166534]" /> Interview availability</h2>
        <p className="text-xs text-muted-foreground mb-4">Tell employers when you're free for interviews. Your preferences show as a hint when they schedule, so you get slots that work for you.</p>
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Preferred days</p>
          <div className="flex flex-wrap gap-2">
            {DAYS.map(d => (
              <button key={d} onClick={() => toggleDay(d)}
                className={`btn-press px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${avail.days.includes(d) ? "bg-[#166534] text-white border-[#166534]" : "border-border text-foreground/75 hover:border-[#166534]"}`}>
                {d}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Preferred time windows (EAT)</p>
          <div className="flex flex-wrap gap-2">
            {WINDOWS.map(w => (
              <button key={w} onClick={() => toggleWindow(w)}
                className={`btn-press px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${avail.windows.includes(w) ? "bg-[#166534] text-white border-[#166534]" : "border-border text-foreground/75 hover:border-[#166534]"}`}>
                {w}
              </button>
            ))}
          </div>
          {avail.days.length === 0 && avail.windows.length === 0 && (
            <p className="text-[11px] text-muted-foreground mt-3">Not set — any time works for you. Setting preferences does not block employers from proposing other slots.</p>
          )}
        </div>
      </div>

      {/* Education */}
      <div className="bg-card rounded-lg border border-border p-5 mb-6">
        <h2 className="font-heading font-bold mb-4">Education</h2>
        <div className="space-y-4">
          {edu.map((e, i) => (
            <div key={i} className="border border-border rounded-md p-4 relative">
              {edu.length > 1 && (
                <button onClick={() => setEdu(edu.filter((_, j) => j !== i))} className="absolute right-3 top-3 text-muted-foreground hover:text-[#b91c1c]"><Trash2 className="h-4 w-4" /></button>
              )}
              <div className="grid sm:grid-cols-2 gap-3">
                <input value={e.institution} onChange={e2 => setEdu(edu.map((x, j) => j === i ? { ...x, institution: e2.target.value } : x))} placeholder="Institution" className="input-std" />
                <input value={e.degree} onChange={e2 => setEdu(edu.map((x, j) => j === i ? { ...x, degree: e2.target.value } : x))} placeholder="Degree / certificate" className="input-std" />
                <input value={e.field} onChange={e2 => setEdu(edu.map((x, j) => j === i ? { ...x, field: e2.target.value } : x))} placeholder="Field of study" className="input-std" />
                <input value={e.year} onChange={e2 => setEdu(edu.map((x, j) => j === i ? { ...x, year: e2.target.value } : x))} placeholder="Year" className="input-std" />
              </div>
            </div>
          ))}
          <button onClick={() => setEdu([...edu, EDU])} className="text-sm font-semibold text-[#166534] flex items-center gap-1.5 hover:underline">
            <Plus className="h-4 w-4" /> Add education
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between bg-card rounded-lg border border-border p-5">
        <p className="text-sm text-muted-foreground">Changes save instantly as you type. Your CV generator uses this profile.</p>
        <div className="flex gap-2">
          <button onClick={save} className="btn-press px-5 py-2.5 rounded-md bg-[#166534] hover:bg-[#14532d] text-white text-sm font-semibold flex items-center gap-1.5">
            <Save className="h-4 w-4" /> Save profile
          </button>
          <Link href="/candidate/dashboard" className="btn-press px-5 py-2.5 rounded-md border border-border text-sm font-semibold flex items-center gap-1.5 hover:bg-muted">
            Back to dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <ResumeImportModal open={importOpen} onClose={() => setImportOpen(false)} onDone={onImportDone} />
      <LinkedInImportModal open={linkedinOpen} onClose={() => setLinkedinOpen(false)} onDone={() => onImportDone("deterministic")} />

      {/* Mode toggle */}
      <div className="flex items-center justify-between bg-card rounded-lg border border-border p-4 mb-6">
        <div>
          <p className="text-sm font-semibold">Profile view</p>
          <p className="text-xs text-muted-foreground">{wizardMode ? "Step-by-step wizard" : "Full page with all sections"}</p>
        </div>
        <div className="flex rounded-md border border-border overflow-hidden">
          <button onClick={() => setWizardMode(true)} className={`px-4 py-2 text-sm font-semibold ${wizardMode ? "bg-[#166534] text-white" : "bg-transparent hover:bg-muted"}`}>Wizard</button>
          <button onClick={() => setWizardMode(false)} className={`px-4 py-2 text-sm font-semibold ${!wizardMode ? "bg-[#166534] text-white" : "bg-transparent hover:bg-muted"}`}>Full view</button>
        </div>
      </div>

      {wizardMode && (
        <div className="mb-6">
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((s, i) => (
              <button key={i} onClick={() => setWizardStep(i)} className={`flex flex-col items-center gap-1 transition-opacity ${i === wizardStep ? "opacity-100" : "opacity-60 hover:opacity-100"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${i <= wizardStep ? "border-[#166534] bg-[#166534] text-white" : "border-border text-muted-foreground"}`}>
                  {i < wizardStep ? "✓" : i + 1}
                </div>
                <span className="text-[10px] font-semibold hidden sm:block">{s.label}</span>
              </button>
            ))}
          </div>
          <div className="h-1 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-[#166534] rounded-full transition-all duration-300" style={{ width: `${stepPct}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">{STEPS[wizardStep].desc}</p>
        </div>
      )}

      {wizardMode && wizardStep === 0 && (
        <WizardCard>
          <h2 className="font-heading font-bold mb-4">Step 1 — Personal details</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <input value={profile.firstName} onChange={e => updateProfile({ firstName: e.target.value })} placeholder="First name" className="input-std" />
            <input value={profile.lastName} onChange={e => updateProfile({ lastName: e.target.value })} placeholder="Last name" className="input-std" />
            <input value={profile.phone} onChange={e => updateProfile({ phone: e.target.value })} placeholder="Phone, e.g. 254712345678" className="input-std" />
            <input value={profile.email} onChange={e => updateProfile({ email: e.target.value })} placeholder="Email" className="input-std" />
            <input value={profile.title} onChange={e => updateProfile({ title: e.target.value })} placeholder="Professional title, e.g. Digital Marketer" className="input-std" />
            <input value={profile.linkedin} onChange={e => updateProfile({ linkedin: e.target.value })} placeholder="LinkedIn URL (optional)" className="input-std" />
            <select value={profile.county} onChange={e => updateProfile({ county: e.target.value })} className="select-std">
              <option value="">County</option>
              {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input value={profile.town} onChange={e => updateProfile({ town: e.target.value })} placeholder="Town / suburb" className="input-std" />
          </div>
        </WizardCard>
      )}

      {wizardMode && wizardStep === 1 && (
        <WizardCard>
          <h2 className="font-heading font-bold mb-4">Step 2 — Work experience</h2>
          <div className="space-y-4">
            {exp.map((e, i) => (
              <div key={i} className="border border-border rounded-md p-4 relative">
                {exp.length > 1 && (
                  <button onClick={() => setExp(exp.filter((_, j) => j !== i))} className="absolute right-3 top-3 text-muted-foreground hover:text-[#b91c1c]"><Trash2 className="h-4 w-4" /></button>
                )}
                <div className="grid sm:grid-cols-2 gap-3">
                  <input value={e.role} onChange={e2 => setExp(exp.map((x, j) => j === i ? { ...x, role: e2.target.value } : x))} placeholder="Job title" className="input-std" />
                  <input value={e.company} onChange={e2 => setExp(exp.map((x, j) => j === i ? { ...x, company: e2.target.value } : x))} placeholder="Company" className="input-std" />
                  <input value={e.start} onChange={e2 => setExp(exp.map((x, j) => j === i ? { ...x, start: e2.target.value } : x))} placeholder="Start (e.g. 2022-01)" className="input-std" />
                  <input value={e.end} onChange={e2 => setExp(exp.map((x, j) => j === i ? { ...x, end: e2.target.value } : x))} placeholder="End (or 'Present')" className="input-std" />
                </div>
                <textarea value={e.achievements} onChange={e2 => setExp(exp.map((x, j) => j === i ? { ...x, achievements: e2.target.value } : x))}
                  placeholder="Key achievements..." rows={2} className="input-std mt-3" />
              </div>
            ))}
            <button onClick={() => setExp([...exp, EXP])} className="text-sm font-semibold text-[#166534] flex items-center gap-1.5 hover:underline">
              <Plus className="h-4 w-4" /> Add experience
            </button>
          </div>
        </WizardCard>
      )}

      {wizardMode && wizardStep === 2 && (
        <WizardCard>
          <h2 className="font-heading font-bold mb-4">Step 3 — Education</h2>
          <div className="space-y-4">
            {edu.map((e, i) => (
              <div key={i} className="border border-border rounded-md p-4 relative">
                {edu.length > 1 && (
                  <button onClick={() => setEdu(edu.filter((_, j) => j !== i))} className="absolute right-3 top-3 text-muted-foreground hover:text-[#b91c1c]"><Trash2 className="h-4 w-4" /></button>
                )}
                <div className="grid sm:grid-cols-2 gap-3">
                  <input value={e.institution} onChange={e2 => setEdu(edu.map((x, j) => j === i ? { ...x, institution: e2.target.value } : x))} placeholder="Institution" className="input-std" />
                  <input value={e.degree} onChange={e2 => setEdu(edu.map((x, j) => j === i ? { ...x, degree: e2.target.value } : x))} placeholder="Degree / certificate" className="input-std" />
                  <input value={e.field} onChange={e2 => setEdu(edu.map((x, j) => j === i ? { ...x, field: e2.target.value } : x))} placeholder="Field of study" className="input-std" />
                  <input value={e.year} onChange={e2 => setEdu(edu.map((x, j) => j === i ? { ...x, year: e2.target.value } : x))} placeholder="Year" className="input-std" />
                </div>
              </div>
            ))}
            <button onClick={() => setEdu([...edu, EDU])} className="text-sm font-semibold text-[#166534] flex items-center gap-1.5 hover:underline">
              <Plus className="h-4 w-4" /> Add education
            </button>
          </div>
        </WizardCard>
      )}

      {wizardMode && wizardStep === 3 && (
        <WizardCard>
          <h2 className="font-heading font-bold mb-4">Step 4 — Skills</h2>
          <div className="flex gap-2">
            <input value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="Add a skill and press Enter"
              className="input-std"
              onKeyDown={e => { if (e.key === "Enter" && skillInput.trim()) { e.preventDefault(); updateProfile({ skills: [...profile.skills, skillInput.trim()] }); setSkillInput(""); } }} />
            <button onClick={() => { if (skillInput.trim()) { updateProfile({ skills: [...profile.skills, skillInput.trim()] }); setSkillInput(""); } }}
              className="btn-press px-4 rounded-md bg-[#166534] text-white font-semibold text-sm">Add</button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {profile.skills.map((s, i) => (
              <span key={s} className="inline-flex items-center gap-1.5 bg-[#e0f2e9] text-[#14532d] rounded-full pl-3 pr-1.5 py-1 text-xs font-semibold">
                {s}
                <button onClick={() => updateProfile({ skills: profile.skills.filter((_, j) => j !== i) })} className="p-0.5 hover:text-[#b91c1c]"><Trash2 className="h-3 w-3" /></button>
              </span>
            ))}
            {profile.skills.length === 0 && <p className="text-xs text-muted-foreground">No skills added yet. Add at least 3 to unlock match scoring.</p>}
          </div>
        </WizardCard>
      )}

      {wizardMode && wizardStep === 4 && (
        <WizardCard>
          <h2 className="font-heading font-bold mb-4">Step 5 — Review & save</h2>
          <div className="space-y-3 text-sm">
            <div className="grid sm:grid-cols-2 gap-2">
              <p><span className="text-muted-foreground">Name:</span> {profile.firstName} {profile.lastName}</p>
              <p><span className="text-muted-foreground">Title:</span> {profile.title || "—"}</p>
              <p><span className="text-muted-foreground">Email:</span> {profile.email || "—"}</p>
              <p><span className="text-muted-foreground">Phone:</span> {profile.phone || "—"}</p>
              <p><span className="text-muted-foreground">Location:</span> {profile.county || "—"}{profile.town ? `, ${profile.town}` : ""}</p>
              <p><span className="text-muted-foreground">LinkedIn:</span> {profile.linkedin || "—"}</p>
            </div>
            <p><span className="text-muted-foreground">Experience:</span> {exp.filter(e => e.role || e.company).length} role(s)</p>
            <p><span className="text-muted-foreground">Education:</span> {edu.filter(e => e.institution).length} entry/entries</p>
            <p><span className="text-muted-foreground">Skills:</span> {profile.skills.length > 0 ? profile.skills.join(", ") : "None yet"}</p>
            <p><span className="text-muted-foreground">Profile completion:</span> <span className="font-bold text-[#166534]">{pct}%</span></p>
          </div>
        </WizardCard>
      )}

      {wizardMode && (
        <div className="flex items-center justify-between bg-card rounded-lg border border-border p-4">
          <button onClick={() => setWizardStep(Math.max(0, wizardStep - 1))} disabled={wizardStep === 0}
            className="btn-press px-4 py-2 rounded-md border border-border text-sm font-semibold flex items-center gap-1.5 hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed">
            ← Previous
          </button>
          {wizardStep < STEPS.length - 1 ? (
            <button onClick={() => setWizardStep(wizardStep + 1)} className="btn-press px-5 py-2 rounded-md bg-[#166534] hover:bg-[#14532d] text-white text-sm font-semibold">
              Next →
            </button>
          ) : (
            <button onClick={() => { save(); toast.success("Profile complete!"); }} className="btn-press px-5 py-2 rounded-md bg-[#166534] hover:bg-[#14532d] text-white text-sm font-semibold flex items-center gap-1.5">
              <Save className="h-4 w-4" /> Finish & save
            </button>
          )}
        </div>
      )}

      {wizardMode && (
        <div className="flex items-center justify-between bg-card rounded-lg border border-border p-4 mt-4">
          <p className="text-sm text-muted-foreground">Changes save instantly as you type. Your CV generator uses this profile.</p>
          <Link href="/candidate/dashboard" className="btn-press px-5 py-2.5 rounded-md border border-border text-sm font-semibold flex items-center gap-1.5 hover:bg-muted">
            Back to dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </>
  );
}

function WizardCard({ children }: { children: React.ReactNode }) {
  return <div className="bg-card rounded-lg border border-border p-5 mb-6">{children}</div>;
}
