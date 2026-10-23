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
 * ## Active-section tracking
 *   On scroll (rAF-throttled) the dock finds the last section whose top has
 *   passed 45% of the viewport height. Unlike intersection *ratios*, this
 *   stays correct for very tall sections (pinned runways, long grids) and for
 *   the zero-height contact sentinel, which crosses the line once the footer
 *   is mostly revealed.
 *
 * ## Auto-hide
 *   The dock is hidden while the user is still near the top of the hero so it
 *   never overlaps the hero text on first load, and fades in once they scroll.
 *
 * ## Mobile
 *   On small screens (< 640 px) the label text is hidden and only the icon
 *   dot remains, keeping the pill compact enough to not block content.
 */

import { useEffect, useState, useCallback } from "react";
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
  { id: "hero",             label: "Intro",       icon: "✦" },
  { id: "experience",       label: "Work",        icon: "◆" },
  { id: "projects",         label: "Projects",    icon: "◈" },
  { id: "teacherhelper",    label: "Teaching",    icon: "✎" },
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
  const [activeId, setActiveId] = useState<string>("hero");

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

  // ── Active section + visibility, measured on scroll ──────────────────────
  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const line = window.innerHeight * 0.45;

      let current = NAV_ITEMS[0]!.id;
      for (const { id } of NAV_ITEMS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }

      setActiveId(current);
      setVisible(window.scrollY > window.innerHeight * 0.35);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
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
