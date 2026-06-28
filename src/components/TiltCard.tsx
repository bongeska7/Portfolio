"use client";

/**
 * @file src/components/TiltCard.tsx
 *
 * 3D tilt / parallax hover wrapper.
 *
 * Wraps any content and applies a subtle 3-D perspective tilt on mousemove,
 * with a smooth spring-back on mouseleave.
 *
 * ## How it works
 * - Normalises the cursor position within the element to a –0.5 … 0.5 range.
 * - Maps X → rotateY, Y → rotateX (inverted for natural feel).
 * - Applies transforms via GSAP using `transformPerspective` so the 3-D
 *   depth is self-contained and does not require a CSS `perspective` ancestor.
 * - Safe to nest inside GSAP-animated containers (like the credential deck)
 *   because GSAP's `overwrite: "auto"` resolves any conflicting tweens.
 *
 * ## Usage
 * ```tsx
 * <TiltCard maxTilt={6} scale={1.03} className="w-full h-full">
 *   <CardFace ... />
 * </TiltCard>
 *
 * // For a pinned image panel — gentler tilt, no scale:
 * <TiltCard maxTilt={4} scale={1.0} className="absolute inset-0">
 *   {imageStack}
 * </TiltCard>
 * ```
 */

import { useRef, useEffect, type ReactNode, type CSSProperties } from "react";
import { gsap } from "@/lib/gsap";

interface TiltCardProps {
  children: ReactNode;
  /**
   * Maximum rotation angle in degrees, applied symmetrically to X and Y axes.
   * @default 7
   */
  maxTilt?: number;
  /**
   * Scale multiplier applied on hover. 1.0 = no size change.
   * @default 1.03
   */
  scale?: number;
  className?: string;
  style?: CSSProperties;
}

export default function TiltCard({
  children,
  maxTilt = 7,
  scale   = 1.03,
  className,
  style,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();

      // Normalised position: –0.5 (left/top) … +0.5 (right/bottom)
      const xN = (e.clientX - rect.left)  / rect.width  - 0.5;
      const yN = (e.clientY - rect.top)   / rect.height - 0.5;

      gsap.to(el, {
        rotateY:           xN * maxTilt * 2,
        rotateX:          -yN * maxTilt * 2,   // invert Y for natural tilt direction
        scale,
        transformPerspective: 1100,             // self-contained depth, no parent needed
        duration: 0.45,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const onLeave = () => {
      gsap.to(el, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.75,
        ease: "power3.out",
        overwrite: "auto",
      });
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);

    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      gsap.killTweensOf(el);
    };
  }, [maxTilt, scale]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        willChange: "transform",
        // Ensure children with 3-D transforms respect this element's perspective
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </div>
  );
}
