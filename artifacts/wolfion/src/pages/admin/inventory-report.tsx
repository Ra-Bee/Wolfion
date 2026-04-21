import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { FileDown, Calendar as CalendarIcon, TrendingUp, Package, DollarSign, Factory } from "lucide-react";
import { downloadReport, type WolfionReportData, type ReportRange } from "@/lib/reports";
import {
  STORAGE_KEYS,
  defaultProductTypes,
  defaultYarnPerDozen,
  initialInventory,
  getToday,
  inDateRange,
  useStored,
  useStoredNumber,
  type ProductTypeOption,
  type ProductionEntry,
  type SaleEntry,
  type DailyProductionEntry,
  type ElectricityEntry,
  type Worker,
  type WorkLog,
  type WorkerPayment,
  type YarnPurchase,
  type YarnPerDozen,
  type YarnUsageEntry,
} from "@/lib/wolfion-store";

type Mode = "daily" | "monthly" | "yearly" | "custom";

export default function InventoryReportPage() {
  const [productTypes] = useStored<ProductTypeOption[]>(STORAGE_KEYS.productTypes, defaultProductTypes);
  const [productionEntries] = useStored<ProductionEntry[]>(STORAGE_KEYS.production, []);
  const [salesEntries] = useStored<SaleEntry[]>(STORAGE_KEYS.sales, []);
  const [dailyEntries] = useStored<DailyProductionEntry[]>(STORAGE_KEYS.daily, []);
  const [electricityEntries] = useStored<ElectricityEntry[]>(STORAGE_KEYS.electricity, []);
  const [workers] = useStored<Worker[]>(STORAGE_KEYS.workers, []);
  const [workLogs] = useStored<WorkLog[]>(STORAGE_KEYS.workLogs, []);
  const [workerPayments] = useStored<WorkerPayment[]>(STORAGE_KEYS.workerPayments, []);
  const [yarnPurchases] = useStored<YarnPurchase[]>(STORAGE_KEYS.yarnPurchases, []);
  const [yarnPerDozen] = useStored<YarnPerDozen>(STORAGE_KEYS.yarnPerDozen, defaultYarnPerDozen);
  const [yarnUsageEntries] = useStored<YarnUsageEntry[]>(STORAGE_KEYS.yarnUsage, []);
  const [yarnStockKg] = useStoredNumber(STORAGE_KEYS.yarnStock, 0);

  const productTypeLabels = useMemo(() => {
    const m: Record<string, string> = {};
    for (const t of productTypes) m[t.id] = t.label;
    return m;
  }, [productTypes]);
  const allProductTypeIds = useMemo(() => productTypes.map((t) => t.id), [productTypes]);

  const [mode, setMode] = useState<Mode>("monthly");
  const [singleDate, setSingleDate] = useState(getToday());
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [year, setYear] = useState(() => String(new Date().getFullYear()));
  const [customStart, setCustomStart] = useState(getToday());
  const [customEnd, setCustomEnd] = useState(getToday());
  const [error, setError] = useState("");

  function getRange(): ReportRange {
    if (mode === "daily") {
      return { label: `Daily Report — ${singleDate}`, startDate: singleDate, endDate: singleDate };
    }
    if (mode === "monthly") {
      const [y, m] = month.split("-").map(Number);
      const last = new Date(y, m, 0).getDate();
      return {
        label: `Monthly Report — ${new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" })}`,
        startDate: `${month}-01`,
        endDate: `${month}-${String(last).padStart(2, "0")}`,
      };
    }
    if (mode === "yearly") {
      return { label: `Yearly Report — ${year}`, startDate: `${year}-01-01`, endDate: `${year}-12-31` };
    }
    return { label: "Custom Report", startDate: customStart, endDate: customEnd };
  }

  function validate(): string {
    if (mode === "daily" && !singleDate) return "Please choose a date.";
    if (mode === "monthly" && !/^\d{4}-\d{2}$/.test(month)) return "Please choose a valid month.";
    if (mode === "yearly") {
      const y = Number(year);
      if (!Number.isFinite(y) || y < 2000 || y > 2100) return "Please enter a valid year (2000–2100).";
    }
    if (mode === "custom") {
      if (!customStart || !customEnd) return "Please choose both start and end dates.";
      if (customStart > customEnd) return "Start date must be before end date.";
    }
    return "";
  }

  const range = getRange();

  // Live preview metrics for the selected range
  const inv = useMemo(() => {
    const stock: Record<string, number> = {};
    for (const id of allProductTypeIds) stock[id] = initialInventory[id] || 0;
    for (const e of productionEntries) {
      stock[e.productType] = (stock[e.productType] || 0) + e.quantityDozen;
    }
    for (const s of salesEntries) {
      stock[s.productType] = (stock[s.productType] || 0) - s.quantityDozen;
    }
    return stock;
  }, [productionEntries, salesEntries, allProductTypeIds]);

  const previewStats = useMemo(() => {
    const filteredProd = productionEntries.filter((e) => inDateRange(e.date, range.startDate, range.endDate));
    const filteredSales = salesEntries.filter((s) => inDateRange(s.date || "", range.startDate, range.endDate));
    const filteredDaily = dailyEntries.filter((e) => inDateRange(e.date, range.startDate, range.endDate));

    const productionDz = filteredProd.reduce((a, b) => a + b.quantityDozen, 0);
    const salesAmount = filteredSales.reduce((a, b) => a + b.totalValue, 0);
    const salesDz = filteredSales.reduce((a, b) => a + b.quantityDozen, 0);
    const totalCost = filteredDaily.reduce((a, b) => a + b.totalCost, 0);
    const profit = salesAmount - totalCost;
    return { productionDz, salesAmount, salesDz, totalCost, profit };
  }, [productionEntries, salesEntries, dailyEntries, range.startDate, range.endDate]);

  function handleDownload() {
    const err = validate();
    if (err) { setError(err); return; }
    setError("");

    const filteredProd = productionEntries.filter((e) => inDateRange(e.date, range.startDate, range.endDate));
    const filteredSales = salesEntries.filter((s) => inDateRange(s.date || "", range.startDate, range.endDate));
    const filteredDaily = dailyEntries.filter((e) => inDateRange(e.date, range.startDate, range.endDate));

    // Worker stats (full, since payments are cumulative and not always range-bound)
    const workerStats = workers.map((w) => {
      const earned = workLogs.filter((l) => l.workerId === w.id).reduce((a, b) => a + b.amount, 0);
      const paid = workerPayments.filter((p) => p.workerId === w.id).reduce((a, b) => a + b.amount, 0);
      return { name: w.name, totalEarned: earned, totalPaid: paid, remaining: earned - paid };
    });

    const data: WolfionReportData = {
      range,
      productTypeLabels,
      production: filteredProd.map((e) => ({ date: e.date, productType: e.productType, quantityDozen: e.quantityDozen })),
      sales: filteredSales.map((s) => ({
        date: s.date || s.createdAt.slice(0, 10),
        customerName: s.customerName,
        productType: s.productType,
        quantityDozen: s.quantityDozen,
        totalValue: s.totalValue,
      })),
      daily: filteredDaily.map((e) => ({
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
      inventory: allProductTypeIds.map((id) => ({ productType: id, stockDozen: inv[id] || 0 })),
      labor: workerStats,
      payments: workerPayments.map((p) => ({
        workerName: workers.find((w) => w.id === p.workerId)?.name || "Unknown",
        date: p.date,
        amount: p.amount,
      })),
    };

    const stamp = range.startDate === range.endDate ? range.startDate : `${range.startDate}_to_${range.endDate}`;
    downloadReport(data, `Wolfion_Inventory_${stamp}.pdf`);
  }

  // Future yarn need based on current inventory and per-dozen rates
  const futureYarnNeed = allProductTypeIds.reduce((sum, id) => sum + (inv[id] || 0) * (yarnPerDozen[id] || 0), 0);
  const totalYarnPurchased = yarnPurchases.reduce((a, b) => a + b.kg, 0);
  const totalYarnUsed = yarnUsageEntries.reduce((a, b) => a + b.kgUsed, 0) + dailyEntries.reduce((a, b) => a + (b.yarnUsedKg || 0), 0);
  void futureYarnNeed; void totalYarnPurchased; void totalYarnUsed; // computed for parity, not displayed here

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Report</h1>
          <p className="text-muted-foreground mt-1">Generate professional PDF reports across any date range.</p>
        </div>

        <Card className="border-2 border-primary/30 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2"><CalendarIcon className="h-5 w-5 text-primary" /> Choose period</CardTitle>
            <CardDescription>Select the report type and date range.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(["daily", "monthly", "yearly", "custom"] as Mode[]).map((m) => (
                <Button key={m} type="button" variant={mode === m ? "default" : "outline"} className="capitalize h-12" onClick={() => setMode(m)}>
                  {m === "custom" ? "Custom" : m}
                </Button>
              ))}
            </div>

            {mode === "daily" && (
              <div className="space-y-2 max-w-sm">
                <label className="text-sm font-medium" htmlFor="rep-date">Date</label>
                <Input id="rep-date" type="date" className="h-12 text-base" value={singleDate} max={getToday()} onChange={(e) => setSingleDate(e.target.value)} />
              </div>
            )}
            {mode === "monthly" && (
              <div className="space-y-2 max-w-sm">
                <label className="text-sm font-medium" htmlFor="rep-month">Month</label>
                <Input id="rep-month" type="month" className="h-12 text-base" value={month} onChange={(e) => setMonth(e.target.value)} />
              </div>
            )}
            {mode === "yearly" && (
              <div className="space-y-2 max-w-sm">
                <label className="text-sm font-medium" htmlFor="rep-year">Year</label>
                <Input id="rep-year" type="number" min="2000" max="2100" className="h-12 text-base" value={year} onChange={(e) => setYear(e.target.value)} />
              </div>
            )}
            {mode === "custom" && (
              <div className="grid gap-3 sm:grid-cols-2 max-w-xl">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="rep-start">Start date</label>
                  <Input id="rep-start" type="date" className="h-12 text-base" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="rep-end">End date</label>
                  <Input id="rep-end" type="date" className="h-12 text-base" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
                </div>
              </div>
            )}

            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{error}</p>
            )}

            <Separator />

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border bg-primary/5 p-4">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground"><Factory className="h-3.5 w-3.5" /> Production</div>
                <p className="text-2xl font-bold mt-1">{previewStats.productionDz.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">dz</span></p>
              </div>
              <div className="rounded-2xl border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground"><DollarSign className="h-3.5 w-3.5" /> Sales</div>
                <p className="text-2xl font-bold mt-1">${previewStats.salesAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{previewStats.salesDz.toLocaleString()} dz sold</p>
              </div>
              <div className="rounded-2xl border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground"><Package className="h-3.5 w-3.5" /> Cost</div>
                <p className="text-2xl font-bold mt-1">${previewStats.totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              </div>
              <div className={`rounded-2xl border p-4 ${previewStats.profit >= 0 ? "bg-green-100/40 dark:bg-green-900/20" : "bg-red-100/40 dark:bg-red-900/20"}`}>
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground"><TrendingUp className="h-3.5 w-3.5" /> Profit</div>
                <p className={`text-2xl font-bold mt-1 ${previewStats.profit >= 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                  ${previewStats.profit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <Button onClick={handleDownload} size="lg" className="w-full h-14 text-base font-semibold">
              <FileDown className="h-5 w-5" /> Download PDF Report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Current inventory snapshot</CardTitle>
            <CardDescription>Live stock per product type.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-4">
              {allProductTypeIds.map((id) => (
                <div key={id} className="rounded-2xl border bg-white dark:bg-muted/30 p-3 sm:p-4 shadow-sm text-center">
                  <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wide text-muted-foreground leading-tight break-words">{productTypeLabels[id] || id}</p>
                  <p className="text-lg sm:text-2xl font-bold mt-1.5 sm:mt-1">{(inv[id] || 0).toLocaleString()} <span className="text-[10px] sm:text-sm font-normal text-muted-foreground">dz</span></p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
