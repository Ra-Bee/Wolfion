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
import imgEverydayCrewBlack from "@assets/generated_images/product_everyday_crew_black.png";
import imgEverydayCrewWhite from "@assets/generated_images/product_everyday_crew_white.png";
import imgPerformanceAnkleOrange from "@assets/generated_images/product_performance_ankle_orange.png";
import imgMerinoLoungeGrey from "@assets/generated_images/product_merino_lounge_grey.png";
import imgInvisibleLinerWhite from "@assets/generated_images/product_invisible_liner_white.png";
import imgSportNoShowCharcoal from "@assets/generated_images/product_sport_noshow_charcoal.png";
import imgKidsCrewBlue from "@assets/generated_images/product_kids_crew_blue.png";
import imgKidsCrewPink from "@assets/generated_images/product_kids_crew_pink.png";
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
    image: imgEverydayCrewBlack,
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
    image: imgEverydayCrewWhite,
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
    image: imgPerformanceAnkleOrange,
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
    image: imgMerinoLoungeGrey,
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
    image: imgInvisibleLinerWhite,
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
    image: imgSportNoShowCharcoal,
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
    image: imgKidsCrewBlue,
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
    image: imgKidsCrewPink,
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
