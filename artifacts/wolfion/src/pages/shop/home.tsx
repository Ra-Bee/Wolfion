import { Link } from "wouter";
import { ArrowRight, Sparkles } from "lucide-react";
import { ShopLayout } from "@/components/shop-layout";
import { categories } from "@/lib/data";
import imgPortrait from "@assets/Image_20260416035728_55_2_1776716993092.jpg";
import imgSocks from "@assets/Image_20260416025624_54_2_1776717008197.jpg";
import imgWomenswear from "@assets/wolfion_womenswear.png";
import imgKidswear from "@assets/wolfion_kidswear.png";

const FADE = "animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both";

export default function ShopHome() {
  const sockCats = categories;

  return (
    <ShopLayout>
      {/* 1 — HERO */}
      <section className="relative w-full bg-white dark:bg-neutral-950 px-3 pt-3 pb-5 sm:px-5 sm:pt-5 sm:pb-8">
        {/* 3D beveled frame — soft neutral bevel (light top-left, dark bottom-right) */}
        <div
          className="relative rounded-[24px] sm:rounded-[32px] p-[2px] sm:p-[3px]"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.55) 100%)",
            boxShadow:
              "0 24px 60px -22px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.35)",
          }}
        >
          {/* Inner photo container */}
          <div
            className="relative h-[72svh] min-h-[460px] sm:h-[86svh] sm:min-h-[580px] w-full overflow-hidden rounded-[21px] sm:rounded-[28px] bg-black text-white"
            style={{
              boxShadow:
                "inset 0 2px 0 rgba(255,255,255,0.32), inset 0 -2px 14px rgba(0,0,0,0.6), inset 0 0 80px rgba(0,0,0,0.4)",
            }}
          >
            <img
              src={imgPortrait}
              alt="Wolfion campaign"
              className="absolute inset-0 h-full w-full object-cover object-[center_75%] scale-105 animate-in fade-in zoom-in-95 duration-[2000ms] fill-mode-both"
            />
            {/* Soft bottom-only gradient so the glass card has contrast without covering the model */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent pointer-events-none" />

            {/* Inner top sheen — strong glass highlight at the top edge */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-20 pointer-events-none z-10"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.05) 40%, transparent 100%)",
              }}
            />

            {/* Inner side highlights — subtle vertical glass edge */}
            <div
              aria-hidden
              className="absolute inset-y-0 left-0 w-[2px] pointer-events-none z-20"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)",
              }}
            />
            <div
              aria-hidden
              className="absolute inset-y-0 right-0 w-[2px] pointer-events-none z-20"
              style={{
                background:
                  "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.5) 100%)",
              }}
            />

            <div className="relative z-30 h-full container mx-auto px-5 flex flex-col justify-end pb-8 sm:pb-14">
          <div className={`max-w-2xl ${FADE} delay-300`} style={{ textShadow: "0 2px 16px rgba(0,0,0,0.55)" }}>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4 bg-white/[0.12] backdrop-blur-md border border-white/25 text-[10px] uppercase tracking-[0.3em] text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Wolfion · 2026 Edition
            </div>
            <h1
              className="text-6xl sm:text-8xl font-light leading-[0.92] tracking-tight"
              style={{
                background:
                  "linear-gradient(135deg, #ffffff 0%, #B8E8EC 45%, #D4AF37 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 4px 18px rgba(0,0,0,0.45))",
              }}
            >
              WOLFION
            </h1>
            <p className="mt-4 text-xl sm:text-3xl text-white font-light tracking-wide leading-snug">
              Let your fashion <span className="font-serif italic">speak</span> before you do.
            </p>
            <p className="mt-2 text-[11px] sm:text-xs text-white/90 font-medium tracking-[0.18em] uppercase">
              Built different. Own the rest.
            </p>
            <div className="mt-6">
              <Link href="/products">
                <button
                  className="group relative bg-gradient-to-r from-white via-white to-[#F2E5C0] text-neutral-900 px-7 h-11 rounded-full text-[13px] font-medium tracking-[0.15em] uppercase active:scale-[0.98] transition-all inline-flex items-center shadow-[0_15px_40px_-10px_rgba(255,255,255,0.5)] hover:shadow-[0_20px_50px_-10px_rgba(212,175,55,0.6)]"
                  data-testid="hero-shop-now"
                >
                  Shop Now <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
            </div>
          </div>
        </div>

            {/* Scroll cue */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/60 text-[10px] uppercase tracking-[0.4em] animate-bounce z-30">
              Scroll
            </div>
          </div>
        </div>
      </section>

      {/* 2 — BRAND STORY (glass card) */}
      <section className="relative container mx-auto px-5 py-8 sm:py-10 overflow-hidden">
        <div className={`relative max-w-2xl mx-auto ${FADE}`}>
          {/* Halo */}
          <div
            aria-hidden
            className="absolute -inset-2 rounded-[26px] blur-xl opacity-25 pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, #1ABBC4 0%, #6E3CFB 50%, #D4AF37 100%)",
            }}
          />
          {/* Gradient border */}
          <div
            className="relative rounded-[20px] p-[1px]"
            style={{
              background:
                "linear-gradient(135deg, rgba(26,187,196,0.5) 0%, rgba(110,60,251,0.3) 50%, rgba(212,175,55,0.5) 100%)",
            }}
          >
            <div
              className="relative rounded-[19px] px-5 sm:px-8 py-5 sm:py-6 text-center border border-white/40 dark:border-white/10"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.6) 100%)",
                backdropFilter: "blur(20px) saturate(140%)",
                WebkitBackdropFilter: "blur(20px) saturate(140%)",
              }}
            >
              <div className="dark:hidden absolute inset-0 -z-10 rounded-[19px] bg-white/70" />
              <div
                className="hidden dark:block absolute inset-0 -z-10 rounded-[19px]"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(15,25,35,0.9) 0%, rgba(8,18,28,0.95) 100%)",
                }}
              />
              <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 mb-2 bg-neutral-900/5 dark:bg-white/[0.06] border border-neutral-200 dark:border-white/10 text-[9px] uppercase tracking-[0.25em] text-neutral-600 dark:text-white/70">
                <Sparkles className="h-2.5 w-2.5 text-amber-500" />
                The Brand
              </div>
              <p className="text-sm sm:text-base font-light leading-[1.5] tracking-tight text-neutral-900 dark:text-neutral-50">
                Wolfion isn't just a brand —{" "}
                <span className="font-serif italic font-medium text-[#0E8B92] dark:text-[#5BD4DC]">
                  it's personality, comfort, identity & fashion
                </span>
                <span className="text-neutral-700 dark:text-neutral-300">, built from the ground up.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 — BAPARI SOCKS · Engineered Comfort */}
      <section className="relative container mx-auto px-5 pb-20 sm:pb-24 overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-[10%] left-[40%] h-[50vh] w-[50vh] rounded-full opacity-20 blur-[120px] pointer-events-none"
          style={{
            background: "radial-gradient(circle, #1ABBC4 0%, transparent 70%)",
          }}
        />

        <div className={`relative flex items-end justify-between mb-10 ${FADE}`}>
          <div>
            <p className="text-[11px] uppercase tracking-[0.5em] text-neutral-500 mb-3">Bapari Socks</p>
            <h2
              className="text-4xl sm:text-5xl font-light tracking-tight"
              style={{
                background:
                  "linear-gradient(135deg, currentColor 0%, #1ABBC4 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Engineered Comfort
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden sm:inline-flex items-center text-sm font-medium hover:text-[#1ABBC4] transition-colors"
          >
            View all <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6" style={{ perspective: "1200px" }}>
          {sockCats.map((c, i) => (
            <Link
              key={c.id}
              href={`/products?category=${c.id}`}
              className={`group block ${FADE}`}
              style={{ animationDelay: `${i * 120}ms` }}
              data-testid={`home-sock-${c.id}`}
            >
              <div className="relative" style={{ transformStyle: "preserve-3d" }}>
                {/* Glow halo on hover */}
                <div
                  aria-hidden
                  className="absolute -inset-1 rounded-3xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(135deg, #1ABBC4 0%, #D4AF37 100%)",
                  }}
                />
                {/* Gradient border */}
                <div
                  className="relative rounded-3xl p-[1px] transition-transform duration-700 group-hover:-translate-y-2 group-hover:rotate-[0.5deg]"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(26,187,196,0.3) 50%, rgba(212,175,55,0.3) 100%)",
                  }}
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[23px] bg-neutral-100 dark:bg-neutral-900 shadow-lg group-hover:shadow-2xl transition-shadow duration-700">
                    <img
                      src={c.image}
                      alt={c.label}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
                    />
                    {/* Glossy sheen */}
                    <div
                      aria-hidden
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)",
                      }}
                    />
                    {/* Liquid Glass label chip — dark glass for readability on any photo */}
                    <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3">
                      <div
                        className="rounded-2xl px-3 py-2.5 border border-white/15 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.5)]"
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(8,18,28,0.62) 0%, rgba(8,18,28,0.45) 100%)",
                          backdropFilter: "blur(20px) saturate(170%)",
                          WebkitBackdropFilter: "blur(20px) saturate(170%)",
                        }}
                      >
                        <h3 className="text-[13px] sm:text-sm font-semibold text-white tracking-wide leading-tight drop-shadow-sm">{c.label}</h3>
                        <p className="text-[10px] sm:text-[11px] text-white/90 mt-0.5 font-light leading-tight truncate">{c.tagline}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4 — COLLECTION · Everyday Essentials */}
      <section className="relative container mx-auto px-5 pb-24 sm:pb-28 overflow-hidden">
        <div
          aria-hidden
          className="absolute top-[20%] right-[10%] h-[45vh] w-[45vh] rounded-full opacity-20 blur-[120px] pointer-events-none"
          style={{
            background: "radial-gradient(circle, #D4AF37 0%, transparent 70%)",
          }}
        />

        <div className={`relative flex items-end justify-between mb-10 ${FADE}`}>
          <div>
            <p className="text-[11px] uppercase tracking-[0.5em] text-neutral-500 mb-3">Collection</p>
            <h2
              className="text-4xl sm:text-5xl font-light tracking-tight"
              style={{
                background:
                  "linear-gradient(135deg, currentColor 0%, #D4AF37 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Everyday Essentials
            </h2>
          </div>
        </div>

        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6" style={{ perspective: "1200px" }}>
          {[
            { href: "/products?collection=mens", img: imgPortrait, label: "Menswear", pos: "object-[center_25%]" },
            { href: "/products?collection=womens", img: imgWomenswear, label: "Womenswear", pos: "object-center" },
            { href: "/products?collection=kids", img: imgKidswear, label: "Kidswear", pos: "object-center" },
            { href: "/products", img: imgSocks, label: "Socks", pos: "object-center" },
          ].map((col, i) => (
            <Link
              key={col.label}
              href={col.href}
              className={`group block ${FADE}`}
              style={{ animationDelay: `${i * 120}ms` }}
              data-testid={`home-collection-${col.label.toLowerCase()}`}
            >
              <div className="relative" style={{ transformStyle: "preserve-3d" }}>
                <div
                  aria-hidden
                  className="absolute -inset-1 rounded-3xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(135deg, #6E3CFB 0%, #1ABBC4 100%)",
                  }}
                />
                <div
                  className="relative rounded-3xl p-[1px] transition-transform duration-700 group-hover:-translate-y-2 group-hover:-rotate-[0.5deg]"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(110,60,251,0.3) 50%, rgba(26,187,196,0.3) 100%)",
                  }}
                >
                  <div className="relative aspect-[3/4] rounded-[23px] overflow-hidden shadow-lg group-hover:shadow-2xl transition-shadow duration-700">
                    <img
                      src={col.img}
                      alt={col.label}
                      className={`absolute inset-0 h-full w-full object-cover ${col.pos} transition-transform duration-[1200ms] group-hover:scale-105`}
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)",
                      }}
                    />
                    {/* Liquid Glass label chip — dark glass for readability on any photo */}
                    <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3">
                      <div
                        className="rounded-2xl px-3 py-2.5 border border-white/15 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.5)]"
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(8,18,28,0.62) 0%, rgba(8,18,28,0.45) 100%)",
                          backdropFilter: "blur(20px) saturate(170%)",
                          WebkitBackdropFilter: "blur(20px) saturate(170%)",
                        }}
                      >
                        <p className="text-[9px] uppercase tracking-[0.35em] text-white/85 leading-none">Collection</p>
                        <h3 className="text-[15px] sm:text-base font-semibold text-white tracking-wide leading-tight mt-1 drop-shadow-sm">{col.label}</h3>
                        <span className="inline-flex items-center mt-1 text-[11px] text-white/95 font-light">
                          Shop now <ArrowRight className="ml-1.5 h-3 w-3 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5 — EDITORIAL CRAFT BANNER · 3D Glass framed photo */}
      <section className="relative container mx-auto px-4 sm:px-5 py-8 sm:py-12 overflow-visible">
        <div className={`relative max-w-5xl mx-auto ${FADE}`} style={{ perspective: "1400px" }}>
          {/* Glow halo behind the photo */}
          <div
            aria-hidden
            className="absolute -inset-3 sm:-inset-5 rounded-[34px] blur-2xl opacity-50 pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, #1ABBC4 0%, #6E3CFB 50%, #D4AF37 100%)",
            }}
          />
          {/* Gradient ring */}
          <div
            className="relative rounded-[28px] p-[1.5px] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.55)]"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(26,187,196,0.45) 35%, rgba(110,60,251,0.4) 65%, rgba(212,175,55,0.55) 100%)",
              transformStyle: "preserve-3d",
            }}
          >
            <div
              className="relative rounded-[26px] overflow-hidden h-[42vh] min-h-[320px] sm:h-[55vh] sm:min-h-[420px]"
            >
              <img
                src={imgSocks}
                alt="Wolfion craftsmanship"
                className="absolute inset-0 h-full w-full object-cover"
              />
              {/* Bottom darkening gradient for text */}
              <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-black/55 via-black/25 to-transparent pointer-events-none" />
              {/* Top glossy highlight (glass sheen) */}
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-1/3 pointer-events-none rounded-t-[26px]"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, transparent 100%)",
                }}
              />
              {/* Diagonal sheen */}
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none rounded-[26px]"
                style={{
                  background:
                    "linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.08) 50%, transparent 65%)",
                }}
              />

              {/* Text content overlay */}
              <div className="relative z-10 h-full flex items-center px-5 sm:px-10">
                <div style={{ textShadow: "0 2px 16px rgba(0,0,0,0.6)" }}>
                  <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4 bg-white/[0.12] backdrop-blur-md border border-white/25 text-[10px] uppercase tracking-[0.3em] text-white">
                    <Sparkles className="h-3 w-3 text-amber-300" />
                    The Craft
                  </div>
                  <h2
                    className="text-4xl sm:text-6xl font-light leading-[1.05] tracking-tight text-white"
                    style={{ filter: "drop-shadow(0 4px 18px rgba(0,0,0,0.5))" }}
                  >
                    Every stitch
                    <br />
                    <span
                      className="font-serif italic"
                      style={{
                        background:
                          "linear-gradient(135deg, #B8E8EC 0%, #D4AF37 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      considered.
                    </span>
                  </h2>
                  <p className="mt-4 text-sm sm:text-base text-white/95 leading-relaxed font-light max-w-sm">
                    Spun from Pima cotton and Italian merino. Tensioned by hand. Finished without compromise.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes wf-blob1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(8%, 12%) scale(1.15); }
        }
        @keyframes wf-blob2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-10%, -8%) scale(1.12); }
        }
        @keyframes wf-blob3 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.25; }
          50% { transform: translate(-6%, 4%) scale(1.2); opacity: 0.35; }
        }
      `}</style>
    </ShopLayout>
  );
}
