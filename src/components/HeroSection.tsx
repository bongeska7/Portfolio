"use client";

/**
 * @file src/components/HeroSection.tsx
 *
 * Animated hero section for the portfolio home page.
 *
 * This is a "use client" component so it can co-ordinate GSAP entrance
 * animations for every hero element. The timeline is carefully delayed to
 * start just as the FluidEffects curtain finishes lifting (~1.35 s total):
 *
 *   1.00 s — Badge fades + slides up
 *   1.10 s — "Omar" chars begin staggering up  (via TextReveal)
 *   1.45 s — Gradient "Ahmad" word fades up
 *   1.65 s — Tagline slides up
 *   1.80 s — CTA buttons stagger in
 *   2.10 s — Scroll cue fades in
 *
 * The two CTA links are wrapped in <MagnetButton> so they physically
 * attract toward the cursor on hover.
 */

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import TextReveal from "@/components/TextReveal";
import MagnetButton from "@/components/MagnetButton";

export default function HeroSection() {
  const profileRef   = useRef<HTMLDivElement>(null);
  const badgeRef     = useRef<HTMLDivElement>(null);
  const ahmadRef     = useRef<HTMLSpanElement>(null);
  const taglineRef   = useRef<HTMLParagraphElement>(null);
  const cta1Ref      = useRef<HTMLDivElement>(null);
  const cta2Ref      = useRef<HTMLDivElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Profile image entrance
      tl.from(profileRef.current, { scale: 0.85, opacity: 0, duration: 0.70 }, 0.85);
      // Badge
      tl.from(badgeRef.current,   { y: 18, opacity: 0, duration: 0.55 }, 1.05);
      // Gradient word "Ahmad" (TextReveal handles "Omar" independently)
      tl.from(ahmadRef.current,   { y: 38, opacity: 0, duration: 0.80 }, 1.45);
      // Tagline
      tl.from(taglineRef.current, { y: 22, opacity: 0, duration: 0.65 }, 1.65);
      // CTA buttons with a small inter-button stagger
      tl.from(cta1Ref.current,    { y: 18, opacity: 0, duration: 0.55 }, 1.82);
      tl.from(cta2Ref.current,    { y: 18, opacity: 0, duration: 0.55 }, 1.94);
      // Scroll cue last
      tl.from(scrollCueRef.current, { opacity: 0, duration: 0.5 }, 2.2);
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="hero"
      aria-label="Introduction"
      className="
        relative flex flex-col items-center justify-center
        min-h-screen px-6 text-center overflow-hidden
        bg-[#07070d]
      "
    >
      {/* ── Ambient gradient blobs ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 0%,   rgba(124,58,237,0.18) 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 80% 80%,  rgba(8,145,178,0.12)  0%, transparent 60%),
            radial-gradient(ellipse 30% 25% at 10% 70%,  rgba(16,185,129,0.07) 0%, transparent 55%)
          `,
        }}
      />

      {/* ── Subtle grid ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.032]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* ── Hero content ── */}
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">

        {/* Profile Image with glowing background ring */}
        <div ref={profileRef} className="relative group mb-7 select-none">
          {/* Outer blur glow ring (expands and glows brighter on hover) */}
          <div
            className="
              absolute inset-0 rounded-full
              bg-gradient-to-tr from-violet-500 to-cyan-500
              opacity-25 blur-md group-hover:opacity-45 group-hover:blur-lg
              scale-95 group-hover:scale-105
              transition-all duration-500 ease-out
            "
            aria-hidden="true"
          />
          {/* Circular Frame */}
          <div
            className="
              relative w-24 h-24 rounded-full overflow-hidden
              border border-white/10 bg-[#0d0d1e]
              shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]
              group-hover:border-violet-500/30
              group-hover:scale-[1.02]
              transition-all duration-500 ease-out
            "
          >
            <Image
              src="/images/Me.png"
              alt="Omar Aziz Ahmad Profile Portrait"
              width={96}
              height={96}
              className="object-cover w-full h-full"
              priority
            />
          </div>
        </div>

        {/* Status badge */}
        <div
          ref={badgeRef}
          className="
            inline-flex items-center gap-2
            px-4 py-2 mb-8 rounded-full
            border border-violet-500/30 bg-violet-500/10
            text-xs font-mono tracking-widest text-violet-300 uppercase
          "
        >
          <span
            className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"
            aria-hidden="true"
          />
          Product Designer &middot; AI Engineer &middot; Systems Thinker
        </div>

        {/* Heading — "Omar" splits char-by-char; "Ahmad" fades as a gradient word */}
        <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold tracking-tight leading-none mb-4 text-white">
          {/*
           * TextReveal is "use client" and handles its own GSAP animation.
           * It begins at delay={1.1} which aligns with the timeline above.
           */}
          <TextReveal as="span" delay={1.1} stagger={0.055} splitBy="chars">
            Omar
          </TextReveal>

          {/* Non-breaking space between the two words */}
          <span aria-hidden="true">&nbsp;</span>

          {/* Gradient word — animated by the useEffect timeline above */}
          <span
            ref={ahmadRef}
            className="text-transparent bg-clip-text"
            style={{
              backgroundImage: "linear-gradient(135deg, #7c3aed 0%, #0891b2 100%)",
            }}
          >
            Ahmad
          </span>
        </h1>

        {/* Tagline */}
        <p
          ref={taglineRef}
          className="mt-6 text-lg sm:text-xl text-white/50 max-w-2xl leading-relaxed font-light"
        >
          Architecting high-fidelity digital systems and intelligent interfaces at the intersection of design, artificial intelligence, and systems engineering.
        </p>

        {/* CTAs */}
        <div
          className="mt-10 flex flex-col sm:flex-row gap-1 justify-center items-center"
          role="group"
          aria-label="Primary calls to action"
        >
          <div ref={cta1Ref}>
            <MagnetButton attractRadius={40} strength={0.18}>
              <a
                href="#projects"
                aria-label="View my featured projects"
                className="
                  block px-7 py-3.5 rounded-xl font-semibold text-sm
                  bg-violet-600 hover:bg-violet-500 text-white
                  transition-colors duration-300 shadow-lg shadow-violet-600/30
                "
              >
                See my work
              </a>
            </MagnetButton>
          </div>

          <div ref={cta2Ref}>
            <MagnetButton attractRadius={40} strength={0.18}>
              <a
                href="#contact-sentinel"
                aria-label="Jump to the contact section"
                className="
                  block px-7 py-3.5 rounded-xl font-semibold text-sm
                  border border-white/15 hover:border-white/30
                  text-white/70 hover:text-white
                  transition-all duration-300
                "
              >
                Get in touch
              </a>
            </MagnetButton>
          </div>
        </div>
      </div>

      {/* ── Scroll cue ── */}
      <div
        ref={scrollCueRef}
        aria-hidden="true"
        className="
          absolute bottom-10 left-1/2 -translate-x-1/2
          flex flex-col items-center gap-2 text-white/20
        "
      >
        <span className="font-mono text-[10px] tracking-widest uppercase">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-white/20 to-transparent animate-pulse" />
      </div>
    </section>
  );
}
