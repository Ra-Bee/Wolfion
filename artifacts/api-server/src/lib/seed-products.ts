import { db, productsTable, type InsertProduct } from "@workspace/db";
import { logger } from "./logger";

type SeedProduct = InsertProduct & { id: string };

const SEED_PRODUCTS: SeedProduct[] = [
  {
    id: "p_wolfion_classic_black",
    name: "Wolfion Classic Black",
    price: 18,
    color: "Black",
    category: "short",
    sizes: ["S", "M", "L", "XL"],
    description:
      "A premium short sock that sits just above the ankle bone. Soft pima cotton with a subtle satin sheen, fine ribbed cuff, hand-linked toe seam, and the WOLFION wordmark embroidered in tonal silver thread. Refined enough to wear with leather shoes, comfortable enough for everyday.",
    inventory: 120,
    image: "/products/wolfion-classic-black.png",
    video: "",
    sortOrder: 10,
  },
  {
    id: "p_wolfion_classic_white",
    name: "Wolfion Classic White",
    price: 18,
    color: "White",
    category: "short",
    sizes: ["S", "M", "L", "XL"],
    description:
      "A premium short sock in crisp white that sits just above the ankle bone. Soft pima cotton with subtle satin sheen, fine ribbed cuff, hand-linked toe seam, and the WOLFION wordmark embroidered in tonal black thread. Looks polished with low-tops, sneakers, or leather loafers.",
    inventory: 110,
    image: "/products/wolfion-classic-white.png",
    video: "",
    sortOrder: 20,
  },
  {
    id: "p_wolfion_classic_grey",
    name: "Wolfion Classic Grey",
    price: 18,
    color: "Heather Grey",
    category: "short",
    sizes: ["S", "M", "L", "XL"],
    description:
      "A premium heather-grey short sock that sits just above the ankle bone. Soft pima cotton in a subtle marled finish, fine ribbed cuff, hand-linked toe seam, and the WOLFION wordmark embroidered in tonal silver thread. The everyday short sock, refined.",
    inventory: 100,
    image: "/products/wolfion-classic-grey.png",
    video: "",
    sortOrder: 30,
  },
  {
    id: "p_wolfion_premium_onyx",
    name: "Wolfion Cashmere Charcoal",
    price: 32,
    color: "Charcoal",
    category: "others",
    sizes: ["M", "L", "XL"],
    description:
      "A mid-calf sock spun from a sumptuous cashmere blend in deep charcoal. Brushed for warmth, ribbed for stay-up comfort, finished with a hand-linked toe seam and the WOLFION wordmark woven into the cuff in champagne-gold thread. The kind of sock that feels like an heirloom from day one.",
    inventory: 60,
    image: "/products/wolfion-cashmere-charcoal.png",
    video: "",
    sortOrder: 40,
  },
  {
    id: "p_wolfion_premium_camel",
    name: "Wolfion Wool Cream Cable",
    price: 30,
    color: "Cream",
    category: "others",
    sizes: ["M", "L", "XL"],
    description:
      "A chunky cable-knit boot sock in warm cream, knit from substantial merino wool with prominent vertical cabling and a thick folded cuff. Cozy enough for cabin weekends, refined enough for a tailored boot. WOLFION wordmark hand-embroidered on the cuff in tonal sage thread.",
    inventory: 55,
    image: "/products/wolfion-wool-cream.png",
    video: "",
    sortOrder: 50,
  },
  {
    id: "p_wolfion_premium_navy",
    name: "Wolfion Silk Bordeaux",
    price: 34,
    color: "Bordeaux",
    category: "others",
    sizes: ["M", "L", "XL"],
    description:
      "A thin silk-blend dress sock in deep bordeaux wine, with a subtle satin sheen, fine vertical rib, and the WOLFION wordmark woven into the cuff in antique gold thread. The finishing piece for a tailored suit — refined, lustrous, and designed to lay flat under leather lace-ups.",
    inventory: 45,
    image: "/products/wolfion-silk-bordeaux.png",
    video: "",
    sortOrder: 60,
  },
  {
    id: "p_wolfion_ankle_black",
    name: "Wolfion Ankle Black",
    price: 14,
    color: "Black",
    category: "ankle",
    sizes: ["S", "M", "L"],
    description:
      "A low-cut ankle sock for an invisible fit under sneakers and loafers. Premium combed cotton, ribbed cuff, and the signature woven WOLFION wordmark. Stays put thanks to a snug heel cup.",
    inventory: 95,
    image: "/products/wolfion-ankle-black.png",
    video: "",
    sortOrder: 70,
  },
  {
    id: "p_wolfion_ankle_white",
    name: "Wolfion Ankle White",
    price: 14,
    color: "White",
    category: "ankle",
    sizes: ["S", "M", "L"],
    description:
      "A crisp white low-cut ankle sock that disappears under any low-top shoe. Combed cotton, ribbed cuff, and the woven WOLFION wordmark on the cuff. Anti-slip heel for a no-bunch fit.",
    inventory: 90,
    image: "/products/wolfion-ankle-white.png",
    video: "",
    sortOrder: 80,
  },
  {
    id: "p_wolfion_kids_blue",
    name: "Wolfion Kids Blue",
    price: 12,
    color: "Sky Blue",
    category: "kids",
    sizes: ["XS", "S", "M"],
    description:
      "A soft sky-blue striped kids crew sock built for play. Cotton blend with a stretchy ribbed cuff, the friendly WOLFION wordmark on the cuff, and a seamless toe so little feet stay happy all day.",
    inventory: 80,
    image: "/products/wolfion-kids-blue.png",
    video: "",
    sortOrder: 90,
  },
  {
    id: "p_wolfion_kids_pink",
    name: "Wolfion Kids Pink",
    price: 12,
    color: "Soft Pink",
    category: "kids",
    sizes: ["XS", "S", "M"],
    description:
      "A soft-pink kids crew sock with a tiny star pattern. Cotton blend, gentle ribbed cuff, and the WOLFION wordmark on the cuff. Cute, durable, and machine-washable for everyday adventures.",
    inventory: 75,
    image: "/products/wolfion-kids-pink.png",
    video: "",
    sortOrder: 100,
  },
];

export async function seedProductsIfEmpty(): Promise<void> {
  try {
    const existing = await db.select({ id: productsTable.id }).from(productsTable).limit(1);
    if (existing.length > 0) {
      logger.info("seed: products table already populated, skipping seed");
      return;
    }

    logger.info({ count: SEED_PRODUCTS.length }, "seed: products table is empty, inserting catalog");
    await db.insert(productsTable).values(SEED_PRODUCTS).onConflictDoNothing();
    logger.info({ count: SEED_PRODUCTS.length }, "seed: catalog inserted");
  } catch (err) {
    logger.error({ err }, "seed: failed to seed products");
  }
}
