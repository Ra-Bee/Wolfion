export type ProductCategory = "short" | "ankle" | "kids" | "others";

export type Product = {
  id: string;
  name: string;
  price: number;
  color: string;
  category: ProductCategory;
  sizes: string[];
  description: string;
  inventory: number;
  image: string;
};

import imgCatShort from "@assets/cat_short.jpg";
import imgCatAnkle from "@assets/cat_ankle.jpg";
import imgCatKids from "@assets/cat_kids.jpg";
import imgCatOthers from "@assets/cat_others.jpg";
import imgSportNoShow from "@assets/generated_images/product_sport_no_show.png";
import imgKidsPinkCrew from "@assets/generated_images/product_kids_pink_crew.png";
import imgWoolHikerForest from "@assets/generated_images/product_wool_hiker_forest.png";

export const categories: { id: ProductCategory; label: string; tagline: string; image: string }[] = [
  { id: "short", label: "Short Socks", tagline: "Low-cut essentials.", image: imgCatShort },
  { id: "ankle", label: "Ankle Socks", tagline: "Engineered for movement.", image: imgCatAnkle },
  { id: "kids", label: "Kids Socks", tagline: "Soft. Durable. Playful.", image: imgCatKids },
  { id: "others", label: "Others", tagline: "Specialty pieces.", image: imgCatOthers },
];

export const products: Product[] = [
  {
    id: "p_1",
    name: "The Everyday Crew",
    price: 14.0,
    color: "Onyx Black",
    category: "ankle",
    sizes: ["S", "M", "L", "XL"],
    description: "Sharp, breathable, and perfectly tensioned. The only black crew sock you'll ever need.",
    inventory: 1540,
    image: "https://images.unsplash.com/photo-1582966772680-860e372bb558?w=800&q=80",
  },
  {
    id: "p_2",
    name: "The Everyday Crew",
    price: 14.0,
    color: "Arctic White",
    category: "ankle",
    sizes: ["M", "L", "XL"],
    description: "Crisp white crew socks designed to stay up without cutting off circulation.",
    inventory: 820,
    image: "https://images.unsplash.com/photo-1608222351212-18fe0ec7b13b?w=800&q=80",
  },
  {
    id: "p_3",
    name: "Performance Ankle",
    price: 12.0,
    color: "Wolf Orange",
    category: "ankle",
    sizes: ["S", "M", "L"],
    description: "Low profile, high impact. Engineered for active days with reinforced heel and toe.",
    inventory: 430,
    image: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=800&q=80",
  },
  {
    id: "p_4",
    name: "Merino Lounge",
    price: 22.0,
    color: "Heather Grey",
    category: "others",
    sizes: ["M", "L"],
    description: "Luxurious merino wool blend for those slow Sunday mornings.",
    inventory: 115,
    image: "https://images.unsplash.com/photo-1552874869-5c39ec9288dc?w=800&q=80",
  },
  {
    id: "p_5",
    name: "Invisible Liner",
    price: 10.0,
    color: "Pure White",
    category: "short",
    sizes: ["S", "M", "L"],
    description: "Disappear under any sneaker. Silicone heel grip keeps them in place all day.",
    inventory: 720,
    image: "https://images.unsplash.com/photo-1604881991720-f91add269bed?w=800&q=80",
  },
  {
    id: "p_6",
    name: "Sport No-Show",
    price: 11.0,
    color: "Charcoal",
    category: "short",
    sizes: ["M", "L"],
    description: "Cushioned sole, mesh top — built for runners and gym days.",
    inventory: 540,
    image: imgSportNoShow,
  },
  {
    id: "p_7",
    name: "Mini Wolf Crew",
    price: 9.0,
    color: "Cloud Blue",
    category: "kids",
    sizes: ["XS", "S", "M"],
    description: "Soft cotton blend made for little adventurers. Reinforced toe for tough play.",
    inventory: 320,
    image: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800&q=80",
  },
  {
    id: "p_8",
    name: "Mini Wolf Crew",
    price: 9.0,
    color: "Sunset Pink",
    category: "kids",
    sizes: ["XS", "S", "M"],
    description: "Bright, comfortable, and built to last through every adventure.",
    inventory: 280,
    image: imgKidsPinkCrew,
  },
  {
    id: "p_9",
    name: "Wool Hiker",
    price: 24.0,
    color: "Forest",
    category: "others",
    sizes: ["M", "L", "XL"],
    description: "Heavy-cushion merino designed for the trail. Moisture-wicking and odor-resistant.",
    inventory: 95,
    image: imgWoolHikerForest,
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
