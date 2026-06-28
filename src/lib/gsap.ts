/**
 * @file src/lib/gsap.ts
 *
 * Singleton GSAP setup.
 *
 * Import GSAP and plugins exclusively from this file throughout the project.
 * This guarantees that `gsap.registerPlugin()` is called exactly once,
 * preventing the "plugin registered multiple times" warning that appears
 * when module bundlers create duplicate instances.
 *
 * Usage:
 *   import { gsap, ScrollTrigger } from "@/lib/gsap";
 */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

// Register plugins once at module evaluation time.
// Safe to call here because this module is a singleton in the bundle.
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export { gsap, ScrollTrigger, ScrollToPlugin };
