"use client";

/**
 * @file src/components/FluidEffects.tsx
 *
 * Page-load curtain reveal — mount once in the root layout.
 *
 * Timeline (total ≈ 1.35 s):
 *   0.00 – 0.50 s  Gradient accent bar sweeps left → right  (signals "ready")
 *   0.50 – 0.65 s  Brief pause (the bar shines at full width)
 *   0.65 – 1.35 s  Dark overlay lifts upward, revealing the page
 *
 * The 1.35 s total matches the `delay={1.1}` used on the hero TextReveal so
 * that text characters begin animating just as the curtain fully clears.
 */

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

export default function FluidEffects() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const barRef     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    const bar     = barRef.current;
    if (!overlay || !bar) return;

    const tl = gsap.timeline({ defaults: { ease: "power3.inOut" } });

    // 1. Progress bar sweeps across
    tl.from(bar, {
      scaleX: 0,
      duration: 0.5,
      transformOrigin: "left center",
    })
    // 2. Pause at full width
    .to({}, { duration: 0.15 })
    // 3. Curtain lifts upward
    .to(overlay, {
      yPercent: -100,
      duration: 0.85,
      ease: "power4.inOut",
      // Once offscreen, remove from paint tree entirely
      onComplete: () => { overlay.style.display = "none"; },
    });

    return () => { tl.kill(); };
  }, []);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] bg-[#07070d] flex flex-col justify-end pointer-events-none"
      aria-hidden="true"
      role="presentation"
    >
      {/* Gradient accent bar */}
      <div
        ref={barRef}
        className="h-[3px] w-full"
        style={{
          background:  "linear-gradient(90deg, #7c3aed 0%, #0891b2 55%, #10b981 100%)",
          boxShadow:   "0 0 24px rgba(124,58,237,0.9), 0 0 8px rgba(8,145,178,0.6)",
        }}
      />
    </div>
  );
}
