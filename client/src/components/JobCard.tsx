/* TalentKenya JobCard — consistent listing card w/ company initial, badges, match ring, save. */
import { Link } from "wouter";
import { Bookmark, MapPin, Clock, Building2 } from "lucide-react";
import { Badge, KESAmount, daysAgo, MatchRing } from "./primitives";
import { usePlatform } from "@/lib/platform";
import { COMPANIES, type Job } from "@/lib/data";
import { toast } from "sonner";

export default function JobCard({ job, match, matched, missing, showMatch = false }: { job: Job; match?: number; matched?: string[]; missing?: string[]; showMatch?: boolean }) {
  const { savedJobs, toggleSaveJob, role } = usePlatform();
  const company = COMPANIES.find(c => c.id === job.companyId);
  const saved = savedJobs.includes(job.id);

  return (
    <div className="group bg-card rounded-lg border border-border p-5 hover:shadow-md hover:border-[#166534]/30 transition-all">
      <div className="flex items-start gap-4">
        <div className="shrink-0 h-12 w-12 rounded-lg flex items-center justify-center text-white font-heading font-bold text-lg"
          style={{ backgroundColor: company?.logoColor ?? "#166534" }}>
          {company?.name.charAt(0) ?? "T"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link href={`/jobs/${job.slug}`} className="font-heading font-bold text-base leading-snug hover:text-[#166534] line-clamp-2">
                {job.title}
              </Link>
              <Link href={`/companies/${company?.slug}`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mt-0.5">
                <Building2 className="h-3.5 w-3.5 shrink-0" /> {company?.name ?? "Company"}
                {company?.verified && <span className="text-[#166534] text-xs">· Verified ✓</span>}
              </Link>
            </div>
            {showMatch && match !== undefined && <MatchRing score={match} matched={matched} missing={missing} />}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.county}{job.workMode === "Remote" ? " · Remote" : job.workMode === "Hybrid" ? " · Hybrid" : ""}</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{job.jobType}</span>
            <span>{job.experience}</span>
            <span className="text-muted-foreground/60">{daysAgo(job.posted)}</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            {job.featured && <Badge variant="featured">Featured</Badge>}
            {job.urgent && <Badge variant="urgent">Urgent</Badge>}
            {job.workMode === "Remote" && <Badge variant="remote">Remote</Badge>}
            {job.salaryPublic && <Badge variant="outline"><KESAmount value={job.minSalary} className="!text-xs" /> – <KESAmount value={job.maxSalary} className="!text-xs" /></Badge>}
            <Badge variant="gray">{job.category}</Badge>
          </div>
        </div>
        <button
          onClick={() => {
            if (!role) { toast.info("Sign in to save jobs", { description: "Create a free candidate account to build your saved list." }); return; }
            toggleSaveJob(job.id);
            toast.success(saved ? "Removed from saved jobs" : "Job saved");
          }}
          className={saved ? "text-[#166534]" : "text-muted-foreground hover:text-[#166534]"} aria-label="Save job">
          <Bookmark className={saved ? "h-5 w-5 fill-current" : "h-5 w-5"} />
        </button>
      </div>
    </div>
  );
}
