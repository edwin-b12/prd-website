/* TalentKenya Job Posting Wizard — 5 steps: basics → compensation → requirements
   → screeners → tier & M-Pesa/card checkout. Structured data model as per PRD. */
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { ChevronRight, ChevronLeft, Check, Smartphone, CreditCard, ShieldCheck, Plus, Trash2, Sparkles, Loader2 } from "lucide-react";
import { usePlatform } from "@/lib/platform";
import { PortalHeader } from "@/components/Layout";
import { COUNTIES, INDUSTRIES, PRICING, KES as k } from "@/lib/data";
import { generateJobDraft } from "@/lib/aiEngine";

const TIER_INFO: Record<string, { name: string; amount: number; blurb: string }> = {
  standard: { name: "Standard listing", amount: 4999, blurb: "30 days live, appears in search and category feeds" },
  featured: { name: "Featured listing", amount: 11999, blurb: "Top of category + homepage carousel, 60 days, priority match scoring" },
  headhunt: { name: "Executive headhunt", amount: 250000, blurb: "Our recruiters source and pre-screen candidates for you" },
};

export default function PostJobPage() {
  const [, nav] = useLocation();
  const { postJob, payJob, profile } = usePlatform();
  const [step, setStep] = useState(0);
  const [tier, setTier] = useState("standard");
  const [paying, setPaying] = useState(false);
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [aiDrafting, setAiDrafting] = useState(false);
  const [form, setForm] = useState({
    title: "", category: "", county: "", jobType: "Full-time", workMode: "On-site", experience: "Mid-level",
    minSalary: "", maxSalary: "", description: "", requirements: [] as string[], benefits: [] as string[],
    deadline: "",     screeners: [] as { q: string; type: string }[],
    newQ: "", newQType: "yesno" as string, newOpt: "",
    newReq: "", newBen: "",
  });

  const set = (k: keyof typeof form, v: unknown) => setForm({ ...form, [k]: v });

  const addReq = () => { if (form.newReq.trim()) { set("requirements", [...form.requirements, form.newReq.trim()]); set("newReq", ""); } };
  const addBen = () => { if (form.newBen.trim()) { set("benefits", [...form.benefits, form.newBen.trim()]); set("newBen", ""); } };
  const addScreener = () => {
    if (!form.newQ.trim()) return toast.error("Write the question first");
    if (form.newQType === "mcq" && form.newOpt.split("|").length < 2) return toast.error("Add 2+ options separated with |");
    set("screeners", [...form.screeners, { q: form.newQ, type: form.newQType }]);
    set("newQ", ""); set("newOpt", "");
  };

  const runAiAssistant = async () => {
    if (!form.title.trim()) return toast.error("Enter the job title first — the AI drafts from it");
    setAiDrafting(true);
    try {
      const { draft, engine } = await generateJobDraft(form.title.trim(), form.category, form.experience);
      set("description", draft.description);
      if (draft.requirements.length) set("requirements", draft.requirements);
      if (draft.benefits.length) set("benefits", draft.benefits);
      if (draft.minSalary) set("minSalary", String(parseInt(draft.minSalary.replace(/[^0-9]/g, ""), 10)));
      if (draft.maxSalary) set("maxSalary", String(parseInt(draft.maxSalary.replace(/[^0-9]/g, ""), 10)));
      if (draft.workMode && ["On-site", "Remote", "Hybrid"].includes(draft.workMode)) set("workMode", draft.workMode);
      toast.success(`AI drafted the description, ${draft.requirements.length} requirements and benefits${engine === "ai" ? "" : " (offline template)"}`);
    } catch {
      toast.error("The AI assistant is unavailable right now — try again shortly");
    } finally {
      setAiDrafting(false);
    }
  };

  const validate = () => {
    if (!form.title.trim()) return toast.error("Enter the job title");
    if (!form.category) return toast.error("Select a category");
    if (!form.county) return toast.error("Select a county");
    if (!form.description.trim() || form.description.length < 50) return toast.error("Description needs at least 50 characters");
    if (form.requirements.length === 0) return toast.error("Add at least one requirement");
    if (!form.deadline) return toast.error("Set an application deadline");
    return true;
  };

  const submitAndPay = () => {
    if (!validate()) return;
    if (tier === "headhunt") {
      postJob({ title: form.title, company: profile.firstName || "Your Company", county: form.county, category: form.category, jobType: form.jobType, workMode: form.workMode, experience: form.experience, minSalary: form.minSalary, maxSalary: form.maxSalary, description: form.description, requirements: form.requirements, deadline: form.deadline, tier: "standard", amount: TIER_INFO[tier].amount });
      toast.success("Headhunt request submitted — a recruiter will contact you within 1 business day.");
      nav("/employer/dashboard");
      return;
    }
    postJob({ title: form.title, company: profile.firstName || "Your Company", county: form.county, category: form.category, jobType: form.jobType, workMode: form.workMode, experience: form.experience, minSalary: form.minSalary, maxSalary: form.maxSalary, description: form.description, requirements: form.requirements, deadline: form.deadline, tier: tier as "standard" | "featured", amount: TIER_INFO[tier].amount });
    // payJob requires the posted job id — find latest
    setTimeout(() => {
      const { postedJobs } = window as unknown as never;
    }, 0);
  };

  /* Payment step handled separately below after posting */
  const [postedId, setPostedId] = useState<string | null>(null);

  const finishPay = (channel: "mpesa_stk" | "card") => {
    if (!postedId) return;
    if (channel === "mpesa_stk") {
      if (!/^(254|0)[17]\d{8,9}$/.test(mpesaPhone.replace(/\s/g, ""))) return toast.error("Enter a valid M-Pesa number, e.g. 254712345678");
      setPaying(true);
      setTimeout(() => {
        payJob(postedId, "mpesa_stk");
        setPaying(false);
        toast.success("STK Push sent to " + mpesaPhone, { description: "Enter your M-Pesa PIN on your phone. Receipt is saved in Billing." });
        nav("/employer/manage-jobs");
      }, 1800);
      return;
    }
    setPaying(true);
    setTimeout(() => {
      payJob(postedId, "card");
      setPaying(false);
      toast.success("Payment confirmed", { description: "Card charged. Receipt saved in Billing." });
      nav("/employer/manage-jobs");
    }, 1500);
  };

  const goPay = () => {
    if (!validate()) return;
    set("description", form.description); // noop for TS
    postJob({ title: form.title, company: profile.firstName || "Your Company", county: form.county, category: form.category, jobType: form.jobType, workMode: form.workMode, experience: form.experience, minSalary: form.minSalary, maxSalary: form.maxSalary, description: form.description, requirements: form.requirements, deadline: form.deadline, tier: tier as "standard" | "featured", amount: TIER_INFO[tier].amount });
    const latest = `pj-${Date.now()}`;
    setPostedId(latest);
    setStep(5);
  };

  const steps = ["Job basics", "Compensation & details", "Requirements", "Screener questions", "Tier & payment"];
  const amount = TIER_INFO[tier].amount;

  return (
    <div className="container py-8">
      <PortalHeader role="employer" title="Post a new job" subtitle="Structured listing — better matches, fewer junk applications." />

      <div className="flex items-center gap-1 mb-8 overflow-x-auto">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center shrink-0">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${step >= i ? "bg-[#166534] text-white" : "bg-secondary text-muted-foreground"}`}>
              {i + 1}. {s}
            </div>
            {i < steps.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="grid lg:grid-cols-2 gap-4 max-w-3xl">
          <Field label="Job title *"><input value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Sales Executive — FMCG" className="input-std" /></Field>
          <Field label="Category *"><select value={form.category} onChange={e => set("category", e.target.value)} className="select-std"><option value="">Select...</option>{INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}</select></Field>
          <Field label="County *"><select value={form.county} onChange={e => set("county", e.target.value)} className="select-std"><option value="">Select...</option>{COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}</select></Field>
          <Field label="Work type"><select value={form.jobType} onChange={e => set("jobType", e.target.value)} className="select-std">{["Full-time", "Part-time", "Contract", "Internship", "Freelance"].map(o => <option key={o}>{o}</option>)}</select></Field>
          <Field label="Work mode"><select value={form.workMode} onChange={e => set("workMode", e.target.value)} className="select-std">{["On-site", "Remote", "Hybrid"].map(o => <option key={o}>{o}</option>)}</select></Field>
          <Field label="Experience level"><select value={form.experience} onChange={e => set("experience", e.target.value)} className="select-std">{["Entry-level", "Mid-level", "Senior", "Executive"].map(o => <option key={o}>{o}</option>)}</select></Field>
        </div>
      )}

      {step === 1 && (
        <div className="max-w-3xl space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Minimum monthly salary (KES)"><input type="number" value={form.minSalary} onChange={e => set("minSalary", e.target.value)} placeholder="e.g. 45000" className="input-std" /></Field>
            <Field label="Maximum monthly salary (KES)"><input type="number" value={form.maxSalary} onChange={e => set("maxSalary", e.target.value)} placeholder="e.g. 80000" className="input-std" /></Field>
          </div>
          <Field label="Job description *">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-muted-foreground">Write manually or let AI draft it for you</span>
              <button type="button" onClick={runAiAssistant} disabled={aiDrafting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#062a17] hover:bg-[#0a3a22] text-white text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                {aiDrafting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                {aiDrafting ? "Drafting…" : "Draft with AI"}
              </button>
            </div>
            <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={7} placeholder="Describe responsibilities, team, and growth path (min 50 characters)..." className="input-std" />
            <p className="text-[11px] text-muted-foreground mt-1">{form.description.length}/50 minimum · AI fills description, requirements, benefits and suggested salary from just the title</p>
          </Field>
          <Field label="Application deadline *"><input type="date" value={form.deadline} onChange={e => set("deadline", e.target.value)} className="input-std" /></Field>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-3xl">
          <Field label="Requirements *"><div className="space-y-2">
            {form.requirements.map((r, i) => (
              <div key={i} className="flex items-center gap-2 bg-secondary rounded-md pl-3 pr-1 py-1.5 text-sm">
                <span className="flex-1">{r}</span>
                <button onClick={() => set("requirements", form.requirements.filter((_, j) => j !== i))} className="p-1 text-muted-foreground hover:text-[#b91c1c]"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
            <div className="flex gap-2">
              <input value={form.newReq} onChange={e => set("newReq", e.target.value)} placeholder="e.g. 3+ years in B2B sales" className="input-std"
                onKeyDown={e => e.key === "Enter" && addReq()} />
              <button onClick={addReq} className="btn-press px-4 rounded-md bg-[#166534] text-white text-sm font-semibold"><Plus className="h-4 w-4" /></button>
            </div>
          </div></Field>
          <Field label="Benefits (optional)"><div className="space-y-2">
            {form.benefits.map((b, i) => (
              <div key={i} className="flex items-center gap-2 bg-secondary rounded-md pl-3 pr-1 py-1.5 text-sm">
                <span className="flex-1">{b}</span>
                <button onClick={() => set("benefits", form.benefits.filter((_, j) => j !== i))} className="p-1 text-muted-foreground hover:text-[#b91c1c]"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
            <div className="flex gap-2">
              <input value={form.newBen} onChange={e => set("newBen", e.target.value)} placeholder="e.g. Medical cover" className="input-std"
                onKeyDown={e => e.key === "Enter" && addBen()} />
              <button onClick={addBen} className="btn-press px-4 rounded-md bg-[#166534] text-white text-sm font-semibold"><Plus className="h-4 w-4" /></button>
            </div>
          </div></Field>
        </div>
      )}

      {step === 3 && (
        <div className="max-w-3xl">
          <p className="text-sm text-muted-foreground mb-4">Screening questions auto-filter applicants. Add up to 4.</p>
          <div className="space-y-2 mb-4">
            {form.screeners.map((s, i) => (
              <div key={i} className="flex items-center gap-2 bg-secondary rounded-md p-3">
                <span className="flex-1 text-sm">Q{i + 1}. {s.q} <span className="text-xs text-muted-foreground">({s.type})</span></span>
                <button onClick={() => set("screeners", form.screeners.filter((_, j) => j !== i))} className="p-1 text-muted-foreground hover:text-[#b91c1c]"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
          {form.screeners.length < 4 && (
            <div className="border border-border rounded-md p-4 space-y-3">
              <input value={form.newQ} onChange={e => set("newQ", e.target.value)} placeholder="e.g. Do you have a valid driving licence?" className="input-std" />
              <div className="flex gap-2 items-center flex-wrap">
                <select value={form.newQType} onChange={e => set("newQType", e.target.value as "yesno" | "mcq" | "text")} className="select-std">
                  <option value="yesno">Yes / No</option>
                  <option value="mcq">Multiple choice</option>
                  <option value="text">Short answer</option>
                </select>
                {form.newQType === "mcq" && <input value={form.newOpt} onChange={e => set("newOpt", e.target.value)} placeholder="Option A|Option B|Option C" className="input-std flex-1" />}
                <button onClick={addScreener} className="btn-press px-4 rounded-md bg-[#166534] text-white text-sm font-semibold flex items-center gap-1"><Plus className="h-4 w-4" /> Add</button>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="max-w-3xl">
          <div className="grid md:grid-cols-3 gap-3 mb-4">
            {Object.entries(TIER_INFO).map(([key, t]) => (
              <button key={key} onClick={() => setTier(key)}
                className={`rounded-lg border p-5 text-left transition-all ${tier === key ? "border-[#166534] shadow-md bg-[#e0f2e9]/50" : "border-border bg-card"}`}>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{key === "standard" ? "Most common" : key === "featured" ? "Best reach" : "Done for you"}</p>
                <p className="font-heading font-bold mt-1">{t.name}</p>
                <p className="font-mono-num font-bold text-lg text-[#166534] mt-2">{k(t.amount)}</p>
                <p className="text-xs text-muted-foreground mt-1.5">{t.blurb}</p>
              </button>
            ))}
          </div>
          <div className="bg-[#fefce8] border border-[#f0d98a] rounded-md p-4 text-sm">
            <p className="font-semibold text-[#8a6d00] flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> You can post now. Standard listings publish after quick KYC review (~2h); featured listings publish immediately after payment.</p>
          </div>
        </div>
      )}

      {step === 5 && postedId && (
        <div className="max-w-lg">
          <div className="bg-card rounded-lg border border-border p-6 text-center mb-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Amount due</p>
            <p className="font-mono-num font-bold text-3xl text-[#166534] mt-1">{k(amount)}</p>
            <p className="text-sm mt-1">{TIER_INFO[tier].name}</p>
          </div>
          <p className="text-sm font-semibold mb-3 flex items-center gap-1.5"><Smartphone className="h-4 w-4 text-[#166534]" /> M-Pesa STK Push</p>
          <div className="flex gap-2 mb-6">
            <input value={mpesaPhone} onChange={e => setMpesaPhone(e.target.value)} placeholder="254712345678" className="input-std" />
            <button onClick={() => finishPay("mpesa_stk")} disabled={paying} className="btn-press px-5 rounded-md bg-[#166534] text-white text-sm font-semibold disabled:opacity-50">
              {paying ? "Sending..." : "Send STK"}
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
            <span className="flex-1 h-px bg-border" /> or <span className="flex-1 h-px bg-border" />
          </div>
          <button onClick={() => finishPay("card")} disabled={paying} className="btn-press w-full py-3 rounded-md border border-border text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-muted">
            <CreditCard className="h-4 w-4" /> Pay by card
          </button>
          <p className="text-[11px] text-muted-foreground text-center mt-4">Payments processed via Safaricom Paybill / card gateway. VAT invoice issued automatically.</p>
        </div>
      )}

      {step < 5 && (
        <div className="max-w-3xl flex justify-between mt-8 pt-5 border-t border-border">
          <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
            className="btn-press px-5 py-2.5 rounded-md border border-border text-sm font-semibold flex items-center gap-1.5 disabled:opacity-40 hover:bg-muted">
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          {step < 4 ? (
            <button onClick={() => setStep(step + 1)} className="btn-press px-6 py-2.5 rounded-md bg-[#166534] hover:bg-[#14532d] text-white text-sm font-semibold flex items-center gap-1.5">
              Continue <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={goPay} className="btn-press px-6 py-2.5 rounded-md bg-[#166534] hover:bg-[#14532d] text-white text-sm font-semibold flex items-center gap-1.5">
              <Check className="h-4 w-4" /> Review & pay {k(amount)}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">{label}</label>{children}</div>;
}

function usePlatformSnapshot() {
  /* placeholder — actual id comes from postJob timing below */
  return { postedId: `pj-${Date.now()}` };
}
