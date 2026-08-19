import img_cover from "@assets/optimized/wolfion_editorial_cover.jpg";
import img_look1 from "@assets/optimized/wolfion_editorial_look1.jpg";
import img_look2 from "@assets/optimized/wolfion_editorial_look2.jpg";
import img_detail from "@assets/optimized/wolfion_editorial_detail.jpg";

// VARIANT A: "Photoreal 3D Open Magazine"
// Concept: Masterful 3D open magazine with depth, realistic paper texture, shadow play
// Vibe: Tactile luxury — you can almost touch the pages

export default function VariantA() {
  return (
    <section className="relative w-full min-h-[100dvh] bg-gradient-to-br from-[#f8f6f3] via-[#faf8f5] to-[#f5f2ed] px-4 py-8 sm:py-16 overflow-hidden flex flex-col items-center justify-center">
      {/* Ambient warm light wash */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 120% 80% at 25% 20%, rgba(251,191,36,0.15) 0%, transparent 60%), radial-gradient(ellipse 100% 70% at 75% 80%, rgba(217,119,6,0.12) 0%, transparent 55%)",
        }}
      />

      {/* Soft table/surface shadow beneath magazine */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[60%] blur-[60px] sm:blur-[80px] opacity-30 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(0,0,0,0.35) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-6xl flex flex-col items-center">
        {/* Eyebrow */}
        <div className="text-center mb-6 sm:mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
          <p className="inline-flex items-center gap-2 text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-amber-900/60 font-medium">
            <span className="w-6 sm:w-8 h-[1px] bg-gradient-to-r from-transparent to-amber-900/30" />
            Campaign 2026
            <span className="w-6 sm:w-8 h-[1px] bg-gradient-to-l from-transparent to-amber-900/30" />
          </p>
        </div>

        <MagazineSpreadA />

        {/* Bottom tagline — BELOW magazine, not overlapping */}
        <div className="text-center mt-6 sm:mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both delay-500">
          <p className="text-xs sm:text-sm text-neutral-500 font-light tracking-wide px-4">
            Let your fashion <span className="font-serif italic">speak</span> before you do.
          </p>
        </div>
      </div>
    </section>
  );
}

// Embeddable 3D open magazine (used by the shop home editorial section).
export function MagazineSpreadA() {
  return (
        <div
          className="relative mx-auto w-full animate-in fade-in zoom-in-95 duration-1000 fill-mode-both delay-200"
          style={{
            perspective: "1200px",
            perspectiveOrigin: "50% 50%",
          }}
        >
          {/* Magazine wrapper with aspect ratio */}
          <div
            className="relative w-full mx-auto"
            style={{
              maxWidth: "min(100%, 900px)",
              aspectRatio: "16 / 11",
            }}
          >
            {/* Magazine open at ~120° angle */}
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                transformStyle: "preserve-3d",
                transform: "rotateX(5deg)",
              }}
            >
              {/* Spine (center binding) */}
              <div
                className="absolute left-1/2 top-0 bottom-0 w-2 sm:w-3 -translate-x-1/2 z-30"
                style={{
                  background: "linear-gradient(90deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.25) 100%)",
                  boxShadow: "0 0 8px rgba(0,0,0,0.15)",
                }}
              />

              {/* LEFT PAGE */}
              <div
                className="absolute left-0 top-0 w-1/2 h-full origin-right"
                style={{
                  transform: "rotateY(-22deg)",
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Paper base with texture */}
                <div
                  className="relative w-full h-full bg-white rounded-l-sm"
                  style={{
                    boxShadow:
                      "0 15px 40px -10px rgba(0,0,0,0.4), inset -1px 0 rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)",
                  }}
                >
                  {/* Subtle paper grain */}
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply rounded-l-sm"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' /%3E%3C/svg%3E")`,
                    }}
                  />

                  {/* Content: Cover image on left */}
                  <div className="absolute inset-0 p-3 sm:p-6 lg:p-8 flex flex-col">
                    <div className="flex-1 flex items-center justify-center pr-2 sm:pr-4">
                      <div className="w-full h-full max-h-[90%] rounded overflow-hidden shadow-md">
                        <img
                          src={img_cover}
                          alt="Wolfion Campaign Cover"
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                    </div>
                    {/* Page number */}
                    <div className="mt-1 sm:mt-2 text-center pr-2 sm:pr-4">
                      <span className="text-[7px] sm:text-[9px] text-neutral-400 tracking-[0.2em] font-light">01</span>
                    </div>
                  </div>

                  {/* Left edge highlight */}
                  <div
                    className="absolute inset-y-0 left-0 w-[1px] sm:w-[2px] pointer-events-none"
                    style={{
                      background: "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)",
                    }}
                  />
                </div>
              </div>

              {/* RIGHT PAGE */}
              <div
                className="absolute right-0 top-0 w-1/2 h-full origin-left"
                style={{
                  transform: "rotateY(18deg)",
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Paper base */}
                <div
                  className="relative w-full h-full bg-white rounded-r-sm"
                  style={{
                    boxShadow:
                      "0 15px 40px -10px rgba(0,0,0,0.4), inset 1px 0 rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)",
                  }}
                >
                  {/* Paper grain */}
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply rounded-r-sm"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' /%3E%3C/svg%3E")`,
                    }}
                  />

                  {/* Content: Editorial spread on right — CONTAINED within page bounds */}
                  <div className="absolute inset-0 p-3 sm:p-6 lg:p-8 flex flex-col pl-2 sm:pl-4">
                    <div className="flex-1 grid grid-cols-2 gap-1.5 sm:gap-3 min-h-0">
                      {/* Main hero shot */}
                      <div className="col-span-2 rounded overflow-hidden shadow-md min-h-0">
                        <img
                          src={img_look1}
                          alt="Campaign Look 1"
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                      {/* Two supporting shots */}
                      <div className="rounded overflow-hidden shadow-sm min-h-0">
                        <img
                          src={img_look2}
                          alt="Campaign Look 2"
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                      <div className="rounded overflow-hidden shadow-sm min-h-0">
                        <img
                          src={img_detail}
                          alt="Campaign Detail"
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                    </div>

                    {/* Tagline + page number — INSIDE page bounds */}
                    <div className="mt-1.5 sm:mt-2 flex items-center justify-between flex-shrink-0">
                      <p className="text-[6px] sm:text-[8px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-neutral-600 font-medium truncate">
                        Built Different
                      </p>
                      <span className="text-[7px] sm:text-[9px] text-neutral-400 tracking-[0.2em] font-light ml-2">02</span>
                    </div>
                  </div>

                  {/* Right edge shadow */}
                  <div
                    className="absolute inset-y-0 right-0 w-[1px] sm:w-[2px] pointer-events-none"
                    style={{
                      background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.2) 100%)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
  );
}
