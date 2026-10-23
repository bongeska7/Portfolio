"use client";

/**
 * @file src/components/SkillsBento.tsx
 *
 * Technical Skills Bento Grid
 * ─────────────────────────────────────────────────────────────────────────────
 * Programming-language ticker, then a 4-column bento (2 on tablet, 1 on phone):
 *
 *   ┌───────────────────────┬───────────────────────┐
 *   │  AI Engineering       │  Oracle & SQL         │
 *   │  (agent graph)        │  (PL/SQL typer)       │
 *   │  2 × 2                ├───────────┬───────────┤
 *   │                       │ Backend   │ ML        │
 *   ├───────────┬───────────┼───────────┴───────────┤
 *   │ Frontend  │ DevOps    │  Security & QA        │
 *   │           │           │  (terminal)           │
 *   ├───────────┴───────────┼───────────┬───────────┤
 *   │  Evolutionary Walker  │ Design    │ Languages │
 *   ├───────────────────────┴───────────┴───────────┤
 *   │  Status & Availability                        │
 *   └───────────────────────────────────────────────┘
 *
 * ## Mouse Glow (spotlight effect)
 *   Each `BentoCard` writes `--mouse-x` / `--mouse-y` CSS custom properties
 *   to its own DOM node on mousemove (rAF-throttled) — zero React re-renders.
 *
 * ## Animation
 *   • Cards rise in with ScrollTrigger.batch; each card's `[data-pill]`
 *     chips then pop in with a stagger.
 *   • Agent graph edges draw in, then dashes flow along them (CSS).
 *   • PL/SQL lines type in left-to-right via clip-path.
 *   • Security terminal plays on a loop while visible (works on touch too).
 *   • Evolutionary walker only runs its rAF loop while on screen.
 *   • Everything respects `prefers-reduced-motion`.
 */

import { useState, useEffect, useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import TextReveal from "@/components/TextReveal";
import {
  SKILL_GROUPS,
  PROGRAMMING_LANGUAGES,
  SPOKEN_LANGUAGES,
  TERMINAL_LINES,
  TERM_COLOR,
  NET_NODES,
  NET_EDGES,
  CURRENT_ROLE,
  type SkillGroup,
  type TermLine,
} from "@/data/portfolio";

/** Unique technologies across every group + languages, for the header stat */
const TECH_COUNT = new Set([
  ...Object.values(SKILL_GROUPS).flatMap((g) => [...g.items, ...(g.learning ?? [])]),
  ...PROGRAMMING_LANGUAGES,
]).size;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ─────────────────────────────────────────────────────────────────────────────
// BentoCard — shared wrapper with mouse-tracking spotlight glow
// ─────────────────────────────────────────────────────────────────────────────

interface BentoCardProps {
  children:   ReactNode;
  className?: string;
  /** Accent hex for the spotlight + top shimmer. Defaults to white. */
  accent?:    string;
}

function BentoCard({ children, className = "", accent }: BentoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef  = useRef<number>(0);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    // Safe initial position — gradient centred on the card
    card.style.setProperty("--mouse-x", "50%");
    card.style.setProperty("--mouse-y", "50%");

    const onMove = (e: MouseEvent) => {
      // Throttle to one write per paint frame — keeps the main thread free
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
        card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
      });
    };

    card.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      card.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // The browser resolves var(--mouse-x/y) at paint time, so the gradient
  // tracks the cursor with zero JS overhead after the initial setProperty.
  const glow = accent ? `${accent}24` : "rgba(255,255,255,0.09)";

  return (
    <div
      ref={cardRef}
      data-skill-card
      className={`
        group relative overflow-hidden rounded-2xl
        border border-white/[0.07] hover:border-white/[0.13]
        bg-[#0c0c1a] transition-colors duration-500
        ${className}
      `}
    >
      {/* Spotlight overlay — pointer-events:none so it never blocks clicks */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle at var(--mouse-x) var(--mouse-y), ${glow} 0%, transparent 65%)` }}
      />
      {/* Top-edge shimmer in the card's accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${accent ? `${accent}66` : "rgba(255,255,255,0.11)"} 50%, transparent 100%)`,
        }}
      />
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared card pieces
// ─────────────────────────────────────────────────────────────────────────────

function CardHeader({ group, badge }: { group: SkillGroup; badge?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse motion-reduce:animate-none"
            style={{ backgroundColor: group.accent }}
            aria-hidden="true"
          />
          <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/35">
            {group.eyebrow}
          </span>
        </div>
        <h3 className="text-lg font-bold text-white tracking-tight leading-snug">{group.title}</h3>
      </div>
      {badge}
    </div>
  );
}

function SkillPills({ group }: { group: SkillGroup }) {
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label={`${group.title} skills`}>
      {group.items.map((item) => (
        <li
          key={item}
          data-pill
          className="px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-transform duration-200 hover:-translate-y-0.5 cursor-default select-none"
          style={{
            borderColor:     `${group.accent}33`,
            color:           group.accent,
            backgroundColor: `${group.accent}12`,
          }}
        >
          {item}
        </li>
      ))}
      {group.learning?.map((item) => (
        <li
          key={item}
          data-pill
          title="Currently learning"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono border border-dashed border-white/15 text-white/50 cursor-default select-none"
        >
          <span className="w-1 h-1 rounded-full bg-white/40 animate-pulse motion-reduce:animate-none" aria-hidden="true" />
          {item}
          <span className="sr-only">(learning)</span>
        </li>
      ))}
    </ul>
  );
}

/** Standard skill card: header, blurb, pills, optional visual underneath */
function SkillCard({
  group,
  className = "",
  badge,
  children,
}: {
  group: SkillGroup;
  className?: string;
  badge?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <BentoCard accent={group.accent} className={`p-6 flex flex-col ${className}`}>
      <CardHeader group={group} badge={badge} />
      <p className="text-white/40 text-xs leading-relaxed mb-5">{group.blurb}</p>
      <SkillPills group={group} />
      {children}
    </BentoCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Visual — Agent graph (AI card)
// ─────────────────────────────────────────────────────────────────────────────

function AgentGraph() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power2.out" },
      });
      tl.fromTo("[data-edge]", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.5, stagger: 0.08 })
        .fromTo("[data-node]",
          { scale: 0, transformOrigin: "50% 50%" },
          { scale: 1, duration: 0.45, ease: "back.out(2.4)", stagger: 0.06 },
          0.15)
        .fromTo("[data-flow], [data-label]", { opacity: 0 }, { opacity: 1, duration: 0.5, stagger: 0.03 }, ">-0.2");

      ScrollTrigger.create({ trigger: svg, start: "top 85%", once: true, onEnter: () => tl.play() });
    }, svg);

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative mt-6 flex-1 min-h-[180px] rounded-xl border border-white/[0.05] bg-[#060610] overflow-hidden">
      <div className="absolute top-3 left-4 font-mono text-[10px] tracking-[0.18em] uppercase text-white/25">
        LangGraph · eval pipeline
      </div>
      <svg
        ref={svgRef}
        viewBox="0 0 320 150"
        className="absolute inset-0 w-full h-full p-4 pt-8"
        role="img"
        aria-label="Agent graph: personas and scenarios feed a tester agent that converses with the target LLM; a judge agent scores turns, results are map-reduced into a report and dashboard"
      >
        {NET_EDGES.map(([a, b]) => {
          const n1 = NET_NODES[a]!;
          const n2 = NET_NODES[b]!;
          return (
            <g key={`${a}-${b}`}>
              {/* Base edge — drawn in on enter */}
              <line
                data-edge
                x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y}
                pathLength={1} strokeDasharray="1" strokeDashoffset="0"
                stroke="rgba(167,139,250,0.28)" strokeWidth="1.2"
              />
              {/* Flowing dashes on top */}
              <line
                data-flow
                x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y}
                stroke={n2.color} strokeOpacity="0.75" strokeWidth="1.4"
                strokeDasharray="2 8" strokeLinecap="round"
                className="animate-flow motion-reduce:animate-none"
              />
            </g>
          );
        })}

        {NET_NODES.map((n, i) => (
          <g key={n.label}>
            <circle cx={n.x} cy={n.y} r={n.r + 5} fill={n.color} opacity="0.12"
                    className="animate-pulse motion-reduce:animate-none" style={{ animationDelay: `${i * 0.3}s` }} />
            <circle data-node cx={n.x} cy={n.y} r={n.r} fill={n.color} />
            <text
              data-label
              x={n.x}
              y={n.y + n.r + 11}
              textAnchor={n.x < 40 ? "start" : n.x > 280 ? "end" : "middle"}
              className="font-mono"
              fontSize="8"
              fill="rgba(255,255,255,0.5)"
            >
              {n.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Visual — PL/SQL typer (Oracle card)
// ─────────────────────────────────────────────────────────────────────────────

const PLSQL_LINES = [
  "CREATE OR REPLACE PROCEDURE post_txn (",
  "  p_acc IN NUMBER, p_amt IN NUMBER",
  ") AS",
  "BEGIN",
  "  UPDATE accounts",
  "     SET balance = balance + p_amt",
  "   WHERE id = p_acc;",
  "  COMMIT;",
  "END post_txn;",
];

const PLSQL_KEYWORDS =
  /\b(CREATE|OR|REPLACE|PROCEDURE|IN|NUMBER|AS|BEGIN|UPDATE|SET|WHERE|COMMIT|END)\b/;

/** Minimal highlighter: keywords rose, everything else soft white */
function highlight(line: string) {
  return line.split(PLSQL_KEYWORDS).map((part, i) =>
    PLSQL_KEYWORDS.test(part) ? (
      <span key={i} className="text-rose-300">{part}</span>
    ) : (
      <span key={i} className="text-white/70">{part}</span>
    ),
  );
}

function PlsqlTyper() {
  const boxRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    if (!box || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-code-line]",
        { clipPath: "inset(0 100% 0 0)" },
        {
          clipPath: "inset(0 0% 0 0)",
          duration: 0.45,
          ease: "steps(18)", // stepped → reads like typing
          stagger: 0.32,
          scrollTrigger: { trigger: box, start: "top 85%", once: true },
        },
      );
    }, box);

    return () => ctx.revert();
  }, []);

  return (
    <pre
      ref={boxRef}
      aria-label="Example PL/SQL procedure"
      className="mt-5 flex-1 rounded-xl border border-white/[0.05] bg-[#060610] p-4 font-mono text-[10.5px] sm:text-[11px] leading-[1.7] overflow-x-auto [scrollbar-width:none]"
    >
      <span className="block text-white/25 mb-1">-- illustrative</span>
      {PLSQL_LINES.map((line, i) => (
        <span key={i} data-code-line className="block whitespace-pre">
          <span className="inline-block w-5 text-white/15 select-none">{i + 1}</span>
          {highlight(line)}
        </span>
      ))}
    </pre>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Evolutionary Genetic Walker  (canvas, runs only while visible)
// ─────────────────────────────────────────────────────────────────────────────

function EvoWalkerCard() {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const animRef      = useRef<number>(0);
  const stateRef     = useRef({
    generation:   1,
    mutationRate: 8,
    fitness:      0,
    // Walker genome: 4 legs × 2 joints (hip angle, knee angle), amplitude, speed
    genome: [0.4, 0.6, 0.35, 0.55, 0.42, 0.62, 0.38, 0.58],
    bodyX:  30,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx    = canvas.getContext("2d");
    if (!ctx) return;

    // ── Helpers ───────────────────────────────────────────────────────────
    const clamp = (v: number, lo: number, hi: number) =>
      Math.max(lo, Math.min(hi, v));

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const mutate = (genome: number[], rate: number): number[] =>
      genome.map(g => clamp(g + (Math.random() - 0.5) * rate * 0.04, 0.1, 0.9));

    // ── Keep canvas pixel-crisp; drawing happens in CSS pixels ────────────
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width  = Math.round(rect.width  * devicePixelRatio);
      canvas.height = Math.round(rect.height * devicePixelRatio);
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // ── Draw one frame ────────────────────────────────────────────────────
    const draw = (ts: number) => {
      const s       = stateRef.current;
      const W       = canvas.width  / devicePixelRatio;
      const H       = canvas.height / devicePixelRatio;
      const g       = s.genome;
      const t       = ts * 0.001; // seconds

      ctx.clearRect(0, 0, W, H);

      // ── Ground line ──────────────────────────────────────────────────────
      const groundY = H * 0.72;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(W, groundY);
      ctx.strokeStyle = "rgba(124,58,237,0.25)";
      ctx.lineWidth   = 1;
      ctx.stroke();

      // Subtle ground gradient
      const grad = ctx.createLinearGradient(0, groundY, 0, H);
      grad.addColorStop(0, "rgba(124,58,237,0.06)");
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(0, groundY, W, H - groundY);

      // ── Walker body position ─────────────────────────────────────────────
      const speed    = lerp(0.8, 2.2, g[6] ?? 0.5);
      s.bodyX        = s.bodyX + speed * 0.4;
      const bodyX    = s.bodyX;
      const bodyY    = groundY - 28 + Math.sin(t * 4) * 2.5;
      const bodyW    = 32;
      const bodyH    = 10;

      // Fitness grows with distance travelled
      s.fitness      = Math.max(0, Math.round((s.bodyX / W) * 24 * 10) / 10);

      // ── Legs: hip → knee → foot ──────────────────────────────────────────
      const legDefs = [
        { xOff: -bodyW * 0.4, phase: 0.0,             gIdx: 0 },
        { xOff:  bodyW * 0.4, phase: Math.PI,         gIdx: 2 },
        { xOff: -bodyW * 0.2, phase: Math.PI * 0.5,   gIdx: 4 },
        { xOff:  bodyW * 0.2, phase: Math.PI * 1.5,   gIdx: 6 },
      ];

      for (const leg of legDefs) {
        const hipX  = bodyX + leg.xOff;
        const hipY  = bodyY + bodyH * 0.5;
        const ha    = (g[leg.gIdx] ?? 0.5);      // hip amplitude
        const ka    = (g[leg.gIdx + 1] ?? 0.5);  // knee amplitude
        const spd   = lerp(2.5, 5.5, g[7] ?? 0.5);

        const hipAngle  = Math.sin(t * spd + leg.phase) * ha;
        const kneeAngle = 0.6 + Math.abs(Math.sin(t * spd + leg.phase + 0.8)) * ka * 0.9;

        const kneeX = hipX  + Math.sin(hipAngle)  * 16;
        const kneeY = hipY  + Math.cos(hipAngle)  * 16;
        const footX = kneeX + Math.sin(hipAngle + kneeAngle) * 15;
        const footY = Math.min(kneeY + Math.cos(hipAngle + kneeAngle) * 15, groundY);

        ctx.beginPath();
        ctx.moveTo(hipX, hipY);
        ctx.lineTo(kneeX, kneeY);
        ctx.lineTo(footX, footY);
        ctx.strokeStyle = "rgba(139,92,246,0.75)";
        ctx.lineWidth   = 2;
        ctx.lineCap     = "round";
        ctx.lineJoin    = "round";
        ctx.stroke();

        for (const [jx, jy] of [[hipX, hipY], [kneeX, kneeY], [footX, footY]] as [number, number][]) {
          ctx.beginPath();
          ctx.arc(jx, jy, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(196,181,253,0.9)";
          ctx.fill();
        }
      }

      // ── Body capsule + head ──────────────────────────────────────────────
      ctx.beginPath();
      ctx.roundRect(bodyX - bodyW * 0.5, bodyY, bodyW, bodyH, bodyH * 0.5);
      ctx.fillStyle = "rgba(124,58,237,0.55)";
      ctx.fill();
      ctx.strokeStyle = "rgba(196,181,253,0.7)";
      ctx.lineWidth   = 1.2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(bodyX + bodyW * 0.45, bodyY + bodyH * 0.3, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(196,181,253,0.85)";
      ctx.fill();

      // ── HUD — top-left stats ─────────────────────────────────────────────
      ctx.font      = "bold 9px ui-monospace, 'Courier New', monospace";
      ctx.textAlign = "left";
      [
        `GENERATION:    ${String(s.generation).padStart(3, "0")}`,
        `MUTATION RATE: ${s.mutationRate}%`,
        `FITNESS SCORE: +${s.fitness.toFixed(1)}`,
      ].forEach((line, i) => {
        ctx.fillStyle = i === 2 ? "rgba(52,211,153,0.8)" : "rgba(196,181,253,0.55)";
        ctx.fillText(line, 10, 16 + i * 13);
      });

      // ── New generation when the walker leaves the right edge ─────────────
      if (s.bodyX >= W + 20) {
        s.generation   += 1;
        s.mutationRate  = clamp(Math.round(5 + Math.random() * 12), 3, 18);
        s.genome        = mutate(s.genome, s.mutationRate);
        s.bodyX         = -20;
        s.fitness       = 0;
      }

      animRef.current = requestAnimationFrame(draw);
    };

    // ── Run only while visible — saves battery on phones ──────────────────
    const start = () => {
      cancelAnimationFrame(animRef.current);
      animRef.current = requestAnimationFrame(draw);
    };
    const stop  = () => cancelAnimationFrame(animRef.current);

    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) start();
      else stop();
    });
    io.observe(canvas);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  return (
    <BentoCard accent="#a78bfa" className="md:col-span-2 p-6 flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse motion-reduce:animate-none" aria-hidden="true" />
            <span className="font-mono text-[10px] tracking-[0.22em] text-white/35 uppercase">
              Genetic Algorithms
            </span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">Evolutionary Walker</h3>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-violet-500/20 bg-violet-500/10" aria-label="Live simulation">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping motion-reduce:animate-none" aria-hidden="true" />
          <span className="text-[10px] font-mono text-violet-300/80 tracking-wider">LIVE</span>
        </div>
      </div>

      <p className="text-white/40 text-xs leading-relaxed mb-4">
        A skeletal robot that learns to walk — each generation mutates its gait genome and keeps what travels furthest.
      </p>

      <div className="flex-1 relative rounded-xl overflow-hidden bg-[#060610] border border-white/[0.05]" style={{ minHeight: 120 }}>
        <canvas
          ref={canvasRef}
          aria-label="Live evolutionary genetic walker simulation"
          style={{ width: "100%", height: "100%", display: "block", position: "absolute", inset: 0 }}
        />
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {["Genetic Programming", "Optimisation", "Simulation", "Canvas API"].map((tag) => (
          <span key={tag} data-pill className="px-2 py-0.5 text-[10px] font-mono rounded-md border border-violet-500/20 text-violet-300/70 bg-violet-500/10">
            {tag}
          </span>
        ))}
      </div>
    </BentoCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Security & QA — terminal that plays while visible, then loops
// ─────────────────────────────────────────────────────────────────────────────

function SecurityCard() {
  const group = SKILL_GROUPS.security;
  const [lines, setLines]   = useState<TermLine[]>([]);
  const terminalRef         = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = terminalRef.current;
    if (!el) return;

    // Reduced motion: show the full log statically
    if (prefersReducedMotion()) {
      const id = setTimeout(() => setLines(TERMINAL_LINES), 0);
      return () => clearTimeout(id);
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    let idx = 0;

    const step = () => {
      if (idx < TERMINAL_LINES.length) {
        const line = TERMINAL_LINES[idx]!;
        idx++;
        setLines((prev) => [...prev, line]);
        timer = setTimeout(step, line.type === "cmd" ? 650 : 280);
      } else {
        // Hold the finished log, then replay
        timer = setTimeout(() => { idx = 0; setLines([]); timer = setTimeout(step, 500); }, 4500);
      }
    };

    const io = new IntersectionObserver(([entry]) => {
      clearTimeout(timer);
      if (entry?.isIntersecting) timer = setTimeout(step, 400);
    }, { threshold: 0.4 });
    io.observe(el);

    return () => { clearTimeout(timer); io.disconnect(); };
  }, []);

  // Keep the newest line in view
  useEffect(() => {
    const el = terminalRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  return (
    <BentoCard accent={group.accent} className="md:col-span-2 p-6 flex flex-col">
      <CardHeader
        group={group}
        badge={
          <div className="flex items-center gap-1.5 mt-1" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/55" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/55" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-400/55" />
          </div>
        }
      />
      <p className="text-white/40 text-xs leading-relaxed mb-4">{group.blurb}</p>

      <div
        ref={terminalRef}
        className="flex-1 rounded-xl bg-[#060610] border border-white/[0.05] p-4 font-mono text-[11px] leading-relaxed overflow-y-auto"
        style={{ minHeight: 170, maxHeight: 190, scrollbarWidth: "none" }}
        role="log"
        aria-label="Security testing session"
      >
        {lines.map((line, i) => (
          <div key={i} className="flex items-start gap-1.5 whitespace-pre-wrap" style={{ color: TERM_COLOR[line.type] }}>
            <span className="opacity-30 select-none flex-shrink-0 text-[9px] mt-px">
              {i === lines.length - 1 ? "▶" : " "}
            </span>
            <span>{line.text}</span>
          </div>
        ))}
        <span className="inline-block w-[5px] h-[0.95em] bg-emerald-400 animate-pulse motion-reduce:animate-none ml-1 align-middle" aria-hidden="true" />
      </div>

      <div className="mt-4">
        <SkillPills group={group} />
      </div>
    </BentoCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Spoken languages — bars fill on enter
// ─────────────────────────────────────────────────────────────────────────────

function SpokenLanguagesCard() {
  return (
    <BentoCard accent="#fbbf24" className="p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse motion-reduce:animate-none" aria-hidden="true" />
        <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/35">Languages</span>
      </div>
      <h3 className="text-lg font-bold text-white tracking-tight mb-5">I Speak</h3>

      <ul className="flex flex-col gap-4">
        {SPOKEN_LANGUAGES.map((lang) => (
          <li key={lang.name}>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-sm text-white/80">{lang.name}</span>
              <span className="font-mono text-[10px] text-amber-300/80">{lang.level}</span>
            </div>
            <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                data-lang-bar
                className="h-full rounded-full origin-left"
                style={{
                  transform: `scaleX(${lang.value})`,
                  background: "linear-gradient(90deg, #f59e0b, #f472b6)",
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </BentoCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Status & Availability — current role + live Amman clock
// ─────────────────────────────────────────────────────────────────────────────

function StatusWidget() {
  // null until mounted — avoids an SSR/hydration time mismatch
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const clockStr = now
    ? new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Amman",
        hour:     "2-digit",
        minute:   "2-digit",
        second:   "2-digit",
        hour12:   false,
      }).format(now)
    : "--:--:--";

  const dateStr = now
    ? new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Amman",
        weekday:  "long",
        month:    "short",
        day:      "numeric",
        year:     "numeric",
      }).format(now)
    : "Loading…";

  return (
    <BentoCard accent="#22d3ee" className="md:col-span-2 lg:col-span-4 p-6 md:p-7">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {/* Triple-ring pulsing beacon */}
          <div className="relative flex-shrink-0 w-4 h-4" aria-hidden="true">
            <span className="absolute inset-0 rounded-full bg-cyan-400 opacity-20 animate-ping motion-reduce:animate-none" />
            <span className="absolute inset-[3px] rounded-full bg-cyan-400 opacity-50 animate-pulse motion-reduce:animate-none" />
            <span className="absolute inset-[5px] rounded-full bg-cyan-400" />
          </div>
          <div>
            <p className="text-cyan-300 font-semibold text-sm md:text-base tracking-tight leading-tight">
              {CURRENT_ROLE.title} · {CURRENT_ROLE.company}
            </p>
            <p className="text-white/35 text-xs font-mono mt-0.5">
              {CURRENT_ROLE.schedule} &nbsp;·&nbsp; {CURRENT_ROLE.location}
            </p>
          </div>
        </div>

        <div className="flex-shrink-0 sm:text-right">
          <div
            className="font-mono font-bold tabular-nums text-white/90 tracking-tighter leading-none"
            style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)" }}
            aria-label={`Current time in Jordan: ${clockStr}`}
          >
            {clockStr}
          </div>
          <div className="font-mono text-[10px] text-white/30 mt-1.5 tracking-wide">{dateStr}</div>
          <div className="font-mono text-[10px] text-white/20 mt-0.5">Asia/Amman — UTC+3</div>
        </div>
      </div>
    </BentoCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Programming-language ticker
// ─────────────────────────────────────────────────────────────────────────────

function LanguageTicker() {
  return (
    <div
      className="group/ticker relative overflow-hidden mb-5 md:mb-6 py-1"
      style={{
        maskImage:       "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)",
        WebkitMaskImage: "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)",
      }}
    >
      <p className="sr-only">Programming languages: {PROGRAMMING_LANGUAGES.join(", ")}</p>
      {/* Rendered twice so translateX(-50%) lands on an identical frame */}
      <div
        aria-hidden="true"
        className="flex w-max animate-marquee motion-reduce:animate-none group-hover/ticker:[animation-play-state:paused]"
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {PROGRAMMING_LANGUAGES.map((lang) => (
              <span key={lang} className="flex items-center">
                <span className="px-5 text-2xl md:text-3xl font-bold tracking-tight text-white/[0.14] hover:text-white/80 transition-colors duration-300 select-none">
                  {lang}
                </span>
                <span className="text-violet-400/40 text-xs">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

export default function SkillsBento() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const cards = Array.from(section.querySelectorAll<HTMLElement>("[data-skill-card]"));

        // Hide cards + pills up front, then reveal per batch / per card
        gsap.set(cards, { y: 44, opacity: 0 });
        cards.forEach((card) => {
          gsap.set(card.querySelectorAll("[data-pill]"), { y: 10, opacity: 0, scale: 0.9 });
        });

        ScrollTrigger.batch(cards, {
          start: "top 90%",
          once:  true,
          onEnter: (batch) => {
            gsap.to(batch, { y: 0, opacity: 1, duration: 0.85, stagger: 0.1, ease: "power3.out", overwrite: true });
            batch.forEach((card, i) => {
              gsap.to(card.querySelectorAll("[data-pill]"), {
                y: 0, opacity: 1, scale: 1,
                duration: 0.4, stagger: 0.035, ease: "back.out(2)",
                delay: 0.35 + i * 0.1,
              });
            });
          },
        });

        // Spoken-language bars fill from 0 to their level
        gsap.from(section.querySelectorAll("[data-lang-bar]"), {
          scaleX: 0,
          duration: 1.2,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: { trigger: section.querySelector("[data-lang-bar]"), start: "top 90%", once: true },
        });
      });
    }, section);

    return () => ctx.revert();
  }, []);

  const G = SKILL_GROUPS;

  return (
    <section
      ref={sectionRef}
      id="skills"
      aria-label="Technical skills"
      className="relative py-20 md:py-32 bg-[#07070d] overflow-hidden"
    >
      {/* Ambient section glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 60% 40% at 25% 30%, rgba(124,58,237,0.07) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 80% 70%, rgba(244,63,94,0.05) 0%, transparent 70%)
          `,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section header ─────────────────────────────────────────────── */}
        <div className="mb-10 md:mb-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 mb-5 text-[11px] font-mono tracking-[0.2em] text-white/40 uppercase">
              Technical Skills
            </div>

            <h2
              className="font-bold tracking-tight text-white leading-tight mb-3"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)" }}
            >
              <TextReveal as="span" splitBy="words" triggerOnScroll stagger={0.08}>
                Built to Engineer,
              </TextReveal>
              {" "}
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(135deg, #7c3aed 0%, #0891b2 100%)" }}
              >
                <TextReveal as="span" splitBy="words" triggerOnScroll stagger={0.08} delay={0.12}>
                  Designed to Ship.
                </TextReveal>
              </span>
            </h2>

            <p className="text-white/40 text-sm md:text-base max-w-xl leading-relaxed">
              Software and AI engineering across the stack — from LLM agents and ML models
              to Oracle databases, backend services and pixel-perfect interfaces.
            </p>
          </div>

          {/* Stats */}
          <dl className="flex gap-8 lg:gap-10 font-mono">
            {[
              [`${TECH_COUNT}+`, "Technologies"],
              [String(PROGRAMMING_LANGUAGES.length), "Prog. languages"],
              [String(SPOKEN_LANGUAGES.length), "Spoken languages"],
            ].map(([value, label]) => (
              // dt must precede dd — flex-col-reverse puts the number on top visually
              <div key={label} className="flex flex-col-reverse">
                <dt className="text-[10px] tracking-[0.18em] uppercase text-white/30 mt-1">{label}</dt>
                <dd className="text-2xl md:text-3xl font-bold text-white tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <LanguageTicker />

        {/* ── Bento grid ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          <SkillCard group={G.ai} className="md:col-span-2 lg:row-span-2">
            <AgentGraph />
            {/* Facts from the evaluation pipeline the graph depicts */}
            <dl className="mt-4 grid grid-cols-3 gap-3">
              {[
                ["50+", "test scenarios"],
                ["Multi-turn", "agentic evals"],
                ["Celery · Redis", "async workers"],
              ].map(([value, label]) => (
                <div key={label} className="flex flex-col-reverse rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5">
                  <dt className="font-mono text-[9px] tracking-[0.15em] uppercase text-white/30 mt-0.5">{label}</dt>
                  <dd className="text-sm font-semibold text-violet-200">{value}</dd>
                </div>
              ))}
            </dl>
          </SkillCard>

          <SkillCard
            group={G.data}
            className="md:col-span-2"
            badge={
              <span className="flex-shrink-0 mt-1 px-2 py-0.5 rounded-full text-[9px] font-mono tracking-[0.15em] uppercase border border-rose-400/25 bg-rose-400/10 text-rose-300">
                Daily @ ICSFS
              </span>
            }
          >
            <PlsqlTyper />
          </SkillCard>

          <SkillCard group={G.backend} />
          <SkillCard group={G.ml} />
          <SkillCard group={G.frontend} />
          <SkillCard group={G.devops} />
          <SecurityCard />
          <EvoWalkerCard />
          <SkillCard group={G.design} />
          <SpokenLanguagesCard />
          <StatusWidget />
        </div>
      </div>
    </section>
  );
}
