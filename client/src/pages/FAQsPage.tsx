/* TalentKenya FAQs — candidate and employer question banks. */
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { PublicLayout } from "@/components/Layout";

const CANDIDATE = [
  { q: "Is TalentKenya really free for job seekers?", a: "Yes. Creating an account, building your profile, applying, and receiving alerts costs nothing — ever. Employers pay for their listings and our services." },
  { q: "How does one-click apply work?", a: "Your profile stores your experience, skills and screener answers. When you click Apply, that structured data is sent instantly — no re-typing, no attachments lost." },
  { q: "Why do some jobs ask screening questions?", a: "Screeners help employers filter for must-have requirements (e.g. a valid driving licence). Honest answers get you shortlisted faster; false answers waste everyone's time." },
  { q: "How do I know a listing is real?", a: "Every employer passes KYC verification (KRA PIN + registration documents) before posting. Look for the verified-employer badge, and report anything suspicious through the listing page." },
  { q: "What happens to my personal data?", a: "It's protected under the Kenya Data Protection Act. Contact details are only visible to employers who explicitly unlock them, and you control this in your privacy settings." },
  { q: "Can I apply without uploading my CV?", a: "Yes — your profile IS your CV. If you prefer, you can still attach a PDF, but the structured profile is what generates match scores and 1-click applications." },
];
const EMPLOYER = [
  { q: "How do I pay for a job post?", a: "M-Pesa STK Push (Paybill), card, or bank transfer. M-Pesa completes in under 30 seconds and every payment generates a VAT invoice automatically." },
  { q: "What happens after I pay?", a: "Featured listings go live immediately. Standard listings publish after a quick KYC review — usually within 2 hours during business days." },
  { q: "How many applicants can I expect?", a: "It varies by role and salary realism, but structured listings with clear salary bands receive on average 24 applicants in the first 5 days." },
  { q: "Can I see who viewed my listing?", a: "Yes — employer analytics show views, apply conversion, and source breakdown (search vs. alert vs. category) for every active listing." },
  { q: "What is the refund policy?", a: "If we fail to deliver an agreed service (e.g. a headhunt without shortlisted candidates in 14 days), you get a full refund within 5 business days. Paid live listings are non-refundable but transferable." },
];

function Item({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-lg overflow-hidden mb-3 bg-card">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-4 p-4 text-left font-semibold text-sm hover:bg-secondary/50">
        {q}
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{a}</p>}
    </div>
  );
}

export default function FAQsPage() {
  return (
    <PublicLayout>
      <section className="container py-16">
        <p className="text-xs uppercase tracking-widest text-[#166534] font-semibold mb-3">Help centre</p>
        <h1 className="font-heading text-4xl font-bold">Frequently asked questions</h1>
        <div className="grid lg:grid-cols-2 gap-10 mt-10">
          <div>
            <h2 className="font-heading text-xl font-bold mb-4">For job seekers</h2>
            {CANDIDATE.map(x => <Item key={x.q} {...x} />)}
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold mb-4">For employers</h2>
            {EMPLOYER.map(x => <Item key={x.q} {...x} />)}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
