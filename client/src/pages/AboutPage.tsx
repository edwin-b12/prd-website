/* TalentKenya About — mission, how it works, stats. */
import { Link } from "wouter";
import { MapPin, Users, ShieldCheck, BriefcaseBusiness } from "lucide-react";
import { PublicLayout } from "@/components/Layout";
import { LOGO } from "@/lib/brand";

export default function AboutPage() {
  return (
    <PublicLayout>
      <section className="container py-16">
        <p className="text-xs uppercase tracking-widest text-[#166534] font-semibold mb-3">About TalentKenya</p>
        <h1 className="font-heading text-4xl md:text-5xl font-bold leading-tight max-w-2xl">Connecting Kenyan talent with Kenyan opportunity</h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-2xl leading-relaxed">
          TalentKenya is a Kenyan employment marketplace built for local conditions — 47-county coverage, M-Pesa payments, mobile-first access, and
          structured screening that respects candidates' time. From a boda-boda rider tracking parcel deliveries to a fintech hiring engineers,
          every vacancy on this platform is structured, screened, and verifiable.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          {[
            { icon: <MapPin className="h-5 w-5" />, n: "47", l: "Counties covered" },
            { icon: <Users className="h-5 w-5" />, n: "240,000+", l: "Registered job seekers" },
            { icon: <ShieldCheck className="h-5 w-5" />, n: "100%", l: "Verified employers" },
            { icon: <BriefcaseBusiness className="h-5 w-5" />, n: "9,400+", l: "Jobs filled since launch" },
          ].map(s => (
            <div key={s.l} className="bg-card rounded-lg border border-border p-5">
              <span className="text-[#166534]">{s.icon}</span>
              <p className="font-mono-num text-2xl font-bold mt-2">{s.n}</p>
              <p className="text-xs text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-secondary/60 py-16">
        <div className="container">
          <h2 className="font-heading text-3xl font-bold mb-8">How it works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: "01", t: "Candidates build one profile", d: "Structured experience, skills and screener answers — then apply to any job in one click. No more re-typing your CV." },
              { n: "02", t: "Employers post structured jobs", d: "Every listing has clear salary bands, requirements and screening questions. KYC-verified employers only." },
              { n: "03", t: "Matches and interviews", d: "Match scoring, an ATS pipeline, and local support. Interviews scheduled with 24h confirmation rules." },
            ].map(x => (
              <div key={x.n} className="bg-card rounded-lg border border-border p-6">
                <p className="font-mono-num text-3xl font-bold text-[#166534]/30">{x.n}</p>
                <h3 className="font-heading font-bold mt-2">{x.t}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="container py-16 text-center">
        <img src={LOGO} alt="TalentKenya" className="h-10 mx-auto mb-4" />
        <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-6">Made in Nairobi. Built for the 1,546,000 young Kenyans entering the labour market every year.</p>
        <Link href="/auth" className="btn-press px-6 py-3 rounded-md bg-[#166534] text-white font-semibold inline-flex items-center gap-2">Create your free account</Link>
      </section>
    </PublicLayout>
  );
}
