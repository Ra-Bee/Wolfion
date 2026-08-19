import type { ReactNode } from "react";
import { SelectGroup, SelectItem } from "@/components/ui/select";
import { productTypeImage } from "@/lib/product-images";
import {
  FOOTBALL_BOTTOM_ID,
  FOOTBALL_COMBO_ID,
  FOOTBALL_TOP_ID,
  LEGACY_FOOTBALL_ID,
  type ProductTypeOption,
} from "@/lib/wolfion-store";

const FOOTBALL_IDS = new Set<string>([LEGACY_FOOTBALL_ID, FOOTBALL_TOP_ID, FOOTBALL_BOTTOM_ID]);

/**
 * Product-type options for a <SelectContent>. Football socks are made in two
 * parts, so instead of flat entries the dropdown shows a "Sports (Football)"
 * group with two sub-options: Top part and Bottom part. The retired combined
 * "sports-football" product is never selectable (its historical records were
 * split between the two parts).
 *
 * When `includeCombo` is true (entry forms only), a "Sports Football (Full
 * Set)" option is added alongside Top/Bottom: picking it records BOTH parts
 * at the entered quantity. The submit handler must expand FOOTBALL_COMBO_ID —
 * never store it.
 */
export function ProductTypeSelectItems({
  types,
  includeCombo = false,
}: {
  types: ProductTypeOption[];
  includeCombo?: boolean;
}) {
  const safe = (Array.isArray(types) ? types : []).filter(
    (t): t is ProductTypeOption => !!t && typeof t.id === "string",
  );
  const hasTop = safe.some((t) => t.id === FOOTBALL_TOP_ID);
  const hasBottom = safe.some((t) => t.id === FOOTBALL_BOTTOM_ID);

  const items: ReactNode[] = [];
  let footballRendered = false;
  for (const t of safe) {
    if (FOOTBALL_IDS.has(t.id)) {
      if (footballRendered) continue;
      footballRendered = true;
      if (hasTop || hasBottom) {
        items.push(
          <SelectGroup key="football-group">
            {includeCombo && hasTop && hasBottom && (
              <SelectItem value={FOOTBALL_COMBO_ID}>
                <span className="flex items-center gap-2">
                  <img
                    src={productTypeImage(FOOTBALL_COMBO_ID)}
                    alt=""
                    className="h-5 w-5 object-contain shrink-0"
                  />
                  Sports Football (Full Set)
                </span>
              </SelectItem>
            )}
            {hasTop && (
              <SelectItem value={FOOTBALL_TOP_ID}>
                <span className="flex items-center gap-2">
                  <img
                    src={productTypeImage(FOOTBALL_TOP_ID)}
                    alt=""
                    className="h-5 w-5 object-contain shrink-0"
                  />
                  Football Top Part
                </span>
              </SelectItem>
            )}
            {hasBottom && (
              <SelectItem value={FOOTBALL_BOTTOM_ID}>
                <span className="flex items-center gap-2">
                  <img
                    src={productTypeImage(FOOTBALL_BOTTOM_ID)}
                    alt=""
                    className="h-5 w-5 object-contain shrink-0"
                  />
                  Football Bottom Part
                </span>
              </SelectItem>
            )}
          </SelectGroup>,
        );
      }
      continue;
    }
    items.push(
      <SelectItem key={t.id} value={t.id}>
        <span className="flex items-center gap-2">
          <img src={productTypeImage(t.id)} alt="" className="h-5 w-5 object-contain shrink-0" />
          {t.label}
        </span>
      </SelectItem>,
    );
  }
  return <>{items}</>;
}
