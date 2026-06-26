import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useUser } from "@clerk/react";
import { ArrowRight } from "lucide-react";
import landingBg from "@assets/Image_20260421101422_75_2_1776737693221.jpg";
import { useRole } from "@/hooks/use-role";

type Props = {
  autoRedirect?: boolean;
};

export default function Home({ autoRedirect = false }: Props) {
  const { isLoaded, isSignedIn } = useUser();
  const { role } = useRole();
  const [, setLocation] = useLocation();
  const [bgReady, setBgReady] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = landingBg;
    if (img.complete) {
      setBgReady(true);
    } else {
      img.onload = () => setBgReady(true);
      img.onerror = () => setBgReady(true);
    }
  }, []);

  useEffect(() => {
    if (!autoRedirect) return;
    if (!isLoaded || !isSignedIn) return;
    const target = role === "admin" ? "/admin-dashboard" : "/shop";
    const t = window.setTimeout(() => setLocation(target), 1400);
    return () => window.clearTimeout(t);
  }, [autoRedirect, isLoaded, isSignedIn, role, setLocation]);

  return (
    <div className="wolfion-splash-bg relative min-h-[100dvh] w-full overflow-hidden text-white">
      {/* Background image with slow drift, fades in once loaded so we never
          flash a black-then-image transition. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center md:bg-bottom transition-opacity duration-700"
        style={{
          backgroundImage: `url(${landingBg})`,
          animation: "wolfion-drift 18s ease-in-out infinite alternate",
          opacity: bgReady ? 1 : 0,
        }}
      />
      {/* Soft cinematic vignette + bottom gradient for text contrast */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.55) 100%), linear-gradient(to bottom, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.0) 35%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      <main className="relative z-10 min-h-[100dvh] flex flex-col items-center justify-end px-6 pb-16 pt-[55vh]">
        <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center">
          {/* Wordmark */}
          <h1
            className="wolfion-rise text-6xl sm:text-7xl md:text-8xl font-bold tracking-[0.04em] text-white"
            style={{
              textShadow:
                "0 4px 30px rgba(0,0,0,0.55), 0 0 40px rgba(255,255,255,0.06)",
              animationDelay: "80ms",
            }}
            data-testid="landing-wordmark"
          >
            WOLFION
          </h1>

          {/* Subtext */}
          <p
            className="wolfion-rise mt-6 text-xs sm:text-sm uppercase tracking-[0.4em] text-white/75 font-light"
            style={{ animationDelay: "360ms" }}
            data-testid="landing-subtext"
          >
            Built on identity
          </p>

          {/* Button or auto-redirect hint */}
          <div
            className="wolfion-rise mt-14"
            style={{ animationDelay: "620ms" }}
          >
            {autoRedirect && isLoaded && isSignedIn ? (
              <div
                className="h-14 px-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs font-medium tracking-[0.3em] uppercase inline-flex items-center justify-center"
                data-testid="landing-welcoming"
              >
                <span
                  className="mr-3 h-2 w-2 rounded-full bg-white"
                  style={{ animation: "wolfion-glow 1.4s ease-in-out infinite" }}
                />
                Welcome back
              </div>
            ) : (
              <Link href="/sign-in">
                <button
                  className="group relative h-14 px-12 rounded-full bg-white text-black text-sm font-semibold tracking-[0.18em] uppercase shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)] hover:shadow-[0_0_40px_4px_rgba(255,255,255,0.18)] hover:scale-[1.04] active:scale-[0.97] transition-all duration-300 ease-out inline-flex items-center justify-center"
                  data-testid="landing-enter-store"
                >
                  Enter Store
                  <ArrowRight className="ml-2.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
