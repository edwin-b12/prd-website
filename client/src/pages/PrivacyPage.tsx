/* TalentKenya Privacy Policy — KDPA-compliant statement. */
import { PublicLayout } from "@/components/Layout";

export default function PrivacyPage() {
  const sections = [
    { t: "1. Who we are", p: "TalentKenya Limited, a company registered in Kenya (PVT-I4S1W6), operates talentkenya.co.ke. We are the data controller for personal information you provide through this platform." },
    { t: "2. What we collect", p: "Candidates: profile data (name, contact, county, experience, education, skills), CV files, and application answers. Employers: company registration details, KRA PIN, billing information, and posted job content. System data: device type, IP address, and usage analytics." },
    { t: "3. How we use it", p: "To operate the marketplace — matching candidates with jobs, powering 1-click applications, processing payments, and sending the alerts you subscribe to. We never sell personal data. Contact details are disclosed to employers only when a candidate applies or explicitly unlocks them." },
    { t: "4. Kenya Data Protection Act (2019)", p: "We operate under KDPA as enforced by the Office of the Data Protection Commissioner. You have the right to access, correct, and delete your data at any time — use your account settings or email privacy@talentkenya.co.ke." },
    { t: "5. Security", p: "Passwords are stored hashed. Payments are processed by licensed providers (Safaricom Paybill, PCI-DSS-compliant card gateways). Access to personal data is role-restricted and logged." },
    { t: "6. Cookies", p: "We use essential cookies for your session and anonymous analytics to improve the platform. No third-party advertising trackers are used." },
    { t: "7. Retention", p: "Application data is retained while relevant to your job search; you can delete your account and associated data at any time, after which records are purged within 30 days." },
    { t: "8. Contact", p: "Data Protection Officer: dpo@talentkenya.co.ke · 3rd Floor, Waiyaki Way, Nairobi." },
  ];
  return (
    <PublicLayout>
      <section className="container py-16 max-w-3xl">
        <p className="text-xs uppercase tracking-widest text-[#166534] font-semibold mb-3">Legal</p>
        <h1 className="font-heading text-4xl font-bold">Privacy policy</h1>
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
