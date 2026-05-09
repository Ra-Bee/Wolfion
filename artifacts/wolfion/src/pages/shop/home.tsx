import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { ArrowRight, Sparkles } from "lucide-react";
import { ShopLayout } from "@/components/shop-layout";
import { categories } from "@/lib/data";
import imgPortrait from "@assets/Image_20260416035728_55_2_1776716993092.jpg";
import imgSocks from "@assets/optimized/wolfion_socks.jpg";
import imgWomenswear from "@assets/optimized/wolfion_womenswear.jpg";
import imgKidswear from "@assets/optimized/wolfion_kidswear.jpg";
import imgBoxBlack from "@assets/Image_20260429195426_80_2_1777463848826.jpg";
import imgBoxNavy from "@assets/Image_20260429195427_81_2_1777463848828.jpg";
import imgBoxGreen from "@assets/Image_20260429195428_82_2_1777463848828.jpg";
import imgBoxWhite from "@assets/Image_20260429195430_83_2_1777463848828.jpg";
import imgExperienceSource from "@assets/optimized/wolfion_experience_source.jpg";

const FADE = "animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both";

export default function ShopHome() {
  const sockCats = categories;
  const heroFrameRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const frame = heroFrameRef.current;
    const img = heroImgRef.current;
    if (!frame) return;
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = frame.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const rx = (y - 0.5) * -6;
        const ry = (x - 0.5) * 6;
        frame.style.setProperty("--rx", `${rx}deg`);
        frame.style.setProperty("--ry", `${ry}deg`);
        if (img) {
          img.style.transform = `translate3d(${(x - 0.5) * -14}px, ${(y - 0.5) * -10}px, 0) scale(1.08)`;
        }
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      frame.style.setProperty("--rx", "0deg");
      frame.style.setProperty("--ry", "0deg");
      if (img) img.style.transform = "translate3d(0,0,0) scale(1.05)";
    };
    const parent = frame.parentElement;
    parent?.addEventListener("mousemove", onMove);
    parent?.addEventListener("mouseleave", onLeave);
    return () => {
      parent?.removeEventListener("mousemove", onMove);
      parent?.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <ShopLayout>
      {/* 1 — HERO */}
      <section
        className="relative w-full bg-white dark:bg-neutral-950 px-3 pt-3 pb-5 sm:px-5 sm:pt-5 sm:pb-8 overflow-hidden"
        style={{ perspective: "1400px" }}
      >
        {/* Soft warm halo — gentle amber glow behind the frame */}
        <div
          aria-hidden
          className="absolute inset-2 sm:inset-4 rounded-[24px] sm:rounded-[32px] blur-2xl pointer-events-none hero-halo-pulse"
          style={{
            background:
              "linear-gradient(135deg, #E5D4A8 0%, #FB923C 60%, #F472B6 100%)",
          }}
        />

        {/* 3D beveled frame — warm-tinted bevel (light top-left, deep bottom-right) */}
        <div
          ref={heroFrameRef}
          className="relative rounded-[24px] sm:rounded-[32px] p-[2px] sm:p-[3px] hero-frame-3d"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(252,211,77,0.45) 35%, rgba(0,0,0,0.25) 70%, rgba(0,0,0,0.6) 100%)",
            boxShadow:
              "0 24px 60px -22px rgba(0,0,0,0.5), 0 6px 22px -10px rgba(190,160,110,0.25), inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.4)",
            transformStyle: "preserve-3d",
            transform:
              "rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))",
            transition: "transform 280ms cubic-bezier(0.22, 1, 0.36, 1)",
            willChange: "transform",
          }}
        >
          {/* Animated sheen sweep across the bevel */}
          <div
            aria-hidden
            className="absolute inset-0 rounded-[24px] sm:rounded-[32px] pointer-events-none overflow-hidden"
          >
            <div
              className="absolute -inset-[100%] hero-sheen"
              style={{
                background:
                  "linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.5) 50%, transparent 65%)",
              }}
            />
          </div>
          {/* Inner photo container */}
          <div
            className="relative h-[72svh] min-h-[460px] sm:h-[86svh] sm:min-h-[580px] w-full overflow-hidden rounded-[21px] sm:rounded-[28px] bg-black text-white"
            style={{
              boxShadow:
                "inset 0 2px 0 rgba(255,255,255,0.32), inset 0 -2px 14px rgba(0,0,0,0.6), inset 0 0 80px rgba(0,0,0,0.4)",
            }}
          >
            <div aria-hidden className="absolute inset-0" style={{ backgroundColor: "#2d2521" }} />
            <img
              ref={heroImgRef}
              src={imgPortrait}
              alt="Wolfion campaign"
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover object-[center_75%] scale-105 animate-in fade-in zoom-in-95 duration-[2000ms] fill-mode-both"
              style={{
                transition: "transform 380ms cubic-bezier(0.22, 1, 0.36, 1)",
                transform: "translateZ(0)",
                backfaceVisibility: "hidden",
              }}
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
            <p className="text-[11px] uppercase tracking-[0.5em] text-neutral-500 dark:text-neutral-400 mb-3">Bapari Socks</p>
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
                    <div aria-hidden className="absolute inset-0 bg-[#e8ddd2] dark:bg-[#2d2521]" />
                    <img
                      src={c.image}
                      alt={c.label}
                      loading="lazy"
                      decoding="async"
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
            <p className="text-[11px] uppercase tracking-[0.5em] text-neutral-500 dark:text-neutral-400 mb-3">Collection</p>
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
                    <div aria-hidden className="absolute inset-0 bg-[#e8ddd2] dark:bg-[#2d2521]" />
                    <img
                      src={col.img}
                      alt={col.label}
                      loading="lazy"
                      decoding="async"
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

      {/* 4.5 — THE WOLFION BOX · Premium packaging in 4 colorways */}
      <section className="relative container mx-auto px-4 sm:px-5 pb-16 sm:pb-20">
        <div className={`text-center mb-6 sm:mb-10 ${FADE}`}>
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-3 bg-gradient-to-r from-amber-100/60 to-pink-100/60 dark:from-amber-900/30 dark:to-pink-900/30 border border-amber-200/60 dark:border-amber-800/40 text-[10px] uppercase tracking-[0.3em] text-amber-700 dark:text-amber-300">
            <Sparkles className="h-3 w-3" />
            The Wolfion Box
          </div>
          <h2 className="text-3xl sm:text-5xl font-light tracking-tight text-neutral-900 dark:text-white">
            Premium packaging,{" "}
            <span
              className="font-serif italic"
              style={{
                background:
                  "linear-gradient(135deg, #9C5872 0%, #C9A66B 50%, #9B85A8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              four signatures.
            </span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto font-light">
            Designed in Australia, manufactured in Dhaka. Each pair arrives in a magnetic-close box with foil-stamped monogram.
          </p>
        </div>

        <div className={`grid grid-cols-2 gap-3 sm:gap-5 ${FADE}`}>
          {[
            { src: imgBoxBlack, label: "Onyx Black", accent: "from-neutral-900 to-amber-600" },
            { src: imgBoxNavy, label: "Midnight Navy", accent: "from-blue-900 to-slate-400" },
            { src: imgBoxGreen, label: "Forest Green", accent: "from-emerald-900 to-amber-700" },
            { src: imgBoxWhite, label: "Pearl White", accent: "from-neutral-100 to-amber-500" },
          ].map((box) => (
            <div
              key={box.label}
              className="group relative rounded-xl sm:rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_45px_-15px_rgba(0,0,0,0.4)] transition-all duration-500 hover:-translate-y-0.5"
            >
              <div className="relative aspect-square overflow-hidden">
                <div aria-hidden className="absolute inset-0 bg-[#e8ddd2] dark:bg-[#2d2521]" />
                <img
                  src={box.src}
                  alt={`Wolfion packaging — ${box.label}`}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{
                    background:
                      "linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.18) 50%, transparent 65%)",
                  }}
                />
              </div>
              <div className="flex items-center justify-between gap-2 px-2.5 sm:px-4 py-2 sm:py-3 border-t border-black/5 dark:border-white/10">
                <span className="text-[11px] sm:text-sm font-medium tracking-wide text-neutral-900 dark:text-white truncate">
                  {box.label}
                </span>
                <span
                  className={`h-2 w-5 sm:h-3 sm:w-8 rounded-full bg-gradient-to-r ${box.accent} ring-1 ring-black/10 flex-shrink-0`}
                  aria-hidden
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4.6 — EXPERIENCE THE SOURCE · Branded heritage card (square corners) */}
      <section className="relative container mx-auto px-4 sm:px-5 pb-16 sm:pb-20">
        <div className={`relative max-w-6xl mx-auto ${FADE}`}>
          {/* Soft emerald + copper halo */}
          <div
            aria-hidden
            className="absolute -inset-3 sm:-inset-5 blur-2xl opacity-40 pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, #064E3B 0%, #B45309 60%, #E5D4A8 100%)",
            }}
          />
          {/* Copper-tinted bevel ring (sharp corners) */}
          <div
            className="relative p-[2px] sm:p-[3px] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.5)]"
            style={{
              background:
                "linear-gradient(135deg, rgba(252,211,77,0.55) 0%, rgba(180,83,9,0.45) 50%, rgba(0,0,0,0.55) 100%)",
            }}
          >
            <div className="relative overflow-hidden bg-emerald-950">
              <div aria-hidden className="absolute inset-0" style={{ backgroundColor: "#1f3329" }} />
              <img
                src={imgExperienceSource}
                alt="Wolfion Bapari Socks — Experience the Source"
                loading="lazy"
                decoding="async"
                className="relative block w-full h-auto"
              />
              {/* Subtle top sheen for the glass feel */}
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-1/3 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, transparent 100%)",
                }}
              />
            </div>
          </div>
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
              <div aria-hidden className="absolute inset-0 bg-[#e8ddd2] dark:bg-[#2d2521]" />
              <img
                src={imgSocks}
                alt="Wolfion craftsmanship"
                loading="lazy"
                decoding="async"
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
        @keyframes wf-hero-float {
          0%, 100% { transform: translateY(0) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)); }
          50% { transform: translateY(-6px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)); }
        }
        @keyframes wf-hero-sheen {
          0% { transform: translateX(-60%) rotate(8deg); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateX(60%) rotate(8deg); opacity: 0; }
        }
        @keyframes wf-hero-halo {
          0%, 100% { opacity: 0.22; transform: scale(1); }
          50% { opacity: 0.36; transform: scale(1.04); }
        }
        .hero-frame-3d {
          animation: wf-hero-float 7s ease-in-out infinite;
        }
        .hero-sheen {
          animation: wf-hero-sheen 6.5s ease-in-out infinite;
          animation-delay: 1.2s;
        }
        .hero-halo-pulse {
          animation: wf-hero-halo 5.5s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-frame-3d, .hero-sheen, .hero-halo-pulse { animation: none !important; }
        }
        /* On touch / coarse-pointer devices (i.e. phones) the constantly-
           running sheen sweep + halo pulse + float repaint a huge blurred
           layer every frame. When the user scrolls past the hero the
           compositor has to keep doing that work in parallel with the
           scroll, which causes a visible micro-flicker on lower-end
           Androids. Disable those continuous animations on touch devices
           and pin the frame to its own GPU layer so scroll stays smooth.
           The 3D mouse-tilt is pointer-only anyway. */
        @media (hover: none), (pointer: coarse) {
          .hero-frame-3d,
          .hero-sheen,
          .hero-halo-pulse {
            animation: none !important;
          }
          .hero-frame-3d {
            transform: translateZ(0) !important;
            will-change: auto !important;
          }
        }
        /* Dark mode: tone down the warm amber/peach halo and the gold
           bevel frame around the hero photo so the surrounding shine
           doesn't overpower the dark UI. The photo itself stays untouched
           — only the glass/halo around it is muted. */
        .dark .hero-halo-pulse {
          opacity: 0.35 !important;
          filter: saturate(0.55) hue-rotate(-8deg);
        }
        .dark .hero-frame-3d {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.45) 0%,
            rgba(255, 255, 255, 0.12) 35%,
            rgba(0, 0, 0, 0.45) 70%,
            rgba(0, 0, 0, 0.7) 100%
          ) !important;
          box-shadow:
            0 24px 60px -22px rgba(0, 0, 0, 0.65),
            0 6px 22px -10px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.18),
            inset 0 -1px 0 rgba(0, 0, 0, 0.55) !important;
        }
      `}</style>
    </ShopLayout>
  );
}
