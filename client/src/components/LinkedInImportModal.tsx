/* TalentKenya LinkedIn Profile Import — guided import where candidates paste
   their LinkedIn public URL and profile summary. Since LinkedIn blocks direct
   scraping, we extract from the pasted About/Experience summary text using
   the same deterministic extractor used by the CV parser. */
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ExternalLink, Loader2, CheckCircle2, X, FileText } from "lucide-react";
import { toast } from "sonner";
import { extractResume, type ParsedResume } from "@/lib/resumeParser";
import { usePlatform } from "@/lib/platform";

export default function LinkedInImportModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const { updateProfile } = usePlatform();
  const [step, setStep] = useState<"paste" | "parsing" | "preview">("paste");
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [parsed, setParsed] = useState<ParsedResume | null>(null);
  const [fieldEdits, setFieldEdits] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const reset = () => { setStep("paste"); setUrl(""); setSummary(""); setParsed(null); setError(null); setFieldEdits({}); };

  const handleImport = async () => {
    setError(null);
    if (!summary.trim()) { setError("Please paste your LinkedIn profile summary so we can extract your details."); return; }
    setStep("parsing");
    try {
      const result = await extractResume(summary);
      setParsed(result);
      setStep("preview");
    } catch {
      setError("Could not extract your profile. Please check the text and try again.");
      setStep("paste");
    }
  };

  const apply = () => {
    if (!parsed) return;
    updateProfile({
      firstName: fieldEdits.firstName ?? parsed.firstName,
      lastName: fieldEdits.lastName ?? parsed.lastName,
      title: fieldEdits.title ?? parsed.title,
      phone: fieldEdits.phone ?? parsed.phone,
      email: fieldEdits.email ?? parsed.email,
      linkedin: url || fieldEdits.linkedin || parsed.linkedin,
      experience: parsed.experience,
      education: parsed.education,
      skills: parsed.skills,
    });
    toast.success("LinkedIn profile imported — check each section and save.");
    onDone();
    reset();
    onClose();
  };

  const setField = (k: string, v: string) => setFieldEdits(p => ({ ...p, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) { onClose(); reset(); } }}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogTitle className="font-heading text-xl">Import from LinkedIn</DialogTitle>
        <DialogDescription>
          {step === "preview"
            ? "Review the extracted details, correct anything, then save to your profile."
            : "Paste your LinkedIn URL and a short summary of your About & Experience sections. We'll auto-fill your profile."}
        </DialogDescription>

        {step === "paste" && (
          <div className="space-y-4">
            <div className="bg-[#e0f2e9] border border-[#a7d5b8] rounded-md p-3 text-xs">
              <p className="font-semibold mb-1">Why can't we read your profile directly?</p>
              <p className="text-muted-foreground">LinkedIn does not allow external tools to read profiles automatically. Instead, paste your public URL plus a summary of your About section and recent roles — we'll do the rest.</p>
            </div>
            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">LinkedIn URL (optional)</span>
              <div className="relative mt-1">
                <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://www.linkedin.com/in/your-name" className="input-std pl-9" />
              </div>
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Profile summary <span className="text-[#b91c1c]">*</span></span>
              <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={8}
                placeholder={`Paste your About section and a list of recent roles, e.g.\n\nDigital Marketing Specialist with 5 years in SEO and content strategy.\n\nWork Experience:\nDigital Marketing Manager, Safaricom PLC, 2021-Present\n- Grew organic traffic by 200%\nMarketing Officer, Kenya Airways, 2019-2021\n\nEducation: BSc Computer Science, JKUAT, 2018\n\nSkills: SEO, Google Analytics, Content Marketing, Social Media`}
                className="input-std" />
            </label>
            {error && (
              <div className="flex items-start gap-2 text-sm text-[#b91c1c] bg-[#fdecea] border border-[#f5c6cb] rounded-md p-3">
                <FileText className="h-4 w-4 shrink-0 mt-0.5" /> {error}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button onClick={() => { onClose(); reset(); }} className="btn-press px-4 py-2 rounded-md border border-border text-sm font-semibold hover:bg-muted">Cancel</button>
              <button onClick={handleImport} className="btn-press px-5 py-2 rounded-md bg-[#166534] hover:bg-[#14532d] text-white text-sm font-semibold flex items-center gap-1.5">
                <FileText className="h-4 w-4" /> Extract details
              </button>
            </div>
          </div>
        )}

        {step === "parsing" && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#166534] mb-3" />
            <p className="font-semibold mb-1">Reading your profile…</p>
            <p className="text-sm text-muted-foreground">Extracting your details, experience, education and skills.</p>
          </div>
        )}

        {step === "preview" && parsed && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold bg-[#e0f2e9] text-[#14532d]">
              <FileText className="h-3.5 w-3.5" /> Extracted from your LinkedIn summary
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="First name" value={fieldEdits.firstName ?? parsed.firstName} onChange={v => setField("firstName", v)} />
              <Field label="Last name" value={fieldEdits.lastName ?? parsed.lastName} onChange={v => setField("lastName", v)} />
              <Field label="Professional title" value={fieldEdits.title ?? parsed.title} onChange={v => setField("title", v)} span />
              <Field label="Phone" value={fieldEdits.phone ?? parsed.phone} onChange={v => setField("phone", v)} placeholder="e.g. 254712345678" />
              <Field label="Email" value={fieldEdits.email ?? parsed.email} onChange={v => setField("email", v)} />
              <Field label="LinkedIn" value={url || fieldEdits.linkedin || parsed.linkedin} onChange={v => setField("linkedin", v)} span />
            </div>

            <div>
              <p className="text-sm font-semibold mb-2">Experience ({parsed.experience.length})</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {parsed.experience.length ? parsed.experience.map((e, i) => (
                  <div key={i} className="border border-border rounded-md p-3 text-sm">
                    <p className="font-semibold">{e.role || "—"}</p>
                    <p className="text-muted-foreground">{[e.company, [e.start, e.end].filter(Boolean).join(" – ")].filter(Boolean).join(" · ") || "—"}</p>
                    {e.achievements && <p className="text-xs text-muted-foreground mt-1">{e.achievements}</p>}
                  </div>
                )) : <p className="text-sm text-muted-foreground">No experience detected — add it manually.</p>}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold mb-2">Education ({parsed.education.length})</p>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {parsed.education.length ? parsed.education.map((e, i) => (
                  <div key={i} className="border border-border rounded-md p-3 text-sm">
                    <p className="font-semibold">{e.institution || "—"}</p>
                    <p className="text-muted-foreground">{[e.degree, e.field, e.year].filter(Boolean).join(" · ") || "—"}</p>
                  </div>
                )) : <p className="text-sm text-muted-foreground">No education detected — add it manually.</p>}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold mb-2">Skills ({parsed.skills.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {parsed.skills.length ? parsed.skills.map(s => (
                  <span key={s} className="inline-flex items-center gap-1 bg-[#e0f2e9] text-[#14532d] rounded-full px-2.5 py-1 text-xs font-semibold">
                    {s}
                  </span>
                )) : <p className="text-sm text-muted-foreground">No skills detected — add them manually.</p>}
              </div>
            </div>
          </div>
        )}

        {step === "preview" && (
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => { reset(); }} className="btn-press px-4 py-2 rounded-md border border-border text-sm font-semibold flex items-center gap-1.5 hover:bg-muted">
              <X className="h-4 w-4" /> Discard
            </button>
            <button onClick={apply} className="btn-press px-5 py-2 rounded-md bg-[#166534] hover:bg-[#14532d] text-white text-sm font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Save to profile
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, onChange, placeholder, span }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; span?: boolean }) {
  return (
    <label className={`block ${span ? "sm:col-span-2" : ""}`}>
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="input-std mt-1" />
    </label>
  );
}
