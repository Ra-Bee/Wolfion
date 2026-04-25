import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { ShopLayout } from "@/components/shop-layout";
import { ProductCard } from "@/components/product-card";
import { categories, products } from "@/lib/data";
import imgPortrait from "@assets/Image_20260416035728_55_2_1776716993092.jpg";
import imgSocks from "@assets/Image_20260416025624_54_2_1776717008197.jpg";
import imgWomenswear from "@assets/wolfion_womenswear.png";
import imgKidswear from "@assets/wolfion_kidswear.png";

const FADE = "animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both";

export default function ShopHome() {
  // Featured = bestsellers + new
  const featured = products
    .filter((p) => p.badge === "bestseller" || p.badge === "new")
    .slice(0, 8);

  // 4 spotlight categories for the home grid
  const spotlightCats = categories.filter((c) =>
    ["tees", "hoodies", "outerwear", "accessories"].includes(c.id),
  );

  // Sock subset for the Bapari Socks section
  const sockProducts = products.filter((p) => p.category === "socks").slice(0, 3);

  return (
    <ShopLayout>
      {/* 1 — HERO */}
      <section className="relative h-[75svh] min-h-[480px] sm:h-[90svh] sm:min-h-[600px] w-full overflow-hidden bg-black text-white">
        <img
          src={imgPortrait}
          alt="Wolfion campaign"
          className="absolute inset-0 h-full w-full object-cover object-[center_75%] opacity-80 scale-105 animate-in fade-in zoom-in-95 duration-[2000ms] fill-mode-both"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/30" />
        <div className="relative z-10 h-full container mx-auto px-5 flex flex-col justify-end pb-12 sm:pb-24">
          <div className={`max-w-3xl ${FADE} delay-300`}>
            <p className="text-[11px] uppercase tracking-[0.5em] text-white/70 mb-5">Wolfion · 2026</p>
            <h1 className="text-6xl sm:text-8xl font-light leading-[0.92] tracking-tight">
              WOLFION
            </h1>
            <p className="mt-6 text-xl sm:text-3xl text-white/90 font-light tracking-wide leading-snug">
              Let your fashion <span className="font-serif italic text-white">speak</span> before you do.
            </p>
            <p className="mt-3 text-sm sm:text-base text-white/65 font-light tracking-[0.15em] uppercase">
              Built different. Own the rest.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/products">
                <button
                  className="bg-white text-neutral-900 px-9 h-13 py-4 rounded-full text-sm font-medium tracking-[0.15em] uppercase hover:bg-neutral-100 active:scale-[0.98] transition-all inline-flex items-center shadow-2xl"
                  data-testid="hero-shop-now"
                >
                  Shop Now <ArrowRight className="ml-2.5 h-4 w-4" />
                </button>
              </Link>
              <Link href="/products?collection=mens">
                <button
                  className="bg-transparent text-white border border-white/40 px-7 h-13 py-4 rounded-full text-sm font-medium tracking-[0.15em] uppercase hover:bg-white/10 active:scale-[0.98] transition-all inline-flex items-center"
                  data-testid="hero-mens"
                >
                  Menswear
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
      <section className="container mx-auto px-5 py-16 sm:py-20">
        <div className={`max-w-3xl mx-auto text-center ${FADE}`}>
          <p className="text-[11px] uppercase tracking-[0.5em] text-neutral-500 mb-5">The brand</p>
          <p className="text-xl sm:text-3xl font-light leading-[1.4] tracking-tight text-neutral-900 dark:text-neutral-50">
            Wolfion is not just a brand,
            <br />
            <span className="font-serif italic">it's a personality, comfort, identity, and fashion</span>
            <span className="text-neutral-500"> — built from the ground up.</span>
          </p>
        </div>
      </section>

      {/* 3 — FEATURED PRODUCTS */}
      {featured.length > 0 && (
        <section className="container mx-auto px-5 pb-20 sm:pb-24">
          <div className={`flex items-end justify-between mb-8 sm:mb-10 ${FADE}`}>
            <div>
              <p className="text-[11px] uppercase tracking-[0.5em] text-neutral-500 mb-3">This week</p>
              <h2 className="text-4xl sm:text-5xl font-light tracking-tight">Featured Pieces</h2>
            </div>
            <Link href="/products" className="hidden sm:inline-flex items-center text-sm font-medium hover:underline">
              View all <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-x-6 sm:gap-y-10">
            {featured.map((p, i) => (
              <div
                key={p.id}
                className={FADE}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <ProductCard product={p} />
              </div>
            ))}
          </div>
          <div className="mt-10 text-center sm:hidden">
            <Link href="/products" className="inline-flex items-center text-sm font-medium underline underline-offset-4">
              View all pieces <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      {/* 4 — SHOP BY CATEGORY */}
      <section className="container mx-auto px-5 pb-20 sm:pb-24">
        <div className={`flex items-end justify-between mb-8 sm:mb-10 ${FADE}`}>
          <div>
            <p className="text-[11px] uppercase tracking-[0.5em] text-neutral-500 mb-3">Shop the line</p>
            <h2 className="text-4xl sm:text-5xl font-light tracking-tight">Categories</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {spotlightCats.map((c, i) => (
            <Link
              key={c.id}
              href={`/products?category=${c.id}`}
              className={`group block ${FADE}`}
              style={{ animationDelay: `${i * 100}ms` }}
              data-testid={`home-category-${c.id}`}
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-neutral-100 dark:bg-neutral-900 shadow-lg transition-all duration-700 group-hover:shadow-2xl group-hover:-translate-y-1.5">
                <img
                  src={c.image}
                  alt={c.label}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <h3 className="text-lg sm:text-xl font-medium tracking-wide">{c.label}</h3>
                  <p className="text-[11px] sm:text-xs text-white/85 mt-1 font-light">{c.tagline}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5 — COLLECTIONS (Menswear / Womenswear / Kidswear) */}
      <section className="container mx-auto px-5 pb-24 sm:pb-28">
        <div className={`flex items-end justify-between mb-8 sm:mb-10 ${FADE}`}>
          <div>
            <p className="text-[11px] uppercase tracking-[0.5em] text-neutral-500 mb-3">Collections</p>
            <h2 className="text-4xl sm:text-5xl font-light tracking-tight">For everyone</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
          {[
            { href: "/products?collection=mens", img: imgPortrait, label: "Menswear", pos: "object-[center_25%]" },
            { href: "/products?collection=womens", img: imgWomenswear, label: "Womenswear", pos: "object-center" },
            { href: "/products?collection=kids", img: imgKidswear, label: "Kidswear", pos: "object-center" },
          ].map((col, i) => (
            <Link
              key={col.label}
              href={col.href}
              className={`group relative block aspect-[3/4] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-700 hover:-translate-y-1.5 ${FADE}`}
              style={{ animationDelay: `${i * 120}ms` }}
              data-testid={`home-collection-${col.label.toLowerCase()}`}
            >
              <img
                src={col.img}
                alt={col.label}
                className={`absolute inset-0 h-full w-full object-cover ${col.pos} transition-transform duration-[1200ms] group-hover:scale-105`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
              <div className="absolute bottom-7 left-7 right-7 text-white">
                <p className="text-[10px] uppercase tracking-[0.4em] text-white/80 mb-2">Collection</p>
                <h3 className="text-2xl sm:text-3xl font-light">{col.label}</h3>
                <span className="inline-flex items-center mt-3 text-sm font-medium">
                  Shop now <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6 — BAPARI SOCKS · Engineered Comfort */}
      {sockProducts.length > 0 && (
        <section className="container mx-auto px-5 pb-20 sm:pb-24">
          <div className={`flex items-end justify-between mb-8 sm:mb-10 ${FADE}`}>
            <div>
              <p className="text-[11px] uppercase tracking-[0.5em] text-neutral-500 mb-3">Bapari Socks</p>
              <h2 className="text-4xl sm:text-5xl font-light tracking-tight">Engineered Comfort</h2>
            </div>
            <Link href="/products?category=socks" className="hidden sm:inline-flex items-center text-sm font-medium hover:underline">
              View all <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-7">
            {sockProducts.map((p, i) => (
              <div
                key={p.id}
                className={FADE}
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7 — EDITORIAL CRAFT BANNER */}
      <section className="relative h-[42vh] min-h-[300px] sm:h-[55vh] sm:min-h-[400px] overflow-hidden">
        <img src={imgSocks} alt="Wolfion craftsmanship" className="absolute inset-0 h-full w-full object-cover" />
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
            <Link href="/about" className="inline-flex items-center mt-7 text-sm font-medium border-b border-white/60 pb-1 hover:border-white">
              Our story <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </ShopLayout>
  );
}
