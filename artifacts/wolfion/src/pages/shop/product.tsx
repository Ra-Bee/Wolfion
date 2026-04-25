import { useState } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { ShopLayout } from "@/components/shop-layout";
import { products } from "@/lib/data";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Minus, Plus, Heart, Truck, RotateCcw, ShieldCheck } from "lucide-react";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const [, setLocation] = useLocation();
  const { addItem } = useCart();

  const product = products.find((p) => p.id === params?.id);
  const [selectedSize, setSelectedSize] = useState<string>(product?.sizes[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <ShopLayout>
        <div className="container mx-auto px-5 py-32 text-center">
          <h2 className="text-2xl font-light">Product not found</h2>
          <Button variant="link" onClick={() => setLocation("/products")} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to shop
          </Button>
        </div>
      </ShopLayout>
    );
  }

  const handleAdd = () => {
    if (!selectedSize) return;
    addItem(product, selectedSize, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <ShopLayout>
      <div className="container mx-auto px-5 pt-6 pb-20 max-w-7xl">
        <button onClick={() => setLocation("/products")} className="mb-6 text-xs uppercase tracking-widest text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-50 inline-flex items-center">
          <ArrowLeft className="mr-2 h-3.5 w-3.5" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Image */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-900">
            <img src={product.image} alt={product.name} className="absolute inset-0 h-full w-full object-cover" />
          </div>

          {/* Details */}
          <div className="lg:pt-6 flex flex-col">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-2">Wolfion · {product.color}</p>
            <h1 className="text-3xl sm:text-4xl font-light tracking-tight">{product.name}</h1>
            <p className="mt-3 text-2xl font-light">Tk {product.price.toFixed(2)}</p>

            <p className="mt-8 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 max-w-md">
              {product.description}
            </p>

            {/* Size */}
            <div className="mt-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Size</span>
                <button className="text-xs uppercase tracking-widest text-neutral-500 hover:underline">Size guide</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-11 min-w-12 px-4 rounded-full text-sm transition-all ${
                      selectedSize === size
                        ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border border-neutral-900 dark:border-white"
                        : "border border-neutral-300 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-white"
                    }`}
                    data-testid={`size-${size}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mt-8">
              <span className="text-xs uppercase tracking-[0.2em] text-neutral-500 block mb-3">Quantity</span>
              <div className="inline-flex items-center border border-neutral-300 dark:border-neutral-700 rounded-full">
                <button
                  className="h-11 w-11 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-l-full"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                <button
                  className="h-11 w-11 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-r-full"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-10 flex gap-3">
              <Button
                className={`flex-1 h-14 rounded-full text-sm tracking-widest uppercase font-medium transition-all ${
                  added
                    ? "bg-emerald-700 hover:bg-emerald-700 text-white"
                    : "bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                }`}
                onClick={handleAdd}
                disabled={!selectedSize}
                data-testid="add-to-cart"
              >
                {added ? (
                  <><Check className="mr-2 h-4 w-4" /> Added</>
                ) : (
                  <>Add to Bag — Tk {(product.price * quantity).toFixed(2)}</>
                )}
              </Button>
              <Button variant="outline" size="icon" className="h-14 w-14 rounded-full border-neutral-300 dark:border-neutral-700" aria-label="Save">
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {/* Perks */}
            <div className="mt-10 grid grid-cols-3 gap-4 pt-6 border-t border-neutral-200 dark:border-neutral-800">
              <div className="text-center">
                <Truck className="mx-auto h-5 w-5 text-neutral-500 mb-2" />
                <p className="text-[11px] uppercase tracking-wider text-neutral-500">Free shipping</p>
              </div>
              <div className="text-center">
                <RotateCcw className="mx-auto h-5 w-5 text-neutral-500 mb-2" />
                <p className="text-[11px] uppercase tracking-wider text-neutral-500">Free returns</p>
              </div>
              <div className="text-center">
                <ShieldCheck className="mx-auto h-5 w-5 text-neutral-500 mb-2" />
                <p className="text-[11px] uppercase tracking-wider text-neutral-500">2-year warranty</p>
              </div>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-24">
            <h2 className="text-2xl font-light tracking-tight mb-8">You may also like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {related.map((p) => (
                <Link key={p.id} href={`/product/${p.id}`} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-900 mb-3">
                    <img src={p.image} alt={p.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h3 className="text-sm font-medium">{p.name}</h3>
                      <p className="text-xs text-neutral-500 mt-0.5">{p.color}</p>
                    </div>
                    <span className="text-sm font-medium">Tk {p.price.toFixed(2)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </ShopLayout>
  );
}
