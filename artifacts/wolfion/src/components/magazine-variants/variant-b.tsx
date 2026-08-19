import img_cover from "@assets/optimized/wolfion_editorial_cover.jpg";
import img_look1 from "@assets/optimized/wolfion_editorial_look1.jpg";
import img_look2 from "@assets/optimized/wolfion_editorial_look2.jpg";
import img_detail from "@assets/optimized/wolfion_editorial_detail.jpg";

// VARIANT B: "Flat High-Fashion Editorial Spread"
// Concept: Glossy print layout — the page IS the screen, ultra-editorial, Vogue/i-D energy
// Vibe: Sharp, graphic, unapologetic — maximum contrast, bold type, asymmetric grid

export default function VariantB() {
  return (
    <section className="relative w-full bg-white overflow-hidden">
      {/* Mobile-first stacked layout, desktop side-by-side */}
      <div className="relative w-full">
        
        {/* PART 1: Dark brand panel */}
        <div className="relative bg-gradient-to-br from-[#1a1a1a] via-[#0a0a0a] to-black text-white px-6 sm:px-10 lg:px-16 py-12 sm:py-16 lg:py-20">
          {/* Top eyebrow */}
          <div className="animate-in fade-in slide-in-from-left-6 duration-700 fill-mode-both mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 sm:w-12 h-[1px] bg-gradient-to-r from-white/60 to-transparent" />
              <span className="text-[9px] uppercase tracking-[0.3em] text-white/50 font-medium">Campaign 2026</span>
            </div>
          </div>

          {/* Brand lockup */}
          <div className="animate-in fade-in slide-in-from-left-6 duration-900 fill-mode-both delay-150 mb-8 sm:mb-12">
            <h1
              className="text-[18vw] sm:text-[14vw] lg:text-[12vw] font-light leading-[0.85] tracking-tighter"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #b8b8b8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              WOLFION
            </h1>
          </div>

          {/* Manifesto */}
          <div className="animate-in fade-in slide-in-from-left-6 duration-900 fill-mode-both delay-300 space-y-5 max-w-lg">
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-light leading-tight tracking-tight">
                Built different.
              </p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-light leading-tight tracking-tight">
                Own the rest.
              </p>
            </div>
            <div className="pt-3 border-t border-white/10">
              <p className="text-[10px] sm:text-xs text-white/60 uppercase tracking-[0.18em] font-medium">
                Designed in Australia · Made in Dhaka
              </p>
            </div>
          </div>
        </div>

        {/* PART 2: Image grid on light background */}
        <div className="relative bg-[#f5f2ed] px-0 py-0">
          {/* Cover shot — full width */}
          <div className="relative w-full aspect-[3/4] sm:aspect-[4/5] lg:aspect-[16/10] overflow-hidden animate-in fade-in zoom-in-95 duration-1000 fill-mode-both delay-200">
            <img
              src={img_cover}
              alt="Wolfion Campaign Cover"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            {/* Edge vignette */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.15) 100%)",
              }}
            />
            {/* Floating caption */}
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6">
              <div className="inline-flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.25em] text-white font-medium">Lead</span>
              </div>
            </div>
          </div>

          {/* Look 1 — offset grid item */}
          <div className="relative w-full aspect-[3/2] sm:aspect-[5/2] overflow-hidden animate-in fade-in zoom-in-95 duration-1000 fill-mode-both delay-400">
            <div className="absolute inset-0 grid grid-cols-12">
              {/* Negative space on left */}
              <div className="col-span-2 bg-[#f5f2ed]" />
              {/* Image */}
              <div className="col-span-10 relative overflow-hidden">
                <img
                  src={img_look1}
                  alt="Campaign Look 1"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
              </div>
            </div>
          </div>

          {/* Bottom strip — Look 2 + Detail */}
          <div className="relative w-full grid grid-cols-2 gap-0 animate-in fade-in zoom-in-95 duration-1000 fill-mode-both delay-600">
            <div className="relative aspect-[1/1] sm:aspect-[3/2] overflow-hidden">
              <img
                src={img_look2}
                alt="Campaign Look 2"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            </div>
            <div className="relative aspect-[1/1] sm:aspect-[3/2] overflow-hidden">
              <img
                src={img_detail}
                alt="Campaign Detail"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            </div>
          </div>

          {/* Bottom spacing */}
          <div className="h-16 sm:h-20 bg-[#f5f2ed]" />
        </div>
      </div>

      {/* Floating page number + issue marker (bottom right) */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 animate-in fade-in duration-700 fill-mode-both delay-700">
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.25em] text-neutral-400 font-medium">Issue 01</span>
          <span className="text-4xl sm:text-5xl lg:text-6xl font-light text-neutral-300 leading-none">01</span>
        </div>
      </div>

      {/* Editorial credit (top right) */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 animate-in fade-in duration-700 fill-mode-both delay-500">
        <div className="text-right space-y-0.5">
          <p className="text-[7px] sm:text-[8px] uppercase tracking-[0.2em] text-neutral-400 font-medium">Photography</p>
          <p className="text-[9px] sm:text-[10px] text-neutral-600 font-light">Wolfion Studios</p>
        </div>
      </div>
    </section>
  );
}
