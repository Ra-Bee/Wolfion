import { AdminLayout } from "@/components/admin-layout";
import { adminMetrics } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, DollarSign, Package, Factory, TrendingUp, Plus, Minus, Zap, Users, Wrench, LogOut as LogOutIcon, ChevronRight, Sparkles } from "lucide-react";
import { ManageEntriesDialog } from "@/components/admin/manage-entries-dialog";
import { CompactList } from "@/components/admin/compact-list";
import { ReceiptCapture, ReceiptThumb } from "@/components/admin/receipt-capture";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { useClerk } from "@clerk/react";
import { useLocation } from "wouter";
import { downloadReport, type WolfionReportData, type ReportRange } from "@/lib/reports";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Fragment, useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  STORAGE_KEYS,
  initialInventory,
  defaultYarnTypes,
  defaultStockValuePerDozen,
  defaultProductConfigs,
  type ProductConfig,
  computeProductYarn,
  recipeForProduct,
  productYarnCost,
  saleCostOfGoods,
  canonicalDailyCost,
  allRecipeYarns,
  yarnPricePerKgOn,
  RECIPE_PRODUCT_TYPE_ID,
  PACKAGING_COST_PER_DOZEN,
  IRON_COST_PER_DOZEN,
  OVERHEAD_COST_PER_DOZEN,
  PER_DOZEN_COST_ITEMS,
  TOTAL_PER_DOZEN_FIXED_COST,
  type RentEntry,
} from "@/lib/wolfion-store";
import { useCloudStored } from "@/lib/cloud-store";

type ProductType = string;

type ProductTypeOption = {
  id: string;
  label: string;
};

type ProductionEntry = {
  id: string;
  date: string;
  productType: ProductType;
  quantityDozen: number;
  sourceDailyId?: string;
};

type SaleEntry = {
  id: string;
  customerName: string;
  productType: ProductType;
  quantityDozen: number;
  pricePerDozen: number;
  totalValue: number;
  createdAt: string;
  date?: string;
};

type YarnUsageEntry = {
  id: string;
  productType: ProductType;
  kgUsed: number;
  createdAt: string;
  sourceDailyId?: string;
};

const defaultProductTypes: ProductTypeOption[] = [
  { id: "short-socks", label: "Short socks" },
  { id: "ankle-socks", label: "Ankle socks" },
  { id: "kids-socks", label: "Kids socks" },
  { id: "mixed", label: "Mixed" },
  { id: "sports-football", label: "Sports (Football)" },
  { id: "others", label: "Others" },
];

const productionStorageKey = "wolfion_production_entries";
const salesStorageKey = "wolfion_sales_entries";
const yarnStockStorageKey = "wolfion_yarn_stock_kg";
const yarnUsageStorageKey = "wolfion_yarn_usage_entries";
const costStorageKey = "wolfion_cost_inputs";
const dailyEntriesStorageKey = "wolfion_daily_production_entries";
const costEntriesStorageKey = "wolfion_cost_management_entries";
const electricityStorageKey = "wolfion_monthly_electricity";
const workersStorageKey = "wolfion_workers";
const workLogsStorageKey = "wolfion_worker_logs";
const workerPaymentsStorageKey = "wolfion_worker_payments";
const investmentsStorageKey = "wolfion_investments";
const investorsStorageKey = "wolfion_investors";
const productTypesStorageKey = "wolfion_product_types";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || `type-${Date.now()}`;
}

type Investment = {
  id: string;
  date: string;
  type: string;
  description: string;
  amount: number;
  source: string;
  createdAt: string;
};

type InvestorEntry = {
  id: string;
  name: string;
  date: string;
  amount: number;
  createdAt: string;
  receiptImage?: string;
};

type ElectricityRecharge = {
  id: string;
  date: string;
  amount: number;
  note?: string;
  createdAt: string;
  receiptImage?: string;
};

type WorkArea = "machine_run" | "iron" | "packaging" | "add_ons";
const workAreaLabels: Record<WorkArea, string> = {
  machine_run: "Machine run",
  iron: "Ironing",
  packaging: "Packaging",
  add_ons: "Other",
};
const workAreaOrder: WorkArea[] = ["machine_run", "iron", "packaging", "add_ons"];

type Worker = {
  id: string;
  name: string;
  payType: "daily" | "per_unit";
  rate: number;
  workAt?: WorkArea;
  nextPaymentDate?: string;
  createdAt: string;
};

type WorkLog = {
  id: string;
  workerId: string;
  date: string;
  amount: number;
  note?: string;
  dozens?: number;
  role?: "iron" | "packaging";
  sourceDailyId?: string;
  createdAt: string;
};

type WorkerPayment = {
  id: string;
  workerId: string;
  date: string;
  amount: number;
  createdAt: string;
  receiptImage?: string;
};

type DailyProductionEntry = {
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
  ironManId?: string;
  packagingManId?: string;
  totalCost: number;
  costPerDozen: number;
  productType?: ProductType;
  yarnType?: string;
  createdAt: string;
  receiptImage?: string;
};

type CostCategory = "yarn" | "labour" | "packaging" | "electricity" | "other";
const costCategoryLabels: Record<CostCategory, string> = {
  yarn: "Yarn",
  labour: "Labour",
  packaging: "Packaging",
  electricity: "Electricity",
  other: "Other",
};
const costCategoryOrder: CostCategory[] = ["yarn", "labour", "packaging", "electricity", "other"];

type CostEntry = {
  id: string;
  date: string;
  item: string;
  amount: number;
  category?: CostCategory;
  /** Custom label used when category === "other" so admin can name it. */
  customCategory?: string;
  createdAt: string;
  receiptImage?: string;
};

function costCategoryDisplay(entry: { category?: CostCategory; customCategory?: string }): string {
  const cat = entry.category ?? "other";
  if (cat === "other" && entry.customCategory && entry.customCategory.trim()) {
    return entry.customCategory.trim();
  }
  return costCategoryLabels[cat];
}

type YarnPerDozen = Record<string, number>;
const yarnPerDozenStorageKey = "wolfion_yarn_per_dozen";
const defaultYarnPerDozen: YarnPerDozen = {
  "short-socks": 0.5,
  "ankle-socks": 0.6,
  "kids-socks": 0.4,
  "others": 0.55,
};
const yarnPurchasesStorageKey = "wolfion_yarn_purchases";
type YarnPurchase = { id: string; date: string; kg: number; yarnTypeId?: string; amount?: number; unit?: "kg" | "lb"; totalPrice?: number; yarnType?: string; createdAt: string; receiptImage?: string };

type CostInputs = {
  yarnCostPerDozen: number;
  laborCostPerDozen: number;
  packagingCostPerDozen: number;
};

const defaultCosts: CostInputs = {
  yarnCostPerDozen: 0,
  laborCostPerDozen: 0,
  packagingCostPerDozen: 0,
};

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

// Colored fill for the "yarn needs vs stock" bars: green = covered,
// amber/orange = running low, red = out of stock.
function yarnBarColor(coverage: number): string {
  if (coverage >= 1) return "bg-emerald-500";
  if (coverage >= 0.5) return "bg-amber-500";
  if (coverage > 0) return "bg-orange-500";
  return "bg-rose-500";
}
function num1(n: number): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
}
function kgFmt(n: number): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function Dashboard() {
  // Cloud-synced via STORAGE_KEYS.productTypes (Phase 1 cloud sync).
  // The cloud allow-list in wolfion-store.ts routes this key through
  // Firebase Realtime Database, so admin product categories are shared
  // across every signed-in admin device in real time.
  const [productTypes, setProductTypes] = useCloudStored<ProductTypeOption[]>(
    STORAGE_KEYS.productTypes,
    defaultProductTypes,
  );
  const [productConfigs] = useCloudStored<ProductConfig[]>(STORAGE_KEYS.productConfigs, defaultProductConfigs);
  // Every recipe yarn used by any configured product (deduped across products).
  const allYarns = useMemo(() => allRecipeYarns(productConfigs), [productConfigs]);
  // Map a purchase's id/custom/legacy name back to a recipe yarn id when it
  // matches (by id or label, case-insensitive), so dashboard purchases attribute
  // to recipe yarns and the "needs vs stock" chart shows real stock.
  const recipeIdByKey = useMemo(() => {
    const m: Record<string, string> = {};
    for (const r of allYarns) {
      m[r.id.toLowerCase()] = r.id;
      m[r.label.toLowerCase()] = r.id;
    }
    return m;
  }, [allYarns]);
  const resolveYarnKey = useCallback(
    (p: { yarnTypeId?: string; yarnType?: string }) => {
      const raw = (p.yarnTypeId || p.yarnType || "other").trim();
      return recipeIdByKey[raw.toLowerCase()] || raw;
    },
    [recipeIdByKey],
  );
  const [newProductTypeName, setNewProductTypeName] = useState("");
  const [productTypeError, setProductTypeError] = useState("");
  const [productionEntries, setProductionEntries] = useCloudStored<ProductionEntry[]>(STORAGE_KEYS.production, []);
  const [date, setDate] = useState(getToday());
  const [productType, setProductType] = useState<ProductType>("short-socks");
  const [quantity, setQuantity] = useState("");
  const [salesEntries, setSalesEntries] = useCloudStored<SaleEntry[]>(STORAGE_KEYS.sales, []);
  const [customerName, setCustomerName] = useState("");
  const [saleProductType, setSaleProductType] = useState<ProductType>("short-socks");
  const [saleQuantity, setSaleQuantity] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [saleTotalAmount, setSaleTotalAmount] = useState("");
  // Multi-product daily sales. Each row = one product sold to one customer.
  // saleSimpleMode = true means "I don't have details, just total amount".
  const [saleRows, setSaleRows] = useState<Array<{ id: string; productType: ProductType; qty: string; total: string }>>(
    () => [{ id: crypto.randomUUID(), productType: "short-socks", qty: "", total: "" }],
  );
  const [saleSimpleMode, setSaleSimpleMode] = useState(false);
  const [saleSimpleTotal, setSaleSimpleTotal] = useState("");
  const [saleDate, setSaleDate] = useState(getToday());
  const [saleError, setSaleError] = useState("");
  const [saleConfirm, setSaleConfirm] = useState("");
  const [yarnStockKg, setYarnStockKg] = useCloudStored<number>(STORAGE_KEYS.yarnStock, 0);
  const [yarnUsageEntries, setYarnUsageEntries] = useCloudStored<YarnUsageEntry[]>(STORAGE_KEYS.yarnUsage, []);
  const [currentYarnStock, setCurrentYarnStock] = useState("");
  const [yarnUsageProductType, setYarnUsageProductType] = useState<ProductType>("short-socks");
  const [yarnUsageKg, setYarnUsageKg] = useState("");
  const [yarnError, setYarnError] = useState("");
  const [costs, setCosts] = useCloudStored<CostInputs>(STORAGE_KEYS.costInputs, defaultCosts);
  const [dailyEntries, setDailyEntries] = useCloudStored<DailyProductionEntry[]>(STORAGE_KEYS.daily, []);
  const [dailyDate, setDailyDate] = useState(getToday());
  // Daily production is fully auto-calculated: pick product + dozens; yarn (from
  // the short-socks recipe + date-effective purchase price), packaging, iron and
  // all flat running costs are derived.
  const [dailyProductType, setDailyProductType] = useState<ProductType>(RECIPE_PRODUCT_TYPE_ID);
  const [dailyQty, setDailyQty] = useState("");
  const [dailyError, setDailyError] = useState("");
  const [dailyConfirm, setDailyConfirm] = useState("");
  const [costEntries, setCostEntries] = useCloudStored<CostEntry[]>(STORAGE_KEYS.costHistory, []);
  const [costEntryDate, setCostEntryDate] = useState(getToday());
  const [costEntryItem, setCostEntryItem] = useState("");
  const [costEntryAmount, setCostEntryAmount] = useState("");
  const [costEntryCategory, setCostEntryCategory] = useState<CostCategory>("yarn");
  const [costEntryCustomCategory, setCostEntryCustomCategory] = useState("");
  const [costEntryError, setCostEntryError] = useState("");
  const [quickSaleOpen, setQuickSaleOpen] = useState(false);
  const [yarnPurchases, setYarnPurchases] = useCloudStored<YarnPurchase[]>(STORAGE_KEYS.yarnPurchases, []);
  const [yarnPurchaseDate, setYarnPurchaseDate] = useState(getToday());
  const [yarnPurchaseKg, setYarnPurchaseKg] = useState("");
  const [yarnTypes, setYarnTypes] = useCloudStored<string[]>(STORAGE_KEYS.yarnTypes, defaultYarnTypes);
  // Yarn-type picker options: always surface the Yarn Calculation recipe yarn
  // names first, then any extra custom names, deduped (case-insensitive). This
  // keeps the picker in sync with the yarns shown in Yarn Calculation.
  const yarnTypeOptions = useMemo(() => {
    // Hide the old generic default names (Spandex, Cotton, Rubber, etc.) so the
    // picker only shows the Yarn Calculation recipe yarns plus any custom names
    // the user explicitly added via "+ Add other…".
    const legacy = new Set(defaultYarnTypes.map((t) => t.toLowerCase()));
    const seen = new Set<string>();
    const out: string[] = [];
    for (const r of allYarns) {
      const key = r.label.toLowerCase();
      if (!seen.has(key)) { seen.add(key); out.push(r.label); }
    }
    for (const t of yarnTypes) {
      const key = t.toLowerCase();
      if (seen.has(key) || legacy.has(key)) continue;
      seen.add(key); out.push(t);
    }
    return out;
  }, [yarnTypes, allYarns]);
  const [yarnPurchaseType, setYarnPurchaseType] = useState<string>("");
  const [yarnPurchaseTypeOther, setYarnPurchaseTypeOther] = useState("");
  const [yarnPerDozen] = useCloudStored<YarnPerDozen>(STORAGE_KEYS.yarnPerDozen, defaultYarnPerDozen);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportRangeMode, setReportRangeMode] = useState<"daily" | "monthly" | "yearly" | "custom">("monthly");
  const [reportCustomStart, setReportCustomStart] = useState(getToday());
  const [reportCustomEnd, setReportCustomEnd] = useState(getToday());
  const [reportSingleDate, setReportSingleDate] = useState(getToday());
  const [reportMonth, setReportMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [reportYear, setReportYear] = useState(() => String(new Date().getFullYear()));
  const [yarnCostInput, setYarnCostInput] = useState(() => (costs.yarnCostPerDozen ? String(costs.yarnCostPerDozen) : ""));
  const [laborCostInput, setLaborCostInput] = useState(() => (costs.laborCostPerDozen ? String(costs.laborCostPerDozen) : ""));
  const [packagingCostInput, setPackagingCostInput] = useState(() => (costs.packagingCostPerDozen ? String(costs.packagingCostPerDozen) : ""));

  const [electricityRecharges, setElectricityRecharges] = useCloudStored<ElectricityRecharge[]>(STORAGE_KEYS.electricityRecharges, []);
  const [rentEntries] = useCloudStored<RentEntry[]>(STORAGE_KEYS.rents, []);
  const [rechargeDate, setRechargeDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [rechargeNote, setRechargeNote] = useState("");
  const [rechargeReceipt, setRechargeReceipt] = useState<string | undefined>(undefined);
  const [rechargeError, setRechargeError] = useState("");
  const [rechargeConfirm, setRechargeConfirm] = useState("");

  const [workers, setWorkers] = useCloudStored<Worker[]>(STORAGE_KEYS.workers, []);
  const [workLogs, setWorkLogs] = useCloudStored<WorkLog[]>(STORAGE_KEYS.workLogs, []);
  const [workerPayments, setWorkerPayments] = useCloudStored<WorkerPayment[]>(STORAGE_KEYS.workerPayments, []);
  const [newWorkerName, setNewWorkerName] = useState("");
  const [newWorkerWorkAt, setNewWorkerWorkAt] = useState<WorkArea>("machine_run");
  const [uniDate, setUniDate] = useState(getToday());
  const [uniDailyBill, setUniDailyBill] = useState("");
  const [uniNote, setUniNote] = useState("");
  const [uniNextPaymentDate, setUniNextPaymentDate] = useState("");
  const [uniPayingNow, setUniPayingNow] = useState("");
  const [uniConfirm, setUniConfirm] = useState("");
  const [workerError, setWorkerError] = useState("");
  const [logWorkerId, setLogWorkerId] = useState("");
  const [logDate, setLogDate] = useState(getToday());
  const [logAmount, setLogAmount] = useState("");
  const [paymentWorkerId, setPaymentWorkerId] = useState("");
  const [paymentDate, setPaymentDate] = useState(getToday());
  const [paymentAmount, setPaymentAmount] = useState("");

  const [investments, setInvestments] = useState<Investment[]>(() => {
    try {
      const stored = localStorage.getItem(investmentsStorageKey);
      return stored ? JSON.parse(stored) as Investment[] : [];
    } catch {
      return [];
    }
  });
  const [invDate, setInvDate] = useState(getToday());
  const [invType, setInvType] = useState("yarn");
  const [invDescription, setInvDescription] = useState("");
  const [invAmount, setInvAmount] = useState("");
  const [invSource, setInvSource] = useState("personal");
  const [invError, setInvError] = useState("");

  const [investors, setInvestors] = useState<InvestorEntry[]>(() => {
    try {
      const stored = localStorage.getItem(investorsStorageKey);
      return stored ? JSON.parse(stored) as InvestorEntry[] : [];
    } catch {
      return [];
    }
  });
  const [investorName, setInvestorName] = useState("");
  const [investorDate, setInvestorDate] = useState(getToday());
  const [investorAmount, setInvestorAmount] = useState("");
  const [investorError, setInvestorError] = useState("");

  // Receipt/bill scans for dashboard forms
  const [saleReceipt, setSaleReceipt] = useState<string | undefined>(undefined);
  const [dailyReceipt, setDailyReceipt] = useState<string | undefined>(undefined);
  const [yarnPurchaseReceipt, setYarnPurchaseReceipt] = useState<string | undefined>(undefined);
  const [workerReceipt, setWorkerReceipt] = useState<string | undefined>(undefined);
  const [costEntryReceipt, setCostEntryReceipt] = useState<string | undefined>(undefined);
  const [investorReceipt, setInvestorReceipt] = useState<string | undefined>(undefined);

  // Persistence (local + cloud) handled by useCloudStored hooks above.

  function handleAddCostEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const item = costEntryItem.trim();
    const amount = Number(costEntryAmount);
    if (!costEntryDate || !item || !Number.isFinite(amount) || amount <= 0) {
      setCostEntryError("Enter date, item name, and amount.");
      return;
    }
    const customCat = costEntryCustomCategory.trim();
    const entry: CostEntry = {
      id: crypto.randomUUID(),
      date: costEntryDate,
      item,
      amount,
      category: costEntryCategory,
      createdAt: new Date().toISOString(),
      ...(costEntryCategory === "other" && customCat ? { customCategory: customCat } : {}),
      ...(costEntryReceipt ? { receiptImage: costEntryReceipt } : {}),
    };
    setCostEntries((current) => [entry, ...current]);
    setCostEntryDate(getToday());
    setCostEntryItem("");
    setCostEntryAmount("");
    setCostEntryCustomCategory("");
    setCostEntryReceipt(undefined);
    setCostEntryError("");
  }

  function handleRemoveCostEntry(id: string) {
    setCostEntries((current) => current.filter((e) => e.id !== id));
  }

  // Investments / investors persistence still local; everything else cloud-synced above.
  useEffect(() => {
    localStorage.setItem(investmentsStorageKey, JSON.stringify(investments));
  }, [investments]);

  useEffect(() => {
    localStorage.setItem(investorsStorageKey, JSON.stringify(investors));
  }, [investors]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const scrollToHash = () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (!hash) return;
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const t = window.setTimeout(scrollToHash, 100);
    window.addEventListener("hashchange", scrollToHash);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("hashchange", scrollToHash);
    };
  }, []);

  const productTypeLabels = useMemo<Record<string, string>>(() => {
    const labels: Record<string, string> = {};
    for (const t of productTypes) labels[t.id] = t.label;
    for (const entry of productionEntries) if (!labels[entry.productType]) labels[entry.productType] = entry.productType;
    for (const entry of salesEntries) if (!labels[entry.productType]) labels[entry.productType] = entry.productType;
    return labels;
  }, [productTypes, productionEntries, salesEntries]);

  const allProductTypeIds = useMemo<string[]>(() => {
    const set = new Set<string>(productTypes.map((t) => t.id));
    for (const entry of productionEntries) set.add(entry.productType);
    for (const entry of salesEntries) set.add(entry.productType);
    return Array.from(set);
  }, [productTypes, productionEntries, salesEntries]);

  const inventory = useMemo(() => {
    const stock: Record<string, number> = {};
    for (const id of allProductTypeIds) stock[id] = initialInventory[id] || 0;
    for (const entry of productionEntries) {
      stock[entry.productType] = (stock[entry.productType] || 0) + entry.quantityDozen;
    }
    for (const entry of salesEntries) {
      stock[entry.productType] = Math.max(0, (stock[entry.productType] || 0) - entry.quantityDozen);
    }
    return stock;
  }, [productionEntries, salesEntries, allProductTypeIds]);

  // Value of finished-goods stock on hand = sum of (dozens in stock × Tk/dozen).
  // Short socks is valued at Tk 150/dozen; types without a rate count as 0.
  const stockValueById = useMemo(() => {
    const m: Record<string, number> = {};
    for (const c of productConfigs) m[c.id] = c.stockValuePerDozen ?? defaultStockValuePerDozen[c.id] ?? 0;
    return m;
  }, [productConfigs]);
  const stockValue = useMemo(() => {
    return allProductTypeIds.reduce(
      (total, id) => total + (inventory[id] || 0) * (stockValueById[id] ?? defaultStockValuePerDozen[id] ?? 0),
      0,
    );
  }, [inventory, allProductTypeIds, stockValueById]);

  function handleAddProductType(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProductTypeError("");
    const label = newProductTypeName.trim();
    if (!label) {
      setProductTypeError("Enter a product type name.");
      return;
    }
    let id = slugify(label);
    if (productTypes.some((t) => t.id === id || t.label.toLowerCase() === label.toLowerCase())) {
      setProductTypeError("That product type already exists.");
      return;
    }
    setProductTypes((prev) => [...prev, { id, label }]);
    setNewProductTypeName("");
  }

  function handleRemoveProductType(id: string) {
    if (productionEntries.some((e) => e.productType === id) || salesEntries.some((e) => e.productType === id)) {
      setProductTypeError("Cannot remove: this type has production or sales entries.");
      return;
    }
    setProductTypes((prev) => prev.filter((t) => t.id !== id));
    setProductTypeError("");
  }

  const totalInventoryDozen = Object.values(inventory).reduce((total, value) => total + value, 0);
  const totalProducedDozen = productionEntries.reduce((total, entry) => total + entry.quantityDozen, 0);
  const totalSoldDozen = salesEntries.reduce((total, entry) => total + entry.quantityDozen, 0);
  const totalSalesValue = salesEntries.reduce((total, entry) => total + entry.totalValue, 0);
  const productionByType = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const id of allProductTypeIds) totals[id] = 0;
    for (const entry of productionEntries) {
      totals[entry.productType] = (totals[entry.productType] || 0) + entry.quantityDozen;
    }
    return totals;
  }, [productionEntries, allProductTypeIds]);
  const salesByType = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const id of allProductTypeIds) totals[id] = 0;
    for (const entry of salesEntries) {
      totals[entry.productType] = (totals[entry.productType] || 0) + entry.quantityDozen;
    }
    return totals;
  }, [salesEntries, allProductTypeIds]);
  const recentProductionEntries = productionEntries.slice(0, 4);
  const recentSalesEntries = salesEntries.slice(0, 4);
  const totalYarnUsedKg = yarnUsageEntries.reduce((total, entry) => total + entry.kgUsed, 0);
  const remainingYarnKg = Math.max(0, yarnStockKg - totalYarnUsedKg);
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const yarnUsedLast7Days = yarnUsageEntries
    .filter((entry) => new Date(entry.createdAt).getTime() >= sevenDaysAgo)
    .reduce((total, entry) => total + entry.kgUsed, 0);
  const averageDailyYarnUseKg = yarnUsedLast7Days / 7;
  const estimatedSevenDayNeedKg = averageDailyYarnUseKg * 7;
  const estimatedYarnShortageKg = Math.max(0, estimatedSevenDayNeedKg - remainingYarnKg);
  const recentYarnUsageEntries = yarnUsageEntries.slice(0, 4);
  const sortedDailyEntries = useMemo(() => {
    return [...dailyEntries].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : (a.createdAt < b.createdAt ? 1 : -1)));
  }, [dailyEntries]);
  const today = getToday();
  const todayEntries = dailyEntries.filter((entry) => entry.date === today);
  const todayProductionDozen = todayEntries.reduce((total, entry) => total + entry.totalProductionDozen, 0);
  const todayTotalCost = todayEntries.reduce((total, entry) => total + entry.totalCost, 0);
  const todayLaborCost = todayEntries.reduce(
    (total, entry) => total + (entry.laborCost || 0) + (entry.packagingCost || 0) + (entry.ironCost || 0) + (entry.staffBill || 0),
    0,
  );

  // Retroactively bring every saved daily entry onto the current cost model
  // (yarn by date-effective price + packaging/iron + flat overhead). Runs
  // whenever entries or yarn purchases change; it only writes when a value
  // actually differs, so it converges in one pass and never loops.
  useEffect(() => {
    if (dailyEntries.length === 0) return;
    const round2 = (n: number) => Math.round(n * 100) / 100;
    const close = (a: number, b: number) => Math.abs((a || 0) - (b || 0)) < 0.01;
    let changed = false;
    const next = dailyEntries.map((entry) => {
      const q = entry.totalProductionDozen || 0;
      const c = canonicalDailyCost(entry, productConfigs, yarnPurchases);
      const packagingCost = round2(c.packagingCost);
      const ironCost = round2(c.ironCost);
      const laborCost = round2(c.laborCost);
      const totalCost = round2(c.totalCost);
      const costPerDozen = q > 0 ? round2(c.costPerDozen) : 0;
      const yarnUsedKg = round2(c.yarnKg);
      const yarnCostPerKg = c.yarnKg > 0 ? round2(c.yarnCost / c.yarnKg) : 0;
      if (
        close(entry.laborCost, laborCost) &&
        close(entry.packagingCost, packagingCost) &&
        close(entry.ironCost, ironCost) &&
        close(entry.totalCost, totalCost) &&
        close(entry.costPerDozen, costPerDozen) &&
        close(entry.yarnUsedKg, yarnUsedKg) &&
        close(entry.yarnCostPerKg, yarnCostPerKg) &&
        close(entry.staffBill || 0, 0)
      ) {
        return entry;
      }
      changed = true;
      return { ...entry, yarnUsedKg, yarnCostPerKg, laborCost, packagingCost, ironCost, staffBill: 0, totalCost, costPerDozen };
    });
    if (changed) setDailyEntries(next);
    // setDailyEntries omitted: useCloudStored setter identity is not stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dailyEntries, yarnPurchases, productConfigs]);

  // Total card recharge by month (auto), most recent first.
  const rechargeByMonth = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const r of electricityRecharges) {
      const month = (r.date || "").slice(0, 7);
      if (!month) continue;
      totals[month] = (totals[month] || 0) + (Number(r.amount) || 0);
    }
    return Object.entries(totals)
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => (a.month < b.month ? 1 : -1));
  }, [electricityRecharges]);
  const liveSaleTotal = Number(saleTotalAmount) || 0;
  const liveSalePricePerDozen = Number(saleQuantity) > 0 && Number(saleTotalAmount) > 0 ? Number(saleTotalAmount) / Number(saleQuantity) : 0;
  const sortedSalesEntries = useMemo(() => {
    const withDate = salesEntries.map((sale) => ({
      ...sale,
      date: sale.date ?? sale.createdAt.slice(0, 10),
    }));
    return withDate.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : (a.createdAt < b.createdAt ? 1 : -1)));
  }, [salesEntries]);
  const todaySales = sortedSalesEntries.filter((sale) => sale.date === getToday());
  const todaySalesValue = todaySales.reduce((total, sale) => total + sale.totalValue, 0);
  const todaySalesDozen = todaySales.reduce((total, sale) => total + sale.quantityDozen, 0);
  function formatDateLabel(isoDate: string) {
    const today = getToday();
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (isoDate === today) return "Today";
    if (isoDate === yesterday) return "Yesterday";
    return new Date(`${isoDate}T00:00:00`).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  }
  // Sales-based profit: total sales value − the production cost of only the
  // dozens actually sold (yarn priced at the sale date + packaging + iron +
  // overhead). Unsold socks are NOT counted as a loss — they stay in inventory
  // until sold. This matches the Inventory Report and the PDF report.
  const totalCostOfGoodsSold = salesEntries.reduce(
    (total, sale) => total + saleCostOfGoods(productConfigs, yarnPurchases, sale),
    0,
  );
  const totalProfit = totalSalesValue - totalCostOfGoodsSold;
  const averageProfitPerSale = salesEntries.length > 0 ? totalProfit / salesEntries.length : 0;

  const monthlyProductionByMonth = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const entry of dailyEntries) {
      const month = entry.date.slice(0, 7);
      totals[month] = (totals[month] || 0) + entry.totalProductionDozen;
    }
    return totals;
  }, [dailyEntries]);
  function rentForMonth(month: string): number {
    return rentEntries.filter((r) => r.month === month).reduce((s, r) => s + (Number(r.amount) || 0), 0);
  }
  function rentPerDozenForDate(isoDate: string): number {
    const month = isoDate.slice(0, 7);
    const production = monthlyProductionByMonth[month] || 0;
    if (production <= 0) return 0;
    return rentForMonth(month) / production;
  }
  const workerStats = useMemo(() => {
    return workers.map((worker) => {
      const logs = workLogs.filter((l) => l.workerId === worker.id);
      const totalUnits = logs.reduce((sum, l) => sum + l.amount, 0);
      const totalEarned = totalUnits * worker.rate;
      const totalPaid = workerPayments
        .filter((p) => p.workerId === worker.id)
        .reduce((sum, p) => sum + p.amount, 0);
      return {
        worker,
        totalUnits,
        totalEarned,
        totalPaid,
        remaining: totalEarned - totalPaid,
      };
    });
  }, [workers, workLogs, workerPayments]);
  const totalPayable = workerStats.reduce((sum, s) => sum + s.totalEarned, 0);
  const totalPaidAll = workerStats.reduce((sum, s) => sum + s.totalPaid, 0);
  const totalRemainingAll = workerStats.reduce((sum, s) => sum + s.remaining, 0);

  function formatMonthLabel(month: string) {
    return new Date(`${month}-01T00:00:00`).toLocaleDateString(undefined, { month: "long", year: "numeric" });
  }

  function handleAddProduction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const quantityDozen = Number(quantity);

    if (!date || !productType || !Number.isFinite(quantityDozen) || quantityDozen <= 0) {
      return;
    }

    const entry: ProductionEntry = {
      id: crypto.randomUUID(),
      date,
      productType,
      quantityDozen,
    };

    setProductionEntries((current) => [entry, ...current]);
    setDate(getToday());
    setProductType("short-socks");
    setQuantity("");
  }

  function handleAddSale(event: FormEvent<HTMLFormElement>, onSuccess?: () => void) {
    event.preventDefault();
    if (!customerName.trim()) {
      setSaleError("Enter customer name.");
      return;
    }
    const nowIso = new Date().toISOString();
    const saleDateStr = saleDate || getToday();
    const newEntries: SaleEntry[] = [];

    if (saleSimpleMode) {
      // No per-product breakdown — record one entry under "mixed" with just the total.
      const total = Number(saleSimpleTotal);
      if (!Number.isFinite(total) || total <= 0) {
        setSaleError("Enter the total sale amount.");
        return;
      }
      newEntries.push({
        id: crypto.randomUUID(),
        customerName: customerName.trim(),
        productType: "mixed",
        quantityDozen: 0,
        pricePerDozen: 0,
        totalValue: total,
        createdAt: nowIso,
        date: saleDateStr,
        ...(saleReceipt ? { receiptImage: saleReceipt } : {}),
      });
    } else {
      const parsed = saleRows.map((r) => ({ ...r, qtyNum: Number(r.qty), totalNum: Number(r.total) }));
      if (parsed.length === 0) {
        setSaleError("Add at least one product.");
        return;
      }
      for (const r of parsed) {
        if (!r.productType || !Number.isFinite(r.qtyNum) || r.qtyNum <= 0 || !Number.isFinite(r.totalNum) || r.totalNum <= 0) {
          setSaleError("Every product row needs product, quantity (dz) and total.");
          return;
        }
      }
      // Aggregate qty per product type and validate against inventory.
      const totalByType = new Map<ProductType, number>();
      for (const r of parsed) totalByType.set(r.productType, (totalByType.get(r.productType) ?? 0) + r.qtyNum);
      for (const [pt, qty] of totalByType.entries()) {
        if (qty > (inventory[pt] ?? 0)) {
          setSaleError(`Only ${(inventory[pt] ?? 0).toLocaleString()} dz ${(productTypeLabels[pt] || pt).toLowerCase()} available.`);
          return;
        }
      }
      for (const r of parsed) {
        newEntries.push({
          id: crypto.randomUUID(),
          customerName: customerName.trim(),
          productType: r.productType,
          quantityDozen: r.qtyNum,
          pricePerDozen: r.totalNum / r.qtyNum,
          totalValue: r.totalNum,
          createdAt: nowIso,
          date: saleDateStr,
          ...(saleReceipt ? { receiptImage: saleReceipt } : {}),
        });
      }
    }

    setSalesEntries((current) => [...newEntries, ...current]);
    setCustomerName("");
    setSaleProductType("short-socks");
    setSaleQuantity("");
    setSalePrice("");
    setSaleTotalAmount("");
    setSaleRows([{ id: crypto.randomUUID(), productType: "short-socks", qty: "", total: "" }]);
    setSaleSimpleMode(false);
    setSaleSimpleTotal("");
    setSaleDate(getToday());
    setSaleReceipt(undefined);
    setSaleError("");
    setSaleConfirm(newEntries.length > 1 ? `Saved ${newEntries.length} sale lines.` : "Sale saved.");
    setTimeout(() => setSaleConfirm(""), 1500);
    onSuccess?.();
  }

  function handleSetYarnStock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const stockKg = Number(currentYarnStock);

    if (!Number.isFinite(stockKg) || stockKg < 0) {
      setYarnError("Enter a valid current yarn stock in kg.");
      return;
    }

    setYarnStockKg(stockKg);
    setCurrentYarnStock("");
    setYarnError("");
  }

  function handleAddYarnUsage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const kgUsed = Number(yarnUsageKg);

    if (!Number.isFinite(kgUsed) || kgUsed <= 0) {
      setYarnError("Enter yarn usage in kg.");
      return;
    }

    if (kgUsed > remainingYarnKg) {
      setYarnError(`Only ${remainingYarnKg.toLocaleString()} kg yarn remaining.`);
      return;
    }

    const entry: YarnUsageEntry = {
      id: crypto.randomUUID(),
      productType: yarnUsageProductType,
      kgUsed,
      createdAt: new Date().toISOString(),
    };

    setYarnUsageEntries((current) => [entry, ...current]);
    setYarnUsageProductType("short-socks");
    setYarnUsageKg("");
    setYarnError("");
  }

  // Live auto-calculated cost breakdown from the current daily form inputs.
  const dailyCalc = useMemo(() => {
    const q = Number(dailyQty) || 0;
    const recipe = recipeForProduct(productConfigs, dailyProductType);
    const isRecipe = recipe.length > 0;
    const yarn = productYarnCost(productConfigs, dailyProductType, q, yarnPurchases, dailyDate);
    const items = PER_DOZEN_COST_ITEMS.map((it) => ({ ...it, cost: it.perDozen * q }));
    const fixedTotal = TOTAL_PER_DOZEN_FIXED_COST * q;
    const totalCost = yarn.totalCost + fixedTotal;
    return { q, isRecipe, yarn, items, fixedTotal, totalCost, costPerDozen: q > 0 ? totalCost / q : 0 };
  }, [dailyQty, dailyProductType, yarnPurchases, dailyDate, productConfigs]);

  function handleAddDailyEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDailyError("");
    const q = Number(dailyQty);
    if (!dailyDate) {
      setDailyError("Enter date.");
      return;
    }
    if (!dailyProductType) {
      setDailyError("Choose a product type.");
      return;
    }
    if (!Number.isFinite(q) || q <= 0) {
      setDailyError("Quantity must be greater than 0.");
      return;
    }

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const yarn = productYarnCost(productConfigs, dailyProductType, q, yarnPurchases, dailyDate);
    const packagingCost = PACKAGING_COST_PER_DOZEN * q;
    const ironCost = IRON_COST_PER_DOZEN * q;
    const laborCost = OVERHEAD_COST_PER_DOZEN * q; // rent + flip staff + sewing + electricity + salary
    const totalCost = yarn.totalCost + packagingCost + ironCost + laborCost;

    const dailyEntry: DailyProductionEntry = {
      id,
      date: dailyDate,
      totalProductionDozen: q,
      yarnUsedKg: yarn.totalKg,
      machineHours: 0,
      yarnCostPerKg: yarn.totalKg > 0 ? yarn.totalCost / yarn.totalKg : 0,
      laborCost,
      packagingCost,
      ironCost,
      staffBill: 0,
      totalCost,
      costPerDozen: q > 0 ? totalCost / q : 0,
      productType: dailyProductType,
      createdAt,
      ...(dailyReceipt ? { receiptImage: dailyReceipt } : {}),
    };
    setDailyEntries((current) => [dailyEntry, ...current]);

    setProductionEntries((current) => [
      { id: crypto.randomUUID(), date: dailyDate, productType: dailyProductType, quantityDozen: q, sourceDailyId: id },
      ...current,
    ]);

    if (yarn.totalKg > 0) {
      setYarnUsageEntries((current) => [
        { id: crypto.randomUUID(), productType: dailyProductType, kgUsed: yarn.totalKg, createdAt, sourceDailyId: id },
        ...current,
      ]);
    }

    setDailyQty("");
    setDailyDate(getToday());
    setDailyReceipt(undefined);
    setDailyError("");
    setDailyConfirm("Saved.");
    setTimeout(() => setDailyConfirm(""), 1500);
  }


  function handleSaveCosts(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const yarnCost = Number(yarnCostInput);
    const laborCost = Number(laborCostInput);
    const packagingCost = Number(packagingCostInput);

    setCosts({
      yarnCostPerDozen: Number.isFinite(yarnCost) && yarnCost >= 0 ? yarnCost : 0,
      laborCostPerDozen: Number.isFinite(laborCost) && laborCost >= 0 ? laborCost : 0,
      packagingCostPerDozen: Number.isFinite(packagingCost) && packagingCost >= 0 ? packagingCost : 0,
    });
  }

  function handleAddRecharge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRechargeError("");
    setRechargeConfirm("");
    const amt = Number(rechargeAmount);
    if (!rechargeDate || !Number.isFinite(amt) || amt <= 0) {
      setRechargeError("Enter a date and a valid recharge amount.");
      return;
    }
    setElectricityRecharges((current) => [
      {
        id: crypto.randomUUID(),
        date: rechargeDate,
        amount: amt,
        ...(rechargeNote.trim() ? { note: rechargeNote.trim() } : {}),
        createdAt: new Date().toISOString(),
        ...(rechargeReceipt ? { receiptImage: rechargeReceipt } : {}),
      },
      ...current,
    ]);
    setRechargeAmount("");
    setRechargeNote("");
    setRechargeReceipt(undefined);
    setRechargeConfirm(`Recharge of Tk ${amt.toLocaleString()} saved.`);
  }

  function handleAddWorker(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWorkerError("");
    setUniConfirm("");
    const name = newWorkerName.trim();
    const dailyBill = Number(uniDailyBill);
    const payingNow = Number(uniPayingNow);
    if (!uniDate || !name) {
      setWorkerError("Enter date and worker name.");
      return;
    }
    if (uniDailyBill !== "" && (!Number.isFinite(dailyBill) || dailyBill < 0)) {
      setWorkerError("Daily bill must be 0 or more.");
      return;
    }
    if (uniPayingNow !== "" && (!Number.isFinite(payingNow) || payingNow < 0)) {
      setWorkerError("Payment must be 0 or more.");
      return;
    }

    const existing = workers.find((w) => w.name.trim().toLowerCase() === name.toLowerCase());
    let workerId: string;
    if (existing) {
      workerId = existing.id;
      setWorkers((current) => current.map((w) => w.id === existing.id ? { ...w, workAt: newWorkerWorkAt, nextPaymentDate: uniNextPaymentDate || w.nextPaymentDate } : w));
    } else {
      workerId = crypto.randomUUID();
      const worker: Worker = {
        id: workerId,
        name,
        // Daily-bill workers: rate is 1 so totalEarned = sum of WorkLog
        // amounts (which are stored as Tk amounts, not unit counts).
        payType: "daily",
        rate: 1,
        workAt: newWorkerWorkAt,
        nextPaymentDate: uniNextPaymentDate || undefined,
        createdAt: new Date().toISOString(),
      };
      setWorkers((current) => [worker, ...current]);
    }

    const noteTrim = uniNote.trim();
    if (Number.isFinite(dailyBill) && dailyBill > 0) {
      const log: WorkLog = {
        id: crypto.randomUUID(),
        workerId,
        date: uniDate,
        amount: dailyBill,
        note: noteTrim || undefined,
        createdAt: new Date().toISOString(),
      };
      setWorkLogs((current) => [log, ...current]);
    }

    if (Number.isFinite(payingNow) && payingNow > 0) {
      const payment: WorkerPayment = {
        id: crypto.randomUUID(),
        workerId,
        date: uniDate,
        amount: payingNow,
        createdAt: new Date().toISOString(),
        ...(workerReceipt ? { receiptImage: workerReceipt } : {}),
      };
      setWorkerPayments((current) => [payment, ...current]);
    }

    setUniConfirm(`Saved entry for ${name}.`);
    setNewWorkerName("");
    setUniDailyBill("");
    setUniNote("");
    setUniPayingNow("");
    setUniNextPaymentDate("");
    setWorkerReceipt(undefined);
  }

  function handleAddWorkLog(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(logAmount);
    if (!logWorkerId || !logDate || !Number.isFinite(amount) || amount <= 0) {
      return;
    }
    const log: WorkLog = {
      id: crypto.randomUUID(),
      workerId: logWorkerId,
      date: logDate,
      amount,
      createdAt: new Date().toISOString(),
    };
    setWorkLogs((current) => [log, ...current]);
    setLogAmount("");
  }

  function handleAddPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(paymentAmount);
    if (!paymentWorkerId || !paymentDate || !Number.isFinite(amount) || amount <= 0) {
      return;
    }
    const payment: WorkerPayment = {
      id: crypto.randomUUID(),
      workerId: paymentWorkerId,
      date: paymentDate,
      amount,
      createdAt: new Date().toISOString(),
      ...(workerReceipt ? { receiptImage: workerReceipt } : {}),
    };
    setWorkerPayments((current) => [payment, ...current]);
    setPaymentAmount("");
    setWorkerReceipt(undefined);
  }

  function handleRemoveWorker(id: string) {
    setWorkers((current) => current.filter((w) => w.id !== id));
    setWorkLogs((current) => current.filter((l) => l.workerId !== id));
    setWorkerPayments((current) => current.filter((p) => p.workerId !== id));
  }

  function handleAddInvestor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInvestorError("");
    const amount = Number(investorAmount);
    if (!investorName.trim() || !investorDate || !Number.isFinite(amount) || amount <= 0) {
      setInvestorError("Enter investor name, date, and amount.");
      return;
    }
    const entry: InvestorEntry = {
      id: crypto.randomUUID(),
      name: investorName.trim(),
      date: investorDate,
      amount,
      createdAt: new Date().toISOString(),
      ...(investorReceipt ? { receiptImage: investorReceipt } : {}),
    };
    setInvestors((current) => [entry, ...current]);
    setInvestorAmount("");
    setInvestorReceipt(undefined);
  }

  function handleRemoveInvestor(id: string) {
    setInvestors((current) => current.filter((i) => i.id !== id));
  }

  const investorTotals = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of investors) {
      map.set(e.name, (map.get(e.name) || 0) + e.amount);
    }
    return Array.from(map.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }, [investors]);
  const sortedInvestorEntries = useMemo(
    () => [...investors].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [investors],
  );
  const totalInvestorFunds = investors.reduce((sum, i) => sum + i.amount, 0);

  // Per-yarn-name breakdown: how much of each yarn was purchased, how much was
  // used by production (short-socks recipe × dozens), and how much is left.
  const OTHER_YARN_ID = "other";
  const yarnByTypeRows = useMemo(() => {
    const used: Record<string, number> = {};
    for (const e of dailyEntries) {
      const recipe = recipeForProduct(productConfigs, e.productType);
      if (recipe.length === 0) continue;
      const q = e.totalProductionDozen || 0;
      for (const item of recipe) {
        used[item.id] = (used[item.id] || 0) + (item.gramsPerDozen * q) / 1000;
      }
    }
    const ids = new Set<string>(allYarns.map((r) => r.id));
    for (const p of yarnPurchases) ids.add(resolveYarnKey(p));
    const today = getToday();
    return Array.from(ids).map((id) => {
      const recipe = allYarns.find((r) => r.id === id);
      const purchased = yarnPurchases.filter((p) => resolveYarnKey(p) === id);
      const purchasedKg = purchased.reduce((a, b) => a + (b.kg || 0), 0);
      const spent = purchased.reduce((a, b) => a + (b.totalPrice || 0), 0);
      const usedKg = used[id] || 0;
      const pricePerKg = yarnPricePerKgOn(yarnPurchases, id, today, recipe?.defaultPricePerKg ?? (purchasedKg > 0 ? spent / purchasedKg : 0));
      return {
        id,
        label: recipe?.label || (id === OTHER_YARN_ID ? "Other yarn" : id),
        purchasedKg,
        usedKg,
        remainingKg: purchasedKg - usedKg,
        pricePerKg,
      };
    }).sort((a, b) => b.remainingKg - a.remainingKg);
  }, [dailyEntries, yarnPurchases, productConfigs, allYarns, resolveYarnKey]);

  // "Yarn needs vs stock" chart: average production per active day per product
  // drives the auto weekly/monthly need; stock comes from yarnByTypeRows.
  const [yarnNeedPeriod, setYarnNeedPeriod] = useState<"weekly" | "monthly">("weekly");
  const avgDozenByProduct = useMemo(() => {
    const days: Record<string, Set<string>> = {};
    const totals: Record<string, number> = {};
    for (const e of dailyEntries) {
      // Legacy entries without a productType are short socks (see recipeForProduct).
      const pid = e.productType || RECIPE_PRODUCT_TYPE_ID;
      (days[pid] ??= new Set<string>()).add(e.date || "");
      totals[pid] = (totals[pid] || 0) + (e.totalProductionDozen || 0);
    }
    const out: Record<string, number> = {};
    for (const pid of Object.keys(totals)) {
      const n = days[pid]?.size || 0;
      out[pid] = n > 0 ? totals[pid] / n : 0;
    }
    return out;
  }, [dailyEntries]);
  const yarnAvgDozenPerDay = useMemo(
    () => Object.values(avgDozenByProduct).reduce((a, b) => a + b, 0),
    [avgDozenByProduct],
  );
  // Per-yarn weekly/monthly need, summed across every product that uses the yarn.
  const needByYarn = useMemo(() => {
    const weekly: Record<string, number> = {};
    const monthly: Record<string, number> = {};
    for (const c of productConfigs) {
      const avg = avgDozenByProduct[c.id] || 0;
      if (avg <= 0) continue;
      for (const item of c.yarnRecipe) {
        weekly[item.id] = (weekly[item.id] || 0) + (item.gramsPerDozen * avg * 7) / 1000;
        monthly[item.id] = (monthly[item.id] || 0) + (item.gramsPerDozen * avg * 30) / 1000;
      }
    }
    return { weekly, monthly };
  }, [productConfigs, avgDozenByProduct]);
  const { signOut } = useClerk();
  const [, setLocation] = useLocation();

  function getReportRange(): ReportRange {
    if (reportRangeMode === "daily") {
      return { label: `Daily Report — ${reportSingleDate}`, startDate: reportSingleDate, endDate: reportSingleDate };
    }
    if (reportRangeMode === "monthly") {
      const start = `${reportMonth}-01`;
      const [y, m] = reportMonth.split("-").map(Number);
      const last = new Date(y, m, 0).getDate();
      const end = `${reportMonth}-${String(last).padStart(2, "0")}`;
      return { label: `Monthly Report — ${formatMonthLabel(reportMonth)}`, startDate: start, endDate: end };
    }
    if (reportRangeMode === "yearly") {
      return { label: `Yearly Report — ${reportYear}`, startDate: `${reportYear}-01-01`, endDate: `${reportYear}-12-31` };
    }
    return { label: `Custom Report`, startDate: reportCustomStart, endDate: reportCustomEnd };
  }

  const [reportError, setReportError] = useState("");

  function validateReportRange(): string {
    if (reportRangeMode === "daily") {
      if (!reportSingleDate) return "Please choose a date.";
    } else if (reportRangeMode === "monthly") {
      if (!/^\d{4}-\d{2}$/.test(reportMonth)) return "Please choose a valid month.";
    } else if (reportRangeMode === "yearly") {
      const y = Number(reportYear);
      if (!Number.isFinite(y) || y < 2000 || y > 2100) return "Please enter a valid year (2000–2100).";
    } else if (reportRangeMode === "custom") {
      if (!reportCustomStart || !reportCustomEnd) return "Please choose both start and end dates.";
      if (reportCustomStart > reportCustomEnd) return "Start date must be before end date.";
    }
    return "";
  }

  function downloadInventorySnapshot() {
    const today = getToday();
    const range: ReportRange = { label: `Inventory Report — ${today}`, startDate: today, endDate: today };
    const data: WolfionReportData = {
      range,
      productTypeLabels,
      production: [],
      sales: [],
      daily: [],
      electricity: [],
      inventory: allProductTypeIds.map((id) => ({ productType: id, stockDozen: inventory[id] || 0 })),
      labor: [],
      payments: [],
    };
    downloadReport(data, `Wolfion_Inventory_${today}.pdf`);
  }

  function handleDownloadReport() {
    const err = validateReportRange();
    if (err) { setReportError(err); return; }
    setReportError("");
    const range = getReportRange();
    const data: WolfionReportData = {
      range,
      productTypeLabels,
      production: productionEntries.map((e) => ({
        date: e.date, productType: e.productType, quantityDozen: e.quantityDozen,
      })),
      sales: sortedSalesEntries.map((s) => ({
        date: s.date || s.createdAt.slice(0, 10), customerName: s.customerName, productType: s.productType,
        quantityDozen: s.quantityDozen, totalValue: s.totalValue,
        costOfGoods: saleCostOfGoods(productConfigs, yarnPurchases, s),
      })),
      daily: dailyEntries.map((e) => ({
        date: e.date,
        totalProductionDozen: e.totalProductionDozen,
        yarnUsedKg: e.yarnUsedKg,
        yarnCostPerKg: e.yarnCostPerKg,
        laborCost: e.laborCost,
        packagingCost: e.packagingCost,
        ironCost: e.ironCost,
        totalCost: e.totalCost,
      })),
      electricity: [], // electricity is now a flat per-dozen overhead folded into each daily entry's laborCost; counting bills here would double-count

      inventory: allProductTypeIds.map((id) => ({ productType: id, stockDozen: inventory[id] || 0 })),
      labor: workerStats.map((w) => ({
        name: w.worker.name,
        totalEarned: w.totalEarned,
        totalPaid: w.totalPaid,
        remaining: w.remaining,
      })),
      payments: workerPayments.map((p) => ({
        workerName: workers.find((w) => w.id === p.workerId)?.name || "Unknown",
        date: p.date,
        amount: p.amount,
      })),
    };
    const stamp = range.startDate === range.endDate
      ? range.startDate
      : `${range.startDate}_to_${range.endDate}`;
    downloadReport(data, `Wolfion_Report_${stamp}.pdf`);
    setReportDialogOpen(false);
  }

  function handleAddYarnPurchase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const kg = Number(yarnPurchaseKg);
    if (!Number.isFinite(kg) || kg <= 0) return;
    // Yarn type: support inline "Add other" by saving custom names into yarnTypes.
    let resolvedType = yarnPurchaseType;
    if (resolvedType === "__other__") {
      const name = yarnPurchaseTypeOther.trim();
      if (!name) {
        return;
      }
      if (!yarnTypes.some((y) => y.toLowerCase() === name.toLowerCase())) {
        setYarnTypes((cur) => [...cur, name]);
      }
      resolvedType = name;
    }
    const entry: YarnPurchase = {
      id: crypto.randomUUID(),
      date: yarnPurchaseDate,
      kg,
      createdAt: new Date().toISOString(),
      ...(resolvedType ? { yarnType: resolvedType } : {}),
      ...(yarnPurchaseReceipt ? { receiptImage: yarnPurchaseReceipt } : {}),
    };
    setYarnPurchases((prev) => [entry, ...prev]);
    setYarnPurchaseKg("");
    setYarnPurchaseType("");
    setYarnPurchaseTypeOther("");
    setYarnPurchaseReceipt(undefined);
  }

  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleSignOutFromMenu() {
    signOut(() => setLocation('/'));
  }

  const investmentTypeOptions = ["yarn", "machine", "packaging", "rent", "other"];
  const investmentSourceOptions = ["personal", "friend", "loan", "investor", "other"];
  const investmentTypeLabels: Record<string, string> = {
    yarn: "Yarn",
    machine: "Machine",
    packaging: "Packaging",
    rent: "Rent",
    other: "Other",
  };
  const investmentSourceLabels: Record<string, string> = {
    personal: "Personal",
    friend: "Friend",
    loan: "Loan",
    investor: "Investor",
    other: "Other",
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-2 sm:px-4 py-8 max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Overview of operations, sales, and inventory.</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
          <Dialog open={quickSaleOpen} onOpenChange={(open) => { setQuickSaleOpen(open); if (!open) { setSaleError(""); setSaleConfirm(""); } }}>
            <DialogTrigger asChild>
              <Button size="lg" className="h-14 px-6 text-base font-semibold w-full sm:w-auto">
                <Zap className="h-5 w-5" />
                Quick Add Sale
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Quick Add Sale</DialogTitle>
                <DialogDescription>Fast entry. Stock and revenue update automatically.</DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(event) => handleAddSale(event, () => setTimeout(() => setQuickSaleOpen(false), 800))}
                className="space-y-5"
              >
                {/* Line 1: customer, date, and the simple-mode toggle — three across, compact */}
                <div className="grid grid-cols-3 gap-2 items-end">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="quick-sale-customer">Customer</label>
                    <Input
                      id="quick-sale-customer"
                      className="h-11 text-sm"
                      placeholder="e.g. Karim"
                      value={customerName}
                      onChange={(event) => setCustomerName(event.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="quick-sale-date">Date</label>
                    <Input
                      id="quick-sale-date"
                      type="date"
                      className="h-11 text-sm px-2"
                      value={saleDate}
                      onChange={(event) => setSaleDate(event.target.value)}
                      max={getToday()}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Total only</label>
                    <Button type="button" variant={saleSimpleMode ? "default" : "outline"} className="h-11 w-full text-sm" onClick={() => setSaleSimpleMode((v) => !v)}>
                      {saleSimpleMode ? "On" : "Off"}
                    </Button>
                  </div>
                </div>

                {saleSimpleMode ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="quick-sale-simple-total">Total sale (Tk)</label>
                    <Input
                      id="quick-sale-simple-total"
                      type="number"
                      min="1"
                      step="0.01"
                      inputMode="decimal"
                      className="h-12 text-base"
                      placeholder="0"
                      value={saleSimpleTotal}
                      onChange={(e) => setSaleSimpleTotal(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">No product breakdown — recorded as "Mixed".</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Products sold</label>
                      <span className="text-xs text-muted-foreground">{saleRows.length} {saleRows.length === 1 ? "item" : "items"}</span>
                    </div>
                    <div className="space-y-2">
                      {saleRows.map((row, idx) => (
                        <div key={row.id} className="rounded-xl border p-2 space-y-1.5">
                          {/* Line 2: product type, qty (dz), total bill — three across */}
                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1">
                              <label className="text-xs text-muted-foreground">Product</label>
                              <Select
                                value={row.productType}
                                onValueChange={(value) =>
                                  setSaleRows((rows) => rows.map((r, i) => i === idx ? { ...r, productType: value as ProductType } : r))
                                }
                              >
                                <SelectTrigger className="h-11 text-sm">
                                  <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(productTypeLabels).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs text-muted-foreground">Qty (dz)</label>
                              <Input
                                type="number"
                                min="1"
                                step="1"
                                inputMode="numeric"
                                className="h-11 text-sm"
                                placeholder="0"
                                value={row.qty}
                                onChange={(e) =>
                                  setSaleRows((rows) => rows.map((r, i) => i === idx ? { ...r, qty: e.target.value } : r))
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs text-muted-foreground">Total bill</label>
                              <Input
                                type="number"
                                min="1"
                                step="0.01"
                                inputMode="decimal"
                                className="h-11 text-sm"
                                placeholder="0"
                                value={row.total}
                                onChange={(e) =>
                                  setSaleRows((rows) => rows.map((r, i) => i === idx ? { ...r, total: e.target.value } : r))
                                }
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              Tk {(Number(row.qty) > 0 && Number(row.total) > 0 ? Number(row.total) / Number(row.qty) : 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} / dz
                            </span>
                            {saleRows.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-muted-foreground"
                                aria-label="Remove item"
                                onClick={() => setSaleRows((rows) => rows.filter((_, i) => i !== idx))}
                              >
                                <Minus className="h-3.5 w-3.5 mr-1" /> Remove
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setSaleRows((rows) => [...rows, { id: crypto.randomUUID(), productType: "short-socks", qty: "", total: "" }])}
                    >
                      <Plus className="h-4 w-4" /> Add another product
                    </Button>
                  </div>
                )}

                {saleError && (
                  <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{saleError}</p>
                )}
                {saleConfirm && (
                  <p className="rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-800">{saleConfirm}</p>
                )}

                <ReceiptCapture value={saleReceipt} onChange={setSaleReceipt} />

                <Button type="submit" size="lg" className="h-14 w-full text-base font-semibold">
                  <Plus className="h-5 w-5" />
                  Save sale
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        <Card className="border-2 border-primary/30 shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2"><Package className="h-6 w-6 text-primary" /> Summary</CardTitle>
            <CardDescription>Live stock, sales, and profit across the business.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Total stock available</h3>
              <div className="mt-3 grid grid-cols-4 gap-1.5 sm:gap-2.5 lg:gap-3">
                {allProductTypeIds.filter((id) => id !== "mixed").map((id) => (
                  <div key={`stock-${id}`} className="rounded-xl border bg-white dark:bg-card/80 p-2 sm:p-3 lg:p-4 shadow-sm backdrop-blur transition hover:shadow-lg hover:-translate-y-0.5 text-center min-h-[70px] flex flex-col items-center justify-center box-border">
                    <p className="w-full text-[9px] sm:text-xs font-medium uppercase tracking-wide text-muted-foreground leading-tight truncate">{productTypeLabels[id] || id}</p>
                    <p className="mt-1 sm:mt-1.5 w-full text-base sm:text-xl lg:text-2xl font-bold leading-none break-words tabular-nums">{(inventory[id] || 0).toLocaleString()}<span className="ml-0.5 text-[9px] sm:text-xs lg:text-sm font-medium text-muted-foreground"> dz</span></p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Total sold</h3>
              <div className="mt-3 grid grid-cols-4 gap-1.5 sm:gap-2.5 lg:gap-3">
                {allProductTypeIds.filter((id) => id !== "mixed").map((id) => (
                  <div key={`sold-${id}`} className="rounded-xl border bg-white dark:bg-card/80 p-2 sm:p-3 lg:p-4 shadow-sm backdrop-blur transition hover:shadow-lg hover:-translate-y-0.5 text-center min-h-[70px] flex flex-col items-center justify-center box-border">
                    <p className="w-full text-[9px] sm:text-xs font-medium uppercase tracking-wide text-muted-foreground leading-tight truncate">{productTypeLabels[id] || id}</p>
                    <p className="mt-1 sm:mt-1.5 w-full text-base sm:text-xl lg:text-2xl font-bold leading-none break-words tabular-nums">{(salesByType[id] || 0).toLocaleString()}<span className="ml-0.5 text-[9px] sm:text-xs lg:text-sm font-medium text-muted-foreground"> dz</span></p>
                  </div>
                ))}
              </div>
            </div>

            {(() => {
              return (
                <div
                  className="stat-glass relative rounded-3xl p-[1px] shadow-[0_14px_40px_-22px_rgba(0,0,0,0.35)]"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(74,222,128,0.12) 0%, rgba(255,255,255,0.08) 50%, rgba(74,222,128,0.1) 100%)",
                  }}
                >
                  <div
                    className="relative rounded-[22px] overflow-hidden p-4 sm:p-5 bg-emerald-50/8 dark:bg-emerald-950/8"
                    style={{
                      backdropFilter: "blur(28px) saturate(120%)",
                      WebkitBackdropFilter: "blur(28px) saturate(120%)",
                    }}
                  >
                    {/* Top glass sheen — subtle */}
                    <div
                      aria-hidden
                      className="absolute inset-x-0 top-0 h-1/3 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 100%)",
                      }}
                    />
                    {/* Whisper of green so the glass tints when light hits it */}
                    <div
                      aria-hidden
                      className="absolute -top-12 -right-12 h-40 w-40 rounded-full opacity-40 pointer-events-none blur-3xl"
                      style={{
                        background:
                          "radial-gradient(circle, rgba(34,197,94,0.04) 0%, transparent 70%)",
                      }}
                    />
                    <div className="relative grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="relative pr-2">
                        <p className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Stock value</p>
                        <p
                          className="mt-1 sm:mt-2 text-xl sm:text-3xl font-bold leading-tight break-words tabular-nums text-foreground"
                          style={{ textShadow: "0 1px 0 rgba(255,255,255,0.6)" }}
                        >
                          Tk {stockValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </p>
                        <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">Finished stock on hand (per Product Setup values)</p>
                      </div>
                      {/* Vertical hairline divider with gradient fade */}
                      <div
                        aria-hidden
                        className="absolute left-1/2 top-2 bottom-2 w-px pointer-events-none"
                        style={{
                          background:
                            "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.12) 30%, rgba(0,0,0,0.12) 70%, transparent 100%)",
                        }}
                      />
                      <div className="relative pl-3 sm:pl-4">
                        <p className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{totalProfit >= 0 ? "Total profit" : "Total loss"}</p>
                        <p
                          className={`mt-1 sm:mt-2 text-xl sm:text-3xl font-bold leading-tight break-words tabular-nums ${totalProfit >= 0 ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}
                          style={{ textShadow: "0 1px 0 rgba(255,255,255,0.6)" }}
                        >
                          {totalProfit < 0 ? "−" : ""}Tk {Math.abs(totalProfit).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </p>
                        <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">{totalProfit >= 0 ? "Sales − cost of sold socks" : "Cost of sold socks exceeds sales"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/30 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Daily Production Entry</CardTitle>
                <CardDescription>Enter today's production and costs. Totals calculate automatically.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleAddDailyEntry} className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <label className="text-sm font-medium" htmlFor="daily-date">Date</label>
                <Input id="daily-date" type="date" className="h-12 text-base" max={getToday()} value={dailyDate} onChange={(e) => setDailyDate(e.target.value)} required />
              </div>
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-sm font-medium">Product type</label>
                <Select value={dailyProductType} onValueChange={(v) => setDailyProductType(v as ProductType)}>
                  <SelectTrigger className="h-12 text-base"><SelectValue placeholder="Choose product" /></SelectTrigger>
                  <SelectContent>
                    {productTypes.map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-sm font-medium" htmlFor="daily-qty">Production (dozen)</label>
                <Input id="daily-qty" type="number" step="0.01" min="0" inputMode="decimal" className="h-12 text-base" placeholder="0" value={dailyQty} onChange={(e) => setDailyQty(e.target.value)} required />
              </div>
              <div className="col-span-2">
                <ReceiptCapture value={dailyReceipt} onChange={setDailyReceipt} label="Bill / photo (optional)" />
              </div>

              {/* Live auto-calculated breakdown — updates the moment you change
                  product or quantity. */}
              <div className="col-span-2 rounded-xl border bg-muted/30 p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> Auto-calculated cost
                </div>
                {dailyCalc.isRecipe ? (
                  <>
                    {/* Phone: one compact yarn line. Larger screens: full table. */}
                    <div className="flex items-center justify-between text-xs sm:hidden">
                      <span className="text-muted-foreground">Yarn ({dailyCalc.yarn.totalKg.toLocaleString(undefined, { maximumFractionDigits: 2 })} kg)</span>
                      <span className="font-medium tabular-nums">Tk {dailyCalc.yarn.totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full text-[11px]">
                        <thead className="text-left text-muted-foreground border-b">
                          <tr>
                            <th className="py-1 pr-2 font-medium">Yarn</th>
                            <th className="py-1 pr-2 text-right font-medium">Used (kg)</th>
                            <th className="py-1 pr-2 text-right font-medium">Price/kg</th>
                            <th className="py-1 text-right font-medium">Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dailyCalc.yarn.lines.map((l) => (
                            <tr key={l.id} className="border-b last:border-0">
                              <td className="py-0.5 pr-2">{l.label}</td>
                              <td className="py-0.5 pr-2 text-right tabular-nums">{l.kg.toLocaleString(undefined, { maximumFractionDigits: 3 })}</td>
                              <td className="py-0.5 pr-2 text-right tabular-nums">Tk {l.pricePerKg.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                              <td className="py-0.5 text-right tabular-nums">Tk {l.cost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                            </tr>
                          ))}
                          <tr className="font-semibold">
                            <td className="py-1 pr-2">Total yarn</td>
                            <td className="py-1 pr-2 text-right tabular-nums">{dailyCalc.yarn.totalKg.toLocaleString(undefined, { maximumFractionDigits: 3 })}</td>
                            <td className="py-1 pr-2" />
                            <td className="py-1 text-right tabular-nums">Tk {dailyCalc.yarn.totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <p className="text-[11px] text-muted-foreground"><span className="font-medium">Short socks</span> recipe only — yarn cost is 0 for this product. Running costs below still apply.</p>
                )}

                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                  {dailyCalc.items.map((it) => (
                    <Fragment key={it.id}>
                      <span className="text-muted-foreground truncate">{it.label} ({it.perDozen} Tk/dz)</span>
                      <span className="text-right font-medium tabular-nums">Tk {it.cost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </Fragment>
                  ))}
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm font-bold">
                  <span>Total cost</span>
                  <span className="tabular-nums">Tk {dailyCalc.totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Cost per dozen</span>
                  <span className="tabular-nums">Tk {dailyCalc.costPerDozen.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              {dailyError && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive col-span-2">{dailyError}</p>
              )}
              {dailyConfirm && (
                <p className="rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-800 col-span-2">{dailyConfirm}</p>
              )}

              <Button type="submit" size="lg" className="col-span-2 h-14 w-full text-base font-semibold">
                <Plus className="h-5 w-5" />
                Save day's entry
              </Button>
            </form>

            <div
              className="stat-glass relative rounded-3xl p-[1px] shadow-[0_14px_40px_-22px_rgba(0,0,0,0.35)]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(74,222,128,0.12) 0%, rgba(255,255,255,0.08) 50%, rgba(74,222,128,0.1) 100%)",
              }}
            >
              <div
                className="relative rounded-[22px] overflow-hidden p-4 sm:p-5 bg-emerald-50/8 dark:bg-emerald-950/8"
                style={{
                  backdropFilter: "blur(28px) saturate(120%)",
                  WebkitBackdropFilter: "blur(28px) saturate(120%)",
                }}
              >
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-1/3 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 100%)",
                  }}
                />
                {/* Whisper of green so the glass tints when light hits it */}
                <div
                  aria-hidden
                  className="absolute -bottom-14 -left-12 h-44 w-44 rounded-full opacity-40 pointer-events-none blur-3xl"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(34,197,94,0.04) 0%, transparent 70%)",
                  }}
                />
                <div className="relative grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="relative pr-2">
                    <p className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Total daily production</p>
                    <p
                      className="mt-1 sm:mt-2 text-xl sm:text-3xl font-bold leading-tight break-words tabular-nums text-green-700 dark:text-green-300"
                      style={{ textShadow: "0 1px 0 rgba(255,255,255,0.6)" }}
                    >
                      {todayProductionDozen.toLocaleString()} <span className="text-xs sm:text-sm font-medium text-muted-foreground">dz</span>
                    </p>
                  </div>
                  <div
                    aria-hidden
                    className="absolute left-1/2 top-2 bottom-2 w-px pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.12) 30%, rgba(0,0,0,0.12) 70%, transparent 100%)",
                    }}
                  />
                  <div className="relative pl-3 sm:pl-4">
                    <p className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Total cost</p>
                    <p
                      className="mt-1 sm:mt-2 text-xl sm:text-3xl font-bold leading-tight break-words tabular-nums text-green-700 dark:text-green-300"
                      style={{ textShadow: "0 1px 0 rgba(255,255,255,0.6)" }}
                    >
                      Tk {todayTotalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Past entries</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{sortedDailyEntries.length} records</span>
                  {sortedDailyEntries.length > 0 && <ManageEntriesDialog
                    title="Manage daily entries"
                    description="Edit the date or quantity of a saved daily entry. Yarn, packaging, iron and all flat running costs auto-recalculate and linked records stay in sync."
                    triggerLabel="Edit"
                    entries={sortedDailyEntries}
                    onDelete={(id) => {
                      setDailyEntries((prev) => prev.filter((x) => x.id !== id));
                      // Remove the production, yarn-usage and labor records this
                      // daily entry created so nothing is left orphaned.
                      setProductionEntries((prev) => prev.filter((x) => x.sourceDailyId !== id));
                      setYarnUsageEntries((prev) => prev.filter((x) => x.sourceDailyId !== id));
                      setWorkLogs((prev) => prev.filter((x) => x.sourceDailyId !== id));
                    }}
                    editFields={[
                      { key: "date", label: "Date", type: "date" },
                      { key: "totalProductionDozen", label: "Production (dz)", type: "number" },
                    ]}
                    onSave={(id, patch) => {
                      // Editing date/quantity re-runs the same auto-calc as the
                      // form and keeps every linked record in sync.
                      let updated: DailyProductionEntry | undefined;
                      setDailyEntries((prev) => prev.map((e) => {
                        if (e.id !== id) return e;
                        const merged = { ...e, ...patch } as DailyProductionEntry;
                        const date = merged.date;
                        const q = Number(merged.totalProductionDozen) || 0;
                        const yarn = productYarnCost(productConfigs, merged.productType, q, yarnPurchases, date);
                        const packagingCost = PACKAGING_COST_PER_DOZEN * q;
                        const ironCost = IRON_COST_PER_DOZEN * q;
                        const laborCost = OVERHEAD_COST_PER_DOZEN * q;
                        merged.yarnUsedKg = yarn.totalKg;
                        merged.yarnCostPerKg = yarn.totalKg > 0 ? yarn.totalCost / yarn.totalKg : 0;
                        merged.packagingCost = packagingCost;
                        merged.ironCost = ironCost;
                        merged.staffBill = 0;
                        merged.laborCost = laborCost;
                        merged.totalCost = yarn.totalCost + packagingCost + ironCost + laborCost;
                        merged.costPerDozen = q > 0 ? merged.totalCost / q : 0;
                        updated = merged;
                        return merged;
                      }));
                      if (!updated) return;
                      const u = updated;
                      const q = Number(u.totalProductionDozen) || 0;
                      setProductionEntries((prev) => prev.map((x) => x.sourceDailyId === id ? { ...x, date: u.date, quantityDozen: q } : x));
                      setYarnUsageEntries((prev) => prev.map((x) => x.sourceDailyId === id ? { ...x, kgUsed: u.yarnUsedKg } : x));
                      // New model creates no worklogs; drop any stale legacy ones
                      // so Labor Management totals stay consistent after an edit.
                      setWorkLogs((prev) => prev.filter((x) => x.sourceDailyId !== id));
                    }}
                    columns={[
                      { header: "Date", render: (e) => formatDateLabel(e.date) },
                      { header: "Dz", render: (e) => e.totalProductionDozen.toLocaleString(), className: "text-right" },
                      { header: "Cost", render: (e) => `Tk ${e.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, className: "text-right" },
                    ]}
                  />}
                </div>
              </div>
              <CompactList
                items={sortedDailyEntries}
                keyOf={(e) => e.id}
                emptyText="No daily entries yet"
                emptyHint="Add today's entry to start tracking daily costs."
                renderItem={(entry) => (
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{formatDateLabel(entry.date)}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {entry.totalProductionDozen.toLocaleString()} dz · {entry.yarnUsedKg.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg
                      </p>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <p className="font-semibold">Tk {entry.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                      <p className="text-[11px] text-muted-foreground">Tk {entry.costPerDozen.toLocaleString(undefined, { maximumFractionDigits: 2 })}/dz</p>
                    </div>
                  </div>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/30 shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl">Daily Sales Entry</CardTitle>
            <CardDescription>Record sales by date. Stock and revenue update automatically.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
              {[
                { label: "Sales today", value: `Tk ${todaySalesValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, suffix: null as string | null },
                { label: "Sold today", value: todaySalesDozen.toLocaleString(), suffix: "dz" },
                { label: "All-time",  value: `Tk ${totalSalesValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, suffix: null },
              ].map((tile) => (
                <div
                  key={tile.label}
                  className="stat-glass-sm relative rounded-xl p-[1px] shadow-[0_6px_18px_-12px_rgba(0,0,0,0.35)]"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(74,222,128,0.1) 0%, rgba(255,255,255,0.08) 50%, rgba(74,222,128,0.08) 100%)",
                  }}
                >
                  <div
                    className="relative rounded-[11px] overflow-hidden px-2 py-1.5 sm:px-2.5 sm:py-2 min-h-[48px] flex flex-col justify-center box-border bg-emerald-50/8 dark:bg-emerald-950/8"
                    style={{
                      backdropFilter: "blur(22px) saturate(120%)",
                      WebkitBackdropFilter: "blur(22px) saturate(120%)",
                    }}
                  >
                    <div
                      aria-hidden
                      className="absolute inset-x-0 top-0 h-1/3 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)",
                      }}
                    />
                    <p className="relative text-[9px] sm:text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground truncate leading-tight">
                      {tile.label}
                    </p>
                    <p className="relative text-[12px] sm:text-sm font-semibold break-words leading-tight tabular-nums mt-0.5">
                      {tile.value}
                      {tile.suffix && (
                        <span className="text-[10px] font-normal text-muted-foreground"> {tile.suffix}</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddSale} className="space-y-5">
              {/* Line 1: customer, date, and the simple-mode toggle — three across, compact */}
              <div className="grid grid-cols-3 gap-2 items-end">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground" htmlFor="daily-sale-customer">Customer</label>
                  <Input
                    id="daily-sale-customer"
                    className="h-11 text-sm"
                    placeholder="e.g. Karim"
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground" htmlFor="daily-sale-date">Date</label>
                  <Input
                    id="daily-sale-date"
                    type="date"
                    className="h-11 text-sm px-2"
                    value={saleDate}
                    onChange={(event) => setSaleDate(event.target.value)}
                    max={getToday()}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Total only</label>
                  <Button type="button" variant={saleSimpleMode ? "default" : "outline"} className="h-11 w-full text-sm" onClick={() => setSaleSimpleMode((v) => !v)}>
                    {saleSimpleMode ? "On" : "Off"}
                  </Button>
                </div>
              </div>

              {saleSimpleMode ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="daily-sale-simple-total">Total sale (Tk)</label>
                  <Input
                    id="daily-sale-simple-total"
                    type="number"
                    min="1"
                    step="0.01"
                    inputMode="decimal"
                    className="h-12 text-base"
                    placeholder="0"
                    value={saleSimpleTotal}
                    onChange={(e) => setSaleSimpleTotal(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">No product breakdown — recorded as "Mixed".</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Products sold</label>
                    <span className="text-xs text-muted-foreground">{saleRows.length} {saleRows.length === 1 ? "item" : "items"}</span>
                  </div>
                  <div className="space-y-2">
                    {saleRows.map((row, idx) => (
                      <div key={row.id} className="rounded-xl border p-2 space-y-1.5">
                        {/* Line 2: product type, qty (dz), total bill — three across */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Product</label>
                            <Select
                              value={row.productType}
                              onValueChange={(value) =>
                                setSaleRows((rows) => rows.map((r, i) => i === idx ? { ...r, productType: value as ProductType } : r))
                              }
                            >
                              <SelectTrigger className="h-11 text-sm">
                                <SelectValue placeholder="Type" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(productTypeLabels).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>{label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Qty (dz)</label>
                            <Input
                              type="number"
                              min="1"
                              step="1"
                              inputMode="numeric"
                              className="h-11 text-sm"
                              placeholder="0"
                              value={row.qty}
                              onChange={(e) =>
                                setSaleRows((rows) => rows.map((r, i) => i === idx ? { ...r, qty: e.target.value } : r))
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Total bill</label>
                            <Input
                              type="number"
                              min="1"
                              step="0.01"
                              inputMode="decimal"
                              className="h-11 text-sm"
                              placeholder="0"
                              value={row.total}
                              onChange={(e) =>
                                setSaleRows((rows) => rows.map((r, i) => i === idx ? { ...r, total: e.target.value } : r))
                              }
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Tk {(Number(row.qty) > 0 && Number(row.total) > 0 ? Number(row.total) / Number(row.qty) : 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} / dz
                          </span>
                          {saleRows.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-muted-foreground"
                              aria-label="Remove item"
                              onClick={() => setSaleRows((rows) => rows.filter((_, i) => i !== idx))}
                            >
                              <Minus className="h-3.5 w-3.5 mr-1" /> Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setSaleRows((rows) => [...rows, { id: crypto.randomUUID(), productType: "short-socks", qty: "", total: "" }])}
                  >
                    <Plus className="h-4 w-4" /> Add another product
                  </Button>
                </div>
              )}

              {saleError && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{saleError}</p>
              )}
              {saleConfirm && (
                <p className="rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-800">{saleConfirm}</p>
              )}

              <ReceiptCapture value={saleReceipt} onChange={setSaleReceipt} />

              <Button type="submit" size="lg" className="h-14 w-full text-base font-semibold">
                <Plus className="h-5 w-5" />
                Save sale
              </Button>
            </form>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Sales entries</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{sortedSalesEntries.length} records</span>
                  {sortedSalesEntries.length > 0 && <ManageEntriesDialog
                    title="Manage sales"
                    description="Edit a sale's date, customer, quantity, or price. Total auto-recalculates from qty × price."
                    triggerLabel="Edit"
                    entries={sortedSalesEntries}
                    onDelete={(id) => setSalesEntries((prev) => prev.filter((x) => x.id !== id))}
                    editFields={[
                      { key: "date", label: "Date", type: "date" },
                      { key: "customerName", label: "Customer", type: "text" },
                      { key: "quantityDozen", label: "Qty (dz)", type: "number" },
                      { key: "pricePerDozen", label: "Price per dozen (Tk)", type: "number" },
                    ]}
                    onSave={(id, patch) => setSalesEntries((prev) => prev.map((s) => {
                      if (s.id !== id) return s;
                      const merged = { ...s, ...patch };
                      const qty = Number(merged.quantityDozen) || 0;
                      const price = Number(merged.pricePerDozen) || 0;
                      merged.totalValue = qty * price;
                      return merged;
                    }))}
                    columns={[
                      { header: "Date", render: (s) => formatDateLabel(s.date) },
                      { header: "Customer", render: (s) => s.customerName },
                      { header: "Qty", render: (s) => `${s.quantityDozen} dz`, className: "text-right" },
                      { header: "Total", render: (s) => `Tk ${s.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, className: "text-right" },
                    ]}
                  />}
                </div>
              </div>
              <CompactList
                items={sortedSalesEntries}
                keyOf={(s) => s.id}
                emptyText="No sales entered yet"
                emptyHint="Add a sale above to update revenue and reduce stock."
                renderItem={(sale) => (
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{formatDateLabel(sale.date)} · {sale.customerName}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {productTypeLabels[sale.productType]} · {sale.quantityDozen.toLocaleString()} dz @ Tk {sale.pricePerDozen.toLocaleString(undefined, { maximumFractionDigits: 0 })}/dz
                      </p>
                    </div>
                    <p className="text-sm font-bold whitespace-nowrap">Tk {sale.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card id="electricity" className="border-2 border-primary/30 shadow-md scroll-mt-24">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2"><Zap className="h-6 w-6 text-primary" /> Electricity Card Recharge</CardTitle>
            <CardDescription>Log prepaid meter card top-ups. Electricity is also counted as a flat per-dozen cost inside production.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-4 space-y-5">
              <div>
                <h3 className="text-base font-semibold flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Card recharge</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Prepaid meter recharge log. Auto-pay from card on each top-up.</p>
              </div>
              <form onSubmit={handleAddRecharge} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="rec-date">Date</label>
                    <Input id="rec-date" type="date" className="h-12 text-base" value={rechargeDate} onChange={(e) => setRechargeDate(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="rec-amt">Recharge amount (Tk)</label>
                    <Input id="rec-amt" type="number" min="1" step="0.01" inputMode="decimal" className="h-12 text-base" placeholder="0" value={rechargeAmount} onChange={(e) => setRechargeAmount(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="rec-note">Note (optional)</label>
                  <Input id="rec-note" type="text" className="h-12 text-base" placeholder="e.g. Auto-pay from bKash card" value={rechargeNote} onChange={(e) => setRechargeNote(e.target.value)} />
                </div>
                {rechargeError && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{rechargeError}</p>}
                {rechargeConfirm && <p className="rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-800">{rechargeConfirm}</p>}
                <ReceiptCapture value={rechargeReceipt} onChange={setRechargeReceipt} label="Recharge receipt photo (optional)" />
                <Button type="submit" size="lg" className="h-12 w-full text-base font-semibold">
                  <Plus className="h-5 w-5" /> Save recharge
                </Button>
              </form>

              {rechargeByMonth.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Recharged by month</h4>
                  <div className="space-y-2">
                    {rechargeByMonth.map(({ month, total }) => (
                      <div key={month} className="flex items-center justify-between gap-3 rounded-xl border bg-card/60 px-4 py-3">
                        <p className="text-sm font-semibold">{formatMonthLabel(month)}</p>
                        <p className="text-base font-bold whitespace-nowrap">Tk {total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Recharge history</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {electricityRecharges.length} · Total Tk {electricityRecharges.reduce((s, r) => s + (Number(r.amount) || 0), 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                    {electricityRecharges.length > 0 && <ManageEntriesDialog
                      title="Manage recharges"
                      description="Edit or delete a saved electricity card recharge."
                      triggerLabel="Edit"
                      entries={[...electricityRecharges].sort((a, b) => (a.date < b.date ? 1 : -1))}
                      onDelete={(id) => setElectricityRecharges((prev) => prev.filter((x) => x.id !== id))}
                      editFields={[
                        { key: "date", label: "Date", type: "date" },
                        { key: "amount", label: "Amount (Tk)", type: "number" },
                        { key: "note", label: "Note", type: "text" },
                      ]}
                      onSave={(id, patch) => setElectricityRecharges((prev) => prev.map((e) => e.id === id ? { ...e, ...patch } : e))}
                      columns={[
                        { header: "Date", render: (e) => formatDateLabel(e.date) },
                        { header: "Amount", render: (e) => `Tk ${e.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, className: "text-right" },
                      ]}
                    />}
                  </div>
                </div>
                {electricityRecharges.length > 0 ? (
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {[...electricityRecharges].sort((a, b) => (a.date < b.date ? 1 : -1)).map((r) => (
                      <div key={r.id} className="flex items-center justify-between gap-3 rounded-xl border bg-card/60 px-4 py-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">{formatDateLabel(r.date)}</p>
                          {r.note && <p className="text-xs text-muted-foreground truncate">{r.note}</p>}
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-base font-bold whitespace-nowrap">Tk {r.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                          <ReceiptThumb src={r.receiptImage} size={36} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed p-4 text-center">
                    <p className="text-xs text-muted-foreground">No recharges yet. Add the first top-up above.</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card id="yarn-calculation" className="border-2 border-primary/30 shadow-md scroll-mt-24">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2"><Wrench className="h-6 w-6 text-primary" /> Yarn Calculation</CardTitle>
            <CardDescription>Track each yarn's needs vs stock, plus purchased, used, and remaining amounts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Yarn needs vs stock — one section per yarn: a colored bar
                comparing this period's need (auto from production) vs stock,
                plus purchased / used / remaining / price details. */}
            <div className="space-y-3">
              <div className="flex flex-row items-start justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="text-sm font-semibold flex items-center gap-1.5"><TrendingUp className="h-4 w-4 text-primary" /> Yarn needs vs stock</h3>
                  <p className="text-xs text-muted-foreground">
                    {yarnAvgDozenPerDay > 0
                      ? `Auto from ~${num1(yarnAvgDozenPerDay)} dz/day. Bar = ${yarnNeedPeriod} need vs stock; details below.`
                      : "Record daily production to auto-calculate weekly & monthly yarn need."}
                  </p>
                </div>
                <div className="flex rounded-full border p-0.5 shrink-0">
                  <button type="button" onClick={() => setYarnNeedPeriod("weekly")} className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${yarnNeedPeriod === "weekly" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Weekly</button>
                  <button type="button" onClick={() => setYarnNeedPeriod("monthly")} className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${yarnNeedPeriod === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Monthly</button>
                </div>
              </div>
              <div className="space-y-2">
                {yarnByTypeRows.map((r) => {
                  const recipe = allYarns.find((x) => x.id === r.id);
                  const need = yarnNeedPeriod === "weekly" ? (needByYarn.weekly[r.id] || 0) : (needByYarn.monthly[r.id] || 0);
                  const have = Math.max(0, r.remainingKg);
                  const coverage = need > 0 ? have / need : have > 0 ? 1 : 0;
                  const shortfall = need - have;
                  const periodsLeft = need > 0 ? have / need : 0;
                  const periodWord = yarnNeedPeriod === "weekly" ? "week" : "month";
                  const periodWordPlural = yarnNeedPeriod === "weekly" ? "weeks" : "months";
                  return (
                    <div key={r.id} className="rounded-xl border bg-card/60 p-3 space-y-1.5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold truncate">{r.label}</p>
                        <p className={`text-base font-bold tabular-nums whitespace-nowrap ${r.remainingKg < 0 ? "text-destructive" : "text-emerald-700 dark:text-emerald-400"}`}>
                          {kgFmt(r.remainingKg)} kg left
                        </p>
                      </div>
                      {recipe && (
                        <div className="relative h-7 w-full overflow-hidden rounded-md bg-muted">
                          <div
                            className={`absolute inset-y-0 left-0 transition-all ${need > 0 ? yarnBarColor(coverage) : "bg-muted-foreground/30"}`}
                            style={{ width: `${need > 0 ? Math.min(1, coverage) * 100 : 0}%` }}
                          />
                          <div
                            className="relative flex h-full items-center justify-between gap-2 px-2.5 text-[11px] font-medium text-foreground"
                            style={{ textShadow: "0 1px 1px rgba(255,255,255,0.45)" }}
                          >
                            <span className="truncate">
                              {need <= 0
                                ? "Record production to see need"
                                : have <= 0
                                ? `Out — buy ${kgFmt(need)} kg/${periodWord}`
                                : shortfall > 0
                                ? `Buy ${kgFmt(shortfall)} kg/${periodWord}`
                                : `~${num1(periodsLeft)} ${periodWordPlural} left`}
                            </span>
                            <span className="shrink-0 tabular-nums">{kgFmt(have)} / {kgFmt(need)} kg</span>
                          </div>
                        </div>
                      )}
                      <p className="text-[10px] text-muted-foreground tabular-nums leading-tight">
                        Purchased <span className="font-semibold text-foreground">{kgFmt(r.purchasedKg)} kg</span>
                        {" · "}Used <span className="font-semibold text-foreground">{kgFmt(r.usedKg)} kg</span>
                        {" · "}<span className="font-semibold text-foreground">Tk {r.pricePerKg.toLocaleString(undefined, { maximumFractionDigits: 0 })}/kg</span>
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Add yarn purchase</h3>
              <form onSubmit={handleAddYarnPurchase} className="space-y-2">
                <div className="grid grid-cols-[1fr_1fr_auto] gap-1.5 sm:gap-2.5 lg:gap-3 items-end">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="yarn-purchase-date">Date</label>
                    <Input id="yarn-purchase-date" type="date" className="h-12 text-base" max={getToday()} value={yarnPurchaseDate} onChange={(e) => setYarnPurchaseDate(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="yarn-purchase-kg">Quantity (kg)</label>
                    <Input id="yarn-purchase-kg" type="number" min="0" step="0.01" inputMode="decimal" className="h-12 text-base" placeholder="0" value={yarnPurchaseKg} onChange={(e) => setYarnPurchaseKg(e.target.value)} required />
                  </div>
                  <Button type="submit" size="sm" className="h-12 px-3 whitespace-nowrap">
                    <Plus className="h-4 w-4" /> Add
                  </Button>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="yarn-purchase-type">Yarn type</label>
                  <Select value={yarnPurchaseType} onValueChange={(v) => { setYarnPurchaseType(v); if (v !== "__other__") setYarnPurchaseTypeOther(""); }}>
                    <SelectTrigger id="yarn-purchase-type" className="h-12 text-base">
                      <SelectValue placeholder="Choose yarn type" />
                    </SelectTrigger>
                    <SelectContent>
                      {yarnTypeOptions.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                      <SelectItem value="__other__">+ Add other…</SelectItem>
                    </SelectContent>
                  </Select>
                  {yarnPurchaseType === "__other__" && (
                    <Input className="h-12 text-base" placeholder="New yarn type" value={yarnPurchaseTypeOther} onChange={(e) => setYarnPurchaseTypeOther(e.target.value)} />
                  )}
                </div>
                <ReceiptCapture value={yarnPurchaseReceipt} onChange={setYarnPurchaseReceipt} label="Add documents photo (optional)" />
              </form>
              {yarnPurchases.length > 0 && (
                <>
                  <div className="flex justify-end">
                    <ManageEntriesDialog
                      title="Manage yarn purchases"
                      description="Edit or delete saved yarn purchases."
                      entries={yarnPurchases}
                      onDelete={(id) => setYarnPurchases((prev) => prev.filter((x) => x.id !== id))}
                      editFields={[
                        { key: "date", label: "Date", type: "date" },
                        { key: "kg", label: "Quantity (kg)", type: "number" },
                      ]}
                      onSave={(id, patch) => setYarnPurchases((prev) => prev.map((p) => p.id === id ? { ...p, ...patch } : p))}
                      columns={[
                        { header: "Date", render: (p) => formatDateLabel(p.date) },
                        { header: "Quantity", render: (p) => `${p.kg.toLocaleString(undefined, { maximumFractionDigits: 2 })} kg`, className: "text-right" },
                      ]}
                    />
                  </div>
                  <div className="rounded-2xl border divide-y max-h-44 overflow-y-auto">
                    {yarnPurchases.slice(0, 10).map((p) => (
                      <div key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                        <div>
                          <p className="font-medium">{p.kg.toLocaleString(undefined, { maximumFractionDigits: 2 })} kg</p>
                          <p className="text-xs text-muted-foreground">{formatDateLabel(p.date)}</p>
                        </div>
                        <ReceiptThumb src={p.receiptImage} size={32} />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

          </CardContent>
        </Card>

        <Card id="labor-payroll" className="border-2 border-primary/30 shadow-md scroll-mt-24">
          <CardHeader>
            <CardTitle className="text-2xl">Labor Management</CardTitle>
            <CardDescription>Track each worker's earnings, payments, and remaining balance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2.5">
              <div className="rounded-lg border bg-primary/5 p-2 sm:p-3 min-h-[55px] flex flex-col justify-center box-border">
                <p className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wide text-muted-foreground truncate">Total paid</p>
                <p className="text-[13px] sm:text-base font-semibold break-words tabular-nums">Tk {totalPaidAll.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
              <div className={`rounded-lg border p-2 sm:p-3 min-h-[55px] flex flex-col justify-center box-border ${totalRemainingAll > 0 ? "bg-orange-50 border-orange-200" : "bg-green-50 border-green-200"}`}>
                <p className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wide text-muted-foreground truncate">Remaining due</p>
                <p className={`text-[13px] sm:text-base font-semibold break-words tabular-nums ${totalRemainingAll > 0 ? "text-orange-700" : "text-green-700"}`}>Tk {totalRemainingAll.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
            </div>

            {workerStats.length > 0 && (
              <div className="rounded-2xl border bg-card/60 p-3 space-y-2">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Workers summary</p>
                <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 gap-y-1.5 text-xs">
                  <p className="font-semibold text-muted-foreground">Name</p>
                  <p className="font-semibold text-muted-foreground text-right">Paid</p>
                  <p className="font-semibold text-muted-foreground text-right">Due</p>
                  {workerStats.map(({ worker, totalPaid, remaining }) => (
                    <Fragment key={worker.id}>
                      <p className="font-medium truncate">{worker.name}</p>
                      <p className="text-right tabular-nums">Tk {totalPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                      <p className={`text-right tabular-nums font-semibold ${remaining > 0 ? "text-orange-700" : "text-green-700"}`}>Tk {remaining.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </Fragment>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleAddWorker} className="space-y-3 rounded-2xl border bg-muted/20 p-4">
              <h3 className="text-sm font-semibold">Worker entry</h3>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="uni-date">Date</label>
                <Input id="uni-date" type="date" className="h-12 text-base" value={uniDate} onChange={(e) => setUniDate(e.target.value)} max={getToday()} required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="worker-name">Name</label>
                <Input id="worker-name" className="h-12 text-base" placeholder="Worker name" value={newWorkerName} onChange={(e) => setNewWorkerName(e.target.value)} required />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="worker-workat">Work at</label>
                  <Select value={newWorkerWorkAt} onValueChange={(v) => setNewWorkerWorkAt(v as WorkArea)}>
                    <SelectTrigger id="worker-workat" className="h-12 text-base"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {workAreaOrder.map((a) => (
                        <SelectItem key={a} value={a}>{workAreaLabels[a]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="uni-bill">Daily bill (Tk)</label>
                  <Input id="uni-bill" type="number" min="0" step="0.01" inputMode="decimal" className="h-12 text-base" placeholder="0" value={uniDailyBill} onChange={(e) => setUniDailyBill(e.target.value)} />
                </div>
              </div>

              {(() => {
                const billAmount = Number(uniDailyBill) || 0;
                const dueAfter = Math.max(0, billAmount - (Number(uniPayingNow) || 0));
                return (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg border bg-primary/5 p-2 sm:p-3 min-h-[55px] flex flex-col justify-center box-border">
                      <p className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wide text-muted-foreground truncate">Bill</p>
                      <p className="text-[13px] sm:text-base font-semibold break-words tabular-nums">Tk {billAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="rounded-lg border bg-primary/5 p-2 sm:p-3 min-h-[55px] flex flex-col justify-center box-border">
                      <p className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wide text-muted-foreground truncate">Total bill</p>
                      <p className="text-[13px] sm:text-base font-semibold break-words tabular-nums">Tk {dueAfter.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="uni-next-date">Payment date</label>
                  <Input id="uni-next-date" type="date" className="h-12 text-base" value={uniNextPaymentDate} onChange={(e) => setUniNextPaymentDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="uni-paying">Paying now</label>
                  <Input id="uni-paying" type="number" min="0" step="0.01" inputMode="decimal" className="h-12 text-base" placeholder="0" value={uniPayingNow} onChange={(e) => setUniPayingNow(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="uni-note">Comment <span className="text-muted-foreground font-normal">(optional)</span></label>
                <Input id="uni-note" className="h-12 text-base" placeholder="Note for this entry" value={uniNote} onChange={(e) => setUniNote(e.target.value)} />
              </div>

              {workerError && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{workerError}</p>}
              {uniConfirm && <p className="rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-800">{uniConfirm}</p>}
              <ReceiptCapture value={workerReceipt} onChange={setWorkerReceipt} label="Salary slip / bill photo (optional)" />
              <Button type="submit" size="lg" className="h-14 w-full text-base font-semibold"><Plus className="h-5 w-5" /> Save entry</Button>
            </form>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">Workers</h3>
                <ManageEntriesDialog
                  title="Manage workers"
                  description="Edit or delete saved workers."
                  entries={workers}
                  onDelete={handleRemoveWorker}
                  editFields={[
                    { key: "name", label: "Name", type: "text" },
                    { key: "rate", label: "Rate (Tk)", type: "number" },
                  ]}
                  onSave={(id, patch) => setWorkers((prev) => prev.map((w) => w.id === id ? { ...w, ...patch } : w))}
                  columns={[
                    { header: "Name", render: (w) => w.name },
                    { header: "Role", render: (w) => w.workAt ? workAreaLabels[w.workAt] : (w.payType === "daily" ? `Tk ${w.rate}/day` : `Tk ${w.rate}/unit`) },
                  ]}
                />
              </div>
              {workerStats.length > 0 ? (
                <div className="space-y-2">
                  {workerStats.map(({ worker, totalUnits, totalPaid, remaining }) => (
                    <div key={worker.id} className="rounded-xl border bg-card/60 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold">{worker.name}</p>
                          <p className="text-xs text-muted-foreground">{worker.workAt ? workAreaLabels[worker.workAt] : (worker.payType === "daily" ? `Tk ${worker.rate}/day` : `Tk ${worker.rate}/unit`)} · Tk {totalUnits.toLocaleString(undefined, { maximumFractionDigits: 2 })} billed</p>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-1.5 sm:gap-2.5 lg:gap-3">
                        <div className="rounded-lg bg-muted/40 p-3">
                          <p className="text-xs text-muted-foreground">Already paid</p>
                          <p className="text-base font-bold">Tk {totalPaid.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                        </div>
                        <div className={`rounded-lg p-3 ${remaining > 0 ? "bg-orange-100" : "bg-green-100"}`}>
                          <p className="text-xs text-muted-foreground">Remaining due</p>
                          <p className={`text-base font-bold ${remaining > 0 ? "text-orange-700" : "text-green-700"}`}>Tk {remaining.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                      {(() => {
                        const entries = workLogs
                          .filter((l) => l.workerId === worker.id)
                          .sort((a, b) => (b.date + b.createdAt).localeCompare(a.date + a.createdAt))
                          .slice(0, 5);
                        if (entries.length === 0) return null;
                        return (
                          <div className="mt-3 space-y-1.5">
                            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Recent entries</p>
                            <ul className="space-y-1">
                              {entries.map((l) => (
                                <li key={l.id} className="flex items-start justify-between gap-2 rounded-md bg-muted/30 px-2 py-1.5 text-xs">
                                  <div className="min-w-0 flex-1">
                                    <p className="font-medium">{l.date} · Tk {l.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                    {l.note ? <p className="text-muted-foreground break-words">{l.note}</p> : null}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed p-5 text-center">
                  <p className="text-sm font-medium">No workers yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Add a worker above to start tracking labor.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cost Management — simple expense ledger: just date, item,
            and amount. Independent of Daily Production Entry, with its
            own state, storage key (wolfion_cost_management_entries),
            and handlers (handleAddCostEntry / handleRemoveCostEntry). */}
        <Card id="cost-history" className="border-2 border-primary/30 shadow-md scroll-mt-24">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2"><Wrench className="h-6 w-6 text-primary" /> Cost Management</CardTitle>
            <CardDescription>Log any cost as date, item, and amount.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleAddCostEntry} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="cm-date">Date</label>
                  <Input id="cm-date" type="date" className="h-12 text-base" value={costEntryDate} onChange={(e) => setCostEntryDate(e.target.value)} max={getToday()} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="cm-category">Category</label>
                  <Select value={costEntryCategory} onValueChange={(v) => setCostEntryCategory(v as CostCategory)}>
                    <SelectTrigger id="cm-category" className="h-12 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {costCategoryOrder.map((c) => (
                        <SelectItem key={c} value={c}>{costCategoryLabels[c]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {costEntryCategory === "other" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="cm-custom-category">Category name (optional)</label>
                  <Input
                    id="cm-custom-category"
                    type="text"
                    className="h-12 text-base"
                    placeholder="e.g. Transport, Repair, Tea"
                    value={costEntryCustomCategory}
                    onChange={(e) => setCostEntryCustomCategory(e.target.value)}
                  />
                </div>
              )}
              <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="cm-item">Item</label>
                  <Input id="cm-item" type="text" className="h-12 text-base" placeholder="e.g. Yarn lot, Worker bill, Bill no." value={costEntryItem} onChange={(e) => setCostEntryItem(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="cm-amount">Amount (Tk)</label>
                  <Input id="cm-amount" type="number" min="0" step="0.01" inputMode="decimal" className="h-12 text-base w-28" placeholder="0" value={costEntryAmount} onChange={(e) => setCostEntryAmount(e.target.value)} required />
                </div>
              </div>

              {/* Live forward preview — shows what this entry will
                  add to the running total + the chosen category, so
                  the user sees the impact before they save. */}
              {(() => {
                const amt = Number(costEntryAmount) || 0;
                if (amt <= 0) return null;
                const currentTotal = costEntries.reduce((s, e) => s + (e.amount || 0), 0);
                const currentCat = costEntries
                  .filter((e) => (e.category ?? "other") === costEntryCategory)
                  .reduce((s, e) => s + (e.amount || 0), 0);
                return (
                  <div className="rounded-xl border bg-primary/5 p-3 grid grid-cols-2 gap-2 text-center">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">New {costCategoryLabels[costEntryCategory]} total</p>
                      <p className="text-sm font-bold">Tk {(currentCat + amt).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">New grand total</p>
                      <p className="text-sm font-bold">Tk {(currentTotal + amt).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                );
              })()}

              {costEntryError && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{costEntryError}</p>
              )}

              <ReceiptCapture value={costEntryReceipt} onChange={setCostEntryReceipt} />

              <Button type="submit" size="lg" className="h-12 w-full text-base font-semibold">
                <Plus className="h-5 w-5" /> Add cost
              </Button>
            </form>

            <Separator />

            {/* Totals — grand total + per-category breakdown so admins
                can see at a glance how spend splits across yarn /
                labour / packaging / electricity / other. */}
            {(() => {
              const grandTotal = costEntries.reduce((s, e) => s + (e.amount || 0), 0);
              const totalsByCategory: Record<CostCategory, number> = {
                yarn: 0, labour: 0, packaging: 0, electricity: 0, other: 0,
              };
              for (const e of costEntries) {
                const cat: CostCategory = e.category ?? "other";
                totalsByCategory[cat] += e.amount || 0;
              }
              return (
                <div className="space-y-3">
                  <div className="rounded-xl border bg-card/60 p-4 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Total cost</span>
                    <span className="text-2xl font-bold text-green-700 dark:text-green-300">Tk {grandTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {costCategoryOrder.map((c) => (
                      <div key={c} className="rounded-xl border bg-card/40 p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{costCategoryLabels[c]}</p>
                        <p className="mt-1 text-base font-bold">Tk {totalsByCategory[c].toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            <Separator />

            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Entries</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{costEntries.length} records</span>
                <ManageEntriesDialog
                  title="Manage cost entries"
                  description="Edit or delete saved cost entries."
                  entries={costEntries}
                  onDelete={handleRemoveCostEntry}
                  editFields={[
                    { key: "date", label: "Date", type: "date" },
                    { key: "item", label: "Item", type: "text" },
                    { key: "amount", label: "Amount (Tk)", type: "number" },
                  ]}
                  onSave={(id, patch) => setCostEntries((prev) => prev.map((e) => e.id === id ? { ...e, ...patch } : e))}
                  columns={[
                    { header: "Date", render: (e) => formatDateLabel(e.date) },
                    { header: "Item", render: (e) => e.item },
                    { header: "Category", render: (e) => costCategoryDisplay(e) },
                    { header: "Amount", render: (e) => `Tk ${e.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, className: "text-right" },
                  ]}
                />
              </div>
            </div>
            <CompactList
              items={[...costEntries].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : (a.createdAt < b.createdAt ? 1 : -1)))}
              keyOf={(e) => e.id}
              emptyText="No cost entries yet"
              emptyHint="Add your first cost above."
              renderItem={(entry) => {
                return (
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{entry.item}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{formatDateLabel(entry.date)} · {costCategoryDisplay(entry)}</p>
                    </div>
                    <p className="font-bold whitespace-nowrap">Tk {entry.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                );
              }}
            />
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/30 shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl">Investment and Investor</CardTitle>
            <CardDescription>Track funds invested by each investor.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border bg-primary/5 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total overall investment</p>
                <p className="mt-2 text-3xl font-bold">Tk {totalInvestorFunds.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="mt-1 text-xs text-muted-foreground">{investors.length} contributions</p>
              </div>
              <div className="rounded-2xl border bg-primary/5 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Investors</p>
                <p className="mt-2 text-3xl font-bold">{investorTotals.length}</p>
                <p className="mt-1 text-xs text-muted-foreground">Unique people</p>
              </div>
            </div>

            <form onSubmit={handleAddInvestor} className="space-y-5">
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 lg:gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="investor-name">Investor name</label>
                  <Input id="investor-name" className="h-12 text-base" placeholder="Investor name" value={investorName} onChange={(e) => setInvestorName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="investor-date">Date</label>
                  <Input id="investor-date" type="date" className="h-12 text-base" value={investorDate} onChange={(e) => setInvestorDate(e.target.value)} max={getToday()} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="investor-amount">Amount invested</label>
                  <Input id="investor-amount" type="number" min="0.01" step="0.01" inputMode="decimal" className="h-12 text-base" placeholder="0" value={investorAmount} onChange={(e) => setInvestorAmount(e.target.value)} required />
                </div>
              </div>
              {investorError && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{investorError}</p>}
              <ReceiptCapture value={investorReceipt} onChange={setInvestorReceipt} label="Deposit slip / proof photo (optional)" />
              <Button type="submit" size="lg" className="h-14 w-full text-base font-semibold"><Plus className="h-5 w-5" /> Save investor entry</Button>
            </form>

            {investorTotals.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Total per investor</h3>
                <CompactList
                  items={investorTotals}
                  keyOf={(it) => it.name}
                  renderItem={(it) => (
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium truncate">{it.name}</p>
                      <p className="font-bold whitespace-nowrap">Tk {it.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                  )}
                />
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">All investor entries</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{investors.length} records</span>
                  <ManageEntriesDialog
                    title="Manage investor entries"
                    description="Edit or delete saved investor entries."
                    entries={investors}
                    onDelete={handleRemoveInvestor}
                    editFields={[
                      { key: "date", label: "Date", type: "date" },
                      { key: "name", label: "Investor name", type: "text" },
                      { key: "amount", label: "Amount (Tk)", type: "number" },
                    ]}
                    onSave={(id, patch) => setInvestors((prev) => prev.map((e) => e.id === id ? { ...e, ...patch } : e))}
                    columns={[
                      { header: "Date", render: (e) => formatDateLabel(e.date) },
                      { header: "Investor", render: (e) => e.name },
                      { header: "Amount", render: (e) => `Tk ${e.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, className: "text-right" },
                    ]}
                  />
                </div>
              </div>
              <CompactList
                items={sortedInvestorEntries}
                keyOf={(e) => e.id}
                emptyText="No investor entries yet"
                emptyHint="Add an entry above to start tracking."
                renderItem={(e) => (
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{e.name}</p>
                      <p className="text-[11px] text-muted-foreground">{formatDateLabel(e.date)}</p>
                    </div>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <p className="font-bold">Tk {e.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                      <ReceiptThumb src={e.receiptImage} size={28} />
                    </div>
                  </div>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/30 shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl">Product Types</CardTitle>
            <CardDescription>Manage product categories. Add custom types to fit your factory.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <form onSubmit={handleAddProductType} className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium" htmlFor="new-product-type">Add new product type</label>
                <Input
                  id="new-product-type"
                  className="h-12 text-base"
                  placeholder="e.g. Sport socks, Wool blend..."
                  value={newProductTypeName}
                  onChange={(e) => setNewProductTypeName(e.target.value)}
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-6 text-base font-semibold sm:w-auto">
                <Plus className="h-5 w-5" /> Add type
              </Button>
            </form>
            {productTypeError && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{productTypeError}</p>
            )}
            <div className="flex justify-end">
              <ManageEntriesDialog
                title="Manage product types"
                description="Edit names or delete product types. Types currently used by production or sales cannot be removed."
                entries={productTypes}
                onDelete={handleRemoveProductType}
                editFields={[
                  { key: "label", label: "Name", type: "text" },
                ]}
                onSave={(id, patch) => setProductTypes((prev) => prev.map((t) => t.id === id ? { ...t, ...patch } : t))}
                columns={[
                  { header: "Name", render: (t) => t.label },
                  { header: "Status", render: (t) => {
                    const inUse = productionEntries.some((e) => e.productType === t.id) || salesEntries.some((e) => e.productType === t.id);
                    return inUse ? <span className="text-xs text-muted-foreground">In use</span> : <span className="text-xs">Unused</span>;
                  } },
                ]}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {productTypes.map((t) => (
                <div key={t.id} className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 shadow-sm">
                  <span className="text-sm font-medium">{t.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </AdminLayout>
  );
}
