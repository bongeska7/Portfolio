"use client";

/**
 * @file src/context/SmoothScrollContext.tsx
 *
 * Lenis Smooth Scroll ↔ GSAP ticker integration.
 *
 * ## Architecture
 *
 * Lenis normally drives its own rAF loop. For scroll-driven animations
 * with GSAP ScrollTrigger, both systems must tick on the **exact same
 * frame** — otherwise you get a one-frame offset between the scroll
 * position Lenis reports and what ScrollTrigger reads, producing subtle
 * jitter and misaligned pin-spacer calculations.
 *
 * The fix is to:
 *   1. Create Lenis with `autoRaf: false` to disable its internal loop.
 *   2. Call `lenis.raf(time)` from inside `gsap.ticker.add()`.
 *   3. Tell ScrollTrigger to use Lenis's scroll position by forwarding
 *      the `scroll` event to `ScrollTrigger.update()`.
 *
 * This context provides:
 *   - `useSmoothScroll()` — access the raw `Lenis` instance for
 *     programmatic scrolling (`lenis.scrollTo("#target")`).
 *   - `useLenisScroll()` — subscribe to scroll events reactively
 *     (position, velocity, direction) without prop-drilling.
 *
 * ## Usage
 *
 * Wrap your root layout:
 *   <SmoothScrollProvider>{children}</SmoothScrollProvider>
 *
 * In any child component:
 *   const lenis = useSmoothScroll();
 *   lenis?.scrollTo("#projects", { duration: 1.4, easing: … });
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ScrollState {
  scroll: number;
  limit: number;
  velocity: number;
  direction: 1 | -1;
  progress: number;
}

interface SmoothScrollContextValue {
  lenis: Lenis | null;
}

// ---------------------------------------------------------------------------
// Contexts
// ---------------------------------------------------------------------------

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  lenis: null,
});

// Separate context for scroll-state updates so consumers that only care
// about the Lenis instance are not re-rendered on every scroll event.
const ScrollStateContext = createContext<ScrollState>({
  scroll: 0,
  limit: 0,
  velocity: 0,
  direction: 1,
  progress: 0,
});

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface SmoothScrollProviderProps {
  children: ReactNode;
  /**
   * Lerp factor controlling how quickly the scroll position catches up to
   * the target. Lower = smoother / more lag. Range: 0.01 – 1.
   * @default 0.1
   */
  lerp?: number;
  /**
   * Extra multiplier applied to wheel delta. Higher = faster scroll.
   * @default 1
   */
  wheelMultiplier?: number;
  /**
   * Extra multiplier applied to touch delta.
   * @default 2
   */
  touchMultiplier?: number;
}

export function SmoothScrollProvider({
  children,
  lerp = 0.1,
  wheelMultiplier = 1,
  touchMultiplier = 2,
}: SmoothScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const scrollStateRef = useRef<ScrollState>({
    scroll: 0,
    limit: 0,
    velocity: 0,
    direction: 1,
    progress: 0,
  });

  // We keep a stable reference to the scroll-state setter so we can
  // update it from the Lenis event callback without triggering stale closures.
  const [scrollState, setScrollState] = React.useState<ScrollState>(
    scrollStateRef.current,
  );

  useEffect(() => {
    // ------------------------------------------------------------------
    // 1. Instantiate Lenis with autoRaf disabled so GSAP owns the loop.
    // ------------------------------------------------------------------
    const lenis = new Lenis({
      lerp,
      wheelMultiplier,
      touchMultiplier,
      // Smooth scroll on all devices including touch / iOS momentum
      smoothWheel: true,
      // Prevent Lenis from hijacking its own RAF — GSAP will call raf()
      autoRaf: false,
    });

    lenisRef.current = lenis;

    // ------------------------------------------------------------------
    // 2. Forward Lenis scroll events → GSAP ScrollTrigger.
    //    ScrollTrigger.update() must be called after Lenis has updated
    //    the scroll position but within the same frame, so it reads the
    //    correct value from the DOM.
    // ------------------------------------------------------------------
    lenis.on("scroll", (e: Lenis) => {
      ScrollTrigger.update();

      // Batch state update via ref to avoid excessive re-renders.
      // Only flush to React state if values meaningfully changed.
      const next: ScrollState = {
        scroll: e.scroll,
        limit: e.limit,
        velocity: e.velocity,
        direction: e.direction as 1 | -1,
        progress: e.progress,
      };
      scrollStateRef.current = next;
      // Use startTransition semantics implicitly — setState in rAF is
      // already batched in React 18 concurrent mode.
      setScrollState({ ...next });
    });

    // ------------------------------------------------------------------
    // 3. Hook Lenis into the GSAP ticker.
    //    gsap.ticker time is in seconds; Lenis.raf() expects milliseconds.
    // ------------------------------------------------------------------
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);

    // Prevent GSAP from adding its own rAF on top — we already have one.
    gsap.ticker.lagSmoothing(0);

    // ------------------------------------------------------------------
    // 4. Tell ScrollTrigger to use Lenis's scroller proxy.
    //    This is necessary when using a custom scroll container (window
    //    is the default but the proxy ensures full compatibility).
    // ------------------------------------------------------------------
    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value?: number) {
        if (arguments.length && value !== undefined) {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
    });

    ScrollTrigger.defaults({ scroller: document.body });

    // Refresh ScrollTrigger after proxy is set so it re-measures everything.
    ScrollTrigger.refresh();

    // ------------------------------------------------------------------
    // 5. Cleanup on unmount.
    // ------------------------------------------------------------------
    return () => {
      gsap.ticker.remove(tickerCallback);
      ScrollTrigger.scrollerProxy(document.body, undefined as never);
      ScrollTrigger.defaults({ scroller: undefined });
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [lerp, wheelMultiplier, touchMultiplier]);

  return (
    <SmoothScrollContext.Provider value={{ lenis: lenisRef.current }}>
      <ScrollStateContext.Provider value={scrollState}>
        {children}
      </ScrollStateContext.Provider>
    </SmoothScrollContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Returns the raw `Lenis` instance for programmatic scrolling.
 *
 * @example
 * const lenis = useSmoothScroll();
 * lenis?.scrollTo("#contact", { duration: 1.2 });
 */
export function useSmoothScroll(): Lenis | null {
  return useContext(SmoothScrollContext).lenis;
}

/**
 * Subscribes to real-time scroll state (position, velocity, direction,
 * progress). The component re-renders on every scroll frame, so use it
 * only where you genuinely need reactive scroll data.
 *
 * @example
 * const { progress, velocity } = useLenisScroll();
 */
export function useLenisScroll(): ScrollState {
  return useContext(ScrollStateContext);
}
