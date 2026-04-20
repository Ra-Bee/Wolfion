import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ShopLayout } from "@/components/shop-layout";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Minus, Plus, X, ArrowRight, ShoppingBag } from "lucide-react";

export default function Cart() {
  const { items, updateQuantity, removeItem, clearCart, totalPrice, totalItems } = useCart();
  const [, setLocation] = useLocation();
  const [processing, setProcessing] = useState(false);

  const shipping = totalPrice >= 50 || totalPrice === 0 ? 0 : 5;
  const tax = totalPrice * 0.08;
  const grandTotal = totalPrice + shipping + tax;

  const handleCheckout = () => {
    setProcessing(true);
    setTimeout(() => {
      clearCart();
      setProcessing(false);
      setLocation("/checkout-success");
    }, 1200);
  };

  if (items.length === 0) {
    return (
      <ShopLayout>
        <div className="container mx-auto px-5 py-32 text-center max-w-md">
          <ShoppingBag className="mx-auto h-12 w-12 text-neutral-300 mb-6" />
          <h1 className="text-3xl font-light tracking-tight mb-3">Your bag is empty</h1>
          <p className="text-sm text-neutral-500 mb-8">Discover the latest pieces from the Bapari Socks collection.</p>
          <Link href="/products">
            <Button className="h-12 px-8 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900">
              Shop the collection <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </ShopLayout>
    );
  }

  return (
    <ShopLayout>
      <div className="container mx-auto px-5 pt-12 pb-20 max-w-6xl">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-2">Your bag</p>
          <h1 className="text-4xl font-light tracking-tight">Cart ({totalItems})</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 lg:gap-16 items-start">
          {/* Items */}
          <div className="border-t border-neutral-200 dark:border-neutral-800">
            {items.map((item, idx) => (
              <div
                key={`${item.product.id}-${item.size}-${idx}`}
                className="flex gap-5 py-6 border-b border-neutral-200 dark:border-neutral-800"
                data-testid={`cart-item-${item.product.id}`}
              >
                <Link href={`/product/${item.product.id}`} className="shrink-0">
                  <div className="h-28 w-24 sm:h-32 sm:w-28 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                    <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                  </div>
                </Link>

                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between gap-3">
                    <div>
                      <Link href={`/product/${item.product.id}`}>
                        <h3 className="text-sm font-medium hover:underline">{item.product.name}</h3>
                      </Link>
                      <p className="text-xs text-neutral-500 mt-1">{item.product.color}</p>
                      <p className="text-xs text-neutral-500">Size {item.size}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id, item.size)}
                      className="text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50"
                      aria-label="Remove"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <div className="inline-flex items-center border border-neutral-300 dark:border-neutral-700 rounded-full">
                      <button
                        className="h-9 w-9 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-l-full"
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        className="h-9 w-9 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-r-full"
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="text-sm font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-5 flex justify-between items-center text-sm">
              <Link href="/products" className="text-neutral-500 hover:underline inline-flex items-center">
                ← Continue shopping
              </Link>
              <button onClick={clearCart} className="text-neutral-500 hover:text-red-600 text-xs uppercase tracking-widest">
                Clear bag
              </button>
            </div>
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-24 bg-neutral-50 dark:bg-neutral-900 rounded-2xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800">
            <h2 className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-6">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-neutral-500">Subtotal</span><span>${totalPrice.toFixed(2)}</span></div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Shipping</span>
                <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between"><span className="text-neutral-500">Estimated tax</span><span>${tax.toFixed(2)}</span></div>
            </div>

            <div className="border-t border-neutral-200 dark:border-neutral-800 mt-6 pt-6 flex justify-between items-baseline">
              <span className="text-sm font-medium">Total</span>
              <span className="text-2xl font-light">${grandTotal.toFixed(2)}</span>
            </div>

            <Button
              className="w-full mt-6 h-13 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 text-sm uppercase tracking-widest font-medium py-4"
              onClick={handleCheckout}
              disabled={processing}
              data-testid="checkout"
            >
              {processing ? "Processing…" : <>Checkout <ArrowRight className="ml-2 h-4 w-4" /></>}
            </Button>

            <p className="text-[11px] text-neutral-500 mt-4 text-center leading-relaxed">
              Secure checkout. No payment is processed in this preview.
            </p>
          </aside>
        </div>
      </div>
    </ShopLayout>
  );
}
