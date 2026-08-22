/* TalentKenya Employer Company Profile — KYC document checklist with upload
   simulation and verified badge. Company details persisted in localStorage. */
import { useState } from "react";
import { Upload, ShieldCheck, ShieldAlert, FileText } from "lucide-react";
import { toast } from "sonner";
import { usePlatform } from "@/lib/platform";
import { PortalHeader } from "@/components/Layout";

const DOCS = ["Pamoja Media Network", "KRA PIN certificate", "Certificate of incorporation"];

const LS_KEY = "tk-company-profile";
interface CompanyProfile { name: string; industry: string; kraPin: string; regNumber: string }
const load = (): CompanyProfile => {
  try { return { name: "Pamoja Media Network", industry: "Media & Communications", kraPin: "P059012345I", regNumber: "PVT-I4S1W6", ...JSON.parse(localStorage.getItem(LS_KEY) || "{}") }; }
  catch { return { name: "", industry: "", kraPin: "", regNumber: "" }; }
};

export default function EmployerCompanyPage() {
  const { verifications } = usePlatform();
  const [cp, setCp] = useState<CompanyProfile>(load);
  const [uploads, setUploads] = useState<boolean[]>([false, false, false]);

  const save = (patch: Partial<CompanyProfile>) => {
    const next = { ...cp, ...patch };
    setCp(next);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  };

  const pending = verifications.filter(v => v.status === "pending").length;
  const done = DOCS.length - pending;

  const upload = (i: number) => {
    setUploads(u => u.map((x, j) => j === i ? true : x));
    toast.success(`"${DOCS[i]}" uploaded for review`, { description: "The verification team will review within 1 business day." });
  };

  return (
    <>
      <PortalHeader role="employer" title="Company profile & KYC" subtitle="Verification unlocks hiring tools and lets your listings go live faster." />

      <div className={`rounded-lg border p-5 mb-6 flex items-start gap-3 ${pending === 0 ? "bg-[#e0f2e9] border-[#86efac]" : "bg-[#fefce8] border-[#f0d98a]"}`}>
        {pending === 0 ? <ShieldCheck className="h-5 w-5 text-[#14532d] shrink-0 mt-0.5" /> : <ShieldAlert className="h-5 w-5 text-[#8a6d00] shrink-0 mt-0.5" />}
        <div className="text-sm">
          <p className="font-semibold">{pending === 0 ? "Your company is fully verified" : `${done}/${DOCS.length} documents submitted — ${pending} under review`}</p>
          <p className="text-muted-foreground mt-0.5">KYC review completes within 1 business day. Standard listings publish as soon as verification passes.</p>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-6 mb-6">
        <h2 className="font-heading font-bold mb-4 flex items-center gap-2"><FileText className="h-4 w-4" /> Business details</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Company name</label>
            <input value={cp.name} onChange={e => save({ name: e.target.value })} placeholder="Registered company name" className="input-std" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Industry</label>
            <input value={cp.industry} onChange={e => save({ industry: e.target.value })} placeholder="e.g. Fintech" className="input-std" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">KRA PIN</label>
            <input value={cp.kraPin} onChange={e => save({ kraPin: e.target.value })} placeholder="P051234567X" className="input-std" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Registration number</label>
            <input value={cp.regNumber} onChange={e => save({ regNumber: e.target.value })} placeholder="PVT-XYZ-2023" className="input-std" />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="font-heading font-bold mb-4">Document uploads</h2>
        <div className="space-y-3">
          {DOCS.map((d, i) => {
            const v = verifications[i];
            if (v?.status === "approved") {
              return (
                <div key={d} className="flex items-center gap-4 border border-border rounded-md p-4">
                  <div className="flex-1 min-w-[200px]">
                    <p className="text-sm font-semibold">{d}</p>
                    <p className="text-xs text-muted-foreground">{v.kraPin || v.regNumber}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#14532d] bg-[#e0f2e9] rounded-full px-3 py-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" /> Verified
                  </span>
                </div>
              );
            }
            if (v?.status === "pending" && i === 0) {
              return (
                <div key={d} className="flex items-center gap-4 border border-border rounded-md p-4">
                  <div className="flex-1 min-w-[200px]">
                    <p className="text-sm font-semibold">{d}</p>
                    <p className="text-xs text-muted-foreground">Submitted — awaiting review</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8a6d00] bg-[#fef3c7] rounded-full px-3 py-1.5">Under review</span>
                </div>
              );
            }
            return (
              <div key={d} className="flex items-center gap-4 border border-border rounded-md p-4">
                <div className="flex-1 min-w-[200px]">
                  <p className="text-sm font-semibold">{d}</p>
                  <p className="text-xs text-muted-foreground">{uploads[i] ? "Uploaded, awaiting review" : "PDF or JPG, max 5MB"}</p>
                </div>
                {uploads[i] ? (
                  <span className="text-xs font-semibold text-[#8a6d00] bg-[#fef3c7] rounded-full px-3 py-1.5">Under review</span>
                ) : (
                  <button onClick={() => upload(i)} className="btn-press px-4 py-2 rounded-md border border-border text-xs font-semibold flex items-center gap-1.5 hover:bg-muted">
                    <Upload className="h-3.5 w-3.5" /> Upload
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
