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
        className={`relative ${aspect} rounded-2xl mb-4 transition-all duration-500 group-hover:-translate-y-2 p-[1px]`}
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.15) 100%)",
        }}
      >
      {/* Glow halo on hover */}
      <div
        aria-hidden
        className="absolute -inset-2 rounded-[1.5rem] blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(200,200,200,0.3) 50%, rgba(255,255,255,0.5) 100%)",
        }}
      />
      <div
        className="relative h-full w-full overflow-hidden rounded-[15px] bg-neutral-100 dark:bg-[#0f0f0f] shadow-sm group-hover:shadow-[0_15px_35px_-5px_rgba(0,0,0,0.8)] transition-shadow duration-500"
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-neutral-300 dark:text-neutral-700 text-xs uppercase tracking-widest">
            No image
          </div>
        )}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none rounded-[15px]"
          style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05), inset 0 0 40px rgba(0,0,0,0.15)" }}
        />

        {/* Soft gradient sheen */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Wolfion logo watermark — transparent, readable on any image */}
        <img
          src={imgLogoMark}
          alt=""
          aria-hidden
          className="absolute top-4 right-4 h-8 w-8 object-contain pointer-events-none select-none transition-transform duration-700 group-hover:rotate-12"
          style={{
            filter:
              "brightness(0) invert(1) drop-shadow(0 1px 2px rgba(0,0,0,0.85)) drop-shadow(0 0 6px rgba(0,0,0,0.55))",
            opacity: 0.9,
          }}
        />

        {product.inventory < 200 && (
          <span className="absolute top-4 left-4 bg-white/20 dark:bg-black/40 backdrop-blur-md border border-white/20 text-[9px] text-white uppercase tracking-[0.2em] px-3 py-1.5 rounded-full shadow-sm">
            Low stock
          </span>
        )}
      </div>
      </div>

      <div className="flex justify-between items-start gap-3 px-1 mt-1">
        <div className="min-w-0">
          <h3 className="text-sm font-medium tracking-wide truncate group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 truncate tracking-wider uppercase font-light">{product.color}</p>
        </div>
        <span className="text-sm font-serif italic whitespace-nowrap">Tk {product.price.toFixed(2)}</span>
      </div>
    </Link>
  );
}
