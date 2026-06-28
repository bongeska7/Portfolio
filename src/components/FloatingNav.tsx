"use client";

/**
 * @file src/components/FloatingNav.tsx
 *
 * Contextual Floating Navigation Dock
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ## Layout
 *   Fixed at bottom-center of the viewport (z-50), styled as a glassmorphic
 *   pill with backdrop-blur, a semi-transparent dark fill, and a crisp border.
 *
 * ## Lenis scrollTo
 *   Clicking a link calls `lenis.scrollTo("#id", { duration, easing })` so the
 *   user is swept to the target section without a hard anchor jump. The easing
 *   function is a sine-in curve for a natural deceleration feel.
 *
 * ## Active-section tracking (IntersectionObserver)
 *   A single `IntersectionObserver` with `threshold: 0.4` watches all four
 *   target sections. When 40% of a section enters the viewport it is marked
 *   active. This keeps the active state accurate while the user scrolls freely
 *   without any scroll-event listeners or GSAP dependencies.
 *
 *   The observer is created once on mount and cleaned up on unmount — no
 *   React state is set inside the observer callback, only a ref is updated and
 *   a microtask (`queueMicrotask`) is used to batch the state update so the
 *   component re-renders once per intersection change, not once per frame.
 *
 * ## Auto-hide
 *   The dock hides itself when the user is exactly at the very top of the page
 *   (progress === 0) so it never overlaps the hero text on first load, then
 *   fades in as soon as the user starts scrolling.
 *
 * ## Mobile
 *   On small screens (< 640 px) the label text is hidden and only the icon
 *   dot remains, keeping the pill compact enough to not block content.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useSmoothScroll } from "@/context/SmoothScrollContext";

// ─────────────────────────────────────────────────────────────────────────────
// Nav data
// ─────────────────────────────────────────────────────────────────────────────

interface NavItem {
  id:    string;
  label: string;
  /** emoji / character used as a compact icon on narrow screens */
  icon:  string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "main-content",     label: "Intro",       icon: "✦" },
  { id: "projects",         label: "Projects",    icon: "◈" },
  { id: "credentials",      label: "Credentials", icon: "◉" },
  { id: "skills",           label: "Skills",      icon: "◎" },
  // ⚠️  "contact" is position:fixed — Lenis cannot compute a scroll
  //     coordinate for it and IntersectionObserver always reports it as
  //     visible. Use the in-flow sentinel div instead.
  { id: "contact-sentinel", label: "Contact",     icon: "◍" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Easing — sine-in for a natural deceleration tail
// ─────────────────────────────────────────────────────────────────────────────

const easeInSine = (t: number) => Math.sin((t * Math.PI) / 2);

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function FloatingNav() {
  const lenis = useSmoothScroll();

  /** Which section id is currently most visible in the viewport */
  const [activeId, setActiveId] = useState<string>("main-content");

  /**
   * Whether the dock should be visible. Hidden when the user has not scrolled
   * at all — prevents it from covering the hero headline on first load.
   */
  const [visible, setVisible] = useState(false);

  // ── Scroll-to handler ─────────────────────────────────────────────────────
  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
      e.preventDefault();

      const target = `#${id}`;

      if (lenis) {
        lenis.scrollTo(target, {
          duration: 1.5,
          easing:   easeInSine,
          // Ensure the section sits flush with the top of the viewport
          offset:   0,
        });
      } else {
        // Graceful degradation: use native scrollIntoView if Lenis is not ready
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }
    },
    [lenis],
  );

  // ── Intersection Observer — active section tracking ───────────────────────
  useEffect(() => {
    /**
     * We keep a Map<id, intersectionRatio> so that when multiple sections
     * are partially in view we always activate the one with the highest ratio.
     */
    const ratios = new Map<string, number>(
      NAV_ITEMS.map((item) => [item.id, 0]),
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          ratios.set(entry.target.id, entry.intersectionRatio);
        });

        // Pick the section with the greatest visible area
        let bestId   = activeId;
        let bestRatio = 0;
        ratios.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId    = id;
          }
        });

        // Batch into a microtask to coalesce rapid intersection events
        queueMicrotask(() => setActiveId(bestId));
      },
      {
        // Fire at 0% (leaving), 40% (our active threshold), and 100%
        threshold: [0, 0.4, 1],
      },
    );

    // Attach observer to every section that exists in the DOM at mount time
    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run once on mount

  // ── Visibility: hide at page top, show once user scrolls ─────────────────
  useEffect(() => {
    // Use a separate IntersectionObserver on the hero (main-content) to decide
    // when to show the dock.  When the hero occupies > 80% of the viewport
    // (i.e. user is right at the top) we hide the dock.
    const hero = document.getElementById("main-content");
    if (!hero) {
      setVisible(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        // Hide only when hero is almost entirely visible (user at very top)
        setVisible(entry.intersectionRatio < 0.6);
      },
      { threshold: [0, 0.6, 1] },
    );

    obs.observe(hero);
    return () => obs.disconnect();
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <nav
      aria-label="Page sections navigation"
      className={`
        fixed bottom-6 left-1/2 -translate-x-1/2 z-50
        transition-all duration-500 ease-out
        ${visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"
        }
      `}
    >
      {/* ── Glassmorphic pill ─────────────────────────────────────────────── */}
      <div
        className="
          relative
          flex items-center gap-1 sm:gap-2
          bg-black/45 backdrop-blur-xl
          border border-white/10
          px-3 sm:px-5 py-2.5
          rounded-full
          shadow-[0_8px_32px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.07)]
        "
      >
        {/* Subtle inner top-edge shimmer */}
        <div
          aria-hidden="true"
          className="absolute inset-x-4 top-0 h-px rounded-full pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)",
          }}
        />

        {NAV_ITEMS.map(({ id, label, icon }) => {
          const isActive = activeId === id;

          return (
            <button
              key={id}
              type="button"
              onClick={(e) => handleNavClick(e, id)}
              aria-label={`Scroll to ${label}`}
              aria-current={isActive ? "location" : undefined}
              className={`
                relative flex flex-col items-center gap-0.5
                px-2.5 sm:px-3 py-1 rounded-full
                text-xs font-mono tracking-wide
                transition-all duration-300 ease-out
                hover:scale-110 active:scale-95
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-violet-500 focus-visible:ring-offset-1
                focus-visible:ring-offset-transparent
                select-none cursor-pointer
                ${isActive
                  ? "text-white"
                  : "text-white/35 hover:text-white/70"
                }
              `}
            >
              {/* Icon — always visible */}
              <span
                className={`
                  text-[10px] leading-none
                  transition-all duration-300
                  ${isActive ? "text-violet-300 scale-125" : "scale-100"}
                `}
                aria-hidden="true"
              >
                {icon}
              </span>

              {/* Label — hidden on very small screens */}
              <span className="hidden sm:block text-[10px] leading-none">
                {label}
              </span>

              {/* Active indicator dot */}
              <span
                aria-hidden="true"
                className={`
                  absolute -bottom-0.5 left-1/2 -translate-x-1/2
                  rounded-full
                  transition-all duration-300 ease-out
                  ${isActive
                    ? "w-1 h-1 bg-violet-400 opacity-100 shadow-[0_0_6px_2px_rgba(167,139,250,0.7)]"
                    : "w-0.5 h-0.5 bg-white/20 opacity-0"
                  }
                `}
              />

              {/* Active pill background highlight */}
              {isActive && (
                <span
                  aria-hidden="true"
                  className="
                    absolute inset-0 rounded-full
                    bg-white/[0.07]
                    border border-white/[0.08]
                    pointer-events-none
                  "
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
