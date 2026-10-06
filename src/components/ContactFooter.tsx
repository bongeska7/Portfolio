"use client";

/**
 * @file src/components/ContactFooter.tsx
 *
 * Contact Footer — Scroll-Reveal Mechanic & Social Links
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  useState,
  useRef,
  useEffect,
  type FormEvent,
  type ChangeEvent,
} from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import MagnetButton from "@/components/MagnetButton";
import { sendEmail } from "@/app/actions/sendEmail";



// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type FormStatus = "idle" | "sending" | "sent" | "error";

interface FormFields {
  name:    string;
  email:   string;
  message: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// FloatingField — bottom-border input with CSS-driven floating label
// ─────────────────────────────────────────────────────────────────────────────

interface FloatingFieldProps {
  id:          string;
  label:       string;
  type?:       string;
  required?:   boolean;
  value:       string;
  onChange:    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isTextarea?: boolean;
  disabled?:   boolean;
}

function FloatingField({
  id,
  label,
  type = "text",
  required = false,
  value,
  onChange,
  isTextarea = false,
  disabled = false,
}: FloatingFieldProps) {
  const fieldCls = `
    peer block w-full pt-5 pb-2 bg-transparent
    border-b border-white/15
    focus:border-violet-500
    outline-none
    transition-[border-color,box-shadow] duration-300
    focus:shadow-[0_1px_0_#7c3aed]
    text-white text-sm
    placeholder-transparent
    resize-none
    disabled:opacity-40 disabled:cursor-not-allowed
  `;

  return (
    <div className="relative">
      {isTextarea ? (
        <textarea
          id={id}
          name={id}
          rows={3}
          required={required}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={label}
          className={fieldCls}
          aria-label={label}
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={label}
          autoComplete={type === "email" ? "email" : "name"}
          className={fieldCls}
          aria-label={label}
        />
      )}

      <label
        htmlFor={id}
        className="
          absolute left-0 top-5
          text-sm text-white/35
          pointer-events-none select-none
          transition-all duration-200 ease-out
          peer-placeholder-shown:top-5
          peer-placeholder-shown:text-sm
          peer-placeholder-shown:text-white/35
          peer-focus:-top-3.5
          peer-focus:text-[10px]
          peer-focus:text-violet-400
          peer-[:not(:placeholder-shown)]:-top-3.5
          peer-[:not(:placeholder-shown)]:text-[10px]
          peer-[:not(:placeholder-shown)]:text-white/50
        "
      >
        {label}
      </label>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ContactFooter — main export
// ─────────────────────────────────────────────────────────────────────────────

export default function ContactFooter() {
  const footerRef  = useRef<HTMLElement>(null);
  const ctaRef     = useRef<HTMLDivElement>(null);
  const socialsRef = useRef<HTMLDivElement>(null);
  const formRef    = useRef<HTMLDivElement>(null);

  const [fields, setFields]           = useState<FormFields>({ name: "", email: "", message: "" });
  const [status, setStatus]           = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // ── GSAP scroll-reveal (desktop only) ────────────────────────────────────
  useEffect(() => {
    const sentinel = document.getElementById("contact-sentinel");
    if (!sentinel) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        gsap.set([ctaRef.current, formRef.current], { opacity: 0, y: 55 });
        gsap.set(Array.from(socialsRef.current?.children ?? []), { opacity: 0, y: 22 });

        const tl = gsap.timeline({
          paused:   true,
          defaults: { ease: "power3.out" },
        });

        tl.to(ctaRef.current,  { opacity: 1, y: 0, duration: 0.9 }, 0)
          .to(formRef.current, { opacity: 1, y: 0, duration: 0.8 }, 0.2)
          .to(
            Array.from(socialsRef.current?.children ?? []),
            { opacity: 1, y: 0, duration: 0.55, stagger: 0.1 },
            0.5,
          );

        const st = ScrollTrigger.create({
          trigger: sentinel,
          start:   "top bottom",
          onEnter: () => tl.play(),
          once:    true,
        });

        return () => {
          st.kill();
          tl.kill();
          gsap.set(
            [ctaRef.current, formRef.current, Array.from(socialsRef.current?.children ?? [])],
            { clearProps: "all" },
          );
        };
      });

      mm.add("(max-width: 767px)", () => {
        gsap.set(
          [ctaRef.current, formRef.current, Array.from(socialsRef.current?.children ?? [])],
          { clearProps: "all" },
        );
        return () => {};
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status !== "idle") return;
    setStatus("sending");
    setErrorMessage("");

    const result = await sendEmail({
      name:    fields.name,
      email:   fields.email,
      message: fields.message,
    });

    if (result.success) {
      setStatus("sent");
      setFields({ name: "", email: "", message: "" });
      setTimeout(() => setStatus("idle"), 4000);
    } else {
      console.error("[ContactFooter] delivery failed:", result.error);
      setErrorMessage(result.error ?? "Something went wrong — please try again.");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  return (
    <footer
      ref={footerRef}
      id="contact"
      aria-label="Contact and site footer"
      className="
        w-full
        bg-[#050509]
        overflow-hidden
        py-14 md:py-0
        static
        md:fixed md:bottom-0 md:left-0 md:right-0
        md:h-[70vh]
      "
      style={{ zIndex: 0 }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(124,58,237,0.4) 30%, rgba(8,145,178,0.4) 70%, transparent 100%)",
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 85% 65% at 50% 100%, rgba(124,58,237,0.09) 0%, transparent 70%)",
        }}
      />

      <div
        className="
          relative z-10 h-full
          max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
          flex flex-col
          md:py-0
        "
      >
        <div
          className="
            flex flex-col md:flex-row
            gap-12 md:gap-20
            md:flex-1 md:items-center
          "
        >
          <div ref={ctaRef} className="md:w-[52%] flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-5">
              <span
                className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"
                aria-hidden="true"
              />
              <span className="font-mono text-[10px] tracking-[0.25em] text-white/30 uppercase">
                Get in touch
              </span>
            </div>

            <h2
              className="font-black uppercase tracking-tight leading-[0.92] text-white mb-5"
              style={{ fontSize: "clamp(2rem, 4.2vw, 3.6rem)" }}
            >
              Let&apos;s build{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #7c3aed 0%, #0891b2 100%)",
                }}
              >
                something
              </span>
              <br />
              extraordinary.
            </h2>

            <p className="text-white/30 text-sm leading-relaxed max-w-[32ch] mb-6">
              Whether it&apos;s a startup, a side project, or a thesis —
              I&apos;m open to building ambitious things together.
            </p>

            <div ref={socialsRef} className="flex flex-col gap-2 items-start" aria-label="Social links and contact info">
              {/* GitHub Link */}
              <a
                href="https://github.com/bongeska7"
                target="_blank"
                rel="noopener noreferrer"
                className="
                  group inline-flex items-center gap-3 py-1
                  text-sm font-mono text-white/40
                  hover:text-white transition-colors duration-300
                "
              >
                <span
                  className="
                    block h-px
                    w-5 bg-white/18
                    group-hover:w-8 group-hover:bg-violet-400
                    transition-all duration-300 flex-shrink-0
                  "
                  aria-hidden="true"
                />
                GitHub
                <span
                  className="
                    text-violet-400 text-xs
                    opacity-0 group-hover:opacity-100
                    translate-x-0 group-hover:translate-x-0.5
                    transition-all duration-300
                  "
                  aria-hidden="true"
                >
                  ↗
                </span>
              </a>

              {/* LinkedIn Link */}
              <a
                href="https://www.linkedin.com/in/omarazahmad/"
                target="_blank"
                rel="noopener noreferrer"
                className="
                  group inline-flex items-center gap-3 py-1
                  text-sm font-mono text-white/40
                  hover:text-white transition-colors duration-300
                "
              >
                <span
                  className="
                    block h-px
                    w-5 bg-white/18
                    group-hover:w-8 group-hover:bg-violet-400
                    transition-all duration-300 flex-shrink-0
                  "
                  aria-hidden="true"
                />
                LinkedIn
                <span
                  className="
                    text-violet-400 text-xs
                    opacity-0 group-hover:opacity-100
                    translate-x-0 group-hover:translate-x-0.5
                    transition-all duration-300
                  "
                  aria-hidden="true"
                >
                  ↗
                </span>
              </a>

              {/* Email Address */}
              <a
                href="mailto:omaraziz98765@gmail.com"
                className="
                  group inline-flex items-center gap-3 py-1
                  text-sm font-mono text-white/40 hover:text-white
                  transition-colors duration-300 select-all
                "
              >
                <span
                  className="
                    block h-px
                    w-5 bg-white/18
                    group-hover:w-8 group-hover:bg-cyan-400
                    transition-all duration-300 flex-shrink-0
                  "
                  aria-hidden="true"
                />
                <svg className="w-3.5 h-3.5 text-cyan-400/70 group-hover:text-cyan-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                omaraziz98765@gmail.com
              </a>

              {/* Phone Number */}
              <a
                href="tel:+962558760156"
                className="
                  group inline-flex items-center gap-3 py-1
                  text-sm font-mono text-white/40 hover:text-white
                  transition-colors duration-300 select-all
                "
              >
                <span
                  className="
                    block h-px
                    w-5 bg-white/18
                    group-hover:w-8 group-hover:bg-cyan-400
                    transition-all duration-300 flex-shrink-0
                  "
                  aria-hidden="true"
                />
                <svg className="w-3.5 h-3.5 text-cyan-400/70 group-hover:text-cyan-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +962 55 876 0156
              </a>

              {/* Location & Transferable Saudi Iqama Badge */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2 mt-1 border-t border-white/[0.06] w-full">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-white/45">
                  <svg className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Al Warood, Jeddah</span>
                </div>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wide text-emerald-300 bg-emerald-500/10 border border-emerald-500/20">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
                  Transferable Saudi Iqama
                </span>
              </div>
            </div>
          </div>

          <div ref={formRef} className="md:w-[48%]">
            {status === "sent" ? (
              <div
                className="flex flex-col items-center justify-center py-12 text-center"
                role="status"
                aria-live="polite"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{
                    background:  "rgba(16,185,129,0.12)",
                    border:      "1px solid rgba(16,185,129,0.25)",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="text-emerald-300 font-semibold text-sm mb-1.5">
                  Message sent!
                </p>
                <p className="text-white/30 text-xs font-mono">
                  I&apos;ll get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                aria-label="Contact form"
                className="flex flex-col gap-7"
              >
                <FloatingField
                  id="name"
                  label="Your Name"
                  required
                  value={fields.name}
                  onChange={handleChange}
                  disabled={status === "sending"}
                />

                <FloatingField
                  id="email"
                  label="Email Address"
                  type="email"
                  required
                  value={fields.email}
                  onChange={handleChange}
                  disabled={status === "sending"}
                />

                <FloatingField
                  id="message"
                  label="What are we building?"
                  required
                  value={fields.message}
                  onChange={handleChange}
                  isTextarea
                  disabled={status === "sending"}
                />

                {status === "error" && errorMessage && (
                  <p
                    className="text-red-400 text-xs font-mono -mt-2"
                    role="alert"
                    aria-live="assertive"
                  >
                    ✗ {errorMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="
                    mt-1 w-full py-3.5 rounded-xl
                    font-semibold text-sm tracking-wide text-white
                    hover:opacity-90
                    active:scale-[0.98]
                    transition-all duration-300
                    disabled:opacity-50 disabled:cursor-not-allowed
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050509]
                  "
                  style={{
                    background:  "linear-gradient(135deg, #7c3aed 0%, #0891b2 100%)",
                    boxShadow:   "0 0 40px rgba(124,58,237,0.18)",
                  }}
                >
                  {status === "sending" ? (
                    <span className="flex items-center justify-center gap-2.5" aria-live="polite">
                      <svg
                        className="animate-spin w-4 h-4 flex-shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12" cy="12" r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"
                        />
                      </svg>
                      Sending…
                    </span>
                  ) : (
                    "Send Message →"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        <div
          className="
            border-t border-white/[0.05]
            pt-4 mt-8 md:mt-4
            flex flex-col sm:flex-row items-center justify-between gap-2
          "
        >
          <p className="text-white/20 text-[10px] font-mono tracking-wide">
            © {new Date().getFullYear()} Omar Aziz Ahmad — Developer @ ICS Financial Systems
          </p>
          <p className="text-white/15 text-[10px] font-mono tracking-wide">
            Built with Next.js · GSAP · Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
}
