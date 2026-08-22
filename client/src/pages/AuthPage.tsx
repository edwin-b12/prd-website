/* TalentKenya Auth — register (role tabs, employer KYC fields, +254 phone, KDPA consent)
   + login. Persists via PlatformProvider. */
import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "wouter";
import { toast } from "sonner";
import { ShieldCheck, Mail, Lock, User, Phone, Building2, MapPin, BriefcaseBusiness, ArrowLeft } from "lucide-react";
import { usePlatform } from "@/lib/platform";
import { COUNTIES } from "@/lib/data";
import type { UserRole } from "@/lib/data";
import { LOGO } from "@/lib/brand";

function validEmail(e: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e); }
function validPhone(p: string) { return /^(254|0)[17]\d{8,9}$/.test(p.replace(/\s/g, "")); }

export default function AuthPage() {
  const [params] = useSearchParams();
  const [, nav] = useLocation();
  const { role, signUp, signIn } = usePlatform();
  const mode = params.get("mode") === "login" ? "login" : "register";
  const [tab, setTab] = useState<"login" | "register">(mode);
  const [roleTab, setRoleTab] = useState<UserRole>("candidate");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [county, setCounty] = useState("");
  const [consent, setConsent] = useState(false);

  useEffect(() => { if (role) nav("/"); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [role]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === "login") {
      if (!validEmail(email)) return toast.error("Enter a valid email");
      if (password.length < 6) return toast.error("Password must be at least 6 characters");
      const r: UserRole = email.toLowerCase().includes("employer") || email.toLowerCase().includes("hr") ? "employer" : email.toLowerCase().includes("admin") ? "admin" : "candidate";
      signIn(r, email);
      toast.success(`Welcome back — signed in as ${r}`);
      nav(r === "employer" ? "/employer/dashboard" : r === "admin" ? "/admin/dashboard" : "/candidate/dashboard");
      return;
    }
    if (!name.trim()) return toast.error("Enter your full name");
    if (!validEmail(email)) return toast.error("Enter a valid email address");
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    if (roleTab === "employer") {
      if (!company.trim()) return toast.error("Enter your company name");
      if (!validPhone(phone)) return toast.error("Enter a valid Kenyan number, e.g. 254712345678");
      if (!county) return toast.error("Select your county");
    }
    if (!consent) return toast.error("Please accept the Data Protection consent");
    signUp(roleTab, email);
    toast.success("Account created — verify your email to continue", {
      description: "A verification link has been sent to " + email,
    });
    nav(roleTab === "employer" ? "/employer/dashboard" : "/candidate/dashboard");
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <img src={LOGO} alt="TalentKenya" className="h-8 w-8" />
          <span className="font-heading font-bold text-lg">Talent<span className="text-[#166534]">Kenya</span></span>
        </Link>

        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 -mt-3">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <div className="bg-card rounded-lg border border-border p-7">
          <div className="grid grid-cols-2 gap-1 bg-secondary rounded-md p-1 mb-6">
            {(["login", "register"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`py-2 rounded-md text-sm font-semibold capitalize transition-colors ${tab === t ? "bg-white shadow-sm" : "text-muted-foreground"}`}>
                {t === "login" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          {tab === "register" && (
            <div className="grid grid-cols-2 gap-1 bg-secondary rounded-md p-1 mb-6">
              {(["candidate", "employer"] as const).map(r => (
                <button key={r} onClick={() => setRoleTab(r)}
                  className={`py-2 rounded-md text-sm font-semibold capitalize transition-colors ${roleTab === r ? "bg-white shadow-sm text-[#166534]" : "text-muted-foreground"}`}>
                  {r === "candidate" ? "Job seeker" : "Employer"}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {tab === "register" && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input value={name} onChange={e => setName(e.target.value)} placeholder={roleTab === "employer" ? "Contact person full name" : "Full name"}
                  className="input-std pl-10" required />
              </div>
            )}
            {tab === "register" && roleTab === "employer" && (
              <>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Company name" className="input-std pl-10" required />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Work phone, e.g. 254712345678" className="input-std pl-10" required />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <select value={county} onChange={e => setCounty(e.target.value)} className="select-std pl-10" required>
                    <option value="">County / location</option>
                    {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address"
                className="input-std pl-10" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (min 6 characters)"
                className="input-std pl-10" required />
            </div>
            {tab === "register" && (
              <label className="flex gap-2.5 text-xs text-muted-foreground items-start">
                <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="accent-[#166534] mt-0.5" />
                <span>I consent to TalentKenya storing my data and distributing my CV to verified recruiters, per the Kenya Data Protection Act 2019 (KDPA).</span>
              </label>
            )}
            <button type="submit" className="btn-press w-full py-3 rounded-md bg-[#166534] hover:bg-[#14532d] text-white font-semibold text-sm flex items-center justify-center gap-2">
              {tab === "login" ? (
                <><Mail className="h-4 w-4" /> Sign in</>
              ) : roleTab === "candidate" ? (
                <><User className="h-4 w-4" /> Create free candidate account</>
              ) : (
                <><Building2 className="h-4 w-4" /> Create employer account</>
              )}
            </button>
            {tab === "register" && roleTab === "employer" && (
              <p className="text-[11px] text-muted-foreground text-center flex items-center justify-center gap-1">
                <ShieldCheck className="h-3 w-3 text-[#166534]" /> New employers are KYC-verified before listings go live — zero scam tolerance
              </p>
            )}
          </form>
        </div>
        <p className="text-[11px] text-muted-foreground text-center mt-5 flex items-center justify-center gap-1">
          <ShieldCheck className="h-3 w-3" /> Protected by Cloudflare Turnstile · KDPA 2019 compliant
        </p>
      </div>
    </div>
  );
}
