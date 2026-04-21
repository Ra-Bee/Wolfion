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
        className={`relative ${aspect} overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-900 dark:to-neutral-800 mb-3 shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-1`}
      >
        <img
          src={product.image}
          alt={product.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
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

      <div className="flex justify-between items-start gap-3 px-1">
        <div className="min-w-0">
          <h3 className="text-sm font-medium truncate group-hover:underline underline-offset-4 decoration-neutral-400">
            {product.name}
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5 truncate">{product.color}</p>
        </div>
        <span className="text-sm font-semibold whitespace-nowrap">${product.price.toFixed(2)}</span>
      </div>
    </Link>
  );
}
