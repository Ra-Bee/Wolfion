import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { ShopLayout } from "@/components/shop-layout";
import { ProductCard } from "@/components/product-card";
import { products, categories } from "@/lib/data";
import imgPortrait from "@assets/Image_20260416035728_55_2_1776716993092.jpg";
import imgSocks from "@assets/Image_20260416025624_54_2_1776717008197.jpg";

const FADE = "animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both";

export default function ShopHome() {
  const sockCats = categories.filter((c) => c.id !== "others").slice(0, 3);
  const featured = products.slice(0, 4);

  return (
    <ShopLayout>
      {/* 1 — HERO */}
      <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-black text-white">
        <img
          src={imgPortrait}
          alt="Ultion campaign"
          className="absolute inset-0 h-full w-full object-cover opacity-80 scale-105 animate-in fade-in zoom-in-95 duration-[2000ms] fill-mode-both"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
        <div className="relative z-10 h-full container mx-auto px-5 flex flex-col justify-end pb-20 sm:pb-28">
          <div className={`max-w-3xl ${FADE} delay-300`}>
            <p className="text-[11px] uppercase tracking-[0.5em] text-white/70 mb-5">Ultion · 2026</p>
            <h1 className="text-6xl sm:text-8xl font-light leading-[0.92] tracking-tight">
              ULTION
            </h1>
            <p className="mt-5 text-xl sm:text-2xl text-white/85 font-light tracking-wide">
              Built Different. <span className="font-serif italic text-white">Worn Better.</span>
            </p>
            <div className="mt-10">
              <Link href="/products">
                <button
                  className="bg-white text-neutral-900 px-9 h-13 py-4 rounded-full text-sm font-medium tracking-[0.15em] uppercase hover:bg-neutral-100 active:scale-[0.98] transition-all inline-flex items-center shadow-2xl"
                  data-testid="hero-shop-now"
                >
                  Shop Now <ArrowRight className="ml-2.5 h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-[10px] uppercase tracking-[0.4em] animate-bounce">
          Scroll
        </div>
      </section>

      {/* 2 — BRAND STORY */}
      <section className="container mx-auto px-5 py-28 sm:py-40">
        <div className={`max-w-3xl mx-auto text-center ${FADE}`}>
          <p className="text-[11px] uppercase tracking-[0.5em] text-neutral-500 mb-8">The brand</p>
          <p className="text-2xl sm:text-4xl font-light leading-[1.35] tracking-tight text-neutral-900 dark:text-neutral-50">
            Ultion is not just socks.
            <br />
            <span className="font-serif italic">It's precision, comfort, and identity</span>
            <br className="hidden sm:block" />
            <span className="text-neutral-500"> — built from the ground up.</span>
          </p>
        </div>
      </section>

      {/* 3A — VAPORYX · Engineered Comfort */}
      <section className="container mx-auto px-5 pb-28 sm:pb-32">
        <div className={`flex items-end justify-between mb-12 ${FADE}`}>
          <div>
            <p className="text-[11px] uppercase tracking-[0.5em] text-neutral-500 mb-3">Vaporyx</p>
            <h2 className="text-4xl sm:text-5xl font-light tracking-tight">Engineered Comfort</h2>
          </div>
          <Link href="/products" className="hidden sm:inline-flex items-center text-sm font-medium hover:underline">
            View all <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-7">
          {sockCats.map((c, i) => (
            <Link
              key={c.id}
              href={`/products?category=${c.id}`}
              className={`group block ${FADE}`}
              style={{ animationDelay: `${i * 120}ms` }}
              data-testid={`home-sock-${c.id}`}
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-neutral-100 dark:bg-neutral-900 shadow-lg transition-all duration-700 group-hover:shadow-2xl group-hover:-translate-y-1.5">
                <img
                  src={c.image}
                  alt={c.label}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h3 className="text-xl font-medium tracking-wide">{c.label}</h3>
                  <p className="text-xs text-white/80 mt-1 font-light">{c.tagline}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4 — FEATURED DROPS */}
      <section className="container mx-auto px-5 pb-28 sm:pb-32">
        <div className={`text-center mb-14 ${FADE}`}>
          <p className="text-[11px] uppercase tracking-[0.5em] text-neutral-500 mb-3">This week</p>
          <h2 className="text-4xl sm:text-5xl font-light tracking-tight">Featured Drops</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-7">
          {featured.map((p, i) => (
            <div
              key={p.id}
              className={FADE}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
        <div className="text-center mt-14">
          <Link href="/products">
            <button className="border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-50 px-9 h-12 rounded-full text-sm font-medium tracking-[0.15em] uppercase hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 transition-all">
              Shop All
            </button>
          </Link>
        </div>
      </section>

      {/* 5 — EDITORIAL CRAFT BANNER */}
      <section className="relative h-[70vh] min-h-[480px] overflow-hidden">
        <img src={imgSocks} alt="Ultion craftsmanship" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
        <div className="relative z-10 h-full container mx-auto px-5 flex items-center">
          <div className={`max-w-lg text-white ${FADE}`}>
            <p className="text-[11px] uppercase tracking-[0.5em] text-white/70 mb-5">The craft</p>
            <h2 className="text-4xl sm:text-6xl font-light leading-[1.05] tracking-tight">
              Every stitch<br /><span className="font-serif italic">considered.</span>
            </h2>
            <p className="mt-6 text-base text-white/85 leading-relaxed font-light max-w-md">
              Spun from Pima cotton and Italian merino. Tensioned by hand. Finished without compromise.
            </p>
          </div>
        </div>
      </section>
    </ShopLayout>
  );
}
