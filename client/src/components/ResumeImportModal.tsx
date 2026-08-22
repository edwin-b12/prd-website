/* TalentKenya AI Resume Import — upload CV (PDF/TXT), extract with the AI
   parser (deterministic fallback), preview extracted fields, accept to fill
   the candidate profile. Design: Professional Meridian (ideas.md). */
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FileText, Sparkles, Upload, Loader2, CheckCircle2, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";
import { extractResume, pdfToText, type ParsedResume } from "@/lib/resumeParser";
import { usePlatform } from "@/lib/platform";

function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsText(file);
  });
}

export default function ResumeImportModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: (engine: "ai" | "deterministic") => void }) {
  const { updateProfile } = usePlatform();
  const [step, setStep] = useState<"upload" | "parsing" | "preview">("upload");
  const [parsed, setParsed] = useState<ParsedResume | null>(null);
  const [engine, setEngine] = useState<"ai" | "deterministic">("deterministic");
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [fieldEdits, setFieldEdits] = useState<Record<string, string>>({});

  const reset = () => { setStep("upload"); setParsed(null); setError(null); setFieldEdits({}); };

  const handleFile = async (file: File) => {
    setError(null);
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const isText = isPdf || /\.(txt|doc|docx|md)$/i.test(file.name);
    if (!isText) { setError("Please upload a PDF or text file (.txt)."); return; }
    setStep("parsing");
    try {
      let text = "";
      if (isPdf) {
        try {
          text = await pdfToText(file);
        } catch {
          setError("Could not read this PDF (it may be scanned as an image). Try a text-based PDF or paste the CV text instead.");
          setStep("upload");
          return;
        }
      } else {
        text = await readTextFile(file);
      }
      if (!text.trim()) { setError("The file appears to be empty."); setStep("upload"); return; }
      const result = await extractResume(text);
      setEngine(result.__engine ?? "deterministic");
      setParsed(result);
      setStep("preview");
    } catch {
      setError("Something went wrong while processing your CV. Please try again.");
      setStep("upload");
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
      linkedin: fieldEdits.linkedin ?? parsed.linkedin,
      experience: parsed.experience,
      education: parsed.education,
      skills: parsed.skills,
    });
    toast.success(engine === "ai" ? "CV imported with AI — profile updated" : "CV imported — profile updated");
    onDone(engine);
    reset();
    onClose();
  };

  const setField = (k: string, v: string) => setFieldEdits(p => ({ ...p, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) { onClose(); reset(); } }}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogTitle className="font-heading text-xl">Import from CV</DialogTitle>
        <DialogDescription>
          {step === "preview"
            ? "Review the extracted details, correct anything, then save to your profile."
            : "Upload your CV and our AI will extract your details, experience, education and skills automatically."}
        </DialogDescription>

        {step === "upload" && (
          <div className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragging ? "border-[#166534] bg-[#e0f2e9]" : "border-border hover:border-[#166534]"}`}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}>
              <Upload className="h-8 w-8 mx-auto mb-3 text-[#166534]" />
              <p className="font-semibold mb-1">Drop your CV here</p>
              <p className="text-sm text-muted-foreground mb-3">PDF or text (.txt) · max 5 pages recommended</p>
              <button onClick={() => inputRef.current?.click()} className="btn-press px-4 py-2 rounded-md bg-[#166534] text-white text-sm font-semibold">
                Choose file
              </button>
              <input ref={inputRef} type="file" accept=".pdf,.txt,.md,.doc,.docx" className="hidden"
                onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value = ""; }} />
            </div>
            {error && (
              <div className="flex items-start gap-2 text-sm text-[#b91c1c] bg-[#fdecea] border border-[#f5c6cb] rounded-md p-3">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" /> {error}
              </div>
            )}
          </div>
        )}

        {step === "parsing" && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#166534] mb-3" />
            <p className="font-semibold mb-1">Reading your CV…</p>
            <p className="text-sm text-muted-foreground">Extracting your details, experience, education and skills.</p>
          </div>
        )}

        {step === "preview" && parsed && (
          <div className="space-y-4">
            <div className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold ${engine === "ai" ? "bg-[#e0f2e9] text-[#14532d]" : "bg-amber-50 text-amber-800"}`}>
              {engine === "ai" ? <Sparkles className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
              {engine === "ai" ? "Extracted by AI" : "Extracted by offline parser (AI enrichment unavailable)"}
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="First name" value={fieldEdits.firstName ?? parsed.firstName} onChange={v => setField("firstName", v)} />
              <Field label="Last name" value={fieldEdits.lastName ?? parsed.lastName} onChange={v => setField("lastName", v)} />
              <Field label="Professional title" value={fieldEdits.title ?? parsed.title} onChange={v => setField("title", v)} span />
              <Field label="Phone" value={fieldEdits.phone ?? parsed.phone} onChange={v => setField("phone", v)} placeholder="e.g. 254712345678" />
              <Field label="Email" value={fieldEdits.email ?? parsed.email} onChange={v => setField("email", v)} />
              <Field label="LinkedIn" value={fieldEdits.linkedin ?? parsed.linkedin} onChange={v => setField("linkedin", v)} span />
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
                )) : <p className="text-sm text-muted-foreground">No experience detected.</p>}
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
                )) : <p className="text-sm text-muted-foreground">No education detected.</p>}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold mb-2">Skills ({parsed.skills.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {parsed.skills.length ? parsed.skills.map(s => (
                  <span key={s} className="inline-flex items-center gap-1 bg-[#e0f2e9] text-[#14532d] rounded-full px-2.5 py-1 text-xs font-semibold">
                    {s}
                  </span>
                )) : <p className="text-sm text-muted-foreground">No skills detected.</p>}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          {step === "preview" && (
            <button onClick={() => { reset(); }} className="btn-press px-4 py-2 rounded-md border border-border text-sm font-semibold flex items-center gap-1.5 hover:bg-muted">
              <X className="h-4 w-4" /> Discard
            </button>
          )}
          {step === "preview" && (
            <button onClick={apply} className="btn-press px-5 py-2 rounded-md bg-[#166534] hover:bg-[#14532d] text-white text-sm font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Save to profile
            </button>
          )}
          {step === "upload" && (
            <button onClick={() => { onClose(); reset(); }} className="btn-press px-4 py-2 rounded-md border border-border text-sm font-semibold hover:bg-muted">Cancel</button>
          )}
        </div>
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
