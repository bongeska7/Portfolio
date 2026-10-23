"use client";

/**
 * @file src/components/TeacherHelperSection.tsx
 *
 * TeacherHelper — Side Business Showcase
 * ─────────────────────────────────────────────────────────────────────────────
 * Teachers ask for something, it gets built quickly with AI. The section shows
 * the three kinds of work:
 *
 *   ┌───────────────────────────────────────────────────────────┐
 *   │  Header  +  "How it works" 3-step strip                   │
 *   ├─────────────────────────────┬─────────────────────────────┤
 *   │  Game: Max the Robot Cat    │  Game: Pip's Magic Garden   │
 *   ├───────────────────┬─────────┴─────────────────────────────┤
 *   │  AI lesson video  │  Worksheets (scroll-fanned pages)     │
 *   │  (lg: 5 cols)     │  (lg: 7 cols)                         │
 *   └───────────────────┴───────────────────────────────────────┘
 *   Mobile: everything stacks; worksheets become a swipeable row.
 *
 * ## Animation
 *   • Every `[data-th-reveal]` block fades up via ScrollTrigger.batch.
 *   • The process-strip connector line is scrubbed to scroll.
 *   • Game art: Max loops with CSS keyframes (blink / talk / twinkle);
 *     Pip's plant grows with a GSAP timeline on enter and regrows on hover.
 *   • Video autoplays muted only while ≥ 50% visible, pauses otherwise.
 *   • Worksheet pages start stacked and fan out as the user scrolls (scrub),
 *     desktop only. Clicking a page opens it full size in a <dialog>.
 *   • All GSAP motion is skipped under `prefers-reduced-motion: reduce`.
 */

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import TextReveal from "@/components/TextReveal";
import { useSmoothScroll } from "@/context/SmoothScrollContext";
import {
  CLASSROOM_GAMES,
  LESSON_VIDEO,
  WORKSHEETS,
  type ClassroomGame,
} from "@/data/portfolio";

// ─────────────────────────────────────────────────────────────────────────────
// Process strip data
// ─────────────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    title: "Scope & curriculum mapping",
    body:  "Each brief is mapped to grade level, curriculum standards and learning objectives.",
  },
  {
    title: "AI-accelerated engineering",
    body:  "LLM, speech and generative-media pipelines for content, with hand-engineered TypeScript where it counts.",
  },
  {
    title: "Deploy & deliver",
    body:  "Shipped to Vercel for the classroom smartboard, or typeset as print-ready PDFs with answer keys.",
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Game art — Max the Robot Cat (pure SVG + CSS keyframes)
// ─────────────────────────────────────────────────────────────────────────────

/** [left %, top %, size px, delay s] */
const STARS: [number, number, number, number][] = [
  [8, 14, 2, 0], [18, 62, 1.5, 1.2], [26, 28, 2.5, 0.6], [38, 82, 1.5, 2.1],
  [62, 12, 2, 1.6], [72, 70, 1.5, 0.3], [84, 34, 2.5, 2.4], [92, 78, 2, 0.9],
  [50, 90, 1.5, 1.8], [14, 88, 2, 2.7], [80, 8, 1.5, 0.4], [44, 8, 1.5, 2.9],
];

/** Lets CSS scale animations pivot around an SVG element's own centre */
const SVG_PIVOT = { transformBox: "fill-box", transformOrigin: "center" } as const;

function MaxArt() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 80% 70% at 50% 35%, #1e1b4b 0%, #0b1026 55%, #050816 100%)",
      }}
    >
      {STARS.map(([x, y, s, d], i) => (
        <span
          key={i}
          aria-hidden="true"
          className="absolute rounded-full bg-white animate-twinkle motion-reduce:animate-none"
          style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, animationDelay: `${d}s` }}
        />
      ))}

      <svg
        viewBox="0 0 320 200"
        className="absolute inset-0 w-full h-full animate-float motion-reduce:animate-none"
        role="img"
        aria-label="Illustration of Max, a friendly robot cat"
      >
        <defs>
          <linearGradient id="max-head" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
        </defs>

        {/* Body */}
        <rect x="128" y="146" width="64" height="40" rx="16" fill="#475569" />
        <circle cx="160" cy="166" r="7" fill="#22c55e" className="animate-pulse motion-reduce:animate-none" />

        {/* Antenna */}
        <line x1="160" y1="52" x2="160" y2="34" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
        <circle cx="160" cy="30" r="5" fill="#f472b6" className="animate-pulse motion-reduce:animate-none" />

        {/* Ears */}
        <path d="M110 80 L116 38 L146 58 Z" fill="#cbd5e1" />
        <path d="M210 80 L204 38 L174 58 Z" fill="#cbd5e1" />
        <path d="M118 68 L121 48 L136 59 Z" fill="#f9a8d4" />
        <path d="M202 68 L199 48 L184 59 Z" fill="#f9a8d4" />

        {/* Head + visor */}
        <rect x="100" y="50" width="120" height="104" rx="44" fill="url(#max-head)" />
        <rect x="114" y="70" width="92" height="62" rx="26" fill="#0b1226" stroke="#38bdf8" strokeOpacity="0.35" />

        {/* Eyes (blink) */}
        <g className="animate-blink motion-reduce:animate-none" style={{ ...SVG_PIVOT, filter: "drop-shadow(0 0 6px #22d3ee)" }}>
          <rect x="134" y="86" width="14" height="20" rx="7" fill="#67e8f9" />
          <rect x="172" y="86" width="14" height="20" rx="7" fill="#67e8f9" />
        </g>

        {/* Mouth (talking) */}
        <rect
          x="151" y="113" width="18" height="7" rx="3.5" fill="#67e8f9"
          className="animate-talk motion-reduce:animate-none"
          style={SVG_PIVOT}
        />

        {/* Cheeks */}
        <circle cx="124" cy="122" r="5" fill="#f472b6" opacity="0.45" />
        <circle cx="196" cy="122" r="5" fill="#f472b6" opacity="0.45" />
      </svg>

      {/* Speech bubble */}
      <div
        aria-hidden="true"
        className="absolute top-[12%] right-[5%] sm:right-[9%] animate-float motion-reduce:animate-none"
        style={{ animationDelay: "1.2s" }}
      >
        <div className="relative rounded-2xl rounded-bl-sm bg-white px-3 py-1.5 text-[11px] font-semibold text-[#0b1026] shadow-lg">
          Let&apos;s count by 10s!
        </div>
      </div>

      {/* Push-to-talk pill, like the real app */}
      <div
        aria-hidden="true"
        className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-black/50 border border-white/10 backdrop-blur-sm px-3 py-1 text-[10px] font-mono text-white/70 whitespace-nowrap"
      >
        <span className="w-2 h-2 rounded-full bg-green-400" />
        Hold Space to talk
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Game art — Pip's Magic Garden (SVG grown by a GSAP timeline)
// ─────────────────────────────────────────────────────────────────────────────

function PipArt() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // pathLength="1" on every stroked path → dash 1 / offset 1 hides it fully
        const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });
        tl.fromTo('[data-pip="root"]',   { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.6, stagger: 0.12 })
          .fromTo('[data-pip="stem"]',   { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.8 }, "-=0.25")
          .addLabel("leaves", "-=0.35");

        // Each leaf grows out from where it meets the stem (its data-origin)
        svg.querySelectorAll<SVGPathElement>('[data-pip="leaf"]').forEach((leaf, i) => {
          tl.fromTo(
            leaf,
            { scale: 0, svgOrigin: leaf.dataset.origin },
            { scale: 1, duration: 0.6, ease: "back.out(2)" },
            `leaves+=${i * 0.15}`,
          );
        });

        tl.fromTo('[data-pip="flower"]',
            { scale: 0, rotation: -120, svgOrigin: "160 72" },
            { scale: 1, rotation: 0, duration: 0.9, ease: "back.out(1.6)" },
            "-=0.15")
          .fromTo('[data-pip="fruit"]',
            { scale: 0, svgOrigin: "199 110" },
            { scale: 1, duration: 0.5, ease: "back.out(3)" },
            "-=0.3");

        ScrollTrigger.create({
          trigger: svg,
          start:   "top 80%",
          once:    true,
          onEnter: () => tl.play(),
        });

        // Regrow on hover — feels like replaying a level (only once it has grown)
        const card   = svg.closest("article");
        const replay = () => { if (tl.progress() > 0) tl.restart(); };
        card?.addEventListener("mouseenter", replay);

        return () => card?.removeEventListener("mouseenter", replay);
      });
    }, svg);

    return () => ctx.revert();
  }, []);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background: `
          radial-gradient(circle at 82% 18%, rgba(253,230,138,0.35) 0%, transparent 28%),
          linear-gradient(180deg, #0f2f45 0%, #134e4a 70%, #14532d 100%)
        `,
      }}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 320 200"
        className="absolute inset-0 w-full h-full"
        role="img"
        aria-label="Illustration of Pip the seed growing roots, a stem, leaves, a flower and a fruit"
      >
        {/* Sun */}
        <circle cx="262" cy="38" r="26" fill="#fde68a" opacity="0.18" className="animate-pulse motion-reduce:animate-none" />
        <circle cx="262" cy="38" r="15" fill="#fde68a" />

        {/* Soil + grass edge */}
        <path d="M0 150 Q80 140 160 148 T320 146 V200 H0 Z" fill="#3b2416" />
        <path d="M0 150 Q80 140 160 148 T320 146" fill="none" stroke="#22c55e" strokeWidth="4" />

        {/* Roots */}
        {[
          "M160 162 C156 172 150 178 140 190",
          "M160 162 C164 174 172 180 182 192",
          "M160 166 C160 178 158 186 160 198",
        ].map((d) => (
          <path key={d} data-pip="root" d={d} pathLength={1} strokeDasharray="1" strokeDashoffset="0"
                fill="none" stroke="#d6b48a" strokeWidth="2.2" strokeLinecap="round" />
        ))}

        {/* Stem */}
        <path data-pip="stem" d="M160 152 C157 130 165 108 160 78" pathLength={1} strokeDasharray="1" strokeDashoffset="0"
              fill="none" stroke="#22c55e" strokeWidth="5" strokeLinecap="round" />

        {/* Leaves */}
        <path data-pip="leaf" data-origin="160 122" d="M160 122 C146 106 126 110 118 118 C132 130 150 130 160 122 Z" fill="#4ade80" />
        <path data-pip="leaf" data-origin="161 104" d="M161 104 C175 88 195 92 202 100 C190 112 171 112 161 104 Z" fill="#86efac" />

        {/* Fruit hanging off the right leaf */}
        <circle data-pip="fruit" cx="199" cy="110" r="6.5" fill="#ef4444" />

        {/* Flower */}
        <g data-pip="flower">
          {[0, 72, 144, 216, 288].map((deg) => (
            <circle
              key={deg}
              cx={160 + 10 * Math.cos((deg * Math.PI) / 180)}
              cy={72 + 10 * Math.sin((deg * Math.PI) / 180)}
              r="9"
              fill="#f472b6"
            />
          ))}
          <circle cx="160" cy="72" r="7" fill="#fde047" />
        </g>

        {/* Pip the seed */}
        <ellipse cx="160" cy="158" rx="15" ry="11.5" fill="#b45309" />
        <circle cx="155" cy="156" r="1.8" fill="#1c1917" />
        <circle cx="165" cy="156" r="1.8" fill="#1c1917" />
        <path d="M155.5 161 Q160 164.5 164.5 161" fill="none" stroke="#1c1917" strokeWidth="1.4" strokeLinecap="round" />
      </svg>

      <div
        aria-hidden="true"
        className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-black/40 border border-white/10 backdrop-blur-sm px-3 py-1 text-[10px] font-mono text-white/70 whitespace-nowrap"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        Drag a card to help Pip grow
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GameCard
// ─────────────────────────────────────────────────────────────────────────────

function GameCard({ game }: { game: ClassroomGame }) {
  return (
    <article
      data-th-reveal
      className="
        group relative flex flex-col overflow-hidden rounded-3xl
        border border-white/[0.07] bg-[#0c0c1a]
        hover:border-white/[0.14] transition-colors duration-500
      "
    >
      {/* Art */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.04]">
          {game.image ? (
            <Image
              src={game.image}
              alt={`${game.title} screenshot`}
              fill
              sizes="(max-width: 767px) 100vw, 50vw"
              className="object-cover"
            />
          ) : game.art === "max" ? (
            <MaxArt />
          ) : (
            <PipArt />
          )}
        </div>

        <span
          className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-[0.18em] uppercase border backdrop-blur-sm"
          style={{ color: game.accent, borderColor: `${game.accent}40`, backgroundColor: "rgba(7,7,13,0.55)" }}
        >
          {game.grade} · {game.subject}
        </span>
      </div>

      {/* Copy */}
      <div className="relative flex flex-1 flex-col p-6 sm:p-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: `radial-gradient(ellipse 70% 60% at 50% 0%, ${game.accent}14, transparent 70%)` }}
        />

        <h3 className="relative text-2xl font-bold tracking-tight text-white mb-1.5">{game.title}</h3>
        <p className="relative text-sm font-medium mb-4" style={{ color: game.accent }}>{game.tagline}</p>
        <p className="relative text-sm text-white/45 leading-relaxed mb-6">{game.description}</p>

        <div className="relative flex flex-wrap gap-1.5 mb-7">
          {game.tech.map((t) => (
            <span
              key={t}
              className="px-2.5 py-0.5 text-[10px] font-mono tracking-wider rounded-full border"
              style={{ borderColor: `${game.accent}30`, color: `${game.accent}cc`, backgroundColor: `${game.accent}12` }}
            >
              {t}
            </span>
          ))}
        </div>

        <div className="relative mt-auto flex flex-wrap items-center gap-x-4 gap-y-2">
          <a
            href={game.url}
            target="_blank"
            rel="noopener noreferrer"
            className="
              group/btn inline-flex items-center gap-2 px-4 py-2.5 rounded-xl
              text-sm font-semibold text-[#07070d]
              hover:brightness-110 active:scale-[0.97] transition-all duration-300
            "
            style={{ backgroundColor: game.accent, boxShadow: `0 0 28px ${game.accent}40` }}
            aria-label={`Play ${game.title} live (opens in a new tab)`}
          >
            Play live
            <span className="transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" aria-hidden="true">↗</span>
          </a>
          {game.note && (
            <span className="text-[11px] font-mono text-white/30">{game.note}</span>
          )}
        </div>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LessonVideoCard — phone-framed video, plays only while visible
// ─────────────────────────────────────────────────────────────────────────────

/** Chip positions around the phone (sm+) — [top %, side, offset %, float delay s] */
const CHIP_SPOTS: [number, "left" | "right", number, number][] = [
  [10, "left", -46, 0],
  [30, "right", -46, 0.8],
  [50, "left", -52, 1.6],
  [68, "right", -50, 2.4],
  [86, "left", -42, 3.2],
];

function LessonVideoCard() {
  const v         = LESSON_VIDEO;
  const videoRef  = useRef<HTMLVideoElement>(null);
  const barRef    = useRef<HTMLDivElement>(null);
  const [muted, setMuted]     = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // React does not reliably reflect `muted` as an attribute — set it directly
    video.muted = true;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting && !reduceMotion) video.play().catch(() => {});
        else if (!entry.isIntersecting) video.pause();
      },
      { threshold: 0.5 },
    );
    io.observe(video);

    // Progress bar written straight to the DOM — no re-render per frame
    const onTime  = () => {
      if (barRef.current && video.duration) {
        barRef.current.style.transform = `scaleX(${video.currentTime / video.duration})`;
      }
    };
    const onPlay  = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    video.addEventListener("timeupdate", onTime);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);

    return () => {
      io.disconnect();
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
    if (!video.muted && video.paused) video.play().catch(() => {});
  };

  return (
    <article
      data-th-reveal
      className="lg:col-span-5 relative flex flex-col overflow-hidden rounded-3xl border border-white/[0.07] bg-[#0c0c1a] p-6 sm:p-7"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 70% 50% at 50% 75%, rgba(236,72,153,0.10) 0%, transparent 70%)" }}
      />

      <div className="relative mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" aria-hidden="true" />
          <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/30">Generative AI video</span>
        </div>
        <h3 className="text-xl font-bold tracking-tight text-white">{v.title}</h3>
        <p className="font-mono text-[11px] text-pink-300/70 mt-1">
          {v.grade} · {v.subject} · {v.duration}
        </p>
        <p className="text-sm text-white/45 leading-relaxed mt-3">{v.description}</p>
      </div>

      {/* Phone + floating vocabulary chips */}
      <div className="relative mx-auto w-[min(62vw,240px)] mt-auto">
        {v.keywords.map((word, i) => {
          const spot = CHIP_SPOTS[i % CHIP_SPOTS.length]!;
          const [top, side, offset, delay] = spot;
          return (
            <span
              key={word}
              data-th-chip
              aria-hidden="true"
              className="hidden sm:block absolute z-10"
              style={{ top: `${top}%`, [side]: `${offset}%` }}
            >
              <span
                className="block animate-float motion-reduce:animate-none px-2.5 py-1 rounded-full text-[11px] font-semibold text-white border border-white/15 bg-white/10 backdrop-blur-md shadow-lg"
                style={{ animationDelay: `${delay}s` }}
              >
                {word}
              </span>
            </span>
          );
        })}

        <div className="relative rounded-[2.2rem] p-2 bg-gradient-to-b from-[#273246] to-[#0b0f19] border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.6),0_0_60px_rgba(236,72,153,0.12)]">
          <div className="relative aspect-[9/16] overflow-hidden rounded-[1.7rem] bg-black">
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover cursor-pointer"
              src={v.src}
              poster={v.poster}
              muted
              loop
              playsInline
              preload="none"
              onClick={togglePlay}
              aria-label={`${v.title} — ${v.grade} ${v.subject} lesson video`}
            >
              Your browser does not support the video tag.
            </video>

            {/* Notch */}
            <div aria-hidden="true" className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-4 rounded-full bg-black/85" />

            {/* Big play button while paused */}
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? "Pause video" : "Play video"}
              className={`
                absolute inset-0 m-auto w-14 h-14 rounded-full
                flex items-center justify-center
                bg-black/50 border border-white/20 backdrop-blur-md text-white
                transition-all duration-300 cursor-pointer
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400
                ${playing ? "opacity-0 scale-75 pointer-events-none" : "opacity-100 scale-100"}
              `}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
              </svg>
            </button>

            {/* Mute toggle */}
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Unmute video" : "Mute video"}
              className="
                absolute bottom-4 right-3 flex items-center gap-1.5
                px-2.5 py-1.5 rounded-full
                bg-black/55 border border-white/15 backdrop-blur-md
                text-[10px] font-mono text-white/85
                hover:bg-black/75 active:scale-95 transition-all duration-200 cursor-pointer
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400
              "
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 5 6 9H2v6h4l5 4V5Z" />
                {muted ? (
                  <><line x1="22" y1="9" x2="16" y2="15" /><line x1="16" y1="9" x2="22" y2="15" /></>
                ) : (
                  <><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M19 5a10 10 0 0 1 0 14" /></>
                )}
              </svg>
              {muted ? "Tap for sound" : "Sound on"}
            </button>

            {/* Progress */}
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
              <div ref={barRef} className="h-full origin-left bg-pink-400" style={{ transform: "scaleX(0)" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Vocabulary row for phones (chips float beside the frame on sm+) */}
      <div className="sm:hidden relative flex flex-wrap justify-center gap-1.5 mt-5" aria-hidden="true">
        {v.keywords.map((word) => (
          <span key={word} className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-white/80 border border-white/15 bg-white/[0.06]">
            {word}
          </span>
        ))}
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WorksheetsCard — scroll-fanned page stack + <dialog> lightbox
// ─────────────────────────────────────────────────────────────────────────────

/** Final fanned-out pose for page `i` of `n` */
function fanPose(i: number, n: number) {
  const c = i - (n - 1) / 2; // −2.5 … 2.5 for six pages
  return { xPercent: c * 48, y: c * c * 5, rotation: c * 5, scale: 1 };
}

function WorksheetsCard() {
  const fanRef    = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const lenis     = useSmoothScroll();
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const n = WORKSHEETS.length;

  // ── Fan-out scrub (desktop) ──────────────────────────────────────────────
  useEffect(() => {
    const fan = fanRef.current;
    if (!fan) return;

    const ctx = gsap.context(() => {
      const mm    = gsap.matchMedia();
      const pages = Array.from(fan.querySelectorAll<HTMLElement>("[data-sheet]"));

      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          pages,
          {
            xPercent: 0,
            y: 30,
            rotation: (i: number) => (i - (n - 1) / 2) * 1.5, // slightly messy stack
            scale: 0.92,
          },
          {
            xPercent: (i: number) => fanPose(i, n).xPercent,
            y:        (i: number) => fanPose(i, n).y,
            rotation: (i: number) => fanPose(i, n).rotation,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: fan,
              start:   "top 92%",
              end:     "center 55%",
              scrub:   1,
            },
          },
        );
      });

      mm.add("(min-width: 768px) and (prefers-reduced-motion: reduce)", () => {
        pages.forEach((p, i) => gsap.set(p, fanPose(i, n)));
      });
    }, fan);

    return () => ctx.revert();
  }, [n]);

  // ── Lightbox open/close + pause smooth scroll underneath ─────────────────
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (openIdx !== null) {
      if (!dialog.open) dialog.showModal();
      lenis?.stop();
    } else {
      if (dialog.open) dialog.close();
      lenis?.start();
    }
  }, [openIdx, lenis]);

  const step = (delta: number) =>
    setOpenIdx((i) => (i === null ? i : (i + delta + n) % n));

  const open = openIdx !== null ? WORKSHEETS[openIdx] : undefined;

  return (
    <article
      data-th-reveal
      className="lg:col-span-7 relative flex flex-col overflow-hidden rounded-3xl border border-white/[0.07] bg-[#0c0c1a] p-6 sm:p-7"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 70% 55% at 50% 80%, rgba(245,158,11,0.09) 0%, transparent 70%)" }}
      />

      <div className="relative mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" aria-hidden="true" />
          <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/30">Curriculum content</span>
        </div>
        <h3 className="text-xl font-bold tracking-tight text-white">Grade 2 Math, standards-aligned</h3>
        <p className="text-sm text-white/45 leading-relaxed mt-3 max-w-prose">
          A worksheet series mapped to Common Core (CCSS) standards — each page a themed mission
          with recurring characters, differentiated A/B versions where needed, and matching
          answer keys. Generated, illustrated and typeset for print.
        </p>
      </div>

      {/* Desktop — stacked pages fan out on scroll */}
      <div
        ref={fanRef}
        className="hidden md:block relative my-auto"
        style={{
          // Page width scales with the viewport; height follows the 1105×1338 page ratio
          // Six pages fanned at 48% spacing span ≈ 3.4 × page width
          "--ws-w": "clamp(110px, 11vw, 170px)",
          height: "calc(var(--ws-w) * 1.211 + 90px)",
        } as CSSProperties}
      >
        {WORKSHEETS.map((ws, i) => (
          <div
            key={ws.image}
            data-sheet
            className="absolute top-6 hover:z-50! focus-within:z-50!"
            style={{ left: "calc(50% - var(--ws-w) / 2)", width: "var(--ws-w)", zIndex: i + 1 }}
          >
            <button
              type="button"
              onClick={() => setOpenIdx(i)}
              aria-label={`Open worksheet page: ${ws.title}`}
              className="
                group/sheet block w-full aspect-[1105/1338] relative overflow-hidden rounded-lg
                bg-white shadow-[0_18px_40px_rgba(0,0,0,0.55)]
                ring-1 ring-black/10
                transition-transform duration-300 ease-out
                hover:-translate-y-5 hover:scale-[1.06] focus-visible:-translate-y-5 focus-visible:scale-[1.06]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400
                cursor-zoom-in
              "
            >
              <Image src={ws.image} alt="" fill sizes="180px" className="object-cover" />
              <span className="absolute inset-x-0 bottom-0 px-2 py-1.5 bg-gradient-to-t from-black/80 to-transparent text-left text-[9px] font-semibold text-white opacity-0 group-hover/sheet:opacity-100 transition-opacity duration-300">
                {ws.title}
              </span>
            </button>
          </div>
        ))}
      </div>

      {/* Mobile — swipeable row */}
      <div className="md:hidden relative -mx-6 sm:-mx-7 px-6 sm:px-7 mt-auto flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:none]">
        {WORKSHEETS.map((ws, i) => (
          <button
            key={ws.image}
            type="button"
            onClick={() => setOpenIdx(i)}
            aria-label={`Open worksheet page: ${ws.title}`}
            className="snap-center flex-shrink-0 w-[58%] sm:w-[40%] text-left"
          >
            <span className="block relative aspect-[1105/1338] overflow-hidden rounded-lg bg-white shadow-lg">
              <Image src={ws.image} alt="" fill sizes="60vw" className="object-cover" />
            </span>
            <span className="block mt-2 text-xs font-semibold text-white/80">{ws.title}</span>
            <span className="block text-[10px] font-mono text-white/35">{ws.topic}</span>
          </button>
        ))}
      </div>

      <p className="hidden md:block relative mt-2 text-center font-mono text-[10px] tracking-[0.2em] uppercase text-white/20 select-none" aria-hidden="true">
        Click a page to read it
      </p>

      {/* Lightbox */}
      <dialog
        ref={dialogRef}
        onClose={() => setOpenIdx(null)}
        onClick={(e) => { if (e.target === e.currentTarget) setOpenIdx(null); }}
        data-lenis-prevent
        aria-label={open ? `Worksheet page: ${open.title}` : "Worksheet page"}
        className="
          m-auto p-0 bg-transparent max-w-[min(94vw,640px)] max-h-[96vh] overflow-visible
          backdrop:bg-black/80 backdrop:backdrop-blur-sm
          opacity-100 scale-100 transition-[opacity,scale] duration-300
          starting:open:opacity-0 starting:open:scale-95
        "
      >
        {open && (
          <div className="flex flex-col items-center gap-3">
            <Image
              src={open.image}
              alt={`${open.title} — ${open.topic}`}
              width={1105}
              height={1338}
              sizes="(max-width: 700px) 94vw, 640px"
              className="w-auto max-h-[80vh] rounded-xl shadow-2xl"
            />
            <div className="flex w-full items-center justify-between gap-3 text-white">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous page"
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/15 transition-colors cursor-pointer"
              >
                ‹
              </button>
              <div className="text-center">
                <p className="text-sm font-semibold">{open.title}</p>
                <p className="text-[11px] font-mono text-white/50">{open.topic} · {openIdx! + 1}/{n}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next page"
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/15 transition-colors cursor-pointer"
                >
                  ›
                </button>
                <button
                  type="button"
                  onClick={() => setOpenIdx(null)}
                  aria-label="Close"
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/15 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

export default function TeacherHelperSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // ── Block reveals, batched so blocks entering together stagger ──
        const blocks = Array.from(section.querySelectorAll<HTMLElement>("[data-th-reveal]"));
        gsap.set(blocks, { y: 50, opacity: 0 });
        ScrollTrigger.batch(blocks, {
          start: "top 88%",
          once:  true,
          onEnter: (batch) =>
            gsap.to(batch, { y: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: "power3.out", overwrite: true }),
        });

        // ── Floating vocabulary chips pop in around the phone ──
        const chips = Array.from(section.querySelectorAll<HTMLElement>("[data-th-chip]"));
        gsap.from(chips, {
          scale: 0,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "back.out(2.2)",
          scrollTrigger: { trigger: chips[0]?.parentElement, start: "top 75%", once: true },
        });
      });

      // ── Process connector: horizontal on desktop, vertical on mobile ──
      const line  = section.querySelector<HTMLElement>("[data-th-line]");
      const steps = section.querySelector<HTMLElement>("[data-th-steps]");

      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(line, { scaleX: 0 }, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: steps, start: "top 85%", end: "top 45%", scrub: 1 },
        });
      });
      mm.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(line, { scaleY: 0 }, {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: steps, start: "top 80%", end: "bottom 60%", scrub: 1 },
        });
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="teacherhelper"
      aria-label="TeacherHelper — side business"
      className="relative py-20 md:py-32 bg-[#07070d] overflow-hidden"
    >
      {/* Warm ambient glows — sets this section apart from the cooler portfolio palette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 55% 40% at 15% 10%, rgba(245,158,11,0.10) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 90% 40%, rgba(236,72,153,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 50% 35% at 30% 90%, rgba(56,189,248,0.06) 0%, transparent 70%)
          `,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="mb-12 md:mb-16 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-400/20 bg-amber-400/[0.07] mb-5 text-[11px] font-mono tracking-[0.2em] text-amber-200/70 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" aria-hidden="true" />
            Side Venture · EdTech
          </div>

          <h2
            className="font-black tracking-tight leading-none mb-5"
            style={{ fontSize: "clamp(2.25rem, 10vw, 5.5rem)" }}
          >
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(110deg, #fbbf24 0%, #f472b6 50%, #38bdf8 100%)" }}
            >
              <TextReveal as="span" splitBy="chars" triggerOnScroll stagger={0.035}>
                TeacherHelper
              </TextReveal>
            </span>
          </h2>

          <p className="text-white/50 text-base md:text-lg leading-relaxed">
            An independent EdTech practice. I engineer custom classroom software and
            learning content for teachers — real-time voice agents, interactive WebGL
            games, generative-AI lesson videos and standards-aligned worksheets —
            using AI-accelerated workflows that turn a brief into a production
            deployment on a school timeline.
          </p>
        </div>

        {/* ── How it works ───────────────────────────────────────────────── */}
        <div data-th-steps className="relative mb-12 md:mb-16">
          {/* Connector line (behind the step numbers) */}
          <div
            aria-hidden="true"
            className="absolute left-[19px] top-5 bottom-5 w-px md:left-5 md:right-5 md:top-5 md:bottom-auto md:w-auto md:h-px bg-white/[0.06]"
          >
            <div
              data-th-line
              className="w-full h-full origin-top md:origin-left"
              style={{ background: "linear-gradient(180deg, #fbbf24, #f472b6, #38bdf8)" }}
            />
          </div>

          <ol className="relative grid gap-6 md:grid-cols-3 md:gap-8">
            {STEPS.map((s, i) => (
              <li key={s.title} data-th-reveal className="flex md:flex-col gap-4 md:gap-5">
                <span
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-mono text-xs font-bold text-[#07070d]"
                  style={{ background: ["#fbbf24", "#f472b6", "#38bdf8"][i] }}
                >
                  0{i + 1}
                </span>
                <div>
                  <p className="text-white font-semibold mb-1">{s.title}</p>
                  <p className="text-sm text-white/40 leading-relaxed max-w-xs">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* ── Classroom games ────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-5">
          <span className="block h-px w-6 bg-white/20" aria-hidden="true" />
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-white/35">
            Interactive classroom apps · in production
          </span>
        </div>
        <div className="grid md:grid-cols-2 gap-4 md:gap-5 mb-4 md:mb-5">
          {CLASSROOM_GAMES.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>

        {/* ── Video + worksheets ─────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-12 gap-4 md:gap-5">
          <LessonVideoCard />
          <WorksheetsCard />
        </div>
      </div>
    </section>
  );
}
