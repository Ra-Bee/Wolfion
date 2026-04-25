import { useMemo } from "react";
import { Link, useSearch } from "wouter";
import { ShopLayout } from "@/components/shop-layout";
import { ProductCard } from "@/components/product-card";
import { products, categories, type ProductCategory } from "@/lib/data";

const COLLECTION_META: Record<string, { eyebrow: string; title: string; subtitle: string }> = {
  mens: {
    eyebrow: "Collection",
    title: "Men's Wear",
    subtitle: "Tailored essentials for the modern man.",
  },
  womens: {
    eyebrow: "Collection",
    title: "Women's Wear",
    subtitle: "Quiet luxury, refined for everyday.",
  },
};

export default function Products() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const activeCategory = (params.get("category") as ProductCategory | null) ?? null;
  const collection = params.get("collection");
  const queryTerm = (params.get("q") ?? "").trim().toLowerCase();

  const filtered = useMemo(() => {
    let list = activeCategory ? products.filter((p) => p.category === activeCategory) : products;
    if (queryTerm) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(queryTerm) ||
          p.color.toLowerCase().includes(queryTerm) ||
          p.description.toLowerCase().includes(queryTerm) ||
          p.category.toLowerCase().includes(queryTerm),
      );
    }
    return list;
  }, [activeCategory, queryTerm]);

  const collectionMeta = collection ? COLLECTION_META[collection] : null;

  const eyebrow = collectionMeta?.eyebrow ?? "Collection";
  const title =
    collectionMeta?.title ??
    (activeCategory
      ? categories.find((c) => c.id === activeCategory)?.label ?? "Shop"
      : "All Products");
  const subtitle =
    collectionMeta?.subtitle ??
    (activeCategory
      ? categories.find((c) => c.id === activeCategory)?.tagline ?? ""
      : "Crafted essentials, every piece engineered for comfort.");

  return (
    <ShopLayout>
      {/* Hero band */}
      <section className="relative bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-950 border-b border-neutral-200/70 dark:border-neutral-800/70">
        <div className="container mx-auto px-5 pt-14 pb-10">
          <p className="text-[11px] uppercase tracking-[0.3em] text-neutral-500 mb-3">{eyebrow}</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight">{title}</h1>
          {subtitle && (
            <p className="mt-4 max-w-xl text-sm text-neutral-500 font-light leading-relaxed">{subtitle}</p>
          )}
        </div>
      </section>

      <section className="container mx-auto px-5 pt-8 pb-20">
        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mb-10 pb-5">
          <Link href="/products">
            <button
              className={`px-4 h-9 rounded-full text-xs uppercase tracking-widest transition-all active:scale-95 ${
                !activeCategory && !collection
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-md"
                  : "bg-white/70 dark:bg-neutral-900/60 backdrop-blur border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
              data-testid="filter-all"
            >
              All
            </button>
          </Link>
          {categories.map((c) => (
            <Link key={c.id} href={`/products?category=${c.id}`}>
              <button
                className={`px-4 h-9 rounded-full text-xs uppercase tracking-widest transition-all active:scale-95 ${
                  activeCategory === c.id
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-md"
                    : "bg-white/70 dark:bg-neutral-900/60 backdrop-blur border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
                data-testid={`filter-${c.id}`}
              >
                {c.label}
              </button>
            </Link>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="py-20 text-center text-neutral-500">
            <p>No pieces found in this category.</p>
            <Link href="/products" className="underline text-sm mt-3 inline-block">View all</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-x-6 sm:gap-y-12">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </ShopLayout>
  );
}
