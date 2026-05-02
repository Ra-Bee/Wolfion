import { Link } from "wouter";
import type { Product } from "@/lib/data";
import imgLogoMark from "@assets/Image_20260416024938_44_2_1776717019706.png";

type Props = {
  product: Product;
  ratio?: "tall" | "square";
};

export function ProductCard({ product, ratio = "tall" }: Props) {
  const aspect = ratio === "tall" ? "aspect-[4/5]" : "aspect-square";

  return (
    <Link
      href={`/product/${product.id}`}
      className="group block"
      data-testid={`product-${product.id}`}
    >
      <div
        className={`relative ${aspect} rounded-2xl mb-3 transition-all duration-500 group-hover:-translate-y-1 p-[1.5px]`}
        style={{
          background:
            "linear-gradient(135deg, rgba(180,140,150,0.45) 0%, rgba(190,160,110,0.30) 50%, rgba(140,120,160,0.45) 100%)",
        }}
      >
      {/* Glow halo on hover */}
      <div
        aria-hidden
        className="absolute -inset-2 rounded-[1.5rem] blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(180,140,150,0.6) 0%, rgba(190,160,110,0.5) 50%, rgba(140,120,160,0.6) 100%)",
        }}
      />
      <div
        className="relative h-full w-full overflow-hidden rounded-[15px] bg-white dark:bg-neutral-900 shadow-sm group-hover:shadow-2xl transition-shadow duration-500"
      >
        <img
          src={product.image}
          alt={product.name}
          className="absolute inset-0 h-full w-full object-contain transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Soft gradient sheen */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Wolfion logo watermark */}
        <div className="absolute top-3 right-3 h-9 w-9 rounded-lg bg-white/70 dark:bg-neutral-950/60 backdrop-blur-md flex items-center justify-center shadow-sm ring-1 ring-white/40 dark:ring-neutral-700/40">
          <img src={imgLogoMark} alt="" aria-hidden className="h-6 w-6 object-contain opacity-90" />
        </div>

        {product.inventory < 200 && (
          <span className="absolute top-3 left-3 bg-white/85 dark:bg-neutral-950/85 backdrop-blur-md text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
            Low stock
          </span>
        )}
      </div>
      </div>

      <div className="flex justify-between items-start gap-3 px-1">
        <div className="min-w-0">
          <h3 className="text-sm font-medium truncate group-hover:underline underline-offset-4 decoration-neutral-400">
            {product.name}
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5 truncate">{product.color}</p>
        </div>
        <span className="text-sm font-semibold whitespace-nowrap">Tk {product.price.toFixed(2)}</span>
      </div>
    </Link>
  );
}
