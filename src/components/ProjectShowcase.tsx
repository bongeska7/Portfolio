"use client";

/**
 * @file src/components/ProjectShowcase.tsx
 *
 * Pinned Split-Screen Project Showcase
 * ─────────────────────────────────────
 * Desktop layout (≥ 768px):
 *   • 300vh "runway" outer container gives scroll room.
 *   • Left column (50vw × 100vh) is pinned by GSAP ScrollTrigger —
 *     it stays locked as the user scrolls through the runway.
 *   • Right column (50vw) scrolls naturally with 3 × 100vh panels.
 *   • As each right panel enters the centre of the viewport,
 *     the pinned left image cross-fades + scales to the matching project.
 *   • All ScrollTrigger instances are created inside gsap.matchMedia()
 *     so they are automatically killed and re-created on breakpoint changes.
 *
 * Mobile layout (< 768px):
 *   • Columns stack vertically — no pinning.
 *   • Each panel shows its own image inline (no cross-fade needed).
 *   • Clean, accessible standard scroll.
 *
 * Animation is driven through the GSAP ticker ↔ Lenis bridge set up in
 * SmoothScrollContext, so scroll position is always frame-perfect.
 */

import { useEffect, useRef, useCallback, useState } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import TiltCard from "@/components/TiltCard";
import TextReveal from "@/components/TextReveal";
import { PROJECTS } from "@/data/portfolio";


// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function ProjectShowcase() {
  const runwayRef  = useRef<HTMLDivElement>(null);
  const leftRef    = useRef<HTMLDivElement>(null);
  /** One ref per layered image div inside the left panel */
  const imagesRef  = useRef<(HTMLDivElement | null)[]>([]);
  /** One ref per right-column content panel */
  const panelsRef  = useRef<(HTMLElement | null)[]>([]);
  const activeIdxRef = useRef<number>(-1); // -1 = nothing activated yet

  // State to track current image carousel index for each project
  const [currentImageIdxs, setCurrentImageIdxs] = useState<number[]>(PROJECTS.map(() => 0));
  // State to track currently active project (used to show/hide controls)
  const [activeProjectIdx, setActiveProjectIdx] = useState<number>(0);

  // Next image helper
  const nextImage = useCallback((projectIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIdxs((prev) => {
      const next = [...prev];
      const project = PROJECTS[projectIdx];
      if (project && project.images) {
        next[projectIdx] = (next[projectIdx] + 1) % project.images.length;
      }
      return next;
    });
  }, []);

  // Prev image helper
  const prevImage = useCallback((projectIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIdxs((prev) => {
      const next = [...prev];
      const project = PROJECTS[projectIdx];
      if (project && project.images) {
        next[projectIdx] =
          (next[projectIdx] - 1 + project.images.length) % project.images.length;
      }
      return next;
    });
  }, []);

  // ── Image cross-fade ────────────────────────────────────────────────────
  const activateImage = useCallback((index: number) => {
    // Guard against redundant triggers on the same index
    if (activeIdxRef.current === index) return;
    activeIdxRef.current = index;
    setActiveProjectIdx(index);

    imagesRef.current.forEach((el, i) => {
      if (!el) return;
      const isActive = i === index;
      gsap.to(el, {
        opacity: isActive ? 1 : 0,
        scale:   isActive ? 1 : 1.06,
        duration: 0.9,
        ease: "power3.inOut",
        overwrite: "auto",
      });
    });
  }, []);

  // ── GSAP setup ─────────────────────────────────────────────────────────
  useEffect(() => {
    // Wrap in gsap.context() for clean reversion on unmount
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // ── Desktop (≥ 768px): pinned split-screen ──────────────────────────
      mm.add("(min-width: 768px)", () => {
        // Set runway height dynamically based on the number of projects
        gsap.set(runwayRef.current, { height: `${PROJECTS.length * 100}vh` });

        // Initialise: first image visible, others hidden
        imagesRef.current.forEach((el, i) => {
          if (!el) return;
          gsap.set(el, { opacity: i === 0 ? 1 : 0, scale: i === 0 ? 1 : 1.06 });
        });
        activeIdxRef.current = -1; // allow activateImage(0) to run
        activateImage(0);

        // ① Pin the left visual column for the full scroll runway.
        //    pinSpacing: false → the right column already occupies the height,
        //    so we don't need GSAP to insert extra whitespace.
        ScrollTrigger.create({
          id: "showcase-pin",
          trigger: runwayRef.current,
          start: "top top",
          end: "bottom bottom",
          pin: leftRef.current,
          pinSpacing: false,
          anticipatePin: 1,         // pre-paint for jank-free start
        });

        // ② Per-panel image-switch triggers
        panelsRef.current.forEach((panel, i) => {
          if (!panel) return;
          ScrollTrigger.create({
            id: `showcase-panel-${i}`,
            trigger: panel,
            // Fire when the panel's top crosses 55% of viewport height
            start: "top 55%",
            // Release when the panel's bottom crosses 45%
            end: "bottom 45%",
            onEnter:     () => activateImage(i),
            onEnterBack: () => activateImage(i),
          });
        });

        // Return value is a cleanup fn — gsap.matchMedia calls it when
        // the breakpoint is no longer matched.
        return () => {
          activeIdxRef.current = -1;
          gsap.set(runwayRef.current, { clearProps: "height" });
        };
      });

      // ── Mobile (< 768px): stacked, no pinning ───────────────────────────
      mm.add("(max-width: 767px)", () => {
        // Make every image fully visible (each is shown inside its panel)
        imagesRef.current.forEach((el) => {
          if (el) gsap.set(el, { opacity: 1, scale: 1 });
        });
        return () => {};
      });
    }, runwayRef); // scope to the runway element

    return () => ctx.revert(); // kills all ScrollTriggers and tweens
  }, [activateImage]);

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <section
      ref={runwayRef}
      id="projects"
      aria-label="Featured projects"
      /* Dynamically set to PROJECTS.length * 100vh on desktop by GSAP, auto height on mobile */
      className="relative md:flex bg-[#07070d]"
    >

      {/* ═══════════════════════════════════════════════════════════════════
          LEFT COLUMN — Pinned visual panel (desktop only)
          Hidden on mobile; each panel renders its own inline image instead.
      ═══════════════════════════════════════════════════════════════════ */}
      <div
        ref={leftRef}
        aria-hidden="true"
        className="hidden md:block w-1/2 h-screen relative overflow-hidden bg-[#050508]"
      >
        {/*
         * TiltCard wraps the image content (not leftRef itself which is GSAP-pinned).
         * On hover the whole visual panel tilts subtly toward the cursor —
         * a 4° max gives depth without conflicting with the pin transform.
         */}
        <TiltCard maxTilt={4} scale={1.0} className="absolute inset-0">
          {/* Image layer stack — each image is absolute and cross-faded by GSAP */}
          {PROJECTS.map((project, i) => (
            <div
              key={project.id}
              ref={(el) => { imagesRef.current[i] = el; }}
              className="absolute inset-0"
              /* Initial state set via GSAP in useEffect, but provide CSS defaults
                 so the element is invisible before hydration */
              style={{ opacity: 0, willChange: "opacity, transform" }}
            >
              {/* Inner images carousel for this project */}
              {project.images.map((imgUrl, imgI) => (
                <div
                  key={imgUrl}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                    imgI === currentImageIdxs[i]
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95 pointer-events-none"
                  }`}
                >
                  <Image
                    src={imgUrl}
                    alt={`${project.title} — project screenshot ${imgI + 1}`}
                    fill
                    sizes="50vw"
                    className="object-cover"
                    priority={i === 0 && imgI === 0}
                    quality={90}
                  />
                </div>
              ))}

              {/* Per-project colour overlay for identity */}
              <div
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                  background: `
                    linear-gradient(135deg, ${project.accent}28 0%, transparent 55%),
                    linear-gradient(to top, #07070d 0%, transparent 40%)
                  `,
                }}
              />
            </div>
          ))}
        </TiltCard>

        {/* Floating next/prev carousel navigation buttons */}
        {PROJECTS[activeProjectIdx]?.images?.length > 1 && (
          <div className="absolute inset-y-0 inset-x-6 flex items-center justify-between pointer-events-none z-30">
            <button
              type="button"
              onClick={(e) => prevImage(activeProjectIdx, e)}
              className="
                pointer-events-auto
                w-12 h-12 rounded-full
                flex items-center justify-center
                bg-black/50 hover:bg-black/80 text-white/70 hover:text-white
                border border-white/10 hover:border-white/20
                shadow-xl backdrop-blur-md
                hover:scale-110 active:scale-90
                transition-all duration-300
                focus:outline-none focus:ring-2 focus:ring-violet-500
                cursor-pointer
              "
              aria-label="Previous screenshot"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => nextImage(activeProjectIdx, e)}
              className="
                pointer-events-auto
                w-12 h-12 rounded-full
                flex items-center justify-center
                bg-black/50 hover:bg-black/80 text-white/70 hover:text-white
                border border-white/10 hover:border-white/20
                shadow-xl backdrop-blur-md
                hover:scale-110 active:scale-90
                transition-all duration-300
                focus:outline-none focus:ring-2 focus:ring-violet-500
                cursor-pointer
              "
              aria-label="Next screenshot"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}

        {/* Carousel indicator dots */}
        {PROJECTS[activeProjectIdx]?.images?.length > 1 && (
          <div className="absolute bottom-8 right-8 z-30 flex gap-2 pointer-events-none" aria-hidden="true">
            {PROJECTS[activeProjectIdx].images.map((_, dotIdx) => (
              <span
                key={dotIdx}
                className={`
                  block w-1.5 h-1.5 rounded-full transition-all duration-300
                  ${dotIdx === currentImageIdxs[activeProjectIdx]
                    ? "w-4 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                    : "bg-white/35"
                  }
                `}
              />
            ))}
          </div>
        )}

        {/* Static decorative corner label */}
        <div className="absolute bottom-8 left-8 z-10 flex items-center gap-3">
          <span className="block w-6 h-px bg-white/20" />
          <span className="font-mono text-[11px] tracking-[0.2em] text-white/25 uppercase select-none">
            Featured Work
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          RIGHT COLUMN — Scrolling story panels
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="w-full md:w-1/2 flex flex-col">
        {PROJECTS.map((project, i) => (
          <article
            key={project.id}
            ref={(el) => { panelsRef.current[i] = el; }}
            /* Each panel is exactly 100vh tall on desktop */
            className="
              relative flex flex-col justify-center
              min-h-screen
              px-8 sm:px-12 md:px-14 lg:px-20
              py-20 md:py-0
              border-b border-white/[0.04]
              overflow-hidden
            "
          >
            {/* Ambient background glow tied to project accent colour */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse 60% 50% at 80% 50%, ${project.accent}18, transparent 70%)`,
              }}
            />

            {/* ── Mobile-only inline image carousel ── */}
            <div className="block md:hidden relative w-full h-56 mb-8 rounded-2xl overflow-hidden shadow-2xl">
              {project.images.map((imgUrl, imgI) => (
                <div
                  key={imgUrl}
                  className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                    imgI === currentImageIdxs[i]
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95 pointer-events-none"
                  }`}
                >
                  <Image
                    src={imgUrl}
                    alt={`${project.title} screenshot ${imgI + 1}`}
                    fill
                    sizes="100vw"
                    className="object-cover"
                    quality={85}
                  />
                </div>
              ))}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: `linear-gradient(to bottom, transparent 50%, ${project.accent}30)` }}
              />

              {/* Mobile next/prev controls overlay */}
              {project.images.length > 1 && (
                <>
                  <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none">
                    <button
                      type="button"
                      onClick={(e) => prevImage(i, e)}
                      className="
                        pointer-events-auto
                        w-8 h-8 rounded-full
                        flex items-center justify-center
                        bg-black/60 text-white/80
                        border border-white/10
                        shadow-md backdrop-blur-sm
                        active:scale-90
                        transition-all duration-200
                        cursor-pointer
                      "
                      aria-label="Previous screenshot"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={(e) => nextImage(i, e)}
                      className="
                        pointer-events-auto
                        w-8 h-8 rounded-full
                        flex items-center justify-center
                        bg-black/60 text-white/80
                        border border-white/10
                        shadow-md backdrop-blur-sm
                        active:scale-90
                        transition-all duration-200
                        cursor-pointer
                      "
                      aria-label="Next screenshot"
                    >
                      ›
                    </button>
                  </div>
                  {/* Mobile Dots */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none" aria-hidden="true">
                    {project.images.map((_, dotIdx) => (
                      <span
                        key={dotIdx}
                        className={`
                          block w-1.5 h-1.5 rounded-full transition-all duration-300
                          ${dotIdx === currentImageIdxs[i] ? "w-3.5 bg-white" : "bg-white/40"}
                        `}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* ── Year + sequence badge ── */}
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <span
                className="block h-px w-8 flex-shrink-0"
                style={{ backgroundColor: project.accent }}
              />
              <span
                className="font-mono text-xs tracking-[0.22em] uppercase"
                style={{ color: `${project.accent}99` }}
              >
                {project.year} &mdash; 0{i + 1}
              </span>
              <span
                className="ml-auto font-mono text-xs tracking-wider uppercase px-2 py-0.5 rounded-full border"
                style={{
                  borderColor: `${project.accent}30`,
                  color: `${project.accent}80`,
                  backgroundColor: project.accentDim,
                }}
              >
                {project.role}
              </span>
            </div>

            {/* ── Project title ── */}
            <h3
              className="relative z-10 font-bold tracking-tight text-white leading-none mb-3"
              style={{
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                textShadow: `0 0 80px ${project.accent}50`,
              }}
            >
              {/* Scroll-triggered word reveal for each project title */}
              <TextReveal as="span" splitBy="words" triggerOnScroll stagger={0.06}>
                {project.title}
              </TextReveal>
            </h3>

            {/* ── Tagline ── */}
            <p
              className="relative z-10 text-base sm:text-lg font-medium mb-5 tracking-wide"
              style={{ color: project.accent }}
            >
              {project.tagline}
            </p>

            {/* ── Description ── */}
            <p className="relative z-10 text-white/45 text-sm sm:text-base leading-relaxed max-w-prose mb-8">
              {project.description}
            </p>

            {/* ── Tech stack pills ── */}
            <div className="relative z-10 flex flex-wrap gap-2">
              {project.tech.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 text-[11px] font-mono tracking-wider rounded-full border transition-colors duration-300"
                  style={{
                    borderColor: `${project.accent}35`,
                    color: `${project.accent}cc`,
                    backgroundColor: project.accentDim,
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* ── View project link ── */}
            <div className="relative z-10 mt-10">
              <a
                href={project.link || "#"}
                target={project.link ? "_blank" : undefined}
                rel={project.link ? "noopener noreferrer" : undefined}
                className="group inline-flex items-center gap-3 text-sm font-semibold tracking-wide transition-all duration-300"
                style={{ color: project.accent }}
                aria-label={`View ${project.title} project details`}
              >
                <span className="underline underline-offset-4 decoration-current/30 group-hover:decoration-current/80 transition-all duration-300">
                  View Project
                </span>
                {/* Animated arrow */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="translate-x-0 group-hover:translate-x-1.5 transition-transform duration-300"
                  aria-hidden="true"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </a>
            </div>

            {/* ── Vertical progress indicator (desktop only) ── */}
            <div
              className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 flex-col gap-2 z-10"
              aria-hidden="true"
            >
              {PROJECTS.map((_, dotIdx) => (
                <span
                  key={dotIdx}
                  className="block rounded-full transition-all duration-500"
                  style={{
                    width:  dotIdx === i ? "6px"   : "4px",
                    height: dotIdx === i ? "24px"  : "4px",
                    backgroundColor: dotIdx === i ? project.accent : "rgba(255,255,255,0.15)",
                  }}
                />
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
