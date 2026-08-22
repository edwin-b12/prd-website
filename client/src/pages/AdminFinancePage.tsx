/* TalentKenya Admin Finance — transaction ledger with status badges and
   reconciliation actions. */
import { toast } from "sonner";
import { usePlatform } from "@/lib/platform";
import { PortalHeader } from "@/components/Layout";

const LABELS = { mpesa_stk: "M-Pesa", card: "Card", bank: "Bank" };

export default function AdminFinancePage() {
  const { transactions } = usePlatform();
  const total = transactions.filter(t => t.status === "completed").reduce((a, t) => a + t.amount, 0);

  return (
    <>
      <PortalHeader role="admin" title="Finance ledger" subtitle={`KES ${total.toLocaleString("en-KE")} collected (completed) · VAT 16% remittance due monthly`} />

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-left px-5 py-3">Employer</th>
                <th className="text-left px-5 py-3">Purpose</th>
                <th className="text-left px-5 py-3">Reference</th>
                <th className="text-left px-5 py-3">Channel</th>
                <th className="text-right px-5 py-3">Amount</th>
                <th className="text-right px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id} className="border-t border-border hover:bg-secondary/30">
                  <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">{t.date}</td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium">{t.company}</p>
                    <p className="text-xs text-muted-foreground">{t.employer}</p>
                  </td>
                  <td className="px-5 py-3.5">{t.purpose}</td>
                  <td className="px-5 py-3.5 font-mono-num text-xs">{t.reference}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{LABELS[t.channel]}</td>
                  <td className="px-5 py-3.5 text-right font-mono-num font-semibold">KES {t.amount.toLocaleString("en-KE")}</td>
                  <td className="px-5 py-3.5 text-right">
                    <span className={`text-[11px] font-semibold uppercase px-2.5 py-1 rounded-full ${t.status === "completed" ? "bg-[#e0f2e9] text-[#14532d]" : t.status === "pending" ? "bg-[#fef3c7] text-[#8a6d00]" : "bg-[#fde8e7] text-[#b91c1c]"}`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground mt-4">Reconciliation against the M-Pesa Paybill statement is performed daily. Discrepancies are escalated automatically.</p>
    </>
  );
}
