/* TalentKenya Employers — pricing & plans landing per PRD §US-4.2. */
import { Link } from "wouter";
import { Check, ShieldCheck, KanbanSquare, Users, PhoneCall, TrendingUp, BadgeCheck, Zap, FileDown } from "lucide-react";
import { PRICING, KES } from "@/lib/data";
import { Badge } from "@/components/primitives";
import { CANDIDATES_IMG } from "@/lib/brand";
import { PublicLayout } from "@/components/Layout";

export default function EmployersPage() {
  return (
    <PublicLayout>
    <>
      <section className="relative overflow-hidden bg-[#062a17] text-white">
        <img src={CANDIDATES_IMG} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#062a17] via-[#062a17]/85 to-transparent" />
        <div className="container relative py-16 md:py-20 grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
          <div>
            <Badge variant="verified"><ShieldCheck className="h-3 w-3" /> Verified talent pipeline</Badge>
            <h1 className="font-heading text-4xl md:text-5xl font-bold leading-[1.05] mt-4">
              Hire Kenya's best, <span className="text-[#7fe0a0]">without the noise</span>.
            </h1>
            <p className="text-white/70 mt-4 max-w-lg text-lg">
              Every candidate is real, reachable, and matched to your requirements. Pay per post in KES — no enterprise contracts, no monthly lock-ins.
            </p>
            <div className="flex flex-wrap gap-3 mt-7">
              <Link href="/employer/post-job" className="btn-press px-6 py-3 rounded-md bg-[#166534] hover:bg-[#14532d] text-white font-semibold text-sm">Post your first job</Link>
              <Link href="#pricing" className="btn-press px-6 py-3 rounded-md bg-white/10 backdrop-blur text-white font-semibold text-sm">See pricing</Link>
            </div>
          </div>
          <div className="hidden lg:grid grid-cols-2 gap-4">
            {[
              { icon: ShieldCheck, t: "Zero scam listings", d: "KYC on every employer before anything goes live" },
              { icon: KanbanSquare, t: "Built-in ATS", d: "Kanban pipeline, ratings and team notes included" },
              { icon: TrendingUp, t: "Match scoring", d: "Auto-score candidates against your requirements" },
              { icon: PhoneCall, t: "Pay via M-Pesa", d: "STK Push checkout, KES pricing, instant receipts" },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="bg-white/5 backdrop-blur border border-white/15 rounded-lg p-5">
                <Icon className="h-6 w-6 text-[#7fe0a0] mb-3" />
                <p className="font-semibold text-sm">{t}</p>
                <p className="text-xs text-white/60 mt-1">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-white">
        <div className="container py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { v: "15+", l: "Qualified applicants per vacancy in 7 days (target)" },
            { v: "92%", l: "M-Pesa payment success rate" },
            { v: "<5%", l: "Zero-result search rate target" },
            { v: "100%", l: "Verified employer gate on all listings" },
          ].map(({ v, l }) => (
            <div key={l}>
              <p className="font-mono-num font-bold text-2xl text-[#166534]">{v}</p>
              <p className="text-xs text-muted-foreground mt-1">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container py-14">
        <div className="text-center mb-10">
          <h2 className="font-heading text-3xl font-bold">Simple pricing, in shillings</h2>
          <p className="text-muted-foreground text-sm mt-2">One-time payments via M-Pesa STK Push or card. Receipts VAT-compliant.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
          {PRICING.map(p => (
            <div key={p.name} className={`rounded-lg border p-6 flex flex-col ${p.highlight ? "border-[#166534] shadow-lg relative bg-card" : "border-border bg-card"}`}>
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#166534] text-white text-[11px] font-semibold px-3 py-1 uppercase tracking-wide">Most popular</span>
              )}
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">{p.target}</p>
              <h3 className="font-heading font-bold text-lg mt-1">{p.name}</h3>
              <p className="mt-3">
                {p.price !== null ? (
                  <span className="font-mono-num font-bold text-3xl">{KES(p.price)}</span>
                ) : (
                  <span className="font-heading font-bold text-2xl">Custom quote</span>
                )}
                <span className="text-xs text-muted-foreground"> / {p.duration}</span>
              </p>
              <ul className="mt-5 space-y-2.5 flex-1">
                {p.features.map(f => (
                  <li key={f} className="flex gap-2 text-sm text-foreground/80">
                    <Check className="h-4 w-4 text-[#166534] shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/employer/post-job"
                className={`btn-press mt-6 w-full py-2.5 rounded-md text-center text-sm font-semibold ${p.highlight ? "bg-[#166534] text-white hover:bg-[#14532d]" : "border border-border hover:bg-muted"}`}>
                {p.name === "Executive Headhunt" ? "Request a quote" : p.price !== null ? "Get started" : "Contact sales"}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="bg-secondary/60">
        <div className="container py-14">
          <h2 className="font-heading text-3xl font-bold text-center mb-10">How posting works</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { icon: FileDown, t: "1. Create listing", d: "Structured wizard with screener questions" },
              { icon: Zap, t: "2. Pick a tier", d: "Standard KES 4,999 or Featured KES 11,999" },
              { icon: PhoneCall, t: "3. Pay via M-Pesa", d: "STK Push to your phone, instant receipt" },
              { icon: BadgeCheck, t: "4. Go live", d: "KYC-approved posts publish immediately" },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="bg-card rounded-lg border border-border p-5">
                <Icon className="h-6 w-6 text-[#166534] mb-3" />
                <p className="font-semibold text-sm">{t}</p>
                <p className="text-xs text-muted-foreground mt-1">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-14 text-center">
        <h2 className="font-heading text-3xl font-bold">Ready to post your first role?</h2>
        <p className="text-muted-foreground text-sm mt-2 mb-6">Sign up as an employer in under a minute. KYC keeps the platform scam-free for everyone.</p>
        <Link href="/employer/post-job" className="btn-press px-7 py-3 rounded-md bg-[#166534] text-white font-semibold text-sm hover:bg-[#14532d]">Post a job now</Link>
      </section>
    </>
    </PublicLayout>
  );
}
