import { Link } from "wouter";
import { products } from "@/lib/data";
import { AppLayout } from "@/components/layout";

export default function Shop() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-10 text-center sm:text-left space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-balance">The Collection</h1>
          <p className="text-muted-foreground text-lg max-w-2xl text-balance">
            Everyday essentials built with uncompromising quality. Designed to look sharp and stay comfortable.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {products.map((product) => (
            <Link key={product.id} href={`/app/product/${product.id}`} className="group cursor-pointer">
              <div className="space-y-4">
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {product.inventory < 500 && (
                    <div className="absolute top-4 left-4 bg-background/90 backdrop-blur text-foreground text-xs font-medium px-2.5 py-1 rounded-full">
                      Selling Fast
                    </div>
                  )}
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">{product.name}</h3>
                    <span className="font-medium bg-muted px-2 py-1 rounded-md text-sm">${product.price.toFixed(2)}</span>
                  </div>
                  <p className="text-muted-foreground text-sm">{product.color}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
