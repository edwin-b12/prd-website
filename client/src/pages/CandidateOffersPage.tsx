/* TalentKenya Candidate Offers — view offer letters, accept, or negotiate with
   counter terms (salary, start date, terms, note). Style: brand green #166534,
   amber #ca8a04 for pending, red #b91c1c decline; classes input-std, select-std, btn-press. */
import { useState } from "react";
import { Link } from "wouter";
import { FileText, CalendarClock, BadgeDollarSign, ShieldCheck, AlertCircle, Check, X } from "lucide-react";
import { toast } from "sonner";
import { usePlatform, type Offer } from "@/lib/platform";
import { PortalHeader } from "@/components/Layout";
import { generateOfferLetterPdf } from "@/lib/offerLetterPdf";
import { FileDown } from "lucide-react";

const STATUS_META: Record<Offer["status"], { label: string; cls: string }> = {
  sent: { label: "Offer sent", cls: "bg-[#fef9ec] text-[#b45309] border-[#eab308]/60" },
  accepted: { label: "Accepted — awaiting employer", cls: "bg-[#f0fdf4] text-[#14532d] border-[#86efac]" },
  negotiating: { label: "Counter sent", cls: "bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]" },
  finalized: { label: "Offer finalized", cls: "bg-[#f0fdf4] text-[#14532d] border-[#166534]" },
};

function fmtKES(n: number) { return `KES ${n.toLocaleString()}`; }

export default function CandidateOffersPage() {
  const { offers, acceptOffer, negotiateOffer, finalizeOffer, profile } = usePlatform();
  const candidateName = `${profile.firstName || "Candidate"} ${profile.lastName || ""}`.trim() || "Candidate";
  const [counterFor, setCounterFor] = useState<string | null>(null);
  const [counter, setCounter] = useState({ amount: "", start: "", terms: "", note: "" });

  const active = offers.filter(o => o.status !== "finalized");
  const history = offers.filter(o => o.status === "finalized");

  const sendCounter = (o: Offer) => {
    if (!counter.amount || Number(counter.amount) <= 0) return toast.error("Enter your proposed salary");
    negotiateOffer(o.id, {
      amount: Number(counter.amount),
      start: counter.start || o.start,
      terms: counter.terms || o.terms,
      note: counter.note,
    });
    toast.success("Counter-offer sent", { description: "The employer will review your proposed terms." });
    setCounterFor(null); setCounter({ amount: "", start: "", terms: "", note: "" });
  };

  return (
    <>
      <PortalHeader role="candidate" title="My offers" subtitle="Offer letters you've received can be accepted or negotiated here."
        action={<Link href="/candidate/dashboard" className="btn-press px-4 py-2 rounded-md border border-border text-sm font-semibold">Dashboard</Link>} />

      <div className="container pb-10">
        {active.length === 0 && (
          <div className="bg-card rounded-lg border border-dashed border-border p-10 text-center">
            <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="font-semibold mb-1">No active offers yet</p>
            <p className="text-sm text-muted-foreground mb-4">When an employer sends you an offer, it appears here so you can accept or negotiate terms.</p>
            <Link href="/jobs" className="btn-press px-5 py-2.5 rounded-md bg-[#166534] text-white text-sm font-semibold inline-flex items-center gap-1.5">Browse jobs</Link>
          </div>
        )}

        <div className="space-y-4 mb-8">
          {active.map(o => {
            const meta = STATUS_META[o.status];
            return (
              <div key={o.id} className="bg-card rounded-lg border border-border p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-heading font-bold">{o.title}</p>
                    <p className="text-sm text-muted-foreground">{o.company} · sent {o.createdAt}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${meta.cls}`}>{meta.label}</span>
                  <button onClick={() => { generateOfferLetterPdf(o, candidateName); toast.success("Offer letter PDF downloaded", { description: "A formatted PDF version of your offer letter is ready for your records." }); }}
                    className="btn-press px-3 py-1.5 rounded-md border border-border text-[11px] font-semibold flex items-center gap-1 text-muted-foreground hover:text-[#166534]">
                    <FileDown className="h-3.5 w-3.5" /> Download PDF
                  </button>
                </div>
                <div className="grid sm:grid-cols-4 gap-3 mt-4">
                  <div className="bg-secondary/60 rounded-md p-3">
                    <p className="flex items-center gap-1 text-[10px] uppercase font-semibold text-muted-foreground tracking-wide"><BadgeDollarSign className="h-3 w-3" /> Monthly salary</p>
                    <p className="font-mono-num font-bold mt-1">{fmtKES(o.amount)}</p>
                  </div>
                  <div className="bg-secondary/60 rounded-md p-3">
                    <p className="flex items-center gap-1 text-[10px] uppercase font-semibold text-muted-foreground tracking-wide"><CalendarClock className="h-3 w-3" /> Start date</p>
                    <p className="font-mono-num font-bold mt-1">{o.start}</p>
                  </div>
                  <div className="bg-secondary/60 rounded-md p-3">
                    <p className="flex items-center gap-1 text-[10px] uppercase font-semibold text-muted-foreground tracking-wide"><ShieldCheck className="h-3 w-3" /> Probation</p>
                    <p className="font-mono-num font-bold mt-1">{o.probationMonths === "0" ? "None" : `${o.probationMonths} months`}</p>
                  </div>
                  <div className="bg-secondary/60 rounded-md p-3">
                    <p className="flex items-center gap-1 text-[10px] uppercase font-semibold text-muted-foreground tracking-wide"><FileText className="h-3 w-3" /> Benefits</p>
                    <p className="text-xs mt-1">{o.terms || "—"}</p>
                  </div>
                </div>

                {o.counter && (
                  <div className={`mt-4 rounded-md border p-3 text-sm ${o.counterResponse === "accepted" ? "bg-[#f0fdf4] border-[#86efac]" : o.counterResponse === "declined" ? "bg-[#fef2f2] border-[#fecaca]" : "bg-[#eff6ff] border-[#bfdbfe]"}`}>
                    <p className="font-semibold flex items-center gap-1.5">
                      {o.counterResponse === "accepted" ? <Check className="h-3.5 w-3.5 text-[#14532d]" /> : o.counterResponse === "declined" ? <X className="h-3.5 w-3.5 text-[#b91c1c]" /> : <AlertCircle className="h-3.5 w-3.5 text-[#1d4ed8]" />}
                      Your counter: {fmtKES(o.counter.amount)} per month, starting {o.counter.start}
                    </p>
                    {o.counter.note && <p className="text-xs text-muted-foreground mt-1">“{o.counter.note}”</p>}
                    {o.counterResponse === "declined" && <p className="text-xs font-semibold text-[#b91c1c] mt-1">The employer declined your counter — the original offer stands.</p>}
                  </div>
                )}

                {o.status === "sent" && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    <button onClick={() => { acceptOffer(o.id); toast.success("Offer accepted — congratulations!", { description: `${o.company} has been notified. Your contract terms are being prepared.` }); }}
                      className="btn-press px-5 py-2.5 rounded-md bg-[#166534] text-white text-sm font-semibold flex items-center gap-1.5">
                      <Check className="h-4 w-4" /> Accept offer
                    </button>
                    <button onClick={() => { setCounterFor(o.id); setCounter({ amount: String(Math.round(o.amount * 1.1)), start: o.start, terms: o.terms, note: "" }); }}
                      className="btn-press px-5 py-2.5 rounded-md border border-[#ca8a04] text-[#b45309] text-sm font-semibold">Negotiate</button>
                  </div>
                )}

                {counterFor === o.id && (
                  <div className="mt-4 border border-[#eab308] rounded-md p-4 bg-[#fffdf5]">
                    <p className="text-sm font-semibold mb-3 flex items-center gap-1.5"><BadgeDollarSign className="h-4 w-4 text-[#b45309]" /> Your proposed terms</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Counter salary (KES/month)</label>
                        <input value={counter.amount} onChange={e => setCounter({ ...counter, amount: e.target.value.replace(/[^0-9]/g, "") })} className="mt-1.5 w-full input-std" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Start date</label>
                        <input type="date" min={new Date().toISOString().slice(0, 10)} value={counter.start} onChange={e => setCounter({ ...counter, start: e.target.value })} className="mt-1.5 w-full input-std" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Adjusted benefits / terms</label>
                      <input value={counter.terms} onChange={e => setCounter({ ...counter, terms: e.target.value })} placeholder="e.g. Additional leave days, remote flexibility" className="mt-1.5 w-full input-std" />
                    </div>
                    <div className="mt-3">
                      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Note to employer</label>
                      <textarea value={counter.note} onChange={e => setCounter({ ...counter, note: e.target.value })} rows={2} placeholder="Explain your reasoning…" className="mt-1.5 w-full input-std" />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => sendCounter(o)} className="btn-press px-5 py-2.5 rounded-md bg-[#166534] text-white text-sm font-semibold">Send counter-offer</button>
                      <button onClick={() => setCounterFor(null)} className="btn-press px-5 py-2.5 rounded-md border border-border text-sm font-semibold">Cancel</button>
                    </div>
                  </div>
                )}

                {o.status === "accepted" && (
                  <div className="mt-4 rounded-md border border-[#86efac] bg-[#f0fdf4] p-3 text-sm">
                    <p className="font-semibold text-[#14532d] flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> You've accepted this offer</p>
                    <p className="text-xs text-muted-foreground mt-1">Confirm with the employer to lock your terms — you'll be moved to Hired and the role closes.</p>
                    <button onClick={() => { finalizeOffer(o.id); toast.success("Hired — terms confirmed!", { description: "You've been moved to the Hired stage and the position is now filled." }); }}
                      className="btn-press mt-2 px-4 py-2 rounded-md bg-[#166534] text-white text-xs font-semibold">Confirm hire</button>
                  </div>
                )}

                {o.status === "negotiating" && o.counterResponse === "accepted" && (
                  <div className="mt-4 rounded-md border border-[#86efac] bg-[#f0fdf4] p-3 text-sm">
                    <p className="font-semibold text-[#14532d] flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Employer accepted your counter of {fmtKES(o.counter!.amount)}</p>
                    <p className="text-xs text-muted-foreground mt-1">Confirm to lock in your negotiated terms and finalize the hiring.</p>
                    <button onClick={() => { finalizeOffer(o.id); toast.success("Hired — counter accepted!", { description: "Your terms are locked in and the position is now filled." }); }}
                      className="btn-press mt-2 px-4 py-2 rounded-md bg-[#166534] text-white text-xs font-semibold">Confirm hire</button>
                  </div>
                )}

                {o.status === "negotiating" && !o.counterResponse && (
                  <p className="text-xs text-muted-foreground mt-4">Your counter is with the employer. You'll be notified once they respond.</p>
                )}
              </div>
            );
          })}
        </div>

        {history.length > 0 && (
          <div>
            <h2 className="font-heading font-bold mb-3">Finalized offers</h2>
            <div className="space-y-3">
              {history.map(o => (
                <div key={o.id} className="bg-card rounded-lg border border-border p-4 flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-semibold text-sm">{o.title} — {o.company}</p>
                    <p className="text-xs text-muted-foreground">{fmtKES(o.amount)}/month · from {o.start}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-[#f0fdf4] text-[#14532d] border-[#166534]">Finalized</span>
                  <button onClick={() => { generateOfferLetterPdf(o, candidateName); toast.success("Offer letter PDF downloaded", { description: "A formatted PDF version of your offer letter is ready for your records." }); }}
                    className="btn-press px-3 py-1.5 rounded-md border border-border text-[11px] font-semibold flex items-center gap-1 text-muted-foreground hover:text-[#166534]">
                    <FileDown className="h-3.5 w-3.5" /> Download PDF
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
