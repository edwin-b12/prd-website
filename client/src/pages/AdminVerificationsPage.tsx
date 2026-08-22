/* TalentKenya Admin Verifications — KYC queue with approve/reject actions. */
import { ShieldCheck, ShieldX } from "lucide-react";
import { toast } from "sonner";
import { usePlatform } from "@/lib/platform";
import { PortalHeader } from "@/components/Layout";

export default function AdminVerificationsPage() {
  const { verifications, approveVerification, rejectVerification } = usePlatform();

  return (
    <>
      <PortalHeader role="admin" title="Employer verifications" subtitle="Review KYC documents before employers can post live listings." />

      <div className="space-y-3">
        {verifications.map(v => (
          <div key={v.id} className="bg-card rounded-lg border border-border p-5 flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <p className="font-heading font-bold">{v.company}</p>
              <p className="text-xs text-muted-foreground mt-1">KRA PIN: <span className="font-mono-num">{v.kraPin}</span> · Reg: <span className="font-mono-num">{v.regNumber}</span></p>
            </div>
            <span className={`text-[11px] font-semibold uppercase px-2.5 py-1 rounded-full ${v.status === "approved" ? "bg-[#e0f2e9] text-[#14532d]" : v.status === "rejected" ? "bg-[#fde8e7] text-[#b91c1c]" : "bg-[#fef3c7] text-[#8a6d00]"}`}>
              {v.status === "approved" ? "Verified" : v.status === "rejected" ? "Rejected" : "Pending"}
            </span>
            {v.status === "pending" && (
              <div className="flex gap-2">
                <button onClick={() => { approveVerification(v.id); toast.success(`${v.company} verified`, { description: "Their pending listings can now go live." }); }}
                  className="btn-press px-4 py-2 rounded-md bg-[#166534] text-white text-xs font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" /> Approve
                </button>
                <button onClick={() => { rejectVerification(v.id); toast.error(`${v.company} rejected`, { description: "Employer notified with rejection reasons." }); }}
                  className="btn-press px-4 py-2 rounded-md border border-[#f9b0ad] text-[#b91c1c] text-xs font-semibold flex items-center gap-1.5">
                  <ShieldX className="h-3.5 w-3.5" /> Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
