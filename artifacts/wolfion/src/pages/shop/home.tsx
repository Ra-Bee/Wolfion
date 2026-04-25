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
      <section className="relative h-[75svh] min-h-[480px] sm:h-[90svh] sm:min-h-[600px] w-full overflow-hidden bg-black text-white">
        <img
          src={imgPortrait}
          alt="Wolfion campaign"
          className="absolute inset-0 h-full w-full object-cover object-[center_75%] scale-105 animate-in fade-in zoom-in-95 duration-[2000ms] fill-mode-both"
        />
        {/* Soft bottom-only gradient so the glass card has contrast without covering the model */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent pointer-events-none" />

        <div className="relative z-10 h-full container mx-auto px-4 flex flex-col justify-end pb-6 sm:pb-12">
          <div
            className={`relative max-w-2xl ${FADE} delay-300`}
          >
            {/* iOS-style Liquid Glass card */}
            <div
              className="rounded-[28px] p-[1px]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.3) 100%)",
              }}
            >
              <div
                className="rounded-[27px] px-6 py-7 sm:px-9 sm:py-9 border border-white/15 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)]"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.06) 100%)",
                  backdropFilter: "blur(24px) saturate(170%)",
                  WebkitBackdropFilter: "blur(24px) saturate(170%)",
                }}
              >
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4 bg-white/[0.10] backdrop-blur-md border border-white/20 text-[10px] uppercase tracking-[0.3em] text-white/90">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Wolfion · 2026 Edition
                </div>
                <h1
                  className="text-5xl sm:text-7xl font-light leading-[0.95] tracking-tight"
                  style={{
                    background:
                      "linear-gradient(135deg, #ffffff 0%, #B8E8EC 45%, #D4AF37 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  WOLFION
                </h1>
                <p className="mt-3 text-lg sm:text-2xl text-white/95 font-light tracking-wide leading-snug">
                  Let your fashion <span className="font-serif italic text-white">speak</span> before you do.
                </p>
                <p className="mt-2 text-[11px] sm:text-xs text-white/70 font-light tracking-[0.18em] uppercase">
                  Built different. Own the rest.
                </p>
                <div className="mt-5">
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
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/60 text-[10px] uppercase tracking-[0.4em] animate-bounce">
          Scroll
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
                <span
                  className="font-serif italic"
                  style={{
                    background:
                      "linear-gradient(135deg, #1ABBC4 0%, #D4AF37 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  it's personality, comfort, identity & fashion
                </span>
                <span className="text-neutral-500 dark:text-neutral-400">, built from the ground up.</span>
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
                    {/* Liquid Glass label chip */}
                    <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3">
                      <div
                        className="rounded-2xl px-3 py-2.5 border border-white/25 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.4)]"
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 100%)",
                          backdropFilter: "blur(20px) saturate(170%)",
                          WebkitBackdropFilter: "blur(20px) saturate(170%)",
                        }}
                      >
                        <h3 className="text-[13px] sm:text-sm font-semibold text-white tracking-wide leading-tight">{c.label}</h3>
                        <p className="text-[10px] sm:text-[11px] text-white/85 mt-0.5 font-light leading-tight truncate">{c.tagline}</p>
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
                    {/* Liquid Glass label chip */}
                    <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3">
                      <div
                        className="rounded-2xl px-3 py-2.5 border border-white/25 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.4)]"
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 100%)",
                          backdropFilter: "blur(20px) saturate(170%)",
                          WebkitBackdropFilter: "blur(20px) saturate(170%)",
                        }}
                      >
                        <p className="text-[9px] uppercase tracking-[0.35em] text-white/75 leading-none">Collection</p>
                        <h3 className="text-[15px] sm:text-base font-semibold text-white tracking-wide leading-tight mt-1">{col.label}</h3>
                        <span className="inline-flex items-center mt-1 text-[11px] text-white/85 font-light">
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

      {/* 5 — EDITORIAL CRAFT BANNER */}
      <section className="relative h-[42vh] min-h-[300px] sm:h-[55vh] sm:min-h-[400px] overflow-hidden">
        <img src={imgSocks} alt="Wolfion craftsmanship" className="absolute inset-0 h-full w-full object-cover" />
        {/* subtle left-side gradient only, photo stays clean */}
        <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-black/45 to-transparent pointer-events-none" />
        <div className="relative z-10 h-full container mx-auto px-4 sm:px-5 flex items-center">
          <div className={`max-w-md ${FADE}`}>
            {/* iOS Liquid Glass card */}
            <div
              className="rounded-[24px] p-[1px]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.3) 100%)",
              }}
            >
              <div
                className="rounded-[23px] px-5 py-5 sm:px-7 sm:py-7 border border-white/15 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)]"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.06) 100%)",
                  backdropFilter: "blur(22px) saturate(170%)",
                  WebkitBackdropFilter: "blur(22px) saturate(170%)",
                }}
              >
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-3 bg-white/[0.10] backdrop-blur-md border border-white/20 text-[10px] uppercase tracking-[0.3em] text-white/90">
                  <Sparkles className="h-3 w-3 text-amber-300" />
                  The Craft
                </div>
                <h2 className="text-3xl sm:text-5xl font-light leading-[1.05] tracking-tight text-white">
                  Every stitch
                  <br />
                  <span
                    className="font-serif italic"
                    style={{
                      background: "linear-gradient(135deg, #B8E8EC 0%, #D4AF37 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    considered.
                  </span>
                </h2>
                <p className="mt-3 text-[13px] sm:text-sm text-white/90 leading-relaxed font-light">
                  Spun from Pima cotton and Italian merino. Tensioned by hand. Finished without compromise.
                </p>
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
