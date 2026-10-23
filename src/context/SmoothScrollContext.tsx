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

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface SmoothScrollContextValue {
  lenis: Lenis | null;
}

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  lenis: null,
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
  // Held in state (not a ref) so consumers re-render once Lenis exists.
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    // ------------------------------------------------------------------
    // 1. Instantiate Lenis with autoRaf disabled so GSAP owns the loop.
    // ------------------------------------------------------------------
    const instance = new Lenis({
      lerp,
      wheelMultiplier,
      touchMultiplier,
      // Smooth scroll on all devices including touch / iOS momentum
      smoothWheel: true,
      // Prevent Lenis from hijacking its own RAF — GSAP will call raf()
      autoRaf: false,
    });

    // Publishing an external instance created on mount is the intended use
    // of state here — consumers need one re-render once Lenis exists.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLenis(instance);

    // ------------------------------------------------------------------
    // 2. Forward Lenis scroll events → GSAP ScrollTrigger.
    //    ScrollTrigger.update() must be called after Lenis has updated
    //    the scroll position but within the same frame, so it reads the
    //    correct value from the DOM.
    // ------------------------------------------------------------------
    instance.on("scroll", ScrollTrigger.update);

    // ------------------------------------------------------------------
    // 3. Hook Lenis into the GSAP ticker.
    //    gsap.ticker time is in seconds; Lenis.raf() expects milliseconds.
    // ------------------------------------------------------------------
    const tickerCallback = (time: number) => {
      instance.raf(time * 1000);
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
          instance.scrollTo(value, { immediate: true });
        }
        return instance.scroll;
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
      instance.destroy();
      setLenis(null);
    };
  }, [lerp, wheelMultiplier, touchMultiplier]);

  return (
    <SmoothScrollContext.Provider value={{ lenis }}>
      {children}
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
