/* TalentKenya shared UI primitives — pill badges, match ring, status chips.
   Style: sharp 6px radius on containers, pill radius on chips, green/red palette. */
import { cn } from "@/lib/utils";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { CheckCircle2, XCircle } from "lucide-react";

export function Badge({ children, variant = "default", className }: { children: React.ReactNode; variant?: "default" | "featured" | "urgent" | "remote" | "verified" | "outline" | "red" | "green" | "gray"; className?: string }) {
  const styles: Record<string, string> = {
    default: "bg-muted text-muted-foreground",
    featured: "bg-[#fef3c7] text-[#8a6d00] border border-[#f0d98a]",
    urgent: "bg-[#fde8e7] text-[#b91c1c] border border-[#f5b7b4]",
    remote: "bg-[#e0f2e9] text-[#14532d] border border-[#b5dcc6]",
    verified: "bg-[#e0f2e9] text-[#14532d] border border-[#b5dcc6]",
    outline: "bg-transparent text-foreground/70 border border-border",
    red: "bg-[#fde8e7] text-[#b91c1c]",
    green: "bg-[#e0f2e9] text-[#14532d]",
    gray: "bg-secondary text-secondary-foreground",
  };
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap", styles[variant], className)}>{children}</span>;
}

export function MatchRing({ score, size = 40, className, matched, missing }: { score: number; size?: number; className?: string; matched?: string[]; missing?: string[] }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const color = score >= 85 ? "#166534" : score >= 70 ? "#ca8a04" : "#6b7280";
  const ring = (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={cn("shrink-0", className)}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={3} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={3}
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: "stroke-dashoffset 0.4s cubic-bezier(0.23,1,0.32,1)" }} />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central" fontSize={size * 0.28} fontWeight={700} fontFamily="JetBrains Mono, monospace" fill={color}>{score}</text>
    </svg>
  );
  const hasBreakdown = matched && matched.length > 0;
  if (!hasBreakdown) return ring;
  return (
    <HoverCard openDelay={120} closeDelay={120}>
      <HoverCardTrigger asChild>
        <span className="inline-flex cursor-help">{ring}</span>
      </HoverCardTrigger>
      <HoverCardContent className="w-64 p-3" side="bottom" align="end">
        <p className="text-xs font-semibold mb-1.5 font-mono-num">Profile match breakdown</p>
        {matched.length > 0 && (
          <div className="mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#166534] mb-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Matched</p>
            <ul className="space-y-1">
              {matched.map((m, i) => (
                <li key={i} className="text-xs text-muted-foreground capitalize flex items-start gap-1.5">{m}</li>
              ))}
            </ul>
          </div>
        )}
        {missing && missing.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#b91c1c] mb-1 flex items-center gap-1"><XCircle className="h-3 w-3" /> Not found in profile</p>
            <ul className="space-y-1">
              {missing.map((m, i) => (
                <li key={i} className="text-xs text-muted-foreground capitalize flex items-start gap-1.5">{m}</li>
              ))}
            </ul>
          </div>
        )}
        <p className="text-[10px] text-muted-foreground mt-2 pt-2 border-t border-border">Based on your profile vs. this role's requirements</p>
      </HoverCardContent>
    </HoverCard>
  );
}

export function KESAmount({ value, className }: { value: number | null | undefined; className?: string }) {
  if (value === null || value === undefined) return <span className={cn("text-muted-foreground font-mono-num", className)}>Salary not disclosed</span>;
  return <span className={cn("font-mono-num font-semibold", className)}>KES {value.toLocaleString("en-KE")}</span>;
}

export function daysAgo(dateStr: string): string {
  const d = Math.round((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 30) return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

export function statusColor(status: string): string {
  switch (status) {
    case "applied": return "bg-[#dbeafe] text-[#1d4ed8]";
    case "shortlisted": return "bg-[#fef3c7] text-[#8a6d00]";
    case "interview": return "bg-[#e0e7ff] text-[#4338ca]";
    case "offered": return "bg-[#f3e8ff] text-[#7e22ce]";
    case "hired": return "bg-[#e0f2e9] text-[#14532d]";
    case "rejected": return "bg-[#fde8e7] text-[#b91c1c]";
    case "pending": return "bg-[#fef3c7] text-[#8a6d00]";
    case "completed": return "bg-[#e0f2e9] text-[#14532d]";
    case "failed": return "bg-[#fde8e7] text-[#b91c1c]";
    default: return "bg-muted text-muted-foreground";
  }
}
