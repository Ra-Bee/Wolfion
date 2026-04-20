import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { ShopLayout } from "@/components/shop-layout";
import { products, categories } from "@/lib/data";
import imgPortrait from "@assets/Image_20260416035728_55_2_1776716993092.jpg";
import imgSocks from "@assets/Image_20260416025624_54_2_1776717008197.jpg";
import imgTees from "@assets/Image_20260416041311_58_2_1776716983907.png";
import imgEmbroidered from "@assets/Gemini_Generated_Image_7q4kiq7q4kiq7q4k_1776717041891.png";

export default function ShopHome() {
  const featured = products.slice(0, 4);

  return (
    <ShopLayout>
      {/* Hero */}
      <section className="relative h-[80vh] min-h-[520px] w-full overflow-hidden bg-black text-white">
        <img src={imgPortrait} alt="Wolfion" className="absolute inset-0 h-full w-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        <div className="relative z-10 h-full container mx-auto px-5 flex flex-col justify-end pb-16">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.4em] text-white/70 mb-4">Spring · Collection 26</p>
            <h1 className="text-5xl sm:text-7xl font-light leading-[0.95] tracking-tight">
              Quiet luxury,<br />
              <span className="font-serif italic">worn every day.</span>
            </h1>
            <p className="mt-6 text-base text-white/70 max-w-md font-light leading-relaxed">
              Wolfion crafts essentials for the modern wardrobe — engineered fabrics, considered details, and a silhouette that stays sharp.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products">
                <button className="bg-white text-neutral-900 px-7 h-12 rounded-full text-sm font-medium tracking-wide hover:bg-neutral-100 transition-colors inline-flex items-center" data-testid="hero-shop-cta">
                  Shop the collection <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </Link>
              <Link href="/products?category=ankle">
                <button className="border border-white/30 text-white px-7 h-12 rounded-full text-sm font-medium tracking-wide hover:bg-white/10 transition-colors">
                  New arrivals
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-5 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-2">Browse</p>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight">Categories</h2>
          </div>
          <Link href="/products" className="hidden sm:inline-flex items-center text-sm font-medium hover:underline">
            View all <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((c) => (
            <Link key={c.id} href={`/products?category=${c.id}`} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-900">
                <img src={c.image} alt={c.label} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-lg font-medium">{c.label}</h3>
                  <p className="text-xs text-white/70 mt-0.5">{c.tagline}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Editorial banner */}
      <section className="relative h-[60vh] min-h-[420px] overflow-hidden">
        <img src={imgSocks} alt="Wolfion craftsmanship" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />
        <div className="relative z-10 h-full container mx-auto px-5 flex items-center">
          <div className="max-w-md text-white">
            <p className="text-xs uppercase tracking-[0.4em] text-white/70 mb-4">The craft</p>
            <h2 className="text-3xl sm:text-5xl font-light leading-tight">
              Every stitch <span className="font-serif italic">considered.</span>
            </h2>
            <p className="mt-5 text-sm text-white/80 leading-relaxed font-light">
              Spun from Pima cotton and Italian merino. Tensioned by hand. Finished without compromise.
            </p>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="container mx-auto px-5 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-2">Editor's picks</p>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight">Featured</h2>
          </div>
          <Link href="/products" className="hidden sm:inline-flex items-center text-sm font-medium hover:underline">
            Shop all <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {featured.map((p) => (
            <Link key={p.id} href={`/product/${p.id}`} className="group block" data-testid={`product-${p.id}`}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-900 mb-3">
                <img src={p.image} alt={p.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="flex justify-between items-start gap-3">
                <div>
                  <h3 className="text-sm font-medium">{p.name}</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">{p.color}</p>
                </div>
                <span className="text-sm font-medium">${p.price.toFixed(2)}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Brand mosaic */}
      <section className="container mx-auto px-5 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
          <div className="md:col-span-2 aspect-[16/9] rounded-xl overflow-hidden">
            <img src={imgTees} alt="Wolfion apparel" className="h-full w-full object-cover" />
          </div>
          <div className="aspect-[16/9] md:aspect-auto rounded-xl overflow-hidden">
            <img src={imgEmbroidered} alt="Embroidered logo" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>
    </ShopLayout>
  );
}
