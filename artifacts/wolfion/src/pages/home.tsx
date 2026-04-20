import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-black text-white">
      {/* Subtle radial spotlight */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 40%, rgba(45,45,45,0.6) 0%, rgba(15,15,15,0.9) 50%, #000 85%)",
        }}
      />

      {/* Content */}
      <main className="relative z-10 min-h-[100dvh] flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center">
          {/* Wordmark */}
          <h1
            className="text-6xl sm:text-7xl md:text-8xl font-bold tracking-[0.04em] text-white animate-in fade-in slide-in-from-bottom-3 duration-1000 fill-mode-both"
            style={{ textShadow: "0 4px 30px rgba(255,255,255,0.08)" }}
            data-testid="landing-wordmark"
          >
            WOLFION
          </h1>

          {/* Minimal subtext */}
          <p
            className="mt-6 text-xs sm:text-sm uppercase tracking-[0.4em] text-white/70 font-light animate-in fade-in duration-1000 delay-300 fill-mode-both"
            data-testid="landing-subtext"
          >
            Built on identity
          </p>

          {/* Button */}
          <div className="mt-14 animate-in fade-in slide-in-from-bottom-3 duration-1000 delay-500 fill-mode-both">
            <Link href="/sign-up">
              <button
                className="group h-13 px-12 py-4 rounded-full bg-white text-black text-sm font-semibold tracking-[0.18em] uppercase shadow-2xl shadow-white/10 hover:bg-neutral-100 hover:shadow-white/20 active:scale-[0.98] transition-all inline-flex items-center justify-center"
                data-testid="landing-enter-store"
              >
                Enter Store
                <ArrowRight className="ml-2.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
