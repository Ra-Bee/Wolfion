import { AdminLayout } from "@/components/admin-layout";
import { adminMetrics } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, DollarSign, Package, Factory, TrendingUp, Plus, Zap, X, MoreVertical, FileDown, Users, Wrench, LogOut as LogOutIcon, ChevronRight, Trash2 } from "lucide-react";
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
import { useEffect, useMemo, useState, type FormEvent } from "react";

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
};

type ElectricityEntry = {
  id: string;
  month: string;
  totalBill: number;
  createdAt: string;
};

type Worker = {
  id: string;
  name: string;
  payType: "daily" | "per_unit";
  rate: number;
  createdAt: string;
};

type WorkLog = {
  id: string;
  workerId: string;
  date: string;
  amount: number;
  createdAt: string;
};

type WorkerPayment = {
  id: string;
  workerId: string;
  date: string;
  amount: number;
  createdAt: string;
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
  createdAt: string;
};

type YarnPerDozen = Record<string, number>;
const yarnPerDozenStorageKey = "wolfion_yarn_per_dozen";
const defaultYarnPerDozen: YarnPerDozen = {
  "short-socks": 0.5,
  "ankle-socks": 0.6,
  "kids-socks": 0.4,
  "others": 0.55,
};
const yarnPurchasesStorageKey = "wolfion_yarn_purchases";
type YarnPurchase = { id: string; date: string; kg: number; createdAt: string };

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
  const [productTypes, setProductTypes] = useState<ProductTypeOption[]>(() => {
    try {
      const stored = localStorage.getItem(productTypesStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as ProductTypeOption[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      /* fallthrough */
    }
    return defaultProductTypes;
  });
  const [newProductTypeName, setNewProductTypeName] = useState("");
  const [productTypeError, setProductTypeError] = useState("");
  const [productionEntries, setProductionEntries] = useState<ProductionEntry[]>(() => {
    try {
      const stored = localStorage.getItem(productionStorageKey);
      return stored ? JSON.parse(stored) as ProductionEntry[] : [];
    } catch {
      return [];
    }
  });
  const [date, setDate] = useState(getToday());
  const [productType, setProductType] = useState<ProductType>("short-socks");
  const [quantity, setQuantity] = useState("");
  const [salesEntries, setSalesEntries] = useState<SaleEntry[]>(() => {
    try {
      const stored = localStorage.getItem(salesStorageKey);
      return stored ? JSON.parse(stored) as SaleEntry[] : [];
    } catch {
      return [];
    }
  });
  const [customerName, setCustomerName] = useState("");
  const [saleProductType, setSaleProductType] = useState<ProductType>("short-socks");
  const [saleQuantity, setSaleQuantity] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [saleTotalAmount, setSaleTotalAmount] = useState("");
  const [saleDate, setSaleDate] = useState(getToday());
  const [saleError, setSaleError] = useState("");
  const [saleConfirm, setSaleConfirm] = useState("");
  const [yarnStockKg, setYarnStockKg] = useState(() => {
    try {
      const stored = localStorage.getItem(yarnStockStorageKey);
      return stored ? Number(stored) : 0;
    } catch {
      return 0;
    }
  });
  const [yarnUsageEntries, setYarnUsageEntries] = useState<YarnUsageEntry[]>(() => {
    try {
      const stored = localStorage.getItem(yarnUsageStorageKey);
      return stored ? JSON.parse(stored) as YarnUsageEntry[] : [];
    } catch {
      return [];
    }
  });
  const [currentYarnStock, setCurrentYarnStock] = useState("");
  const [yarnUsageProductType, setYarnUsageProductType] = useState<ProductType>("short-socks");
  const [yarnUsageKg, setYarnUsageKg] = useState("");
  const [yarnError, setYarnError] = useState("");
  const [costs, setCosts] = useState<CostInputs>(() => {
    try {
      const stored = localStorage.getItem(costStorageKey);
      return stored ? { ...defaultCosts, ...(JSON.parse(stored) as CostInputs) } : defaultCosts;
    } catch {
      return defaultCosts;
    }
  });
  const [dailyEntries, setDailyEntries] = useState<DailyProductionEntry[]>(() => {
    try {
      const stored = localStorage.getItem(dailyEntriesStorageKey);
      return stored ? JSON.parse(stored) as DailyProductionEntry[] : [];
    } catch {
      return [];
    }
  });
  const [dailyDate, setDailyDate] = useState(getToday());
  const [dailyProductionDozen, setDailyProductionDozen] = useState("");
  const [dailyYarnKg, setDailyYarnKg] = useState("");
  const [dailyMachineHours, setDailyMachineHours] = useState("");
  const [dailyProductType, setDailyProductType] = useState<ProductType>("short-socks");
  const [dailyYarnCostPerKg, setDailyYarnCostPerKg] = useState("");
  const [dailyLaborCost, setDailyLaborCost] = useState("");
  const [dailyPackagingCost, setDailyPackagingCost] = useState("");
  const [dailyIronCost, setDailyIronCost] = useState("");
  const [dailyStaffBill, setDailyStaffBill] = useState("");
  const [dailyError, setDailyError] = useState("");
  const [dailyConfirm, setDailyConfirm] = useState("");
  const [quickSaleOpen, setQuickSaleOpen] = useState(false);
  const [quickSaleConfirm, setQuickSaleConfirm] = useState("");
  const [yarnPurchases, setYarnPurchases] = useState<YarnPurchase[]>(() => {
    try {
      const stored = localStorage.getItem(yarnPurchasesStorageKey);
      return stored ? (JSON.parse(stored) as YarnPurchase[]) : [];
    } catch {
      return [];
    }
  });
  const [yarnPurchaseDate, setYarnPurchaseDate] = useState(getToday());
  const [yarnPurchaseKg, setYarnPurchaseKg] = useState("");
  const [yarnPerDozen, setYarnPerDozen] = useState<YarnPerDozen>(() => {
    try {
      const stored = localStorage.getItem(yarnPerDozenStorageKey);
      return stored ? { ...defaultYarnPerDozen, ...(JSON.parse(stored) as YarnPerDozen) } : defaultYarnPerDozen;
    } catch {
      return defaultYarnPerDozen;
    }
  });
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

  const [electricityEntries, setElectricityEntries] = useState<ElectricityEntry[]>(() => {
    try {
      const stored = localStorage.getItem(electricityStorageKey);
      return stored ? JSON.parse(stored) as ElectricityEntry[] : [];
    } catch {
      return [];
    }
  });
  const [electricityMonth, setElectricityMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [electricityBill, setElectricityBill] = useState("");
  const [electricityError, setElectricityError] = useState("");
  const [electricityConfirm, setElectricityConfirm] = useState("");

  const [workers, setWorkers] = useState<Worker[]>(() => {
    try {
      const stored = localStorage.getItem(workersStorageKey);
      return stored ? JSON.parse(stored) as Worker[] : [];
    } catch {
      return [];
    }
  });
  const [workLogs, setWorkLogs] = useState<WorkLog[]>(() => {
    try {
      const stored = localStorage.getItem(workLogsStorageKey);
      return stored ? JSON.parse(stored) as WorkLog[] : [];
    } catch {
      return [];
    }
  });
  const [workerPayments, setWorkerPayments] = useState<WorkerPayment[]>(() => {
    try {
      const stored = localStorage.getItem(workerPaymentsStorageKey);
      return stored ? JSON.parse(stored) as WorkerPayment[] : [];
    } catch {
      return [];
    }
  });
  const [newWorkerName, setNewWorkerName] = useState("");
  const [newWorkerPayType, setNewWorkerPayType] = useState<"daily" | "per_unit">("daily");
  const [newWorkerRate, setNewWorkerRate] = useState("");
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

  useEffect(() => {
    localStorage.setItem(productionStorageKey, JSON.stringify(productionEntries));
  }, [productionEntries]);

  useEffect(() => {
    localStorage.setItem(salesStorageKey, JSON.stringify(salesEntries));
  }, [salesEntries]);

  useEffect(() => {
    localStorage.setItem(yarnStockStorageKey, String(yarnStockKg));
  }, [yarnStockKg]);

  useEffect(() => {
    localStorage.setItem(yarnUsageStorageKey, JSON.stringify(yarnUsageEntries));
  }, [yarnUsageEntries]);

  useEffect(() => {
    localStorage.setItem(costStorageKey, JSON.stringify(costs));
  }, [costs]);

  useEffect(() => {
    localStorage.setItem(dailyEntriesStorageKey, JSON.stringify(dailyEntries));
  }, [dailyEntries]);

  useEffect(() => {
    localStorage.setItem(electricityStorageKey, JSON.stringify(electricityEntries));
  }, [electricityEntries]);

  useEffect(() => {
    localStorage.setItem(workersStorageKey, JSON.stringify(workers));
  }, [workers]);

  useEffect(() => {
    localStorage.setItem(workLogsStorageKey, JSON.stringify(workLogs));
  }, [workLogs]);

  useEffect(() => {
    localStorage.setItem(workerPaymentsStorageKey, JSON.stringify(workerPayments));
  }, [workerPayments]);

  useEffect(() => {
    localStorage.setItem(investmentsStorageKey, JSON.stringify(investments));
  }, [investments]);

  useEffect(() => {
    localStorage.setItem(investorsStorageKey, JSON.stringify(investors));
  }, [investors]);

  useEffect(() => {
    localStorage.setItem(productTypesStorageKey, JSON.stringify(productTypes));
  }, [productTypes]);

  useEffect(() => {
    localStorage.setItem(yarnPurchasesStorageKey, JSON.stringify(yarnPurchases));
  }, [yarnPurchases]);

  useEffect(() => {
    localStorage.setItem(yarnPerDozenStorageKey, JSON.stringify(yarnPerDozen));
  }, [yarnPerDozen]);

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
    const totalCost = baseCost + electricityCost;
    const sales = sortedSalesEntries.filter((s) => s.date === profitDate);
    const salesValue = sales.reduce((sum, s) => sum + s.totalValue, 0);
    const salesDozen = sales.reduce((sum, s) => sum + s.quantityDozen, 0);
    return {
      production,
      salesValue,
      salesDozen,
      totalCost,
      electricityCost,
      profit: salesValue - totalCost,
      costPerDozen: production > 0 ? totalCost / production : 0,
    };
  }, [profitDate, dailyEntries, electricityEntries, monthlyProductionByMonth, sortedSalesEntries]);

  const profitMonthlyView = useMemo(() => {
    const monthEntries = dailyEntries.filter((e) => e.date.startsWith(profitMonth));
    const production = monthEntries.reduce((sum, e) => sum + e.totalProductionDozen, 0);
    const baseCost = monthEntries.reduce((sum, e) => sum + e.totalCost, 0);
    const elec = electricityEntries.find((e) => e.month === profitMonth);
    const electricityCost = elec ? elec.totalBill : 0;
    const totalCost = baseCost + electricityCost;
    const sales = sortedSalesEntries.filter((s) => s.date.startsWith(profitMonth));
    const salesValue = sales.reduce((sum, s) => sum + s.totalValue, 0);
    const salesDozen = sales.reduce((sum, s) => sum + s.quantityDozen, 0);
    return {
      production,
      salesValue,
      salesDozen,
      totalCost,
      electricityCost,
      profit: salesValue - totalCost,
      costPerDozen: production > 0 ? totalCost / production : 0,
    };
  }, [profitMonth, dailyEntries, electricityEntries, sortedSalesEntries]);

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
    const quantityDozen = Number(saleQuantity);
    const totalValue = Number(saleTotalAmount);

    if (!customerName.trim() || !Number.isFinite(quantityDozen) || quantityDozen <= 0 || !Number.isFinite(totalValue) || totalValue <= 0) {
      setSaleError("Enter customer name, quantity, and total amount.");
      return;
    }

    if (quantityDozen > inventory[saleProductType]) {
      setSaleError(`Only ${inventory[saleProductType].toLocaleString()} dozen ${productTypeLabels[saleProductType].toLowerCase()} available.`);
      return;
    }

    const pricePerDozen = totalValue / quantityDozen;
    const entry: SaleEntry = {
      id: crypto.randomUUID(),
      customerName: customerName.trim(),
      productType: saleProductType,
      quantityDozen,
      pricePerDozen,
      totalValue,
      createdAt: new Date().toISOString(),
      date: saleDate || getToday(),
    };

    setSalesEntries((current) => [entry, ...current]);
    setCustomerName("");
    setSaleProductType("short-socks");
    setSaleQuantity("");
    setSalePrice("");
    setSaleTotalAmount("");
    setSaleDate(getToday());
    setSaleError("");
    setSaleConfirm("Sale saved.");
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
    const totalProductionDozen = Number(dailyProductionDozen);
    const yarnUsedKg = Number(dailyYarnKg);
    const machineHours = Number(dailyMachineHours);
    const yarnCostPerKg = Number(dailyYarnCostPerKg);
    const packagingCost = Number(dailyPackagingCost);
    const ironCost = Number(dailyIronCost);
    const staffBill = Number(dailyStaffBill);
    const laborCost = (Number.isFinite(packagingCost) ? packagingCost : 0)
      + (Number.isFinite(ironCost) ? ironCost : 0)
      + (Number.isFinite(staffBill) ? staffBill : 0);

    if (!dailyDate || !Number.isFinite(totalProductionDozen) || totalProductionDozen <= 0) {
      setDailyError("Enter date and total production.");
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

    const totalCost = yarnUsedKg * yarnCostPerKg + laborCost + packagingCost + ironCost + staffBill;
    const costPerDozen = totalProductionDozen > 0 ? totalCost / totalProductionDozen : 0;

    const entry: DailyProductionEntry = {
      id: crypto.randomUUID(),
      date: dailyDate,
      totalProductionDozen,
      yarnUsedKg,
      machineHours,
      yarnCostPerKg,
      laborCost,
      packagingCost,
      ironCost,
      staffBill,
      totalCost,
      costPerDozen,
      productType: dailyProductType,
      createdAt: new Date().toISOString(),
    };

    setDailyEntries((current) => [entry, ...current]);
    // Also add to production entries to update inventory by product type
    const productionEntry: ProductionEntry = {
      id: crypto.randomUUID(),
      date: dailyDate,
      productType: dailyProductType,
      quantityDozen: totalProductionDozen,
    };
    setProductionEntries((current) => [productionEntry, ...current]);
    setDailyProductionDozen("");
    setDailyYarnKg("");
    setDailyMachineHours("");
    setDailyProductType("short-socks");
    setDailyYarnCostPerKg("");
    setDailyLaborCost("");
    setDailyPackagingCost("");
    setDailyIronCost("");
    setDailyStaffBill("");
    setDailyDate(getToday());
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
        },
        ...filtered,
      ];
    });
    setElectricityBill("");
    setElectricityConfirm(`Saved ${formatMonthLabel(electricityMonth)} electricity bill.`);
  }

  function handleAddWorker(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWorkerError("");
    const rate = Number(newWorkerRate);
    if (!newWorkerName.trim() || !Number.isFinite(rate) || rate <= 0) {
      setWorkerError("Enter a name and a valid rate.");
      return;
    }
    const worker: Worker = {
      id: crypto.randomUUID(),
      name: newWorkerName.trim(),
      payType: newWorkerPayType,
      rate,
      createdAt: new Date().toISOString(),
    };
    setWorkers((current) => [worker, ...current]);
    setNewWorkerName("");
    setNewWorkerRate("");
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
    };
    setWorkerPayments((current) => [payment, ...current]);
    setPaymentAmount("");
  }

  function handleRemoveWorker(id: string) {
    setWorkers((current) => current.filter((w) => w.id !== id));
    setWorkLogs((current) => current.filter((l) => l.workerId !== id));
    setWorkerPayments((current) => current.filter((p) => p.workerId !== id));
  }

  function handleAddInvestment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInvError("");
    const amount = Number(invAmount);
    if (!invDate || !invType || !Number.isFinite(amount) || amount <= 0) {
      setInvError("Enter date, type, and valid amount.");
      return;
    }
    const entry: Investment = {
      id: crypto.randomUUID(),
      date: invDate,
      type: invType,
      description: invDescription.trim(),
      amount,
      source: invSource.trim() || "personal",
      createdAt: new Date().toISOString(),
    };
    setInvestments((current) => [entry, ...current]);
    setInvAmount("");
    setInvDescription("");
  }

  function handleRemoveInvestment(id: string) {
    setInvestments((current) => current.filter((i) => i.id !== id));
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
    };
    setInvestors((current) => [entry, ...current]);
    setInvestorAmount("");
  }

  function handleRemoveInvestor(id: string) {
    setInvestors((current) => current.filter((i) => i.id !== id));
  }

  const sortedInvestments = useMemo(
    () => [...investments].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [investments],
  );
  const totalInvestmentAmount = investments.reduce((sum, i) => sum + i.amount, 0);

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
    const entry: YarnPurchase = {
      id: crypto.randomUUID(),
      date: yarnPurchaseDate,
      kg,
      createdAt: new Date().toISOString(),
    };
    setYarnPurchases((prev) => [entry, ...prev]);
    setYarnPurchaseKg("");
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
                  handleAddSale(event);
                  if (customerName.trim() && Number(saleQuantity) > 0 && Number(saleTotalAmount) > 0 && Number(saleQuantity) <= inventory[saleProductType]) {
                    setQuickSaleConfirm("Sale added.");
                    setTimeout(() => { setQuickSaleConfirm(""); setQuickSaleOpen(false); }, 800);
                  }
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
                    Auto: ${(Number(saleTotalAmount) / Number(saleQuantity)).toLocaleString(undefined, { maximumFractionDigits: 2 })} per dozen
                  </p>
                )}
                {saleError && (
                  <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{saleError}</p>
                )}
                {quickSaleConfirm && (
                  <p className="rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-800">{quickSaleConfirm}</p>
                )}
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
                {allProductTypeIds.map((id) => (
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
                {allProductTypeIds.map((id) => (
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
                <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-4 sm:p-5">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 divide-x divide-green-200/60">
                    <div className="pr-2">
                      <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wide text-muted-foreground">{totalProfit >= 0 ? "Total profit" : "Total loss"}</p>
                      <p className={`mt-1 sm:mt-2 text-xl sm:text-3xl font-bold leading-tight truncate ${totalProfit >= 0 ? "text-green-700" : "text-red-700"}`}>
                        {totalProfit < 0 ? "−" : ""}${Math.abs(totalProfit).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                      <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">{totalProfit >= 0 ? "Sales − cost" : "Cost exceeds sales"}</p>
                    </div>
                    <div className="pl-3 sm:pl-4">
                      <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wide text-muted-foreground">{dailyProfit >= 0 ? "Daily profit" : "Daily loss"}</p>
                      <p className={`mt-1 sm:mt-2 text-xl sm:text-3xl font-bold leading-tight truncate ${dailyProfit >= 0 ? "text-green-700" : "text-red-700"}`}>
                        {dailyProfit < 0 ? "−" : ""}${Math.abs(dailyProfit).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                      <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">Today's sales − cost</p>
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
                <label className="text-sm font-medium" htmlFor="daily-product-type">Product type</label>
                <Select value={dailyProductType} onValueChange={(value) => setDailyProductType(value as ProductType)}>
                  <SelectTrigger id="daily-product-type" className="h-12 text-base">
                    <SelectValue placeholder="Choose product" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(productTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="daily-production">Quantity (dz)</label>
                  <Input
                    id="daily-production"
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    className="h-12 text-base"
                    placeholder="0"
                    value={dailyProductionDozen}
                    onChange={(event) => setDailyProductionDozen(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="daily-yarn">Yarn (kg)</label>
                  <Input
                    id="daily-yarn"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    className="h-12 text-base"
                    placeholder="0"
                    value={dailyYarnKg}
                    onChange={(event) => setDailyYarnKg(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="daily-machine">Machine Hours</label>
                  <Input
                    id="daily-machine"
                    type="number"
                    min="0"
                    step="0.1"
                    inputMode="decimal"
                    className="h-12 text-base"
                    placeholder="0"
                    value={dailyMachineHours}
                    onChange={(event) => setDailyMachineHours(event.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="daily-packaging">Packaging</label>
                  <Input
                    id="daily-packaging"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    className="h-12 text-base"
                    placeholder="0"
                    value={dailyPackagingCost}
                    onChange={(event) => setDailyPackagingCost(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="daily-iron">Iron Finishing</label>
                  <Input
                    id="daily-iron"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    className="h-12 text-base"
                    placeholder="0"
                    value={dailyIronCost}
                    onChange={(event) => setDailyIronCost(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="daily-staff">Staff Bill</label>
                  <Input
                    id="daily-staff"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    className="h-12 text-base"
                    placeholder="0"
                    value={dailyStaffBill}
                    onChange={(event) => setDailyStaffBill(event.target.value)}
                  />
                </div>
              </div>

              {dailyError && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{dailyError}</p>
              )}
              {dailyConfirm && (
                <p className="rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-800">{dailyConfirm}</p>
              )}

              <Button type="submit" size="lg" className="h-14 w-full text-base font-semibold">
                <Plus className="h-5 w-5" />
                Save day's entry
              </Button>
            </form>

            <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-4 sm:p-5">
              <div className="grid grid-cols-2 gap-3 sm:gap-4 divide-x divide-green-200/60">
                <div className="pr-2">
                  <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wide text-muted-foreground">Total daily production</p>
                  <p className="mt-1 sm:mt-2 text-xl sm:text-3xl font-bold leading-tight truncate text-green-700">
                    {todayProductionDozen.toLocaleString()}<span className="ml-1 text-xs sm:text-sm font-medium text-muted-foreground">dz</span>
                  </p>
                </div>
                <div className="pl-3 sm:pl-4">
                  <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wide text-muted-foreground">Total cost</p>
                  <p className="mt-1 sm:mt-2 text-xl sm:text-3xl font-bold leading-tight truncate text-green-700">
                    ${todayTotalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 border-t border-green-200/60 pt-3 sm:pt-4">
                <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wide text-muted-foreground">Cost per dozen</p>
                <p className="mt-1 sm:mt-2 text-xl sm:text-3xl font-bold leading-tight truncate text-green-700">
                  ${todayCostPerDozen.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Past entries</h3>
                <span className="text-xs text-muted-foreground">{sortedDailyEntries.length} records</span>
              </div>
              {sortedDailyEntries.length > 0 ? (
                <div className="space-y-2">
                  {sortedDailyEntries.slice(0, 14).map((entry) => (
                    <div key={entry.id} className="flex flex-col gap-1 rounded-xl border bg-card/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-base font-semibold">{formatDateLabel(entry.date)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(`${entry.date}T00:00:00`).toLocaleDateString()} · {entry.machineHours.toLocaleString()} hrs · {entry.yarnUsedKg.toLocaleString()} kg yarn
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-right sm:gap-6">
                        <div>
                          <p className="text-xs text-muted-foreground">Production</p>
                          <p className="text-sm font-bold">{entry.totalProductionDozen.toLocaleString()} dz</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total cost</p>
                          <p className="text-sm font-bold">${entry.totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Per dozen</p>
                          <p className="text-sm font-bold">${entry.costPerDozen.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed p-5 text-center">
                  <p className="text-sm font-medium">No daily entries yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Add today's entry to start tracking daily costs.</p>
                </div>
              )}
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
                    <p className="text-[12px] sm:text-sm font-semibold truncate leading-tight">${profitDailyView.salesValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="rounded-lg border bg-card p-1.5 sm:p-2 min-h-[44px] flex flex-col justify-center box-border">
                    <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wide text-muted-foreground truncate leading-tight">Total cost</p>
                    <p className="text-[12px] sm:text-sm font-semibold truncate leading-tight">${profitDailyView.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className={`rounded-lg border p-1.5 sm:p-2 min-h-[44px] flex flex-col justify-center box-border ${profitDailyView.profit >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                    <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wide text-muted-foreground truncate leading-tight">Profit</p>
                    <p className={`text-[12px] sm:text-sm font-semibold truncate leading-tight ${profitDailyView.profit >= 0 ? "text-green-700" : "text-red-700"}`}>${profitDailyView.profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
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
                    <p className="text-[12px] sm:text-sm font-semibold truncate leading-tight">${profitMonthlyView.salesValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="rounded-lg border bg-card p-1.5 sm:p-2 min-h-[44px] flex flex-col justify-center box-border">
                    <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wide text-muted-foreground truncate leading-tight">Total cost</p>
                    <p className="text-[12px] sm:text-sm font-semibold truncate leading-tight">${profitMonthlyView.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className={`rounded-lg border p-1.5 sm:p-2 min-h-[44px] flex flex-col justify-center box-border ${profitMonthlyView.profit >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                    <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wide text-muted-foreground truncate leading-tight">Profit</p>
                    <p className={`text-[12px] sm:text-sm font-semibold truncate leading-tight ${profitMonthlyView.profit >= 0 ? "text-green-700" : "text-red-700"}`}>${profitMonthlyView.profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/30 shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl">Daily Sales Entry</CardTitle>
            <CardDescription>Record sales by date. Stock and revenue update automatically.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-1.5">
              <div className="rounded-lg border bg-primary/5 p-1.5 sm:p-2 min-h-[44px] flex flex-col justify-center box-border">
                <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wide text-muted-foreground truncate leading-tight">Sales today</p>
                <p className="text-[12px] sm:text-sm font-semibold truncate leading-tight">${todaySalesValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
              <div className="rounded-lg border bg-primary/5 p-1.5 sm:p-2 min-h-[44px] flex flex-col justify-center box-border">
                <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wide text-muted-foreground truncate leading-tight">Sold today</p>
                <p className="text-[12px] sm:text-sm font-semibold truncate leading-tight">{todaySalesDozen.toLocaleString()} <span className="text-[10px] font-normal text-muted-foreground">dz</span></p>
              </div>
              <div className="rounded-lg border bg-primary/5 p-1.5 sm:p-2 min-h-[44px] flex flex-col justify-center box-border">
                <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wide text-muted-foreground truncate leading-tight">All-time</p>
                <p className="text-[12px] sm:text-sm font-semibold truncate leading-tight">${totalSalesValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
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

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="daily-sale-product">Product type</label>
                <Select value={saleProductType} onValueChange={(value) => setSaleProductType(value as ProductType)}>
                  <SelectTrigger id="daily-sale-product" className="h-10 text-sm">
                    <SelectValue placeholder="Choose product" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(productTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="daily-sale-quantity">Quantity (dz)</label>
                  <Input
                    id="daily-sale-quantity"
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
                  <label className="text-sm font-medium" htmlFor="daily-sale-total">Total sale</label>
                  <Input
                    id="daily-sale-total"
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
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="daily-sale-price">Price / dozen</label>
                  <Input
                    id="daily-sale-price"
                    readOnly
                    className="h-12 text-base bg-muted/30 font-semibold"
                    value={`$${liveSalePricePerDozen.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                  />
                </div>
              </div>

              {saleError && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{saleError}</p>
              )}
              {saleConfirm && (
                <p className="rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-800">{saleConfirm}</p>
              )}

              <Button type="submit" size="lg" className="h-14 w-full text-base font-semibold">
                <Plus className="h-5 w-5" />
                Save sale
              </Button>
            </form>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Sales entries</h3>
                <span className="text-xs text-muted-foreground">{sortedSalesEntries.length} records</span>
              </div>
              {sortedSalesEntries.length > 0 ? (
                <div className="space-y-2">
                  {sortedSalesEntries.slice(0, 20).map((sale) => (
                    <div key={sale.id} className="flex flex-col gap-1 rounded-xl border bg-card/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-base font-semibold">{formatDateLabel(sale.date)} · {sale.customerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {productTypeLabels[sale.productType]} · {sale.quantityDozen.toLocaleString()} dozen at ${sale.pricePerDozen.toLocaleString(undefined, { maximumFractionDigits: 2 })}/dz
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-lg font-bold">${sale.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed p-5 text-center">
                  <p className="text-sm font-medium">No sales entered yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Add a sale above to update revenue and reduce stock.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/30 shadow-md">
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
              <Button type="submit" size="lg" className="h-14 w-full text-base font-semibold">
                <Plus className="h-5 w-5" /> Save monthly bill
              </Button>
            </form>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Monthly history</h3>
                <span className="text-xs text-muted-foreground">{electricityWithCalc.length} months</span>
              </div>
              {electricityWithCalc.length > 0 ? (
                <div className="space-y-2">
                  {electricityWithCalc.map((entry) => (
                    <div key={entry.id} className="grid gap-2 rounded-xl border bg-card/60 p-4 sm:grid-cols-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Month</p>
                        <p className="text-base font-semibold">{formatMonthLabel(entry.month)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total bill</p>
                        <p className="text-base font-bold">${entry.totalBill.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Production</p>
                        <p className="text-base font-semibold">{entry.monthlyProduction.toLocaleString()} dz</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Cost / dozen</p>
                        <p className="text-base font-bold">${entry.costPerDozen.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                      </div>
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
              <div className="rounded-2xl border bg-primary/5 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Purchased</p>
                <p className="text-2xl font-bold mt-1">{totalYarnPurchasedKg.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg</p>
              </div>
              <div className="rounded-2xl border bg-muted/40 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Used (total)</p>
                <p className="text-2xl font-bold mt-1">{totalYarnUsedAllKg.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg</p>
              </div>
              <div className="rounded-2xl border bg-muted/40 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Remaining</p>
                <p className="text-2xl font-bold mt-1">{remainingYarnAvailableKg.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg</p>
              </div>
              <div className="rounded-2xl border bg-muted/40 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Efficiency</p>
                <p className="text-2xl font-bold mt-1">{yarnEfficiency.toFixed(1)}%</p>
              </div>
              <div className="rounded-2xl border bg-orange-100/50 dark:bg-orange-900/20 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Future need</p>
                <p className="text-2xl font-bold mt-1">{futureYarnNeed.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg</p>
                <p className="text-[10px] text-muted-foreground mt-1">For current stock</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Add yarn purchase</h3>
              <form onSubmit={handleAddYarnPurchase} className="grid grid-cols-3 gap-1.5 sm:gap-2.5 lg:gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="yarn-purchase-date">Date</label>
                  <Input id="yarn-purchase-date" type="date" className="h-12 text-base" max={getToday()} value={yarnPurchaseDate} onChange={(e) => setYarnPurchaseDate(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="yarn-purchase-kg">Quantity (kg)</label>
                  <Input id="yarn-purchase-kg" type="number" min="0" step="0.01" inputMode="decimal" className="h-12 text-base" placeholder="0" value={yarnPurchaseKg} onChange={(e) => setYarnPurchaseKg(e.target.value)} required />
                </div>
                <div className="space-y-2 flex items-end">
                  <Button type="submit" size="lg" className="h-12 w-full">
                    <Plus className="h-4 w-4" /> Add purchase
                  </Button>
                </div>
              </form>
              {yarnPurchases.length > 0 && (
                <div className="rounded-2xl border divide-y max-h-64 overflow-y-auto">
                  {yarnPurchases.slice(0, 10).map((p) => (
                    <div key={p.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="font-medium">{p.kg.toLocaleString(undefined, { maximumFractionDigits: 2 })} kg</p>
                        <p className="text-xs text-muted-foreground">{formatDateLabel(p.date)}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setYarnPurchases((prev) => prev.filter((x) => x.id !== p.id))} aria-label="Remove">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Yarn per dozen (kg)</h3>
              <p className="text-xs text-muted-foreground">Average yarn consumed to produce 1 dozen of each product.</p>
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5 lg:gap-3">
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
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 lg:gap-3">
              <div className="rounded-2xl border bg-primary/5 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total payable</p>
                <p className="mt-2 text-3xl font-bold">${totalPayable.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              </div>
              <div className="rounded-2xl border bg-primary/5 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total paid</p>
                <p className="mt-2 text-3xl font-bold">${totalPaidAll.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              </div>
              <div className={`rounded-2xl border p-5 ${totalRemainingAll > 0 ? "bg-orange-50 border-orange-200" : "bg-green-50 border-green-200"}`}>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Remaining</p>
                <p className={`mt-2 text-3xl font-bold ${totalRemainingAll > 0 ? "text-orange-700" : "text-green-700"}`}>${totalRemainingAll.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              </div>
            </div>

            <form onSubmit={handleAddWorker} className="space-y-4 rounded-2xl border bg-muted/20 p-4">
              <h3 className="text-sm font-semibold">Add a worker</h3>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 lg:gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="worker-name">Name</label>
                  <Input id="worker-name" className="h-12 text-base" placeholder="Worker name" value={newWorkerName} onChange={(e) => setNewWorkerName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="worker-paytype">Pay type</label>
                  <Select value={newWorkerPayType} onValueChange={(v) => setNewWorkerPayType(v as "daily" | "per_unit")}>
                    <SelectTrigger id="worker-paytype" className="h-12 text-base"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily wage</SelectItem>
                      <SelectItem value="per_unit">Per unit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="worker-rate">{newWorkerPayType === "daily" ? "Wage per day" : "Rate per unit"}</label>
                  <Input id="worker-rate" type="number" min="0.01" step="0.01" inputMode="decimal" className="h-12 text-base" placeholder="0" value={newWorkerRate} onChange={(e) => setNewWorkerRate(e.target.value)} required />
                </div>
              </div>
              {workerError && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{workerError}</p>}
              <Button type="submit" size="lg" className="h-12 w-full text-base font-semibold sm:w-auto"><Plus className="h-5 w-5" /> Add worker</Button>
            </form>

            {workers.length > 0 && (
              <div className="grid gap-4 lg:grid-cols-2">
                <form onSubmit={handleAddWorkLog} className="space-y-4 rounded-2xl border bg-muted/20 p-4">
                  <h3 className="text-sm font-semibold">Log work done</h3>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="log-worker">Worker</label>
                    <Select value={logWorkerId} onValueChange={setLogWorkerId}>
                      <SelectTrigger id="log-worker" className="h-12 text-base"><SelectValue placeholder="Choose worker" /></SelectTrigger>
                      <SelectContent>
                        {workers.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="log-date">Date</label>
                      <Input id="log-date" type="date" className="h-12 text-base" value={logDate} onChange={(e) => setLogDate(e.target.value)} max={getToday()} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="log-amount">{workers.find(w => w.id === logWorkerId)?.payType === "per_unit" ? "Units done" : "Days worked"}</label>
                      <Input id="log-amount" type="number" min="0.01" step="0.01" inputMode="decimal" className="h-12 text-base" placeholder="0" value={logAmount} onChange={(e) => setLogAmount(e.target.value)} required />
                    </div>
                  </div>
                  <Button type="submit" size="lg" className="h-12 w-full text-base font-semibold"><Plus className="h-5 w-5" /> Save work</Button>
                </form>

                <form onSubmit={handleAddPayment} className="space-y-4 rounded-2xl border bg-muted/20 p-4">
                  <h3 className="text-sm font-semibold">Record a payment</h3>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="pay-worker">Worker</label>
                    <Select value={paymentWorkerId} onValueChange={setPaymentWorkerId}>
                      <SelectTrigger id="pay-worker" className="h-12 text-base"><SelectValue placeholder="Choose worker" /></SelectTrigger>
                      <SelectContent>
                        {workers.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="pay-date">Date</label>
                      <Input id="pay-date" type="date" className="h-12 text-base" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} max={getToday()} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="pay-amount">Amount paid</label>
                      <Input id="pay-amount" type="number" min="0.01" step="0.01" inputMode="decimal" className="h-12 text-base" placeholder="0" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} required />
                    </div>
                  </div>
                  <Button type="submit" size="lg" className="h-12 w-full text-base font-semibold"><Plus className="h-5 w-5" /> Save payment</Button>
                </form>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Workers</h3>
              {workerStats.length > 0 ? (
                <div className="space-y-2">
                  {workerStats.map(({ worker, totalUnits, totalEarned, totalPaid, remaining }) => (
                    <div key={worker.id} className="rounded-xl border bg-card/60 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold">{worker.name}</p>
                          <p className="text-xs text-muted-foreground">{worker.payType === "daily" ? `$${worker.rate}/day` : `$${worker.rate}/unit`} · {totalUnits.toLocaleString()} {worker.payType === "daily" ? "days" : "units"}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveWorker(worker.id)} className="text-destructive">Remove</Button>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-1.5 sm:gap-2.5 lg:gap-3">
                        <div className="rounded-lg bg-muted/40 p-3">
                          <p className="text-xs text-muted-foreground">Total earned</p>
                          <p className="text-base font-bold">${totalEarned.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                        </div>
                        <div className="rounded-lg bg-muted/40 p-3">
                          <p className="text-xs text-muted-foreground">Already paid</p>
                          <p className="text-base font-bold">${totalPaid.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                        </div>
                        <div className={`rounded-lg p-3 ${remaining > 0 ? "bg-orange-100" : "bg-green-100"}`}>
                          <p className="text-xs text-muted-foreground">Remaining due</p>
                          <p className={`text-base font-bold ${remaining > 0 ? "text-orange-700" : "text-green-700"}`}>${remaining.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                        </div>
                      </div>
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

        <Card className="border-2 border-primary/30 shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl">Investment</CardTitle>
            <CardDescription>Track money put into the business by type and source.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-2xl border bg-primary/5 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total investment</p>
              <p className="mt-2 text-3xl font-bold">${totalInvestmentAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              <p className="mt-1 text-xs text-muted-foreground">{investments.length} entries</p>
            </div>

            <form onSubmit={handleAddInvestment} className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="inv-date">Date</label>
                <Input id="inv-date" type="date" className="h-12 text-base" value={invDate} onChange={(e) => setInvDate(e.target.value)} max={getToday()} required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="inv-type">Investment type</label>
                  <Select value={invType} onValueChange={setInvType}>
                    <SelectTrigger id="inv-type" className="h-12 text-base"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {investmentTypeOptions.map((t) => <SelectItem key={t} value={t}>{investmentTypeLabels[t]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="inv-amount">Amount</label>
                  <Input id="inv-amount" type="number" min="0.01" step="0.01" inputMode="decimal" className="h-12 text-base" placeholder="0" value={invAmount} onChange={(e) => setInvAmount(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="inv-source">Source</label>
                  <Select value={invSource} onValueChange={setInvSource}>
                    <SelectTrigger id="inv-source" className="h-12 text-base"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {investmentSourceOptions.map((s) => <SelectItem key={s} value={s}>{investmentSourceLabels[s]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="inv-desc">Description</label>
                  <Input id="inv-desc" className="h-12 text-base" placeholder="Note" value={invDescription} onChange={(e) => setInvDescription(e.target.value)} />
                </div>
              </div>
              {invError && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{invError}</p>}
              <Button type="submit" size="lg" className="h-14 w-full text-base font-semibold"><Plus className="h-5 w-5" /> Save investment</Button>
            </form>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">All investments</h3>
                <span className="text-xs text-muted-foreground">{investments.length} records</span>
              </div>
              {sortedInvestments.length > 0 ? (
                <div className="space-y-2">
                  {sortedInvestments.map((inv) => (
                    <div key={inv.id} className="flex flex-col gap-1 rounded-xl border bg-card/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-base font-semibold">{formatDateLabel(inv.date)} · {investmentTypeLabels[inv.type] || inv.type}</p>
                        <p className="text-xs text-muted-foreground">Source: {investmentSourceLabels[inv.source] || inv.source}{inv.description ? ` · ${inv.description}` : ""}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-lg font-bold">${inv.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveInvestment(inv.id)} className="text-destructive">Remove</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed p-5 text-center">
                  <p className="text-sm font-medium">No investments yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Add an investment above to track business inputs.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/30 shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl">Investor</CardTitle>
            <CardDescription>Track funds invested by each investor.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border bg-primary/5 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total overall investment</p>
                <p className="mt-2 text-3xl font-bold">${totalInvestorFunds.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
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
              <Button type="submit" size="lg" className="h-14 w-full text-base font-semibold"><Plus className="h-5 w-5" /> Save investor entry</Button>
            </form>

            {investorTotals.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Total per investor</h3>
                <div className="space-y-2">
                  {investorTotals.map((it) => (
                    <div key={it.name} className="flex items-center justify-between rounded-xl border bg-card/60 p-4">
                      <p className="text-base font-semibold">{it.name}</p>
                      <p className="text-lg font-bold">${it.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">All investor entries</h3>
                <span className="text-xs text-muted-foreground">{investors.length} records</span>
              </div>
              {sortedInvestorEntries.length > 0 ? (
                <div className="space-y-2">
                  {sortedInvestorEntries.map((e) => (
                    <div key={e.id} className="flex flex-col gap-1 rounded-xl border bg-card/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-base font-semibold">{e.name}</p>
                        <p className="text-xs text-muted-foreground">{formatDateLabel(e.date)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-lg font-bold">${e.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveInvestor(e.id)} className="text-destructive">Remove</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed p-5 text-center">
                  <p className="text-sm font-medium">No investor entries yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Add an entry above to start tracking.</p>
                </div>
              )}
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
            <div className="flex flex-wrap gap-2">
              {productTypes.map((t) => {
                const inUse = productionEntries.some((e) => e.productType === t.id) || salesEntries.some((e) => e.productType === t.id);
                return (
                  <div key={t.id} className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 shadow-sm">
                    <span className="text-sm font-medium">{t.label}</span>
                    {!inUse && (
                      <button
                        type="button"
                        onClick={() => handleRemoveProductType(t.id)}
                        className="text-muted-foreground hover:text-destructive transition"
                        aria-label={`Remove ${t.label}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

      </div>
    </AdminLayout>
  );
}
