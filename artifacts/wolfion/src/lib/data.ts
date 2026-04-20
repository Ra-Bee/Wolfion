export type Product = {
  id: string;
  name: string;
  price: number;
  color: string;
  sizes: string[];
  description: string;
  inventory: number;
  image: string;
};

export const products: Product[] = [
  {
    id: "p_1",
    name: "The Everyday Crew",
    price: 14.00,
    color: "Onyx Black",
    sizes: ["S", "M", "L", "XL"],
    description: "Sharp, breathable, and perfectly tensioned. The only black crew sock you'll ever need.",
    inventory: 1540,
    image: "https://images.unsplash.com/photo-1582966772680-860e372bb558?w=800&q=80"
  },
  {
    id: "p_2",
    name: "The Everyday Crew",
    price: 14.00,
    color: "Arctic White",
    sizes: ["M", "L", "XL"],
    description: "Crisp white crew socks designed to stay up without cutting off circulation.",
    inventory: 820,
    image: "https://images.unsplash.com/photo-1608222351212-18fe0ec7b13b?w=800&q=80"
  },
  {
    id: "p_3",
    name: "Performance Ankle",
    price: 12.00,
    color: "Wolf Orange",
    sizes: ["S", "M", "L"],
    description: "Low profile, high impact. Engineered for active days with reinforced heel and toe.",
    inventory: 430,
    image: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=800&q=80"
  },
  {
    id: "p_4",
    name: "Merino Lounge",
    price: 22.00,
    color: "Heather Grey",
    sizes: ["M", "L"],
    description: "Luxurious merino wool blend for those slow Sunday mornings.",
    inventory: 115,
    image: "https://images.unsplash.com/photo-1552874869-5c39ec9288dc?w=800&q=80"
  }
];

export const adminMetrics = {
  production: {
    activeBatches: 12,
    unitsInProduction: 4500,
    estimatedCompletion: "Oct 24, 2023"
  },
  sales: {
    today: 1240,
    thisWeek: 8540,
    thisMonth: 34200,
    trend: "+14%"
  },
  inventory: {
    totalUnits: 24500,
    lowStockAlerts: 2
  },
  yarn: {
    cottonBlend: "1,200 kg",
    merinoWool: "450 kg",
    elastane: "80 kg",
    status: "Healthy"
  },
  financials: {
    monthlyRevenue: 412000,
    monthlyCosts: 184000,
    profitMargin: "55.3%"
  }
};
