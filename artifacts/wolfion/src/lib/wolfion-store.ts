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
  /** Set when this record was created from a "Full Set" football entry. */
  comboId?: string;
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
  /** Set when this record was created from a "Full Set" football sale. */
  comboId?: string;
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
  /** Work shift this production happened in. */
  shift?: "day" | "night";
  createdAt: string;
  receiptImage?: string;
  /** Set when this record was created from a "Full Set" football entry. */
  comboId?: string;
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
  { id: "sports-football-top", label: "Football Top Part" },
  { id: "sports-football-bottom", label: "Football Bottom Part" },
  { id: "others", label: "Others" },
];

/**
 * Football socks are made in two parts (top part + bottom part). In product
 * dropdowns they appear as two sub-options nested under "Sports (Football)",
 * and each part is its own product type in inventory, sales and reports.
 */
export const LEGACY_FOOTBALL_ID = "sports-football";
export const FOOTBALL_TOP_ID = "sports-football-top";
export const FOOTBALL_BOTTOM_ID = "sports-football-bottom";

/**
 * UI-only sentinel for entry forms: "Sports Football (Full Set)". Selecting it
 * records BOTH parts at the entered quantity (40 dz football = 40 dz top +
 * 40 dz bottom). It is never stored as a productType — submit handlers expand
 * it into separate top-part and bottom-part records that share a `comboId`.
 * History lists collapse those sibling records back into ONE "Full Set" row
 * for display (see mergeComboSaleRows / mergeComboDailyRows); the underlying
 * per-part records keep stock, yarn and cost maths correct everywhere else.
 */
export const FOOTBALL_COMBO_ID = "sports-football-combo";
export const FOOTBALL_COMBO_LABEL = "Sports Football (Full Set)";

/**
 * Collapse sale records that share a comboId into one display row: quantity
 * stays the per-set quantity, money values are summed. The merged row's id is
 * the comboId — edit/delete handlers must fan out to every record whose
 * comboId (or id) matches it.
 */
export function mergeComboSaleRows(list: SaleEntry[]): SaleEntry[] {
  const seen = new Set<string>();
  const out: SaleEntry[] = [];
  for (const s of list) {
    if (!s.comboId) {
      out.push(s);
      continue;
    }
    if (seen.has(s.comboId)) continue;
    seen.add(s.comboId);
    const parts = list.filter((x) => x.comboId === s.comboId);
    const totalValue = parts.reduce((sum, x) => sum + (x.totalValue || 0), 0);
    const qty = s.quantityDozen || 0;
    out.push({
      ...s,
      id: s.comboId,
      productType: FOOTBALL_COMBO_ID,
      totalValue,
      pricePerDozen: qty > 0 ? totalValue / qty : 0,
    });
  }
  return out;
}

/**
 * Collapse daily-production records that share a comboId into one display
 * row: dozens stay the per-set quantity, yarn kg and every cost are summed.
 * The merged row's id is the comboId — edit/delete handlers must fan out.
 */
export function mergeComboDailyRows(list: DailyProductionEntry[]): DailyProductionEntry[] {
  const seen = new Set<string>();
  const out: DailyProductionEntry[] = [];
  for (const e of list) {
    if (!e.comboId) {
      out.push(e);
      continue;
    }
    if (seen.has(e.comboId)) continue;
    seen.add(e.comboId);
    const parts = list.filter((x) => x.comboId === e.comboId);
    const yarnKg = parts.reduce((sum, x) => sum + (x.yarnUsedKg || 0), 0);
    const yarnCost = parts.reduce((sum, x) => sum + (x.yarnUsedKg || 0) * (x.yarnCostPerKg || 0), 0);
    const totalCost = parts.reduce((sum, x) => sum + (x.totalCost || 0), 0);
    const q = e.totalProductionDozen || 0;
    out.push({
      ...e,
      id: e.comboId,
      productType: FOOTBALL_COMBO_ID,
      yarnUsedKg: yarnKg,
      yarnCostPerKg: yarnKg > 0 ? yarnCost / yarnKg : 0,
      laborCost: parts.reduce((sum, x) => sum + (x.laborCost || 0), 0),
      packagingCost: parts.reduce((sum, x) => sum + (x.packagingCost || 0), 0),
      ironCost: parts.reduce((sum, x) => sum + (x.ironCost || 0), 0),
      totalCost,
      costPerDozen: q > 0 ? totalCost / q : 0,
    });
  }
  return out;
}

export const FOOTBALL_PART_PRODUCTS: ProductTypeOption[] = [
  { id: FOOTBALL_TOP_ID, label: "Football Top Part" },
  { id: FOOTBALL_BOTTOM_ID, label: "Football Bottom Part" },
];

/**
 * A complete football dozen needs one top-part dozen AND one bottom-part
 * dozen, so the finished total is the number of matching pairs
 * (min of the two). Whatever is left over stays "inside" as spare parts
 * waiting for their other half.
 */
export function combineFootballStock(top: number, bottom: number) {
  const t = Math.max(0, top || 0);
  const b = Math.max(0, bottom || 0);
  const pairs = Math.min(t, b);
  return { pairs, top: t, bottom: b, spareTop: t - pairs, spareBottom: b - pairs };
}

export const initialInventory: Record<string, number> = {
  "short-socks": 0,
  "ankle-socks": 0,
  "kids-socks": 0,
  "mixed": 0,
  "sports-football-top": 0,
  "sports-football-bottom": 0,
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
  /**
   * Default price in the recipe's price unit (Tk per kg when `priceUnit` is
   * "kg" or missing, Tk per lb when it is "lb"). Use
   * {@link recipeDefaultPricePerKg} to get the normalized per-kg value.
   */
  defaultPricePerKg: number;
  /** Unit the default price is quoted in. Missing = "kg" (legacy data). */
  priceUnit?: YarnUnit;
};

/** Normalized default price per kg for a recipe item (converts lb → kg). */
export function recipeDefaultPricePerKg(item: YarnRecipeItem): number {
  const price = Number(item.defaultPricePerKg) || 0;
  return item.priceUnit === "lb" ? price / LB_TO_KG : price;
}

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

/** Yarn recipe for the football top part (all prices quoted per kg). */
export const footballTopYarnRecipe: YarnRecipeItem[] = [
  { id: "ft-yellow-polyester", label: "Yellow Polyester", gramsPerDozen: 181, defaultPricePerKg: 275.5 },
  { id: "ft-white-75", label: "White 75", gramsPerDozen: 83.5, defaultPricePerKg: 260.1 },
  { id: "ft-white-spandex", label: "White Spandex", gramsPerDozen: 113.5, defaultPricePerKg: 300 },
  { id: "ft-black-nylon", label: "Black Nylon", gramsPerDozen: 18, defaultPricePerKg: 286.5 },
  { id: "ft-yellow-nylon", label: "Yellow Nylon", gramsPerDozen: 5.5, defaultPricePerKg: 286.5 },
  { id: "ft-rubber-white", label: "Rubber White", gramsPerDozen: 46.5, defaultPricePerKg: 551.1 },
];

/** Yarn recipe for the football bottom part (all prices quoted per kg). */
export const footballBottomYarnRecipe: YarnRecipeItem[] = [
  { id: "fb-cotton-orange-body-1", label: "Cotton Orange Body 1", gramsPerDozen: 149.5, defaultPricePerKg: 319.67 },
  { id: "fb-cotton-orange-body-2", label: "Cotton Orange Body 2", gramsPerDozen: 150.5, defaultPricePerKg: 319.67 },
  { id: "fb-cotton-hill-type-1", label: "Cotton Hill Type 1", gramsPerDozen: 42.5, defaultPricePerKg: 319.67 },
  { id: "fb-cotton-hill-type-2", label: "Cotton Hill Type 2", gramsPerDozen: 38.5, defaultPricePerKg: 319.67 },
  { id: "fb-black-nylon", label: "Black Nylon", gramsPerDozen: 122, defaultPricePerKg: 286.6 },
  { id: "fb-spandex-body-1", label: "Spandex Body 1", gramsPerDozen: 78, defaultPricePerKg: 300 },
  { id: "fb-spandex-body-2", label: "Spandex Body 2", gramsPerDozen: 19.5, defaultPricePerKg: 300 },
  { id: "fb-rubber", label: "Rubber", gramsPerDozen: 43, defaultPricePerKg: 551.16 },
];

/** Default yarn recipe per football part product id. */
export const FOOTBALL_PART_RECIPES: Record<string, YarnRecipeItem[]> = {
  [FOOTBALL_TOP_ID]: footballTopYarnRecipe,
  [FOOTBALL_BOTTOM_ID]: footballBottomYarnRecipe,
};

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

/** Convert a Tk/kg price to the equivalent Tk/lb price (1 lb = LB_TO_KG kg). */
export function pricePerKgToLb(pricePerKg: number): number {
  return (Number(pricePerKg) || 0) * LB_TO_KG;
}

/**
 * Known yarn material keywords, checked in this order. When a yarn label
 * contains one, the material word is moved to the front so similar yarns group
 * together when sorted (e.g. "Black Nylon" -> "Nylon Black").
 */
export const YARN_MATERIALS = ["Nylon", "Spandex", "Cotton", "Rubber", "Polyester"] as const;

/**
 * Reorder a yarn label so its material keyword comes first. This groups all
 * nylon/spandex/cotton/etc. together alphabetically. Labels without a known
 * material are returned unchanged (trimmed).
 */
export function displayYarnName(label: string): string {
  const trimmed = (label || "").trim();
  for (const mat of YARN_MATERIALS) {
    const re = new RegExp(`\\b${mat}\\b`, "i");
    const m = trimmed.match(re);
    if (!m || m.index === undefined) continue;
    if (m.index === 0) return trimmed; // already material-first
    const rest = (trimmed.slice(0, m.index) + trimmed.slice(m.index + m[0].length))
      .replace(/\s+/g, " ")
      .trim();
    return rest ? `${mat} ${rest}` : mat;
  }
  return trimmed;
}

/** Normalized key used to combine yarns that share the same (reordered) name. */
export function yarnMergeKey(label: string): string {
  return displayYarnName(label).toLowerCase();
}

/** Case/number-aware comparison of two yarn labels for alphabetical grouping. */
export function compareYarnLabel(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
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
    const pricePerKg = yarnPricePerKgOn(purchases, item.id, date, recipeDefaultPricePerKg(item));
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
  /**
   * Optional per-product overrides for the non-yarn per-dozen costs (Tk).
   * Missing/undefined = use the global defaults, so existing products and
   * saved records keep their current numbers until edited.
   */
  packagingPerDozen?: number;
  ironPerDozen?: number;
  /**
   * Legacy lumped override (rent + flip staff + sewing + electricity +
   * salary). Superseded by the individual fields below; used only when none
   * of them is set.
   */
  overheadPerDozen?: number;
  factoryRentPerDozen?: number;
  flipStaffPerDozen?: number;
  sewingPerDozen?: number;
  electricityPerDozen?: number;
  staffSalaryPerDozen?: number;
  /** Custom user-added per-dozen cost lines for this product. */
  extraCostsPerDozen?: ExtraCostItem[];
};

/** A custom per-dozen cost line the user added for a product. */
export type ExtraCostItem = {
  id: string;
  label: string;
  perDozen: number;
};

/** Effective non-yarn per-dozen rates for a product (falls back to defaults). */
export type PerDozenRates = {
  packaging: number;
  iron: number;
  overhead: number;
  /** packaging + iron + overhead */
  fixedTotal: number;
};

/** True when the product overrides at least one detailed overhead line. */
function hasDetailedOverhead(c: ProductConfig | undefined): boolean {
  return (
    c != null &&
    (c.factoryRentPerDozen != null ||
      c.flipStaffPerDozen != null ||
      c.sewingPerDozen != null ||
      c.electricityPerDozen != null ||
      c.staffSalaryPerDozen != null)
  );
}

/** The five detailed overhead lines at their effective (override or default) rates. */
function detailedOverheadItems(c: ProductConfig | undefined) {
  return [
    { id: "factory-rent", label: "Factory rent", perDozen: c?.factoryRentPerDozen ?? FACTORY_RENT_COST_PER_DOZEN },
    { id: "flip-staff", label: "Flip staff", perDozen: c?.flipStaffPerDozen ?? FLIP_STAFF_COST_PER_DOZEN },
    { id: "sewing", label: "Sewing", perDozen: c?.sewingPerDozen ?? SEWING_COST_PER_DOZEN },
    { id: "electricity", label: "Electricity", perDozen: c?.electricityPerDozen ?? ELECTRICITY_COST_PER_DOZEN },
    { id: "staff-salary", label: "Staff salary", perDozen: c?.staffSalaryPerDozen ?? STAFF_SALARY_COST_PER_DOZEN },
  ];
}

export function perDozenRatesFor(
  configs: ProductConfig[],
  productType: string | undefined,
): PerDozenRates {
  const id = productType || RECIPE_PRODUCT_TYPE_ID;
  const c = configs.find((x) => x.id === id);
  const packaging = c?.packagingPerDozen ?? PACKAGING_COST_PER_DOZEN;
  const iron = c?.ironPerDozen ?? IRON_COST_PER_DOZEN;
  const baseOverhead = hasDetailedOverhead(c)
    ? detailedOverheadItems(c).reduce((s, i) => s + i.perDozen, 0)
    : c?.overheadPerDozen ?? OVERHEAD_COST_PER_DOZEN;
  // Custom user-added cost lines are folded into the overhead rate so every
  // consumer (daily entries, sales COGS, dashboards) picks them up.
  const extras = (c?.extraCostsPerDozen ?? []).reduce((s, e) => s + (e.perDozen || 0), 0);
  const overhead = baseOverhead + extras;
  return { packaging, iron, overhead, fixedTotal: packaging + iron + overhead };
}

/**
 * Per-dozen cost line items for a product's cost breakdown. Uses the detailed
 * default overhead lines when the product has no overhead override, otherwise
 * a single "Staff & overhead" line at the custom rate.
 */
export function perDozenCostItemsFor(
  configs: ProductConfig[],
  productType: string | undefined,
): { id: string; label: string; perDozen: number }[] {
  const id = productType || RECIPE_PRODUCT_TYPE_ID;
  const c = configs.find((x) => x.id === id);
  const rates = perDozenRatesFor(configs, productType);
  const items = [
    { id: "packaging", label: "Packaging", perDozen: rates.packaging },
    { id: "iron", label: "Iron / finishing", perDozen: rates.iron },
  ];
  if (!hasDetailedOverhead(c) && c?.overheadPerDozen != null) {
    // Legacy lumped override — show it as a single line.
    items.push({ id: "overhead", label: "Staff & overhead", perDozen: c.overheadPerDozen });
  } else {
    items.push(...detailedOverheadItems(c));
  }
  for (const e of c?.extraCostsPerDozen ?? []) {
    items.push({ id: `extra-${e.id}`, label: e.label, perDozen: e.perDozen || 0 });
  }
  return items;
}

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
    for (const item of c.yarnRecipe ?? []) {
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
    cost += k * recipeDefaultPricePerKg(i);
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
 * Flat yarn cost (Tk per dozen) charged when a product has no yarn recipe, so
 * its yarn cost would otherwise be "missing". Used instead of the kg×price
 * estimate to give a simple, predictable figure.
 */
export const MISSING_YARN_COST_PER_DOZEN = 90;

/**
 * Yarn usage + cost for a product. Uses the product's recipe when it has one;
 * for recipe-less products (e.g. ankle socks, "others") the yarn cost is
 * "missing", so it charges a flat MISSING_YARN_COST_PER_DOZEN (90 Tk/dozen)
 * instead of zero. Yarn usage (kg) is still estimated from the default kg/dozen.
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
  // No recipe => yarn cost is "missing"; charge a flat rate per dozen instead of
  // a kg×price estimate so the figure is simple and predictable.
  const cost = MISSING_YARN_COST_PER_DOZEN * qtyDozen;
  const pricePerKg = kgPerDz > 0 ? MISSING_YARN_COST_PER_DOZEN / kgPerDz : 0;
  const lines: YarnCostLine[] =
    qtyDozen > 0
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
  const rates = perDozenRatesFor(configs, entry.productType);
  const packagingCost = rates.packaging * q;
  const ironCost = rates.iron * q;
  const laborCost = rates.overhead * q;
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
  return yarn.totalCost + perDozenRatesFor(configs, sale.productType).fixedTotal * q;
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
  // Use the device's LOCAL calendar date, not UTC. `toISOString()` returns the
  // UTC date, which is a day behind for timezones ahead of UTC (e.g. UTC+6) in
  // the early hours — that made `max={getToday()}` reject "today" and the date
  // picker snap back to the current date on some devices.
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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

/**
 * One-time, idempotent migration: make sure the two football part products
 * (top part + bottom part) exist in the stored product-type list and product
 * configs, so they appear in every product dropdown (production entry, sales
 * entry, inventory, reports, product setup) even for admins whose product
 * list was saved to the cloud before the split existed. Runs only after the
 * first authoritative cloud snapshot for both keys, and only once per device
 * (persisted flag), so a deliberate later deletion is never re-added.
 */
const FOOTBALL_PARTS_MIGRATED_FLAG = "wolfion_migrated_football_parts_v1";
const FOOTBALL_RECIPES_MIGRATED_FLAG = "wolfion_migrated_football_recipes_v2";
const FOOTBALL_SPLIT_MIGRATED_FLAG = "wolfion_migrated_football_split_v2";
const FOOTBALL_SPLIT_BACKUP_KEY = "wolfion_football_split_backup_v1";

/**
 * Split a number into two halves whose sum is exactly the original value:
 * the first half is rounded to 2 decimals, the second is the exact remainder
 * (unrounded, so no 0.01 drift on values with more precision).
 */
function splitAmount(n: unknown): [number, number] {
  const v = typeof n === "number" && Number.isFinite(n) ? n : 0;
  const first = Math.round((v / 2) * 100) / 100;
  const second = v - first;
  return [first, second];
}

/**
 * Deterministic ids for the two halves of a split daily production entry.
 * Derived from the original id so a retried migration (after a partial
 * failure) can re-point linked records without the original legacy daily
 * rows still existing.
 */
function splitDailyId(id: string, part: "top" | "bottom"): string {
  return `${id}__${part === "top" ? "ft" : "fb"}`;
}

export function useEnsureFootballParts() {
  const [productTypes, setProductTypes, typesReady] = useCloudStored<ProductTypeOption[]>(
    STORAGE_KEYS.productTypes,
    defaultProductTypes,
  );
  const [productConfigs, setProductConfigs, configsReady] = useCloudStored<ProductConfig[]>(
    STORAGE_KEYS.productConfigs,
    defaultProductConfigs,
  );
  const [productionEntries, setProductionEntries, productionReady] = useCloudStored<ProductionEntry[]>(
    STORAGE_KEYS.production,
    [],
  );
  const [salesEntries, setSalesEntries, salesReady] = useCloudStored<SaleEntry[]>(
    STORAGE_KEYS.sales,
    [],
  );
  const [dailyEntries, setDailyEntries, dailyReady] = useCloudStored<DailyProductionEntry[]>(
    STORAGE_KEYS.daily,
    [],
  );
  const [yarnUsage, setYarnUsage, yarnUsageReady] = useCloudStored<YarnUsageEntry[]>(
    STORAGE_KEYS.yarnUsage,
    [],
  );
  const [workLogs, setWorkLogs, workLogsReady] = useCloudStored<WorkLog[]>(
    STORAGE_KEYS.workLogs,
    [],
  );

  useEffect(() => {
    // Never write before the first authoritative cloud snapshot has arrived
    // for BOTH keys — appending to the pre-auth local mirror could push a
    // stale product list over newer cloud data from another device.
    if (!typesReady || !configsReady) return;
    // One-shot per device: once the parts exist (or were added), never touch
    // the lists again, so an admin who deliberately deletes a part product
    // doesn't have it silently re-added.
    try {
      if (localStorage.getItem(FOOTBALL_PARTS_MIGRATED_FLAG) === "1") return;
    } catch { /* ignore */ }
    if (!Array.isArray(productTypes) || !Array.isArray(productConfigs)) return;
    const typesMissing = FOOTBALL_PART_PRODUCTS.some(
      (f) => !productTypes.some((p) => p && p.id === f.id),
    );
    const configsMissing = FOOTBALL_PART_PRODUCTS.some(
      (f) => !productConfigs.some((c) => c && c.id === f.id),
    );
    // Mark migrated ONLY once both lists are confirmed to contain the parts.
    // The append pass below deliberately leaves the flag unset — the effect
    // re-runs when the updated values come back, verifies presence, and only
    // then records completion. A transient write failure therefore retries
    // instead of being permanently marked done.
    if (!typesMissing && !configsMissing) {
      try {
        localStorage.setItem(FOOTBALL_PARTS_MIGRATED_FLAG, "1");
      } catch { /* ignore */ }
      return;
    }
    if (typesMissing) {
      setProductTypes((prev) => {
        const missing = FOOTBALL_PART_PRODUCTS.filter(
          (f) => !prev.some((p) => p && p.id === f.id),
        );
        return missing.length ? [...prev, ...missing] : prev;
      });
    }
    if (configsMissing) {
      setProductConfigs((prev) => {
        const missing = FOOTBALL_PART_PRODUCTS.filter(
          (f) => !prev.some((c) => c && c.id === f.id),
        );
        // Each part gets its own dedicated yarn recipe; selling price and
        // stock value are inherited from the legacy "Sports (Football)"
        // config the admin had already set for football socks.
        const legacy = prev.find((c) => c && c.id === LEGACY_FOOTBALL_ID);
        return missing.length
          ? [
              ...prev,
              ...missing.map((f) => ({
                id: f.id,
                label: f.label,
                yarnRecipe: (FOOTBALL_PART_RECIPES[f.id] ?? []).map((r) => ({ ...r })),
                sellingPricePerDozen:
                  typeof legacy?.sellingPricePerDozen === "number"
                    ? legacy.sellingPricePerDozen
                    : 0,
                stockValuePerDozen:
                  typeof legacy?.stockValuePerDozen === "number"
                    ? legacy.stockValuePerDozen
                    : 0,
              })),
            ]
          : prev;
      });
    }
    // The setters from useCloudStored are recreated per render; depending on
    // them would re-run this effect every render. The value deps below are
    // what actually gate the (idempotent) writes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typesReady, configsReady, productTypes, productConfigs]);

  // One-time migration: rename the football part products to their new
  // labels ("Football Top Part" / "Football Bottom Part") and install each
  // part's dedicated yarn recipe, replacing the recipe inherited from the
  // legacy combined football product. Same verify-then-flag pattern as the
  // parts migration: the flag is only recorded once the stored values are
  // confirmed to match, so a transient write failure retries.
  useEffect(() => {
    if (!typesReady || !configsReady) return;
    try {
      if (localStorage.getItem(FOOTBALL_RECIPES_MIGRATED_FLAG) === "1") return;
    } catch { /* ignore */ }
    if (!Array.isArray(productTypes) || !Array.isArray(productConfigs)) return;
    // Wait until the parts exist (the ensure-parts effect adds them first).
    const partsPresent = FOOTBALL_PART_PRODUCTS.every(
      (f) =>
        productTypes.some((p) => p && p.id === f.id) &&
        productConfigs.some((c) => c && c.id === f.id),
    );
    if (!partsPresent) return;
    const typesOk = FOOTBALL_PART_PRODUCTS.every((f) =>
      productTypes.some((p) => p && p.id === f.id && p.label === f.label),
    );
    const configsOk = FOOTBALL_PART_PRODUCTS.every((f) => {
      const c = productConfigs.find((x) => x && x.id === f.id);
      if (!c || c.label !== f.label) return false;
      const target = FOOTBALL_PART_RECIPES[f.id] ?? [];
      const recipe = Array.isArray(c.yarnRecipe) ? c.yarnRecipe : [];
      return (
        recipe.length === target.length &&
        target.every((t, i) => {
          const r = recipe[i];
          return (
            !!r &&
            r.id === t.id &&
            r.label === t.label &&
            r.gramsPerDozen === t.gramsPerDozen &&
            r.defaultPricePerKg === t.defaultPricePerKg &&
            (r.priceUnit ?? "kg") === (t.priceUnit ?? "kg")
          );
        })
      );
    });
    if (typesOk && configsOk) {
      try {
        localStorage.setItem(FOOTBALL_RECIPES_MIGRATED_FLAG, "1");
      } catch { /* ignore */ }
      return;
    }
    if (!typesOk) {
      setProductTypes((prev) =>
        prev.map((p) => {
          const f = p && FOOTBALL_PART_PRODUCTS.find((x) => x.id === p.id);
          return f && p.label !== f.label ? { ...p, label: f.label } : p;
        }),
      );
    }
    if (!configsOk) {
      setProductConfigs((prev) =>
        prev.map((c) => {
          const f = c && FOOTBALL_PART_PRODUCTS.find((x) => x.id === c.id);
          if (!f) return c;
          return {
            ...c,
            label: f.label,
            yarnRecipe: (FOOTBALL_PART_RECIPES[f.id] ?? []).map((r) => ({ ...r })),
          };
        }),
      );
    }
    // Setters are recreated per render; value deps below gate the writes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typesReady, configsReady, productTypes, productConfigs]);

  // One-time migration #2: divide every existing "Sports (Football)" record
  // in two — half becomes Top Part, half becomes Bottom Part — across
  // production entries, sales entries, daily production entries, yarn usage
  // and the auto-generated iron/packaging worker bills. Totals (dozens, costs,
  // sales value) are preserved exactly; only the product they're booked under
  // changes. A JSON backup of the untouched lists is kept in localStorage
  // under FOOTBALL_SPLIT_BACKUP_KEY before anything is rewritten.
  useEffect(() => {
    if (!productionReady || !salesReady || !dailyReady || !yarnUsageReady || !workLogsReady) return;
    try {
      if (localStorage.getItem(FOOTBALL_SPLIT_MIGRATED_FLAG) === "1") return;
    } catch { /* ignore */ }
    if (
      !Array.isArray(productionEntries) ||
      !Array.isArray(salesEntries) ||
      !Array.isArray(dailyEntries) ||
      !Array.isArray(yarnUsage) ||
      !Array.isArray(workLogs)
    ) return;

    const isLegacy = (e: { productType?: ProductType } | null | undefined) =>
      !!e && e.productType === LEGACY_FOOTBALL_ID;
    const dailyHasLegacy = dailyEntries.some(isLegacy);
    const productionHasLegacy = productionEntries.some(isLegacy);
    const salesHasLegacy = salesEntries.some(isLegacy);
    const yarnUsageHasLegacy = yarnUsage.some(isLegacy);

    // Deterministic half ids (derived from the original id) let a retried run
    // after a partial write failure still remap links even when the legacy
    // daily rows are gone. dailyIdMap is populated by the daily split pass
    // below; the deterministic fallback inside linkFor covers retries.
    const dailyIdMap = new Map<string, { top: string; bottom: string }>();
    const dailyIds = new Set<string>();
    for (const d of dailyEntries) if (d && typeof d.id === "string") dailyIds.add(d.id);
    /**
     * Resolve where a sourceDailyId should point after the split. Returns the
     * top/bottom pair when the referenced daily was (or already has been)
     * split, undefined when the link should be left untouched.
     */
    const linkFor = (sourceDailyId: string | undefined) => {
      if (!sourceDailyId) return undefined;
      const mapped = dailyIdMap.get(sourceDailyId);
      if (mapped) return mapped;
      // Retry path: the daily entry was already split in an earlier partial
      // run — its original id is gone but the deterministic halves exist.
      if (!dailyIds.has(sourceDailyId) && dailyIds.has(splitDailyId(sourceDailyId, "top"))) {
        return {
          top: splitDailyId(sourceDailyId, "top"),
          bottom: splitDailyId(sourceDailyId, "bottom"),
        };
      }
      return undefined;
    };
    // Auto-generated iron/packaging bills tied to a split daily entry are
    // split the same way so per-dozen billing still matches the halves.
    const buildSplitWorkLogs = (): WorkLog[] => {
      const out: WorkLog[] = [];
      for (const w of workLogs) {
        const link = w ? linkFor(w.sourceDailyId) : undefined;
        if (!link) {
          out.push(w);
          continue;
        }
        const [aT, aB] = splitAmount(w.amount);
        const [dT, dB] = splitAmount(w.dozens);
        out.push(
          { ...w, id: crypto.randomUUID(), amount: aT, dozens: w.dozens === undefined ? undefined : dT, sourceDailyId: link.top },
          { ...w, id: crypto.randomUUID(), amount: aB, dozens: w.dozens === undefined ? undefined : dB, sourceDailyId: link.bottom },
        );
      }
      return out;
    };

    // Once no legacy football records remain, retire the combined
    // "Sports (Football)" product itself: it must disappear from the product
    // list and configs (only Top Part / Bottom Part remain). The removal only
    // happens after BOTH part products exist, so the config inheritance in
    // migration #1 can still copy the legacy recipe/prices first. The flag is
    // recorded ONLY when entries and lists are fully clean — the rewrite
    // passes leave it unset, the effect re-runs with the updated values,
    // verifies, and then records completion, so a transient write failure
    // retries instead of being permanently marked done.
    if (!dailyHasLegacy && !productionHasLegacy && !salesHasLegacy && !yarnUsageHasLegacy) {
      // Finish an interrupted run first: worker bills whose sourceDailyId
      // still points at an already-split (removed) daily must be remapped
      // before the migration may be considered complete.
      if (workLogs.some((w) => !!w && !!linkFor(w.sourceDailyId))) {
        setWorkLogs(buildSplitWorkLogs());
        return;
      }
      if (!typesReady || !configsReady || !Array.isArray(productTypes) || !Array.isArray(productConfigs)) return;
      const typesHaveLegacy = productTypes.some((t) => t && t.id === LEGACY_FOOTBALL_ID);
      const configsHaveLegacy = productConfigs.some((c) => c && c.id === LEGACY_FOOTBALL_ID);
      if (!typesHaveLegacy && !configsHaveLegacy) {
        try {
          localStorage.setItem(FOOTBALL_SPLIT_MIGRATED_FLAG, "1");
        } catch { /* ignore */ }
        return;
      }
      const partsInTypes = FOOTBALL_PART_PRODUCTS.every((f) =>
        productTypes.some((t) => t && t.id === f.id),
      );
      const partsInConfigs = FOOTBALL_PART_PRODUCTS.every((f) =>
        productConfigs.some((c) => c && c.id === f.id),
      );
      // Wait for migration #1 to append the parts (and inherit the legacy
      // config) before deleting the legacy product they inherit from.
      if (!partsInTypes || !partsInConfigs) return;
      if (typesHaveLegacy) {
        setProductTypes((prev) => prev.filter((t) => !(t && t.id === LEGACY_FOOTBALL_ID)));
      }
      if (configsHaveLegacy) {
        setProductConfigs((prev) => prev.filter((c) => !(c && c.id === LEGACY_FOOTBALL_ID)));
      }
      return;
    }

    // Safety net: keep a pre-split snapshot on this device (only once).
    try {
      if (!localStorage.getItem(FOOTBALL_SPLIT_BACKUP_KEY)) {
        localStorage.setItem(
          FOOTBALL_SPLIT_BACKUP_KEY,
          JSON.stringify({
            savedAt: new Date().toISOString(),
            production: productionEntries,
            sales: salesEntries,
            daily: dailyEntries,
            yarnUsage,
            workLogs,
          }),
        );
      }
    } catch { /* ignore — backup is best-effort */ }

    // Daily production entries split first: linked records (production rows,
    // yarn usage, worker bills) reference them via sourceDailyId and are
    // re-pointed at the new half entries via linkFor (defined above).
    const newDaily: DailyProductionEntry[] = [];
    for (const e of dailyEntries) {
      if (!isLegacy(e)) {
        newDaily.push(e);
        continue;
      }
      const topId = splitDailyId(e.id, "top");
      const bottomId = splitDailyId(e.id, "bottom");
      dailyIdMap.set(e.id, { top: topId, bottom: bottomId });
      const [qT, qB] = splitAmount(e.totalProductionDozen);
      const [yT, yB] = splitAmount(e.yarnUsedKg);
      const [mT, mB] = splitAmount(e.machineHours);
      const [lT, lB] = splitAmount(e.laborCost);
      const [pT, pB] = splitAmount(e.packagingCost);
      const [iT, iB] = splitAmount(e.ironCost);
      const [sT, sB] = splitAmount(e.staffBill);
      const [tT, tB] = splitAmount(e.totalCost);
      newDaily.push(
        {
          ...e,
          id: topId,
          productType: FOOTBALL_TOP_ID,
          totalProductionDozen: qT,
          yarnUsedKg: yT,
          machineHours: mT,
          laborCost: lT,
          packagingCost: pT,
          ironCost: iT,
          staffBill: e.staffBill === undefined ? undefined : sT,
          totalCost: tT,
        },
        {
          ...e,
          id: bottomId,
          productType: FOOTBALL_BOTTOM_ID,
          totalProductionDozen: qB,
          yarnUsedKg: yB,
          machineHours: mB,
          laborCost: lB,
          packagingCost: pB,
          ironCost: iB,
          staffBill: e.staffBill === undefined ? undefined : sB,
          totalCost: tB,
          // Keep the receipt on the top-part half only, so the (possibly
          // large) image isn't duplicated in storage.
          receiptImage: undefined,
        },
      );
    }

    const newProduction: ProductionEntry[] = [];
    for (const p of productionEntries) {
      if (!isLegacy(p)) {
        newProduction.push(p);
        continue;
      }
      const link = linkFor(p.sourceDailyId);
      const [qT, qB] = splitAmount(p.quantityDozen);
      newProduction.push(
        { ...p, id: crypto.randomUUID(), productType: FOOTBALL_TOP_ID, quantityDozen: qT, sourceDailyId: link ? link.top : p.sourceDailyId },
        { ...p, id: crypto.randomUUID(), productType: FOOTBALL_BOTTOM_ID, quantityDozen: qB, sourceDailyId: link ? link.bottom : p.sourceDailyId },
      );
    }

    const newSales: SaleEntry[] = [];
    for (const s of salesEntries) {
      if (!isLegacy(s)) {
        newSales.push(s);
        continue;
      }
      const [qT, qB] = splitAmount(s.quantityDozen);
      const [vT, vB] = splitAmount(s.totalValue);
      newSales.push(
        { ...s, id: crypto.randomUUID(), productType: FOOTBALL_TOP_ID, quantityDozen: qT, totalValue: vT },
        { ...s, id: crypto.randomUUID(), productType: FOOTBALL_BOTTOM_ID, quantityDozen: qB, totalValue: vB, receiptImage: undefined },
      );
    }

    const newYarnUsage: YarnUsageEntry[] = [];
    for (const u of yarnUsage) {
      if (!isLegacy(u)) {
        newYarnUsage.push(u);
        continue;
      }
      const link = linkFor(u.sourceDailyId);
      const [kT, kB] = splitAmount(u.kgUsed);
      newYarnUsage.push(
        { ...u, id: crypto.randomUUID(), productType: FOOTBALL_TOP_ID, kgUsed: kT, sourceDailyId: link ? link.top : u.sourceDailyId },
        { ...u, id: crypto.randomUUID(), productType: FOOTBALL_BOTTOM_ID, kgUsed: kB, sourceDailyId: link ? link.bottom : u.sourceDailyId },
      );
    }

    // Worker-bill split/remap goes last so dailyIdMap is fully populated.
    const workLogsNeedSplit = workLogs.some((w) => !!w && !!linkFor(w.sourceDailyId));

    if (dailyHasLegacy) setDailyEntries(newDaily);
    if (productionHasLegacy) setProductionEntries(newProduction);
    if (salesHasLegacy) setSalesEntries(newSales);
    if (yarnUsageHasLegacy) setYarnUsage(newYarnUsage);
    if (workLogsNeedSplit) setWorkLogs(buildSplitWorkLogs());
    // Setters are recreated per render; the value deps below gate the
    // (idempotent) rewrite.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    productionReady,
    salesReady,
    dailyReady,
    yarnUsageReady,
    workLogsReady,
    typesReady,
    configsReady,
    productionEntries,
    salesEntries,
    dailyEntries,
    yarnUsage,
    workLogs,
    productTypes,
    productConfigs,
  ]);
}
