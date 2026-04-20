import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-black text-white">
      {/* Layer 1 — base radial spotlight */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 35%, rgba(60,60,60,0.55) 0%, rgba(20,20,20,0.85) 45%, #000 80%)",
        }}
      />

      {/* Layer 2 — subtle vertical depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />

      {/* Layer 3 — film grain texture (SVG noise) */}
      <div
        className="absolute inset-0 opacity-[0.18] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* Layer 4 — soft top accent line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Content */}
      <main className="relative z-10 min-h-[100dvh] flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-6 duration-1000 fill-mode-both">
          {/* Eyebrow */}
          <p
            className="text-[10px] uppercase tracking-[0.6em] text-white/45 mb-10 animate-in fade-in duration-1000 delay-100 fill-mode-both"
            data-testid="landing-eyebrow"
          >
            Wolfion · 2026
          </p>

          {/* Wordmark */}
          <h1
            className="text-6xl sm:text-7xl md:text-8xl font-extralight tracking-[0.32em] pl-[0.32em] text-white drop-shadow-[0_4px_30px_rgba(255,255,255,0.08)] animate-in fade-in duration-[1400ms] delay-200 fill-mode-both"
            data-testid="landing-wordmark"
          >
            WOLFION
          </h1>

          {/* Hairline divider */}
          <div className="mt-10 h-px w-24 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-in fade-in duration-1000 delay-500 fill-mode-both" />

          {/* Tagline */}
          <p
            className="mt-10 text-2xl sm:text-3xl font-light leading-snug text-white max-w-md animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 fill-mode-both"
            data-testid="landing-tagline"
          >
            Let your fashion <span className="font-serif italic">speak</span> before you do.
          </p>

          {/* Subtext */}
          <p
            className="mt-5 text-sm sm:text-base text-white/55 font-light leading-relaxed max-w-md animate-in fade-in duration-1000 delay-700 fill-mode-both"
            data-testid="landing-subtext"
          >
            Sharp design. Uncompromising comfort. Materials that last.
          </p>

          {/* Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-[900ms] fill-mode-both">
            <Link href="/sign-up" className="w-full sm:w-auto">
              <button
                className="group w-full sm:w-auto h-13 px-10 py-4 rounded-full bg-white text-black text-sm font-medium tracking-[0.18em] uppercase shadow-2xl shadow-white/10 hover:bg-neutral-100 hover:shadow-white/20 active:scale-[0.98] transition-all inline-flex items-center justify-center"
                data-testid="landing-enter-store"
              >
                Enter Store
                <ArrowRight className="ml-2.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
            <Link href="/sign-in" className="w-full sm:w-auto">
              <button
                className="w-full sm:w-auto h-13 px-10 py-4 rounded-full bg-transparent border border-white/25 text-white text-sm font-medium tracking-[0.18em] uppercase hover:bg-white/5 hover:border-white/50 active:scale-[0.98] transition-all"
                data-testid="landing-login"
              >
                Login
              </button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.4em] text-white/35 animate-in fade-in duration-1000 delay-[1200ms] fill-mode-both">
          Built different · Own the rest
        </p>
      </main>
    </div>
  );
}
