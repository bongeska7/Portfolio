/**
 * @file src/data/portfolio.ts
 *
 * Centralized, type-safe portfolio data store.
 *
 * All hardcoded configuration arrays and mock data that were previously
 * inlined inside presentation components live here. Components import
 * the exported constants directly — no prop-drilling required.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Exports
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  ExperienceSection
 *    CURRENT_ROLE        — Role
 *
 *  TeacherHelperSection
 *    CLASSROOM_GAMES     — ClassroomGame[]
 *    LESSON_VIDEO        — LessonVideo
 *    WORKSHEETS          — WorksheetPage[]
 *
 *  ProjectShowcase
 *    PROJECTS            — Project[]
 *
 *  CredentialsDeck
 *    CREDENTIALS         — Credential[]
 *    SETTLED_ROTATIONS   — readonly number[]
 *
 *  SkillsBento
 *    SKILL_GROUPS        — Record<SkillGroupId, SkillGroup>
 *    PROGRAMMING_LANGUAGES — string[]
 *    SPOKEN_LANGUAGES    — SpokenLanguage[]
 *    TERMINAL_LINES      — TermLine[]
 *    TERM_COLOR          — Record<TermType, string>
 *    NET_NODES           — NetNode[]
 *    NET_EDGES           — [number, number][]
 */

// ─────────────────────────────────────────────────────────────────────────────
// ExperienceSection types & data
// ─────────────────────────────────────────────────────────────────────────────

export interface Role {
  company: string;
  title: string;
  location: string;
  type: string;
  /** e.g. "2026 — Present" */
  period: string;
  schedule: string;
  /** One or two sentences about the company */
  about: string;
  /** What you work on — rendered as a bullet list, hidden when empty */
  highlights: string[];
  /** Day-to-day technologies */
  stack: string[];
  /** Business domain tags */
  focus: string[];
  link?: string;
}

export const CURRENT_ROLE: Role = {
  company: "ICS Financial Systems",
  title: "Developer",
  location: "Amman, Jordan",
  type: "Full-time",
  period: "Oct 2026 — Present",
  schedule: "Sun – Thu · 08:00 – 16:30",
  about:
    "ICS Financial Systems (ICSFS) builds ICS BANKS — a core banking software suite that " +
    "banks in many countries run their day-to-day operations on. I work on the Oracle side " +
    "of the platform: SQL and PL/SQL on Oracle Database, alongside Java.",
  // TODO: add 2–4 short lines about what you build at ICS once you have them (modules, impact).
  highlights: [],
  stack: ["Oracle Database", "PL/SQL", "SQL", "Java", "oracledb"],
  focus: ["Core Banking", "Enterprise Software", "Financial Systems"],
  link: "https://www.icsfs.com",
};

// ─────────────────────────────────────────────────────────────────────────────
// TeacherHelperSection types & data
// ─────────────────────────────────────────────────────────────────────────────

export interface ClassroomGame {
  id: string;
  title: string;
  grade: string;
  subject: string;
  tagline: string;
  description: string;
  tech: string[];
  url: string;
  accent: string;
  /** Short caveat shown under the description */
  note?: string;
  /** Optional screenshot (path relative to /public). Falls back to the illustrated art. */
  image?: string;
  /** Which built-in illustration to draw when there is no screenshot */
  art: "max" | "pip";
}

export const CLASSROOM_GAMES: ClassroomGame[] = [
  {
    id: "max",
    title: "Max the Robot Cat",
    grade: "Grade 2",
    subject: "Math",
    tagline: "A live voice helper on the classroom projector.",
    description:
      "A real-time voice agent for the classroom projector. Speech-to-speech over the Gemini " +
      "Live API with push-to-talk turn control, a Rive-animated character lip-synced to the " +
      "audio stream, session resumption for full-length lessons, and ephemeral tokens minted " +
      "by a serverless function so the API key never reaches the browser.",
    tech: ["Gemini Live API", "Rive", "TypeScript", "Vite", "Vercel Functions"],
    url: "https://max-robot.vercel.app",
    accent: "#38bdf8",
    note: "Teacher sign-in required",
    art: "max",
  },
  {
    id: "pip",
    title: "Pip's Magic Garden",
    grade: "Grade 1",
    subject: "Science",
    tagline: "Parts of a plant, played on the smartboard.",
    description:
      "A touch-first learning game for the smartboard: drag-or-tap interactions, a WebGL " +
      "(PixiJS) garden that grows a new plant part with every level, and fully voiced dialogue " +
      "pre-rendered with neural text-to-speech. The renderer measures frame rate and scales " +
      "its effects down on low-end classroom hardware.",
    tech: ["React", "Motion", "PixiJS", "TypeScript", "Edge TTS"],
    url: "https://pips-magic-garden.vercel.app",
    accent: "#10b981",
    art: "pip",
  },
];

export interface LessonVideo {
  title: string;
  grade: string;
  subject: string;
  duration: string;
  description: string;
  /** Paths relative to /public */
  src: string;
  poster: string;
  /** Lesson vocabulary shown as floating chips around the phone */
  keywords: string[];
}

export const LESSON_VIDEO: LessonVideo = {
  title: "Parts of a Plant",
  grade: "Grade 1",
  subject: "Science",
  duration: "1:14",
  description:
    "A narrated, AI-generated science lesson scripted to the Grade 1 curriculum — produced " +
    "with generative video and voice models, then edited for the class screen.",
  src: "/videos/plants-lesson.mp4",
  poster: "/images/teacherhelper/plants-poster.jpg",
  keywords: ["Roots", "Stem", "Leaves", "Flower", "Fruit"],
};

export interface WorksheetPage {
  title: string;
  topic: string;
  /** Path relative to /public — 1105 × 1338 px */
  image: string;
}

export const WORKSHEETS: WorksheetPage[] = [
  { title: "Let's Name a Number!",     topic: "Three-digit numbers",         image: "/images/teacherhelper/worksheet-1.jpg" },
  { title: "Bolt's Number Builder",    topic: "Add & subtract 10 and 100",   image: "/images/teacherhelper/worksheet-2.jpg" },
  { title: "Trade a Hundred!",         topic: "Regrouping hundreds",         image: "/images/teacherhelper/worksheet-3.jpg" },
  { title: "Treasure Trail",           topic: "Compare & order numbers",     image: "/images/teacherhelper/worksheet-4.jpg" },
  { title: "Which Number Is Greater?", topic: "Comparing with >, < and =",   image: "/images/teacherhelper/worksheet-5.jpg" },
  { title: "Rocket Route",             topic: "Reading number names",        image: "/images/teacherhelper/worksheet-6.jpg" },
];

// ─────────────────────────────────────────────────────────────────────────────
// ProjectShowcase types & data
// ─────────────────────────────────────────────────────────────────────────────

export interface Project {
  id: number;
  title: string;
  tagline: string;
  description: string;
  tech: string[];
  /** Primary accent hex colour */
  accent: string;
  /** Same colour at low opacity — used for badge backgrounds */
  accentDim: string;
  year: string;
  /** Path relative to /public */
  image: string;
  images: string[]; // array of images for the carousel
  role: string;
  link?: string;
}

export const PROJECTS: Project[] = [
  {
    id: 0,
    title: "Murshed Pipeline",
    tagline: "Automated conversational AI evaluation.",
    description:
      "An automated pipeline designed to test and grade conversational onboarding flows for Murshed (an AI student advisor). " +
      "It simulates student interactions using LLM Tester agents driven by custom student personas, executes turn-by-turn " +
      "evaluations in LangGraph, and generates structured quality reports via a Judge agent. Features a FastAPI/Celery/Redis " +
      "async worker pool and a real-time React dashboard.",
    tech: ["LangGraph", "FastAPI", "Celery", "Redis", "React", "Docker"],
    accent: "#7c3aed",
    accentDim: "rgba(124,58,237,0.12)",
    year: "2026",
    image: "/images/project-1-1.png",
    images: ["/images/project-1-1.png"],
    role: "Lead Developer",
    link: "https://github.com/bongeska7/Automated-Conversational-AI-Evaluation-Pipeline-",
  },
  {
    id: 1,
    title: "Risk Management (QM)",
    tagline: "Enterprise risk governance and tracking.",
    description:
      "A full-stack enterprise web application built for the University of Jordan to centralize risks and incidents " +
      "across all departments. Implements pre- and post-event risk assessment, a localized Arabic RTL interface, " +
      "real-time notifications, audit logs, and an N-tier architecture. Secured with JWT and ASP.NET Identity.",
    tech: ["React 19", "ASP.NET Core 9", "EF Core 9", "SQL Server", "JWT", "Docker"],
    accent: "#0891b2",
    accentDim: "rgba(8,145,178,0.12)",
    year: "2026",
    image: "/images/project-2-1.png",
    images: [
      "/images/project-2-1.png",
      "/images/project-2-2.png",
      "/images/project-2-3.png",
      "/images/project-2-4.png"
    ],
    role: "Full-Stack Architect",
    link: "https://github.com/bongeska7/final-integrated-Risk-mangement-system",
  },
  {
    id: 2,
    title: "Kashly",
    tagline: "Personal finance companion app.",
    description:
      "A personal finance companion built with Flutter and Firebase. It helps users track daily transactions, manage wallet/bank balances, " +
      "log credit/debit cards, set monthly budgets with visual spending insights (pie charts via fl_chart), and track savings goals with real-time " +
      "progress indicators. Features email/password authentication, a persistent dark/light theme, and a clean Material 3 UI with a warm brown palette.",
    tech: ["Flutter", "Firebase", "Cloud Firestore", "Material 3", "fl_chart"],
    accent: "#b45309",
    accentDim: "rgba(180,83,9,0.12)",
    year: "2026",
    image: "/images/project-3-1.png",
    images: [
      "/images/project-3-1.png",
      "/images/project-3-2.png",
      "/images/project-3-3.png",
      "/images/project-3-4.png"
    ],
    role: "Lead Developer",
    link: "https://github.com/bongeska7/Kashly",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// CredentialsDeck types & data
// ─────────────────────────────────────────────────────────────────────────────

export type CredentialType = "certificate" | "photo" | "memory";

export interface Credential {
  id: number;
  type: CredentialType;
  title: string;
  subtitle: string;
  meta: string;
  accent: string;
  accentDim: string;
  image: string;
}

export const CREDENTIALS: Credential[] = [
  {
    id: 0,
    type: "certificate",
    title: "KASIT Contest Participation",
    subtitle: "Junior to Solve Problem-Solving Contest",
    meta: "KASIT Team · May 2023",
    accent: "#7c3aed",
    accentDim: "rgba(124,58,237,0.14)",
    image: "/images/cred-1.png",
  },
  {
    id: 1,
    type: "certificate",
    title: "Quality Assurance Automation",
    subtitle: "Professional Course Completion",
    meta: "iTeam · Sep 2025",
    accent: "#0891b2",
    accentDim: "rgba(8,145,178,0.14)",
    image: "/images/cred-2.png",
  },
  {
    id: 2,
    type: "certificate",
    title: "ASP.NET Core Development",
    subtitle: "40-Hour Professional Program",
    meta: "The Hope International · Apr 2026",
    accent: "#d97706",
    accentDim: "rgba(217,119,6,0.14)",
    image: "/images/cred-3.png",
  },
  {
    id: 3,
    type: "certificate",
    title: "Hult Prize Local Competition",
    subtitle: "1st Runner-Up — Sci Sphere Team",
    meta: "Hult Prize · 2026",
    accent: "#db2777",
    accentDim: "rgba(219,39,119,0.14)",
    image: "/images/cred-4.png",
  },
  {
    id: 4,
    type: "certificate",
    title: "Hult Prize Local Competition",
    subtitle: "1st Runner-Up Certificate",
    meta: "Hult Prize · 2026",
    accent: "#db2777",
    accentDim: "rgba(219,39,119,0.14)",
    image: "/images/cred-5.png",
  },
  {
    id: 5,
    type: "certificate",
    title: "UI/UX Design Program",
    subtitle: "32-Hour Professional Certificate",
    meta: "The Hope International · Aug 2025",
    accent: "#2563eb",
    accentDim: "rgba(37,99,235,0.14)",
    image: "/images/cred-6.png",
  },
  {
    id: 6,
    type: "memory",
    title: "JU-Risk Presentation",
    subtitle: "Friends before colleagues",
    meta: "JU · May 2026",
    accent: "#ff9900",
    accentDim: "rgba(255,153,0,0.14)",
    image: "/images/cred-7.png",
  },
  {
    id: 7,
    type: "certificate",
    title: "Neural Networks: Zero to Hero",
    subtitle: "Deep Learning Video Course Series",
    meta: "Andrej Karpathy · YouTube · 2026",
    accent: "#7c3aed",
    accentDim: "rgba(124,58,237,0.14)",
    image: "/images/cred-8.png",
  },
  {
    id: 8,
    type: "certificate",
    title: "Neural Networks",
    subtitle: "Visual Deep Learning Series",
    meta: "3Blue1Brown · YouTube · 2026",
    accent: "#0891b2",
    accentDim: "rgba(8,145,178,0.14)",
    image: "/images/cred-9.png",
  },
];

/**
 * The settled rotation (degrees) of each card once it has risen to centre.
 * Card 0 stays flat; subsequent cards land at slight angles.
 * Must stay in sync with CREDENTIALS.length.
 */
export const SETTLED_ROTATIONS = [0, 3, -4, 2, -2, 4, -3, 2.5, -3.5] as const;

// ─────────────────────────────────────────────────────────────────────────────
// SkillsBento types & data
// ─────────────────────────────────────────────────────────────────────────────

export type SkillGroupId =
  | "ai" | "data" | "backend" | "ml" | "frontend" | "devops" | "security" | "design";

export interface SkillGroup {
  /** Small mono label above the title */
  eyebrow: string;
  title: string;
  blurb: string;
  /** Accent hex — used for pills, dots and the hover spotlight */
  accent: string;
  items: string[];
  /** Subset currently being learned — rendered with a "learning" marker */
  learning?: string[];
}

export const SKILL_GROUPS: Record<SkillGroupId, SkillGroup> = {
  ai: {
    eyebrow: "AI Engineering",
    title: "LLM Systems & Agents",
    blurb:
      "Agentic workflows, automated LLM evaluation and real-time voice AI — " +
      "orchestrated with LangGraph and served behind async APIs.",
    accent: "#a78bfa",
    items: [
      "LangGraph", "LangChain", "OpenAI API", "Gemini Live API", "Hugging Face",
      "Agent Orchestration", "LLM Evaluation", "Async Pipelines",
    ],
    learning: ["RAG", "Vector Databases"],
  },
  data: {
    eyebrow: "Databases",
    title: "Oracle & SQL",
    blurb: "Relational modelling and in-database logic — Oracle and PL/SQL daily at ICSFS.",
    accent: "#fb7185",
    items: [
      "Oracle Database", "PL/SQL", "SQL", "oracledb", "SQL Server",
      "Entity Framework Core", "Firestore", "Redis",
    ],
  },
  backend: {
    eyebrow: "Backend",
    title: "Services & APIs",
    blurb: "REST services, auth and async workers with clean N-tier boundaries.",
    accent: "#22d3ee",
    items: [
      "FastAPI", "ASP.NET Core", "Java", "REST API Design",
      "JWT · ASP.NET Identity", "Celery", "N-tier Architecture",
    ],
  },
  ml: {
    eyebrow: "Machine Learning",
    title: "Applied ML",
    blurb: "Feature engineering, model selection and hyperparameter tuning on real data.",
    accent: "#34d399",
    items: ["scikit-learn", "LightGBM", "PyTorch", "pandas", "NumPy", "SciPy", "Optuna", "OpenCV"],
  },
  frontend: {
    eyebrow: "Frontend & Mobile",
    title: "Interfaces",
    blurb: "Typed, animated and responsive — on the web and on mobile.",
    accent: "#60a5fa",
    items: [
      "React", "Next.js", "TypeScript", "Tailwind CSS", "GSAP",
      "Flutter", "Dart", "Material 3", "Recharts",
    ],
  },
  devops: {
    eyebrow: "DevOps & Cloud",
    title: "Ship & Operate",
    blurb: "Containerised services, version control and cloud deployment.",
    accent: "#fbbf24",
    items: ["Docker", "Git", "GitHub", "GitLab", "Linux", "Vercel", "GCP"],
    learning: ["Azure · AZ-900", "CI/CD"],
  },
  security: {
    eyebrow: "Security & QA",
    title: "Break It First",
    blurb: "Black-box web testing against the OWASP classics, plus automated E2E and API tests.",
    accent: "#4ade80",
    items: ["Burp Suite", "XSS · SQLi · XXE", "Black-box Testing", "Cypress", "Postman"],
  },
  design: {
    eyebrow: "Product Design",
    title: "Design & Product",
    blurb: "From Figma flows to shipped UI — designing the products I build.",
    accent: "#f472b6",
    items: ["Figma", "UI/UX Design", "User-Centered Design", "Data Visualisation", "Product Thinking"],
  },
};

export const PROGRAMMING_LANGUAGES = [
  "Python", "TypeScript", "Java", "C++", "SQL", "PL/SQL",
  "JavaScript", "Dart", "MATLAB", "Lua", "HTML", "CSS",
];

export interface SpokenLanguage {
  name: string;
  level: string;
  /** 0–1, drives the proficiency bar */
  value: number;
}

export const SPOKEN_LANGUAGES: SpokenLanguage[] = [
  { name: "Arabic",  level: "Native", value: 1 },
  { name: "English", level: "C1",     value: 0.85 },
  { name: "German",  level: "B2",     value: 0.68 },
];

// ── Terminal (SecurityCard) ───────────────────────────────────────────────────

export type TermType = "cmd" | "info" | "success" | "error";

export interface TermLine {
  text: string;
  type: TermType;
}

export const TERMINAL_LINES: TermLine[] = [
  { text: "$ burp scan https://shop.lab.local", type: "cmd" },
  { text: "> crawling 42 endpoints...", type: "info" },
  { text: "! reflected XSS      /search?q=", type: "error" },
  { text: "! SQL injection      /product?id=", type: "error" },
  { text: "! XXE                /api/import", type: "error" },
  { text: "✓ fixed: output encoding + CSP", type: "success" },
  { text: "✓ fixed: parameterised queries", type: "success" },
  { text: "✓ fixed: external entities off", type: "success" },
  { text: "$ npx cypress run --spec e2e/checkout", type: "cmd" },
  { text: "✓ 24 passing — 0 vulnerabilities re-found", type: "success" },
];

export const TERM_COLOR: Record<TermType, string> = {
  cmd: "#c4b5fd",   // violet-300
  info: "#94a3b8",   // slate-400
  success: "#34d399",   // emerald-400
  error: "#f87171",   // red-400
};

// ── Agent graph (AI card) — modelled on the conversational-AI evaluation
//    pipeline: personas + scenarios → tester ⇄ target → judge → map-reduce →
//    report / dashboard. Coordinates are in a 320 × 150 viewBox.

export interface NetNode {
  x: number;
  y: number;
  r: number;
  color: string;
  label: string;
}

export const NET_NODES: NetNode[] = [
  { x: 28,  y: 38,  r: 5, color: "#a78bfa", label: "personas" },
  { x: 28,  y: 112, r: 5, color: "#a78bfa", label: "scenarios" },
  { x: 112, y: 75,  r: 8, color: "#c4b5fd", label: "tester agent" },
  { x: 196, y: 30,  r: 6, color: "#22d3ee", label: "target LLM" },
  { x: 196, y: 120, r: 7, color: "#f472b6", label: "judge agent" },
  { x: 258, y: 75,  r: 6, color: "#34d399", label: "map-reduce" },
  { x: 300, y: 32,  r: 4, color: "#fbbf24", label: "report" },
  { x: 300, y: 118, r: 4, color: "#fbbf24", label: "dashboard" },
];

export const NET_EDGES: [number, number][] = [
  [0, 2], [1, 2], [2, 3], [3, 4], [2, 4], [4, 5], [5, 6], [5, 7],
];
