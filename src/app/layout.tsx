import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SmoothScrollProvider } from "@/context/SmoothScrollContext";
import FluidEffects from "@/components/FluidEffects";
import FloatingNav from "@/components/FloatingNav";
import "./globals.css";

// ---------------------------------------------------------------------------
// Fonts
// ---------------------------------------------------------------------------

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// ---------------------------------------------------------------------------
// SEO Metadata
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  /*
   * metadataBase is required for Next.js to resolve relative URLs in
   * OpenGraph / Twitter image fields to absolute URLs.
   * Replace with your real production domain when deployed.
   */
  metadataBase: new URL("https://omar-aziz-ahmad.vercel.app"),

  title: {
    default: "Omar Aziz Ahmad — Product Designer, AI Engineer & Systems Thinker",
    template: "%s | Omar Aziz Ahmad",
  },

  description:
    "Omar Aziz Ahmad is a Computer Science graduate from the University of Jordan specializing in " +
    "AI engineering, Python development, product design, and systems thinking.",

  keywords: [
    "Omar Aziz Ahmad",
    "Omar Ahmad",
    "AI Engineer",
    "Product Designer",
    "Systems Thinker",
    "Python Developer",
    "Machine Learning Jordan",
    "University of Jordan",
    "University of Jordan CS graduate",
    "creative technologist",
    "AI systems design",
    "systems engineering",
  ],

  authors: [{ name: "Omar Aziz Ahmad", url: "https://omar-aziz-ahmad.vercel.app" }],
  creator: "Omar Aziz Ahmad",
  publisher: "Omar Aziz Ahmad",

  /*
   * Canonical URL — tells search engines the definitive location of this page
   * and prevents duplicate-content penalties if the site is accessible via
   * multiple hostnames (www vs. apex, http vs. https).
   */
  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://omar-aziz-ahmad.vercel.app",
    siteName: "Omar Aziz Ahmad — Portfolio",
    title: "Omar Aziz Ahmad — Product Designer, AI Engineer & Systems Thinker",
    description:
      "Computer Science graduate from the University of Jordan specializing in AI engineering, Python, product design, and systems thinking.",
    images: [
      {
        url: "/og-image.png",   // place a 1200×630 image in /public
        width: 1200,
        height: 630,
        alt: "Omar Aziz Ahmad — Product Designer & AI Engineer Portfolio",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Omar Aziz Ahmad — Product Designer, AI Engineer & Systems Thinker",
    description:
      "Computer Science graduate from the University of Jordan specializing in AI engineering, Python, product design, and systems thinking.",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  /*
   * Verification tokens for Google Search Console / Bing Webmaster Tools.
   * Uncomment and replace with your real tokens once the site is deployed.
   */
  // verification: {
  //   google: "YOUR_GOOGLE_VERIFICATION_TOKEN",
  //   yandex: "YOUR_YANDEX_TOKEN",
  // },
};

// ---------------------------------------------------------------------------
// Root Layout
// ---------------------------------------------------------------------------

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground overflow-x-hidden">
        {/*
         * SmoothScrollProvider must live inside <body> — it needs access
         * to the DOM (window, document.body) and runs only on the client.
         * The "use client" directive in the provider handles this correctly
         * with Next.js App Router: the server renders children normally
         * and the scroll setup hydrates on the client.
         */}
        <SmoothScrollProvider
          lerp={0.08}          // Slightly more damping for a premium feel
          wheelMultiplier={0.8} // Slightly restrained wheel speed
          touchMultiplier={2}   // Responsive touch scrolling
        >
          {/* Page-load curtain — sits above everything, lifts away after ~1.35s */}
          <FluidEffects />
          {/* Global floating nav dock — fixed bottom-center, z-50 */}
          <FloatingNav />
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
