/* TalentKenya Terms of Service — candidate and employer terms. */
import { PublicLayout } from "@/components/Layout";

export default function TermsPage() {
  const sections = [
    { t: "1. Acceptance", p: "By registering on TalentKenya you agree to these terms and our privacy policy. Candidates confirm they are 18 or older; employers confirm they are registered legal entities or sole proprietors in Kenya." },
    { t: "2. Candidate conduct", p: "All profile information must be truthful. Fake experience, falsified qualifications, or misuse of employer contact details will result in account termination and may be reported to the relevant authorities." },
    { t: "3. Employer conduct", p: "Employers agree to post genuine vacancies with accurate salary ranges, to respond to shortlisted candidates within 14 days, and never to solicit payment from candidates. Fee-charging candidates is grounds for immediate removal and legal action." },
    { t: "4. Listing rules", p: "Listings are moderated before publication. Discriminatory, vague, or mislabelled roles are rejected. Featured placements guarantee visibility, not hiring outcomes." },
    { t: "5. Payments", p: "Employer fees are listed in KES and include VAT. M-Pesa, card, and bank payments are final once services are delivered. Refunds follow our published refund policy." },
    { t: "6. Data and matching", p: "Candidates control which employers see their contact details. Employers may not store or use candidate data outside the recruitment process. Unauthorised data use is a breach of the KDPA." },
    { t: "7. Liability", p: "TalentKenya verifies employers but cannot guarantee every external outcome. The platform's aggregate liability is limited to fees paid in the preceding three months." },
    { t: "8. Governing law", p: "These terms are governed by Kenyan law. Disputes are first referred to mediation in Nairobi before any court action." },
  ];
  return (
    <PublicLayout>
      <section className="container py-16 max-w-3xl">
        <p className="text-xs uppercase tracking-widest text-[#166534] font-semibold mb-3">Legal</p>
        <h1 className="font-heading text-4xl font-bold">Terms of service</h1>
        <p className="text-sm text-muted-foreground mt-2">Last updated: August 2026 · Effective immediately</p>
        <div className="mt-8 space-y-6">
          {sections.map(s => (
            <div key={s.t}>
              <h2 className="font-heading font-bold text-lg">{s.t}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mt-1">{s.p}</p>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
