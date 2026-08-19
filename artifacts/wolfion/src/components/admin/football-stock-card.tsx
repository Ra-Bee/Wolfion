import { combineFootballStock } from "@/lib/wolfion-store";
import { productTypeImage } from "@/lib/product-images";

/**
 * Combined "Sports (Football)" stock box. A complete football dozen needs a
 * top part AND a bottom part, so the headline number is the matching pairs
 * (min of the two), while the box inside shows the raw top/bottom counts and
 * any spare halves still waiting for their other part.
 */
export function FootballStockCard({
  top,
  bottom,
  producedTop,
  producedBottom,
  unit = "dz",
}: {
  top: number;
  bottom: number;
  producedTop?: number;
  producedBottom?: number;
  unit?: string;
}) {
  const f = combineFootballStock(top, bottom);
  // Nothing produced/sold for either part yet — don't show an empty 0 dz box.
  if (f.top === 0 && f.bottom === 0) return null;
  return (
    <div className="col-span-4 sm:col-span-2 rounded-xl border bg-white dark:bg-card/80 p-2.5 sm:p-3 lg:p-4 shadow-sm backdrop-blur transition hover:shadow-lg hover:-translate-y-0.5 text-center min-h-[70px] flex flex-col items-center justify-center box-border">
      <p className="w-full text-[11px] sm:text-xs font-medium uppercase tracking-wide text-muted-foreground leading-tight flex items-center justify-center gap-1.5">
        <img
          src={productTypeImage("sports-football")}
          alt=""
          className="h-4 w-4 sm:h-5 sm:w-5 object-contain shrink-0"
        />
        Sports (Football)
      </p>
      <p className="mt-1 sm:mt-1.5 w-full text-lg sm:text-xl lg:text-2xl font-bold leading-none break-words tabular-nums">
        {f.pairs.toLocaleString()}
        <span className="ml-0.5 text-[11px] sm:text-xs lg:text-sm font-medium text-muted-foreground"> {unit}</span>
      </p>
      {(producedTop != null || producedBottom != null) && (
        <p className="mt-0.5 w-full text-[8px] sm:text-[10px] text-green-600 dark:text-green-400 leading-tight tabular-nums">
          Made top {(producedTop || 0).toLocaleString()} / bottom {(producedBottom || 0).toLocaleString()} {unit}
        </p>
      )}
      <div className="mt-1.5 w-full rounded-lg border border-dashed border-primary/30 bg-muted/40 px-2 py-1.5 grid grid-cols-2 gap-1.5 text-[11px] sm:text-xs leading-tight">
        <div>
          <span className="block text-muted-foreground">Top part</span>
          <span className="font-semibold tabular-nums">{f.top.toLocaleString()}</span>
          {f.spareTop > 0 && (
            <span className="block text-amber-600 dark:text-amber-400 tabular-nums">
              +{f.spareTop.toLocaleString()} spare
            </span>
          )}
        </div>
        <div>
          <span className="block text-muted-foreground">Bottom part</span>
          <span className="font-semibold tabular-nums">{f.bottom.toLocaleString()}</span>
          {f.spareBottom > 0 && (
            <span className="block text-amber-600 dark:text-amber-400 tabular-nums">
              +{f.spareBottom.toLocaleString()} spare
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
