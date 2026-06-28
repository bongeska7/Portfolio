"use client";

/**
 * @file src/components/CredentialsDeck.tsx
 *
 * 3D Stacking Card Deck — Scroll-Scrubbed
 * ────────────────────────────────────────
 * Desktop (≥ 768px):
 *   • A 250vh runway gives the user vertical scroll room.
 *   • A full-screen viewport div is pinned via GSAP ScrollTrigger
 *     so the deck stays centred while the runway scrolls past.
 *   • Four cards are absolutely stacked inside a perspective container.
 *   • A single scrubbed GSAP timeline drives ALL card motion:
 *       – Each new card rises from below (y: "108%") to centre (y: 0)
 *         with a subtle rotational angle for a physical, deck-like feel.
 *       – Every already-settled card simultaneously scales down, fades,
 *         and rises slightly to create a convincing Z-depth stack.
 *   • The timeline is built programmatically so adding more cards
 *     requires only pushing to the CREDENTIALS array.
 *   • Everything is wrapped in gsap.matchMedia() and a gsap.context()
 *     for bulletproof cleanup on unmount / breakpoint change.
 *
 * Mobile (< 767px):
 *   • The runway collapses to auto-height (no sticky scrolling).
 *   • Cards render as a clean, naturally flowing vertical list.
 *   • No GSAP transforms are applied — all clearProps'd.
 */

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import TextReveal from "@/components/TextReveal";
import TiltCard from "@/components/TiltCard";
import {
  CREDENTIALS,
  SETTLED_ROTATIONS,
  type Credential,
} from "@/data/portfolio";


// ─────────────────────────────────────────────────────────────────────────────
// Helper — per-depth visual state
// ─────────────────────────────────────────────────────────────────────────────


/** Returns the visual state for a card that is `depth` levels below the top. */
function depthState(depth: number) {
  return {
    scale:   Math.max(0.78, 1 - depth * 0.08),
    opacity: Math.max(0.04, 1 - depth * 0.46),
    y:       -depth * 24,          // rise slightly per depth layer (px)
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function CredentialsDeck() {
  const runwayRef   = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  /** Refs for the desktop deck cards only (mobile renders separately, no refs) */
  const cardRefs    = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // ── Desktop: pinned + scrubbed deck ──────────────────────────────────
      mm.add("(min-width: 768px)", () => {
        const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
        const N = cards.length;
        if (N < 2) return;

        // ① Set initial state
        //    Card 0 is the "face" card, already visible at centre.
        //    Cards 1…N-1 start below the viewport, each at its settled angle.
        cards.forEach((card, i) => {
          if (i === 0) {
            gsap.set(card, { y: 0, scale: 1, opacity: 1, rotation: 0 });
          } else {
            gsap.set(card, {
              y: "108%",                       // just off the bottom of the card container
              scale: 1,
              opacity: 1,
              rotation: SETTLED_ROTATIONS[i] ?? 0,
            });
          }
        });

        // ② Single scrubbed timeline pinning the viewport and driving cards
        const tl = gsap.timeline({
          scrollTrigger: {
            id: "deck-scrub",
            trigger: runwayRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.5,               // smooth lag between scroll and animation
            pin: viewportRef.current, // keep the card deck in the viewport
            pinSpacing: false,        // right column fills the 250vh runway
            anticipatePin: 1,         // pre-paint to prevent first-frame pop
          },
        });

        // ③ Build transitions programmatically — one per incoming card
        //    Each transition occupies 1 unit of timeline time.
        //    Total timeline duration = N - 1 units.
        for (let incoming = 1; incoming < N; incoming++) {
          const t = incoming - 1; // timeline position for this segment

          // Incoming card sweeps up to its settled rotation
          tl.to(
            cards[incoming],
            {
              y: 0,
              rotation: SETTLED_ROTATIONS[incoming] ?? 0,
              duration: 1,
              ease: "none", // scrub handles easing externally
            },
            t,
          );

          // Every previously settled card cascades deeper into the stack
          for (let prev = 0; prev < incoming; prev++) {
            const depth = incoming - prev; // 1 = directly under top, 2 = two deep…
            tl.to(
              cards[prev],
              {
                ...depthState(depth),
                duration: 1,
                ease: "none",
              },
              t,
            );
          }
        }

        // Cleanup: strip all inline styles when breakpoint unmatch fires
        return () => {
          gsap.set(cards, { clearProps: "all" });
        };
      });

      // ── Mobile: reset everything to natural flow ──────────────────────────
      mm.add("(max-width: 767px)", () => {
        const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
        gsap.set(cards, { clearProps: "all" });
        return () => {};
      });
    }, runwayRef);

    return () => ctx.revert(); // kills ScrollTrigger instances + all tweens
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <section
      ref={runwayRef}
      id="credentials"
      aria-label="Credentials and gallery"
      className="relative md:h-[250vh] bg-[#07070d]"
    >
      {/* GSAP will pin this div for the full 250vh runway on desktop */}
      <div
        ref={viewportRef}
        className="
          flex flex-col items-center justify-center
          py-20 md:py-0 md:h-screen
          px-4 overflow-hidden
        "
      >
        {/* ── Section header ── */}
        <div className="text-center mb-10 md:mb-14 relative z-50 pointer-events-none">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 mb-5 text-[11px] font-mono tracking-[0.2em] text-white/40 uppercase">
            Credentials &amp; Moments
          </div>
          <h2
            className="font-bold tracking-tight text-white leading-tight mb-3"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)" }}
          >
            {/* Words slide up from below as the section enters the viewport */}
            <TextReveal as="span" splitBy="words" triggerOnScroll stagger={0.07}>
              The Journey,
            </TextReveal>
            {" "}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #7c3aed 0%, #0891b2 100%)" }}
            >
              <TextReveal as="span" splitBy="words" triggerOnScroll stagger={0.07} delay={0.1}>
                Documented
              </TextReveal>
            </span>
          </h2>
          <p className="text-white/35 text-sm md:text-base max-w-xs mx-auto leading-relaxed">
            Certifications earned, competitions entered,&nbsp;and moments captured along the way.
          </p>
        </div>

        {/* ═════════════════════════════════════════════════════════════════
            DESKTOP — perspective card stack (hidden on mobile)
            Cards are absolutely positioned inside a fixed-height container.
            GSAP animates y / scale / opacity / rotation via the refs above.
        ═════════════════════════════════════════════════════════════════ */}
        <div
          aria-hidden="false"
          className="hidden md:block relative"
          style={{
            perspective: "1400px",
            width: "min(90vw, 580px)",
            height: "clamp(270px, 38vh, 360px)",
          }}
        >
          {CREDENTIALS.map((cred, i) => (
            <div
              key={cred.id}
              ref={(el) => { cardRefs.current[i] = el; }}
              className="absolute inset-0 w-full h-full will-change-transform"
              style={{ zIndex: (i + 1) * 10 }}
            >
              <CardFace cred={cred} />
            </div>
          ))}
        </div>

        {/* ═════════════════════════════════════════════════════════════════
            MOBILE — natural flowing vertical list (hidden on desktop)
            No refs, no GSAP — clean accessible scroll.
        ═════════════════════════════════════════════════════════════════ */}
        <div
          className="md:hidden w-full max-w-sm mx-auto flex flex-col gap-5"
          aria-label="Credential cards"
        >
          {CREDENTIALS.map((cred) => (
            /* Fixed height to match the desktop card proportions */
            <div key={cred.id} className="h-[220px] w-full">
              <CardFace cred={cred} />
            </div>
          ))}
        </div>

        {/* Scroll hint — desktop only */}
        <p
          className="hidden md:block mt-12 font-mono text-[10px] tracking-[0.25em] text-white/20 uppercase select-none"
          aria-hidden="true"
        >
          Scroll to reveal
        </p>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CardFace — shared visual used by both desktop and mobile renders
// ─────────────────────────────────────────────────────────────────────────────

function CardFace({ cred }: { cred: Credential }) {
  return (
    /*
     * TiltCard applies a subtle 3-D hover tilt to the entire card face.
     * maxTilt is kept low (5°) to stay physically plausible inside the
     * deck's perspective container; scale stays at 1 to avoid popping
     * out of the stacked layer on desktop.
     */
    <TiltCard
      maxTilt={5}
      scale={1.02}
      className="relative w-full h-full rounded-2xl overflow-hidden select-none"
      style={{
        background: "linear-gradient(145deg, #111120 0%, #0a0a18 100%)",
        boxShadow: `
          0 40px 100px rgba(0,0,0,0.65),
          0 0 0 1px ${cred.accent}20,
          inset 0 1px 0 rgba(255,255,255,0.06)
        `,
      }}
    >
      {/* Background image — low opacity texture */}
      <Image
        src={cred.image}
        alt=""             // decorative; real info is in the text below
        fill
        sizes="(max-width: 767px) 100vw, 580px"
        className="object-cover opacity-35"
        quality={80}
        aria-hidden="true"
      />

      {/* Colour overlays */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(140deg, ${cred.accent}28 0%, transparent 55%),
            linear-gradient(to top, rgba(8,8,18,0.97) 0%, rgba(8,8,18,0.35) 55%, transparent 100%)
          `,
        }}
      />

      {/* Top accent stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
        style={{
          background: `linear-gradient(90deg, ${cred.accent} 0%, ${cred.accent}50 100%)`,
        }}
      />

      {/* Shine gloss effect */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 40%)",
        }}
      />

      {/* Card content */}
      <div className="absolute inset-0 flex flex-col justify-between p-5 md:p-7">
        {/* Top row: badge + type pill */}
        <div className="flex items-start justify-between">
          <span
            className="text-[10px] font-mono tracking-[0.2em] uppercase px-2.5 py-1 rounded-full border"
            style={{
              color:           cred.accent,
              backgroundColor: cred.accentDim,
              borderColor:     `${cred.accent}30`,
            }}
          >
            {cred.type === "certificate" ? "Certificate" : cred.type === "memory" ? "Memory" : "Gallery"}
          </span>
        </div>

        {/* Bottom info block */}
        <div>
          <h3 className="text-white font-bold leading-tight mb-1"
              style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)" }}>
            {cred.title}
          </h3>
          <p
            className="text-sm font-medium mb-2"
            style={{ color: cred.accent }}
          >
            {cred.subtitle}
          </p>
          <p className="text-white/30 text-xs font-mono tracking-wide">
            {cred.meta}
          </p>
        </div>
      </div>
    </TiltCard>
  );
}
