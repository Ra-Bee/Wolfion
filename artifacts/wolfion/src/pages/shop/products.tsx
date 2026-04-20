import { useMemo } from "react";
import { Link, useSearch } from "wouter";
import { ShopLayout } from "@/components/shop-layout";
import { products, categories, type ProductCategory } from "@/lib/data";

export default function Products() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const activeCategory = (params.get("category") as ProductCategory | null) ?? null;

  const filtered = useMemo(
    () => (activeCategory ? products.filter((p) => p.category === activeCategory) : products),
    [activeCategory],
  );

  const activeLabel = activeCategory
    ? categories.find((c) => c.id === activeCategory)?.label ?? "Shop"
    : "All Products";

  return (
    <ShopLayout>
      <section className="container mx-auto px-5 pt-12 pb-20">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-2">Collection</p>
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight">{activeLabel}</h1>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mb-10 border-b border-neutral-200 dark:border-neutral-800 pb-5">
          <Link href="/products">
            <button
              className={`px-4 h-9 rounded-full text-xs uppercase tracking-widest transition-colors ${
                !activeCategory
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900"
              }`}
              data-testid="filter-all"
            >
              All
            </button>
          </Link>
          {categories.map((c) => (
            <Link key={c.id} href={`/products?category=${c.id}`}>
              <button
                className={`px-4 h-9 rounded-full text-xs uppercase tracking-widest transition-colors ${
                  activeCategory === c.id
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                    : "border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900"
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
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-x-6 sm:gap-y-10">
            {filtered.map((p) => (
              <Link key={p.id} href={`/product/${p.id}`} className="group block" data-testid={`product-${p.id}`}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-900 mb-3">
                  <img src={p.image} alt={p.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  {p.inventory < 200 && (
                    <span className="absolute top-3 left-3 bg-white/90 dark:bg-neutral-900/90 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full">
                      Low stock
                    </span>
                  )}
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
        )}
      </section>
    </ShopLayout>
  );
}
