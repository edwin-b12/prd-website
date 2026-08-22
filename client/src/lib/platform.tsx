/* TalentKenya platform state — role auth, profile, applications, saved jobs, alerts,
   employer posting + payments, admin actions. localStorage persistence. */
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { APPLICATIONS as SEED_APPLICATIONS, JOBS as SEED_JOBS, TRANSACTIONS as SEED_TX, type AppStatus, type Application, type Candidate, type Job, type UserRole } from "./data";

const LS_KEY = "talentkenya-state-v1";

interface Profile {
  firstName: string; lastName: string; title: string; phone: string; email: string;
  county: string; town: string; linkedin: string;
  experience: { company: string; role: string; start: string; end: string; achievements: string }[];
  education: { institution: string; degree: string; field: string; year: string }[];
  skills: string[];
  interviewAvailability?: { days: string[]; windows: string[] };
}

const EMPTY_PROFILE: Profile = { firstName: "", lastName: "", title: "", phone: "", email: "", county: "", town: "", linkedin: "", experience: [], education: [], skills: [] };

export interface ProfileCompletion { section: string; done: boolean; fields: number; filled: number; }

export interface SavedAlert { id: string; query: string; county: string; category: string; frequency: "Daily" | "Weekly"; active: boolean; createdAt: string; }

export interface SavedSearch { id: string; name: string; filters: SavedSearchFilters; active: boolean; createdAt: string; }

export interface SavedSearchFilters {
  q: string; county: string; experience: string; jobType: string; workMode: string;
    category: string; salaryMin: string; salaryMax: string; salaryPublic: boolean; featured: boolean;
}

export interface Notification {
  id: string; kind: "new_match" | "interview" | "alert_digest" | "application" | "offer";
  title: string; description: string; link: string; read: boolean; createdAt: string;
}

export interface InterviewResponse { status: "proposed" | "accepted" | "reschedule_requested"; respondedAt?: string; proposedAlternative?: { date: string; time: string; reason: string }; employerResponse?: "pending" | "approved" | "declined"; }

export interface Offer {
  id: string; jobId: string; title: string; company: string;
  amount: number; currency: "KES"; start: string; probationMonths: string; terms: string;
  status: "sent" | "accepted" | "negotiating" | "finalized";
  createdAt: string; updatedAt: string;
  counter?: { amount: number; start: string; terms: string; note: string; candidateName: string };
  counterResponse?: "accepted" | "declined";
}

export interface PostedJob {
  id: string; title: string; company: string; county: string; category: string;
  jobType: string; workMode: string; experience: string; minSalary: string; maxSalary: string;
  description: string; requirements: string[]; deadline: string; tier: "standard" | "featured";
  amount: number; status: "pending_approval" | "active" | "expired" | "draft";
  paymentStatus: "unpaid" | "pending" | "paid"; postedAt: string;
}

interface PlatformState {
  role: UserRole | null;           // null = guest
  email: string;
  profile: Profile;
  applications: Application[];     // candidate's applications (+ seed)
  savedJobs: string[];             // job ids
  alerts: SavedAlert[];
  savedSearches: SavedSearch[];
  notifications: Notification[];
  postedJobs: PostedJob[];
  transactions: typeof SEED_TX;
  candidateMatches: { jobId: string; score: number }[];
  unlockedCandidates: string[];
  importedCandidates: Candidate[];
  offers: Offer[];
  hiredJobs: string[]; // job ids fully filled via offer acceptance
  verifications: { id: string; company: string; kraPin: string; regNumber: string; status: "pending" | "approved" | "rejected" }[];
  moderationQueue: { id: string; title: string; company: string; status: "pending" | "approved" | "flagged" }[];
}

const DEFAULT_STATE: PlatformState = {
  role: null, email: "", profile: EMPTY_PROFILE, applications: SEED_APPLICATIONS, savedJobs: [],
  alerts: [], savedSearches: [], notifications: [], postedJobs: [], transactions: SEED_TX, candidateMatches: [], unlockedCandidates: [], importedCandidates: [],
  verifications: [
    { id: "v1", company: "Pamoja Media Network", kraPin: "P059012345I", regNumber: "PVT-I4S1W6", status: "pending" },
  ],
  hiredJobs: [],
  offers: [
    {
      id: "of-seed1", jobId: "j1", title: "Senior Full-Stack Engineer", company: "Meridian Construction Group",
      amount: 280000, currency: "KES", start: "2026-09-01", probationMonths: "3", terms: "Medical cover, device allowance, 21 leave days.",
      status: "sent", createdAt: "2026-08-10", updatedAt: "2026-08-10",
    },
  ],
  moderationQueue: [
    { id: "m1", title: "Social Media Manager", company: "Pamoja Media Network", status: "pending" },
    { id: "m2", title: "Content Writer (Swahili)", company: "Pamoja Media Network", status: "flagged" },
  ],
};

function load(): PlatformState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch { return DEFAULT_STATE; }
}

export interface PlatformCtx extends PlatformState {
  signUp: (role: UserRole, email: string) => void;
  signIn: (role: UserRole, email: string) => void;
  signOut: () => void;
  switchRole: (role: UserRole) => void;
  updateProfile: (p: Partial<Profile>) => void;
  applyToJob: (jobId: string, answers: string[], coverLetter: string) => void;
  withdrawApplication: (appId: string) => void;
  toggleSaveJob: (jobId: string) => void;
  addAlert: (a: Omit<SavedAlert, "id" | "createdAt" | "active">) => void;
  toggleAlert: (id: string) => void;
  deleteAlert: (id: string) => void;
  saveSearch: (name: string, filters: SavedSearchFilters) => void;
  toggleSavedSearch: (id: string) => void;
  deleteSavedSearch: (id: string) => void;
  runSavedSearch: (search: SavedSearch, jobs?: Job[]) => { matched: Job[]; count: number };
  addNotification: (n: Omit<Notification, "id" | "read" | "createdAt">) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  scheduleInterview: (appId: string, iv: NonNullable<Application["interview"]>) => void;
  cancelInterview: (appId: string) => void;
  postJob: (job: Omit<PostedJob, "id" | "status" | "paymentStatus" | "postedAt">) => void;
  payJob: (jobId: string, channel: "mpesa_stk" | "card") => void;
  moveApplication: (appId: string, status: AppStatus) => void;
  rateApplication: (appId: string, rating: number) => void;
  noteApplication: (appId: string, notes: string) => void;
  acceptInterview: (appId: string) => void;
  requestInterviewReschedule: (appId: string, alt: { date: string; time: string; reason: string }) => void;
  createOffer: (jobId: string, offer: Omit<Offer, "id" | "jobId" | "status" | "createdAt" | "updatedAt">) => string;
  acceptOffer: (offerId: string) => void;
  negotiateOffer: (offerId: string, counter: { amount: number; start: string; terms: string; note: string }) => void;
  employerRespondCounter: (offerId: string, decision: "accepted" | "declined") => void;
  finalizeOffer: (offerId: string) => void; // offer accepted + employer confirmed → hired & job filled
  employerDecideReschedule: (appId: string, decision: "approved" | "declined") => void;
  unlockCandidate: (id: string) => void;
  importCandidates: (list: Candidate[]) => void;
  approveVerification: (id: string) => void;
  rejectVerification: (id: string) => void;
  approveModeration: (id: string) => void;
  rejectModeration: (id: string) => void;
  markTransactionReconciled: (id: string) => void;
}

const Ctx = createContext<PlatformCtx | null>(null);

export function PlatformProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlatformState>(() => load());

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }, [state]);

  const set = useCallback((fn: (s: PlatformState) => PlatformState) => setState(fn), []);

  const ctx: PlatformCtx = {
    ...state,
    signUp: (role, email) => set(s => ({ ...s, role, email, profile: { ...s.profile, email } })),
    signIn: (role, email) => set(s => ({ ...s, role, email, profile: { ...s.profile, email } })),
    signOut: () => set(s => ({ ...s, role: null, email: "" })),
    switchRole: (role) => set(s => ({ ...s, role })),
    updateProfile: (p) => set(s => ({ ...s, profile: { ...s.profile, ...p } })),
    applyToJob: (jobId, answers, coverLetter) => set(s => {
      if (s.applications.some(a => a.jobId === jobId)) return s;
      const job = [...SEED_JOBS, ...s.postedJobs].find(j => j.id === jobId);
      const newApp: Application = {
        id: `app-${Date.now()}`, jobId, candidateId: "me",
        candidateName: `${s.profile.firstName || "Anonymous"} ${s.profile.lastName || "Candidate"}`.trim(),
        candidateTitle: s.profile.title || "Job Seeker", status: "applied", rating: null, notes: "",
        appliedAt: new Date().toISOString().slice(0, 10), screenerAnswers: answers,
        statusHistory: [{ status: "applied", changedAt: new Date().toISOString().slice(0, 10), changedBy: "candidate" }],
      };
      void coverLetter;
      return { ...s, applications: [newApp, ...s.applications], savedJobs: s.savedJobs.filter(id => id !== jobId) };
    }),
    withdrawApplication: (appId) => set(s => ({ ...s, applications: s.applications.filter(a => a.id !== appId) })),
    toggleSaveJob: (jobId) => set(s => ({ ...s, savedJobs: s.savedJobs.includes(jobId) ? s.savedJobs.filter(id => id !== jobId) : [...s.savedJobs, jobId] })),
    addAlert: (a) => set(s => ({ ...s, alerts: [...s.alerts, { ...a, id: `al-${Date.now()}`, createdAt: new Date().toISOString().slice(0, 10), active: true }] })),
    toggleAlert: (id) => set(s => ({ ...s, alerts: s.alerts.map(a => a.id === id ? { ...a, active: !a.active } : a) })),
    deleteAlert: (id) => set(s => ({ ...s, alerts: s.alerts.filter(a => a.id !== id) })),
    saveSearch: (name, filters) => set(s => ({ ...s, savedSearches: [...s.savedSearches, { id: `ss-${Date.now()}`, name: name.trim() || `Saved search`, filters, active: true, createdAt: new Date().toISOString().slice(0, 10) }] })),
    toggleSavedSearch: (id) => set(s => ({ ...s, savedSearches: s.savedSearches.map(a => a.id === id ? { ...a, active: !a.active } : a) })),
    deleteSavedSearch: (id) => set(s => ({ ...s, savedSearches: s.savedSearches.filter(a => a.id !== id) })),
    runSavedSearch: (search, jobs) => {
      const all = (jobs ?? [...SEED_JOBS, ...state.postedJobs]) as Job[];
      const f = search.filters;
      const ql = f.q.trim().toLowerCase();
      const matched = all.filter(job => {
        if (ql) {
          const hay = `${job.title} ${job.category} ${job.description} ${job.county}`.toLowerCase();
          if (!ql.split(/\s+/).every(t => hay.includes(t))) return false;
        }
        if (f.county && job.county !== f.county) return false;
        if (f.experience && job.experience !== f.experience) return false;
        if (f.jobType && job.jobType !== f.jobType) return false;
        if (f.workMode && job.workMode !== f.workMode) return false;
        if (f.category && job.category !== f.category) return false;
        if (f.salaryPublic && !job.salaryPublic) return false;
        if (f.featured && !job.featured) return false;
        if (f.salaryMin && job.maxSalary && job.maxSalary < Number(f.salaryMin)) return false;
        if (f.salaryMax && job.minSalary && job.minSalary > Number(f.salaryMax)) return false;
        return true;
      });
      return { matched, count: matched.length };
    },
    addNotification: (n) => set(s => ({ ...s, notifications: [{ ...n, id: `nt-${Date.now()}-${Math.floor(Math.random() * 9000)}`, read: false, createdAt: new Date().toISOString().slice(0, 10) }, ...s.notifications].slice(0, 40) })),
    markNotificationRead: (id) => set(s => ({ ...s, notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n) })),
    markAllNotificationsRead: () => set(s => ({ ...s, notifications: s.notifications.map(n => ({ ...n, read: true })) })),
    postJob: (job) => set(s => ({ ...s, postedJobs: [{ ...job, id: `pj-${Date.now()}`, status: job.tier === "featured" ? "active" : "pending_approval", paymentStatus: "unpaid", postedAt: new Date().toISOString().slice(0, 10) }, ...s.postedJobs] })),
    payJob: (jobId, channel) => set(s => ({
      ...s,
      postedJobs: s.postedJobs.map(j => j.id === jobId ? { ...j, paymentStatus: "paid", status: j.status === "expired" ? "expired" : (j.tier === "featured" ? "active" : "pending_approval") } : j),
      transactions: [{ id: `tx-${Date.now()}`, employer: s.email, company: "Your Company", amount: s.postedJobs.find(j => j.id === jobId)?.amount ?? 0, channel, reference: channel === "mpesa_stk" ? `STK${Math.floor(Math.random() * 9e9)}` : `CARD-${Math.floor(Math.random() * 9000) + 1000}`, purpose: "Job Posting", status: "completed", date: new Date().toISOString().slice(0, 10) }, ...s.transactions],
    })),
    moveApplication: (appId, status) => set(s => ({ ...s, applications: s.applications.map(a => a.id === appId ? { ...a, status, statusHistory: [...(a.statusHistory ?? []), { status, changedAt: new Date().toISOString().slice(0, 10), changedBy: "employer" }] } : a) })),
    rateApplication: (appId, rating) => set(s => ({ ...s, applications: s.applications.map(a => a.id === appId ? { ...a, rating } : a) })),
    noteApplication: (appId, notes) => set(s => ({ ...s, applications: s.applications.map(a => a.id === appId ? { ...a, notes } : a) })),
    createOffer: (jobId, offer) => {
      const now = new Date().toISOString().slice(0, 10);
      const id = `of-${Date.now()}`;
      set(s => ({
        ...s,
        offers: [{ id, jobId, ...offer, status: "sent", createdAt: now, updatedAt: now }, ...s.offers],
      }));
      return id;
    },
    acceptOffer: (offerId) => set(s => {
      const o = s.offers.find(x => x.id === offerId);
      if (!o) return s;
      return {
        ...s,
        offers: s.offers.map(x => x.id === offerId ? { ...x, status: "accepted" as const, updatedAt: new Date().toISOString().slice(0, 10) } : x),
        notifications: [{ id: `nt-${Date.now()}`, kind: "offer" as const, title: `Offer accepted — awaiting confirmation`, description: `You accepted the offer of KES ${o.amount.toLocaleString()} per month with ${o.company}. Confirm the terms with the employer to be hired.`, link: "/candidate/offers", read: false, createdAt: new Date().toISOString().slice(0, 10) }, ...s.notifications].slice(0, 40),
      };
    }),
    negotiateOffer: (offerId, counter) => set(s => {
      const o = s.offers.find(x => x.id === offerId);
      if (!o) return s;
      return {
        ...s,
        offers: s.offers.map(x => x.id === offerId ? { ...x, status: "negotiating" as const, counter: { ...counter, candidateName: `${s.profile.firstName || "Candidate"} ${s.profile.lastName || ""}`.trim() }, updatedAt: new Date().toISOString().slice(0, 10) } : x),
      };
    }),
    employerRespondCounter: (offerId, decision) => set(s => {
      const o = s.offers.find(x => x.id === offerId);
      if (!o) return s;
      const now = new Date().toISOString().slice(0, 10);
      return {
        ...s,
        offers: s.offers.map(x => x.id === offerId ? { ...x, counterResponse: decision, status: decision === "accepted" ? "finalized" as const : "sent" as const, updatedAt: now } : x),
        applications: decision === "accepted"
          ? (() => {
              const apps = s.applications.filter(a => a.jobId === o.jobId);
              const target = apps.find(a => !s.hiredJobs.includes(a.jobId));
              return target ? s.applications.map(a => a.id === target.id ? { ...a, status: "hired" as AppStatus, hiredAt: now } : a) : s.applications;
            })()
          : s.applications,
        hiredJobs: decision === "accepted" && !s.hiredJobs.includes(o.jobId) ? [...s.hiredJobs, o.jobId] : s.hiredJobs,
        notifications: decision === "accepted"
          ? [{ id: `nt-${Date.now()}`, kind: "offer" as const, title: `Counter accepted — you're hired`, description: `${o.company} accepted your counter of KES ${o.counter?.amount.toLocaleString()} per month. You've been moved to Hired and the role is filled.`, link: "/candidate/dashboard", read: false, createdAt: now }, ...s.notifications].slice(0, 40)
          : s.notifications,
      };
    }),
    finalizeOffer: (offerId) => set(s => {
      const o = s.offers.find(x => x.id === offerId);
      if (!o) return s;
      const now = new Date().toISOString().slice(0, 10);
      const apps = s.applications.filter(a => a.jobId === o.jobId);
      const target = apps.find(a => !s.hiredJobs.includes(a.jobId));
      return {
        ...s,
        offers: s.offers.map(x => x.id === offerId ? { ...x, status: "finalized" as const, updatedAt: now } : x),
        applications: target
          ? s.applications.map(a => a.id === target.id ? { ...a, status: "hired" as AppStatus, interview: a.interview, hiredAt: now, statusHistory: [...(a.statusHistory ?? []), { status: "hired" as AppStatus, changedAt: now, changedBy: "system" }] } : a)
          : s.applications,
        hiredJobs: target ? [...s.hiredJobs, o.jobId] : s.hiredJobs,
        notifications: [{ id: `nt-${Date.now()}`, kind: "offer" as const, title: `You're hired — ${o.title}`, description: `${o.company} confirmed your final offer: KES ${(o.counter?.amount ?? o.amount).toLocaleString()} per month starting ${o.counter?.start ?? o.start}. Welcome aboard!`, link: "/candidate/dashboard", read: false, createdAt: now }, ...s.notifications].slice(0, 40),
      };
    }),
    scheduleInterview: (appId, iv) => set(s => {
      const app = s.applications.find(a => a.id === appId);
      return {
        ...s,
        applications: s.applications.map(a => a.id === appId ? { ...a, interview: iv } : a),
        notifications: app ? [{ id: `nt-${Date.now()}`, kind: "interview" as const, title: "Interview scheduled", description: `New interview: ${app.candidateName} — ${iv.type} on ${iv.date} at ${iv.time}${iv.location ? ` · ${iv.location}` : ""}`, link: "/candidate/applications", read: false, createdAt: new Date().toISOString().slice(0, 10) }, ...s.notifications].slice(0, 40) : s.notifications,
      };
    }),
    cancelInterview: (appId) => set(s => ({ ...s, applications: s.applications.map(a => a.id === appId ? { ...a, interview: null } : a) })),
    acceptInterview: (appId) => set(s => ({
      ...s,
      applications: s.applications.map(a => a.id === appId && a.interview ? {
        ...a,
        interview: { ...a.interview, response: { status: "accepted", respondedAt: new Date().toISOString().slice(0, 10), employerResponse: "pending" } },
      } : a),
    })),
    requestInterviewReschedule: (appId, alt) => set(s => ({
      ...s,
      applications: s.applications.map(a => a.id === appId && a.interview ? {
        ...a,
        interview: { ...a.interview, response: { status: "reschedule_requested", respondedAt: new Date().toISOString().slice(0, 10), proposedAlternative: alt, employerResponse: "pending" } },
      } : a),
    })),
    employerDecideReschedule: (appId, decision) => set(s => {
      const app = s.applications.find(a => a.id === appId);
      const alt = app?.interview?.response?.proposedAlternative;
      return {
        ...s,
        applications: s.applications.map(a => a.id === appId && a.interview ? {
          ...a,
          interview: {
            ...a.interview,
            ...(a.interview.response
              ? { response: { ...a.interview.response, employerResponse: decision } as NonNullable<Application["interview"]>["response"] }
              : { response: undefined as never }),
            ...(decision === "approved" && alt ? { date: alt.date, time: alt.time } : {}),
          },
        } : a),
        notifications: app && alt ? [
          { id: `nt-${Date.now()}`, kind: "interview" as const, title: `Reschedule ${decision === "approved" ? "approved" : "declined"}`, description: decision === "approved" ? `New time confirmed: ${alt.date} at ${alt.time}.` : "Employer couldn't offer the alternative time — original slot stands.", link: "/candidate/applications", read: false, createdAt: new Date().toISOString().slice(0, 10) },
          ...s.notifications,
        ].slice(0, 40) : s.notifications,
      };
    }),
    unlockCandidate: (id) => set(s => ({ ...s, unlockedCandidates: [...s.unlockedCandidates, id], candidateMatches: [...s.candidateMatches, { jobId: "pool", score: 0 }] })),
    importCandidates: (list) => set(s => {
      const newOnes = list.filter(c => !s.importedCandidates.some(ic => ic.id === c.id));
      if (!newOnes.length) return s;
      return { ...s, importedCandidates: [...newOnes, ...s.importedCandidates] };
    }),
    approveVerification: (id) => set(s => ({ ...s, verifications: s.verifications.map(v => v.id === id ? { ...v, status: "approved" } : v) })),
    rejectVerification: (id) => set(s => ({ ...s, verifications: s.verifications.map(v => v.id === id ? { ...v, status: "rejected" } : v) })),
    approveModeration: (id) => set(s => ({ ...s, moderationQueue: s.moderationQueue.map(m => m.id === id ? { ...m, status: "approved" } : m) })),
    rejectModeration: (id) => set(s => ({ ...s, moderationQueue: s.moderationQueue.filter(m => m.id !== id) })),
    markTransactionReconciled: (id) => set(s => ({ ...s, transactions: s.transactions.map(t => t.id === id && t.status === "completed" ? t : t) })),
  };

  return <Ctx.Provider value={ctx}>{children}</Ctx.Provider>;
}

export function usePlatform() {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePlatform must be used within PlatformProvider");
  return c;
}

export function profileCompletion(p: Profile): { pct: number; sections: ProfileCompletion[] } {
  const sections: ProfileCompletion[] = [
    { section: "Personal details", done: !!(p.firstName && p.lastName && p.email && p.phone), fields: 4, filled: [p.firstName, p.lastName, p.email, p.phone].filter(Boolean).length },
    { section: "Professional title & location", done: !!(p.title && p.county), fields: 2, filled: [p.title, p.county].filter(Boolean).length },
    { section: "Work experience", done: p.experience.length >= 1, fields: 1, filled: p.experience.length ? 1 : 0 },
    { section: "Education", done: p.education.length >= 1, fields: 1, filled: p.education.length ? 1 : 0 },
    { section: "Skills (3+)", done: p.skills.length >= 3, fields: 3, filled: Math.min(p.skills.length, 3) },
  ];
  const total = sections.reduce((a, s) => a + s.fields, 0);
  const filled = sections.reduce((a, s) => a + s.filled, 0);
  const pct = Math.round((filled / total) * 100);
  return { pct, sections };
}
