import HeroSection          from "@/components/HeroSection";
import ExperienceSection    from "@/components/ExperienceSection";
import ProjectShowcase      from "@/components/ProjectShowcase";
import TeacherHelperSection from "@/components/TeacherHelperSection";
import CredentialsDeck      from "@/components/CredentialsDeck";
import SkillsBento          from "@/components/SkillsBento";
import ContactFooter        from "@/components/ContactFooter";

// ─────────────────────────────────────────────────────────────────────────────
// Home page — Portfolio root
// Sections: Hero → Experience → Projects → TeacherHelper → Credentials
//           → Skills → Contact Footer
//
// This is intentionally a Server Component. Interactive sections carry their
// own "use client" directives so only the necessary subtrees hydrate.
//
// Footer reveal architecture:
//   • <main> has `relative z-10 bg-[#07070d]` — sits above the fixed footer.
//   • The desktop bottom margin (max of 70vh and 640px) creates scroll runway equal to the footer height so the
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
       * Desktop bottom margin — scroll runway: same height as the fixed footer on
       *   desktop (≥ 640px tall so the form never clips on short laptops).
       */}
      <main
        id="main-content"
        className="relative z-10 bg-[#07070d] text-white md:mb-[max(70vh,min(640px,100vh))]"
      >
        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <HeroSection />

        {/* ── Current Role — ICS Financial Systems ───────────────────────── */}
        <ExperienceSection />

        {/* ── Projects Showcase ──────────────────────────────────────────── */}
        <ProjectShowcase />

        {/* ── TeacherHelper — side business ──────────────────────────────── */}
        <TeacherHelperSection />

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
