import { SignUp } from "@clerk/react";
import wolfionMark from "@assets/Image_20260421042552_60_2_1776716788241.jpg";
import imgPortrait from "@assets/Image_20260416035728_55_2_1776716993092.jpg";

export default function SignUpPage() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-black">
      {/* Cinematic full-bleed background */}
      <img
        src={imgPortrait}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover object-[center_30%] opacity-60 scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/85" />

      {/* Centered content */}
      <main className="relative z-10 min-h-[100dvh] flex flex-col items-center justify-center px-5 py-10">
        <div className="w-full max-w-[420px] flex flex-col items-center text-white animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both">
          {/* Brand mark */}
          <div className="h-16 w-16 rounded-2xl bg-white shadow-2xl overflow-hidden ring-1 ring-white/20">
            <img src={wolfionMark} alt="Wolfion" className="h-full w-full object-cover" />
          </div>

          {/* Wordmark */}
          <h1 className="mt-6 text-4xl sm:text-5xl font-light tracking-[0.32em] text-white">
            WOLFION
          </h1>
          <p className="mt-2 text-[11px] uppercase tracking-[0.45em] text-white/55">
            Bapari Socks
          </p>

          {/* Tagline */}
          <div className="mt-10 text-center max-w-sm">
            <p className="text-xl sm:text-2xl font-light leading-snug">
              Let your fashion <span className="font-serif italic">speak</span> before you do.
            </p>
            <p className="mt-3 text-xs sm:text-sm text-white/55 font-light tracking-wide">
              Sharp design. Uncompromising comfort. Materials that last.
            </p>
          </div>

          {/* Auth form */}
          <div className="mt-10 w-full">
            <SignUp
              routing="path"
              path={`${basePath}/sign-up`}
              signInUrl={`${basePath}/sign-in`}
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-2xl",
                },
              }}
            />
          </div>

          {/* Footer */}
          <p className="mt-8 text-xs text-white/50 tracking-wide">
            © {new Date().getFullYear()} Wolfion · Built different. Own the rest.
          </p>
        </div>
      </main>
    </div>
  );
}
