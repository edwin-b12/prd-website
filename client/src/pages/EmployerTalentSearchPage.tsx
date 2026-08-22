/* TalentKenya Talent Search — employer searches candidate pool; contact details
   unlock via one-time credits (demo gating kept functional). */
import { useRef, useState } from "react";
import { Search, MapPin, Lock, Unlock, Star, Upload, FileSpreadsheet, Download, X } from "lucide-react";
import { toast } from "sonner";
import { CANDIDATES, type Candidate } from "@/lib/data";
import { usePlatform } from "@/lib/platform";
import { PortalHeader } from "@/components/Layout";
import { Badge, MatchRing } from "@/components/primitives";

const CSV_TEMPLATE = `name,title,county,experience,skills
"Grace Wanjiku","Accountant","Nairobi","Mid-Level (3-5 yrs)","QuickBooks; Sage; Tax compliance; Excel"
"Peter Otieno","Registered Nurse","Kisumu","Senior (6-9 yrs)","Patient care; First aid; CPR; Clinical records"
"Amina Mohamed","Customer Service Representative","Mombasa","Entry-Level (1-2 yrs)","Swahili; English; Call handling; CRM"`;

function parseCSV(text: string): Candidate[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const head = lines[0].toLowerCase().split(",").map(h => h.replace(/"/g, "").trim());
  const col = (name: string) => head.indexOf(name);
  const rows: Candidate[] = [];
  for (let i = 1; i < lines.length; i++) {
    const raw = lines[i];
    // naive csv split that respects double-quoted fields
    const parts: string[] = [];
    let cur = "";
    let inQ = false;
    for (const ch of raw) {
      if (ch === '"') { inQ = !inQ; }
      else if (ch === "," && !inQ) { parts.push(cur); cur = ""; }
      else cur += ch;
    }
    parts.push(cur);
    const get = (idx: number) => (idx >= 0 && idx < parts.length ? parts[idx].replace(/^"|"$/g, "").trim() : "");
    const name = get(col("name"));
    if (!name) continue;
    rows.push({
      id: `bulk-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      title: get(col("title")) || "Candidate",
      county: get(col("county")) || "Kenya",
      experience: get(col("experience")) || "Unspecified",
      skills: get(col("skills")).split(";").map(s => s.trim()).filter(Boolean),
      matchScore: 0,
      unlocked: false,
      rating: null,
      imported: true,
    });
  }
  return rows;
}

function CSVImportModal({ onClose, onImport }: { onClose: () => void; onImport: (rows: Candidate[]) => void }) {
  const [rows, setRows] = useState<Candidate[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!/\.(csv|txt)$/i.test(file.name)) { toast.error("Please upload a .csv or .txt file"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseCSV(String(reader.result ?? ""));
      if (!parsed.length) { toast.error("No valid rows found. Check the CSV format."); return; }
      setRows(parsed);
      toast.success(`Found ${parsed.length} candidate${parsed.length === 1 ? "" : "s"} in the file`);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-t-xl md:rounded-lg w-full md:max-w-lg max-h-[90vh] overflow-y-auto p-6 fade-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl font-bold">Bulk import candidates</h2>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Upload a CSV to seed your talent pool instantly. Required columns: <b>name</b>, plus optional <b>title</b>, <b>county</b>, <b>experience</b>, and <b>skills</b> (semicolon-separated).</p>
        <button onClick={() => navigator.clipboard?.writeText(CSV_TEMPLATE).then(() => toast.success("Template copied to clipboard"))}
          className="text-xs font-semibold text-[#166534] flex items-center gap-1 mb-4 hover:underline">
          <Download className="h-3.5 w-3.5" /> Copy CSV template
        </button>
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${dragOver ? "border-[#166534] bg-[#e0f2e9]" : "border-border hover:border-[#166534]/40 hover:bg-secondary/50"}`}>
          <FileSpreadsheet className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-semibold">Drag & drop your CSV here</p>
          <p className="text-xs text-muted-foreground mt-1">or click to browse · .csv / .txt</p>
        </div>
        <input ref={inputRef} type="file" accept=".csv,.txt" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
        {rows.length > 0 && (
          <div className="mt-5">
            <p className="text-sm font-semibold mb-2">Preview — {rows.length} candidate{rows.length === 1 ? "" : "s"} ready</p>
            <div className="max-h-48 overflow-y-auto border border-border rounded-md divide-y divide-border">
              {rows.map(r => (
                <div key={r.id} className="flex items-center justify-between px-3 py-2 text-xs">
                  <span className="font-medium truncate">{r.name}</span>
                  <span className="text-muted-foreground truncate ml-2">{r.title} · {r.county}</span>
                </div>
              ))}
            </div>
            <button onClick={() => { onImport(rows); onClose(); }}
              className="btn-press w-full mt-4 py-3 rounded-md bg-[#166534] hover:bg-[#14532d] text-white font-semibold text-sm">
              Import {rows.length} candidate{rows.length === 1 ? "" : "s"} into talent pool
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EmployerTalentSearchPage() {
  const { unlockedCandidates, unlockCandidate, importedCandidates, importCandidates } = usePlatform();
  const [q, setQ] = useState("");
  const [county, setCounty] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const counties = Array.from(new Set([...CANDIDATES.map(c => c.county), ...importedCandidates.map(c => c.county)]));

  const list = [...CANDIDATES, ...importedCandidates].filter(c => {
    if (q && !`${c.name} ${c.title} ${c.skills.join(" ")}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (county && c.county !== county) return false;
    return true;
  });

  const contact = (id: string, name: string) => {
    unlockCandidate(id);
    toast.success(`Contact unlocked for ${name}`, {
      description: "1 credit used. Email and phone are now visible — remember KDPA usage rules.",
    });
  };

  return (
    <>
      <PortalHeader role="employer" title="Talent search" subtitle="Search pre-screened candidates. Unlocked contacts are billed at 5 credits each."
        action={
          <div className="flex items-center gap-2">
            <button onClick={() => setImportOpen(true)}
              className="btn-press inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#166534] hover:bg-[#14532d] text-white text-xs font-semibold">
              <Upload className="h-3.5 w-3.5" /> Bulk import (CSV)
            </button>
            <span className="text-xs font-mono-num font-semibold bg-secondary rounded-full px-3 py-1.5">Balance: 100 credits</span>
          </div>
        } />

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex items-center gap-2 bg-card rounded-md border border-border px-3 flex-1">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search skills, e.g. 'QuickBooks' or 'nursing'" className="w-full py-2.5 text-sm bg-transparent outline-none" />
        </div>
        <select value={county} onChange={e => setCounty(e.target.value)} className="select-std md:w-48">
          <option value="">All counties</option>
          {counties.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map(c => {
          const unlocked = unlockedCandidates.includes(c.id);
          return (
            <div key={c.id} className="bg-card rounded-lg border border-border p-5 relative">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-heading font-bold">{c.name}</h3>
                  <p className="text-sm text-muted-foreground">{c.title}</p>
                </div>
                <MatchRing score={c.matchScore} />
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><MapPin className="h-3 w-3" />{c.county} · {c.experience} · rated {c.rating ?? "new"}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {c.skills.slice(0, 5).map(s => <Badge key={s} variant="outline">{s}</Badge>)}
              </div>
              <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                {unlocked ? (
                  <div className="text-xs w-full">
                    <p className="text-[#166534] font-semibold">hello@candidate-{c.id}.example.ke</p>
                    <p className="text-muted-foreground mt-0.5">+254 7XX XXX XXX</p>
                  </div>
                ) : (
                  <button onClick={() => contact(c.id, c.name)} className="btn-press w-full py-2 rounded-md bg-[#166534] text-white text-xs font-semibold flex items-center justify-center gap-1.5">
                    <Unlock className="h-3.5 w-3.5" /> Unlock contact · 5 credits
                  </button>
                )}
                <button onClick={() => toast.success(`Candidate ${c.name} added to shortlist`)} className="p-2 rounded-md border border-border hover:bg-muted">
                  <Star className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {list.length === 0 && <p className="text-center text-muted-foreground py-16 text-sm">No candidates match. Try broader keywords or another county.</p>}
      {importedCandidates.length > 0 && (
        <p className="text-center text-xs text-muted-foreground mt-6">{importedCandidates.length} of the visible candidate{importedCandidates.length === 1 ? "" : "s"} came from your bulk import.</p>
      )}
      {importOpen && <CSVImportModal onClose={() => setImportOpen(false)} onImport={rows => { importCandidates(rows); toast.success(`${rows.length} candidate${rows.length === 1 ? "" : "s"} added to your talent pool`); }} />}
    </>
  );
}
