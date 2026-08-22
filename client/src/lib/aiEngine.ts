/* TalentKenya AI engine — powers cover letter generation and job-fit scoring.
   Primary: built-in LLM (forge proxy) via the same client key used by resumeParser.ts.
   Falls back to a deterministic local implementation that always works offline. */

export type Profile = {
  firstName: string; lastName: string; title: string;
  experience: { role: string; company: string; achievements: string }[];
  skills: string[];
};

export type JobLite = {
  title: string;
  company: string;
  description: string;
  requirements: string[];
  benefits: string[];
};

const LLM_URL = (typeof window !== "undefined" && (window as unknown as { __TK_FORGE_URL?: string }).__TK_FORGE_URL) ?? import.meta.env.VITE_FRONTEND_FORGE_API_URL;
const LLM_KEY = (typeof window !== "undefined" && (window as unknown as { __TK_FORGE_KEY?: string }).__TK_FORGE_KEY) ?? import.meta.env.VITE_FRONTEND_FORGE_API_KEY;

/* ---------- Job-fit match scoring ---------- */
export function jobFitScore(profile: Profile, job: JobLite): number {
  const profTokens = new Set(
    [profile.title, ...profile.skills, ...profile.experience.map(e => e.role), ...profile.experience.map(e => e.company)]
      .map(s => s.toLowerCase())
      .flatMap(s => s.split(/[\s,./-]+/))
      .filter(s => s.length >= 3 && !/^https?$|^www/.test(s))
  );
  const jobTokens = new Set(
    [job.title, ...job.requirements, ...job.benefits]
      .map(s => s.toLowerCase())
      .flatMap(s => s.split(/[\s,./-]+/))
      .filter(s => s.length >= 3 && !/^https?$|^www/.test(s))
  );
  if (profTokens.size === 0 || jobTokens.size === 0) return 0;
  let overlap = 0;
  profTokens.forEach(t => { if (jobTokens.has(t)) overlap++; });
  // Weight: requirement terms matter more; blend token overlap with keyword overlap
  const tokPct = overlap / Math.min(profTokens.size, jobTokens.size);
  const reqKeywords = new Set(
    job.requirements.map(r => r.toLowerCase().split(/\b/).filter(w => w.length > 4))
      .flat()
      .filter(w => profTokens.has(w))
  );
  const reqPct = job.requirements.length ? reqKeywords.size / Math.max(job.requirements.length, 1) : 0;
  const raw = Math.min(1, tokPct * 0.55 + reqPct * 0.45 + 0.15);
  return Math.round(raw * 100);
}

/* ---------- AI cover letter generator ---------- */
async function aiCoverLetter(profile: Profile, job: JobLite): Promise<string | null> {
  if (!LLM_URL || !LLM_KEY) return null;
  const profileText = [
    `Name: ${profile.firstName} ${profile.lastName}`,
    `Title: ${profile.title || "Job Seeker"}`,
    profile.experience.length ? `Experience:\n${profile.experience.map(e => `- ${e.role} at ${e.company}${e.achievements ? ": " + e.achievements : ""}`).join("\n")}` : null,
    profile.skills.length ? `Skills: ${profile.skills.join(", ")}` : null,
  ].filter(Boolean).join("\n");

  const res = await fetch(`${LLM_URL}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${LLM_KEY}` },
    body: JSON.stringify({
      model: "gpt-5-mini",
      max_completion_tokens: 1500,
      messages: [
        {
          role: "system",
          content:
            "You are a professional cover letter writer for a Kenyan job marketplace called TalentKenya. Write a concise, tailored cover letter (3 short paragraphs, under 200 words) that references the candidate's actual profile details and the employer's specific requirements. Use a warm, confident, professional tone. Start with 'Dear Hiring Team,' and end with 'Kind regards,\\n' followed by the candidate's full name on the next line. Do not invent experience or skills not present in the profile — use only what is given.",
        },
        {
          role: "user",
          content: `Candidate profile:\n${profileText}\n\nJob applied for: ${job.title} at ${job.company}\nJob description:\n${job.description.slice(0, 800)}\nRequirements:\n${job.requirements.join("\n")}\n${job.benefits.length ? `Benefits:\n${job.benefits.join("\n")}` : ""}`,
        },
      ],
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text || typeof text !== "string") return null;
  if (text.length < 60) return null; // guard: ensure substantive output
  return text.trim();
}

/* ---------- Deterministic fallback ---------- */
function localCoverLetter(profile: Profile, job: JobLite): string {
  const name = `${profile.firstName || "A"} ${profile.lastName || "Candidate"}`.trim();
  const role = profile.title || "professional";
  const topSkills = profile.skills.slice(0, 4).join(", ") || "relevant skills";
  const recent = profile.experience[0]?.role || "recent roles";
  const recentCo = profile.experience[0]?.company || "previous employers";
  return (
    `Dear Hiring Team,\n\n` +
    `I am writing to apply for the ${job.title} position at ${job.company}. As a ${role} with hands-on experience in ${recent} and strengths in ${topSkills}, I am confident my background aligns directly with your requirements.${job.requirements.length ? ` I was particularly drawn to your emphasis on ${job.requirements.slice(0, 3).map(r => r.toLowerCase()).join(", ")} — areas where I have delivered consistent results.` : ""}\n\n` +
    `In my most recent work${recentCo ? ` at ${recentCo}` : ""}, I focused on delivering measurable outcomes and building strong working relationships with colleagues and stakeholders. I am eager to bring the same discipline and energy to your team${job.benefits.length ? ` and to grow alongside ${job.benefits.slice(0, 2).join(" and ").toLowerCase()}` : ""}.\n\n` +
    `Thank you for considering my application. I would welcome the opportunity to discuss how I can contribute to ${job.company} from day one.\n\n` +
    `Kind regards,\n${name}`
  );
}

/* ---------- AI job-posting assistant ---------- */
export type JobDraft = { description: string; requirements: string[]; benefits: string[]; minSalary?: string; maxSalary?: string; workMode?: string };

async function aiJobDescription(title: string, category: string, experience: string): Promise<JobDraft | null> {
  if (!LLM_URL || !LLM_KEY) return null;
  const res = await fetch(`${LLM_URL}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${LLM_KEY}` },
    body: JSON.stringify({
      model: "gpt-5-mini",
      max_completion_tokens: 1500,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a professional Kenyan recruiter writing job descriptions for TalentKenya, Kenya's trusted job marketplace. Return a single JSON object with exactly these keys: 'description' (3-4 short paragraphs, 120-220 words, describing responsibilities, team context and growth path for the role), 'requirements' (array of 5-8 realistic requirement strings tailored to the role and experience level), 'benefits' (array of 3-5 realistic benefit strings), 'minSalary' and 'maxSalary' (strings, suggested monthly KES ranges typical for Nairobi/Kenya market), 'workMode' ('On-site', 'Hybrid' or 'Remote' — pick the most plausible default). Keep content grounded and realistic: no invented company names, no inflated figures. For Kenya-specific roles, mention common local tools (M-Pesa, KRA compliance) where relevant.",
        },
        {
          role: "user",
          content: `Write a complete job description package for the role: "${title}"\nIndustry category: ${category || "General"}\nExperience level: ${experience || "Mid-level"}`,
        },
      ],
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  let raw: string | null = data?.choices?.[0]?.message?.content ?? null;
  if (raw && typeof raw !== "string") raw = JSON.stringify(raw);
  if (!raw) return null;
  try {
    const json = JSON.parse(raw);
    const draft: JobDraft = {
      description: typeof json.description === "string" ? json.description : "",
      requirements: Array.isArray(json.requirements) ? json.requirements.map(String) : [],
      benefits: Array.isArray(json.benefits) ? json.benefits.map(String) : [],
      minSalary: typeof json.minSalary === "string" ? json.minSalary : undefined,
      maxSalary: typeof json.maxSalary === "string" ? json.maxSalary : undefined,
      workMode: typeof json.workMode === "string" ? json.workMode : undefined,
    };
    if (!draft.description) return null;
    // strip markdown fences if the model wrapped JSON-in-JSON
    draft.description = draft.description.replace(/^```[\w]*\n?|\n?```$/g, "");
    return draft;
  } catch { return null; }
}

function localJobDescription(title: string, category: string, experience: string): JobDraft {
  const t = title || "the open role";
  return {
    description: `We are hiring a ${t} to join our growing team. In this role, you will own day-to-day delivery of your assigned workstreams, collaborate closely with cross-functional colleagues, and contribute to improving how our team operates.${experience && experience.toLowerCase() !== "no experience" ? ` Given the ${experience} requirement, we expect you to work with a high degree of autonomy, mentor junior teammates where relevant, and take ownership of outcomes rather than tasks.` : " We welcome motivated starters who are eager to learn, grow, and contribute meaningfully from day one."}\n\nThe role is based in our ${category || "main office"} team and follows a structured onboarding process during your first 30 days. You will report to a team lead and take part in weekly planning sessions, with regular feedback loops to support your development. There is a clear path to senior responsibilities as you demonstrate consistent delivery.${category ? ` Candidates with background or interest in ${category.toLowerCase()} will have a natural advantage in ramping up quickly.` : ""}`,
    requirements: [
      `Proven ability to deliver work in a ${t.toLowerCase().includes("engineer") || t.toLowerCase().includes("developer") ? "technical" : "professional"} environment`,
      "Strong written and verbal communication skills in English and Swahili",
      "Comfortable using productivity tools such as Google Workspace, Slack, and Excel",
      "Detail-oriented with the ability to meet deadlines independently",
      "Team player with a proactive, solutions-first attitude",
    ],
    benefits: ["Medical cover", "M-Pesa salary payments", "Clear promotion path", "Annual learning budget"],
    workMode: "Hybrid",
  };
}

export async function generateJobDraft(title: string, category: string, experience: string): Promise<{ draft: JobDraft; engine: "ai" | "local" }> {
  try {
    const ai = await aiJobDescription(title, category, experience);
    if (ai) return { draft: ai, engine: "ai" };
  } catch { /* fall through */ }
  return { draft: localJobDescription(title, category, experience), engine: "local" };
}

/* ---------- Match breakdown: matched / missing skill tokens ---------- */
export function matchBreakdown(profile: Profile, job: JobLite): { matched: string[]; missing: string[] } {
  const profTokens = new Set(
    [profile.title, ...profile.skills, ...profile.experience.map(e => e.role), ...profile.experience.map(e => e.company)]
      .map(s => s.toLowerCase())
      .flatMap(s => s.split(/[\s,./-]+/))
      .filter(s => s.length >= 3 && !/^https?$|^www/.test(s))
  );
  // Extract multi-word requirement phrases as the primary matching units
  const matched = new Set<string>();
  const missing = new Set<string>();
  const phrases: string[] = [];
  for (const r of job.requirements) {
    const lower = r.toLowerCase();
    // Try 3-word, then 2-word, then the full requirement if short
    const words = lower.split(/\s+/).filter(w => w.length > 2);
    if (words.length <= 2) { phrases.push(r); continue; }
    let covered = false;
    for (let len = Math.min(3, words.length); len >= 2 && !covered; len--) {
      for (let i = 0; i <= words.length - len && !covered; i++) {
        const ph = words.slice(i, i + len).join(" ");
        if (Array.from(profTokens).some(t => t.includes(ph) || ph.includes(t))) { matched.add(ph); covered = true; }
      }
    }
    if (!covered) phrases.push(r);
  }
  // Also surface plain profile skills absent from the job
  for (const s of profile.skills) {
    const ls = s.toLowerCase();
    const jobText = [job.title, ...job.requirements, ...job.benefits, job.description].join(" ").toLowerCase();
    if (!jobText.includes(ls) && !Array.from(matched).some(m => m.includes(ls))) missing.add(s);
  }
  return {
    matched: Array.from(matched).slice(0, 8),
    missing: phrases.slice(0, 6),
  };
}

/* ---------- Public API ---------- */
export async function generateCoverLetter(profile: Profile, job: JobLite): Promise<{ text: string; engine: "ai" | "local" }> {
  try {
    const ai = await aiCoverLetter(profile, job);
    if (ai) return { text: ai, engine: "ai" };
  } catch { /* fall through */ }
  return { text: localCoverLetter(profile, job), engine: "local" };
}
