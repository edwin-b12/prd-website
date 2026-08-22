/* TalentKenya data layer — types + realistic seed data.
   Kenyan context: 47 counties, KES currency, +254 phone formats, real industries. */

// ── Types (mirror PRD Section 5.2 schema) ──
export type UserRole = "candidate" | "employer" | "admin";
export type JobStatus = "draft" | "pending_approval" | "active" | "expired" | "archived";
export type AppStatus = "applied" | "shortlisted" | "interview" | "offered" | "hired" | "rejected";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";
export type WorkMode = "On-site" | "Remote" | "Hybrid";
export type JobType = "Full-time" | "Part-time" | "Contract" | "Internship" | "Volunteer";
export type ExperienceLevel =
  | "No Experience"
  | "Internship"
  | "Entry-Level (1-2 yrs)"
  | "Mid-Level (3-5 yrs)"
  | "Senior (6-9 yrs)"
  | "Executive (10+ yrs)";

export interface Company {
  id: string;
  name: string;
  slug: string;
  industry: string;
  county: string;
  town: string;
  website: string;
  kraPin: string;
  regNumber: string;
  kycApproved: boolean;
  staffSize: string;
  founded: number;
  description: string;
  verified: boolean;
  logoColor: string;
  openJobs?: number;
}

export interface Job {
  id: string;
  companyId: string;
  title: string;
  slug: string;
  category: string;
  jobType: JobType;
  workMode: WorkMode;
  county: string;
  town?: string;
  experience: ExperienceLevel;
  minSalary: number | null;
  maxSalary: number | null;
  salaryPublic: boolean;
  description: string;
  requirements: string[];
  benefits: string[];
  screenerQuestions: { q: string; type: "yesno" | "mcq" | "text" }[];
  status: JobStatus;
  featured: boolean;
  urgent: boolean;
  deadline: string;
  posted: string;
  views: number;
}

export interface Candidate {
  id: string;
  name: string;
  title: string;
  county: string;
  experience: string;
  skills: string[];
  matchScore: number;
  unlocked: boolean;
  rating: number | null;
  imported?: boolean;
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  candidateName: string;
  candidateTitle: string;
  status: AppStatus;
  rating: number | null;
  notes: string;
  appliedAt: string;
  screenerAnswers: string[];
  email?: string;
  phone?: string;
  interview?: { date: string; time: string; type: string; location: string; notes: string; response?: { status: "proposed" | "accepted" | "reschedule_requested"; respondedAt?: string; proposedAlternative?: { date: string; time: string; reason: string }; employerResponse?: "pending" | "approved" | "declined" } } | null;
  hiredAt?: string;
  statusHistory?: { status: AppStatus; changedAt: string; changedBy: "employer" | "system" | "candidate" }[];
}

export interface Course {
  id: string;
  title: string;
  category: string;
  duration: string;
  level: string;
  lessons: number;
  description: string;
  free: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  category: string;
  readMin: number;
  date: string;
  excerpt: string;
  body: string[];
}

export interface Transaction {
  id: string;
  employer: string;
  company: string;
  amount: number;
  channel: "mpesa_stk" | "card" | "bank";
  reference: string;
  purpose: string;
  status: PaymentStatus;
  date: string;
}

// ── Constants (PRD Section 5.1 filters) ──
export const COUNTIES = [
  "Nairobi","Mombasa","Kisumu","Nakuru","Eldoret (Uasin Gishu)","Thika (Kiambu)","Malindi (Kilifi)",
  "Nyeri","Machakos","Naivasha (Nakuru)","Meru","Embu","Kakamega","Kitale (Trans-Nzoia)","Garissa",
  "Nanyuki (Laikipia)","Kericho","Bungoma","Narok","Kilifi","Marsabit","Busia","Lamu","Migori",
  "Kajiado","Nyandarua","Murang'a","Kwale","Bomet","Siaya","Homa Bay","Turkana","West Pokot",
  "Samburu","Makueni","Taita Taveta","Lamu County","Isiolo","Mandera","Wajir","Trans-Nzoia",
  "Uasin Gishu","Elgeyo-Marakwet","Baringo","Laikipia","Nandi","Kilifi County","Coast Region"
].filter((v, i, a) => a.indexOf(v) === i).slice(0, 47);

export const INDUSTRIES = [
  "Accounting & Finance","ICT & Software","Tourism & Hospitality","Healthcare","Agriculture & Agribusiness",
  "Engineering & Construction","NGO & Non-Profit","Education & Training","Banking & Insurance",
  "Sales & Marketing","Human Resources","Legal & Compliance","Logistics & Supply Chain",
  "Media & Communications","Manufacturing","Real Estate","Energy & Utilities","Government & Public Service",
  "Retail & Consumer Goods","Transport & Aviation"
];

export const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  "No Experience","Internship","Entry-Level (1-2 yrs)","Mid-Level (3-5 yrs)","Senior (6-9 yrs)","Executive (10+ yrs)"
];
export const JOB_TYPES: JobType[] = ["Full-time","Part-time","Contract","Internship","Volunteer"];
export const WORK_MODES: WorkMode[] = ["On-site","Remote","Hybrid"];

export const ATS_STAGES: AppStatus[] = ["applied","shortlisted","interview","offered","hired","rejected"];
export const STAGE_LABELS: Record<AppStatus, string> = {
  applied: "New Applied", shortlisted: "Shortlisted", interview: "Interview",
  offered: "Offer Sent", hired: "Hired", rejected: "Rejected"
};

export const KES = (n: number) => `KES ${n.toLocaleString("en-KE")}`;

// ── Seed companies ──
export const COMPANIES: Company[] = [
  { id: "c1", name: "Savannah Technologies Ltd", slug: "savannah-technologies", industry: "ICT & Software", county: "Nairobi", town: "Westlands", website: "savannahtech.co.ke", kraPin: "P051234567B", regNumber: "PVT-A7K2M9", kycApproved: true, staffSize: "51–200", founded: 2016, description: "Cloud and mobile software studio building products for East Africa's fastest-growing enterprises.", verified: true, logoColor: "#166534", openJobs: 6 },
  { id: "c2", name: "Maisha Health Group", slug: "maisha-health", industry: "Healthcare", county: "Nairobi", town: "Parklands", website: "maishahealth.or.ke", kraPin: "P052345678A", regNumber: "PVT-B3L8N1", kycApproved: true, staffSize: "201–500", founded: 2011, description: "Private healthcare network with 12 facilities across Kenya, expanding into telemedicine.", verified: true, logoColor: "#0e7490", openJobs: 9 },
  { id: "c3", name: "Kilimanjaro AgriVentures", slug: "kilimanjaro-agri", industry: "Agriculture & Agribusiness", county: "Naivasha (Nakuru)", town: "Naivasha", website: "kagri.co.ke", kraPin: "P053456789C", regNumber: "PVT-C5M2P4", kycApproved: true, staffSize: "501–1000", founded: 2008, description: "Vertically integrated flower and horticulture exporter serving European markets.", verified: true, logoColor: "#854d0e", openJobs: 14 },
  { id: "c4", name: "Coastal Hospitality Partners", slug: "coastal-hospitality", industry: "Tourism & Hospitality", county: "Mombasa", town: "Nyali", website: "coastalhp.com", kraPin: "P054567890D", regNumber: "PVT-D9N4Q7", kycApproved: true, staffSize: "101–250", founded: 2013, description: "Boutique hotel and safari-lodge management group along the Kenyan coast.", verified: true, logoColor: "#b45309", openJobs: 11 },
  { id: "c5", name: "Rift Logistics Solutions", slug: "rift-logistics", industry: "Logistics & Supply Chain", county: "Eldoret (Uasin Gishu)", town: "Eldoret", website: "riftlog.co.ke", kraPin: "P055678901E", regNumber: "PVT-E1P6R2", kycApproved: true, staffSize: "51–200", founded: 2017, description: "Fleet management and last-mile delivery for the North Rift corridor and beyond.", verified: true, logoColor: "#4338ca", openJobs: 5 },
  { id: "c6", name: "EquityFirst Finance", slug: "equityfirst-finance", industry: "Banking & Insurance", county: "Nairobi", town: "Upper Hill", website: "equityfirst.co.ke", kraPin: "P056789012F", regNumber: "PVT-F7Q2S8", kycApproved: true, staffSize: "1001–5000", founded: 2004, description: "Digital-first microfinance and insurance provider championing financial inclusion.", verified: true, logoColor: "#be185d", openJobs: 8 },
  { id: "c7", name: "Lake Region NGO Alliance", slug: "lake-region-ngo", industry: "NGO & Non-Profit", county: "Kisumu", town: "Kisumu CBD", website: "lakeregion.org", kraPin: "P057890123G", regNumber: "ORG-N5T3U9", kycApproved: true, staffSize: "26–50", founded: 2015, description: "Consortium of community development NGOs focused on education, water, and livelihoods in Nyanza.", verified: true, logoColor: "#15803d", openJobs: 7 },
  { id: "c8", name: "Meridian Construction Group", slug: "meridian-construction", industry: "Engineering & Construction", county: "Nairobi", town: "Kileleshwa", website: "meridiancg.com", kraPin: "P058901234H", regNumber: "PVT-H2R8V4", kycApproved: true, staffSize: "251–500", founded: 2009, description: "Commercial and infrastructure contractor active across East Africa.", verified: true, logoColor: "#44403c", openJobs: 12 },
  { id: "c9", name: "Pamoja Media Network", slug: "pamoja-media", industry: "Media & Communications", county: "Nairobi", town: "Kilimani", website: "pamojamedia.co.ke", kraPin: "P059012345I", regNumber: "PVT-I4S1W6", kycApproved: false, staffSize: "11–25", founded: 2019, description: "Digital content studio producing Swahili and English programming for regional audiences.", verified: false, logoColor: "#c2410c", openJobs: 3 },
  { id: "c10", name: "Sunrise Energy Kenya", slug: "sunrise-energy", industry: "Energy & Utilities", county: "Nanyuki (Laikipia)", town: "Nanyuki", website: "sunriseenergy.co.ke", kraPin: "P050123456J", regNumber: "PVT-J6T9X3", kycApproved: true, staffSize: "51–200", founded: 2018, description: "Solar mini-grid developer bringing clean power to off-grid communities.", verified: true, logoColor: "#ca8a04", openJobs: 4 },
];

// ── Seed jobs (40 listings) ──
function j(id: string, companyId: string, title: string, slug: string, category: string, jobType: JobType, workMode: WorkMode, county: string, experience: ExperienceLevel, minSalary: number | null, maxSalary: number | null, salaryPublic: boolean, description: string, requirements: string[], benefits: string[], featured: boolean, urgent: boolean, daysAgo: number, views: number): Job {
  const d = new Date(Date.now() - daysAgo * 86400000);
  const dl = new Date(d.getTime() + Math.max(14, 45 - daysAgo) * 86400000);
  return { id, companyId, title, slug, category, jobType, workMode, county, experience, minSalary, maxSalary, salaryPublic, description, requirements, benefits, screenerQuestions: [ { q: "Are you legally authorized to work in Kenya?", type: "yesno" }, { q: "Years of experience in this field?", type: "mcq" }, { q: "Earliest available start date?", type: "text" } ], status: "active" as JobStatus, featured, urgent, posted: d.toISOString().slice(0, 10), deadline: dl.toISOString().slice(0, 10), views };
}export const JOBS: Job[] = [
  j("j1","c1","Senior Full-Stack Engineer","senior-fullstack-engineer-savannah","ICT & Software","Full-time","Hybrid","Nairobi","Senior (6-9 yrs)",380000,620000,true,"Lead engineering on our cloud platform serving 40+ enterprise clients across East Africa. You will architect microservices, mentor a team of five engineers, and drive our migration to event-driven infrastructure.", ["You have 6+ years of production experience with TypeScript/Node.js or Go","Experience designing distributed systems and event-driven architectures","Strong ownership mentality and track record shipping features end-to-end"], ["Comfortable with CI/CD pipelines, containerization, and cloud providers","Degree in Computer Science or equivalent practical experience","30 days paid leave","Medical cover for you and family","Learning budget of KES 60,000/year","Equity participation plan","Modern offices in Westlands with hybrid flexibility"], true,false, 3,214),
  j("j2","c1","Mobile App Developer (Flutter)","flutter-mobile-developer-savannah","ICT & Software","Full-time","Remote","Nairobi","Mid-Level (3-5 yrs)",220000,340000,true,"Build and maintain our flagship mobile application used by hundreds of thousands of Kenyan consumers for payments and loyalty features.", ["3+ years shipping production Flutter apps to Play Store and App Store","Experience with offline-first architecture and local storage","Familiarity with REST/GraphQL APIs and push notification services"], ["Portfolio of published applications required","Remote-first culture with quarterly team offsites","Device allowance","Annual conference budget"], true,false, 5,189),
  j("j3","c1","Data Analyst","data-analyst-savannah","ICT & Software","Full-time","Hybrid","Nairobi","Mid-Level (3-5 yrs)",180000,260000,false,"Turn product and business data into insights that drive decisions for our growth teams.", ["Proficiency in SQL, Python (pandas), and BI tools (Looker/Metabase)","Statistical analysis and A/B testing experience","Clear communication of findings to non-technical stakeholders"], ["Collaborative team environment","Flexible hours","Performance bonus"], false,false, 7,132),
  j("j4","c1","UX Designer","ux-designer-savannah","ICT & Software","Full-time","Hybrid","Nairobi","Mid-Level (3-5 yrs)",200000,300000,true,"Own end-to-end design for consumer-facing flows, from research and wireframes to polished prototypes.", ["3+ years product design experience with a strong portfolio","Mastery of Figma and design systems","User research and usability testing skills"], ["Design critique culture","Creative freedom on roadmap projects","Mentorship from senior designers"], true,false, 10,156),
  j("j5","c1","Software Engineering Intern","swe-intern-savannah","ICT & Software","Internship","On-site","Nairobi","Internship",45000,60000,true,"Paid 6-month internship with a clear path to full-time employment for top performers.", ["Currently pursuing or recently completed a CS/related degree","Basic proficiency in at least one programming language","Eagerness to learn and take feedback"], ["Paid internship","Mentorship program","Potential conversion to full-time"], false,false, 4,301),
  j("j6","c1","DevOps Engineer","devops-engineer-savannah","ICT & Software","Full-time","Remote","Nairobi","Senior (6-9 yrs)",320000,480000,true,"Own reliability and deployment infrastructure for a platform serving millions of API requests monthly.", ["5+ years in infrastructure/DevOps roles","Strong Kubernetes, Terraform, and observability tooling experience","On-call rotation participation"], ["Remote work anywhere in Kenya","Infrastructure budget ownership","Stock options"], true,false, 1,98),
  j("j7","c2","Registered Nurse (ICU)","icu-nurse-maisha","Healthcare","Full-time","On-site","Nairobi","Mid-Level (3-5 yrs)",140000,190000,true,"Provide critical care in our 24-bed ICU at the Parklands facility.", ["Valid KRN registration with Nursing Council of Kenya","3+ years ICU or high-dependency experience","Current BLS/ACLS certification"], ["Night differential pay","CPD sponsorship","Comprehensive medical cover"], false,false, 6,87),
  j("j8","c2","Telemedicine Physician","telemedicine-physician-maisha","Healthcare","Full-time","Remote","Nairobi","Mid-Level (3-5 yrs)",250000,350000,true,"Conduct virtual consultations as part of our rapidly growing telemedicine service.", ["KMPDC-registered medical officer","Excellent communication skills for virtual care","Experience with EMR systems preferred"], ["Fully remote","Flexible shift patterns","Telehealth equipment provided"], true,false, 2,145),
  j("j9","c2","Pharmacy Technician","pharmacy-tech-maisha","Healthcare","Full-time","On-site","Mombasa","Entry-Level (1-2 yrs)",75000,95000,false,"Support dispensing operations across our coastal facilities.", ["Diploma in Pharmacy Technology from a recognized institution","Registration with PPB preferred","Customer service orientation"], ["Housing allowance in Mombasa","Career progression path","Training programs"], false,false, 8,64),
  j("j10","c2","Hospital Administrator","hospital-admin-maisha","Healthcare","Full-time","On-site","Nairobi","Senior (6-9 yrs)",300000,420000,true,"Lead operations for our flagship hospital, overseeing 300+ staff across clinical and support functions.", ["8+ years healthcare administration experience","Strong financial and operational planning skills","Degree in Health Administration or MBA"], ["Executive development programs","Performance bonus up to 30%","Staff benefits oversight"], false,false, 11,71),
  j("j11","c2","Community Health Outreach Coordinator","choc-maisha","Healthcare","Contract","On-site","Kisumu","Entry-Level (1-2 yrs)",85000,110000,false,"Coordinate community health programs across Nyanza counties with our NGO partners.", ["Diploma or degree in public health or related field","1+ year community program experience","Willingness to travel within the region"], ["Field allowance","Motorcycle provision","Program impact recognition"], false,false, 12,53),
  j("j12","c3","Farm Operations Manager","farm-ops-manager-kagri","Agriculture & Agribusiness","Full-time","On-site","Naivasha (Nakuru)","Senior (6-9 yrs)",260000,350000,true,"Manage day-to-day operations across 120 hectares of greenhouse and open-field production.", ["10+ years in horticulture or flower farming operations","Experience with GlobalG.A.P. and MPS certification audits","Strong people leadership across shift teams"], ["On-site housing","Transport allowance","Profit-sharing scheme"], false,false, 5,92),
  j("j13","c3","Export Quality Controller","export-qc-kagri","Agriculture & Agribusiness","Full-time","On-site","Naivasha (Nakuru)","Mid-Level (3-5 yrs)",130000,170000,false,"Own quality assurance for export shipments to EU floriculture markets.", ["3+ years QA/QC in horticulture or food production","Knowledge of EU phytosanitary standards","Audit documentation expertise"], ["Structured shifts","Medical cover","Overtime compensation"], false,false, 9,48),
  j("j14","c3","Agronomy Intern","agronomy-intern-kagri","Agriculture & Agribusiness","Internship","On-site","Naivasha (Nakuru)","Internship",35000,45000,false,"Hands-on internship across our agronomy, nursery, and post-harvest departments.", ["BSc Agriculture or Horticulture (completed or final year)","Interest in sustainable farming practices","Field work readiness"], ["Paid stipend","Rotational learning across departments","Certificate of experience"], false,false, 3,112),
  j("j15","c3","Packhouse Supervisor","packhouse-supervisor-kagri","Agriculture & Agribusiness","Full-time","On-site","Naivasha (Nakuru)","Mid-Level (3-5 yrs)",110000,140000,false,"Lead packhouse teams ensuring export-grade grading, packing, and cold-chain handling.", ["3+ years supervisory experience in packhouse or production","Understanding of cold-chain logistics","Team of 40+ direct reports experience"], ["Meal provision","Shift allowances","Annual bonus"], false,false, 14,41),
  j("j16","c3","Sustainability & Certifications Officer","sustainability-kagri","Agriculture & Agribusiness","Full-time","On-site","Naivasha (Nakuru)","Mid-Level (3-5 yrs)",150000,200000,false,"Maintain and advance our environmental and social certifications including Floriculture Sustainability Initiative membership.", ["Degree in environmental science or related field","Audit and compliance management experience","Stakeholder engagement skills"], ["Certification training budget","Conference travel","Cross-functional projects"], false,false, 18,37),
  j("j17","c4","Guest Experience Manager","guest-exp-manager-coastal","Tourism & Hospitality","Full-time","On-site","Mombasa","Senior (6-9 yrs)",180000,250000,true,"Elevate guest journeys across our boutique properties on the Kenyan coast.", ["6+ years in upscale hospitality operations","Passion for personalized service design","Strong conflict resolution skills"], ["Staff accommodation","Meals on duty","Transport assistance"], false,false, 7,96),
  j("j18","c4","Safari Guide (KWS Certified)","safari-guide-coastal","Tourism & Hospitality","Full-time","On-site","Kilifi","Mid-Level (3-5 yrs)",90000,130000,true,"Lead signature wildlife and cultural experiences for international guests.", ["Valid KWS professional guide license","Fluency in English plus one additional language","Deep knowledge of coastal ecosystems"], ["Tips sharing scheme","Guide development program","Uniforms and equipment"], false,false, 4,128),
  j("j19","c4","Executive Chef","exec-chef-coastal","Tourism & Hospitality","Full-time","On-site","Mombasa","Senior (6-9 yrs)",220000,300000,false,"Direct kitchen operations and menu innovation for our flagship beachfront property.", ["8+ years culinary leadership in resort or hotel environments","Creative coastal and fusion cuisine background","Cost control and kitchen management"], ["Housing allowance","Relocation support","Creative kitchen budget"], true,false, 9,84),
  j("j20","c4","Front Desk Supervisor","front-desk-sup-coastal","Tourism & Hospitality","Full-time","On-site","Malindi (Kilifi)","Entry-Level (1-2 yrs)",65000,85000,false,"Supervise front desk operations and guest arrivals at our Malindi property.", ["Diploma in hospitality management","PMS system experience (Opera preferred)","Shift leadership experience"], ["On-site housing","Meals provided","Career progression"], false,false, 11,59),
  j("j21","c4","Revenue & Distribution Analyst","revenue-analyst-coastal","Tourism & Hospitality","Full-time","Hybrid","Mombasa","Mid-Level (3-5 yrs)",140000,180000,false,"Optimize pricing, channel mix, and occupancy strategy across the portfolio.", ["3+ years hotel revenue management","OTA channel and rate parity expertise","Advanced Excel and forecasting skills"], ["Hybrid working","Performance incentives","Training in revenue systems"], false,false, 15,44),
  j("j22","c5","Fleet Operations Coordinator","fleet-coord-rift","Logistics & Supply Chain","Full-time","On-site","Eldoret (Uasin Gishu)","Entry-Level (1-2 yrs)",80000,105000,false,"Coordinate driver schedules, vehicle maintenance, and delivery performance for the North Rift fleet.", ["Diploma in transport, logistics, or business","1+ year operations or dispatch experience","Strong organizational and phone communication skills"], ["Fuel allowance","Overtime pay","Growth into management"], false,false, 6,73),
  j("j23","c5","Logistics Manager","logistics-manager-rift","Logistics & Supply Chain","Full-time","On-site","Eldoret (Uasin Gishu)","Senior (6-9 yrs)",240000,320000,true,"Own end-to-end logistics performance: fleet, warehousing, and last-mile delivery SLAs.", ["6+ years logistics management including P&L ownership","Route optimization and fleet telematics experience","Team leadership of 30+"], ["Company vehicle","Performance bonus","Medical cover"], false,false, 3,88),
  j("j24","c5","Warehouse Supervisor","warehouse-sup-rift","Logistics & Supply Chain","Full-time","On-site","Nakuru","Mid-Level (3-5 yrs)",100000,130000,false,"Lead warehouse operations ensuring inventory accuracy and dispatch efficiency.", ["3+ years warehouse supervision","Inventory management system experience","Forklift license a plus"], ["Shift allowances","Meal provision","Safety training"], false,false, 10,52),
  j("j25","c5","Customer Support Executive","cs-exec-rift","Logistics & Supply Chain","Full-time","Hybrid","Eldoret (Uasin Gishu)","Entry-Level (1-2 yrs)",60000,80000,false,"Handle shipment inquiries and resolve delivery issues for B2B and B2C customers.", ["Diploma in any discipline","Strong communication and problem-solving","CRM tool familiarity"], ["Hybrid schedule","Support career path","Team incentives"], false,false, 13,66),
  j("j26","c6","Credit Risk Analyst","credit-risk-analyst-equityfirst","Banking & Insurance","Full-time","Hybrid","Nairobi","Mid-Level (3-5 yrs)",200000,280000,true,"Model and assess credit risk across our microfinance and SME lending portfolio.", ["3+ years in credit risk or underwriting","Strong statistical and modeling skills (Python/R)","Knowledge of CBK regulatory frameworks"], ["Hybrid work","Professional exam sponsorship (ACCA/CFA)","Performance bonus"], false,false, 4,102),
  j("j27","c6","Digital Channels Product Manager","digital-pm-equityfirst","Banking & Insurance","Full-time","Hybrid","Nairobi","Senior (6-9 yrs)",340000,450000,true,"Own the roadmap for our mobile banking and agency banking digital products.", ["5+ years product management, fintech preferred","Deep mobile money and payments knowledge","Data-driven decision making"], ["Equity participation","Executive development","Flexible benefits"], true,false, 2,134),
  j("j28","c6","Branch Manager (Kisumu)","branch-manager-equityfirst","Banking & Insurance","Full-time","On-site","Kisumu","Senior (6-9 yrs)",260000,340000,false,"Lead the Kisumu branch: business development, team performance, and customer experience.", ["6+ years banking with branch leadership experience","Proven deposit and loan growth track record","People management of 15+"], ["Relocation allowance","Branch performance bonus","Vehicle allowance"], false,false, 8,77),
  j("j29","c6","Insurance Underwriter","underwriter-equityfirst","Banking & Insurance","Full-time","On-site","Nairobi","Mid-Level (3-5 yrs)",170000,230000,false,"Assess and price micro-insurance products for underserved segments.", ["3+ years underwriting experience","IRA registration preferred","Analytical and detail-oriented"], ["Study support","Career ladder to senior underwriter","Medical cover"], false,false, 12,58),
  j("j30","c7","Program Manager – Education","program-mgr-lakeregion","NGO & Non-Profit","Full-time","On-site","Kisumu","Senior (6-9 yrs)",200000,260000,true,"Direct our girls' education programs across four counties with a KES 180M annual budget.", ["7+ years NGO program management","Donor reporting experience (USAID, FCDO, foundations)","Strong M&E literacy"], ["Field travel across Nyanza","Per diem for fieldwork","Mission-driven team culture"], false,false, 5,69),
  j("j31","c7","M&E Officer","me-officer-lakeregion","NGO & Non-Profit","Full-time","On-site","Kisumu","Mid-Level (3-5 yrs)",120000,160000,false,"Design and run monitoring and evaluation for water and livelihoods programs.", ["3+ years M&E in development sector","Survey design and data quality skills","DHIS2/Kobo Toolbox experience"], ["Field allowances","Training opportunities","Stable multi-year funding"], false,false, 9,47),
  j("j32","c7","Community Mobilizer","community-mobilizer-lakeregion","NGO & Non-Profit","Contract","On-site","Migori","Entry-Level (1-2 yrs)",55000,70000,false,"Mobilize communities for program participation and feedback across Migori County.", ["Diploma in community development or related","Fluency in Dholuo and Swahili","Community organizing experience"], ["Contract renewable","Field transport","Impact-focused work"], false,false, 14,38),
  j("j33","c7","Finance & Grants Officer","grants-officer-lakeregion","NGO & Non-Profit","Full-time","On-site","Kisumu","Mid-Level (3-5 yrs)",140000,180000,false,"Manage grant accounting, donor compliance, and financial reporting for multiple funders.", ["ACCA part-qualified or degree in accounting","Grant compliance experience","IFRS knowledge"], ["Stable funding environment","Professional development","Hybrid flexibility"], false,false, 17,42),
  j("j34","c8","Project Engineer – Highways","project-engineer-meridian","Engineering & Construction","Full-time","On-site","Nairobi","Senior (6-9 yrs)",300000,420000,true,"Lead design and site delivery for a KES 2.4B highway rehabilitation contract.", ["BSc Civil Engineering, EBK registered","6+ years roads/highway project experience","FIDIC contract familiarity"], ["Site allowances","Vehicle provision","Project completion bonus"], false,false, 6,95),
  j("j35","c8","Quantity Surveyor","qs-meridian","Engineering & Construction","Full-time","On-site","Nairobi","Mid-Level (3-5 yrs)",180000,250000,true,"Own cost planning, BOQs, and contract administration on live infrastructure projects.", ["BSc Quantity Surveying, IQSK member","3+ years QS experience on infrastructure","Strong measurement and negotiation skills"], ["Performance bonus","Health cover","Career growth to commercial manager"], false,false, 3,81),
  j("j36","c8","Site Safety Officer","safety-officer-meridian","Engineering & Construction","Full-time","On-site","Nakuru","Mid-Level (3-5 yrs)",120000,160000,false,"Enforce HSE standards across multiple active construction sites in the Rift Valley.", ["NEBOSH or equivalent certification","3+ years construction safety experience","Incident investigation skills"], ["Site allowances","Safety equipment provided","Training budget"], false,false, 10,56),
  j("j37","c8","Graduate Engineer","graduate-engineer-meridian","Engineering & Construction","Full-time","On-site","Nairobi","No Experience",70000,95000,false,"Structured two-year graduate program with rotations across design, site, and commercial teams.", ["Fresh BSc Civil/Structural Engineering graduate","EBK provisional registration","Eagerness to learn on live projects"], ["Graduate development plan","Mentorship","Fast-track promotion"], false,false, 2,187),
  j("j38","c9","Content Producer (Video)","content-producer-pamoja","Media & Communications","Contract","On-site","Nairobi","Mid-Level (3-5 yrs)",90000,130000,true,"Produce short-form and long-form video content for our Swahili digital channels.", ["3+ years video production","Proficiency in Premiere Pro / DaVinci Resolve","Storytelling for digital audiences"], ["Creative environment","Equipment access","Portfolio-building projects"], false,false, 5,104),
  j("j39","c10","Solar Field Technician","solar-tech-sunrise","Energy & Utilities","Full-time","On-site","Nanyuki (Laikipia)","Entry-Level (1-2 yrs)",75000,100000,false,"Install, maintain, and repair solar mini-grid systems across Laikipia communities.", ["Diploma in electrical engineering or equivalent","Willingness to work in rural settings","Valid driving license a plus"], ["Field allowances","Technical training program","Meaningful climate impact"], false,false, 8,61),
  j("j40","c10","Energy Data Analyst","energy-data-sunrise","Energy & Utilities","Full-time","Hybrid","Nairobi","Mid-Level (3-5 yrs)",160000,220000,false,"Analyze consumption patterns and grid performance to optimize our mini-grid operations.", ["3+ years data analysis experience","Python/SQL proficiency","Interest in energy systems"], ["Hybrid working","Learning budget","Mission-driven culture"], false,true, 1,79),
];

// ── Seed candidates (talent pool) ──
export const CANDIDATES: Candidate[] = [
  { id: "d1", name: "Wanjiku Muthoni", title: "Full-Stack Developer", county: "Nairobi", experience: "4 years", skills: ["React","Node.js","PostgreSQL","TypeScript"], matchScore: 94, unlocked: false, rating: null },
  { id: "d2", name: "Brian Otieno", title: "Data Scientist", county: "Kisumu", experience: "3 years", skills: ["Python","Machine Learning","SQL","Tableau"], matchScore: 88, unlocked: false, rating: null },
  { id: "d3", name: "Amina Hassan", title: "Digital Marketing Specialist", county: "Mombasa", experience: "5 years", skills: ["SEO","Google Ads","Content Strategy","Analytics"], matchScore: 82, unlocked: false, rating: null },
  { id: "d4", name: "Kevin Njoroge", title: "Civil Engineer", county: "Nakuru", experience: "7 years", skills: ["AutoCAD","Project Management","FIDIC","Site Supervision"], matchScore: 79, unlocked: false, rating: null },
  { id: "d5", name: "Faith Chebet", title: "Registered Nurse", county: "Eldoret (Uasin Gishu)", experience: "6 years", skills: ["Critical Care","ACLS","Patient Safety","Triage"], matchScore: 76, unlocked: false, rating: null },
  { id: "d6", name: "Samuel Kiprop", title: "Supply Chain Analyst", county: "Nairobi", experience: "4 years", skills: ["Logistics","SAP","Inventory Optimization","Excel"], matchScore: 71, unlocked: false, rating: null },
];

// ── Seed applications (employer ATS board) ──
export const APPLICATIONS: Application[] = [
  { id: "a1", jobId: "j1", candidateId: "d1", candidateName: "Wanjiku Muthoni", candidateTitle: "Full-Stack Developer", status: "interview", rating: 4, notes: "Strong system design answers; reference check pending.", appliedAt: "2026-07-14", screenerAnswers: ["Yes","5+ years","Immediate"], email: "wanjiku.muthoni@gmail.com", phone: "+254 712 345 678", interview: null },
  { id: "a2", jobId: "j1", candidateId: "d2", candidateName: "Brian Otieno", candidateTitle: "Data Scientist", status: "shortlisted", rating: 3, notes: "Good analytical skills, less backend experience.", appliedAt: "2026-07-15", screenerAnswers: ["Yes","3-4 years","2 weeks notice"], email: "brian.otieno@outlook.com", phone: "+254 723 456 789", interview: null },
  { id: "a3", jobId: "j1", candidateId: "d6", candidateName: "Samuel Kiprop", candidateTitle: "Supply Chain Analyst", status: "applied", rating: null, notes: "", appliedAt: "2026-07-17", screenerAnswers: ["Yes","2-3 years","1 month"], email: "samuel.kiprop@yahoo.com", phone: "+254 734 567 890", interview: null },
  { id: "a4", jobId: "j2", candidateId: "d1", candidateName: "Wanjiku Muthoni", candidateTitle: "Full-Stack Developer", status: "offered", rating: 5, notes: "Excellent Flutter portfolio. Offer sent 18/07.", appliedAt: "2026-07-10", screenerAnswers: ["Yes","5+ years","Immediate"], email: "wanjiku.muthoni@gmail.com", phone: "+254 712 345 678", interview: null },
  { id: "a5", jobId: "j2", candidateId: "d2", candidateName: "Brian Otieno", candidateTitle: "Data Scientist", status: "rejected", rating: 2, notes: "Not a mobile development fit.", appliedAt: "2026-07-09", screenerAnswers: ["Yes","3-4 years","1 month"], email: "brian.otieno@outlook.com", phone: "+254 723 456 789", interview: null },
  { id: "a6", jobId: "j3", candidateId: "d6", candidateName: "Samuel Kiprop", candidateTitle: "Supply Chain Analyst", status: "interview", rating: 4, notes: "Solid SQL and dashboarding; interview scheduled Friday.", appliedAt: "2026-07-12", screenerAnswers: ["Yes","3-4 years","2 weeks notice"], email: "samuel.kiprop@yahoo.com", phone: "+254 734 567 890", interview: { date: "2026-07-18", time: "10:00", type: "Video call", location: "meet.google.com/abc-defg-hij", notes: "Prepare a dashboard walkthrough in Metabase." } },
];

// ── Courses & blog ──
export const COURSES: Course[] = [
  { id: "cr1", title: "CV Writing for the Kenyan Job Market", category: "Career Skills", duration: "2 hrs", level: "Beginner", lessons: 8, description: "Build an ATS-friendly CV that passes automated screening and impresses recruiters.", free: true },
  { id: "cr2", title: "Acing the Interview: Behavioral & Technical", category: "Career Skills", duration: "3 hrs", level: "Beginner", lessons: 12, description: "Structured preparation frameworks used by candidates who land offers faster.", free: true },
  { id: "cr3", title: "Excel for Business Analytics", category: "Digital Skills", duration: "6 hrs", level: "Intermediate", lessons: 18, description: "From VLOOKUP to pivot tables and dashboards — the spreadsheet skills employers demand.", free: false },
  { id: "cr4", title: "Introduction to Python for Data", category: "Digital Skills", duration: "10 hrs", level: "Intermediate", lessons: 24, description: "Practical Python fundamentals with real Kenyan business datasets.", free: false },
  { id: "cr5", title: "Digital Marketing Fundamentals", category: "Digital Skills", duration: "5 hrs", level: "Beginner", lessons: 15, description: "SEO, social, and performance marketing essentials for the East African market.", free: false },
  { id: "cr6", title: "Financial Literacy for Professionals", category: "Finance", duration: "4 hrs", level: "Beginner", lessons: 10, description: "Budgeting, saving, and investing foundations for young professionals.", free: true },
  { id: "cr7", title: "Project Management Basics (Agile)", category: "Leadership", duration: "6 hrs", level: "Intermediate", lessons: 16, description: "Deliver projects with agile ceremonies, tools, and stakeholder communication.", free: false },
  { id: "cr8", title: "Customer Service Excellence", category: "Career Skills", duration: "3 hrs", level: "Beginner", lessons: 9, description: "Service standards for hospitality, retail, and support roles.", free: true },
  { id: "cr9", title: "QuickBooks for Small Business", category: "Finance", duration: "4 hrs", level: "Intermediate", lessons: 12, description: "Bookkeeping and reporting skills sought by SMEs across Kenya.", free: false },
  { id: "cr10", title: "Leadership for First-Time Managers", category: "Leadership", duration: "5 hrs", level: "Intermediate", lessons: 14, description: "Transition from individual contributor to people leader with confidence.", free: false },
  { id: "cr11", title: "Communication & Presentation Skills", category: "Career Skills", duration: "3 hrs", level: "Beginner", lessons: 10, description: "Speak clearly, present persuasively, and write professionally.", free: true },
  { id: "cr12", title: "Cybersecurity Awareness at Work", category: "Digital Skills", duration: "2 hrs", level: "Beginner", lessons: 8, description: "Protect yourself and your organization from common digital threats.", free: true },
];

export const BLOG: BlogPost[] = [
  { id: "b1", title: "Kenya Salary Guide 2026: What Employers Really Pay by Role", category: "Salary Insights", readMin: 9, date: "2026-08-12", excerpt: "We analyzed 12,000+ verified job postings to publish realistic salary bands across Kenya's top 20 industries.", body: ["Compensation transparency remains one of the biggest frustrations for Kenyan job seekers. This guide compiles verified salary data across ICT, banking, healthcare, agriculture, and more — with realistic ranges by experience level and county.","Nairobi roles command a 20–35% premium over other counties, though remote work is narrowing that gap. Senior ICT roles now regularly exceed KES 400,000 monthly, while entry-level positions across most industries cluster between KES 45,000 and KES 80,000."] },
  { id: "b2", title: "How to Spot a Fake Job Posting in Kenya", category: "Career Advice", readMin: 6, date: "2026-08-05", excerpt: "Red flags that separate legitimate employers from recruitment scammers — and what to do when you find one.", body: ["Employment scams cost Kenyan job seekers millions every year. Classic warning signs include requests for 'medical checkup fees', 'registration fees', or M-Pesa payments before interviews. Legitimate employers never charge candidates to apply.","Always verify the company's registration, check whether the posting comes from a verified employer account, and never send money to secure an interview."] },
  { id: "b3", title: "ATS Explained: Why Your CV Gets Rejected Before a Human Sees It", category: "Career Advice", readMin: 7, date: "2026-07-28", excerpt: "Applicant Tracking Systems filter most CVs automatically. Here's how to format yours so it survives.", body: ["Most large Kenyan employers now use ATS software to screen applications. Systems parse your CV for keywords matching the job description, and complex layouts, images, and tables often break parsing.","Use a single-column layout, standard section headings, and mirror the exact language from the job posting. Our built-in resume builder handles all of this automatically."] },
  { id: "b4", title: "The Rise of Remote Work in Kenya's Tech Sector", category: "Market Insights", readMin: 8, date: "2026-07-20", excerpt: "Hybrid and remote roles now account for a third of ICT vacancies — and the trend is accelerating.", body: ["Kenyan tech companies were early adopters of flexible work models. Our data shows 34% of ICT listings now offer remote or hybrid arrangements, up from 18% two years ago.","Candidates outside Nairobi are the biggest winners: talent in Kisumu, Eldoret, and Mombasa now compete for the same roles as those in Westlands."] },
  { id: "b5", title: "What Kenyan Employers Look for in the First 30 Seconds", category: "Career Advice", readMin: 5, date: "2026-07-14", excerpt: "Recruiters tell us exactly what makes them click 'shortlist' — and what makes them move on.", body: ["In our survey of 200+ hiring managers, three factors dominated: relevant recent experience (78%), a clear professional title (65%), and quantified achievements (54%).","Generic objective statements ranked lowest. Replace them with a concrete headline like 'Full-Stack Engineer | 4 yrs | Fintech Payments'."] },
  { id: "b6", title: "County-by-County: Where Kenya's Hiring Hotspots Are in 2026", category: "Market Insights", readMin: 8, date: "2026-07-07", excerpt: "Nairobi leads, but Naivasha, Mombasa, and Kisumu are growing fastest — here's the breakdown.", body: ["Nairobi still holds 52% of all vacancies, but growth is strongest outside the capital. Naivasha's agribusiness boom, Mombasa's hospitality recovery, and Kisumu's NGO presence are creating new opportunities.","Job seekers willing to relocate are seeing faster response times and less competition."] },
  { id: "b7", title: "Negotiating Your Salary in Kenya Without Losing the Offer", category: "Career Advice", readMin: 6, date: "2026-06-30", excerpt: "A practical framework for salary conversations based on real data from 12,000 job postings.", body: ["Candidates who negotiate typically secure 8–15% more — yet fewer than a third of Kenyan professionals attempt it. The key is anchoring your ask in market data rather than personal need.","Use our Salary Insights section to find the verified range for your role, and always negotiate the full package: medical cover, transport, and bonuses count."] },
  { id: "b8", title: "M-Pesa for Business: How Kenyan Employers Are Paying for Recruitment", category: "Market Insights", readMin: 5, date: "2026-06-22", excerpt: "STK Push payments now power most recruitment platform transactions in Kenya.", body: ["Mobile money has transformed B2B payments. On TalentKenya, over 80% of employer transactions are completed via M-Pesa STK Push — instant, receipts included, no cards required.","Employers appreciate the simplicity: post a job, approve the push on your phone, and the listing goes live immediately."] },
  { id: "b9", title: "Skills Kenya's Employers Are Searching for Right Now", category: "Career Advice", readMin: 7, date: "2026-06-15", excerpt: "The top 25 skills appearing in verified job descriptions this quarter.", body: ["Python, SQL, and cloud infrastructure lead the technical list, while customer service, Excel, and project management dominate non-technical roles.","Our free career courses are aligned to these exact skills — completing one typically improves match rates by 30%."] },
  { id: "b10", title: "Internship to Employment: Kenya's Graduate Hiring Pipeline", category: "Career Advice", readMin: 6, date: "2026-06-08", excerpt: "How structured internship programs are becoming the primary entry route for graduates.", body: ["More Kenyan employers now hire through internship-to-hire programs rather than open graduate recruitment. Structured programs offer mentorship, rotation, and a clear conversion path.","For graduates, applying early to internship cohorts — typically January and August intakes — dramatically improves outcomes."] },
];

// ── Transactions (admin finance ledger) ──
export const TRANSACTIONS: Transaction[] = [
  { id: "t1", employer: "hr@savannahtech.co.ke", company: "Savannah Technologies Ltd", amount: 11999, channel: "mpesa_stk", reference: "SJH89TY12K", purpose: "Featured Pro Listing", status: "completed", date: "2026-08-18" },
  { id: "t2", employer: "careers@maishahealth.or.ke", company: "Maisha Health Group", amount: 4999, channel: "mpesa_stk", reference: "RK23KL88MN", purpose: "Standard Job Post", status: "completed", date: "2026-08-17" },
  { id: "t3", employer: "ops@kagri.co.ke", company: "Kilimanjaro AgriVentures", amount: 24999, channel: "mpesa_stk", reference: "QW91PL44TY", purpose: "Talent Pool Access (Monthly)", status: "completed", date: "2026-08-16" },
  { id: "t4", employer: "admin@coastalhp.com", company: "Coastal Hospitality Partners", amount: 4999, channel: "card", reference: "CARD-4472", purpose: "Standard Job Post", status: "completed", date: "2026-08-15" },
  { id: "t5", employer: "hr@meridiancg.com", company: "Meridian Construction Group", amount: 11999, channel: "mpesa_stk", reference: "BB55NM12KL", purpose: "Featured Pro Listing", status: "pending", date: "2026-08-19" },
  { id: "t6", employer: "info@riftlog.co.ke", company: "Rift Logistics Solutions", amount: 4999, channel: "mpesa_stk", reference: "ZZ77QR33WX", purpose: "Standard Job Post", status: "failed", date: "2026-08-14" },
  { id: "t7", employer: "finance@equityfirst.co.ke", company: "EquityFirst Finance", amount: 24999, channel: "mpesa_stk", reference: "HH12TY99KM", purpose: "Talent Pool Access (Monthly)", status: "completed", date: "2026-08-13" },
  { id: "t8", employer: "programs@lakeregion.org", company: "Lake Region NGO Alliance", amount: 4999, channel: "mpesa_stk", reference: "CC88PL55NB", purpose: "Standard Job Post", status: "completed", date: "2026-08-12" },
];

// ── Pricing packages (PRD Section 4.2) ──
export const PRICING = [
  { name: "Standard Job Post", target: "SME / Direct Employer", price: 4999, duration: "30 days", features: ["1 active listing","Standard search ranking","Basic ATS pipeline","Verified applicant screening","Email & phone applicant alerts"], featured: false, highlight: false },
  { name: "Featured Pro Listing", target: "Growing Corporate", price: 11999, duration: "45 days", features: ["Top-3 category placement","'Featured' badge on board","Social media blast","Highlighted alert email","Advanced ATS with rating & notes","Priority support"], featured: true, highlight: true },
  { name: "Talent Pool Access", target: "Recruiter / Agency", price: 24999, duration: "Monthly", features: ["Unlimited CV database search","100 verified CV unlocks/mo","Direct candidate messaging","Saved candidate shortlists","Bulk CV export (CSV/Excel)"], featured: false, highlight: false },
  { name: "Executive Headhunt", target: "Enterprise", price: null, duration: "Per placement", features: ["Dedicated recruiter","Manual candidate vetting","90-day placement guarantee","Confidential search","Custom reporting"], featured: false, highlight: false },
];
