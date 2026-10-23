"use client";

/**
 * @file src/components/TextReveal.tsx
 *
 * Animated text-split reveal component.
 *
 * Renders an HTML element with plain text, then on the client replaces the
 * text with individually-wrapped character or word spans and animates them
 * from `y: "105%"` (hidden below an overflow:hidden clip) to `y: 0`.
 *
 * ## How it works
 *   Each unit (char / word) is wrapped in an **outer** span with
 *   `overflow: hidden` and a **inner** span that GSAP animates vertically.
 *   The clip means no characters are ever visible above/below the baseline —
 *   the slide-up always looks crisp, even at small font sizes.
 *
 * ## Modes
 *   - **Load-time** (`triggerOnScroll={false}`, default):
 *       Starts `delay` seconds after mount. Use for hero headings that
 *       should reveal as the page curtain lifts.
 *   - **Scroll-triggered** (`triggerOnScroll={true}`):
 *       Fires once when the element's top edge reaches 88 % of the viewport
 *       height. Use for section headers and body copy.
 *
 * ## Usage
 * ```tsx
 * // Hero heading — chars, starts 1.1 s after mount
 * <TextReveal as="span" delay={1.1} stagger={0.05}>Omar</TextReveal>
 *
 * // Section heading — words, scroll-triggered
 * <TextReveal as="h2" splitBy="words" triggerOnScroll>The Journey</TextReveal>
 * ```
 *
 * ## Caveats
 * - `children` must be a plain string. Complex JSX children are not supported.
 * - The component performs a direct DOM mutation in `useEffect`, which is safe
 *   after hydration (no mismatch because mutations happen client-side only).
 */

import { useEffect, useRef, type CSSProperties, type ElementType } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

type ValidTag =
  | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  | "p" | "span" | "div" | "li";

interface TextRevealProps {
  /** Plain string content — JSX children are not supported. */
  children: string;
  /** HTML element to render. @default "div" */
  as?: ValidTag;
  className?: string;
  style?: CSSProperties;
  /** Seconds to wait before starting (load-time mode only). @default 0 */
  delay?: number;
  /** Per-unit stagger offset in seconds. @default 0.04 */
  stagger?: number;
  /** Split by individual characters or whole words. @default "chars" */
  splitBy?: "chars" | "words";
  /** Fire when the element enters the viewport instead of on mount. @default false */
  triggerOnScroll?: boolean;
}

/**
 * Returns the element itself or the nearest ancestor (up to 3 levels) that
 * paints a gradient through its text with `background-clip: text`.
 */
function findClipTextHost(el: HTMLElement): HTMLElement | null {
  let node: HTMLElement | null = el;
  for (let depth = 0; node && depth < 4; depth++, node = node.parentElement) {
    const cs = getComputedStyle(node);
    const clip = cs.backgroundClip || cs.getPropertyValue("-webkit-background-clip");
    if (clip === "text" && cs.backgroundImage !== "none") return node;
  }
  return null;
}

export default function TextReveal({
  children,
  as = "div",
  className,
  style,
  delay = 0,
  stagger = 0.04,
  splitBy = "chars",
  triggerOnScroll = false,
}: TextRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof children !== "string") return;

    const originalText = children;

    // ── 1. Build the split DOM structure ─────────────────────────────────
    const units =
      splitBy === "chars" ? [...originalText] : originalText.split(" ");

    // After splitting, hide the span tree from ATs — the aria-label on the
    // parent element carries the full readable string for screen readers.
    el.innerHTML = "";
    el.setAttribute("aria-hidden", "true");

    const innerSpans: HTMLSpanElement[] = [];

    // In char mode, letters of one word share a no-wrap wrapper so lines can
    // only break between words (never "TeacherHelpe / r" on narrow screens).
    let wordBox: HTMLSpanElement | null = null;
    const target = () => {
      if (splitBy !== "chars") return el;
      if (!wordBox) {
        wordBox = document.createElement("span");
        wordBox.style.cssText = "display:inline-block; white-space:nowrap";
        el.appendChild(wordBox);
      }
      return wordBox;
    };

    units.forEach((unit, i) => {
      // Spaces between chars — preserve width without creating clipped spans
      if (splitBy === "chars" && unit === " ") {
        const space = document.createElement("span");
        space.style.cssText = "display:inline-block; width:0.28em";
        el.appendChild(space);
        wordBox = null; // next letter starts a new word
        return;
      }

      // Outer: overflow clip — keeps char hidden below the baseline
      const outer = document.createElement("span");
      outer.style.cssText = [
        "display:inline-block",
        "overflow:hidden",
        "vertical-align:bottom",
        "line-height:inherit",
      ].join(";");

      // Inner: the element GSAP animates
      const inner = document.createElement("span");
      inner.style.cssText = "display:inline-block";
      inner.textContent = unit;
      outer.appendChild(inner);
      target().appendChild(outer);
      innerSpans.push(inner);

      // Natural word spacing for word-split mode
      if (splitBy === "words" && i < units.length - 1) {
        el.appendChild(document.createTextNode(" "));
      }
    });

    // ── 2. Set initial hidden state on the animated inner spans ───────────
    gsap.set(innerSpans, { y: "105%", opacity: 0 });

    // ── 2b. Gradient text support ─────────────────────────────────────────
    // `background-clip: text` on an ancestor does not paint into the
    // transformed inline-block units, so they would render invisible.
    // Copy the gradient onto each unit, sized to the whole phrase and offset
    // by the unit's position so the colours stay continuous across it.
    // The phrase box is the union of the (untransformed) outer clip spans —
    // an inline host's own rect does not line up with inline-block children.
    const gradientHost = findClipTextHost(el);
    const paintGradient = () => {
      if (!gradientHost) return;
      const image = getComputedStyle(gradientHost).backgroundImage;
      const boxes = innerSpans.map((s) => s.parentElement!.getBoundingClientRect());
      const left   = Math.min(...boxes.map((b) => b.left));
      const top    = Math.min(...boxes.map((b) => b.top));
      const width  = Math.max(...boxes.map((b) => b.right))  - left;
      const height = Math.max(...boxes.map((b) => b.bottom)) - top;
      innerSpans.forEach((span, i) => {
        const box = boxes[i]!;
        Object.assign(span.style, {
          backgroundImage:      image,
          backgroundSize:       `${width}px ${height}px`,
          backgroundPosition:   `${left - box.left}px ${top - box.top}px`,
          backgroundRepeat:     "no-repeat",
          backgroundClip:       "text",
          webkitBackgroundClip: "text",
          color:                "transparent",
        });
      });
    };
    paintGradient();
    const resizeObserver = gradientHost ? new ResizeObserver(paintGradient) : undefined;
    if (gradientHost) resizeObserver?.observe(gradientHost);

    // ── 3. Animation function ─────────────────────────────────────────────
    const animate = () => {
      gsap.to(innerSpans, {
        y: 0,
        opacity: 1,
        duration: 0.75,
        stagger,
        delay: triggerOnScroll ? 0 : delay,
        ease: "power3.out",
        overwrite: "auto",
      });
    };

    // ── 4. Trigger ────────────────────────────────────────────────────────
    let scrollTrigger: ReturnType<typeof ScrollTrigger.create> | undefined;

    if (triggerOnScroll) {
      scrollTrigger = ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        onEnter: animate,
        once: true,
      });
    } else {
      animate();
    }

    // ── 5. Cleanup ────────────────────────────────────────────────────────
    return () => {
      resizeObserver?.disconnect();
      scrollTrigger?.kill();
      gsap.killTweensOf(innerSpans);
      el.textContent = originalText; // restore for re-mounts
      // Restore the element to its natural accessible state
      el.removeAttribute("aria-hidden");
    };
  }, [children, delay, stagger, splitBy, triggerOnScroll]);

  // Server-render / pre-hydration: plain text (no spans).
  // useEffect replaces this with split spans on the client.
  // `aria-label` is set to the original text so the element is announced
  // correctly by screen readers even after GSAP replaces the inner content.
  const Tag = as as ElementType;
  return (
    <Tag ref={ref} className={className} style={style} aria-label={children}>
      {children}
    </Tag>
  );
}
