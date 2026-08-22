/* TalentKenya Job Alerts — create keyword/county/category alerts with daily/weekly digest,
   plus manage saved searches (filter combinations saved from /jobs) with live match counts. */
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { BellRing, Trash2, Plus, Search, SearchCheck, Pause, Play, ExternalLink, Bell, Mail } from "lucide-react";
import { toast } from "sonner";
import { COUNTIES, INDUSTRIES } from "@/lib/data";
import { usePlatform } from "@/lib/platform";
import { PortalHeader } from "@/components/Layout";

function filterSummary(filters: { [k: string]: string | boolean }): string {
  const parts: string[] = [];
  if (filters.q) parts.push(filters.q as string);
  if (filters.county) parts.push(filters.county as string);
  if (filters.jobType) parts.push(filters.jobType as string);
  if (filters.workMode) parts.push(filters.workMode as string);
  if (filters.experience) parts.push(filters.experience as string);
  if (filters.category) parts.push(filters.category as string);
  if (filters.salaryMin || filters.salaryMax) parts.push(`KES ${Number(filters.salaryMin) || 0} – ${filters.salaryMax ? `KES ${filters.salaryMax}` : "500k+"}`);
  if (filters.salaryPublic) parts.push("Disclosed salary");
  if (filters.featured) parts.push("Featured only");
  return parts.length ? parts.join(" · ") : "All jobs";
}

export default function CandidateAlertsPage() {
  const { alerts, addAlert, toggleAlert, deleteAlert, savedSearches, toggleSavedSearch, deleteSavedSearch, runSavedSearch, notifications, markNotificationRead, markAllNotificationsRead } = usePlatform();
  const [query, setQuery] = useState("");
  const [county, setCounty] = useState("");
  const [category, setCategory] = useState("");
  const [frequency, setFrequency] = useState<"Daily" | "Weekly">("Daily");
  const [digesting, setDigesting] = useState<string | null>(null);

  const create = () => {
    if (!query.trim() && !county && !category) return toast.error("Set at least one filter");
    addAlert({ query: query.trim() || "All jobs", county: county || "Any county", category: category || "All categories", frequency });
    setQuery(""); setCounty(""); setCategory("");
    toast.success("Alert created", { description: `You'll receive ${frequency.toLowerCase()} email digests of new matching jobs.` });
  };

  const savedWithCounts = useMemo(
    () => savedSearches.map(s => ({ s, ...runSavedSearch(s) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [savedSearches],
  );

  const runDigestNow = (name: string, count: number) => {
    setDigesting(name);
    setTimeout(() => {
      toast.success("Digest preview delivered", {
        description: `${count} vacancy${count === 1 ? "" : "ies"} match this search right now — check the Jobs board.`,
      });
      setDigesting(null);
    }, 600);
  };

  const unread = notifications.filter(n => !n.read).length;

  return (
    <>
      <PortalHeader role="candidate" title="Job alerts" subtitle="Get new matching vacancies delivered to your inbox. Never miss a deadline." />

      {unread > 0 && (
        <div className="container py-4">
          <div className="bg-[#e0f2e9] border border-[#bbf7d0] rounded-lg p-4 flex flex-wrap items-center gap-3">
            <Bell className="h-5 w-5 text-[#166534]" />
            <p className="text-sm font-semibold text-[#14532d]">{unread} unread notification{unread === 1 ? "" : "s"}</p>
            <div className="ml-auto flex items-center gap-2">
              <button onClick={markAllNotificationsRead} className="btn-press px-3 py-1.5 rounded-md text-xs font-semibold bg-[#166534] text-white">Mark all read</button>
              <Link href="/candidate/notifications" className="px-3 py-1.5 rounded-md text-xs font-semibold border border-[#166534] text-[#166534] flex items-center gap-1 hover:bg-[#f0fdf4]">
                <ExternalLink className="h-3.5 w-3.5" /> View inbox
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="container py-4 space-y-6">
        {/* Email alerts */}
        <div className="bg-card rounded-lg border border-border p-5">
          <h2 className="font-heading font-bold mb-4 flex items-center gap-2"><Mail className="h-4 w-4 text-[#166534]" /> Email digests</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Keyword, e.g. 'accountant'" className="input-std" />
            <select value={county} onChange={e => setCounty(e.target.value)} className="select-std">
              <option value="">Any county</option>
              {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={category} onChange={e => setCategory(e.target.value)} className="select-std">
              <option value="">All categories</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
            <select value={frequency} onChange={e => setFrequency(e.target.value as "Daily" | "Weekly")} className="select-std">
              <option value="Daily">Daily digest</option>
              <option value="Weekly">Weekly digest</option>
            </select>
          </div>
          <button onClick={create} className="btn-press mt-4 px-5 py-2.5 rounded-md bg-[#166534] hover:bg-[#14532d] text-white text-sm font-semibold flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Create alert
          </button>
        </div>

        {/* Saved searches */}
        <div className="bg-card rounded-lg border border-border p-5">
          <h2 className="font-heading font-bold mb-1 flex items-center gap-2"><Search className="h-4 w-4 text-[#166534]" /> Saved searches</h2>
          <p className="text-xs text-muted-foreground mb-4">Saved from the Jobs board — matched against every new posting automatically.</p>
          {savedWithCounts.length === 0 ? (
            <div className="bg-secondary/50 rounded-md border border-dashed border-border p-8 text-center">
              <Search className="h-6 w-6 mx-auto mb-2 text-muted-foreground opacity-40" />
              <p className="text-sm text-muted-foreground">No saved searches yet.</p>
              <Link href="/jobs" className="inline-block mt-3 px-4 py-2 rounded-md bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532d]">
                Go to Jobs and click “Save this search”
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {savedWithCounts.map(({ s, count }) => (
                <div key={s.id} className="rounded-md border border-border p-4 flex flex-wrap items-center gap-3">
                  <div className={`rounded-full p-2 ${s.active ? "bg-[#e0f2e9]" : "bg-muted"}`}>
                    {s.active ? <SearchCheck className="h-4 w-4 text-[#166534]" /> : <Pause className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">“{s.name}”</p>
                    <p className="text-xs text-muted-foreground truncate">{filterSummary(s.filters as unknown as { [k: string]: string | boolean })} · created {s.createdAt}</p>
                  </div>
                  <span className={`text-xs font-bold rounded-full px-2.5 py-1 ${count > 0 ? "bg-[#e0f2e9] text-[#14532d]" : "bg-muted text-muted-foreground"}`}>
                    {count} match{count === 1 ? "" : "es"}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => runDigestNow(s.name, count)} disabled={digesting !== null}
                      className="btn-press px-3 py-1.5 rounded-md text-xs font-semibold bg-[#166534] text-white flex items-center gap-1 disabled:opacity-50">
                      <BellRing className="h-3.5 w-3.5" /> {digesting === s.name ? "Matching…" : "Check now"}
                    </button>
                    <Link href={`/jobs?q=${encodeURIComponent(s.filters.q)}&county=${encodeURIComponent(s.filters.county)}&jobType=${encodeURIComponent(s.filters.jobType)}&workMode=${encodeURIComponent(s.filters.workMode)}`}
                      className="px-3 py-1.5 rounded-md text-xs font-semibold border border-border hover:border-[#166534] flex items-center gap-1">
                      <ExternalLink className="h-3.5 w-3.5" /> View
                    </Link>
                    <button onClick={() => { toggleSavedSearch(s.id); toast.success(s.active ? "Search paused" : "Search reactivated"); }}
                      className={`p-1.5 rounded-md ${s.active ? "text-muted-foreground hover:text-[#ca8a04]" : "text-[#166534]"}`}>
                      {s.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                    <button onClick={() => { deleteSavedSearch(s.id); toast.success("Saved search deleted"); }}
                      className="p-1.5 text-muted-foreground hover:text-[#b91c1c]">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Email alert list */}
        {alerts.length === 0 ? (
          <div className="bg-card rounded-lg border border-border p-12 text-center text-muted-foreground text-sm">
            <BellRing className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p>No email alerts yet. Create one above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map(a => (
              <div key={a.id} className="bg-card rounded-lg border border-border p-4 flex flex-wrap items-center gap-4">
                <BellRing className={`h-5 w-5 ${a.active ? "text-[#166534]" : "text-muted-foreground opacity-40"}`} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">"{a.query}" <span className="text-xs text-muted-foreground font-normal">· {a.county} · {a.category}</span></p>
                  <p className="text-xs text-muted-foreground">{a.frequency} digest · created {a.createdAt}</p>
                </div>
                <div className="flex gap-2 ml-auto">
                  <button onClick={() => toggleAlert(a.id)} className={`px-3 py-1.5 rounded-md text-xs font-semibold ${a.active ? "bg-[#e0f2e9] text-[#14532d]" : "bg-muted text-muted-foreground"}`}>
                    {a.active ? "Active" : "Paused"}
                  </button>
                  <button onClick={() => { deleteAlert(a.id); toast.success("Alert deleted"); }} className="p-1.5 text-muted-foreground hover:text-[#b91c1c]">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
