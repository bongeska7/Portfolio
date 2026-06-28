import HeroSection     from "@/components/HeroSection";
import ProjectShowcase  from "@/components/ProjectShowcase";
import CredentialsDeck  from "@/components/CredentialsDeck";
import SkillsBento      from "@/components/SkillsBento";
import ContactFooter    from "@/components/ContactFooter";

// ─────────────────────────────────────────────────────────────────────────────
// Home page — Portfolio root
// Sections: Hero → Projects → Credentials → Skills → Contact Footer
//
// This is intentionally a Server Component. Interactive sections carry their
// own "use client" directives so only the necessary subtrees hydrate.
//
// Footer reveal architecture:
//   • <main> has `relative z-10 bg-[#07070d]` — sits above the fixed footer.
//   • `md:pb-[70vh]` creates scroll runway equal to the footer height so the
//     user has room to scroll and reveal the fixed footer beneath the content.
//   • #contact-sentinel is a zero-height div at the end of the content.
//     ContactFooter's GSAP ScrollTrigger watches it to fire the entrance
//     animation exactly when the footer starts to be uncovered.
// ─────────────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      {/*
       * `relative z-10` — establishes a stacking context above the fixed
       *   ContactFooter (z-0), so all content here covers the footer.
       * `md:pb-[70vh]` — scroll runway: gives 70 vh of extra scroll space on
       *   desktop so the user can fully reveal the fixed 70 vh footer.
       */}
      <main
        id="main-content"
        className="relative z-10 bg-[#07070d] text-white md:mb-[70vh]"
      >
        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <HeroSection />

        {/* ── Projects Showcase ──────────────────────────────────────────── */}
        <ProjectShowcase />

        {/* ── Credentials & Gallery Deck ─────────────────────────────────── */}
        <CredentialsDeck />

        {/* ── Technical Skills Bento Grid ────────────────────────────────── */}
        <SkillsBento />

        {/*
         * Zero-height sentinel — GSAP ScrollTrigger in ContactFooter watches
         * this element. When its top edge hits the viewport bottom the footer
         * content entrance animation fires (desktop only).
         */}
        <div id="contact-sentinel" aria-hidden="true" />
      </main>

      {/* ── Contact & Footer (fixed reveal on desktop, static on mobile) ─── */}
      <ContactFooter />
    </>
  );
}
