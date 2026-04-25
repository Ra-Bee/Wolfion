export type ProductCategory =
  | "socks"
  | "tees"
  | "hoodies"
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
    id: "socks",
    label: "Socks",
    tagline: "Bapari Socks · Engineered comfort.",
    image:
      "https://images.unsplash.com/photo-1582966772680-860e372bb558?w=900&q=80",
  },
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
    tagline: "Heavyweight comfort.",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=900&q=80",
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
  // ── BAPARI SOCKS · The core (Wolfion-branded) ─────────
  {
    id: "s_crew_black",
    name: "Wolf Logo Crew Sock",
    price: 290,
    color: "Onyx Black",
    category: "socks",
    collection: "unisex",
    sizes: ["S", "M", "L", "XL"],
    description:
      "Sharp, breathable, perfectly tensioned with the Wolfion logo woven at the cuff. The only black crew sock you'll ever need.",
    inventory: 1540,
    image:
      "https://images.unsplash.com/photo-1582966772680-860e372bb558?w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1582966772680-860e372bb558?w=1200&q=80",
      "https://images.unsplash.com/photo-1604881991720-f91add269bed?w=1200&q=80",
    ],
    badge: "bestseller",
  },
  {
    id: "s_crew_white",
    name: "Wolf Logo Crew Sock",
    price: 290,
    color: "Arctic White",
    category: "socks",
    collection: "unisex",
    sizes: ["M", "L", "XL"],
    description:
      "Crisp white crew socks with embroidered Wolfion mark. Stays up without cutting circulation.",
    inventory: 820,
    image:
      "https://images.unsplash.com/photo-1608222351212-18fe0ec7b13b?w=900&q=80",
  },
  {
    id: "s_crew_grey",
    name: "Wolf Logo Crew Sock",
    price: 290,
    color: "Heather Grey",
    category: "socks",
    collection: "unisex",
    sizes: ["S", "M", "L", "XL"],
    description:
      "The everyday neutral. Combed cotton, ribbed cuff, woven Wolfion logo on the side.",
    inventory: 980,
    image:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=900&q=80",
    badge: "new",
  },
  {
    id: "s_ankle_orange",
    name: "Wolf Performance Ankle",
    price: 250,
    color: "Wolf Orange",
    category: "socks",
    collection: "unisex",
    sizes: ["S", "M", "L"],
    description:
      "Low profile, high impact. Reinforced heel & toe with a small Wolfion crest above the ankle. Built for active days.",
    inventory: 430,
    image:
      "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=900&q=80",
    badge: "bestseller",
  },
  {
    id: "s_ankle_black",
    name: "Wolf Performance Ankle",
    price: 250,
    color: "Onyx Black",
    category: "socks",
    collection: "unisex",
    sizes: ["S", "M", "L", "XL"],
    description:
      "All-black performance ankle sock. Cushioned sole, mesh top vent, woven Wolfion mark.",
    inventory: 610,
    image:
      "https://images.unsplash.com/photo-1517260911205-8a3bfa7af5ab?w=900&q=80",
  },
  {
    id: "s_liner_white",
    name: "Wolf Invisible Liner",
    price: 220,
    color: "Pure White",
    category: "socks",
    collection: "unisex",
    sizes: ["S", "M", "L"],
    description:
      "Disappear under any sneaker. Silicone heel grip keeps them in place. Tiny printed Wolfion logo inside.",
    inventory: 720,
    image:
      "https://images.unsplash.com/photo-1604881991720-f91add269bed?w=900&q=80",
  },
  {
    id: "s_noshow_charcoal",
    name: "Wolf Sport No-Show",
    price: 240,
    color: "Charcoal",
    category: "socks",
    collection: "unisex",
    sizes: ["M", "L"],
    description:
      "Cushioned sole, mesh top, terry footbed. Built for runners and gym days. Wolfion mark at the heel.",
    inventory: 540,
    image:
      "https://images.unsplash.com/photo-1565098228567-bcedeb96b59e?w=900&q=80",
  },
  {
    id: "s_merino_grey",
    name: "Wolf Merino Lounge",
    price: 490,
    color: "Heather Grey",
    category: "socks",
    collection: "unisex",
    sizes: ["M", "L"],
    description:
      "Italian merino blend for slow Sunday mornings. Embroidered Wolfion logo on the cuff.",
    inventory: 115,
    image:
      "https://images.unsplash.com/photo-1552874869-5c39ec9288dc?w=900&q=80",
    badge: "limited",
  },
  {
    id: "s_hike_forest",
    name: "Wolf Wool Hiker",
    price: 590,
    color: "Forest",
    category: "socks",
    collection: "unisex",
    sizes: ["M", "L", "XL"],
    description:
      "Heavy-cushion merino built for the trail. Moisture-wicking, odor-resistant, branded Wolf cuff.",
    inventory: 95,
    image:
      "https://images.unsplash.com/photo-1565098228567-bcedeb96b59e?w=900&q=80",
  },
  {
    id: "s_dress_navy",
    name: "Wolf Dress Sock",
    price: 320,
    color: "Midnight Navy",
    category: "socks",
    collection: "mens",
    sizes: ["M", "L"],
    description:
      "Mid-calf mercerized cotton with subtle Wolfion monogram pattern. For the suit.",
    inventory: 180,
    image:
      "https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=900&q=80",
    badge: "new",
  },
  {
    id: "s_kids_blue",
    name: "Mini Wolf Crew",
    price: 190,
    color: "Cloud Blue",
    category: "socks",
    collection: "kids",
    sizes: ["XS", "S", "M"],
    description:
      "Soft cotton blend for little adventurers. Reinforced toe and a tiny Wolfion mark on the side.",
    inventory: 320,
    image:
      "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=900&q=80",
  },
  {
    id: "s_kids_pink",
    name: "Mini Wolf Crew",
    price: 190,
    color: "Sunset Pink",
    category: "socks",
    collection: "kids",
    sizes: ["XS", "S", "M"],
    description:
      "Bright, comfortable, built to last through every adventure. Tiny embroidered wolf at the cuff.",
    inventory: 280,
    image:
      "https://images.unsplash.com/photo-1596870188184-9ace0fed1ec6?w=900&q=80",
  },

  // ── A few signature apparel pieces ────────────────────
  {
    id: "p_tee_black",
    name: "Wolfion Logo Tee",
    price: 1290,
    color: "Onyx Black",
    category: "tees",
    collection: "unisex",
    sizes: ["S", "M", "L", "XL", "XXL"],
    description:
      "300 GSM combed cotton with the Wolfion mark printed at the chest. Boxy cut, drop-shoulder.",
    inventory: 240,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=80",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1200&q=80",
    ],
    badge: "bestseller",
  },
  {
    id: "p_tee_white",
    name: "Wolfion Logo Tee",
    price: 1290,
    color: "Bone White",
    category: "tees",
    collection: "unisex",
    sizes: ["S", "M", "L", "XL"],
    description:
      "The crispest white you'll own. Garment-washed for zero shrinkage. Wolfion logo printed at the chest.",
    inventory: 180,
    image:
      "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=900&q=80",
  },
  {
    id: "p_hoodie_black",
    name: "Apex Wolfion Hoodie",
    price: 3490,
    color: "Onyx Black",
    category: "hoodies",
    collection: "unisex",
    sizes: ["S", "M", "L", "XL"],
    description:
      "450 GSM brushed-back fleece, kangaroo pocket, ribbed cuffs. Embroidered Wolfion mark on the chest.",
    inventory: 140,
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1200&q=80",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1200&q=80",
    ],
    badge: "bestseller",
  },

  // ── Accessories ───────────────────────────────────────
  {
    id: "a_cap_black",
    name: "Wolfion Logo Cap",
    price: 990,
    color: "Black",
    category: "accessories",
    collection: "unisex",
    sizes: ["One Size"],
    description:
      "6-panel structured cap with embroidered Wolfion mark. Adjustable strap.",
    inventory: 240,
    image:
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=900&q=80",
  },
  {
    id: "a_beanie_charcoal",
    name: "Wolfion Ribbed Beanie",
    price: 890,
    color: "Charcoal",
    category: "accessories",
    collection: "unisex",
    sizes: ["One Size"],
    description:
      "Chunky-knit merino blend beanie with woven Wolfion label.",
    inventory: 165,
    image:
      "https://images.unsplash.com/photo-1516522973472-f009f23bba59?w=900&q=80",
    badge: "new",
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
