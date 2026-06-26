import shortSocks from "@assets/wolfion/ptype-short-socks.png";
import ankleSocks from "@assets/wolfion/ptype-ankle-socks.png";
import kidsSocks from "@assets/wolfion/ptype-kids-socks.png";
import mixed from "@assets/wolfion/ptype-mixed.png";
import sportsFootball from "@assets/wolfion/ptype-sports-football.png";
import others from "@assets/wolfion/ptype-others.png";

const PRODUCT_TYPE_IMAGES: Record<string, string> = {
  "short-socks": shortSocks,
  "ankle-socks": ankleSocks,
  "kids-socks": kidsSocks,
  mixed,
  "sports-football": sportsFootball,
  others,
};

/**
 * Picture/sticker icon for a product type id. Falls back to a generic
 * sock sticker for any custom product type that has no dedicated image.
 */
export function productTypeImage(id: string | null | undefined): string {
  if (!id) return others;
  return PRODUCT_TYPE_IMAGES[id] ?? others;
}
