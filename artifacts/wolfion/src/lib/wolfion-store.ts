import { useEffect, useState } from "react";
import { useCloudStored } from "@/lib/cloud-store";

export type ProductType = string;
export type ProductTypeOption = { id: string; label: string };

export type ProductionEntry = {
  id: string;
  date: string;
  productType: ProductType;
  quantityDozen: number;
  sourceDailyId?: string;
};

export type SaleEntry = {
  id: string;
  customerName: string;
  productType: ProductType;
  quantityDozen: number;
  pricePerDozen: number;
  totalValue: number;
  createdAt: string;
  date?: string;
  receiptImage?: string;
};

export type DailyProductionEntry = {
  id: string;
  date: string;
  totalProductionDozen: number;
  yarnUsedKg: number;
  machineHours: number;
  yarnCostPerKg: number;
  laborCost: number;
  packagingCost: number;
  ironCost: number;
  staffBill?: number;
  /** Worker billed for ironing (10 Tk/dz). */
  ironManId?: string;
  /** Worker billed for packaging (5 Tk/dz). */
  packagingManId?: string;
  totalCost: number;
  costPerDozen: number;
  productType?: ProductType;
  createdAt: string;
  receiptImage?: string;
};

export type ElectricityEntry = {
  receiptImage?: string;
  id: string;
  month: string;
  totalBill: number;
  createdAt: string;
};

export type Worker = {
  id: string;
  name: string;
  payType: "daily" | "per_unit";
  rate: number;
  createdAt: string;
};

export type WorkLog = {
  id: string;
  workerId: string;
  date: string;
  amount: number;
  createdAt: string;
  /** Dozens produced that this bill is for (from daily production). */
  dozens?: number;
  /** What the bill is for, e.g. "Ironing — Short socks". */
  note?: string;
  /** Which auto role generated this bill (drives the per-dozen rate on edit). */
  role?: "iron" | "packaging";
  /** Daily production entry this bill was generated from (for cleanup). */
  sourceDailyId?: string;
};

export type WorkerPayment = {
  id: string;
  workerId: string;
  date: string;
  amount: number;
  createdAt: string;
  receiptImage?: string;
};

export type YarnUnit = "kg" | "lb";
export type YarnPurchase = {
  id: string;
  date: string;
  /** Normalised weight in kg (always set; used for stock + price/kg math). */
  kg: number;
  /** Recipe yarn id (or a custom id) this purchase is for. */
  yarnTypeId?: string;
  /** Amount as the admin typed it, in `unit`. */
  amount?: number;
  unit?: YarnUnit;
  /** Total price paid for this purchase (Tk). */
  totalPrice?: number;
  /** Legacy free-text yarn name from the old dashboard form. */
  yarnType?: string;
  createdAt: string;
  receiptImage?: string;
};

export type Investment = {
  id: string;
  date: string;
  type: string;
  description: string;
  amount: number;
  source: string;
  createdAt: string;
  receiptImage?: string;
};

export type InvestorEntry = {
  id: string;
  name: string;
  date: string;
  amount: number;
  createdAt: string;
  receiptImage?: string;
};

export type Debt = {
  id: string;
  date: string;
  personName: string;
  amount: number;
  description?: string;
  createdAt: string;
  receiptImage?: string;
};

export type DebtPayment = {
  id: string;
  debtId: string;
  date: string;
  amount: number;
  createdAt: string;
  receiptImage?: string;
};
export type YarnPerDozen = Record<string, number>;
export type YarnUsageEntry = {
  id: string;
  productType: ProductType;
  kgUsed: number;
  createdAt: string;
  sourceDailyId?: string;
};

export const STORAGE_KEYS = {
  productTypes: "wolfion_product_types",
  productConfigs: "wolfion_product_configs",
  production: "wolfion_production_entries",
  sales: "wolfion_sales_entries",
  yarnStock: "wolfion_yarn_stock_kg",
  yarnUsage: "wolfion_yarn_usage_entries",
  daily: "wolfion_daily_production_entries",
  electricity: "wolfion_monthly_electricity",
  electricityRecharges: "wolfion_electricity_recharges",
  rents: "wolfion_rents",
  workers: "wolfion_workers",
  workLogs: "wolfion_worker_logs",
  workerPayments: "wolfion_worker_payments",
  yarnPurchases: "wolfion_yarn_purchases",
  yarnPerDozen: "wolfion_yarn_per_dozen",
  investments: "wolfion_investments",
  investors: "wolfion_investors",
  debts: "wolfion_debts",
  debtPayments: "wolfion_debt_payments",
  costInputs: "wolfion_cost_inputs",
  costHistory: "wolfion_cost_history",
  yarnTypes: "wolfion_yarn_types",
} as const;

export const defaultYarnTypes: string[] = [
  "Spandex",
  "Cotton",
  "Rubber",
  "Black yarn",
  "White",
  "Blue",
  "Red",
];

export type CostHistoryEntry = {
  id: string;
  date: string;
  item: string;
  amount: number;
  note?: string;
  createdAt: string;
  receiptImage?: string;
};

export type RentKind = "factory" | "shop";
export type RentEntry = {
  id: string;
  kind: RentKind;
  month: string;
  amount: number;
  paidOn?: string;
  note?: string;
  createdAt: string;
  receiptImage?: string;
};

export const defaultProductTypes: ProductTypeOption[] = [
  { id: "short-socks", label: "Short socks" },
  { id: "ankle-socks", label: "Ankle socks" },
  { id: "kids-socks", label: "Kids socks" },
  { id: "mixed", label: "Mixed" },
  { id: "sports-football", label: "Sports (Football)" },
  { id: "others", label: "Others" },
];

export const initialInventory: Record<string, number> = {
  "short-socks": 0,
  "ankle-socks": 0,
  "kids-socks": 0,
  "mixed": 0,
  "sports-football": 0,
  "others": 0,
};

export const defaultYarnPerDozen: YarnPerDozen = {
  "short-socks": 0.5,
  "ankle-socks": 0.6,
  "kids-socks": 0.4,
  "others": 0.55,
};

// Value of finished-goods stock on hand, in Taka per dozen, keyed by product
// type id. Used to show the "Stock value" of inventory in the daily profit
// area. Product types without an entry are valued at 0.
export const defaultStockValuePerDozen: Record<string, number> = {
  "short-socks": 150,
};

// ---------------------------------------------------------------------------
// Short-socks yarn recipe + auto cost rules
// ---------------------------------------------------------------------------
// Yarn used per dozen is fixed by this recipe (grams per dozen). The default
// price per kg is the starting price; once a yarn purchase is logged, that
// purchase's price/kg is used for production on/after the purchase date.

export type YarnRecipeItem = {
  id: string;
  label: string;
  gramsPerDozen: number;
  defaultPricePerKg: number;
};

/** The product type id the yarn recipe applies to. */
export const RECIPE_PRODUCT_TYPE_ID = "short-socks";

export const shortSocksYarnRecipe: YarnRecipeItem[] = [
  { id: "spandex-1", label: "Spandex (Type 1)", gramsPerDozen: 13, defaultPricePerKg: 300 },
  { id: "nylon", label: "Nylon", gramsPerDozen: 10, defaultPricePerKg: 286 },
  { id: "rubber", label: "Rubber", gramsPerDozen: 17.5, defaultPricePerKg: 551 },
  { id: "nylon-design", label: "Nylon (Design)", gramsPerDozen: 6.5, defaultPricePerKg: 286 },
  { id: "cotton", label: "Cotton (Body)", gramsPerDozen: 185, defaultPricePerKg: 209 },
  { id: "spandex-3", label: "Spandex (Type 3 — Heel & Toe)", gramsPerDozen: 50.5, defaultPricePerKg: 300 },
  { id: "spandex-2", label: "Spandex (Type 2)", gramsPerDozen: 71, defaultPricePerKg: 300 },
];

/** Auto per-dozen costs (Tk). */
export const PACKAGING_COST_PER_DOZEN = 5; // packaging material
export const IRON_COST_PER_DOZEN = 10; // ironing / finishing process
export const IRON_MAN_RATE_PER_DOZEN = 10; // iron man staff bill
export const PACKAGING_MAN_RATE_PER_DOZEN = 5; // packaging man staff bill
export const FACTORY_RENT_COST_PER_DOZEN = 5; // factory rent
export const FLIP_STAFF_COST_PER_DOZEN = 1.5; // flip staff
export const SEWING_COST_PER_DOZEN = 3; // sewing
export const ELECTRICITY_COST_PER_DOZEN = 10; // electricity
export const STAFF_SALARY_COST_PER_DOZEN = 10; // staff salary

/**
 * Flat per-dozen production costs shown in the daily breakdown. Yarn is the
 * only variable (recipe-based) cost and is handled separately.
 */
export const PER_DOZEN_COST_ITEMS: { id: string; label: string; perDozen: number }[] = [
  { id: "packaging", label: "Packaging", perDozen: PACKAGING_COST_PER_DOZEN },
  { id: "iron", label: "Iron / finishing", perDozen: IRON_COST_PER_DOZEN },
  { id: "factory-rent", label: "Factory rent", perDozen: FACTORY_RENT_COST_PER_DOZEN },
  { id: "flip-staff", label: "Flip staff", perDozen: FLIP_STAFF_COST_PER_DOZEN },
  { id: "sewing", label: "Sewing", perDozen: SEWING_COST_PER_DOZEN },
  { id: "electricity", label: "Electricity", perDozen: ELECTRICITY_COST_PER_DOZEN },
  { id: "staff-salary", label: "Staff salary", perDozen: STAFF_SALARY_COST_PER_DOZEN },
];

/** Sum of every flat per-dozen cost (excludes variable yarn cost). */
export const TOTAL_PER_DOZEN_FIXED_COST = PER_DOZEN_COST_ITEMS.reduce((s, i) => s + i.perDozen, 0);

/**
 * Overhead folded into a daily entry's `laborCost` field — everything except
 * the packaging + iron line items, which keep their own dedicated fields so
 * report category totals stay correct.
 */
export const OVERHEAD_COST_PER_DOZEN =
  FACTORY_RENT_COST_PER_DOZEN +
  FLIP_STAFF_COST_PER_DOZEN +
  SEWING_COST_PER_DOZEN +
  ELECTRICITY_COST_PER_DOZEN +
  STAFF_SALARY_COST_PER_DOZEN;

export const LB_TO_KG = 0.45359237;

export function toKg(amount: number, unit: YarnUnit): number {
  const n = Number(amount) || 0;
  return unit === "lb" ? n * LB_TO_KG : n;
}

/**
 * Effective price per kg for a yarn type on a given date: the price from the
 * most recent purchase of that yarn dated on/before `date`. Falls back to the
 * recipe's default price when there is no earlier purchase (so prices update
 * from that day's production forward, never retroactively).
 */
export function yarnPricePerKgOn(
  purchases: YarnPurchase[],
  yarnTypeId: string,
  date: string,
  fallback: number,
): number {
  const candidates = purchases
    .filter(
      (p) =>
        p.yarnTypeId === yarnTypeId &&
        (p.kg || 0) > 0 &&
        (p.totalPrice || 0) > 0 &&
        (p.date || "") <= date,
    )
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  if (candidates.length > 0) {
    const top = candidates[0];
    return (top.totalPrice || 0) / (top.kg || 1);
  }
  return fallback;
}

export type YarnCostLine = YarnRecipeItem & {
  kg: number;
  pricePerKg: number;
  cost: number;
};

/**
 * Auto yarn usage + cost for a quantity (dozens) of a product, given that
 * product's yarn recipe and the date-effective price per yarn type. An empty
 * recipe yields zero yarn usage/cost (products without a recipe carry no yarn).
 */
export function computeProductYarn(
  recipe: YarnRecipeItem[],
  qtyDozen: number,
  purchases: YarnPurchase[],
  date: string,
): { totalKg: number; totalCost: number; lines: YarnCostLine[] } {
  let totalKg = 0;
  let totalCost = 0;
  const lines = recipe.map((item) => {
    const kg = (item.gramsPerDozen * qtyDozen) / 1000;
    const pricePerKg = yarnPricePerKgOn(purchases, item.id, date, item.defaultPricePerKg);
    const cost = kg * pricePerKg;
    totalKg += kg;
    totalCost += cost;
    return { ...item, kg, pricePerKg, cost };
  });
  return { totalKg, totalCost, lines };
}

/**
 * Auto yarn usage + cost for a quantity (dozens) of short socks. Kept as a thin
 * wrapper over {@link computeProductYarn} for backward compatibility.
 */
export function computeShortSocksYarn(
  qtyDozen: number,
  purchases: YarnPurchase[],
  date: string,
): { totalKg: number; totalCost: number; lines: YarnCostLine[] } {
  return computeProductYarn(shortSocksYarnRecipe, qtyDozen, purchases, date);
}

// ---------------------------------------------------------------------------
// Per-product configuration (self-service products)
// ---------------------------------------------------------------------------
// Each product carries its own yarn recipe, selling price per dozen ("price
// value of product") and finished-stock value per dozen. Admins manage these
// from the Product Setup page; all cost/yarn calculations read from here so new
// products can be added without code changes.

export type ProductConfig = {
  id: string;
  label: string;
  yarnRecipe: YarnRecipeItem[];
  sellingPricePerDozen: number;
  stockValuePerDozen: number;
};

/**
 * Default product configs. Seeded so existing numbers are unchanged until a
 * product is edited: short socks keeps its hardcoded recipe + Tk 150/dozen
 * stock value; other products start with no recipe (zero yarn cost), matching
 * the previous behaviour.
 */
export const defaultProductConfigs: ProductConfig[] = defaultProductTypes.map((t) => ({
  id: t.id,
  label: t.label,
  yarnRecipe: t.id === RECIPE_PRODUCT_TYPE_ID ? shortSocksYarnRecipe : [],
  sellingPricePerDozen: defaultStockValuePerDozen[t.id] ?? 0,
  stockValuePerDozen: defaultStockValuePerDozen[t.id] ?? 0,
}));

/**
 * The yarn recipe configured for a product id (empty if the product exists but
 * has no recipe, or is unknown). Legacy entries saved before product types
 * existed have no `productType`; those fall back to the short-socks recipe so
 * historical numbers are unchanged.
 */
export function recipeForProduct(
  configs: ProductConfig[],
  productId: string | undefined,
): YarnRecipeItem[] {
  const id = productId || RECIPE_PRODUCT_TYPE_ID;
  return configs.find((c) => c.id === id)?.yarnRecipe ?? [];
}

/**
 * Every distinct recipe yarn across all product configs, deduped by id (first
 * occurrence wins). Used by yarn pages that aggregate across all products.
 */
export function allRecipeYarns(configs: ProductConfig[]): YarnRecipeItem[] {
  const map = new Map<string, YarnRecipeItem>();
  for (const c of configs) {
    for (const item of c.yarnRecipe) {
      if (!map.has(item.id)) map.set(item.id, item);
    }
  }
  return Array.from(map.values());
}

// ---------------------------------------------------------------------------
// Unified financial calculation — single source of truth
// ---------------------------------------------------------------------------
// Every admin surface (Dashboard, Inventory Report, PDF report) must derive
// Production / Sales / Cost / Profit from these helpers so the numbers match
// everywhere. Cost is the cash-flow view: the full per-dozen loaded cost of
// everything produced in the period (yarn + packaging + iron + overhead, where
// overhead already bundles rent + electricity + salary). Profit = Sales − that
// cost, so unsold socks count as a loss until they are sold.

/** Weighted-average price/kg across all yarn purchases dated on/before `date`. */
export function averageYarnPricePerKg(
  purchases: YarnPurchase[],
  date: string,
  fallback: number,
): number {
  let kg = 0;
  let cost = 0;
  for (const p of purchases) {
    const pk = p.kg || 0;
    const pc = p.totalPrice || 0;
    if (pk <= 0 || pc <= 0) continue;
    if ((p.date || "") > date) continue;
    kg += pk;
    cost += pc;
  }
  return kg > 0 ? cost / kg : fallback;
}

/**
 * Fallback yarn price/kg, used to estimate yarn cost for products that have no
 * recipe and no purchase history. Derived from the short-socks recipe defaults
 * (weighted by grams) so it tracks a realistic market price.
 */
export const FALLBACK_YARN_PRICE_PER_KG: number = (() => {
  let kg = 0;
  let cost = 0;
  for (const i of shortSocksYarnRecipe) {
    const k = i.gramsPerDozen / 1000;
    kg += k;
    cost += k * i.defaultPricePerKg;
  }
  return kg > 0 ? cost / kg : 0;
})();

/**
 * Default kg/dozen used to estimate yarn for a recipe-less product that also
 * has no entry in `defaultYarnPerDozen` (e.g. "mixed", "sports-football").
 * Keeps their cost from collapsing to zero; based on the short-socks baseline.
 */
export const FALLBACK_YARN_PER_DOZEN = 0.5;

/**
 * Yarn usage + cost for a product. Uses the product's recipe when it has one;
 * otherwise estimates from its default kg/dozen and the prevailing yarn price so
 * recipe-less products (e.g. ankle socks, "others") still carry a realistic
 * yarn cost instead of zero.
 */
export function productYarnCost(
  configs: ProductConfig[],
  productType: string | undefined,
  qtyDozen: number,
  purchases: YarnPurchase[],
  date: string,
): { totalKg: number; totalCost: number; lines: YarnCostLine[]; estimated: boolean } {
  const recipe = recipeForProduct(configs, productType);
  if (recipe.length > 0) {
    const r = computeProductYarn(recipe, qtyDozen, purchases, date);
    return { ...r, estimated: false };
  }
  const kgPerDz = (productType && defaultYarnPerDozen[productType]) || FALLBACK_YARN_PER_DOZEN;
  const kg = kgPerDz * qtyDozen;
  const pricePerKg = averageYarnPricePerKg(purchases, date, FALLBACK_YARN_PRICE_PER_KG);
  const cost = kg * pricePerKg;
  const lines: YarnCostLine[] =
    kg > 0
      ? [
          {
            id: "estimated-yarn",
            label: "Estimated yarn (no recipe)",
            gramsPerDozen: kgPerDz * 1000,
            defaultPricePerKg: pricePerKg,
            kg,
            pricePerKg,
            cost,
          },
        ]
      : [];
  return { totalKg: kg, totalCost: cost, lines, estimated: true };
}

export type CanonicalCost = {
  yarnKg: number;
  yarnCost: number;
  packagingCost: number;
  ironCost: number;
  laborCost: number;
  totalCost: number;
  costPerDozen: number;
};

/** Canonical fully-loaded cost for a single daily production entry. */
export function canonicalDailyCost(
  entry: DailyProductionEntry,
  configs: ProductConfig[],
  purchases: YarnPurchase[],
): CanonicalCost {
  const q = entry.totalProductionDozen || 0;
  const yarn = productYarnCost(configs, entry.productType, q, purchases, entry.date);
  const packagingCost = PACKAGING_COST_PER_DOZEN * q;
  const ironCost = IRON_COST_PER_DOZEN * q;
  const laborCost = OVERHEAD_COST_PER_DOZEN * q;
  const totalCost = yarn.totalCost + packagingCost + ironCost + laborCost;
  return {
    yarnKg: yarn.totalKg,
    yarnCost: yarn.totalCost,
    packagingCost,
    ironCost,
    laborCost,
    totalCost,
    costPerDozen: q > 0 ? totalCost / q : 0,
  };
}

/**
 * Cost of goods sold for a single sale: the production cost of just the dozens
 * sold (yarn priced at the sale date + the fixed per-dozen costs). This powers
 * the sales-based profit model, where unsold stock is NOT counted as a loss —
 * it stays in inventory until it sells.
 */
export function saleCostOfGoods(
  configs: ProductConfig[],
  purchases: YarnPurchase[],
  sale: { productType?: string; quantityDozen?: number; date?: string; createdAt?: string },
): number {
  const q = sale.quantityDozen || 0;
  if (q <= 0) return 0;
  const date = sale.date || (sale.createdAt ? sale.createdAt.slice(0, 10) : getToday());
  const yarn = productYarnCost(configs, sale.productType, q, purchases, date);
  return yarn.totalCost + TOTAL_PER_DOZEN_FIXED_COST * q;
}

export type PeriodSummary = {
  productionDz: number;
  salesValue: number;
  salesDz: number;
  totalCost: number;
  costOfGoodsSold: number;
  yarnCost: number;
  laborCost: number;
  packagingCost: number;
  ironCost: number;
  profit: number;
};

/**
 * The one financial summary used across the whole admin app. Pass entries
 * already filtered to the period of interest.
 * - `totalCost` is the full production cost of everything made in the period
 *   (informational; shown as "production cost").
 * - `costOfGoodsSold` is the production cost of only the dozens actually sold.
 * - `profit` is the sales-based view: Sales − cost of goods sold, so unsold
 *   stock is NOT counted as a loss.
 */
export function computePeriodSummary(args: {
  production: ProductionEntry[];
  sales: SaleEntry[];
  daily: DailyProductionEntry[];
  configs: ProductConfig[];
  purchases: YarnPurchase[];
}): PeriodSummary {
  const { production, sales, daily, configs, purchases } = args;
  const productionDz = production.reduce((s, e) => s + (e.quantityDozen || 0), 0);
  const salesValue = sales.reduce((s, e) => s + (e.totalValue || 0), 0);
  const salesDz = sales.reduce((s, e) => s + (e.quantityDozen || 0), 0);
  let totalCost = 0;
  let yarnCost = 0;
  let laborCost = 0;
  let packagingCost = 0;
  let ironCost = 0;
  for (const e of daily) {
    const c = canonicalDailyCost(e, configs, purchases);
    totalCost += c.totalCost;
    yarnCost += c.yarnCost;
    laborCost += c.laborCost;
    packagingCost += c.packagingCost;
    ironCost += c.ironCost;
  }
  let costOfGoodsSold = 0;
  for (const s of sales) costOfGoodsSold += saleCostOfGoods(configs, purchases, s);
  return {
    productionDz,
    salesValue,
    salesDz,
    totalCost,
    costOfGoodsSold,
    yarnCost,
    laborCost,
    packagingCost,
    ironCost,
    profit: salesValue - costOfGoodsSold,
  };
}

export function getToday() {
  return new Date().toISOString().slice(0, 10);
}

const TK_FMT = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** Canonical money formatter. Always "Tk 12,345" or "Tk 12,345.50". */
export function formatTk(value: number | null | undefined): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "Tk 0";
  return `Tk ${TK_FMT.format(n)}`;
}

const QTY_FMT = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** Canonical quantity formatter (no currency). */
export function formatNum(value: number | null | undefined): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  return QTY_FMT.format(n);
}

export function formatDateLabel(isoDate: string) {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    if (v == null) return fallback;
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
}

const SAME_TAB_EVENT = "wolfion:storage";

function notifySameTab(key: string) {
  try {
    window.dispatchEvent(new CustomEvent(SAME_TAB_EVENT, { detail: { key } }));
  } catch { /* ignore */ }
}

// Storage keys that mirror to Firebase Realtime Database for cross-device
// admin sync. As of Phase 2 this covers ALL admin datasets — every
// key in STORAGE_KEYS below. Every key here is consumed only by admin
// pages; customer pages don't read these keys, so no extra read-access
// is granted to non-admins (RTDB rules still require admin claim).
const CLOUD_SYNCED_KEYS: ReadonlySet<string> = new Set<string>([
  STORAGE_KEYS.productTypes,
  STORAGE_KEYS.productConfigs,
  STORAGE_KEYS.production,
  STORAGE_KEYS.sales,
  STORAGE_KEYS.yarnStock,
  STORAGE_KEYS.yarnUsage,
  STORAGE_KEYS.daily,
  STORAGE_KEYS.electricity,
  STORAGE_KEYS.electricityRecharges,
  STORAGE_KEYS.rents,
  STORAGE_KEYS.workers,
  STORAGE_KEYS.workLogs,
  STORAGE_KEYS.workerPayments,
  STORAGE_KEYS.yarnPurchases,
  STORAGE_KEYS.yarnPerDozen,
  STORAGE_KEYS.investments,
  STORAGE_KEYS.investors,
  STORAGE_KEYS.debts,
  STORAGE_KEYS.debtPayments,
  STORAGE_KEYS.costInputs,
  STORAGE_KEYS.costHistory,
  STORAGE_KEYS.yarnTypes,
]);

export function useStored<T>(key: string, fallback: T) {
  // NOTE on the conditional hook below: React forbids hooks whose
  // identity changes across renders for the SAME component instance.
  // Every call site passes a string literal from STORAGE_KEYS, so the
  // branch chosen is constant for the lifetime of that call site --
  // satisfies the underlying invariant the rule protects.
  if (CLOUD_SYNCED_KEYS.has(key)) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useCloudStored<T>(key, fallback);
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useLocalStored<T>(key, fallback);
}

function useLocalStored<T>(key: string, fallback: T) {
  const [value, setValueState] = useState<T>(() => readJSON<T>(key, fallback));

  const setValue: typeof setValueState = (next) => {
    setValueState((prev) => {
      const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      try { localStorage.setItem(key, JSON.stringify(resolved)); } catch { /* ignore */ }
      notifySameTab(key);
      return resolved;
    });
  };

  useEffect(() => {
    const refresh = () => setValueState(readJSON<T>(key, fallback));
    const onStorage = (e: StorageEvent) => { if (e.key === key) refresh(); };
    const onSameTab = (e: Event) => {
      const detail = (e as CustomEvent).detail as { key?: string } | undefined;
      if (detail?.key === key) refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(SAME_TAB_EVENT, onSameTab);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(SAME_TAB_EVENT, onSameTab);
    };
  }, [key, fallback]);

  return [value, setValue] as const;
}

export function useStoredNumber(key: string, fallback: number) {
  // Route cloud-synced number keys (e.g. yarnStockKg) through the
  // same cloud-store hook used for arrays/objects. Same stable-branch
  // safety argument as useStored — call sites always pass a constant
  // STORAGE_KEYS literal.
  if (CLOUD_SYNCED_KEYS.has(key)) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useCloudStored<number>(key, fallback);
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useLocalStoredNumber(key, fallback);
}

function useLocalStoredNumber(key: string, fallback: number) {
  const readNum = (): number => {
    try {
      const v = localStorage.getItem(key);
      if (v == null) return fallback;
      const n = Number(v);
      return Number.isFinite(n) ? n : fallback;
    } catch { return fallback; }
  };
  const [value, setValueState] = useState<number>(readNum);

  const setValue: typeof setValueState = (next) => {
    setValueState((prev) => {
      const resolved = typeof next === "function" ? (next as (p: number) => number)(prev) : next;
      try { localStorage.setItem(key, String(resolved)); } catch { /* ignore */ }
      notifySameTab(key);
      return resolved;
    });
  };

  useEffect(() => {
    const refresh = () => setValueState(readNum());
    const onStorage = (e: StorageEvent) => { if (e.key === key) refresh(); };
    const onSameTab = (e: Event) => {
      const detail = (e as CustomEvent).detail as { key?: string } | undefined;
      if (detail?.key === key) refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(SAME_TAB_EVENT, onSameTab);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(SAME_TAB_EVENT, onSameTab);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, fallback]);

  return [value, setValue] as const;
}

export function inDateRange(date: string, start: string, end: string) {
  if (!date) return false;
  return date >= start && date <= end;
}

export function clearAdminStorage() {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    localStorage.removeItem("wolfion:savedPayments");
  } catch { /* ignore */ }
}
