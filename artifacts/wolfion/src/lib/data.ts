export type ProductCategory =
  | "tees"
  | "hoodies"
  | "outerwear"
  | "pants"
  | "socks"
  | "accessories";

export type ProductCollection = "mens" | "womens" | "kids" | "unisex";

export type ProductBadge = "new" | "bestseller" | "limited" | null;

export type Product = {
  id: string;
  name: string;
  price: number;
  color: string;
  category: ProductCategory;
  collection: ProductCollection;
  sizes: string[];
  description: string;
  inventory: number;
  image: string;
  images?: string[];
  badge?: ProductBadge;
};

export const categories: {
  id: ProductCategory;
  label: string;
  tagline: string;
  image: string;
}[] = [
  {
    id: "tees",
    label: "Tees",
    tagline: "Soft cotton, sharp silhouettes.",
    image:
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=900&q=80",
  },
  {
    id: "hoodies",
    label: "Hoodies",
    tagline: "Heavyweight comfort, all-day warmth.",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=900&q=80",
  },
  {
    id: "outerwear",
    label: "Outerwear",
    tagline: "Built for every season.",
    image:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=900&q=80",
  },
  {
    id: "pants",
    label: "Pants",
    tagline: "Cut to move with you.",
    image:
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=900&q=80",
  },
  {
    id: "socks",
    label: "Socks",
    tagline: "Bapari Socks · Engineered comfort.",
    image:
      "https://images.unsplash.com/photo-1582966772680-860e372bb558?w=900&q=80",
  },
  {
    id: "accessories",
    label: "Accessories",
    tagline: "The finishing touch.",
    image:
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=900&q=80",
  },
];

export const products: Product[] = [
  // ── MENSWEAR ──────────────────────────────────────────
  {
    id: "p_m_tee_black",
    name: "Wolf Heavy Tee",
    price: 1290,
    color: "Onyx Black",
    category: "tees",
    collection: "mens",
    sizes: ["S", "M", "L", "XL", "XXL"],
    description:
      "300 GSM combed cotton, boxy cut, drop-shoulder seams. Built like a knit, wears like a daily.",
    inventory: 240,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=80",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1200&q=80",
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=1200&q=80",
    ],
    badge: "bestseller",
  },
  {
    id: "p_m_tee_white",
    name: "Wolf Heavy Tee",
    price: 1290,
    color: "Bone White",
    category: "tees",
    collection: "mens",
    sizes: ["S", "M", "L", "XL", "XXL"],
    description:
      "The crispest white you'll own. Garment-washed for zero shrinkage, built to last seasons.",
    inventory: 180,
    image:
      "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=900&q=80",
  },
  {
    id: "p_m_tee_olive",
    name: "Wolf Heavy Tee",
    price: 1290,
    color: "Forest Olive",
    category: "tees",
    collection: "mens",
    sizes: ["M", "L", "XL"],
    description:
      "Earthy olive in our signature heavyweight cotton. Built for layering, made to stand alone.",
    inventory: 95,
    image:
      "https://images.unsplash.com/photo-1622445275576-721325763afe?w=900&q=80",
    badge: "new",
  },
  {
    id: "p_m_hoodie_black",
    name: "Apex Pullover Hoodie",
    price: 3490,
    color: "Onyx Black",
    category: "hoodies",
    collection: "mens",
    sizes: ["S", "M", "L", "XL", "XXL"],
    description:
      "450 GSM brushed-back fleece, kangaroo pocket, ribbed cuffs. The hoodie you reach for first.",
    inventory: 140,
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1200&q=80",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1200&q=80",
      "https://images.unsplash.com/photo-1542327897-d73f4005b533?w=1200&q=80",
    ],
    badge: "bestseller",
  },
  {
    id: "p_m_hoodie_cream",
    name: "Apex Pullover Hoodie",
    price: 3490,
    color: "Sand Cream",
    category: "hoodies",
    collection: "mens",
    sizes: ["M", "L", "XL"],
    description:
      "Soft cream tone in heavyweight French terry. Effortless layering, refined comfort.",
    inventory: 88,
    image:
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=900&q=80",
  },
  {
    id: "p_m_jacket_bomber",
    name: "Pilot Bomber",
    price: 6890,
    color: "Jet Black",
    category: "outerwear",
    collection: "mens",
    sizes: ["M", "L", "XL"],
    description:
      "Water-resistant nylon shell, satin lining, ribbed collar. Modern take on the flight classic.",
    inventory: 42,
    image:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1200&q=80",
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200&q=80",
    ],
    badge: "limited",
  },
  {
    id: "p_m_jacket_denim",
    name: "Type III Denim Jacket",
    price: 5290,
    color: "Stone Wash",
    category: "outerwear",
    collection: "mens",
    sizes: ["S", "M", "L", "XL"],
    description:
      "14oz selvedge denim, button front, chest pockets. A wardrobe staple done right.",
    inventory: 65,
    image:
      "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=900&q=80",
  },
  {
    id: "p_m_pants_cargo",
    name: "Field Cargo Pant",
    price: 3290,
    color: "Stone Khaki",
    category: "pants",
    collection: "mens",
    sizes: ["S", "M", "L", "XL"],
    description:
      "Relaxed-leg cotton twill with reinforced cargo pockets. Utility meets refined cut.",
    inventory: 110,
    image:
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=900&q=80",
    badge: "new",
  },
  {
    id: "p_m_pants_jogger",
    name: "Tech Jogger",
    price: 2490,
    color: "Charcoal",
    category: "pants",
    collection: "mens",
    sizes: ["S", "M", "L", "XL"],
    description:
      "Tapered fit, four-way stretch fabric, zip pockets. From workout to weekend.",
    inventory: 175,
    image:
      "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=900&q=80",
  },

  // ── WOMENSWEAR ────────────────────────────────────────
  {
    id: "p_w_tee_crop",
    name: "Lune Crop Tee",
    price: 1190,
    color: "Cloud White",
    category: "tees",
    collection: "womens",
    sizes: ["XS", "S", "M", "L"],
    description:
      "Lightweight Pima cotton in a fitted crop silhouette. Effortless, anywhere.",
    inventory: 195,
    image:
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=900&q=80",
    badge: "bestseller",
  },
  {
    id: "p_w_tee_oversized",
    name: "Lune Oversized Tee",
    price: 1390,
    color: "Soft Sand",
    category: "tees",
    collection: "womens",
    sizes: ["S", "M", "L"],
    description:
      "Drapey cotton in our oversized cut. Pair with denim or wear alone.",
    inventory: 130,
    image:
      "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=900&q=80",
  },
  {
    id: "p_w_hoodie_blush",
    name: "Aura Cropped Hoodie",
    price: 2890,
    color: "Blush Pink",
    category: "hoodies",
    collection: "womens",
    sizes: ["XS", "S", "M", "L"],
    description:
      "Cropped silhouette, brushed cotton interior, raw-edge hem. Soft strength.",
    inventory: 85,
    image:
      "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=1200&q=80",
      "https://images.unsplash.com/photo-1584931423298-c576fda54bd2?w=1200&q=80",
    ],
    badge: "new",
  },
  {
    id: "p_w_sweater_camel",
    name: "Halo Knit Pullover",
    price: 3990,
    color: "Camel",
    category: "hoodies",
    collection: "womens",
    sizes: ["S", "M", "L"],
    description:
      "Italian merino blend, mock neck, dropped shoulders. Quiet luxury, year-round.",
    inventory: 58,
    image:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=900&q=80",
  },
  {
    id: "p_w_coat_trench",
    name: "Atelier Trench",
    price: 8990,
    color: "Stone Beige",
    category: "outerwear",
    collection: "womens",
    sizes: ["S", "M", "L"],
    description:
      "Water-repellent gabardine with double-breasted closure and storm flap. A timeless silhouette.",
    inventory: 24,
    image:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200&q=80",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1200&q=80",
    ],
    badge: "limited",
  },
  {
    id: "p_w_coat_wool",
    name: "Halsa Wool Coat",
    price: 9890,
    color: "Charcoal Grey",
    category: "outerwear",
    collection: "womens",
    sizes: ["XS", "S", "M", "L"],
    description:
      "Italian wool blend, oversized lapels, single-breasted. The investment piece.",
    inventory: 18,
    image:
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=900&q=80",
  },
  {
    id: "p_w_pants_wide",
    name: "Wide-Leg Trouser",
    price: 3690,
    color: "Midnight Black",
    category: "pants",
    collection: "womens",
    sizes: ["XS", "S", "M", "L"],
    description:
      "High-rise, fluid wide-leg cut in tencel-cotton. Polished from desk to dinner.",
    inventory: 90,
    image:
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=900&q=80",
    badge: "bestseller",
  },

  // ── KIDSWEAR ──────────────────────────────────────────
  {
    id: "p_k_tee_blue",
    name: "Cub Tee",
    price: 690,
    color: "Cloud Blue",
    category: "tees",
    collection: "kids",
    sizes: ["XS", "S", "M"],
    description:
      "Soft organic cotton tee built to handle everything kids throw at it.",
    inventory: 220,
    image:
      "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=900&q=80",
    badge: "new",
  },
  {
    id: "p_k_hoodie_yellow",
    name: "Cub Pullover Hoodie",
    price: 1890,
    color: "Sun Yellow",
    category: "hoodies",
    collection: "kids",
    sizes: ["XS", "S", "M"],
    description:
      "Cozy fleece-lined hoodie with reinforced kangaroo pocket. For little adventurers.",
    inventory: 110,
    image:
      "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=900&q=80",
  },
  {
    id: "p_k_pants_jogger",
    name: "Cub Jogger",
    price: 1490,
    color: "Heather Grey",
    category: "pants",
    collection: "kids",
    sizes: ["XS", "S", "M"],
    description:
      "Soft cotton fleece joggers with elastic cuffs. Built to play, built to last.",
    inventory: 145,
    image:
      "https://images.unsplash.com/photo-1519278409-1f56fdda7fe5?w=900&q=80",
  },

  // ── BAPARI SOCKS (centerpiece) ────────────────────────
  {
    id: "s_crew_black",
    name: "Everyday Crew Sock",
    price: 290,
    color: "Onyx Black",
    category: "socks",
    collection: "unisex",
    sizes: ["S", "M", "L", "XL"],
    description:
      "Sharp, breathable, perfectly tensioned. The only black crew sock you'll ever need.",
    inventory: 1540,
    image:
      "https://images.unsplash.com/photo-1582966772680-860e372bb558?w=900&q=80",
    badge: "bestseller",
  },
  {
    id: "s_crew_white",
    name: "Everyday Crew Sock",
    price: 290,
    color: "Arctic White",
    category: "socks",
    collection: "unisex",
    sizes: ["M", "L", "XL"],
    description:
      "Crisp white crew socks designed to stay up without cutting off circulation.",
    inventory: 820,
    image:
      "https://images.unsplash.com/photo-1608222351212-18fe0ec7b13b?w=900&q=80",
  },
  {
    id: "s_ankle_orange",
    name: "Performance Ankle Sock",
    price: 250,
    color: "Wolf Orange",
    category: "socks",
    collection: "unisex",
    sizes: ["S", "M", "L"],
    description:
      "Low profile, high impact. Engineered for active days with reinforced heel and toe.",
    inventory: 430,
    image:
      "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=900&q=80",
  },
  {
    id: "s_merino_grey",
    name: "Merino Lounge Sock",
    price: 490,
    color: "Heather Grey",
    category: "socks",
    collection: "unisex",
    sizes: ["M", "L"],
    description:
      "Luxurious merino wool blend for those slow Sunday mornings.",
    inventory: 115,
    image:
      "https://images.unsplash.com/photo-1552874869-5c39ec9288dc?w=900&q=80",
  },
  {
    id: "s_liner_white",
    name: "Invisible Liner Sock",
    price: 220,
    color: "Pure White",
    category: "socks",
    collection: "unisex",
    sizes: ["S", "M", "L"],
    description:
      "Disappear under any sneaker. Silicone heel grip keeps them in place all day.",
    inventory: 720,
    image:
      "https://images.unsplash.com/photo-1604881991720-f91add269bed?w=900&q=80",
  },
  {
    id: "s_noshow_charcoal",
    name: "Sport No-Show Sock",
    price: 240,
    color: "Charcoal",
    category: "socks",
    collection: "unisex",
    sizes: ["M", "L"],
    description:
      "Cushioned sole, mesh top — built for runners and gym days.",
    inventory: 540,
    image:
      "https://images.unsplash.com/photo-1517260911205-8a3bfa7af5ab?w=900&q=80",
  },
  {
    id: "s_kids_blue",
    name: "Mini Wolf Crew Sock",
    price: 190,
    color: "Cloud Blue",
    category: "socks",
    collection: "kids",
    sizes: ["XS", "S", "M"],
    description:
      "Soft cotton blend made for little adventurers. Reinforced toe for tough play.",
    inventory: 320,
    image:
      "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=900&q=80",
  },
  {
    id: "s_kids_pink",
    name: "Mini Wolf Crew Sock",
    price: 190,
    color: "Sunset Pink",
    category: "socks",
    collection: "kids",
    sizes: ["XS", "S", "M"],
    description:
      "Bright, comfortable, and built to last through every adventure.",
    inventory: 280,
    image:
      "https://images.unsplash.com/photo-1596870188184-9ace0fed1ec6?w=900&q=80",
  },
  {
    id: "s_hike_forest",
    name: "Wool Hiker Sock",
    price: 590,
    color: "Forest",
    category: "socks",
    collection: "unisex",
    sizes: ["M", "L", "XL"],
    description:
      "Heavy-cushion merino designed for the trail. Moisture-wicking and odor-resistant.",
    inventory: 95,
    image:
      "https://images.unsplash.com/photo-1565098228567-bcedeb96b59e?w=900&q=80",
    badge: "limited",
  },

  // ── ACCESSORIES (unisex) ──────────────────────────────
  {
    id: "a_cap_black",
    name: "Wolf Logo Cap",
    price: 990,
    color: "Black",
    category: "accessories",
    collection: "unisex",
    sizes: ["One Size"],
    description:
      "6-panel structured cap, embroidered Wolfion mark, adjustable strap.",
    inventory: 240,
    image:
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=900&q=80",
  },
  {
    id: "a_beanie_charcoal",
    name: "Ribbed Beanie",
    price: 890,
    color: "Charcoal",
    category: "accessories",
    collection: "unisex",
    sizes: ["One Size"],
    description:
      "Chunky-knit merino blend beanie with subtle woven label.",
    inventory: 165,
    image:
      "https://images.unsplash.com/photo-1516522973472-f009f23bba59?w=900&q=80",
    badge: "new",
  },
  {
    id: "a_tote_natural",
    name: "Canvas Tote",
    price: 1190,
    color: "Natural",
    category: "accessories",
    collection: "unisex",
    sizes: ["One Size"],
    description:
      "Heavyweight 16oz canvas tote, reinforced straps, interior pocket.",
    inventory: 200,
    image:
      "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=900&q=80",
  },
  {
    id: "a_backpack_black",
    name: "Daily Backpack",
    price: 3490,
    color: "Black",
    category: "accessories",
    collection: "unisex",
    sizes: ["One Size"],
    description:
      "Water-resistant nylon, padded laptop sleeve, YKK zippers. Built for the everyday.",
    inventory: 120,
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&q=80",
    badge: "bestseller",
  },
];

export const adminMetrics = {
  production: {
    activeBatches: 12,
    unitsInProduction: 4500,
    estimatedCompletion: "Oct 24, 2023",
  },
  sales: {
    today: 1240,
    thisWeek: 8540,
    thisMonth: 34200,
    trend: "+14%",
  },
  inventory: {
    totalUnits: 24500,
    lowStockAlerts: 2,
  },
  yarn: {
    cottonBlend: "1,200 kg",
    merinoWool: "450 kg",
    elastane: "80 kg",
    status: "Healthy",
  },
  financials: {
    monthlyRevenue: 412000,
    monthlyCosts: 184000,
    profitMargin: "55.3%",
  },
};
