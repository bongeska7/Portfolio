"use client";

/**
 * @file src/components/ExperienceSection.tsx
 *
 * Current Role — Featured Experience Card
 * ─────────────────────────────────────────────────────────────────────────────
 * Sits directly under the hero so the current job is the first thing a
 * visitor reads after the name.
 *
 * Layout:
 *   ┌──────────────────────────────────┬──────────────────────┐
 *   │  Role, company, about, focus     │  Ledger feed visual  │
 *   │  (lg: 7 cols)                    │  Workday meter       │
 *   └──────────────────────────────────┴──────────────────────┘
 *   Side-business teaser row → #teacherhelper
 *
 * On mobile both columns stack.
 *
 * ## Animation
 *   • The card opens with a clip-path "iris" (inset → 0) + rise when its top
 *     reaches 85% of the viewport, then every `[data-reveal]` child staggers in.
 *   • The ledger feed loops with a pure-CSS `animate-ledger` keyframe (the row
 *     list is rendered twice so translateY(-50%) is seamless).
 *   • The workday meter fills to the current Amman-time progress after mount.
 *   • All GSAP work is wrapped in `prefers-reduced-motion: no-preference`.
 */

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import TextReveal from "@/components/TextReveal";
import { CURRENT_ROLE } from "@/data/portfolio";

// ─────────────────────────────────────────────────────────────────────────────
// Workday helpers — Sun–Thu, 08:00–16:30, Asia/Amman (matches StatusWidget)
// ─────────────────────────────────────────────────────────────────────────────

const WORK_DAYS   = ["Sun", "Mon", "Tue", "Wed", "Thu"];
const DAY_START   = 8 * 60;       // 08:00 in minutes
const DAY_END     = 16 * 60 + 30; // 16:30 in minutes

/** Returns 0…1 through the workday, or null when off the clock. */
function workdayProgress(now: Date): number | null {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Amman",
    weekday:  "short",
    hour:     "2-digit",
    minute:   "2-digit",
    hour12:   false,
  }).formatToParts(now);

  const get  = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  // Some engines format midnight as "24" with hour12:false
  const mins = (Number(get("hour")) % 24) * 60 + Number(get("minute"));

  if (!WORK_DAYS.includes(get("weekday"))) return null;
  if (mins < DAY_START || mins >= DAY_END) return null;
  return (mins - DAY_START) / (DAY_END - DAY_START);
}

// ─────────────────────────────────────────────────────────────────────────────
// Decorative ledger rows — illustrative only, not real data
// ─────────────────────────────────────────────────────────────────────────────

const LEDGER_ROWS: [string, string, string, string][] = [
  ["TRF", "JOD", "1,250.000",  "posted"],
  ["FX",  "USD", "980.50",     "posted"],
  ["LN",  "JOD", "12,400.000", "approved"],
  ["DEP", "EUR", "3,075.00",   "posted"],
  ["CHQ", "JOD", "640.000",    "cleared"],
  ["TRF", "SAR", "2,210.00",   "posted"],
  ["INT", "JOD", "18.725",     "accrued"],
  ["LC",  "USD", "45,000.00",  "issued"],
];

function LedgerFeed() {
  return (
    <div
      aria-hidden="true"
      className="relative h-52 sm:h-60 lg:h-auto lg:flex-1 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#060610]"
    >
      {/* Panel header */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-3 bg-[#060610]/90 backdrop-blur-sm border-b border-white/[0.05]">
        <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/30">
          Core banking · ledger
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-300/70">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          EOD running
        </span>
      </div>

      {/* Scrolling rows — duplicated for a seamless loop */}
      <div className="absolute inset-x-0 top-11 bottom-0 overflow-hidden">
        <div className="animate-ledger motion-reduce:animate-none">
          {[...LEDGER_ROWS, ...LEDGER_ROWS].map(([code, ccy, amount, state], i) => (
            <div
              key={i}
              className="grid grid-cols-[3rem_3rem_1fr_auto] items-center gap-2 px-4 py-2.5 border-b border-white/[0.03] font-mono text-[11px]"
            >
              <span className="text-cyan-300/70">{code}</span>
              <span className="text-white/30">{ccy}</span>
              <span className="text-right tabular-nums text-white/70">{amount}</span>
              <span className="pl-3 text-emerald-400/80">✓ {state}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top / bottom fades */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 z-10 bg-gradient-to-t from-[#060610] to-transparent" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WorkdayMeter — live "on the clock" bar in Amman time
// ─────────────────────────────────────────────────────────────────────────────

function WorkdayMeter({ schedule }: { schedule: string }) {
  // undefined = not mounted yet (avoids SSR/hydration mismatch)
  const [progress, setProgress] = useState<number | null | undefined>(undefined);

  useEffect(() => {
    const tick = () => setProgress(workdayProgress(new Date()));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  const onClock = typeof progress === "number";

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center gap-2 text-xs font-semibold">
          <span
            className={`w-2 h-2 rounded-full ${onClock ? "bg-emerald-400 animate-pulse" : "bg-white/25"}`}
            aria-hidden="true"
          />
          <span className={onClock ? "text-emerald-300" : "text-white/45"}>
            {progress === undefined ? "Checking Amman time…" : onClock ? "On the clock right now" : "Off the clock"}
          </span>
        </span>
        <span className="font-mono text-[10px] text-white/30">
          {onClock ? `${Math.round(progress * 100)}% of today` : "Amman · UTC+3"}
        </span>
      </div>

      {/* Bar — width transitions from 0 once the real value arrives */}
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-[1400ms] ease-out"
          style={{
            width: onClock ? `${Math.max(progress * 100, 3)}%` : "0%",
            background: "linear-gradient(90deg, #0891b2 0%, #10b981 100%)",
            boxShadow: "0 0 12px rgba(16,185,129,0.5)",
          }}
        />
      </div>

      <p className="mt-2.5 font-mono text-[10px] text-white/30">{schedule}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

export default function ExperienceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef    = useRef<HTMLDivElement>(null);
  const role       = CURRENT_ROLE;

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const card    = cardRef.current;
        const trigger = { trigger: card, start: "top 85%", once: true };

        // Iris open — the card's own rounding is matched by the inset radius
        gsap.fromTo(
          card,
          { clipPath: "inset(14% 6% 14% 6% round 28px)", y: 70, opacity: 0 },
          {
            clipPath: "inset(0% 0% 0% 0% round 28px)",
            y: 0,
            opacity: 1,
            duration: 1.15,
            ease: "power4.out",
            scrollTrigger: trigger,
            clearProps: "clipPath",
          },
        );

        // Selector strings are scoped to sectionRef by gsap.context()
        gsap.from("[data-reveal]", {
          y: 26,
          opacity: 0,
          duration: 0.7,
          stagger: 0.07,
          delay: 0.3,
          ease: "power3.out",
          scrollTrigger: trigger,
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="experience"
      aria-label="Current role"
      className="relative py-20 md:py-28 bg-[#07070d] overflow-hidden"
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 60% 45% at 75% 45%, rgba(8,145,178,0.10) 0%, transparent 70%),
            radial-gradient(ellipse 45% 35% at 15% 70%, rgba(16,185,129,0.06) 0%, transparent 65%)
          `,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section header ─────────────────────────────────────────────── */}
        <div className="mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 mb-5 text-[11px] font-mono tracking-[0.2em] text-white/40 uppercase">
            Experience
          </div>
          <h2
            className="font-bold tracking-tight text-white leading-tight"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)" }}
          >
            <TextReveal as="span" splitBy="words" triggerOnScroll stagger={0.07}>
              Building Banking Software,
            </TextReveal>
            {" "}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #0891b2 0%, #10b981 100%)" }}
            >
              <TextReveal as="span" splitBy="words" triggerOnScroll stagger={0.07} delay={0.1}>
                Every Day.
              </TextReveal>
            </span>
          </h2>
        </div>

        {/* ── Featured role card ─────────────────────────────────────────── */}
        <div
          ref={cardRef}
          className="
            relative overflow-hidden rounded-[28px]
            border border-white/[0.08]
            bg-gradient-to-br from-[#0d1220] via-[#0b0b18] to-[#08100f]
            shadow-[0_40px_120px_rgba(0,0,0,0.55)]
          "
        >
          {/* Top accent stripe */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-[3px]"
            style={{ background: "linear-gradient(90deg, #0891b2 0%, #10b981 60%, transparent 100%)" }}
          />

          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 p-6 sm:p-8 lg:p-12">

            {/* ── Left: role details ── */}
            <div className="lg:col-span-7 flex flex-col">
              <div data-reveal className="flex flex-wrap items-center gap-3 mb-6">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-[10px] font-mono tracking-[0.2em] uppercase text-emerald-300">
                  <span className="relative flex w-2 h-2" aria-hidden="true">
                    <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-60 animate-ping" />
                    <span className="relative w-2 h-2 rounded-full bg-emerald-400" />
                  </span>
                  Current role
                </span>
                <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-white/30">
                  {role.period}
                </span>
              </div>

              <p data-reveal className="font-mono text-sm tracking-[0.2em] uppercase text-cyan-300/80 mb-2">
                {role.title}
              </p>

              <h3
                data-reveal
                className="font-black tracking-tight leading-[0.95] text-transparent bg-clip-text mb-5"
                style={{
                  fontSize: "clamp(2.25rem, 6vw, 4.25rem)",
                  backgroundImage: "linear-gradient(120deg, #ffffff 0%, #a5f3fc 55%, #6ee7b7 100%)",
                }}
              >
                {role.company}
              </h3>

              <div data-reveal className="flex flex-wrap gap-x-5 gap-y-2 mb-6 text-xs font-mono text-white/45">
                <span className="inline-flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-cyan-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {role.location}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-cyan-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {role.type}
                </span>
              </div>

              <p data-reveal className="text-white/55 text-sm sm:text-base leading-relaxed max-w-prose mb-6">
                {role.about}
              </p>

              {role.highlights.length > 0 && (
                <ul className="flex flex-col gap-2.5 mb-6">
                  {role.highlights.map((item) => (
                    <li key={item} data-reveal className="flex gap-3 text-sm text-white/60 leading-relaxed">
                      <span className="mt-2 w-1.5 h-1.5 flex-shrink-0 rounded-full bg-cyan-400" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              <div data-reveal className="mt-auto flex flex-col gap-4">
                <div>
                  <p className="mb-2 font-mono text-[10px] tracking-[0.2em] uppercase text-white/30">Stack</p>
                  <div className="flex flex-wrap gap-2">
                    {role.stack.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 text-[11px] font-mono font-semibold tracking-wider rounded-lg border border-rose-400/30 bg-rose-400/10 text-rose-200"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 font-mono text-[10px] tracking-[0.2em] uppercase text-white/30">Domain</p>
                  <div className="flex flex-wrap gap-2">
                    {role.focus.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 text-[11px] font-mono tracking-wider rounded-full border border-cyan-500/25 bg-cyan-500/10 text-cyan-200/80"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {role.link && (
                <a
                  data-reveal
                  href={role.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-7 inline-flex w-fit items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-white transition-colors duration-300"
                >
                  <span className="underline underline-offset-4 decoration-current/30 group-hover:decoration-current/80 transition-all duration-300">
                    About ICS Financial Systems
                  </span>
                  <span className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5" aria-hidden="true">
                    ↗
                  </span>
                </a>
              )}
            </div>

            {/* ── Right: visual + live meter ── */}
            <div data-reveal className="lg:col-span-5 flex flex-col gap-4 lg:min-h-[360px]">
              <LedgerFeed />
              <WorkdayMeter schedule={role.schedule} />
            </div>
          </div>
        </div>

        {/* ── Side-business teaser → TeacherHelper section ──────────────── */}
        <a
          href="#teacherhelper"
          className="
            group mt-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5
            rounded-2xl border border-white/[0.07] bg-white/[0.02]
            hover:border-amber-400/30 hover:bg-amber-400/[0.04]
            px-5 py-4 sm:px-6 transition-colors duration-300
          "
        >
          <span className="inline-flex w-fit items-center gap-2 px-2.5 py-1 rounded-full border border-amber-400/25 bg-amber-400/10 text-[10px] font-mono tracking-[0.2em] uppercase text-amber-300">
            Side business
          </span>
          <span className="text-sm text-white/60 group-hover:text-white/85 transition-colors duration-300">
            <span className="font-semibold text-white">TeacherHelper</span>
            {" "}— custom EdTech apps, real-time voice AI and generative learning content for schools.
          </span>
          <span className="sm:ml-auto text-amber-300 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">
            →
          </span>
        </a>
      </div>
    </section>
  );
}
