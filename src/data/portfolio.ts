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
 *  ProjectShowcase
 *    PROJECTS            — Project[]
 *
 *  CredentialsDeck
 *    CREDENTIALS         — Credential[]
 *    SETTLED_ROTATIONS   — readonly number[]
 *
 *  SkillsBento
 *    TECH_CATEGORIES     — TechCategory[]
 *    TERMINAL_LINES      — TermLine[]
 *    TERM_COLOR          — Record<TermType, string>
 *    NET_NODES           — NetNode[]
 *    NET_EDGES           — [number, number][]
 */

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
];

/**
 * The settled rotation (degrees) of each card once it has risen to centre.
 * Card 0 stays flat; subsequent cards land at slight angles.
 * Must stay in sync with CREDENTIALS.length.
 */
export const SETTLED_ROTATIONS = [0, 3, -4, 2, -2, 4, -3] as const;

// ─────────────────────────────────────────────────────────────────────────────
// SkillsBento types & data
// ─────────────────────────────────────────────────────────────────────────────

export interface TechCategory {
  label: string;
  accent: string;
  dim: string;
  border: string;
  items: readonly string[];
}

export const TECH_CATEGORIES: TechCategory[] = [
  {
    label: "UI & Development",
    accent: "#7c3aed",
    dim: "rgba(124,58,237,0.10)",
    border: "rgba(124,58,237,0.22)",
    items: ["React", "Flutter", "ASP.NET Core", "Cypress", "LÖVE 2D"],
  },
  {
    label: "Backend & Infrastructure",
    accent: "#0891b2",
    dim: "rgba(8,145,178,0.10)",
    border: "rgba(8,145,178,0.22)",
    items: ["Docker", "LangChain", "Postman", "Power BI"],
  },
  {
    label: "Design & Craft",
    accent: "#10b981",
    dim: "rgba(16,185,129,0.10)",
    border: "rgba(16,185,129,0.22)",
    items: ["Figma", "Problem Solving"],
  },
];

// ── Terminal (SecurityCard) ───────────────────────────────────────────────────

export type TermType = "cmd" | "info" | "success" | "error";

export interface TermLine {
  text: string;
  type: TermType;
}

export const TERMINAL_LINES: TermLine[] = [
  { text: "$ init sec-scanner v3.2.1", type: "cmd" },
  { text: "> scanning attack surface...", type: "info" },
  { text: "■ open ports: 22, 80, 443", type: "info" },
  { text: "✓ HTTPS — TLS 1.3 enforced", type: "success" },
  { text: "✓ HSTS preload — 2yr max-age", type: "success" },
  { text: "! CVE-2024-28859 — critical", type: "error" },
  { text: "> applying patch 0xF3A2...", type: "info" },
  { text: "✓ patched in 148ms", type: "success" },
  { text: "$ docker build --no-cache .", type: "cmd" },
  { text: "✓ portfolio:v2.1  341MB", type: "success" },
  { text: "$ deploying → prod-01...", type: "cmd" },
  { text: "✓ health checks passed  ■", type: "success" },
];

export const TERM_COLOR: Record<TermType, string> = {
  cmd: "#c4b5fd",   // violet-300
  info: "#94a3b8",   // slate-400
  success: "#34d399",   // emerald-400
  error: "#f87171",   // red-400
};

// ── Agent network visualization (IntelligentSystemsCard) ─────────────────────

export interface NetNode {
  x: number;
  y: number;
  r: number;
  color: string;
}

export const NET_NODES: NetNode[] = [
  { x: 16, y: 44, r: 4, color: "#7c3aed" },
  { x: 46, y: 18, r: 3, color: "#0891b2" },
  { x: 72, y: 42, r: 5, color: "#7c3aed" },
  { x: 96, y: 16, r: 3.5, color: "#10b981" },
  { x: 120, y: 46, r: 4, color: "#0891b2" },
  { x: 58, y: 66, r: 6, color: "#7c3aed" },
  { x: 92, y: 72, r: 3, color: "#10b981" },
  { x: 138, y: 58, r: 4, color: "#d97706" },
  { x: 158, y: 28, r: 3, color: "#0891b2" },
  { x: 30, y: 74, r: 3.5, color: "#10b981" },
  { x: 172, y: 64, r: 3, color: "#d97706" },
];

export const NET_EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [1, 5],
  [2, 5], [5, 6], [4, 7], [7, 8], [6, 7],
  [9, 5], [8, 10], [3, 8],
];
