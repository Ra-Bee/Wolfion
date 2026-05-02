import { useMemo, useState } from "react";
import { Link, useSearch } from "wouter";
import { ShopLayout } from "@/components/shop-layout";
import { ProductCard } from "@/components/product-card";
import { ProductFormDialog } from "@/components/admin/product-form-dialog";
import { categories, type ProductCategory } from "@/lib/data";
import { useListProducts } from "@workspace/api-client-react";
import { useRole } from "@/hooks/use-role";
import { Plus } from "lucide-react";

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

  const { data: products, isLoading, isError, refetch } = useListProducts();
  const { isAdmin } = useRole();
  const [addOpen, setAddOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!products) return [];
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
  }, [products, activeCategory, queryTerm]);

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

  const isAll = !activeCategory && !collection;

  const chipBaseStyle = {
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.10) 100%)",
    backdropFilter: "blur(14px) saturate(170%)",
    WebkitBackdropFilter: "blur(14px) saturate(170%)",
    boxShadow:
      "inset 0 1px 0 rgba(255,255,255,0.5), 0 6px 16px -8px rgba(15,23,42,0.25)",
  } as const;

  return (
    <ShopLayout>
      {/* Hero band */}
      <section className="relative border-b border-white/30 dark:border-white/10">
        <div className="container mx-auto px-5 pt-14 pb-10">
          <p className="text-[11px] uppercase tracking-[0.3em] text-neutral-500 mb-3">{eyebrow}</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight">{title}</h1>
          {subtitle && (
            <p className="mt-4 max-w-xl text-sm text-neutral-500 font-light leading-relaxed">{subtitle}</p>
          )}
        </div>
      </section>

      <section className="container mx-auto px-5 pt-8 pb-20">
        {/* Admin-only quick action — visible only to allowlisted admin emails.
            Server still enforces auth on the underlying create endpoint. */}
        {isAdmin && (
          <div className="mb-6 flex justify-end">
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-2 rounded-full px-4 h-10 text-xs uppercase tracking-[0.2em] font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-md hover:shadow-lg active:scale-95 transition-all"
              data-testid="btn-add-product-shop"
            >
              <Plus className="h-4 w-4" /> Add new product
            </button>
          </div>
        )}

        {/* Glass filter chips */}
        <div className="flex flex-wrap gap-2 mb-10 pb-5">
          <Link href="/products">
            <button
              className={`relative px-4 h-9 rounded-full text-xs uppercase tracking-widest transition-all active:scale-95 border ${
                isAll
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-md"
                  : "text-neutral-800 dark:text-neutral-100 border-white/40 dark:border-white/10 hover:bg-white/40 dark:hover:bg-white/10"
              }`}
              style={isAll ? undefined : chipBaseStyle}
              data-testid="filter-all"
            >
              All
            </button>
          </Link>
          {categories.map((c) => {
            const active = activeCategory === c.id;
            return (
              <Link key={c.id} href={`/products?category=${c.id}`}>
                <button
                  className={`relative px-4 h-9 rounded-full text-xs uppercase tracking-widest transition-all active:scale-95 border ${
                    active
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-md"
                      : "text-neutral-800 dark:text-neutral-100 border-white/40 dark:border-white/10 hover:bg-white/40 dark:hover:bg-white/10"
                  }`}
                  style={active ? undefined : chipBaseStyle}
                  data-testid={`filter-${c.id}`}
                >
                  {c.label}
                </button>
              </Link>
            );
          })}
        </div>

        {isLoading ? (
          <div className="py-24 flex justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-neutral-100 animate-spin" />
          </div>
        ) : isError ? (
          <div className="py-20 text-center text-neutral-500">
            <p>Could not load products.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="underline text-sm mt-3 inline-block"
              data-testid="products-retry"
            >
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-neutral-500" data-testid="products-empty">
            {!products || products.length === 0 ? (
              <>
                <p className="text-base">No pieces in the catalog yet.</p>
                <p className="text-xs mt-2 text-neutral-400">Check back soon — new drops land regularly.</p>
              </>
            ) : (
              <>
                <p>No pieces found in this category.</p>
                <Link href="/products" className="underline text-sm mt-3 inline-block">View all</Link>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-x-6 sm:gap-y-12">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {isAdmin && (
        <ProductFormDialog open={addOpen} onOpenChange={setAddOpen} editingProduct={null} />
      )}
    </ShopLayout>
  );
}
