/* TalentKenya Header — sticky, flag strip top, role-switching account menu.
   Green/white palette, Sora wordmark, mobile bottom-sheet nav. */
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, Search, Briefcase, LogOut, ChevronDown, X, ShieldCheck } from "lucide-react";
import { usePlatform } from "@/lib/platform";
import type { UserRole } from "@/lib/data";
import { cn } from "@/lib/utils";

export default function Header() {
  const { role, email, signOut, switchRole } = usePlatform();
  const [loc] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/jobs", label: "Find Jobs" },
    { href: "/companies", label: "Companies" },
    { href: "/courses", label: "Career Hub" },
    { href: "/blog", label: "Insights" },
    { href: "/employers", label: "For Employers" },
  ];

  return (
    <>
      <div className="flag-strip" />
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border">
        <div className="container flex items-center gap-4 h-16">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <span aria-hidden="true" className="h-9 w-9 rounded-md bg-[#166534] text-white flex items-center justify-center font-heading font-bold">T</span>
            <span className="font-heading font-bold text-lg tracking-tight">
              Talent<span className="text-[#166534]">Kenya</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 ml-6">
            {links.map(l => (
              <Link key={l.href} href={l.href}
                className={cn("px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  (loc === l.href || loc.startsWith(l.href + "/")) ? "text-[#166534] bg-[#e0f2e9]" : "text-foreground/75 hover:text-foreground hover:bg-muted")}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link href="/jobs" className="hidden sm:inline-flex btn-press items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-foreground/70 hover:bg-muted">
              <Search className="h-4 w-4" /> Search
            </Link>
            {role ? (
              <div className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-md bg-secondary text-sm font-medium hover:bg-muted btn-press">
                  <span className="h-6 w-6 rounded-full bg-[#166534] text-white flex items-center justify-center text-xs font-bold">
                    {email ? email.charAt(0).toUpperCase() : "U"}
                  </span>
                  <span className="hidden sm:inline max-w-28 truncate">{email || "Account"}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-border py-2 z-50 fade-up">
                      <div className="px-3 pb-2 border-b border-border mb-1">
                        <p className="text-xs text-muted-foreground">Signed in as</p>
                        <p className="text-sm font-semibold truncate">{role === "candidate" ? "Job Seeker" : role === "employer" ? "Employer" : "Administrator"}</p>
                      </div>
                      {role === "candidate" && <RoleLink href="/candidate/dashboard" icon={Briefcase} label="Candidate Dashboard" close={() => setMenuOpen(false)} />}
                      {role === "employer" && <RoleLink href="/employer/dashboard" icon={Briefcase} label="Employer Dashboard" close={() => setMenuOpen(false)} />}
                      {role === "admin" && <RoleLink href="/admin/dashboard" icon={ShieldCheck} label="Admin Control Center" close={() => setMenuOpen(false)} />}
                      <div className="border-t border-border mt-1 pt-1 px-3">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-1">Switch role (demo)</p>
                        <div className="flex gap-1 flex-wrap">
                          {(["candidate", "employer", "admin"] as UserRole[]).map(r => (
                            <button key={r} onClick={() => { switchRole(r); setMenuOpen(false); }}
                              className={cn("px-2 py-1 rounded text-xs font-medium", role === r ? "bg-[#166534] text-white" : "bg-muted text-muted-foreground hover:bg-secondary")}>
                              {r === "candidate" ? "Candidate" : r === "employer" ? "Employer" : "Admin"}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="border-t border-border mt-1 pt-1">
                        <button onClick={() => { signOut(); setMenuOpen(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#b91c1c] hover:bg-[#fde8e7]">
                          <LogOut className="h-4 w-4" /> Sign out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth?mode=login" className="hidden sm:inline-flex btn-press px-3.5 py-2 rounded-md text-sm font-semibold text-foreground/80 hover:bg-muted">
                  Sign in
                </Link>
                <Link href="/auth?mode=register" className="btn-press px-3.5 py-2 rounded-md text-sm font-semibold bg-[#166534] text-white hover:bg-[#14532d]">
                  Join free
                </Link>
              </div>
            )}
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-md hover:bg-muted" aria-label="Menu">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white p-5 fade-up">
              <div className="flex items-center justify-between mb-6">
                <span className="font-heading font-bold">Menu</span>
                <button onClick={() => setMobileOpen(false)} className="p-2 rounded-md hover:bg-muted"><X className="h-5 w-5" /></button>
              </div>
              <div className="flex flex-col gap-1">
                {links.map(l => (
                  <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                    className="px-3 py-3 rounded-md text-base font-medium hover:bg-muted">
                    {l.label}
                  </Link>
                ))}
              </div>
              <div className="border-t border-border mt-4 pt-4 flex flex-col gap-2">
                {role ? (
                  <>
                    <Link href={role === "candidate" ? "/candidate/dashboard" : role === "employer" ? "/employer/dashboard" : "/admin/dashboard"}
                      onClick={() => setMobileOpen(false)} className="btn-press px-4 py-2.5 rounded-md text-sm font-semibold bg-[#166534] text-white text-center">
                      Go to {role} dashboard
                    </Link>
                    <button onClick={() => { signOut(); setMobileOpen(false); }} className="px-4 py-2.5 rounded-md text-sm font-semibold text-[#b91c1c] bg-[#fde8e7]">Sign out</button>
                  </>
                ) : (
                  <>
                    <Link href="/auth?mode=login" onClick={() => setMobileOpen(false)} className="btn-press px-4 py-2.5 rounded-md text-sm font-semibold border border-border text-center">Sign in</Link>
                    <Link href="/auth?mode=register" onClick={() => setMobileOpen(false)} className="btn-press px-4 py-2.5 rounded-md text-sm font-semibold bg-[#166534] text-white text-center">Join free</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

function RoleLink({ href, icon: Icon, label, close }: { href: string; icon: typeof Briefcase; label: string; close: () => void }) {
  return (
    <Link href={href} onClick={close} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted">
      <Icon className="h-4 w-4 text-[#166534]" /> {label}
    </Link>
  );
}
