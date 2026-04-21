import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import landingBg from "@assets/Image_20260421101023_74_2_1776737450129.jpg";

export default function Home() {
  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-black text-white">
      {/* Background image with slow drift */}
      <div
        className="absolute inset-0 animate-[wolfion-drift_18s_ease-in-out_infinite_alternate] bg-cover bg-center"
        style={{ backgroundImage: `url(${landingBg})` }}
      />
      {/* Dark overlay for text legibility */}
      <div className="absolute inset-0 bg-black/35" />

      <style>{`
        @keyframes wolfion-drift {
          0%   { transform: translateY(0) scale(1); }
          100% { transform: translateY(-12px) scale(1.04); }
        }
        @keyframes wolfion-rise {
          0%   { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .wolfion-rise {
          opacity: 0;
          animation: wolfion-rise 1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>

      <main className="relative z-10 min-h-[100dvh] flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center">
          {/* Wordmark */}
          <h1
            className="wolfion-rise text-6xl sm:text-7xl md:text-8xl font-bold tracking-[0.04em] text-white"
            style={{
              textShadow:
                "0 4px 30px rgba(0,0,0,0.5), 0 0 40px rgba(255,255,255,0.06)",
              animationDelay: "0ms",
            }}
            data-testid="landing-wordmark"
          >
            WOLFION
          </h1>

          {/* Subtext */}
          <p
            className="wolfion-rise mt-6 text-xs sm:text-sm uppercase tracking-[0.4em] text-white/70 font-light"
            style={{ animationDelay: "300ms" }}
            data-testid="landing-subtext"
          >
            Built on identity
          </p>

          {/* Button */}
          <div
            className="wolfion-rise mt-14"
            style={{ animationDelay: "550ms" }}
          >
            <Link href="/sign-up">
              <button
                className="group relative h-14 px-12 rounded-full bg-white text-black text-sm font-semibold tracking-[0.18em] uppercase shadow-[0_0_0_0_rgba(255,255,255,0.0)] hover:shadow-[0_0_40px_4px_rgba(255,255,255,0.18)] hover:scale-[1.04] active:scale-[0.97] transition-all duration-300 ease-out inline-flex items-center justify-center"
                data-testid="landing-enter-store"
              >
                Enter Store
                <ArrowRight className="ml-2.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
