import { AdminLayout } from "@/components/admin-layout";
import { adminMetrics } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, DollarSign, Package, Factory, TrendingUp, Plus, Minus, Zap, Users, Wrench, LogOut as LogOutIcon, ChevronRight } from "lucide-react";
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
import { Fragment, useEffect, useMemo, useState, type FormEvent } from "react";
import { STORAGE_KEYS, defaultYarnTypes, type RentEntry } from "@/lib/wolfion-store";
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
};

const defaultProductTypes: ProductTypeOption[] = [
  { id: "short-socks", label: "Short socks" },
  { id: "ankle-socks", label: "Ankle socks" },
  { id: "kids-socks", label: "Kids socks" },
  { id: "mixed", label: "Mixed" },
  { id: "others", label: "Others" },
];

const initialInventory: Record<string, number> = {
  "short-socks": 0,
  "ankle-socks": 0,
  "kids-socks": 0,
  "mixed": 0,
  "others": 0,
};

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

type ElectricityEntry = {
  id: string;
  month: string;
  totalBill: number;
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
type YarnPurchase = { id: string; date: string; kg: number; yarnType?: string; createdAt: string; receiptImage?: string };

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

export default function Dashboard() {
  // Cloud-synced via STORAGE_KEYS.productTypes (Phase 1 cloud sync).
  // The cloud allow-list in wolfion-store.ts routes this key through
  // Firebase Realtime Database, so admin product categories are shared
  // across every signed-in admin device in real time.
  const [productTypes, setProductTypes] = useCloudStored<ProductTypeOption[]>(
    STORAGE_KEYS.productTypes,
    defaultProductTypes,
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
  const [dailyMachineHours, setDailyMachineHours] = useState("");
  // Multi-product daily production. Each row = one product with its own qty.
  // Costs (yarn, packaging, iron, staff) are entered once for the day and
  // split proportionally across rows by qty when saving.
  const [dailyRows, setDailyRows] = useState<Array<{ id: string; productType: ProductType; qty: string }>>(
    () => [{ id: crypto.randomUUID(), productType: "short-socks", qty: "" }],
  );
  const [dailyYarnCostPerKg, setDailyYarnCostPerKg] = useState("");
  const [dailyLaborCost, setDailyLaborCost] = useState("");
  const [dailyPackagingCost, setDailyPackagingCost] = useState("");
  const [dailyIronCost, setDailyIronCost] = useState("");
  const [dailyStaffBill, setDailyStaffBill] = useState("");
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
  const [quickSaleConfirm, setQuickSaleConfirm] = useState("");
  const [yarnPurchases, setYarnPurchases] = useCloudStored<YarnPurchase[]>(STORAGE_KEYS.yarnPurchases, []);
  const [yarnPurchaseDate, setYarnPurchaseDate] = useState(getToday());
  const [yarnPurchaseKg, setYarnPurchaseKg] = useState("");
  const [yarnTypes, setYarnTypes] = useCloudStored<string[]>(STORAGE_KEYS.yarnTypes, defaultYarnTypes);
  const [yarnPurchaseType, setYarnPurchaseType] = useState<string>("");
  const [yarnPurchaseTypeOther, setYarnPurchaseTypeOther] = useState("");
  // Multi-row yarn input. Each row = one yarn type + kg used.
  // Total kg sums across rows. "__other__" lets the admin add a new
  // yarn name inline that gets saved to yarnTypes.
  const [dailyYarnRows, setDailyYarnRows] = useState<Array<{ id: string; yarnType: string; otherName: string; kg: string }>>(
    () => [{ id: crypto.randomUUID(), yarnType: "", otherName: "", kg: "" }],
  );
  const [dailyIronStaff, setDailyIronStaff] = useState("");
  const [dailyStaffName, setDailyStaffName] = useState("");
  const [dailyStaffArea, setDailyStaffArea] = useState<WorkArea>("packaging");
  const [yarnPerDozen, setYarnPerDozen] = useCloudStored<YarnPerDozen>(STORAGE_KEYS.yarnPerDozen, defaultYarnPerDozen);
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

  const [electricityEntries, setElectricityEntries] = useCloudStored<ElectricityEntry[]>(STORAGE_KEYS.electricity, []);
  const [electricityMonth, setElectricityMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [electricityBill, setElectricityBill] = useState("");
  const [electricityError, setElectricityError] = useState("");
  const [electricityConfirm, setElectricityConfirm] = useState("");
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
  const [profitTab, setProfitTab] = useState<"daily" | "monthly">("daily");
  const [profitDate, setProfitDate] = useState(getToday());
  const [profitMonth, setProfitMonth] = useState(() => new Date().toISOString().slice(0, 7));

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
  const [electricityReceipt, setElectricityReceipt] = useState<string | undefined>(undefined);
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
  const todayCostPerDozen = todayProductionDozen > 0 ? todayTotalCost / todayProductionDozen : 0;
  const todayLaborCost = todayEntries.reduce(
    (total, entry) => total + (entry.laborCost || 0) + (entry.packagingCost || 0) + (entry.ironCost || 0) + (entry.staffBill || 0),
    0,
  );
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
  const costPerDozen = costs.yarnCostPerDozen + costs.laborCostPerDozen + costs.packagingCostPerDozen;
  const totalCostOfSales = totalSoldDozen * costPerDozen;
  const totalProfit = totalSalesValue - totalCostOfSales;
  const averageProfitPerSale = salesEntries.length > 0 ? totalProfit / salesEntries.length : 0;

  const sortedElectricityEntries = useMemo(
    () => [...electricityEntries].sort((a, b) => (a.month < b.month ? 1 : -1)),
    [electricityEntries],
  );
  const monthlyProductionByMonth = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const entry of dailyEntries) {
      const month = entry.date.slice(0, 7);
      totals[month] = (totals[month] || 0) + entry.totalProductionDozen;
    }
    return totals;
  }, [dailyEntries]);
  const electricityWithCalc = useMemo(
    () =>
      sortedElectricityEntries.map((entry) => {
        const production = monthlyProductionByMonth[entry.month] || 0;
        const perDozen = production > 0 ? entry.totalBill / production : 0;
        return { ...entry, monthlyProduction: production, costPerDozen: perDozen };
      }),
    [sortedElectricityEntries, monthlyProductionByMonth],
  );
  function rentForMonth(month: string): number {
    return rentEntries.filter((r) => r.month === month).reduce((s, r) => s + (Number(r.amount) || 0), 0);
  }
  function rentPerDozenForDate(isoDate: string): number {
    const month = isoDate.slice(0, 7);
    const production = monthlyProductionByMonth[month] || 0;
    if (production <= 0) return 0;
    return rentForMonth(month) / production;
  }
  function electricityPerDozenForDate(isoDate: string): number {
    const month = isoDate.slice(0, 7);
    const entry = electricityEntries.find((e) => e.month === month);
    if (!entry) return 0;
    const production = monthlyProductionByMonth[month] || 0;
    return production > 0 ? entry.totalBill / production : 0;
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

  const profitDailyView = useMemo(() => {
    const dayEntries = dailyEntries.filter((e) => e.date === profitDate);
    const production = dayEntries.reduce((sum, e) => sum + e.totalProductionDozen, 0);
    const baseCost = dayEntries.reduce((sum, e) => sum + e.totalCost, 0);
    const elecPerDozen = electricityPerDozenForDate(profitDate);
    const electricityCost = elecPerDozen * production;
    const rentPerDz = rentPerDozenForDate(profitDate);
    const rentCost = rentPerDz * production;
    const totalCost = baseCost + electricityCost + rentCost;
    const sales = sortedSalesEntries.filter((s) => s.date === profitDate);
    const salesValue = sales.reduce((sum, s) => sum + s.totalValue, 0);
    const salesDozen = sales.reduce((sum, s) => sum + s.quantityDozen, 0);
    return {
      production,
      salesValue,
      salesDozen,
      totalCost,
      electricityCost,
      rentCost,
      profit: salesValue - totalCost,
      costPerDozen: production > 0 ? totalCost / production : 0,
    };
  }, [profitDate, dailyEntries, electricityEntries, rentEntries, monthlyProductionByMonth, sortedSalesEntries]);

  const profitMonthlyView = useMemo(() => {
    const monthEntries = dailyEntries.filter((e) => e.date.startsWith(profitMonth));
    const production = monthEntries.reduce((sum, e) => sum + e.totalProductionDozen, 0);
    const baseCost = monthEntries.reduce((sum, e) => sum + e.totalCost, 0);
    const elec = electricityEntries.find((e) => e.month === profitMonth);
    const electricityCost = elec ? elec.totalBill : 0;
    const rentCost = rentForMonth(profitMonth);
    const totalCost = baseCost + electricityCost + rentCost;
    const sales = sortedSalesEntries.filter((s) => s.date.startsWith(profitMonth));
    const salesValue = sales.reduce((sum, s) => sum + s.totalValue, 0);
    const salesDozen = sales.reduce((sum, s) => sum + s.quantityDozen, 0);
    return {
      production,
      salesValue,
      salesDozen,
      totalCost,
      electricityCost,
      rentCost,
      profit: salesValue - totalCost,
      costPerDozen: production > 0 ? totalCost / production : 0,
    };
  }, [profitMonth, dailyEntries, electricityEntries, rentEntries, sortedSalesEntries]);

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

  function handleAddSale(event: FormEvent<HTMLFormElement>) {
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

  function handleAddDailyEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Yarn rows: sum kg; collect resolved type names (auto-saving any
    // newly-typed "+ Add other…" names into yarnTypes catalog).
    const yarnUsedKg = dailyYarnRows.reduce((s, r) => s + (Number(r.kg) || 0), 0);
    const resolvedYarnTypeNames: string[] = [];
    const newYarnTypesToAdd: string[] = [];
    for (const r of dailyYarnRows) {
      if ((Number(r.kg) || 0) <= 0) continue;
      let name = r.yarnType === "__other__" ? r.otherName.trim() : r.yarnType;
      if (!name) continue;
      if (
        r.yarnType === "__other__"
        && !yarnTypes.some((y) => y.toLowerCase() === name.toLowerCase())
        && !newYarnTypesToAdd.some((y) => y.toLowerCase() === name.toLowerCase())
      ) {
        newYarnTypesToAdd.push(name);
      }
      if (!resolvedYarnTypeNames.includes(name)) resolvedYarnTypeNames.push(name);
    }
    if (newYarnTypesToAdd.length) {
      setYarnTypes((cur) => {
        const merged = [...cur];
        for (const n of newYarnTypesToAdd) {
          if (!merged.some((y) => y.toLowerCase() === n.toLowerCase())) merged.push(n);
        }
        return merged;
      });
    }
    const machineHours = Number(dailyMachineHours);
    const yarnCostPerKg = Number(dailyYarnCostPerKg);
    // Packaging and Iron are entered PER DOZEN. Multiply by total dz.
    const packagingPerDz = Number(dailyPackagingCost);
    const ironPerDz = Number(dailyIronCost);
    const staffBill = Number(dailyStaffBill);
    const totalDzForCosts = dailyRows.reduce((s, r) => s + (Number(r.qty) || 0), 0);
    const packagingCost = (Number.isFinite(packagingPerDz) ? packagingPerDz : 0) * totalDzForCosts;
    const ironCost = (Number.isFinite(ironPerDz) ? ironPerDz : 0) * totalDzForCosts;
    const laborCost = (Number.isFinite(packagingCost) ? packagingCost : 0)
      + (Number.isFinite(ironCost) ? ironCost : 0)
      + (Number.isFinite(staffBill) ? staffBill : 0);

    // Validate rows: each must have a product + positive qty, no duplicate product types.
    const parsedRows = dailyRows.map((r) => ({ ...r, qtyNum: Number(r.qty) }));
    if (parsedRows.length === 0) {
      setDailyError("Add at least one product.");
      return;
    }
    for (const r of parsedRows) {
      if (!r.productType) {
        setDailyError("Choose a product type for every row.");
        return;
      }
      if (!Number.isFinite(r.qtyNum) || r.qtyNum <= 0) {
        setDailyError("Every product row needs a quantity greater than 0.");
        return;
      }
    }
    const seen = new Set<string>();
    for (const r of parsedRows) {
      if (seen.has(r.productType)) {
        setDailyError("Same product type listed twice — combine the rows.");
        return;
      }
      seen.add(r.productType);
    }
    const totalProductionDozen = parsedRows.reduce((s, r) => s + r.qtyNum, 0);

    if (!dailyDate) {
      setDailyError("Enter date.");
      return;
    }
    if (
      !Number.isFinite(yarnUsedKg) || yarnUsedKg < 0 ||
      !Number.isFinite(machineHours) || machineHours < 0 ||
      !Number.isFinite(yarnCostPerKg) || yarnCostPerKg < 0 ||
      !Number.isFinite(laborCost) || laborCost < 0 ||
      !Number.isFinite(packagingCost) || packagingCost < 0 ||
      !Number.isFinite(ironCost) || ironCost < 0 ||
      !Number.isFinite(staffBill) || staffBill < 0
    ) {
      setDailyError("All numbers must be 0 or more.");
      return;
    }

    // Resolve daily yarn type (support inline "Add other")
    const resolvedDailyYarn = resolvedYarnTypeNames.join(", ");

    const now = new Date().toISOString();
    const newDailyEntries: DailyProductionEntry[] = [];
    const newProductionEntries: ProductionEntry[] = [];
    for (const r of parsedRows) {
      const share = totalProductionDozen > 0 ? r.qtyNum / totalProductionDozen : 0;
      const rowYarnKg = yarnUsedKg * share;
      const rowMachineHours = machineHours * share;
      const rowPackaging = packagingCost * share;
      const rowIron = ironCost * share;
      const rowStaff = staffBill * share;
      const rowLabor = laborCost * share;
      // Avoid double-counting: laborCost already includes packaging+iron+staff,
      // so totalCost = yarn + labor share only (which equals yarn + pkg + iron + staff per row).
      const rowTotalCost = rowYarnKg * yarnCostPerKg + rowLabor;
      const rowCostPerDozen = r.qtyNum > 0 ? rowTotalCost / r.qtyNum : 0;
      newDailyEntries.push({
        id: crypto.randomUUID(),
        date: dailyDate,
        totalProductionDozen: r.qtyNum,
        yarnUsedKg: rowYarnKg,
        machineHours: rowMachineHours,
        yarnCostPerKg,
        laborCost: rowLabor,
        packagingCost: rowPackaging,
        ironCost: rowIron,
        staffBill: rowStaff,
        totalCost: rowTotalCost,
        costPerDozen: rowCostPerDozen,
        productType: r.productType,
        ...(resolvedDailyYarn ? { yarnType: resolvedDailyYarn } : {}),
        createdAt: now,
        ...(dailyReceipt ? { receiptImage: dailyReceipt } : {}),
      });
      newProductionEntries.push({
        id: crypto.randomUUID(),
        date: dailyDate,
        productType: r.productType,
        quantityDozen: r.qtyNum,
      });
    }

    setDailyEntries((current) => [...newDailyEntries, ...current]);
    setProductionEntries((current) => [...newProductionEntries, ...current]);

    // Auto-create / update worker + workLog for iron staff and other staff
    // so iron + staff bills flow into Labour Management automatically.
    // Use a local name->id map that includes both existing AND just-staged
    // workers so two names that happen to match don't create duplicates.
    const now2 = new Date().toISOString();
    const newWorkerEntries: Worker[] = [];
    const newWorkLogEntries: WorkLog[] = [];
    const workerPatches: Array<{ id: string; workAt: WorkArea }> = [];
    const nameToId = new Map<string, string>();
    for (const w of workers) nameToId.set(w.name.trim().toLowerCase(), w.id);
    function resolveWorker(name: string, area: WorkArea): string {
      const key = name.toLowerCase();
      const existingId = nameToId.get(key);
      if (existingId) {
        const existing = workers.find((w) => w.id === existingId);
        if (existing && existing.workAt !== area) {
          workerPatches.push({ id: existingId, workAt: area });
        }
        return existingId;
      }
      const id = crypto.randomUUID();
      nameToId.set(key, id);
      newWorkerEntries.push({ id, name, payType: "daily", rate: 1, workAt: area, createdAt: now2 });
      return id;
    }
    const ironName = dailyIronStaff.trim();
    if (ironName && ironCost > 0) {
      const workerId = resolveWorker(ironName, "iron");
      newWorkLogEntries.push({ id: crypto.randomUUID(), workerId, date: dailyDate, amount: ironCost, note: "Iron finishing", createdAt: now2 });
    }
    const staffName = dailyStaffName.trim();
    if (staffName && staffBill > 0) {
      const workerId = resolveWorker(staffName, dailyStaffArea);
      newWorkLogEntries.push({ id: crypto.randomUUID(), workerId, date: dailyDate, amount: staffBill, note: `Staff bill (${workAreaLabels[dailyStaffArea]})`, createdAt: now2 });
    }
    if (newWorkerEntries.length > 0 || workerPatches.length > 0) {
      setWorkers((cur) => {
        let next = cur;
        if (workerPatches.length > 0) {
          const patchMap = new Map(workerPatches.map((p) => [p.id, p.workAt]));
          next = next.map((w) => patchMap.has(w.id) ? { ...w, workAt: patchMap.get(w.id)! } : w);
        }
        if (newWorkerEntries.length > 0) {
          next = [...newWorkerEntries, ...next];
        }
        return next;
      });
    }
    if (newWorkLogEntries.length > 0) setWorkLogs((cur) => [...newWorkLogEntries, ...cur]);

    setDailyRows([{ id: crypto.randomUUID(), productType: "short-socks", qty: "" }]);
    setDailyYarnRows([{ id: crypto.randomUUID(), yarnType: "", otherName: "", kg: "" }]);
    setDailyMachineHours("");
    setDailyYarnCostPerKg("");
    setDailyLaborCost("");
    setDailyPackagingCost("");
    setDailyIronCost("");
    setDailyStaffBill("");
    setDailyIronStaff("");
    setDailyStaffName("");
    setDailyDate(getToday());
    setDailyReceipt(undefined);
    setDailyError("");
    setDailyConfirm(newDailyEntries.length > 1 ? `Saved ${newDailyEntries.length} entries.` : "Saved.");
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

  function handleAddElectricity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setElectricityError("");
    setElectricityConfirm("");
    const bill = Number(electricityBill);
    if (!electricityMonth || !Number.isFinite(bill) || bill <= 0) {
      setElectricityError("Enter a month and a valid bill amount.");
      return;
    }
    setElectricityEntries((current) => {
      const filtered = current.filter((e) => e.month !== electricityMonth);
      return [
        {
          id: crypto.randomUUID(),
          month: electricityMonth,
          totalBill: bill,
          createdAt: new Date().toISOString(),
          ...(electricityReceipt ? { receiptImage: electricityReceipt } : {}),
        },
        ...filtered,
      ];
    });
    setElectricityBill("");
    setElectricityReceipt(undefined);
    setElectricityConfirm(`Saved ${formatMonthLabel(electricityMonth)} electricity bill.`);
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

  // ===== Report data builder =====
  const totalYarnPurchasedKg = yarnPurchases.reduce((s, p) => s + p.kg, 0);
  const totalYarnUsedFromDailyKg = dailyEntries.reduce((s, e) => s + (e.yarnUsedKg || 0), 0);
  const totalYarnUsedAllKg = totalYarnUsedKg + totalYarnUsedFromDailyKg;
  const remainingYarnAvailableKg = Math.max(0, (yarnStockKg + totalYarnPurchasedKg) - totalYarnUsedAllKg);
  const yarnEfficiency = totalYarnPurchasedKg + yarnStockKg > 0
    ? (totalYarnUsedAllKg / (totalYarnPurchasedKg + yarnStockKg)) * 100
    : 0;
  const futureYarnNeed = useMemo(() => {
    let total = 0;
    for (const id of allProductTypeIds) {
      const stock = inventory[id] || 0;
      const perDz = yarnPerDozen[id] || 0;
      total += stock * perDz;
    }
    return total;
  }, [inventory, yarnPerDozen, allProductTypeIds]);

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
        date: s.date, customerName: s.customerName, productType: s.productType,
        quantityDozen: s.quantityDozen, totalValue: s.totalValue,
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
      electricity: electricityEntries.map((e) => ({ month: e.month, totalBill: e.totalBill })),
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
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Overview of operations, sales, and inventory.</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
          <Dialog open={quickSaleOpen} onOpenChange={(open) => { setQuickSaleOpen(open); if (!open) setQuickSaleConfirm(""); }}>
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
                onSubmit={(event) => {
                  event.preventDefault();
                  const qty = Number(saleQuantity);
                  const total = Number(saleTotalAmount);
                  if (!customerName.trim() || !Number.isFinite(qty) || qty <= 0 || !Number.isFinite(total) || total <= 0) {
                    setSaleError("Enter customer, quantity, and total.");
                    return;
                  }
                  if (qty > (inventory[saleProductType] ?? 0)) {
                    setSaleError(`Only ${(inventory[saleProductType] ?? 0).toLocaleString()} dz available.`);
                    return;
                  }
                  const entry: SaleEntry = {
                    id: crypto.randomUUID(),
                    customerName: customerName.trim(),
                    productType: saleProductType,
                    quantityDozen: qty,
                    pricePerDozen: total / qty,
                    totalValue: total,
                    createdAt: new Date().toISOString(),
                    date: saleDate || getToday(),
                    ...(saleReceipt ? { receiptImage: saleReceipt } : {}),
                  };
                  setSalesEntries((cur) => [entry, ...cur]);
                  setCustomerName("");
                  setSaleQuantity("");
                  setSaleTotalAmount("");
                  setSaleProductType("short-socks");
                  setSaleReceipt(undefined);
                  setSaleError("");
                  setQuickSaleConfirm("Sale added.");
                  setTimeout(() => { setQuickSaleConfirm(""); setQuickSaleOpen(false); }, 800);
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="quick-customer">Customer name</label>
                  <Input
                    id="quick-customer"
                    className="h-12 text-base"
                    placeholder="Customer name"
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="quick-quantity">Dozen</label>
                    <Input
                      id="quick-quantity"
                      type="number"
                      min="1"
                      step="1"
                      inputMode="numeric"
                      className="h-12 text-base"
                      placeholder="0"
                      value={saleQuantity}
                      onChange={(event) => setSaleQuantity(event.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="quick-total">Total amount</label>
                    <Input
                      id="quick-total"
                      type="number"
                      min="1"
                      step="0.01"
                      inputMode="decimal"
                      className="h-12 text-base"
                      placeholder="0"
                      value={saleTotalAmount}
                      onChange={(event) => setSaleTotalAmount(event.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="quick-product">Product type</label>
                  <Select value={saleProductType} onValueChange={(value) => setSaleProductType(value as ProductType)}>
                    <SelectTrigger id="quick-product" className="h-12 text-base">
                      <SelectValue placeholder="Choose product" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(productTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {Number(saleQuantity) > 0 && Number(saleTotalAmount) > 0 && (
                  <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                    Auto: Tk {(Number(saleTotalAmount) / Number(saleQuantity)).toLocaleString(undefined, { maximumFractionDigits: 2 })} per dozen
                  </p>
                )}
                {saleError && (
                  <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{saleError}</p>
                )}
                {quickSaleConfirm && (
                  <p className="rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-800">{quickSaleConfirm}</p>
                )}
                <ReceiptCapture value={saleReceipt} onChange={setSaleReceipt} />
                <Button type="submit" size="lg" className="h-14 w-full text-base font-semibold">
                  <Plus className="h-5 w-5" />
                  Save Sale
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
                    <p className="mt-1 sm:mt-1.5 w-full text-base sm:text-xl lg:text-2xl font-bold leading-none truncate">{(inventory[id] || 0).toLocaleString()}<span className="ml-0.5 text-[9px] sm:text-xs lg:text-sm font-medium text-muted-foreground"> dz</span></p>
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
                    <p className="mt-1 sm:mt-1.5 w-full text-base sm:text-xl lg:text-2xl font-bold leading-none truncate">{(salesByType[id] || 0).toLocaleString()}<span className="ml-0.5 text-[9px] sm:text-xs lg:text-sm font-medium text-muted-foreground"> dz</span></p>
                  </div>
                ))}
              </div>
            </div>

            {(() => {
              const dailyProfit = todaySalesValue - todayTotalCost;
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
                        <p className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{totalProfit >= 0 ? "Total profit" : "Total loss"}</p>
                        <p
                          className={`mt-1 sm:mt-2 text-xl sm:text-3xl font-bold leading-tight truncate ${totalProfit >= 0 ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}
                          style={{ textShadow: "0 1px 0 rgba(255,255,255,0.6)" }}
                        >
                          {totalProfit < 0 ? "−" : ""}Tk {Math.abs(totalProfit).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </p>
                        <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">{totalProfit >= 0 ? "Sales − cost" : "Cost exceeds sales"}</p>
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
                        <p className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{dailyProfit >= 0 ? "Daily profit" : "Daily loss"}</p>
                        <p
                          className={`mt-1 sm:mt-2 text-xl sm:text-3xl font-bold leading-tight truncate ${dailyProfit >= 0 ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}
                          style={{ textShadow: "0 1px 0 rgba(255,255,255,0.6)" }}
                        >
                          {dailyProfit < 0 ? "−" : ""}Tk {Math.abs(dailyProfit).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </p>
                        <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">Today's sales − cost</p>
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
            <form onSubmit={handleAddDailyEntry} className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="daily-date">Date</label>
                <Input
                  id="daily-date"
                  type="date"
                  className="h-12 text-base"
                  value={dailyDate}
                  onChange={(event) => setDailyDate(event.target.value)}
                  max={getToday()}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Products produced today</label>
                  <span className="text-xs text-muted-foreground">{dailyRows.length} {dailyRows.length === 1 ? "product" : "products"}</span>
                </div>
                <div className="space-y-2">
                  {dailyRows.map((row, idx) => (
                    <div key={row.id} className="flex items-end gap-2">
                      <div className="flex-1 space-y-1">
                        <label className="text-xs text-muted-foreground" htmlFor={`daily-row-type-${row.id}`}>Product</label>
                        <Select
                          value={row.productType}
                          onValueChange={(value) =>
                            setDailyRows((rows) => rows.map((r, i) => i === idx ? { ...r, productType: value as ProductType } : r))
                          }
                        >
                          <SelectTrigger id={`daily-row-type-${row.id}`} className="h-12 text-base">
                            <SelectValue placeholder="Choose product" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(productTypeLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-28 space-y-1">
                        <label className="text-xs text-muted-foreground" htmlFor={`daily-row-qty-${row.id}`}>Qty (dz)</label>
                        <Input
                          id={`daily-row-qty-${row.id}`}
                          type="number"
                          min="0"
                          step="1"
                          inputMode="numeric"
                          className="h-12 text-base"
                          placeholder="0"
                          value={row.qty}
                          onChange={(e) =>
                            setDailyRows((rows) => rows.map((r, i) => i === idx ? { ...r, qty: e.target.value } : r))
                          }
                          required
                        />
                      </div>
                      {dailyRows.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-12 w-12 shrink-0"
                          aria-label="Remove product"
                          onClick={() => setDailyRows((rows) => rows.filter((_, i) => i !== idx))}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setDailyRows((rows) => [...rows, { id: crypto.randomUUID(), productType: "short-socks", qty: "" }])}
                >
                  <Plus className="h-4 w-4" /> Add another product
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Yarn used today</label>
                  <span className="text-xs text-muted-foreground">
                    {dailyYarnRows.reduce((s, r) => s + (Number(r.kg) || 0), 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} kg total
                  </span>
                </div>
                <div className="space-y-2">
                  {dailyYarnRows.map((row, idx) => (
                    <div key={row.id} className="space-y-1">
                      <div className="flex items-end gap-2">
                        <div className="flex-1 space-y-1">
                          <label className="text-xs text-muted-foreground" htmlFor={`daily-yarn-type-${row.id}`}>Yarn type</label>
                          <Select
                            value={row.yarnType}
                            onValueChange={(v) =>
                              setDailyYarnRows((rows) => rows.map((r, i) => i === idx ? { ...r, yarnType: v, ...(v === "__other__" ? {} : { otherName: "" }) } : r))
                            }
                          >
                            <SelectTrigger id={`daily-yarn-type-${row.id}`} className="h-12 text-base">
                              <SelectValue placeholder="Choose yarn" />
                            </SelectTrigger>
                            <SelectContent>
                              {yarnTypes.map((t) => (
                                <SelectItem key={t} value={t}>{t}</SelectItem>
                              ))}
                              <SelectItem value="__other__">+ Add other…</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-28 space-y-1">
                          <label className="text-xs text-muted-foreground" htmlFor={`daily-yarn-kg-${row.id}`}>Kg</label>
                          <Input
                            id={`daily-yarn-kg-${row.id}`}
                            type="number"
                            min="0"
                            step="0.01"
                            inputMode="decimal"
                            className="h-12 text-base"
                            placeholder="0"
                            value={row.kg}
                            onChange={(e) =>
                              setDailyYarnRows((rows) => rows.map((r, i) => i === idx ? { ...r, kg: e.target.value } : r))
                            }
                          />
                        </div>
                        {dailyYarnRows.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-12 w-12 shrink-0 p-0 text-muted-foreground hover:text-red-600"
                            onClick={() => setDailyYarnRows((rows) => rows.filter((_, i) => i !== idx))}
                            aria-label="Remove yarn row"
                          >
                            ×
                          </Button>
                        )}
                      </div>
                      {row.yarnType === "__other__" && (
                        <Input
                          className="h-12 text-base"
                          placeholder="New yarn type (e.g. Green)"
                          value={row.otherName}
                          onChange={(e) =>
                            setDailyYarnRows((rows) => rows.map((r, i) => i === idx ? { ...r, otherName: e.target.value } : r))
                          }
                        />
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-10"
                  onClick={() => setDailyYarnRows((rows) => [...rows, { id: crypto.randomUUID(), yarnType: "", otherName: "", kg: "" }])}
                >
                  + Add another yarn
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-muted-foreground whitespace-nowrap" htmlFor="daily-machine">Machine Hours</label>
                <Input
                  id="daily-machine"
                  type="number"
                  min="0"
                  step="0.1"
                  inputMode="decimal"
                  className="h-9 w-24 text-sm"
                  placeholder="0"
                  value={dailyMachineHours}
                  onChange={(event) => setDailyMachineHours(event.target.value)}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold">Packaging</p>
                  <p className="text-xs text-muted-foreground">Cost per dozen — multiplied by today's total dz.</p>
                  <Input
                    id="daily-packaging"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    className="h-12 text-base mt-1"
                    placeholder="Tk per dz"
                    value={dailyPackagingCost}
                    onChange={(event) => setDailyPackagingCost(event.target.value)}
                  />
                </div>

                <div className="rounded-xl border p-3 space-y-2">
                  <p className="text-sm font-semibold">Iron finishing</p>
                  <p className="text-xs text-muted-foreground">Per dozen rate × today's total dz. Staff name auto-saves to Labour management.</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      id="daily-iron"
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      className="h-12 text-base"
                      placeholder="Tk per dz"
                      value={dailyIronCost}
                      onChange={(event) => setDailyIronCost(event.target.value)}
                    />
                    <Input
                      id="daily-iron-staff"
                      list="iron-staff-names"
                      className="h-12 text-base"
                      placeholder="Staff name"
                      value={dailyIronStaff}
                      onChange={(event) => setDailyIronStaff(event.target.value)}
                    />
                    <datalist id="iron-staff-names">
                      {workers.filter((w) => w.workAt === "iron").map((w) => (
                        <option key={w.id} value={w.name} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="rounded-xl border p-3 space-y-2">
                  <p className="text-sm font-semibold">Staff bill (other)</p>
                  <p className="text-xs text-muted-foreground">Total amount + who got paid + where they work. Auto-saves to Labour management.</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      id="daily-staff"
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      className="h-12 text-base"
                      placeholder="Total Tk"
                      value={dailyStaffBill}
                      onChange={(event) => setDailyStaffBill(event.target.value)}
                    />
                    <Input
                      id="daily-staff-name"
                      list="staff-names"
                      className="h-12 text-base"
                      placeholder="Staff name"
                      value={dailyStaffName}
                      onChange={(event) => setDailyStaffName(event.target.value)}
                    />
                    <datalist id="staff-names">
                      {workers.map((w) => (
                        <option key={w.id} value={w.name} />
                      ))}
                    </datalist>
                    <Select value={dailyStaffArea} onValueChange={(v) => setDailyStaffArea(v as WorkArea)}>
                      <SelectTrigger className="h-12 text-base col-span-2">
                        <SelectValue placeholder="Work area" />
                      </SelectTrigger>
                      <SelectContent>
                        {workAreaOrder.map((a) => (
                          <SelectItem key={a} value={a}>{workAreaLabels[a]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Live forward preview — recomputes the moment any input
                  changes so admins see what this single entry will
                  save. Forward-only: yarn kg × rate, plus packaging
                  + iron + staff, divided by qty. No back-solving. */}
              {(() => {
                const qty = dailyRows.reduce((s, r) => s + (Number(r.qty) || 0), 0);
                const yKg = dailyYarnRows.reduce((s, r) => s + (Number(r.kg) || 0), 0);
                const yRate = Number(dailyYarnCostPerKg) || 0;
                const pkgPerDz = Number(dailyPackagingCost) || 0;
                const ironPerDz = Number(dailyIronCost) || 0;
                const staff = Number(dailyStaffBill) || 0;
                const pkg = pkgPerDz * qty;
                const iron = ironPerDz * qty;
                const yarnCost = yKg * yRate;
                const total = yarnCost + pkg + iron + staff;
                const perDz = qty > 0 ? total / qty : 0;
                return (
                  <div className="rounded-xl border bg-primary/5 p-3 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Yarn cost</p>
                      <p className="text-sm font-bold">Tk {yarnCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Total</p>
                      <p className="text-sm font-bold">Tk {total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Tk / dz</p>
                      <p className="text-sm font-bold">Tk {perDz.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                );
              })()}

              {dailyError && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{dailyError}</p>
              )}
              {dailyConfirm && (
                <p className="rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-800">{dailyConfirm}</p>
              )}

              <ReceiptCapture value={dailyReceipt} onChange={setDailyReceipt} label="Add documents photo (optional)" />

              <Button type="submit" size="lg" className="h-14 w-full text-base font-semibold">
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
                      className="mt-1 sm:mt-2 text-xl sm:text-3xl font-bold leading-tight truncate text-green-700 dark:text-green-300"
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
                      className="mt-1 sm:mt-2 text-xl sm:text-3xl font-bold leading-tight truncate text-green-700 dark:text-green-300"
                      style={{ textShadow: "0 1px 0 rgba(255,255,255,0.6)" }}
                    >
                      Tk {todayTotalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
                <div
                  className="relative mt-3 sm:mt-4 pt-3 sm:pt-4"
                  style={{
                    borderTop:
                      "1px solid transparent",
                    backgroundImage:
                      "linear-gradient(to right, transparent, rgba(0,0,0,0.12), transparent)",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "100% 1px",
                    backgroundPosition: "top",
                  }}
                >
                  <p className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Cost per dozen</p>
                  <p
                    className="mt-1 sm:mt-2 text-xl sm:text-3xl font-bold leading-tight truncate text-green-700 dark:text-green-300"
                    style={{ textShadow: "0 1px 0 rgba(255,255,255,0.6)" }}
                  >
                    Tk {todayCostPerDozen.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
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
                    description="Edit any field of a saved daily production entry. Total cost and cost-per-dozen auto-recalculate."
                    triggerLabel="Edit"
                    entries={sortedDailyEntries}
                    onDelete={(id) => setDailyEntries((prev) => prev.filter((x) => x.id !== id))}
                    editFields={[
                      { key: "date", label: "Date", type: "date" },
                      { key: "totalProductionDozen", label: "Production (dz)", type: "number" },
                      { key: "yarnUsedKg", label: "Yarn used (kg)", type: "number" },
                      { key: "yarnCostPerKg", label: "Yarn cost per kg (Tk)", type: "number" },
                      { key: "machineHours", label: "Machine hours", type: "number" },
                      { key: "packagingCost", label: "Packaging cost (Tk)", type: "number" },
                      { key: "ironCost", label: "Iron cost (Tk)", type: "number" },
                      { key: "staffBill", label: "Staff bill (Tk)", type: "number" },
                      { key: "yarnType", label: "Yarn type", type: "text" },
                    ]}
                    onSave={(id, patch) => setDailyEntries((prev) => prev.map((e) => {
                      if (e.id !== id) return e;
                      const merged = { ...e, ...patch };
                      const yarn = (Number(merged.yarnUsedKg) || 0) * (Number(merged.yarnCostPerKg) || 0);
                      const pkg = Number(merged.packagingCost) || 0;
                      const iron = Number(merged.ironCost) || 0;
                      const staff = Number(merged.staffBill) || 0;
                      merged.laborCost = pkg + iron + staff;
                      merged.totalCost = yarn + merged.laborCost;
                      const dz = Number(merged.totalProductionDozen) || 0;
                      merged.costPerDozen = dz > 0 ? merged.totalCost / dz : 0;
                      return merged;
                    }))}
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
                    <p className="relative text-[12px] sm:text-sm font-semibold truncate leading-tight mt-0.5">
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
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="daily-sale-date">Date</label>
                <Input
                  id="daily-sale-date"
                  type="date"
                  className="h-12 text-base max-w-xs"
                  value={saleDate}
                  onChange={(event) => setSaleDate(event.target.value)}
                  max={getToday()}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="daily-sale-customer">Customer name</label>
                <Input
                  id="daily-sale-customer"
                  className="h-12 text-base"
                  placeholder="e.g. Karim"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border bg-muted/20 px-3 py-2">
                <div>
                  <p className="text-sm font-medium">Don't have full details?</p>
                  <p className="text-xs text-muted-foreground">Just enter the total amount sold to this customer.</p>
                </div>
                <Button type="button" variant={saleSimpleMode ? "default" : "outline"} size="sm" onClick={() => setSaleSimpleMode((v) => !v)}>
                  {saleSimpleMode ? "On" : "Off"}
                </Button>
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
                      <div key={row.id} className="rounded-xl border p-2 space-y-2">
                        <div className="flex items-end gap-2">
                          <div className="flex-1 space-y-1">
                            <label className="text-xs text-muted-foreground">Product</label>
                            <Select
                              value={row.productType}
                              onValueChange={(value) =>
                                setSaleRows((rows) => rows.map((r, i) => i === idx ? { ...r, productType: value as ProductType } : r))
                              }
                            >
                              <SelectTrigger className="h-12 text-base">
                                <SelectValue placeholder="Choose product" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(productTypeLabels).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>{label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {saleRows.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-12 w-12 shrink-0"
                              aria-label="Remove item"
                              onClick={() => setSaleRows((rows) => rows.filter((_, i) => i !== idx))}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Qty (dz)</label>
                            <Input
                              type="number"
                              min="1"
                              step="1"
                              inputMode="numeric"
                              className="h-12 text-base"
                              placeholder="0"
                              value={row.qty}
                              onChange={(e) =>
                                setSaleRows((rows) => rows.map((r, i) => i === idx ? { ...r, qty: e.target.value } : r))
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Total Tk</label>
                            <Input
                              type="number"
                              min="1"
                              step="0.01"
                              inputMode="decimal"
                              className="h-12 text-base"
                              placeholder="0"
                              value={row.total}
                              onChange={(e) =>
                                setSaleRows((rows) => rows.map((r, i) => i === idx ? { ...r, total: e.target.value } : r))
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Tk / dz</label>
                            <Input
                              readOnly
                              className="h-12 text-base bg-muted/30 font-semibold"
                              value={`Tk ${(Number(row.qty) > 0 && Number(row.total) > 0 ? Number(row.total) / Number(row.qty) : 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                            />
                          </div>
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

        <Card className="border-2 border-primary/40 shadow-lg bg-gradient-to-br from-primary/5 to-background">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2"><TrendingUp className="h-6 w-6 text-primary" /> Profit Dashboard</CardTitle>
            <CardDescription>Live view of your production, sales, costs, and profit.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={profitTab} onValueChange={(v) => setProfitTab(v as "daily" | "monthly")} className="space-y-5">
              <TabsList className="grid w-full grid-cols-2 h-12">
                <TabsTrigger value="daily" className="text-base">Daily View</TabsTrigger>
                <TabsTrigger value="monthly" className="text-base">Monthly View</TabsTrigger>
              </TabsList>

              <TabsContent value="daily" className="space-y-5">
                <div className="space-y-2 max-w-xs">
                  <label className="text-sm font-medium" htmlFor="profit-daily-date">Date</label>
                  <Input
                    id="profit-daily-date"
                    type="date"
                    className="h-12 text-base"
                    value={profitDate}
                    onChange={(e) => setProfitDate(e.target.value)}
                    max={getToday()}
                  />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="rounded-lg border bg-card p-1.5 sm:p-2 min-h-[44px] flex flex-col justify-center box-border">
                    <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wide text-muted-foreground truncate leading-tight">Production</p>
                    <p className="text-[12px] sm:text-sm font-semibold truncate leading-tight">{profitDailyView.production.toLocaleString()} <span className="text-[10px] font-normal text-muted-foreground">dz</span></p>
                  </div>
                  <div className="rounded-lg border bg-card p-1.5 sm:p-2 min-h-[44px] flex flex-col justify-center box-border">
                    <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wide text-muted-foreground truncate leading-tight">Total sales</p>
                    <p className="text-[12px] sm:text-sm font-semibold truncate leading-tight">Tk {profitDailyView.salesValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="rounded-lg border bg-card p-1.5 sm:p-2 min-h-[44px] flex flex-col justify-center box-border">
                    <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wide text-muted-foreground truncate leading-tight">Total cost</p>
                    <p className="text-[12px] sm:text-sm font-semibold truncate leading-tight">Tk {profitDailyView.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className={`rounded-lg border p-1.5 sm:p-2 min-h-[44px] flex flex-col justify-center box-border ${profitDailyView.profit >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                    <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wide text-muted-foreground truncate leading-tight">Profit</p>
                    <p className={`text-[12px] sm:text-sm font-semibold truncate leading-tight ${profitDailyView.profit >= 0 ? "text-green-700" : "text-red-700"}`}>Tk {profitDailyView.profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="monthly" className="space-y-5">
                <div className="space-y-2 max-w-xs">
                  <label className="text-sm font-medium" htmlFor="profit-monthly-month">Month</label>
                  <Input
                    id="profit-monthly-month"
                    type="month"
                    className="h-12 text-base"
                    value={profitMonth}
                    onChange={(e) => setProfitMonth(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="rounded-lg border bg-card p-1.5 sm:p-2 min-h-[44px] flex flex-col justify-center box-border">
                    <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wide text-muted-foreground truncate leading-tight">Production</p>
                    <p className="text-[12px] sm:text-sm font-semibold truncate leading-tight">{profitMonthlyView.production.toLocaleString()} <span className="text-[10px] font-normal text-muted-foreground">dz</span></p>
                  </div>
                  <div className="rounded-lg border bg-card p-1.5 sm:p-2 min-h-[44px] flex flex-col justify-center box-border">
                    <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wide text-muted-foreground truncate leading-tight">Total sales</p>
                    <p className="text-[12px] sm:text-sm font-semibold truncate leading-tight">Tk {profitMonthlyView.salesValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="rounded-lg border bg-card p-1.5 sm:p-2 min-h-[44px] flex flex-col justify-center box-border">
                    <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wide text-muted-foreground truncate leading-tight">Total cost</p>
                    <p className="text-[12px] sm:text-sm font-semibold truncate leading-tight">Tk {profitMonthlyView.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className={`rounded-lg border p-1.5 sm:p-2 min-h-[44px] flex flex-col justify-center box-border ${profitMonthlyView.profit >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                    <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wide text-muted-foreground truncate leading-tight">Profit</p>
                    <p className={`text-[12px] sm:text-sm font-semibold truncate leading-tight ${profitMonthlyView.profit >= 0 ? "text-green-700" : "text-red-700"}`}>Tk {profitMonthlyView.profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card id="electricity" className="border-2 border-primary/30 shadow-md scroll-mt-24">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2"><Zap className="h-6 w-6 text-primary" /> Monthly Cost (Electricity)</CardTitle>
            <CardDescription>Save monthly electricity bill. Cost per dozen calculates automatically.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleAddElectricity} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="elec-month">Month</label>
                  <Input
                    id="elec-month"
                    type="month"
                    className="h-12 text-base"
                    value={electricityMonth}
                    onChange={(e) => setElectricityMonth(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="elec-bill">Total electricity bill</label>
                  <Input
                    id="elec-bill"
                    type="number"
                    min="1"
                    step="0.01"
                    inputMode="decimal"
                    className="h-12 text-base"
                    placeholder="0"
                    value={electricityBill}
                    onChange={(e) => setElectricityBill(e.target.value)}
                    required
                  />
                </div>
              </div>
              {electricityError && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{electricityError}</p>}
              {electricityConfirm && <p className="rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-800">{electricityConfirm}</p>}
              <ReceiptCapture value={electricityReceipt} onChange={setElectricityReceipt} label="Electricity bill photo (optional)" />
              <Button type="submit" size="lg" className="h-14 w-full text-base font-semibold">
                <Plus className="h-5 w-5" /> Save monthly bill
              </Button>
            </form>

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
                  <div className="space-y-2">
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

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Monthly history</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{electricityWithCalc.length} months</span>
                  {sortedElectricityEntries.length > 0 && <ManageEntriesDialog
                    title="Manage electricity bills"
                    description="Edit the month or total bill, or delete a saved entry."
                    triggerLabel="Edit"
                    entries={sortedElectricityEntries}
                    onDelete={(id) => setElectricityEntries((prev) => prev.filter((x) => x.id !== id))}
                    editFields={[
                      { key: "month", label: "Month (YYYY-MM)", type: "text" },
                      { key: "totalBill", label: "Total bill (Tk)", type: "number" },
                    ]}
                    onSave={(id, patch) => setElectricityEntries((prev) => prev.map((e) => e.id === id ? { ...e, ...patch } : e))}
                    columns={[
                      { header: "Month", render: (e) => formatMonthLabel(e.month) },
                      { header: "Bill", render: (e) => `Tk ${e.totalBill.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, className: "text-right" },
                    ]}
                  />}
                </div>
              </div>
              {electricityWithCalc.length > 0 ? (
                <div className="space-y-2">
                  {electricityWithCalc.map((entry) => (
                    <div key={entry.id} className="grid gap-2 rounded-xl border bg-card/60 p-4 sm:grid-cols-[1fr_1fr_1fr_1fr_auto]">
                      <div>
                        <p className="text-xs text-muted-foreground">Month</p>
                        <p className="text-base font-semibold">{formatMonthLabel(entry.month)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total bill</p>
                        <p className="text-base font-bold">Tk {entry.totalBill.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Production</p>
                        <p className="text-base font-semibold">{entry.monthlyProduction.toLocaleString()} dz</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Cost / dozen</p>
                        <p className="text-base font-bold">Tk {entry.costPerDozen.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                      </div>
                      <div className="flex items-center justify-end"><ReceiptThumb src={entry.receiptImage} size={40} /></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed p-5 text-center">
                  <p className="text-sm font-medium">No electricity bills saved yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Add this month's bill above.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card id="yarn-calculation" className="border-2 border-primary/30 shadow-md scroll-mt-24">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2"><Wrench className="h-6 w-6 text-primary" /> Yarn Calculation</CardTitle>
            <CardDescription>Track yarn purchased, used, remaining, efficiency, and future needs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 lg:gap-3">
              {(() => {
                // Same liter-green glass treatment as the profit/
                // production cards above, applied to each yarn stat.
                // The "Future need" tile gets a warm amber tint
                // instead of green so it still reads as a soft
                // warning at a glance.
                const tiles: Array<{
                  key: string;
                  label: string;
                  value: string;
                  hint?: string;
                  tone: "green" | "amber";
                }> = [
                  { key: "purchased", label: "Purchased", value: `${totalYarnPurchasedKg.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg`, tone: "green" },
                  { key: "used",      label: "Used (total)", value: `${totalYarnUsedAllKg.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg`, tone: "green" },
                  { key: "remaining", label: "Remaining", value: `${remainingYarnAvailableKg.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg`, tone: "green" },
                  { key: "efficiency", label: "Efficiency", value: `${yarnEfficiency.toFixed(1)}%`, tone: "green" },
                  { key: "future",    label: "Future need", value: `${futureYarnNeed.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg`, hint: "For current stock", tone: "amber" },
                ];
                const ringByTone: Record<"green" | "amber", string> = {
                  green: "linear-gradient(135deg, rgba(74,222,128,0.12) 0%, rgba(255,255,255,0.08) 50%, rgba(74,222,128,0.1) 100%)",
                  amber: "linear-gradient(135deg, rgba(253,224,180,0.7) 0%, rgba(255,255,255,0.2) 50%, rgba(253,224,180,0.6) 100%)",
                };
                const haloByTone: Record<"green" | "amber", string> = {
                  green: "radial-gradient(circle, rgba(34,197,94,0.04) 0%, transparent 70%)",
                  amber: "radial-gradient(circle, rgba(245,158,11,0.22) 0%, transparent 70%)",
                };
                return tiles.map((tile) => (
                  <div
                    key={tile.key}
                    className="stat-glass relative rounded-2xl p-[1px] shadow-[0_10px_28px_-18px_rgba(0,0,0,0.35)]"
                    style={{ background: ringByTone[tile.tone] }}
                  >
                    <div
                      className="relative rounded-[15px] overflow-hidden p-4 bg-emerald-50/8 dark:bg-emerald-950/8 h-full"
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
                            "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 100%)",
                        }}
                      />
                      <div
                        aria-hidden
                        className="absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-40 pointer-events-none blur-3xl"
                        style={{ background: haloByTone[tile.tone] }}
                      />
                      <p className="relative text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{tile.label}</p>
                      <p
                        className="relative text-2xl font-bold mt-1 leading-tight truncate"
                        style={{ textShadow: "0 1px 0 rgba(255,255,255,0.55)" }}
                      >
                        {tile.value}
                      </p>
                      {tile.hint && (
                        <p className="relative text-[10px] text-muted-foreground mt-1">{tile.hint}</p>
                      )}
                    </div>
                  </div>
                ));
              })()}
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
                      {yarnTypes.map((t) => (
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
                  <div className="rounded-2xl border divide-y max-h-64 overflow-y-auto">
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

            <Separator />

            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Yarn per dozen (kg)</h3>
              <p className="text-xs text-muted-foreground">Average yarn consumed to produce 1 dozen of each product.</p>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 lg:gap-3">
                {allProductTypeIds.map((id) => (
                  <div key={id} className="space-y-2">
                    <label className="text-sm font-medium" htmlFor={`ypd-${id}`}>{productTypeLabels[id] || id}</label>
                    <Input
                      id={`ypd-${id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      className="h-12 text-base"
                      value={yarnPerDozen[id] ?? ""}
                      onChange={(e) => setYarnPerDozen((prev) => ({ ...prev, [id]: Number(e.target.value) || 0 }))}
                    />
                  </div>
                ))}
              </div>
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
                <p className="text-[13px] sm:text-base font-semibold truncate">Tk {totalPaidAll.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
              <div className={`rounded-lg border p-2 sm:p-3 min-h-[55px] flex flex-col justify-center box-border ${totalRemainingAll > 0 ? "bg-orange-50 border-orange-200" : "bg-green-50 border-green-200"}`}>
                <p className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wide text-muted-foreground truncate">Remaining due</p>
                <p className={`text-[13px] sm:text-base font-semibold truncate ${totalRemainingAll > 0 ? "text-orange-700" : "text-green-700"}`}>Tk {totalRemainingAll.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
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
                      <p className="text-[13px] sm:text-base font-semibold truncate">Tk {billAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="rounded-lg border bg-primary/5 p-2 sm:p-3 min-h-[55px] flex flex-col justify-center box-border">
                      <p className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wide text-muted-foreground truncate">Total bill</p>
                      <p className="text-[13px] sm:text-base font-semibold truncate">Tk {dueAfter.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
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
