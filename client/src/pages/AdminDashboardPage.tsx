/* TalentKenya Admin Dashboard — platform health overview with queues summary. */
import { Link } from "wouter";
import { Users, BriefcaseBusiness, Building2, AlertTriangle } from "lucide-react";
import { JOBS, COMPANIES, APPLICATIONS } from "@/lib/data";
import { usePlatform } from "@/lib/platform";
import { PortalHeader, StatCard } from "@/components/Layout";

export default function AdminDashboardPage() {
  const { verifications, moderationQueue, transactions } = usePlatform();
  const pendingVer = verifications.filter(v => v.status === "pending").length;
  const pendingMod = moderationQueue.filter(m => m.status === "pending").length;
  const flagged = moderationQueue.filter(m => m.status === "flagged").length;

  return (
    <>
      <PortalHeader role="admin" title="Admin control center" subtitle="Platform health at a glance. All moderation queues on the left navigation." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Live jobs" value={String(JOBS.filter(j => j.status === "active").length)} />
        <StatCard label="Verified employers" value={String(COMPANIES.length)} />
        <StatCard label="Applications (30d)" value={String(APPLICATIONS.length)} />
        <StatCard label="Revenue (30d)" value="KES 342,800" tone="green" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <Link href="/admin/verifications" className="bg-card rounded-lg border border-border p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold flex items-center gap-2"><Users className="h-4 w-4 text-[#166534]" /> Employer verification</p>
            <span className={`font-mono-num text-lg font-bold ${pendingVer > 0 ? "text-[#8a6d00]" : "text-[#166534]"}`}>{pendingVer}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{pendingVer} KYC documents awaiting review</p>
        </Link>
        <Link href="/admin/moderation" className="bg-card rounded-lg border border-border p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold flex items-center gap-2"><BriefcaseBusiness className="h-4 w-4 text-[#166534]" /> Job moderation</p>
            <span className={`font-mono-num text-lg font-bold ${flagged > 0 ? "text-[#b91c1c]" : "text-[#166534]"}`}>{pendingMod + flagged}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{flagged} flagged listings · {pendingMod} pending approval</p>
        </Link>
        <Link href="/admin/finance" className="bg-card rounded-lg border border-border p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold flex items-center gap-2"><Building2 className="h-4 w-4 text-[#166534]" /> Finance ledger</p>
            <span className="font-mono-num text-lg font-bold text-[#166534]">{transactions.length}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{transactions.filter(t => t.status === "completed").length} completed transactions</p>
        </Link>
      </div>

      <div className="bg-card rounded-lg border border-border p-5">
        <p className="font-heading font-bold mb-4 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-[#b91c1c]" /> Alerts & flagged items</p>
        <div className="space-y-2">
          {flagged > 0 ? moderationQueue.filter(m => m.status === "flagged").map(m => (
            <div key={m.id} className="flex items-center justify-between p-3 rounded-md border border-[#f9b0ad] bg-[#fde8e7]/50">
              <p className="text-sm">"{m.title}" by {m.company} — flagged for review</p>
              <Link href="/admin/moderation" className="text-xs font-semibold text-[#166534] hover:underline">Review</Link>
            </div>
          )) : <p className="text-sm text-muted-foreground">No flagged items.</p>}
        </div>
      </div>
    </>
  );
}
