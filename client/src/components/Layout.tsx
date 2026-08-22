/* TalentKenya layout wrappers. PublicLayout = Header + content + Footer.
   PortalLayout = sticky sub-header + sidebar nav (desktop) / bottom bar (mobile), role-gated. */
import { type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import Header from "./Header";
import Footer from "./Footer";
import { usePlatform } from "@/lib/platform";
import type { UserRole } from "@/lib/data";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, User, BriefcaseBusiness, Bookmark, BellRing, FileText,
  PlusCircle, KanbanSquare, Users, Building2, Receipt, ShieldCheck,
  ClipboardList, BadgeCheck, Landmark, Languages,
} from "lucide-react";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

const CANDIDATE_NAV = [
  { href: "/candidate/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/candidate/profile", label: "My Profile", icon: User },
  { href: "/candidate/applications", label: "Applications", icon: BriefcaseBusiness },
  { href: "/candidate/saved-jobs", label: "Saved Jobs", icon: Bookmark },
  { href: "/candidate/application-receipts", label: "Receipts", icon: Receipt },
  { href: "/candidate/notifications", label: "Notifications", icon: BellRing },
  { href: "/candidate/alerts", label: "Job Alerts", icon: BellRing },
  { href: "/candidate/offers", label: "Offers", icon: FileText },
  { href: "/candidate/resume-builder", label: "Resume Builder", icon: FileText },
];

const EMPLOYER_NAV = [
  { href: "/employer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employer/post-job", label: "Post a Job", icon: PlusCircle },
  { href: "/employer/manage-jobs", label: "My Jobs", icon: BriefcaseBusiness },
  { href: "/employer/talent-search", label: "Talent Search", icon: Users },
  { href: "/employer/company", label: "Company Profile", icon: Building2 },
  { href: "/employer/billing", label: "Billing (M-Pesa)", icon: Receipt },
];

const ADMIN_NAV = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/verifications", label: "Employer KYC", icon: BadgeCheck },
  { href: "/admin/moderation", label: "Job Moderation", icon: ClipboardList },
  { href: "/admin/finance", label: "Finance Ledger", icon: Landmark },
  { href: "/admin/content", label: "Content Manager", icon: Languages },
];

function navFor(role: UserRole) {
  if (role === "candidate") return CANDIDATE_NAV;
  if (role === "employer") return EMPLOYER_NAV;
  return ADMIN_NAV;
}

export function PortalLayout({ role, children }: { role: UserRole; children: ReactNode }) {
  const { role: actual, notifications } = usePlatform();
  const [loc] = useLocation();
  const nav = navFor(role);
  const allowed = actual === role;
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      {!allowed ? (
        <main className="flex-1">
          <div className="container py-24 text-center">
            <p className="text-muted-foreground mb-4">This area is for {role}s only.</p>
            <Link href="/auth?mode=register" className="btn-press inline-block px-5 py-2.5 rounded-md bg-[#166534] text-white font-semibold">
              {role === "admin" ? "Contact us" : "Join as a " + role}
            </Link>
          </div>
        </main>
      ) : (
        <div className="container flex-1 py-6 grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="hidden lg:block">
            <nav className="sticky top-24 flex flex-col gap-1 bg-card rounded-lg border border-border p-2">
              <p className="px-3 pt-1 pb-2 text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
                {role === "candidate" ? "Candidate Portal" : role === "employer" ? "Employer Portal" : "Admin Control Center"}
              </p>
              {nav.map(n => {
                const active = loc === n.href || (n.href.endsWith("/manage-jobs") ? false : loc.startsWith(n.href + "/"));
                return (
                  <Link key={n.href} href={n.href}
                    className={cn("flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                      active ? "bg-[#166534] text-white" : "text-foreground/75 hover:bg-muted")}>
                    <n.icon className="h-4 w-4" /> {n.label}
                    {unread > 0 && n.href === "/candidate/notifications" && (
                      <span className="ml-auto bg-[#b91c1c] text-white text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">{unread}</span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </aside>
          <main className="min-w-0 pb-6">{children}</main>
          {/* Mobile bottom nav */}
          <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-border grid grid-cols-5 px-1 py-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
            {nav.map(n => (
              <Link key={n.href} href={n.href}
                className={cn("flex flex-col items-center gap-0.5 py-1 rounded-md text-[10px] font-medium",
                  loc === n.href ? "text-[#166534]" : "text-muted-foreground")}>
                <n.icon className="h-4 w-4" />
                <span className="truncate max-w-full">{n.label.split(" ")[0]}</span>
                {unread > 0 && n.href === "/candidate/notifications" && (
                  <span className="absolute -top-1 right-2 bg-[#b91c1c] text-white text-[9px] font-bold rounded-full h-3.5 min-w-3.5 px-0.5 flex items-center justify-center">{unread}</span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      )}
      {!allowed && <Footer />}
    </div>
  );
}

export function PortalHeader({ role, title, subtitle, action }: { role: UserRole; title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-[#166534] font-semibold mb-1">
          <ShieldCheck className="h-3.5 w-3.5" />
          {role === "candidate" ? "Candidate Portal" : role === "employer" ? "Employer Portal" : "Admin Control Center"}
        </div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, delta, tone = "green" }: { label: string; value: string; delta?: string; tone?: "green" | "red" | "amber" }) {
  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">{label}</p>
      <p className="font-mono-num text-2xl font-bold mt-1">{value}</p>
      {delta && <p className={cn("text-xs mt-1 font-medium", tone === "green" ? "text-[#166534]" : tone === "red" ? "text-[#b91c1c]" : "text-[#8a6d00]")}>{delta}</p>}
    </div>
  );
}
