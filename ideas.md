# TalentKenya — Employment Marketplace MVP Design

## Chosen Approach: "Professional Meridian" — Modern East African Enterprise

A market-ready employment marketplace for Kenya. Design must feel trustworthy, efficient, and distinctly modern — competing with BrighterMonday but looking fresher. Mobile-first, since the Kenyan labor market is overwhelmingly mobile.

### Design Movement
Modern SaaS marketplace — inspired by LinkedIn (2024 redesign), Greenhouse, and Paystack's clean commerce aesthetic. Data-dense dashboards, generous public pages, Kenyan warmth through accent color.

### Core Principles
1. **Mobile-First Trust**: Clean, fast, secure-looking on a 375px phone; enterprise depth on desktop
2. **Job Density Done Right**: Rich search results that scan in seconds, not walls of text
3. **Kenyan Context Everywhere**: Counties, KES, M-Pesa, +254 formats, local company names
4. **Functional Realism**: Every flow works end-to-end with realistic seed data — candidate applies, employer sees applicant move through ATS, admin verifies employer

### Color Philosophy
- **Primary**: Kenyan-flag-inspired deep green (#0F5132 → #166534) — trust, growth, professionalism
- **Accent/Action**: Vibrant red (#D6332B, Kenyan flag red) used sparingly for CTAs, badges, notifications
- **Surfaces**: Near-white (#FCFCFA) with soft gray cards (#F6F6F4); dark ink (#111815) text
- **M-Pesa green** (#2E7D32) appears in payment contexts to reinforce familiarity
- Emotional intent: credible (green), urgent-but-safe (red accents), warm-neutral surface

### Layout Paradigm
- Public pages: asymmetric hero with search panel floating over split imagery; content grids 12-col with sticky filter rail on desktop
- Dashboards (candidate/employer/admin): persistent left sidebar + top bar; Kanban boards horizontal-scroll on mobile
- Detail pages: 2-column — content 66% / sticky summary rail 33%

### Signature Elements
1. **Kenyan flag micro-strip** (black/red/green) as a thin top accent bar on all pages
2. **Pill badges with sharp functional hierarchy**: Featured / Urgent / Remote / Verified Employer
3. **Match-score rings**: circular SVG progress indicators on candidates and job match scores

### Interaction Philosophy
- Search is the hero: instant filter results as user types (debounced, client-side)
- Kanban drag-and-drop with visual snap and confirmation
- Every destructive/bulk action shows a confirmation dialog
- Optimistic UI updates: applying to a job instantly updates counts

### Animation
- Card hover: translateY(-2px) + shadow lift, 150ms ease-out
- Kanban cards: spring-ish grab feedback, 120ms
- Sidebar section transitions: 200ms ease-out
- Toasts for confirmations (sonner), 150ms entrance
- Respect prefers-reduced-motion

### Typography System
- **Headings**: "Sora" (600/700) — modern African-tech favorite, geometric but warm
- **Body**: "Inter" (400/500) — clean, dense, readable at 14px in data UIs
- **Mono**: "JetBrains Mono" for IDs, receipts, M-Pesa codes
- Scale: display 2.5rem hero / h1 1.875 / h2 1.5 / h3 1.125 / body 0.9375 / small 0.8125 / micro 0.75

### Brand Essence
**TalentKenya** — Kenya's verified employment marketplace. For job seekers tired of scams and employers tired of noise. Differentiated by zero-tolerance verification, county-level localization, and M-Pesa-native payments.

**Personality**: Credible · Efficient · Local

### Brand Voice
Direct and empowering. Headlines speak to outcomes. CTAs are verb-first.
- "Your next opportunity, verified."
- "Post a job. Reach verified talent. Pay via M-Pesa."

### Wordmark & Logo
Geometric mark: upward arrow inside a shield-outline (verification + growth), deep green. Wordmark "TalentKenya" in Sora 700 with "Kenya" in green.

### Signature Brand Color
Deep Kenyan Green #166534.

## Style Decisions
- Sharp 6px radius on cards/buttons; pill radius on badges/chips
- Mobile-first breakpoints: 375 / 640 / 1024 / 1440
- Dashboards use 280px sidebar (collapses to bottom nav on mobile)
- KES formatting: "KES 4,999" with JetBrains Mono numerals
- All state managed via React context + localStorage (MVP persistence)
- Role switching: demo user can switch role via profile menu (clearly labeled)

## MVP Data Plan (realistic, no fake reviews)
- 40 seed job listings across real counties (Nairobi, Mombasa, Kisumu, Nakuru, Eldoret, Thika, Malindi, Nyeri, Machakos, Naivasha...)
- 25+ real Kenyan industries, 6 experience levels, 5 job types
- 8 seed companies with real Kenyan-sounding names, KRA PIN formats, counties
- 6 fake candidate profiles for talent search demo
- 5 pricing tiers in KES per PRD Section 4.2
- 12 courses, 10 blog articles, seed applications across ATS stages
