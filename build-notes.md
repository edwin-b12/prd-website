# TalentKenya Build Notes (working state)

## Task
Rebuild project as fully functional, market-ready MVP job board "TalentKenya" per user's PRD (in /home/ubuntu/upload/pasted_content.txt). Requirements: public pages (home, jobs search w/ 47 counties, job detail + 1-click apply, companies, courses, blog, employers pricing), candidate portal (dashboard, profile, applications, saved jobs, alerts, resume builder), employer portal (dashboard, job wizard, ATS kanban, talent search, company profile, billing), admin center (verifications, moderation, finance, content). Responsive, functional, no demo placeholders, modern.

## Design (ideas.md)
"Professional Meridian": Sora headings + Inter body + JetBrains Mono. Deep green #166534 primary, red #D6332B accent, near-white bg. Kenyan flag strip (3px gradient black/red/green) on pages. Sharp 6px radius. Mobile-first. CSS vars in index.css done.

## Assets (use URLs exactly)
- Logo: /manus-storage/tk-logo_2fd2e6d2.png
- Hero: /manus-storage/tk-hero_5df8207e.jpg (16:9 woman w/ phone)
- Office: /manus-storage/tk-hero-office_19c20ca6.jpg (16:9 team)
- Candidates: /manus-storage/tk-candidates_4c75c63a.jpg (4:3 job seekers)
- Employer: /manus-storage/tk-employer_b43fc5f6.jpg (4:3 interview)

## Data layer DONE: client/src/lib/data.ts
Types + seed: COMPANIES(10), JOBS(40, ids j1-j40), CANDIDATES(6, d1-d6), APPLICATIONS(6, a1-a6), COURSES(12), BLOG(10), TRANSACTIONS(8), PRICING(4), constants (COUNTIES, INDUSTRIES, EXPERIENCE_LEVELS, JOB_TYPES, WORK_MODES, ATS_STAGES, STAGE_LABELS, KES()).
- NOTE: JOBS helper `j()` takes 19 args — I passed 23 (added benefits+featured+urgent etc). MUST fix: either add benefits param to helper or adjust call sites. All 40 call sites use: id,companyId,title,slug,category,jobType,workMode,county,experience,minSalary,maxSalary,salaryPublic,description,requirements[14],benefits,featured,urgent,daysAgo,views = actual = 19 params; verify count.
- Old ecommerce pages/components deleted except ui/, ErrorBoundary, ManusDialog, NotFound, pages/Home.tsx and PRDDocument.tsx remain (broken imports). Need to rewrite App.tsx + Home (landing), delete TocSidebar/PriorityBadge refs.

## Remaining
1. Fix data.ts helper arg count (check j() def).
2. Create platform state context: lib/platform.tsx (role state candidate/employer/admin + localStorage persistence, applications, saved jobs, profile, posted jobs, alerts, transactions).
3. Components: PublicLayout (Header+Footer w/ flag strip), SidebarLayout for portals, shared chips/badges, KanbanBoard, ResumePDF.
4. Pages: Home, Jobs, JobDetail, Companies, CompanyDetail, Courses, Blog, BlogPost, Employers(pricing), Auth(login/register), Candidate: Dashboard/ProfileBuilder/Applications/SavedJobs/Alerts/ResumeBuilder; Employer: Dashboard/JobWizard/ManageJobs/ATS/TalentSearch/CompanyProfile/Billing; Admin: Dashboard/Verifications/Moderation/Finance/Content.
5. App.tsx routes all.
6. Screenshot verify + checkpoint + deliver.

## Pricing (KES): Standard 4,999 / Featured Pro 11,999 / Talent Pool 24,999 monthly / Headhunt custom. Candidate Pro CV 999.

## PROGRESS UPDATE (phase 2-3)
DONE so far:
- index.css (design system), index.html (fonts Sora/Inter/JetBrains Mono, favicon), data.ts (seed data, FIXED arg issue — j() takes 19 args: id,companyId,title,slug,category,jobType,workMode,county,experience,min,max,salaryPublic,description,requirements[],benefits[],featured,urgent,daysAgo,views)
- lib/platform.tsx (PlatformProvider: role/signUp/signIn/signOut/switchRole/updateProfile/applyToJob/withdrawApplication/toggleSaveJob/addAlert/toggleAlert/deleteAlert/postJob/payJob/moveApplication/rateApplication/noteApplication/unlockCandidate/approve|rejectVerification/approve|rejectModeration; profileCompletion(p) returns pct+sections; localStorage key talentkenya-state-v1)
- components/primitives.tsx (Badge variants: default/featured/urgent/remote/verified/outline/red/green/gray; MatchRing; KESAmount; daysAgo; statusColor)
- components/Header.tsx (flag strip, sticky nav, role menu with switch demo, mobile sheet)

NEXT TO CREATE:
- components/Footer.tsx, components/Layout.tsx (PublicLayout), components/PortalLayout.tsx (sidebar dashboards w/ bottom nav mobile)
- components/JobCard.tsx (card for search results w/ save + apply buttons + salary)
- pages: Home, Jobs, JobDetail, Companies, CompanyDetail, Courses, Blog, BlogPost, Employers, Auth, Candidate/* (dashboard, profile, applications, saved, alerts, resume-builder), Employer/* (dashboard, post-job, manage, ats/[id], talent-search, company, billing), Admin/* (dashboard, verifications, moderation, finance, content), NotFound update
- App.tsx rewrite: wrap in PlatformProvider, routes: /, /jobs, /jobs/:slug, /companies, /companies/:slug, /courses, /blog, /blog/:id, /employers, /auth, /candidate/*, /employer/*, /admin/*
- Then screenshots, checkpoint, deliver.

NOTE: old App.tsx references deleted ecommerce pages — must rewrite entirely.
Candidate portal path ids: dashboard, profile, applications, saved-jobs, alerts, resume-builder.
Employer: dashboard, post-job, manage-jobs, ats/:jobId, talent-search, company, billing.
Admin: dashboard, verifications, moderation, finance, content.

## PROGRESS UPDATE 2 (phase 3)
DONE: Footer.tsx (imports LOGO from @/lib/brand), lib/brand.ts (LOGO /manus-storage/tk-logo_2fd2e6d2.png, HERO_IMG tk-hero_48b74d71.jpg, HERO_OFFICE_IMG tk-hero-office_1898611e.jpg, CANDIDATES_IMG tk-candidates_98ab6b24.jpg, EMPLOYER_IMG tk-employer_55a17413.jpg), Layout.tsx (PublicLayout, PortalLayout role-gated w/ sidebar+mobile bottom nav, PortalHeader, StatCard), JobCard.tsx (uses usePlatform toggleSaveJob + toast; imports from @/components/primitives: Badge,KESAmount,daysAgo,MatchRing), HomePage.tsx (industries=INDUSTRIES constant), JobsPage.tsx (full filter engine w/ URL params: q,county,experience,jobType,workMode,category,salaryMin,salaryMax,salaryPublic,featured,sort).

data.ts exports: COUNTIES, INDUSTRIES, EXPERIENCE_LEVELS, JOB_TYPES, WORK_MODES, ATS_STAGES, STAGE_LABELS (Record<AppStatus,string>), KES(), COMPANIES (c1-c10 w/ logoColor,openJobs,verified,kraPin,regNumber), JOBS (j1-j40), CANDIDATES (d1-d6 w/ matchScore,skills,unlocked), APPLICATIONS (a1-a6), COURSES (cr1-cr12 free:bool), BLOG (posts), TRANSACTIONS (seed tx), PRICING [{name,target,price(duration-agnostic),duration,features[],featured,highlight}]: Standard 4999 30d; Featured Pro 11999 45d (highlight:true); Talent Pool 24999 Monthly; Executive Headhunt null price "Per placement". Also types: UserRole, JobStatus, AppStatus, PaymentStatus, WorkMode, JobType, ExperienceLevel, Company{openJobs}, Job{views,posted,deadline,screeners,screenerQuestions[]}, Candidate{matchScore,skills,unlocked}, Application{rating,notes,appliedAt,screenerAnswers}, Course{free}, BlogPost{id,title,category,readMin,date,excerpt,body[]}, Transaction{employer,company,amount,channel mpesa_stk|card|bank,reference,purpose,status,date}.

PRICING fields: name,target,price(number|null),duration,features[],featured(bool),highlight(bool).

CSS classes available (index.css): font-heading, font-mono-num, btn-press, input-std, select-std, flag-strip (Kenyan flag thin strip), fade-up, .card etc. Dark green #062a17, green #166534/#14532d, accent green-light #7fe0a0, red #b91c1c.

STILL TO BUILD (public): JobDetailPage(/jobs/:slug w/ screener apply modal + 1-click apply + cover letter generator + email confirmation), CompaniesPage, CompanyDetailPage, CoursesPage, BlogPage + BlogPostPage, EmployersPage(pricing), AuthPage(register w/ role tabs + login), NotFound update + /about,/contact,/privacy,/terms,/faqs (can reuse PolicyPage-ish simple pages), App.tsx full route wiring w/ PlatformProvider.
NOTE: old pages dir had PolicyPage.tsx and NotFound.tsx leftover — keep NotFound; delete or repurpose PolicyPage.

## PROGRESS UPDATE 3 (public pages DONE)
DONE public pages: HomePage, JobsPage (filter engine), JobDetailPage (1-click apply modal w/ screener Qs + cover letter draft + ref confirmation), CompaniesPage (search+industry), CompanyDetailPage (/companies/:slug w/ description+values+open roles), CoursesPage (category pills, free/premium, toast enroll), BlogPage (/blog + featured card), BlogPostPage (/blog/:id), EmployersPage (#pricing anchor, PRICING cards from data.ts), AuthPage (/auth?mode=login|register w/ role tabs candidate|employer +254 phone validation, KDPA consent).

COMPANY FIELDS: id,name,slug,industry,county,town,website,kraPin,regNumber,kycApproved,staffSize,founded,description,verified,logoColor,openJobs. No about/culture — use description + hardcoded values.
JOB FIELDS: id,companyId,title,slug,category,jobType,workMode,county,town?,experience,minSalary,maxSalary,salaryPublic,description,requirements[],benefits[],screenerQuestions[{q,type:"yesno"|"mcq"|"text"}] (mcq options = q string split by "|"),status,featured,urgent,deadline,posted,views.

StatCard does NOT accept icon prop. Fix CandidateDashboardPage line ~51 (remove icon prop).

CANDIDATE PAGES REMAINING: ProfilePage (/candidate/profile - full form w/ experience/education/skills + completion bar + Download ATS CV PDF via window.print styled), ApplicationsPage (/candidate/applications - status tabs applied|shortlisted|interview|offered|hired|rejected + withdraw), SavedJobsPage (/candidate/saved-jobs), AlertsPage (/candidate/alerts - create alert query/county/category/frequency + activate), ResumeBuilderPage (/candidate/resume-builder - profile data compiled to single-column ATS cv, print/download).
EMPLOYER PAGES: EmployerDashboardPage, PostJobPage (wizard steps: overview→requirements→compensation→screeners→tier→pay M-Pesa STK w/ Paybill fallback + card), ManageJobsPage, ATSBoardPage (/employer/ats/:jobId - Kanban 6 cols drag-drop moveApplication, rating stars, notes modal, bulk shortlist/reject/export CSV), TalentSearchPage (/employer/talent-search CANDIDATES seed - unlock modal, rating), CompanyProfilePage, BillingPage (invoices M-Pesa receipts).
ADMIN PAGES: AdminDashboard, VerificationsPage (approve/reject v1), ModerationPage (m1 pending, m2 flagged), FinancePage (tx ledger + reconcile), ContentPage (courses/blog manager).
STATIC: AboutPage, ContactPage (form w/ honeypot), FAQsPage (accordion), PrivacyPage, TermsPage (generic KDPA), NotFound update.
THEN: rewrite App.tsx routes + PlatformProvider + NotFound (remove old PolicyPage Contact/FAQ/Size/Accessibility imports).

platform.tsx key API: usePlatform() -> role,email,profile{firstName,lastName,title,phone,email,county,town,linkedin,experience[{company,role,start,end,achievements}],education[{institution,degree,field,year}],skills[]},applications(seed APPLICATIONS),savedJobs,alerts{SavedAlert id,query,county,category,frequency,active,createdAt},postedJobs{PostedJob},transactions,verifications,moderationQueue,candidateMatches,unlockedCandidates.
Actions: signUp(role,email),signIn,signOut,updateProfile(partial),applyToJob(jobId,answers,coverLetter),withdrawApplication(appId),toggleSaveJob,addAlert({query,county,category,frequency}),toggleAlert,deleteAlert,postJob({title,company,county,category,jobType,workMode,experience,minSalary,maxSalary,description,requirements,deadline,tier,amount}),payJob(jobId,channel),moveApplication(appId,status AppStatus),rateApplication(appId,rating),noteApplication(appId,notes),unlockCandidate(id),approveVerification,rejectVerification,approveModeration,rejectModeration,markTransactionReconciled.
profileCompletion(profile) -> {pct, sections[{section,done,fields,filled}]}.

Header.tsx already created at client/src/components/Header.tsx (role menu w/ switchRole? verify - uses usePlatform; may not expose switchRole — Header should show Portal links by role; admin access via role=admin account; signOut needed).

## PROGRESS UPDATE 4
DONE candidate pages: CandidateDashboardPage (/candidate/dashboard), CandidateProfilePage (/candidate/profile), CandidateApplicationsPage (/candidate/applications), CandidateSavedJobsPage (/candidate/saved-jobs), CandidateAlertsPage (/candidate/alerts), CandidateResumePage (/candidate/resume-builder — cv-paper class needs @media print styles in index.css).

DONE employer pages: EmployerDashboardPage (/employer/dashboard — StatCard NO icon prop), EmployerPostJobPage (/employer/post-job — 5-step wizard incl. M-Pesa STK + card checkout; posts then payment; NOTE postJob returns void so job id guessed as pj-${Date.now()} which matches platform.tsx id gen).

NOTE: platform.tsx postJob sets status pending_approval for standard, active for featured. paymentStatus unpaid->paid via payJob.

REMAINING EMPLOYER: ManageJobsPage (/employer/manage-jobs — list postedJobs, activate/expire/boost), ATSBoardPage (/employer/ats and /employer/ats/:jobId — kanban from applications + seed CANDIDATES? no—ATS uses APPLICATIONS seed moved by moveApplication(id,AppStatus), rating stars via rateApplication, notes via noteApplication), TalentSearchPage (/employer/talent-search — CANDIDATES seed w/ unlock via unlockCandidate), EmployerBillingPage (/employer/billing — transactions ledger), EmployerCompanyPage (/employer/company — KRA PIN/regNumber KYC banner).
REMAINING ADMIN: AdminDashboard (/admin/dashboard), AdminVerifications (/admin/verifications), AdminModeration (/admin/moderation), AdminFinance (/admin/finance), AdminContent (/admin/content).
REMAINING STATIC: AboutPage (/about), ContactPage (/contact), FAQsPage (/faqs), PrivacyPage (/privacy), TermsPage (/terms), NotFound (already exists — update).
THEN: rewrite client/src/App.tsx fully: remove old ContactPage/FAQPage/SizeGuidePage/AccessibilityPage/PolicyPage imports; add all TalentKenya routes; NotFound 404.
Header.tsx already shows role menu; verify switchRole not needed (Header can link portals by role).
Footer.tsx exists with TK links — verify footer links match final routes (/about /contact /faqs /privacy /terms /courses /blog /employers /companies).
cv-paper print styles needed in index.css: @media print { body > div {display:none!important} .cv-paper{position:fixed;left:0;top:0;inset:auto!important;margin:0!important;border:none!important;box-shadow:none!important;max-width:100%!important} }
PortalHeader/StatCard from @/components/Layout — check exact props before use.
AppStatus values: applied shortlisted interview offered hired rejected pending completed failed. STAGE_LABELS exists in data.ts.

## PROGRESS UPDATE 5 (phase 5 nearly done)
DONE employer pages (all): EmployerDashboardPage, EmployerPostJobPage (wizard OK, payment OK), EmployerManageJobsPage (/employer/manage-jobs), EmployerATSBoardPage (/employer/ats + /employer/ats/:jobId optional param), EmployerTalentSearchPage (/employer/talent-search — uses CANDIDATES from data.ts with id,name,title,county,experience,skills[],matchScore,rating), EmployerBillingPage (/employer/billing — transactions from platform).

NEXT: EmployerCompanyPage (/employer/company - KYC banner w/ kraPin regNumber from platform.verifications or profile).
THEN admin pages: AdminDashboard (/admin/dashboard), AdminVerifications (/admin/verifications - approveVerification/rejectVerification on verifications[]), AdminModeration (/admin/moderation - approveModeration/rejectModeration on moderationQueue[]), AdminFinance (/admin/finance - transactions + markTransactionReconciled), AdminContent (/admin/content - COURSES/BLOG manager).
THEN static: AboutPage (/about), ContactPage (/contact - form w/ honeypot), FAQsPage (/faqs - accordion), PrivacyPage (/privacy), TermsPage (/terms), update NotFound.
THEN rewrite App.tsx: remove ContactPage/FAQPage/SizeGuidePage/AccessibilityPage/PolicyPage imports (old ecommerce); add all routes under PublicLayout (PublicLayout wraps public routes) and PortalLayout (role="candidate"|"employer"|"admin") — PortalLayout from @/components/Layout has guard (actual===role else gate).
Footer links must match: /about /contact /faqs /privacy /terms /courses /blog /employers /companies. Verify Header role menu links: /candidate/dashboard, /employer/dashboard, /admin/dashboard, /auth, signOut.
THEN: add @media print styles for cv-paper in index.css. Check typescript clean. Screenshot + checkpoint + deliver.
data.ts exports: JOBS(40), COMPANIES, CANDIDATES(seed w/ unlocked:false), COURSES, BLOG, INDUSTRIES, COUNTIES, PRICING[{name,highlight?,target,duration,price:null|number,features[]}], KES(n)=>string, STAGE_LABELS, APPLICATIONS(seed), TRANSACTIONS(seed).
AppStatus: applied|shortlisted|interview|offered|hired|rejected (+pending,completed,failed exist in statusColor map).
assets: LOGO=/manus-storage/... in @/lib/brand.ts; TK hero images: tk-hero.jpg, tk-hero-office.jpg, tk-candidates.jpg, tk-employer.jpg in webdev-static-assets (uploaded via manus-upload-file --webdev → check brand.ts for URLs).

## PROGRESS UPDATE 6 (nearly complete)
DONE admin: AdminDashboardPage (/admin/dashboard), AdminVerificationsPage (/admin/verifications — uses approveVerification/rejectVerification(id)), AdminModerationPage (/admin/moderation — approveModeration/rejectModeration(id)), AdminFinancePage (/admin/finance — transactions use t.employer, t.company, t.purpose, t.reference, t.channel, t.amount, t.status, t.date; NO reconciled field — render status badges only), AdminContentPage (/admin/content — works, localStorage tk-courses/tk-blog, Course shape: id,title,category,duration,level,lessons,description,free).
DONE static: AboutPage (/about — uses LOGO from @/lib/brand + PublicLayout), ContactPage (/contact — honeypot ok), FAQsPage (/faqs).
DONE PrivacyPage (/privacy). Writing TermsPage (/terms) next.
THEN: FULLY REWRITE client/src/App.tsx — current file still imports old ContactPage/FAQPage/SizeGuidePage/AccessibilityPage/PolicyPage (DELETED). New route list:
  Public (PublicLayout): / → HomePage, /jobs → JobsPage, /jobs/:slug → JobDetailPage, /companies → CompaniesPage, /companies/:slug → CompanyDetailPage, /courses → CoursesPage, /blog → BlogPage, /blog/:id → BlogPostPage, /employers → EmployersPage, /about → AboutPage, /contact → ContactPage, /faqs → FAQsPage, /privacy → PrivacyPage, /terms → TermsPage, /auth → AuthPage, /search → SearchPage (if exists; else JobsPage handles keyword via query)
  Candidate (PortalLayout role="candidate"): /candidate/dashboard → CandidateDashboardPage, /candidate/profile → CandidateProfilePage, /candidate/applications → CandidateApplicationsPage, /candidate/saved-jobs → CandidateSavedJobsPage, /candidate/alerts → CandidateAlertsPage, /candidate/resume-builder → CandidateResumePage
  Employer (PortalLayout role="employer"): /employer/dashboard → EmployerDashboardPage, /employer/post-job → EmployerPostJobPage, /employer/manage-jobs → EmployerManageJobsPage, /employer/ats?/:jobId? → EmployerATSBoardPage, /employer/talent-search → EmployerTalentSearchPage, /employer/billing → EmployerBillingPage, /employer/company → EmployerCompanyPage
  Admin (PortalLayout role="admin"): /admin/dashboard → AdminDashboardPage, /admin/verifications → AdminVerificationsPage, /admin/moderation → AdminModerationPage, /admin/finance → AdminFinancePage, /admin/content → AdminContentPage
Check current App.tsx PlatformProvider wrapping — PortalLayout needs PlatformProvider ancestor (add in main.tsx or App).
THEN: NotFound page update (keep), index.css add @media print cv-paper styles (section 6 print). Screenshot (desktop 1280 + mobile 375): /, /jobs, /jobs/:slug, /employer/post-job (wizard), /candidate/dashboard, /admin/dashboard. Fix errors. Checkpoint + deliver with suggestions: real backend (web-db-user), real M-Pesa via API proxy, email notifications.

## PROGRESS UPDATE 7 — VERIFICATION COMPLETE
- All 30+ pages build with ZERO TypeScript errors. App.tsx fully rewritten with complete route tree. Server restarted.
- Verified via screenshots: / (hero search, stats, featured), /jobs (filter sidebar + 40 jobs), /jobs/devops-engineer-savannah (detail w/ salary, 1-click apply, company sidebar), /employer/post-job (5-step wizard), /candidate/dashboard (stats, profile completion 0%), /admin/dashboard (queues), /companies (10 verified directory), /employer/ats (Kanban 6 applicants, mobile OK), /employer/talent-search (unlock flow, credits), /employer/billing (ledger + VAT), /candidate/resume-builder (ATS print layout), /admin/finance (8 tx ledger).
- Job slugs exist like /jobs/devops-engineer-savannah; earlier broken screenshot URL was due to made-up slug.
- REMAINING: checkpoint save + deliver. Suggestions: upgrade to web-db-user for real accounts, M-Pesa API integration, email notifications.

## RESUME PARSER TASK (follow-up request)
Static project (web-static): no server.ts with Express routes available at client build time, so LLM must be called FROM THE CLIENT using env-injected VITE keys is NOT available — but the skill says sandbox scripts can use OPENAI_API_KEY/OPENAI_API_BASE. Since the frontend is static-only, options:
1. Check if VITE_FRONTEND_FORGE_API_KEY exists (env shows it!) → can call $VITE_FRONTEND_FORGE_API_URL/v1/chat/completions directly from client with JSON schema extraction.
2. Fallback: deterministic keyword/pattern extractor (works offline) as safety net when API fails.
Decision: build lib/resumeParser.ts with extractResumeFromText(text) that tries remote LLM via VITE_FRONTEND_FORGE_API_KEY; on any failure falls back to local regex-based extraction.
UI: CandidateProfilePage gets "Import from CV" upload area (drag-drop, .txt/.pdf); PDF→text via pdf.js from CDN (window.pdfjsLib). Show preview modal of extracted fields, accept/disclose, then fills profile via updateProfile.

### LLM KEY FINDINGS (2026-08-20)
- VITE_FRONTEND_FORGE_API_KEY returns error "issue with your API key" from sandbox (key may be restricted to deployed app host — the proxy rewrites requests from the app's domain). Testing via deploy unknown.
- BUILT_IN_FORGE_API_KEY works directly in sandbox (test OK, model gpt-5-mini responds).
- Since this is a web-static project with no server code executed in production, the cleanest robust design: client calls /api route only in dev; in production static hosting there is NO backend.
- DECISION: Build parser with dual engine: (1) client-side deterministic regex extractor (always works offline — parses name, phone, email, title, county/town, skills, experience, education); (2) optional AI enrichment that calls BUILT_IN_FORGE_API_KEY via a tiny dev-only proxy — but production static site can't safely proxy. ALTERNATIVE: call VITE key from client; if it errors at runtime, fall back to deterministic. Deployed Manus app domains DO have the key rewritten (transparent credential rewriting per session self-config: "A connector's credentials in the environment may be fake placeholders — outbound requests are transparently rewritten to the real credentials"). So frontend calls should succeed in deployed preview/production.
- Implementation: lib/resumeParser.ts → extractResume(text): try fetch(BUILT_IN_FORGE fallback endpoint) first with json_schema, catch → deterministic; UI: ResumeImportModal on CandidateProfilePage ("Import from CV" button) with drag-drop .txt/.pdf upload, pdf.js CDN text extraction, preview with accept/disclose, fills profile via updateProfile.

## THREE NEW FEATURES (follow-up request after rollback to f12a7ab3)
Current checkpoint: f12a7ab3 (full TalentKenya MVP, NO resume parser — rolled back).
1. LinkedIn Import — on CandidateProfilePage add "Import from LinkedIn" button + modal. Since LinkedIn blocks scraping, simulate a guided import: paste LinkedIn public URL + headline text (or a short bio), extract fields via the same deterministic extractor (already handles name/title/skills/experience from text). Show preview, accept fills profile. Label clearly as "paste your LinkedIn About + Experience summary".
2. Multi-step profile wizard — replace/extend profile page with step navigation: Step 1 Basics (name, phone, email, county, town, title, linkedin), Step 2 Experience, Step 3 Education, Step 4 Skills, Step 5 Review. Progress bar per step + step indicator dots. Keep instant-save updateProfile; final Save completes wizard. Keep single-page view accessible via "Switch to full view" toggle? Simpler: wizard IS the profile page with step tabs at top; each step renders its section. Also "Import from LinkedIn" available at step 1.
3. Enhanced JobsPage filter sidebar — upgrade /jobs page: keep existing URL-param engine; add interactive salary range slider (dual-handle via two inputs or range inputs), county (keep), job type pills (Full-time/Part-time/Contract/Internship), work mode pills (Onsite/Remote/Hybrid), experience dropdown; show active filter count badge + Clear all; responsive (mobile collapsible drawer).

## CURRENT STATE (as of wizard implementation)
- LinkedInImportModal.tsx created, wired to CandidateProfilePage with "Import from LinkedIn" button. Compiles OK.
- Multi-step wizard added to CandidateProfilePage: mode toggle (Wizard/Full view), 5 steps (Basics/Experience/Education/Skills/Review), step indicator dots, progress bar, Previous/Next/Finish buttons. Compiles OK.
- REMAINING: Phase 3 — enhance JobsPage filter sidebar with location (county + town), job type pills, work mode pills, salary range slider, clear all, active filter count.
- THEN: Phase 4 — verify screenshots, checkpoint, deliver.
- JobsPage file: /home/ubuntu/prd-website/client/src/pages/JobsPage.tsx — uses URL params for filters. Filter state likely in a filters object; add: type (Full-time/Part-time/Contract/Internship), mode (Onsite/Remote/Hybrid), salaryMin/salaryMax (KES).
- Profile page file: /home/ubuntu/prd-website/client/src/pages/CandidateProfilePage.tsx

## 3 AI FEATURES TASK (current)
Files created/modified:
- NEW `client/src/lib/aiEngine.ts` — exports `jobFitScore(profile, job)` (deterministic token-overlap scoring 0-100) and `generateCoverLetter(profile, job)` (AI via forge proxy w/ deterministic fallback; returns {text, engine}).
- MODIFIED `JobDetailPage.tsx` — "Generate with AI" button in apply modal cover letter area (replaced CL_TEMPLATES). Uses generateCoverLetter, state `letterGenerating`, imports from aiEngine + Loader2. COMPILES OK.
- TODO: JobsPage results — wire match scores. JobCard already supports `match`+`showMatch` props. In JobsPage: import {jobFitScore} from aiEngine, {usePlatform} from platform, {COMPANIES} from data; compute list of {job, score} via jobFitScore(profile, {title,company:description?,requirements,benefits}); sort by score when sort=relevance; pass <JobCard job={job} match={score} showMatch />. Also add a hint line "Signed in? see your match" — show match ring only when role=candidate.
- TODO: EmployerTalentSearchPage.tsx — add "Bulk import (CSV)" button/drawer: CSV columns `name,title,county,experience,skills(email;phone)`, parse in-browser, map into CANDIDATE-like entries (platform state needs `poolCandidates` added; simplest: store imported in platform state `importedCandidates` via new method `importCandidates(list)`; render merged list with seed CANDIDATES; toast count imported).
- TODO: Add `importCandidates` to platform.tsx ctx + state field `importedCandidates: Candidate[]` default [].

Checkpoint: current version a6b7a820.
