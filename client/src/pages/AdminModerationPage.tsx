/* TalentKenya Admin Moderation — job listing approval queue. */
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { usePlatform } from "@/lib/platform";
import { PortalHeader } from "@/components/Layout";

export default function AdminModerationPage() {
  const { moderationQueue, approveModeration, rejectModeration } = usePlatform();

  return (
    <>
      <PortalHeader role="admin" title="Job moderation" subtitle="Every listing is reviewed for authenticity, salary realism, and policy compliance." />

      {moderationQueue.length === 0 ? (
        <div className="bg-card rounded-lg border border-border p-12 text-center text-muted-foreground text-sm">Queue empty. New listings appear here automatically.</div>
      ) : (
        <div className="space-y-3">
          {moderationQueue.map(m => (
            <div key={m.id} className="bg-card rounded-lg border border-border p-5 flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <p className="font-heading font-bold">{m.title}</p>
                <p className="text-xs text-muted-foreground mt-1">by {m.company}</p>
              </div>
              <span className={`text-[11px] font-semibold uppercase px-2.5 py-1 rounded-full ${m.status === "approved" ? "bg-[#e0f2e9] text-[#14532d]" : m.status === "flagged" ? "bg-[#fde8e7] text-[#b91c1c]" : "bg-[#fef3c7] text-[#8a6d00]"}`}>
                {m.status === "approved" ? "Live" : m.status === "flagged" ? "Flagged" : "Pending"}
              </span>
              {m.status === "pending" && (
                <div className="flex gap-2">
                  <button onClick={() => { approveModeration(m.id); toast.success(`"${m.title}" approved and live`); }}
                    className="btn-press px-4 py-2 rounded-md bg-[#166534] text-white text-xs font-semibold flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button onClick={() => { rejectModeration(m.id); toast.error(`"${m.title}" rejected`); }}
                    className="btn-press px-4 py-2 rounded-md border border-[#f9b0ad] text-[#b91c1c] text-xs font-semibold flex items-center gap-1.5">
                    <X className="h-3.5 w-3.5" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
