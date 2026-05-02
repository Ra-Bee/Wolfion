// Product catalog has moved to the API server (lib/db/src/schema/products.ts).
// Use `useListProducts` / `useCreateProduct` / `useUpdateProduct` /
// `useDeleteProduct` from `@workspace/api-client-react` to read or mutate
// the catalog. This module now only owns the static category metadata and
// the (placeholder) admin metrics shown on the admin dashboard.

import imgCatShort from "@assets/cat_short.jpg";
import imgCatAnkle from "@assets/cat_ankle.jpg";
import imgCatKids from "@assets/cat_kids.jpg";
import imgCatOthers from "@assets/cat_others.jpg";

export type ProductCategory = "short" | "ankle" | "kids" | "others";

/**
 * Lean product shape used by client components (cards, cart, detail page).
 *
 * The server returns a richer Product (with sortOrder, createdAt, updatedAt)
 * — that shape is structurally assignable to this one, so the API hook results
 * can be passed straight into anything that expects a Product.
 *
 * Cart snapshots (stored in localStorage) only ever read the fields below.
 */
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

export const categories: { id: ProductCategory; label: string; tagline: string; image: string }[] = [
  { id: "short", label: "Short Socks", tagline: "Low-cut essentials.", image: imgCatShort },
  { id: "ankle", label: "Ankle Socks", tagline: "Engineered for movement.", image: imgCatAnkle },
  { id: "kids", label: "Kids Socks", tagline: "Soft. Durable. Playful.", image: imgCatKids },
  { id: "others", label: "Others", tagline: "Specialty pieces.", image: imgCatOthers },
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
