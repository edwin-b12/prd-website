/* TalentKenya Contact — validated form with honeypot field. */
import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import { PublicLayout } from "@/components/Layout";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [msg, setMsg] = useState("");
  const [website, setWebsite] = useState(""); // honeypot

  const send = () => {
    if (website) return toast.error("Bot detected");
    if (!name.trim()) return toast.error("Enter your name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast.error("Enter a valid email address");
    if (msg.trim().length < 20) return toast.error("Message needs at least 20 characters");
    toast.success("Message sent", { description: "Our team replies within 1 business day. Urgent matters: +254 711 234 567." });
    setName(""); setEmail(""); setSubject(""); setMsg("");
  };

  return (
    <PublicLayout>
      <section className="container py-16 grid lg:grid-cols-[1fr_1.3fr] gap-10">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#166534] font-semibold mb-3">Contact us</p>
          <h1 className="font-heading text-4xl font-bold">Talk to the team</h1>
          <p className="text-muted-foreground mt-3 leading-relaxed">Whether you're a candidate with an account issue, an employer negotiating volume pricing, or a partner — we read every message.</p>
          <div className="mt-8 space-y-4">
            <p className="flex items-center gap-3 text-sm"><span className="p-2 rounded-md bg-[#e0f2e9] text-[#166534]"><Mail className="h-4 w-4" /></span>hello@talentkenya.co.ke</p>
            <p className="flex items-center gap-3 text-sm"><span className="p-2 rounded-md bg-[#e0f2e9] text-[#166534]"><Phone className="h-4 w-4" /></span>+254 711 234 567</p>
            <p className="flex items-center gap-3 text-sm"><span className="p-2 rounded-md bg-[#e0f2e9] text-[#166534]"><MapPin className="h-4 w-4" /></span>3rd Floor, Waiyaki Way, Nairobi</p>
          </div>
          <p className="text-xs text-muted-foreground mt-8">Hours: Mon–Fri 8:00–17:00 EAT · Sat 9:00–13:00 EAT</p>
        </div>
        <form onSubmit={e => { e.preventDefault(); send(); }} className="bg-card rounded-lg border border-border p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Name *</label><input value={name} onChange={e => setName(e.target.value)} className="input-std" /></div>
            <div><label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Email *</label><input value={email} onChange={e => setEmail(e.target.value)} type="email" className="input-std" /></div>
          </div>
          <div><label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Subject</label>
            <select value={subject} onChange={e => setSubject(e.target.value)} className="select-std">
              <option value="">General enquiry</option>
              <option>Account issue</option><option>Billing dispute</option><option>Employer sales</option><option>Report a fraudulent listing</option><option>Partnership</option>
            </select>
          </div>
          <div><label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Message *</label>
            <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={6} className="input-std" />
          </div>
          <input value={website} onChange={e => setWebsite(e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <button type="submit" className="btn-press w-full py-3 rounded-md bg-[#166534] hover:bg-[#14532d] text-white font-semibold">Send message</button>
          <p className="text-[11px] text-muted-foreground text-center">Your data is used only to respond to this enquiry (KDPA compliant).</p>
        </form>
      </section>
    </PublicLayout>
  );
}
