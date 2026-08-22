/* TalentKenya Footer — dark green, four columns, regulatory line (DPO). */
import { Link } from "wouter";
import { MapPin } from "lucide-react";
import { LOGO } from "@/lib/brand";

export default function Footer() {
  return (
    <footer className="bg-[#062a17] text-white/85 mt-20">
      <div className="container py-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <img src={LOGO} alt="TalentKenya" className="h-9 w-9" />
            <span className="font-heading font-bold text-lg text-white">Talent<span className="text-[#7fe0a0]">Kenya</span></span>
          </div>
          <p className="text-sm text-white/60 max-w-xs mb-4">
            Kenya's trusted employment marketplace connecting serious employers with skilled Kenyan talent across all 47 counties.
          </p>
          <p className="flex items-center gap-1.5 text-xs text-white/50">
            <MapPin className="h-3.5 w-3.5" /> Westlands, Nairobi, Kenya
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">For job seekers</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/jobs" className="hover:text-white">Browse jobs</Link></li>
            <li><Link href="/companies" className="hover:text-white">Companies</Link></li>
            <li><Link href="/courses" className="hover:text-white">Career Hub</Link></li>
            <li><Link href="/blog" className="hover:text-white">Career insights</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">For employers</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/employers" className="hover:text-white">Pricing &amp; plans</Link></li>
            <li><Link href="/employer/post-job" className="hover:text-white">Post a job</Link></li>
            <li><Link href="/employer/talent-search" className="hover:text-white">Talent search</Link></li>
            <li><Link href="/employers" className="hover:text-white">Recruitment support</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-white">About us</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link href="/privacy" className="hover:text-white">Privacy policy</Link></li>
            <li><Link href="/terms" className="hover:text-white">Terms of service</Link></li>
            <li><Link href="/faqs" className="hover:text-white">FAQs</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/45">
          <p>© 2026 TalentKenya Ltd. All rights reserved. Registered in Kenya.</p>
          <p>Data Protection Act 2019 compliant · DPO: dpo@talentkenya.co.ke</p>
        </div>
      </div>
    </footer>
  );
}
