/* TalentKenya Saved Jobs — bookmarked vacancies with apply CTA. */
import { Link } from "wouter";
import { MapPin, BriefcaseBusiness, Clock, ArrowRight } from "lucide-react";
import { JOBS } from "@/lib/data";
import { usePlatform } from "@/lib/platform";
import { PortalHeader } from "@/components/Layout";
import { Badge, KESAmount, daysAgo } from "@/components/primitives";

export default function CandidateSavedJobsPage() {
  const { savedJobs, toggleSaveJob } = usePlatform();
  const jobs = JOBS.filter(j => savedJobs.includes(j.id));

  return (
    <>
      <PortalHeader role="candidate" title="Saved jobs" subtitle={`${jobs.length} role${jobs.length === 1 ? "" : "s"} saved for later`} />
      {jobs.length === 0 ? (
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <p className="text-muted-foreground text-sm">Nothing saved yet. Tap the bookmark icon on any job to save it here.</p>
          <Link href="/jobs" className="text-[#166534] font-semibold text-sm underline underline-offset-2 mt-2 inline-block">Browse jobs</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {jobs.map(j => (
            <div key={j.id} className="bg-card rounded-lg border border-border p-5 flex flex-col">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {j.featured && <Badge variant="featured">Featured</Badge>}
                {j.urgent && <Badge variant="urgent">Urgent</Badge>}
                {j.workMode === "Remote" && <Badge variant="remote">Remote OK</Badge>}
              </div>
              <h3 className="font-heading font-bold leading-snug">{j.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Verified employer</p>
              <div className="text-xs text-muted-foreground mt-2 flex flex-wrap gap-x-3 gap-y-1">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{j.town ? `${j.town}, ` : ""}{j.county}</span>
                <span className="flex items-center gap-1"><BriefcaseBusiness className="h-3 w-3" />{j.jobType} · {j.experience}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{daysAgo(j.posted)}</span>
              </div>
              <div className="text-sm mt-2"><KESAmount value={j.minSalary} /> {j.maxSalary && <>– <KESAmount value={j.maxSalary} /></>}</div>
              <div className="flex gap-2 mt-4 pt-3 border-t border-border mt-auto">
                <Link href={`/jobs/${j.slug}`} className="btn-press flex-1 py-2 rounded-md bg-[#166534] text-white text-sm font-semibold text-center">Apply</Link>
                <button onClick={() => toggleSaveJob(j.id)} className="btn-press px-3 rounded-md border border-border text-xs font-semibold">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
