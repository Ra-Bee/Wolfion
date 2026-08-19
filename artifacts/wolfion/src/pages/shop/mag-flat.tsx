// Dev-only flat magazine spread used to render page designs that get
// perspective-warped onto the open-book mockup. Not linked in production nav.
import imgTyler from "@assets/Screenshot_2026-07-11_023358_1785452818285.png";
import imgFletcher from "@assets/Screenshot_2026-07-11_023445_1785452818285.png";
import imgFletcherAlt from "@assets/Screenshot_2026-07-11_023331_1785452818285.png";
import imgPleat from "@assets/WhatsApp_Image_2026-07-11_at_2.30.44_AM_(1)_1785452818286.jpeg";

const LOREM =
  "The Wolfion campaign celebrates the rise of loose-fitting, oversized fashion — comfort meets confidence. Hand-finished detail, layered silhouettes and honest tailoring define a wardrobe built for the modern man. Shot in studio, styled without compromise, every look is an argument for ease as elegance. ";

function Cols({ n = 2, children }: { n?: number; children?: React.ReactNode }) {
  return (
    <div
      style={{ columnCount: n, columnGap: 18 }}
      className="text-[9px] leading-[1.55] text-justify text-neutral-700 font-serif"
    >
      {children}
    </div>
  );
}

export default function MagFlat() {
  return (
    <div className="flex bg-white" style={{ width: 2400, height: 1600 }}>
      {/* LEFT PAGE */}
      <div className="relative bg-white" style={{ width: 1200, height: 1600, padding: 64 }}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center font-black text-3xl font-serif">
              W
            </div>
            <p className="text-[13px] tracking-[0.5em] font-semibold text-neutral-800">WOLFION</p>
          </div>
          <p className="text-[12px] tracking-[0.3em] text-neutral-500">ISSUE 01 · 2026</p>
        </div>

        <h1
          className="font-black text-black leading-[0.92] mt-10"
          style={{ fontSize: 108, letterSpacing: "-0.02em", fontFamily: "Arial Narrow, Impact, sans-serif" }}
        >
          WOLFION:
          <br />
          STYLE REDEFINED
        </h1>

        <div className="relative mt-6" style={{ height: 1040 }}>
          <img src={imgTyler} alt="" className="w-full h-full object-cover" style={{ objectPosition: "50% 12%" }} />
          <div className="absolute bottom-0 left-0 bg-black text-white px-6 py-3">
            <p className="text-[22px] font-bold tracking-wide" style={{ fontFamily: "Georgia, serif" }}>
              Tyler <span className="font-light italic">| The Visionary</span>
            </p>
          </div>
        </div>

        <div className="mt-8 flex gap-6" style={{ fontSize: 15, lineHeight: 1.6 }}>
          <div className="flex-1">
            <div style={{ columnCount: 2, columnGap: 24 }} className="text-justify text-neutral-700">
              {LOREM}
            </div>
          </div>
          <div className="w-[300px] border-l-4 border-red-600 pl-5 flex flex-col justify-center">
            <p className="text-[24px] leading-snug font-bold text-black" style={{ fontFamily: "Georgia, serif" }}>
              “Ease is the new elegance.”
            </p>
            <p className="mt-2 text-[13px] tracking-[0.25em] text-neutral-500">— TYLER, ON SET</p>
          </div>
        </div>

        <p className="absolute bottom-8 left-16 text-[13px] text-neutral-500 tracking-[0.25em]">
          02 · THE EDITORIAL
        </p>
      </div>

      {/* RIGHT PAGE */}
      <div className="relative bg-white border-l border-neutral-200" style={{ width: 1200, height: 1600, padding: 64 }}>
        <div className="flex items-start justify-between">
          <p className="text-[13px] tracking-[0.4em] text-red-600 font-bold">TREND ALERT · UPCYCLE</p>
          <p className="text-[12px] tracking-[0.3em] text-neutral-500">WHAT TO WEAR</p>
        </div>

        <h1
          className="font-black text-black leading-[0.95] mt-10"
          style={{ fontSize: 96, letterSpacing: "-0.02em", fontFamily: "Arial Narrow, Impact, sans-serif" }}
        >
          FLETCHER: THE POSE
        </h1>
        <p className="mt-4 text-[26px] italic text-neutral-700" style={{ fontFamily: "Georgia, serif" }}>
          Comfort &amp; Confidence — the rise of loose-fitting, oversized fashion.
        </p>

        <div className="flex gap-8 mt-8" style={{ height: 1000 }}>
          <div className="relative" style={{ width: 760 }}>
            <img src={imgFletcher} alt="" className="w-full h-full object-cover object-top" />
            <div className="absolute bottom-0 left-0 bg-red-600 text-white px-5 py-2">
              <p className="text-[20px] font-bold tracking-widest">FLETCHER WARD</p>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-between">
            <div style={{ fontSize: 15, lineHeight: 1.65 }} className="text-justify text-neutral-700">
              {LOREM}
              {LOREM}
            </div>
            <div>
              <div className="relative" style={{ height: 240 }}>
                <img src={imgPleat} alt="" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 bg-black/80 text-white px-3 py-1.5">
                  <p className="text-[12px] tracking-[0.25em]">THE CRAFT · HAND-PLEATED DETAIL</p>
                </div>
              </div>
              <div className="relative mt-4" style={{ height: 220 }}>
                <img src={imgFletcherAlt} alt="" className="w-full h-full object-cover object-top" />
                <div className="absolute bottom-0 left-0 bg-white/90 px-3 py-1.5">
                  <p className="text-[12px] tracking-[0.25em] text-black">LOOK 03 · OFF DUTY</p>
                </div>
              </div>
            </div>
            <div className="border-t-2 border-black pt-4 mt-4">
              <p className="text-[14px] font-bold tracking-[0.2em] text-black">PHOTOGRAPHED BY</p>
              <p className="text-[14px] tracking-[0.2em] text-neutral-700">THOM HOOD STUDIO</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 right-16 flex items-center gap-6">
          <p className="text-[13px] text-neutral-500 tracking-[0.25em]">LIMITED EDITION · 03</p>
          <div className="flex gap-[3px] items-end" aria-hidden>
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="bg-black" style={{ width: i % 3 === 0 ? 4 : 2, height: 34 }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
