"use client";

/**
 * @file src/components/MagnetButton.tsx
 *
 * Magnetic hover wrapper.
 *
 * Wraps any child element (button, link, icon) and gives it a magnetic
 * attraction effect:
 *   • An invisible detection zone extends `attractRadius` px beyond the
 *     element's visual bounds in every direction.
 *   • When the cursor enters the zone and moves, the inner element slides
 *     toward the cursor — by `strength` × the distance from its centre.
 *   • On cursor leave the element springs back with an elastic ease,
 *     giving it a satisfying snapping-back feel.
 *
 * ## Layout trick
 * The outer container uses `padding: attractRadius` to widen the hover
 * catchment area, and `margin: -attractRadius` to cancel the space impact
 * on surrounding elements. This keeps siblings in their natural positions.
 *
 * ## Usage
 * ```tsx
 * <MagnetButton>
 *   <a href="#projects" className="...">See my work</a>
 * </MagnetButton>
 *
 * // Custom pull strength and radius for a nav icon:
 * <MagnetButton strength={0.55} attractRadius={90}>
 *   <GitHubIcon />
 * </MagnetButton>
 * ```
 */

import { useRef, useEffect, type ReactNode, type CSSProperties } from "react";
import { gsap } from "@/lib/gsap";

interface MagnetButtonProps {
  children: ReactNode;
  /**
   * How far beyond the element's visual edge the cursor is still attracted (px).
   * @default 65
   */
  attractRadius?: number;
  /**
   * Fraction of the cursor-to-centre delta that the element moves.
   * 0.4 = the element slides 40 % of the distance. Range: 0.1 – 0.8.
   * @default 0.4
   */
  strength?: number;
  className?: string;
  style?: CSSProperties;
}

export default function MagnetButton({
  children,
  attractRadius = 35,
  strength = 0.15,
  className,
  style,
}: MagnetButtonProps) {
  /** The invisible, oversized detection zone */
  const containerRef = useRef<HTMLDivElement>(null);
  /** The element that visually moves */
  const magnetRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const magnet    = magnetRef.current;
    if (!container || !magnet) return;

    const onMove = (e: MouseEvent) => {
      // Use the magnet's own bounding box as the reference centre so that
      // the pull target tracks the element's *current* (possibly displaced) position.
      const mr = magnet.getBoundingClientRect();
      const cx = mr.left + mr.width  / 2;
      const cy = mr.top  + mr.height / 2;

      gsap.to(magnet, {
        x: (e.clientX - cx) * strength,
        y: (e.clientY - cy) * strength,
        duration: 0.35,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const onLeave = () => {
      // Elastic spring-back for a tactile snap
      gsap.to(magnet, {
        x: 0,
        y: 0,
        duration: 0.9,
        ease: "elastic.out(1, 0.45)",
        overwrite: "auto",
      });
    };

    container.addEventListener("mousemove", onMove);
    container.addEventListener("mouseleave", onLeave);

    return () => {
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseleave", onLeave);
      gsap.killTweensOf(magnet);
    };
  }, [strength]);

  return (
    <div
      ref={containerRef}
      style={{
        display:        "inline-flex",
        alignItems:     "center",
        justifyContent: "center",
        // Expand the hover-catchment area…
        padding: attractRadius,
        // …and cancel its layout impact on siblings
        margin: -attractRadius,
      }}
    >
      <div ref={magnetRef} className={className} style={style}>
        {children}
      </div>
    </div>
  );
}
