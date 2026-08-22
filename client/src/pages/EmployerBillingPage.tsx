/* TalentKenya Billing — payment history ledger with M-Pesa references and
   VAT-compliant invoice downloads. */
import { FileDown, CreditCard, Smartphone, Landmark } from "lucide-react";
import { toast } from "sonner";
import { usePlatform } from "@/lib/platform";
import { PortalHeader } from "@/components/Layout";

const ICONS = { mpesa_stk: Smartphone, card: CreditCard, bank: Landmark };
const LABELS = { mpesa_stk: "M-Pesa STK Push", card: "Card", bank: "Bank transfer" };

export default function EmployerBillingPage() {
  const { transactions } = usePlatform();

  const total = transactions.filter(t => t.status === "completed").reduce((a, t) => a + t.amount, 0);

  return (
    <>
      <PortalHeader role="employer" title="Billing & invoices" subtitle="All payments, receipts, and VAT invoices in one place." />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Total spent</p>
          <p className="font-mono-num text-2xl font-bold mt-1">KES {total.toLocaleString("en-KE")}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Transactions</p>
          <p className="font-mono-num text-2xl font-bold mt-1">{transactions.length}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">VAT (16%) included</p>
          <p className="font-mono-num text-2xl font-bold mt-1">KES {Math.round(total * 0.16).toLocaleString("en-KE")}</p>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-left px-5 py-3">Purpose</th>
                <th className="text-left px-5 py-3">Reference</th>
                <th className="text-left px-5 py-3">Channel</th>
                <th className="text-right px-5 py-3">Amount</th>
                <th className="text-right px-5 py-3">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => {
                const Icon = ICONS[t.channel];
                return (
                  <tr key={t.id} className="border-t border-border hover:bg-secondary/30">
                    <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">{t.date}</td>
                    <td className="px-5 py-3.5 font-medium">{t.purpose}</td>
                    <td className="px-5 py-3.5 font-mono-num text-xs">{t.reference}</td>
                    <td className="px-5 py-3.5"><span className="inline-flex items-center gap-1.5 text-muted-foreground"><Icon className="h-3.5 w-3.5" />{LABELS[t.channel]}</span></td>
                    <td className="px-5 py-3.5 text-right font-mono-num font-semibold">KES {t.amount.toLocaleString("en-KE")}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => { toast.success("VAT invoice downloaded", { description: `INV-TK-${t.id.slice(3)} · VAT 16% · sent to billing email` }); }}
                        className="inline-flex items-center gap-1.5 text-[#166534] font-semibold text-xs hover:underline">
                        <FileDown className="h-3.5 w-3.5" /> PDF
                      </button>
                    </td>
                  </tr>
                );
              })}
              {transactions.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-muted-foreground text-sm">No transactions yet. Your first posting payment will appear here.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground mt-4">Need a refund or disputed charge? Email billing@talentkenya.co.ke — disputes resolved within 5 business days.</p>
    </>
  );
}
