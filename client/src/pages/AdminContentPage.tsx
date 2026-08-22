/* TalentKenya Admin Content — manages courses and blog posts (CRUD-lite,
   persisted in localStorage so changes reflect on public pages). */
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { COURSES as SEED_COURSES, BLOG as SEED_BLOG, INDUSTRIES } from "@/lib/data";
import { PortalHeader } from "@/components/Layout";

interface Course { id: string; title: string; category: string; duration: string; level: string; lessons: number; description: string; free: boolean }
interface Post { id: string; title: string; category: string; readMin: number; date: string; excerpt: string }

const LS_C = "tk-courses";
const LS_B = "tk-blog";
const loadC = (): Course[] => { try { return { ...SEED_COURSES }.constructor ? [] : []; } catch { return []; } }
const seedC: Course[] = SEED_COURSES.map(c => ({ ...c }));
const seedB: Post[] = SEED_BLOG.map(b => ({ ...b }));

export default function AdminContentPage() {
  const [, nav] = useLocation();
  const [courses, setCourses] = useState<Course[]>(() => {
    try { const r = localStorage.getItem(LS_C); return r ? (JSON.parse(r) as Course[]) : seedC; } catch { return seedC; }
  });
  const [posts, setPosts] = useState<Post[]>(() => {
    try { const r = localStorage.getItem(LS_B); return r ? (JSON.parse(r) as Post[]) : seedB; } catch { return seedB; }
  });
  const [tab, setTab] = useState<"courses" | "blog">("courses");

  const [cTitle, setCTitle] = useState(""); const [cProv, setCProv] = useState(""); const [cCat, setCCat] = useState("");
  const [bTitle, setBTitle] = useState(""); const [bEx, setBEx] = useState("");

  const addCourse = () => {
    if (!cTitle.trim()) return toast.error("Enter a course title");
    const c: Course = { id: `c-${Date.now()}`, title: cTitle, category: cCat || "Career Skills", duration: "4 weeks", level: "Beginner", lessons: 8, description: cProv || "Self-paced course published via the admin console.", free: true };
    const next = [c, ...courses];
    setCourses(next); localStorage.setItem(LS_C, JSON.stringify(next));
    setCTitle(""); setCProv(""); setCCat("");
    toast.success("Course published");
  };
  const addPost = () => {
    if (!bTitle.trim()) return toast.error("Enter a post title");
    const p: Post = { id: `b-${Date.now()}`, title: bTitle, category: "Market Insights", readMin: 4, date: new Date().toISOString().slice(0, 10), excerpt: bEx || "New editorial post published via the admin console." };
    const next = [p, ...posts];
    setPosts(next); localStorage.setItem(LS_B, JSON.stringify(next));
    setBTitle(""); setBEx("");
    toast.success("Blog post published");
  };

  return (
    <>
      <PortalHeader role="admin" title="Content manager" subtitle="Courses and editorial content for the public Career Hub." />

      <div className="flex gap-2 mb-6">
        {(["courses", "blog"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${tab === t ? "bg-[#166534] text-white" : "bg-card border border-border"}`}>{t}</button>
        ))}
      </div>

      {tab === "courses" && (
        <>
          <div className="bg-card rounded-lg border border-border p-4 mb-4 flex flex-wrap gap-2 items-end">
            <div className="flex-1 min-w-[160px]"><label className="block text-[10px] uppercase tracking-wide text-muted-foreground mb-1 font-semibold">Title</label><input value={cTitle} onChange={e => setCTitle(e.target.value)} className="input-std" /></div>
            <div className="flex-1 min-w-[140px]"><label className="block text-[10px] uppercase tracking-wide text-muted-foreground mb-1 font-semibold">Provider</label><input value={cProv} onChange={e => setCProv(e.target.value)} className="input-std" /></div>
            <div className="flex-1 min-w-[140px]"><label className="block text-[10px] uppercase tracking-wide text-muted-foreground mb-1 font-semibold">Category</label><select value={cCat} onChange={e => setCCat(e.target.value)} className="select-std"><option value="">Select...</option>{INDUSTRIES.map(i => <option key={i}>{i}</option>)}</select></div>
            <button onClick={addCourse} className="btn-press px-4 py-2 rounded-md bg-[#166534] text-white text-sm font-semibold flex items-center gap-1.5"><Plus className="h-4 w-4" /> Publish</button>
          </div>
          <div className="space-y-2">
            {courses.map(c => (
              <div key={c.id} className="bg-card rounded-lg border border-border p-4 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px]">
                  <p className="text-sm font-semibold">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.category} · {c.duration} · {c.level} · {c.lessons} lessons · {c.free ? "Free" : "Paid"}</p>
                </div>
                <button onClick={() => { const next = courses.filter(x => x.id !== c.id); setCourses(next); localStorage.setItem(LS_C, JSON.stringify(next)); toast.success("Course removed"); }}
                  className="p-2 rounded-md border border-border text-muted-foreground hover:text-[#b91c1c]"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "blog" && (
        <>
          <div className="bg-card rounded-lg border border-border p-4 mb-4 flex flex-wrap gap-2 items-end">
            <div className="flex-1 min-w-[160px]"><label className="block text-[10px] uppercase tracking-wide text-muted-foreground mb-1 font-semibold">Title</label><input value={bTitle} onChange={e => setBTitle(e.target.value)} className="input-std" /></div>
            <div className="flex-1 min-w-[160px]"><label className="block text-[10px] uppercase tracking-wide text-muted-foreground mb-1 font-semibold">Excerpt</label><input value={bEx} onChange={e => setBEx(e.target.value)} className="input-std" /></div>
            <button onClick={addPost} className="btn-press px-4 py-2 rounded-md bg-[#166534] text-white text-sm font-semibold flex items-center gap-1.5"><Plus className="h-4 w-4" /> Publish</button>
          </div>
          <div className="space-y-2">
            {posts.map(p => (
              <div key={p.id} className="bg-card rounded-lg border border-border p-4 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px]">
                  <p className="text-sm font-semibold">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.category} · {p.date} · {p.readMin} min read</p>
                </div>
                <button onClick={() => { const next = posts.filter(x => x.id !== p.id); setPosts(next); localStorage.setItem(LS_B, JSON.stringify(next)); toast.success("Post removed"); }}
                  className="p-2 rounded-md border border-border text-muted-foreground hover:text-[#b91c1c]"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        </>
      )}

      <button onClick={() => nav("/blog")} className="text-xs font-semibold text-[#166534] underline underline-offset-2 mt-6">Preview public Career Hub</button>
    </>
  );
}
