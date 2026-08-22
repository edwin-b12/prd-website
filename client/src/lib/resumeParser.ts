/* TalentKenya AI Resume Parser — dual-engine extraction.
   Primary: built-in LLM (forge proxy) with JSON-schema structured output.
   Fallback: deterministic regex extractor that always works offline.
   Outputs the same shape as CandidateProfilePage's profile fields. */

export interface ParsedResume {
  __engine: "ai" | "deterministic";
  firstName: string;
  lastName: string;
  title: string;
  phone: string;
  email: string;
  linkedin: string;
  summary: string;
  experience: { role: string; company: string; start: string; end: string; achievements: string }[];
  education: { institution: string; degree: string; field: string; year: string }[];
  skills: string[];
}

const EMPTY: ParsedResume = {
  __engine: "deterministic",
  firstName: "", lastName: "", title: "", phone: "", email: "", linkedin: "", summary: "",
  experience: [], education: [], skills: [],
};

/* ---------- Deterministic fallback extractor ---------- */
function cleanLines(text: string): string[] {
  return text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
}

const SECTION_RE = /^(work\s*experience|employment|professional\s*experience|experience|education|qualifications|academic|skills|technical\s*skills|core\s*competencies|competencies|summary|profile|objective|certifications?|projects|languages?|references?)\s*:?\s*$/i;
const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
const PHONE_RE = /(?:\+?254|0)\s?7\d{1,2}[ -]?\d{3}[ -]?\d{3}|(?:\+254|0)\s?1\d{2}[ -]?\d{3}[ -]?\d{3}/;
const LI_RE = /linkedin\.com\/in\/[A-Za-z0-9_-]+/i;
const YEAR_RE = /\b(19|20)\d{2}\b/;

function sectionOf(text: string): string {
  const lines = cleanLines(text);
  for (const l of lines) {
    const m = SECTION_RE.exec(l);
    if (m) return m[1].toLowerCase();
  }
  return "";
}

function deterministic(text: string): ParsedResume {
  const out: ParsedResume = { ...EMPTY, experience: [], education: [], skills: [] };
  const lines = cleanLines(text);
  const firstLines = lines.slice(0, 8).join("\n");

  // Email / phone / linkedin anywhere in the doc
  const email = EMAIL_RE.exec(text);
  if (email) out.email = email[0];
  const phone = PHONE_RE.exec(text.replace(/\s+/g, ""));
  if (phone) out.phone = phone[0].replace(/\s+/g, "");
  const li = LI_RE.exec(text);
  if (li) out.linkedin = li[0];

  // Name: first non-empty line that is short, has no digits, no @
  for (const l of lines.slice(0, 6)) {
    if (l.length > 2 && l.length < 40 && !/\d|@/.test(l) && !SECTION_RE.test(l)) {
      const parts = l.replace(/(mr|mrs|ms|dr)\.?\s*/i, "").split(/\s+/).filter(Boolean);
      if (parts.length >= 2) { out.firstName = parts[0]; out.lastName = parts.slice(1).join(" "); }
      break;
    }
  }

  // Section-based parsing
  let cur: "exp" | "edu" | "sum" | null = null;
  let expBuf: string[] = [];
  let eduBuf: string[] = [];
  let sumBuf: string[] = [];
  const flush = () => {
    if (cur === "exp") {
      const e = parseExpBlock(expBuf.join("\n"));
      if (e) out.experience.push(e);
    } else if (cur === "edu") {
      const e = parseEduBlock(eduBuf.join("\n"));
      if (e) out.education.push(e);
    }
    expBuf = []; eduBuf = [];
  };

  for (const l of lines) {
    const key = SECTION_RE.exec(l);
    if (key) {
      flush();
      const k = key[1].toLowerCase();
      cur = ["experience", "employment", "work experience", "professional experience"].includes(k) ? "exp"
        : ["education", "qualifications", "academic"].includes(k) ? "edu"
        : ["summary", "profile", "objective"].includes(k) ? "sum" : null;
      continue;
    }
    if (cur === "exp") expBuf.push(l);
    else if (cur === "edu") eduBuf.push(l);
    else if (cur === "sum") sumBuf.push(l);
  }
  flush();
  if (sumBuf.length) out.summary = sumBuf.join(" ").slice(0, 600);

  // Title: first line after name / near the top containing role-like words
  for (const l of lines.slice(1, 12)) {
    if (l.length > 3 && l.length < 70 && /\b(manager|engineer|developer|analyst|designer|teacher|nurse|accountant|officer|specialist|coordinator|administrator|technician|lead|consultant|driver|clerk|supervisor|assistant)\b/i.test(l) && !SECTION_RE.test(l)) {
      out.title = l; break;
    }
  }

  // Skills: comma/pipe-separated lists OR lines after a skills heading
  let skillsStart = -1;
  for (let i = 0; i < lines.length; i++) {
    if (SECTION_RE.test(lines[i]) && /^(skills|technical skills|core competencies|competencies)$/.test(lines[i].toLowerCase())) { skillsStart = i; break; }
  }
  if (skillsStart >= 0) {
    for (const l of lines.slice(skillsStart + 1, skillsStart + 8)) {
      if (SECTION_RE.test(l)) break;
      l.split(/[,;|•·]/).map(s => s.trim()).filter(s => s.length > 1 && s.length < 40).forEach(s => {
        if (!out.skills.includes(s)) out.skills.push(s);
      });
    }
  }
  if (out.skills.length === 0) {
    const common = /\b(?:javascript|python|java|excel|html|css|react|node|sql|photoshop|quickbooks|marketing|sales|customer service|inventory|logistics|project management|team leadership|communication|data analysis|accounting|microsoft office|kpi|seo|content writing|graphic design)\b/gi;
    const found = new Set<string>();
    let m: RegExpExecArray | null;
    while ((m = common.exec(text)) !== null) found.add(m[0]);
    out.skills = Array.from(found).slice(0, 12);
  }

  // Education from whole doc if no edu section: institution + year pairs
  if (out.education.length === 0) {
    const insts = /\b(university|college|institute|academy|high school)\b[^\n]{2,60}/gi;
    let im: RegExpExecArray | null;
    while ((im = insts.exec(text)) !== null) {
      const y = YEAR_RE.exec(im[0]);
      if (out.education.length < 4) out.education.push({ institution: im[0].trim().slice(0, 80), degree: "", field: "", year: y ? y[0] : "" });
    }
  }

  return out;
}

function parseExpBlock(block: string): ParsedResume["experience"][0] | null {
  const lines = cleanLines(block);
  if (lines.length === 0) return null;
  const roleLine = lines[0];
  const rest = lines.slice(1).join(" ");
  const years = Array.from(rest.matchAll(/\b(20[0-2]\d|19\d\d)\b/g)).map(m => m[0]);
  const y1 = years[0] ?? ""; const y2 = years[1] ?? "";
  const companyMatch = /\bat\s+([A-Z][^\n,;]{2,40})/i.exec(rest);
  return {
    role: roleLine.slice(0, 60),
    company: companyMatch ? companyMatch[1].trim() : "",
    start: y1, end: y2 || (y1 ? "Present" : ""),
    achievements: rest.replace(/\b(20|19)\d{2}\b/g, "").slice(0, 300).trim(),
  };
}

function parseEduBlock(block: string): ParsedResume["education"][0] | null {
  const lines = cleanLines(block);
  if (lines.length === 0) return null;
  const y = YEAR_RE.exec(block);
  return { institution: lines[0].slice(0, 80), degree: lines[1]?.slice(0, 60) ?? "", field: "", year: y ? y[0] : "" };
}

/* ---------- AI engine via built-in LLM proxy ---------- */
const LLM_URL = (typeof window !== "undefined" && (window as unknown as { __TK_FORGE_URL?: string }).__TK_FORGE_URL) ?? import.meta.env.VITE_FRONTEND_FORGE_API_URL;
const LLM_KEY = (typeof window !== "undefined" && (window as unknown as { __TK_FORGE_KEY?: string }).__TK_FORGE_KEY) ?? import.meta.env.VITE_FRONTEND_FORGE_API_KEY;

const SCHEMA = {
  type: "json_schema",
  json_schema: {
    name: "resume",
    strict: true,
    schema: {
      type: "object",
      properties: {
        firstName: { type: "string" },
        lastName: { type: "string" },
        title: { type: "string" },
        phone: { type: "string" },
        email: { type: "string" },
        linkedin: { type: "string" },
        summary: { type: "string" },
        experience: {
          type: "array",
          items: {
            type: "object",
            properties: {
              role: { type: "string" },
              company: { type: "string" },
              start: { type: "string" },
              end: { type: "string" },
              achievements: { type: "string" },
            },
            required: ["role", "company", "start", "end", "achievements"],
            additionalProperties: false,
          },
        },
        education: {
          type: "array",
          items: {
            type: "object",
            properties: {
              institution: { type: "string" },
              degree: { type: "string" },
              field: { type: "string" },
              year: { type: "string" },
            },
            required: ["institution", "degree", "field", "year"],
            additionalProperties: false,
          },
        },
        skills: { type: "array", items: { type: "string" } },
      },
      required: ["firstName", "lastName", "title", "phone", "email", "linkedin", "summary", "experience", "education", "skills"],
      additionalProperties: false,
    },
  },
};

async function aiExtract(text: string): Promise<ParsedResume | null> {
  if (!LLM_URL || !LLM_KEY) return null;
  const res = await fetch(`${LLM_URL}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${LLM_KEY}` },
    body: JSON.stringify({
      model: "gpt-5-mini",
      max_completion_tokens: 3000,
      messages: [
        {
          role: "system",
          content: "You are a precise resume parser for a Kenyan job marketplace. Extract candidate details from the CV text and return ONLY valid JSON matching the schema. If a value is not present, use an empty string. Kenya phone numbers look like +2547XXXXXXXX or 07XXXXXXXX. Do not invent facts not supported by the text.",
        },
        { role: "user", content: `Parse this CV:\n\n${text.slice(0, 15000)}` },
      ],
      response_format: SCHEMA,
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content;
  if (!raw) return null;
  const parsed = JSON.parse(raw) as ParsedResume;
  // guard: at least some fields extracted
  const hasSignal = parsed.email || parsed.firstName || parsed.skills.length > 0 || parsed.experience.length > 0;
  return hasSignal ? { ...parsed, __engine: "ai" } : null;
}

/* ---------- Public API ---------- */
export async function extractResume(text: string): Promise<ParsedResume> {
  try {
    const ai = await aiExtract(text);
    if (ai) return ai;
  } catch { /* fall through */ }
  return deterministic(text);
}

/* ---------- PDF text extraction (pdf.js from CDN) ---------- */
let pdfjsPromise: Promise<boolean> | null = null;

function loadPdfJs(): Promise<boolean> {
  if (pdfjsPromise) return pdfjsPromise;
  pdfjsPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.mjs";
    script.type = "module";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
  return pdfjsPromise;
}

export async function pdfToText(file: File): Promise<string> {
  const loaded = await loadPdfJs();
  const pdfjsLib = (window as unknown as { pdfjsLib?: { getDocument: (src: { data: ArrayBuffer }) => { promise: Promise<{ numPages: number; getPage: (n: number) => Promise<{ getTextContent: () => Promise<{ items: { str?: string }[] }> }> }> } } }).pdfjsLib;
  if (!loaded || !pdfjsLib) {
    throw new Error("PDF library unavailable");
  }
  const buf = await file.arrayBuffer();
  const loading = pdfjsLib.getDocument({ data: buf });
  const doc = await ("promise" in loading ? loading.promise : loading);
  let text = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((it) => (it as { str?: string }).str ?? "").join(" ") + "\n\n";
  }
  return text;
}
