"use client";

/**
 * @file src/components/SkillsBento.tsx
 *
 * Technical Skills Bento Grid
 * ─────────────────────────────────────────────────────────────────────────────
 * Desktop layout (md: 4-column grid):
 *
 *   ┌───────────────────────┬───────────────────────┐
 *   │                       │  Intelligent Systems  │
 *   │  Full-Stack Canvas    │       (col-span-2)    │
 *   │  (col-span-2 × 2)     ├───────────────────────┤
 *   │                       │  Security & DevOps    │
 *   ├───────────────────────┴───────────────────────┤
 *   │         Status & Availability  (col-span-4)   │
 *   └───────────────────────────────────────────────┘
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * ## Mouse Glow (spotlight effect)
 *   Each `BentoCard` registers a `mousemove` listener that writes
 *   `--mouse-x` / `--mouse-y` CSS custom properties directly to the card
 *   DOM node via `style.setProperty` — NO React state updates, zero
 *   re-renders. Updates are throttled to one per rAF frame.
 *
 *   An absolutely-positioned overlay div inside each card references these
 *   via `var(--mouse-x)` in a `radial-gradient` background style. The
 *   browser resolves the `var()` at paint time on every frame automatically.
 *
 * ## Terminal animation (Block 3)
 *   State-based typewriter: lines are appended with `setTimeout` on
 *   `mouseenter` and wiped on `mouseleave`. Only the SecurityCard
 *   component owns this state — nothing else re-renders.
 *
 * ## Live Clock (Block 4)
 *   `setInterval` + `useState(new Date())`. A `hasMounted` guard prevents
 *   SSR/hydration mismatches. Formatted for Asia/Amman (UTC+3).
 */

import { useState, useEffect, useRef, type ReactNode } from "react";
import TextReveal from "@/components/TextReveal";
import {
  TECH_CATEGORIES,
  TERMINAL_LINES,
  TERM_COLOR,
  type TermType,
  type TermLine,
} from "@/data/portfolio";



// ─────────────────────────────────────────────────────────────────────────────
// BentoCard — shared wrapper with mouse-tracking spotlight glow
// ─────────────────────────────────────────────────────────────────────────────

interface BentoCardProps {
  children:   ReactNode;
  className?: string;
  /** `rgba(...)` colour for the spotlight gradient. Defaults to white. */
  glowColor?: string;
}

function BentoCard({ children, className = "", glowColor }: BentoCardProps) {
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
  const gradient = `radial-gradient(circle at var(--mouse-x) var(--mouse-y), ${
    glowColor ?? "rgba(255,255,255,0.09)"
  } 0%, transparent 65%)`;

  return (
    <div
      ref={cardRef}
      className={`group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0c0c1a] ${className}`}
    >
      {/* Spotlight overlay — pointer-events:none so it never blocks clicks */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: gradient }}
      />
      {/* Subtle top-edge shimmer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.11) 50%, transparent 100%)",
        }}
      />
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Block 1 — Full-Stack Canvas  (col-span-2 × row-span-2)
// ─────────────────────────────────────────────────────────────────────────────

function FullStackCanvas() {
  return (
    <BentoCard
      className="md:col-span-2 md:row-span-2 p-7 md:p-8 flex flex-col"
      glowColor="rgba(124,58,237,0.16)"
    >
      {/* Header */}
      <div className="mb-7">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"
            aria-hidden="true"
          />
          <span className="font-mono text-[10px] tracking-[0.22em] text-white/30 uppercase">
            Full-Stack Arsenal
          </span>
        </div>
        <h3 className="text-xl font-bold text-white tracking-tight leading-snug mb-1.5">
          Core Engineering Stack
        </h3>
        <p className="text-white/40 text-xs leading-relaxed">
          Tools chosen for production resilience and developer velocity.
        </p>
      </div>

      {/* Tech category rows */}
      <div className="flex flex-col gap-6 flex-1">
        {TECH_CATEGORIES.map((cat) => (
          <div key={cat.label}>
            {/* Category label */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className="block w-4 h-px flex-shrink-0"
                style={{ backgroundColor: cat.accent }}
                aria-hidden="true"
              />
              <span
                className="text-[10px] font-mono tracking-[0.22em] uppercase"
                style={{ color: `${cat.accent}99` }}
              >
                {cat.label}
              </span>
            </div>

            {/* Tech pills */}
            <div className="flex flex-wrap gap-2">
              {cat.items.map((item) => (
                <span
                  key={item}
                  className="
                    px-2.5 py-1 rounded-lg text-xs font-mono border
                    transition-transform duration-150 hover:scale-[1.07]
                    cursor-default select-none
                  "
                  style={{
                    borderColor:     cat.border,
                    color:           cat.accent,
                    backgroundColor: cat.dim,
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer stats */}
      <div className="mt-7 pt-5 border-t border-white/[0.05] flex items-center justify-between">
        <span className="text-white/25 text-[10px] font-mono">2+ yrs active development</span>
        <span className="text-white/25 text-[10px] font-mono">17 technologies</span>
      </div>
    </BentoCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Block 2 — Evolutionary Genetic Walker  (col-span-2)
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
    t:      0,
    bodyX:  30,
    phase:  0,
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

    // ── Draw one frame ────────────────────────────────────────────────────
    const draw = (ts: number) => {
      const s       = stateRef.current;
      const W       = canvas.width;
      const H       = canvas.height;
      const g       = s.genome;
      const t       = ts * 0.001; // seconds
      s.t           = t;

      // Clear
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
      // Body oscillates slightly and moves forward
      const speed    = lerp(0.8, 2.2, g[6] ?? 0.5);
      s.bodyX        = ((s.bodyX + speed * 0.4) % (W + 40));
      const bodyX    = s.bodyX;
      const bodyY    = groundY - 28 + Math.sin(t * 4) * 2.5;
      const bodyW    = 32;
      const bodyH    = 10;

      // Update fitness based on distance
      s.fitness      = Math.round((s.bodyX / W) * 24 * 10) / 10;

      // ── Draw legs (4 legs) ────────────────────────────────────────────────
      // Each leg: hip anchor on body, then hip→knee→foot
      const legDefs = [
        { xOff: -bodyW * 0.4, phase: 0.0,  gIdx: 0 },
        { xOff:  bodyW * 0.4, phase: Math.PI, gIdx: 2 },
        { xOff: -bodyW * 0.2, phase: Math.PI * 0.5, gIdx: 4 },
        { xOff:  bodyW * 0.2, phase: Math.PI * 1.5, gIdx: 6 },
      ];

      for (const leg of legDefs) {
        const hipX  = bodyX + leg.xOff;
        const hipY  = bodyY + bodyH * 0.5;
        const ha    = (g[leg.gIdx] ?? 0.5);      // hip amplitude
        const ka    = (g[leg.gIdx + 1] ?? 0.5);  // knee amplitude
        const spd   = lerp(2.5, 5.5, g[7] ?? 0.5);

        const hipAngle  = Math.sin(t * spd + leg.phase) * ha * 1.0;
        const kneeAngle = 0.6 + Math.abs(Math.sin(t * spd + leg.phase + 0.8)) * ka * 0.9;

        const upperLen = 16;
        const lowerLen = 15;

        const kneeX = hipX  + Math.sin(hipAngle)  * upperLen;
        const kneeY = hipY  + Math.cos(hipAngle)  * upperLen;
        const footX = kneeX + Math.sin(hipAngle + kneeAngle) * lowerLen;
        const footY = kneeY + Math.cos(hipAngle + kneeAngle) * lowerLen;

        // Clamp foot to ground
        const clampedFootY = Math.min(footY, groundY);

        ctx.beginPath();
        ctx.moveTo(hipX, hipY);
        ctx.lineTo(kneeX, kneeY);
        ctx.lineTo(footX, clampedFootY);
        ctx.strokeStyle = "rgba(139,92,246,0.75)";
        ctx.lineWidth   = 2;
        ctx.lineCap     = "round";
        ctx.lineJoin    = "round";
        ctx.stroke();

        // Joint dots
        for (const [jx, jy] of [[hipX, hipY], [kneeX, kneeY], [footX, clampedFootY]] as [number,number][]) {
          ctx.beginPath();
          ctx.arc(jx, jy, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(196,181,253,0.9)";
          ctx.fill();
        }
      }

      // ── Draw body capsule ─────────────────────────────────────────────────
      const r = bodyH * 0.5;
      ctx.beginPath();
      ctx.roundRect(bodyX - bodyW * 0.5, bodyY, bodyW, bodyH, r);
      ctx.fillStyle = "rgba(124,58,237,0.55)";
      ctx.fill();
      ctx.strokeStyle = "rgba(196,181,253,0.7)";
      ctx.lineWidth   = 1.2;
      ctx.stroke();

      // Head
      ctx.beginPath();
      ctx.arc(bodyX + bodyW * 0.45, bodyY + bodyH * 0.3, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(196,181,253,0.85)";
      ctx.fill();

      // ── HUD — top-left stats ──────────────────────────────────────────────
      ctx.font      = "bold 9px 'Courier New', monospace";
      ctx.textAlign = "left";
      const hudLines = [
        `GENERATION:    ${String(s.generation).padStart(3, "0")}`,
        `MUTATION RATE: ${s.mutationRate}%`,
        `FITNESS SCORE: +${s.fitness.toFixed(1)}`,
      ];
      hudLines.forEach((line, i) => {
        ctx.fillStyle = i === 2 ? "rgba(52,211,153,0.8)" : "rgba(196,181,253,0.55)";
        ctx.fillText(line, 10, 16 + i * 13);
      });

      // ── Reset: new generation when walker reaches right edge ─────────────
      if (s.bodyX >= W + 20) {
        s.generation   += 1;
        s.mutationRate  = clamp(Math.round(5 + Math.random() * 12), 3, 18);
        s.genome        = mutate(s.genome, s.mutationRate);
        s.bodyX         = -20;
        s.fitness       = 0;
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  // Keep canvas pixel-crisp on resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect  = canvas.getBoundingClientRect();
      canvas.width  = Math.round(rect.width  * devicePixelRatio);
      canvas.height = Math.round(rect.height * devicePixelRatio);
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(devicePixelRatio, devicePixelRatio);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  return (
    <BentoCard
      className="md:col-span-2 p-6 flex flex-col"
      glowColor="rgba(124,58,237,0.18)"
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"
              aria-hidden="true"
            />
            <span className="font-mono text-[10px] tracking-[0.22em] text-white/30 uppercase">
              Genetic Algorithm
            </span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Evolutionary Walker
          </h3>
        </div>

        {/* LIVE badge */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-violet-500/20 bg-violet-500/10"
          aria-label="Live simulation"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping" aria-hidden="true" />
          <span className="text-[10px] font-mono text-violet-300/80 tracking-wider">LIVE</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative rounded-xl overflow-hidden bg-[#060610] border border-white/[0.05]" style={{ minHeight: 110 }}>
        <canvas
          ref={canvasRef}
          aria-label="Live evolutionary genetic walker simulation"
          style={{ width: "100%", height: "100%", display: "block" }}
        />
      </div>

      {/* Capability tags */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {["Evolutionary Algorithms", "Canvas API", "LangChain", "AI Agents"].map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 text-[10px] font-mono rounded-md border border-violet-500/20 text-violet-300/65 bg-violet-500/10"
          >
            {tag}
          </span>
        ))}
      </div>
    </BentoCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Block 3 — Security & Infrastructure  (col-span-2)
// ─────────────────────────────────────────────────────────────────────────────

function SecurityCard() {
  const [lines, setLines]         = useState<TermLine[]>([]);
  const [running, setRunning]     = useState(false);
  const timerRef                  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const terminalRef               = useRef<HTMLDivElement>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const start = () => {
    if (running || lines.length > 0) return;
    setRunning(true);
    let idx = 0;
    const step = () => {
      // ── Guard: stop before we can ever read past the array end ──────────
      // Clear the ref first so any racing reset() call wins cleanly.
      timerRef.current = null;
      if (idx >= TERMINAL_LINES.length) {
        setRunning(false);
        return;
      }
      // Safe: bounds-checked above, non-null assertion is sound here
      setLines((prev) => [...prev, TERMINAL_LINES[idx]!]);
      idx++;
      // Only schedule the next tick if there are more lines to show
      if (idx < TERMINAL_LINES.length) {
        timerRef.current = setTimeout(step, 265);
      } else {
        setRunning(false);
      }
    };
    step();
  };

  const reset = () => {
    clearTimer();
    setLines([]);
    setRunning(false);
  };

  // Auto-scroll to keep latest line visible
  useEffect(() => {
    const el = terminalRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  // Cleanup on unmount
  useEffect(() => clearTimer, []);

  return (
    <BentoCard
      className="md:col-span-2 p-6 flex flex-col"
      glowColor="rgba(16,185,129,0.13)"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"
              aria-hidden="true"
            />
            <span className="font-mono text-[10px] tracking-[0.22em] text-white/30 uppercase">
              Infrastructure
            </span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Security &amp; DevOps
          </h3>
        </div>

        {/* macOS-style traffic lights */}
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400/55"   />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/55" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400/55" />
        </div>
      </div>

      {/* Terminal window */}
      <div
        ref={terminalRef}
        className="
          flex-1 rounded-xl
          bg-[#060610] border border-white/[0.05]
          p-4 font-mono text-[11px] leading-relaxed
          overflow-y-auto
        "
        style={{ minHeight: 120, maxHeight: 165, scrollbarWidth: "none" }}
        onMouseEnter={start}
        onMouseLeave={reset}
        aria-label="Security terminal output — hover to start"
        role="log"
        aria-live="polite"
      >
        {lines.length === 0 && !running && (
          <span className="text-white/20 italic text-[10px]">
            // hover to run security audit…
          </span>
        )}

        {lines.map((line, i) => {
          // Defensive guard: skip any undefined entries that may have
          // slipped in from a stale timeout firing after a reset.
          if (!line) return null;
          return (
            <div
              key={i}
              className="flex items-start gap-1.5 whitespace-pre-wrap"
              style={{ color: TERM_COLOR[line.type] }}
            >
              <span className="opacity-30 select-none flex-shrink-0 text-[9px] mt-px">
                {i === lines.length - 1 ? "▶" : " "}
              </span>
              <span>{line.text}</span>
            </div>
          );
        })}

        {/* Blinking cursor while typing */}
        {running && (
          <span
            className="inline-block w-[5px] h-[0.95em] bg-emerald-400 animate-pulse ml-1 align-middle"
            aria-hidden="true"
          />
        )}
      </div>
    </BentoCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Block 4 — Status & Availability  (col-span-4)
// ─────────────────────────────────────────────────────────────────────────────

function StatusWidget() {
  const [hasMounted, setHasMounted] = useState(false);
  const [now, setNow]               = useState(new Date());

  useEffect(() => {
    setHasMounted(true);
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const clockStr = hasMounted
    ? new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Amman",
        hour:     "2-digit",
        minute:   "2-digit",
        second:   "2-digit",
        hour12:   false,
      }).format(now)
    : "--:--:--";

  const dateStr = hasMounted
    ? new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Amman",
        weekday:  "long",
        month:    "short",
        day:      "numeric",
        year:     "numeric",
      }).format(now)
    : "Loading…";

  return (
    <BentoCard
      className="md:col-span-4 p-6 md:p-7"
      glowColor="rgba(8,145,178,0.10)"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">

        {/* Availability section */}
        <div className="flex items-center gap-4">
          {/* Triple-ring pulsing beacon */}
          <div className="relative flex-shrink-0 w-4 h-4" aria-hidden="true">
            <span className="absolute inset-0 rounded-full bg-cyan-400 opacity-20 animate-ping" />
            <span className="absolute inset-[3px] rounded-full bg-cyan-400 opacity-50 animate-pulse" />
            <span className="absolute inset-[5px] rounded-full bg-cyan-400" />
          </div>
          <div>
            <p className="text-cyan-300 font-semibold text-sm md:text-base tracking-tight leading-tight">
              Developer · ICS Financial Systems
            </p>
            <p className="text-white/35 text-xs font-mono mt-0.5">
              Sun – Thu &nbsp;·&nbsp; 08:00 – 16:30 &nbsp;·&nbsp; Jeddah, Saudi Arabia
            </p>
          </div>
        </div>

        {/* Live clock — Jordan time */}
        <div className="flex-shrink-0 sm:text-right">
          <div
            className="font-mono font-bold tabular-nums text-white/90 tracking-tighter leading-none"
            style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)" }}
            aria-live="polite"
            aria-label={`Current time in Jordan: ${clockStr}`}
          >
            {clockStr}
          </div>
          <div className="font-mono text-[10px] text-white/30 mt-1.5 tracking-wide">
            {dateStr}
          </div>
          <div className="font-mono text-[10px] text-white/20 mt-0.5">
            Asia/Amman — UTC+3
          </div>
        </div>
      </div>
    </BentoCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

export default function SkillsBento() {
  return (
    <section
      id="skills"
      aria-label="Technical skills"
      className="relative py-20 md:py-32 bg-[#07070d] overflow-hidden"
    >
      {/* Ambient section glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(124,58,237,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section header ─────────────────────────────────────────────── */}
        <div className="mb-10 md:mb-14">
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
              style={{
                backgroundImage: "linear-gradient(135deg, #7c3aed 0%, #0891b2 100%)",
              }}
            >
              <TextReveal as="span" splitBy="words" triggerOnScroll stagger={0.08} delay={0.12}>
                Designed to Ship.
              </TextReveal>
            </span>
          </h2>

          <p className="text-white/35 text-sm md:text-base max-w-md leading-relaxed">
            A polyglot developer comfortable across the full stack — from pixel-perfect
            interfaces to distributed backend systems.
          </p>
        </div>

        {/* ── Bento Grid ─────────────────────────────────────────────────── */}
        {/*
         * Grid placement (md:grid-cols-4):
         *   Block 1 (row 1–2, cols 1–2) → col-span-2  row-span-2
         *   Block 2 (row 1,   cols 3–4) → col-span-2
         *   Block 3 (row 2,   cols 3–4) → col-span-2  (auto-placed after Block 2)
         *   Block 4 (row 3,   cols 1–4) → col-span-4
         */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5">
          <FullStackCanvas />
          <EvoWalkerCard   />
          <SecurityCard   />
          <StatusWidget   />
        </div>

      </div>
    </section>
  );
}
