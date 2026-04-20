import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { products } from "@/lib/data";
import { useCart } from "@/hooks/use-cart";
import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check } from "lucide-react";

export default function ProductDetail() {
  const [, params] = useRoute("/app/product/:id");
  const [, setLocation] = useLocation();
  const { addItem } = useCart();
  
  const product = products.find(p => p.id === params?.id);
  
  const [selectedSize, setSelectedSize] = useState<string>(product?.sizes[0] || "");
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-2xl font-bold">Product not found</h2>
          <Button variant="link" onClick={() => setLocation("/app")} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Shop
          </Button>
        </div>
      </AppLayout>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addItem(product, selectedSize, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-6xl">
        <Button variant="ghost" onClick={() => setLocation("/app")} className="mb-6 -ml-4 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Collection
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted">
            <img 
              src={product.image} 
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col pt-4 sm:pt-8 space-y-8">
            <div>
              <div className="flex justify-between items-start gap-4">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance">{product.name}</h1>
                <span className="text-2xl font-medium tracking-tight">${product.price.toFixed(2)}</span>
              </div>
              <p className="text-lg text-muted-foreground mt-2">{product.color}</p>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">Description</h3>
              <p className="text-lg leading-relaxed text-balance">{product.description}</p>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">Select Size</h3>
                <button className="text-sm underline text-muted-foreground hover:text-foreground">Size Guide</button>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-12 min-w-[3rem] px-4 rounded-xl border text-sm font-medium transition-all ${
                      selectedSize === size 
                        ? "border-primary bg-primary/5 text-primary shadow-sm" 
                        : "border-border bg-background hover:border-foreground/30 hover:bg-muted"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 mt-auto">
              <Button 
                size="lg" 
                className={`w-full h-14 text-base rounded-2xl transition-all duration-300 ${added ? "bg-green-600 hover:bg-green-700" : ""}`}
                onClick={handleAddToCart}
                disabled={!selectedSize}
              >
                {added ? (
                  <><Check className="mr-2 h-5 w-5" /> Added to Cart</>
                ) : (
                  <>Add to Cart — ${(product.price).toFixed(2)}</>
                )}
              </Button>
              
              <p className="text-center text-sm text-muted-foreground mt-4">
                Free shipping on orders over $50. Free returns.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
