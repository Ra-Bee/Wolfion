import { useState } from "react";
import img_cover from "@assets/optimized/wolfion_editorial_cover.jpg";
import img_look1 from "@assets/optimized/wolfion_editorial_look1.jpg";
import img_look2 from "@assets/optimized/wolfion_editorial_look2.jpg";
import img_look3 from "@assets/optimized/wolfion_editorial_look3.jpg";

// VARIANT C: "Interactive Magazine — Cover to Spread Reveal"
// Concept: Animated cover-to-spread unfold on hover/tap — feels like opening the magazine yourself
// Vibe: Kinetic luxury — the page opens for you, smooth as silk

export default function VariantC() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="relative w-full min-h-[100dvh] bg-gradient-to-br from-[#2a2520] via-[#1a1612] to-[#0a0805] px-4 py-10 sm:py-16 overflow-hidden flex flex-col items-center justify-center">
      {/* Ambient spotlight */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(212,175,55,0.2) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-5xl">
        {/* Eyebrow */}
        <div className="text-center mb-6 sm:mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
          <p className="inline-flex items-center gap-2 text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-amber-200/50 font-medium">
            <span className="w-6 sm:w-8 h-[1px] bg-gradient-to-r from-transparent to-amber-200/20" />
            Interactive Edition
            <span className="w-6 sm:w-8 h-[1px] bg-gradient-to-l from-transparent to-amber-200/20" />
          </p>
        </div>

        {/* Magazine container with perspective */}
        <div
          className="relative mx-auto w-full animate-in fade-in zoom-in-95 duration-1000 fill-mode-both delay-200"
          style={{
            perspective: "1400px",
            perspectiveOrigin: "50% 50%",
          }}
        >
          {/* Interactive trigger overlay (mobile/desktop) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
            className="absolute inset-0 z-50 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:ring-offset-4 focus-visible:ring-offset-neutral-900 rounded-lg"
            aria-label={isOpen ? "Close magazine" : "Open magazine"}
          />

          {/* Magazine stage — scales with container */}
          <div
            className="relative w-full mx-auto"
            style={{
              maxWidth: "min(100%, 850px)",
              aspectRatio: "3 / 2",
            }}
          >
            {/* CLOSED STATE: Front cover (rotates open on hover/tap) */}
            <div
              className="absolute inset-0 origin-left transition-all duration-[1200ms] ease-out"
              style={{
                transformStyle: "preserve-3d",
                transform: isOpen ? "rotateY(-155deg)" : "rotateY(0deg)",
                transformOrigin: "left center",
                zIndex: isOpen ? 20 : 30,
              }}
            >
              {/* Cover wrap */}
              <div
                className="relative w-full h-full bg-white rounded-md sm:rounded-lg shadow-2xl overflow-hidden"
                style={{
                  boxShadow: isOpen
                    ? "0 25px 70px -18px rgba(0,0,0,0.6), 0 10px 30px -10px rgba(0,0,0,0.4)"
                    : "0 20px 50px -12px rgba(0,0,0,0.5), 0 8px 24px -8px rgba(0,0,0,0.3)",
                }}
              >
                {/* Cover image */}
                <img
                  src={img_cover}
                  alt="Wolfion Magazine Cover"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />

                {/* Glossy sheen */}
                <div
                  aria-hidden
                  className="absolute inset-0 pointer-events-none opacity-40"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.2) 100%)",
                  }}
                />

                {/* Cover text overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
                  <h2
                    className="text-4xl sm:text-6xl lg:text-7xl font-light leading-[0.9] tracking-tighter mb-2 sm:mb-3"
                    style={{
                      background: "linear-gradient(180deg, #ffffff 0%, #d4af37 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.4))",
                    }}
                  >
                    WOLFION
                  </h2>
                  <p className="text-[10px] sm:text-xs text-white/90 uppercase tracking-[0.18em] sm:tracking-[0.2em] font-medium">
                    Campaign 2026 · Issue 01
                  </p>
                </div>

                {/* Tap/hover hint (only when closed) */}
                {!isOpen && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="animate-pulse">
                      <div className="bg-white/90 backdrop-blur-md border border-white/40 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 shadow-xl">
                        <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] sm:tracking-[0.3em] text-neutral-900 font-medium">
                          <span className="hidden sm:inline">Hover to open</span>
                          <span className="sm:hidden">Tap to open</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Cover spine edge (visible when open) */}
              <div
                className="absolute inset-y-0 left-0 w-2 sm:w-3 bg-gradient-to-r from-black/60 via-black/30 to-transparent"
                style={{
                  transform: "translateZ(-2px)",
                }}
              />
            </div>

            {/* OPEN STATE: Interior spread (always rendered beneath cover) */}
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                transformStyle: "preserve-3d",
                zIndex: 10,
              }}
            >
              {/* Spread background */}
              <div
                className="relative w-full h-full bg-white rounded-md sm:rounded-lg shadow-2xl overflow-hidden"
                style={{
                  boxShadow: "0 25px 70px -18px rgba(0,0,0,0.6), 0 10px 30px -10px rgba(0,0,0,0.4)",
                }}
              >
                {/* Center spine shadow */}
                <div
                  className="absolute left-1/2 top-0 bottom-0 w-3 sm:w-5 -translate-x-1/2 z-20 pointer-events-none"
                  style={{
                    background: "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.15) 50%, transparent 100%)",
                  }}
                />

                {/* Grid layout */}
                <div className="absolute inset-0 grid grid-cols-2 gap-0">
                  {/* Left page */}
                  <div className="relative p-3 sm:p-6 flex flex-col gap-2 sm:gap-4">
                    <div className="flex-1 rounded overflow-hidden shadow-md">
                      <img
                        src={img_look1}
                        alt="Campaign Look 1"
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    <div className="h-[28%] rounded overflow-hidden shadow-sm">
                      <img
                        src={img_look2}
                        alt="Campaign Look 2"
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                  </div>

                  {/* Right page */}
                  <div className="relative p-3 sm:p-6 flex flex-col gap-2 sm:gap-4">
                    <div className="flex-1 rounded overflow-hidden shadow-md">
                      <img
                        src={img_look3}
                        alt="Campaign Look 3"
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    <div className="h-[28%] flex flex-col justify-center px-2 sm:px-3">
                      <p className="text-base sm:text-xl lg:text-2xl font-light leading-tight tracking-tight text-neutral-900 mb-1 sm:mb-2">
                        Built different.
                      </p>
                      <p className="text-[8px] sm:text-[10px] text-neutral-500 uppercase tracking-[0.18em] sm:tracking-[0.2em] font-medium">
                        Own the rest.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom instruction text */}
        <div
          className={`text-center mt-8 sm:mt-14 transition-opacity duration-700 ${
            isOpen ? "opacity-0" : "opacity-100"
          } animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both delay-500`}
        >
          <p className="text-xs sm:text-sm text-amber-200/60 font-light tracking-wide">
            Let your fashion <span className="font-serif italic">speak</span> before you do.
          </p>
        </div>
      </div>
    </section>
  );
}
