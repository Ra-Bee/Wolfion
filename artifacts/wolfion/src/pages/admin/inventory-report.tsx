import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, Calendar as CalendarIcon, TrendingUp, Package, DollarSign, Factory, FileText } from "lucide-react";
import { downloadReport, downloadItemReport, downloadAllProductsReport, type WolfionReportData, type WolfionItemReportData, type WolfionAllProductsReportData, type ItemReportContent, type ReportRange } from "@/lib/reports";
import {
  STORAGE_KEYS,
  defaultProductTypes,
  defaultYarnPerDozen,
  defaultProductConfigs,
  initialInventory,
  getToday,
  inDateRange,
  computePeriodSummary,
  saleCostOfGoods,
  canonicalDailyCost,
  useStored,
  useStoredNumber,
  type ProductTypeOption,
  type ProductConfig,
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
  FOOTBALL_TOP_ID,
  FOOTBALL_BOTTOM_ID,
  LEGACY_FOOTBALL_ID,
  combineFootballStock,
} from "@/lib/wolfion-store";
import { FootballStockCard } from "@/components/admin/football-stock-card";
import { useCloudStored } from "@/lib/cloud-store";

type Mode = "daily" | "monthly" | "yearly" | "alltime" | "custom";

export default function InventoryReportPage() {
  const [productTypes] = useCloudStored<ProductTypeOption[]>(STORAGE_KEYS.productTypes, defaultProductTypes);
  const [productionEntries] = useCloudStored<ProductionEntry[]>(STORAGE_KEYS.production, []);
  const [salesEntries] = useCloudStored<SaleEntry[]>(STORAGE_KEYS.sales, []);
  const [dailyEntries] = useCloudStored<DailyProductionEntry[]>(STORAGE_KEYS.daily, []);
  const [productConfigs] = useCloudStored<ProductConfig[]>(STORAGE_KEYS.productConfigs, defaultProductConfigs);
  const [electricityEntries] = useStored<ElectricityEntry[]>(STORAGE_KEYS.electricity, []);
  const [workers] = useStored<Worker[]>(STORAGE_KEYS.workers, []);
  const [workLogs] = useStored<WorkLog[]>(STORAGE_KEYS.workLogs, []);
  const [workerPayments] = useStored<WorkerPayment[]>(STORAGE_KEYS.workerPayments, []);
  const [yarnPurchases] = useCloudStored<YarnPurchase[]>(STORAGE_KEYS.yarnPurchases, []);
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

  // ---- Single-item detailed report ----
  type ItemMode = "daily" | "weekly" | "monthly" | "yearly" | "alltime" | "custom";
  const [itemProduct, setItemProduct] = useState<string>("");
  const [itemContent, setItemContent] = useState<ItemReportContent>("all");
  const [itemMode, setItemMode] = useState<ItemMode>("monthly");
  const [itemDate, setItemDate] = useState(getToday());
  const [itemWeek, setItemWeek] = useState(() => {
    const d = new Date();
    const day = (d.getDay() + 6) % 7; // Mon=0
    const thursday = new Date(d);
    thursday.setDate(d.getDate() - day + 3);
    const week1 = new Date(thursday.getFullYear(), 0, 4);
    const w = 1 + Math.round(((thursday.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
    return `${thursday.getFullYear()}-W${String(w).padStart(2, "0")}`;
  });
  const [itemMonth, setItemMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [itemYear, setItemYear] = useState(() => String(new Date().getFullYear()));
  const [itemCustomStart, setItemCustomStart] = useState(getToday());
  const [itemCustomEnd, setItemCustomEnd] = useState(getToday());
  const [itemError, setItemError] = useState("");

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
    if (mode === "alltime") {
      return { label: "All-time Report", startDate: "0000-01-01", endDate: "9999-12-31" };
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

    const s = computePeriodSummary({
      production: filteredProd,
      sales: filteredSales,
      daily: filteredDaily,
      configs: productConfigs,
      purchases: yarnPurchases,
    });
    return {
      productionDz: s.productionDz,
      salesAmount: s.salesValue,
      salesDz: s.salesDz,
      totalCost: s.totalCost,
      profit: s.profit,
    };
  }, [productionEntries, salesEntries, dailyEntries, productConfigs, yarnPurchases, range.startDate, range.endDate]);

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
        costOfGoods: saleCostOfGoods(productConfigs, yarnPurchases, s),
      })),
      daily: filteredDaily.map((e) => {
        const c = canonicalDailyCost(e, productConfigs, yarnPurchases);
        return {
          date: e.date,
          totalProductionDozen: e.totalProductionDozen,
          yarnUsedKg: c.yarnKg,
          yarnCostPerKg: c.yarnKg > 0 ? c.yarnCost / c.yarnKg : 0,
          laborCost: c.laborCost,
          packagingCost: c.packagingCost,
          ironCost: c.ironCost,
          totalCost: c.totalCost,
        };
      }),
      electricity: electricityEntries.map((e) => ({ month: e.month, totalBill: e.totalBill })),
      inventory: (() => {
        const rows = allProductTypeIds
          .filter((id) => id !== FOOTBALL_TOP_ID && id !== FOOTBALL_BOTTOM_ID && id !== LEGACY_FOOTBALL_ID)
          .map((id) => ({ productType: id, stockDozen: inv[id] || 0 }));
        const fTop = inv[FOOTBALL_TOP_ID] || 0;
        const fBottom = inv[FOOTBALL_BOTTOM_ID] || 0;
        if ((fTop !== 0 || fBottom !== 0) && allProductTypeIds.some((id) => id === FOOTBALL_TOP_ID || id === FOOTBALL_BOTTOM_ID)) {
          // One combined football row: complete dozens = matching top+bottom
          // pairs; the raw part counts are shown inside the label so the PDF
          // total only counts finished footballs once.
          const f = combineFootballStock(fTop, fBottom);
          rows.push({
            productType: `Sports (Football) — inside: ${f.top.toLocaleString()} top / ${f.bottom.toLocaleString()} bottom`,
            stockDozen: f.pairs,
          });
        }
        return rows;
      })(),
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

  function isoWeekToRange(val: string): { startDate: string; endDate: string } {
    const [y, w] = val.split("-W").map(Number);
    const jan4 = new Date(Date.UTC(y, 0, 4));
    const jan4Day = (jan4.getUTCDay() + 6) % 7; // Mon=0
    const week1Mon = new Date(jan4);
    week1Mon.setUTCDate(jan4.getUTCDate() - jan4Day);
    const mon = new Date(week1Mon);
    mon.setUTCDate(week1Mon.getUTCDate() + (w - 1) * 7);
    const sun = new Date(mon);
    sun.setUTCDate(mon.getUTCDate() + 6);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    return { startDate: fmt(mon), endDate: fmt(sun) };
  }

  function getItemRange(): ReportRange {
    if (itemMode === "daily") {
      return { label: `Daily Report — ${itemDate}`, startDate: itemDate, endDate: itemDate };
    }
    if (itemMode === "weekly") {
      const { startDate, endDate } = isoWeekToRange(itemWeek);
      return { label: `Weekly Report — ${startDate} to ${endDate}`, startDate, endDate };
    }
    if (itemMode === "monthly") {
      const [y, m] = itemMonth.split("-").map(Number);
      const last = new Date(y, m, 0).getDate();
      return {
        label: `Monthly Report — ${new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" })}`,
        startDate: `${itemMonth}-01`,
        endDate: `${itemMonth}-${String(last).padStart(2, "0")}`,
      };
    }
    if (itemMode === "yearly") {
      return { label: `Yearly Report — ${itemYear}`, startDate: `${itemYear}-01-01`, endDate: `${itemYear}-12-31` };
    }
    if (itemMode === "alltime") {
      return { label: "All-time Report", startDate: "0000-01-01", endDate: "9999-12-31" };
    }
    return { label: "Custom Report", startDate: itemCustomStart, endDate: itemCustomEnd };
  }

  function validateItem(): string {
    if (!itemProduct) return "Please choose a product.";
    if (itemMode === "daily" && !itemDate) return "Please choose a date.";
    if (itemMode === "weekly") {
      const wm = /^\d{4}-W(\d{2})$/.exec(itemWeek);
      const wn = wm ? Number(wm[1]) : 0;
      if (!wm || wn < 1 || wn > 53) return "Please choose a valid week.";
    }
    if (itemMode === "monthly" && !/^\d{4}-\d{2}$/.test(itemMonth)) return "Please choose a valid month.";
    if (itemMode === "yearly") {
      const y = Number(itemYear);
      if (!Number.isFinite(y) || y < 2000 || y > 2100) return "Please enter a valid year (2000–2100).";
    }
    if (itemMode === "custom") {
      if (!itemCustomStart || !itemCustomEnd) return "Please choose both start and end dates.";
      if (itemCustomStart > itemCustomEnd) return "Start date must be before end date.";
    }
    return "";
  }

  function handleDownloadItem() {
    const err = validateItem();
    if (err) { setItemError(err); return; }
    setItemError("");

    const r = getItemRange();

    // "All products" → totals-only report across every product, no entry detail.
    if (itemProduct === "__all__") {
      const rows = allProductTypeIds.map((id) => {
        const prod = productionEntries.filter((e) => e.productType === id && inDateRange(e.date, r.startDate, r.endDate));
        const sls = salesEntries.filter((s) => s.productType === id && inDateRange(s.date || s.createdAt.slice(0, 10), r.startDate, r.endDate));
        return {
          productType: id,
          label: productTypeLabels[id] || id,
          producedDz: prod.reduce((a, b) => a + b.quantityDozen, 0),
          soldDz: sls.reduce((a, b) => a + b.quantityDozen, 0),
          currentStockDozen: inv[id] || 0,
          salesValue: sls.reduce((a, b) => a + b.totalValue, 0),
          cogs: sls.reduce((a, b) => a + saleCostOfGoods(productConfigs, yarnPurchases, b), 0),
        };
      });
      const allData: WolfionAllProductsReportData = { range: r, content: itemContent, rows };
      const stampAll = r.startDate === r.endDate ? r.startDate : `${r.startDate}_to_${r.endDate}`;
      downloadAllProductsReport(allData, `Wolfion_AllProducts_${stampAll}.pdf`);
      return;
    }

    const prod = productionEntries
      .filter((e) => e.productType === itemProduct && inDateRange(e.date, r.startDate, r.endDate))
      .map((e) => ({ date: e.date, productType: e.productType, quantityDozen: e.quantityDozen }));
    const sls = salesEntries
      .filter((s) => s.productType === itemProduct && inDateRange(s.date || s.createdAt.slice(0, 10), r.startDate, r.endDate))
      .map((s) => ({
        date: s.date || s.createdAt.slice(0, 10),
        customerName: s.customerName,
        productType: s.productType,
        quantityDozen: s.quantityDozen,
        totalValue: s.totalValue,
        costOfGoods: saleCostOfGoods(productConfigs, yarnPurchases, s),
      }));

    const data: WolfionItemReportData = {
      range: r,
      productType: itemProduct,
      productLabel: productTypeLabels[itemProduct] || itemProduct,
      content: itemContent,
      currentStockDozen: inv[itemProduct] || 0,
      production: prod,
      sales: sls,
    };
    const label = (productTypeLabels[itemProduct] || itemProduct).replace(/[^a-z0-9]+/gi, "-");
    const stamp = r.startDate === r.endDate ? r.startDate : `${r.startDate}_to_${r.endDate}`;
    downloadItemReport(data, `Wolfion_${label}_${stamp}.pdf`);
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
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {(["daily", "monthly", "yearly", "alltime", "custom"] as Mode[]).map((m) => (
                <Button key={m} type="button" variant={mode === m ? "default" : "outline"} className="capitalize h-12" onClick={() => setMode(m)}>
                  {m === "alltime" ? "All time" : m}
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
                <p className="text-2xl font-bold mt-1">Tk {previewStats.salesAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{previewStats.salesDz.toLocaleString()} dz sold</p>
              </div>
              <div className="rounded-2xl border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground"><Package className="h-3.5 w-3.5" /> Production cost</div>
                <p className="text-2xl font-bold mt-1">Tk {previewStats.totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              </div>
              <div className={`rounded-2xl border p-4 ${previewStats.profit >= 0 ? "bg-green-100/40 dark:bg-green-900/20" : "bg-red-100/40 dark:bg-red-900/20"}`}>
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground"><TrendingUp className="h-3.5 w-3.5" /> Profit</div>
                <p className={`text-2xl font-bold mt-1 ${previewStats.profit >= 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                  Tk {previewStats.profit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <Button onClick={handleDownload} size="lg" className="w-full h-14 text-base font-semibold">
              <FileDown className="h-5 w-5" /> Download PDF Report
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/30 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Single-item detailed report</CardTitle>
            <CardDescription>Full history for one product — pick what to include and the time period.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Product */}
            <div className="space-y-2 max-w-sm">
              <label className="text-sm font-medium">Product</label>
              <Select value={itemProduct} onValueChange={setItemProduct}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Choose a product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All products (totals only)</SelectItem>
                  {allProductTypeIds.map((id) => (
                    <SelectItem key={id} value={id}>{productTypeLabels[id] || id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* What to include */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Include in report</label>
              <div className="grid grid-cols-3 gap-2 max-w-md">
                {([
                  ["all", "All history"],
                  ["production", "Production only"],
                  ["sales", "Sales only"],
                ] as [ItemReportContent, string][]).map(([val, label]) => (
                  <Button key={val} type="button" variant={itemContent === val ? "default" : "outline"} className="h-12 text-sm px-2" onClick={() => setItemContent(val)}>
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Period */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Time period</label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {(["daily", "weekly", "monthly", "yearly", "alltime", "custom"] as ItemMode[]).map((m) => (
                  <Button key={m} type="button" variant={itemMode === m ? "default" : "outline"} className="capitalize h-12 px-1 text-sm" onClick={() => setItemMode(m)}>
                    {m === "alltime" ? "All time" : m}
                  </Button>
                ))}
              </div>
            </div>

            {itemMode === "daily" && (
              <div className="space-y-2 max-w-sm">
                <label className="text-sm font-medium" htmlFor="item-date">Date</label>
                <Input id="item-date" type="date" className="h-12 text-base" value={itemDate} max={getToday()} onChange={(e) => setItemDate(e.target.value)} />
              </div>
            )}
            {itemMode === "weekly" && (
              <div className="space-y-2 max-w-sm">
                <label className="text-sm font-medium" htmlFor="item-week">Week</label>
                <Input id="item-week" type="week" className="h-12 text-base" value={itemWeek} onChange={(e) => setItemWeek(e.target.value)} />
              </div>
            )}
            {itemMode === "monthly" && (
              <div className="space-y-2 max-w-sm">
                <label className="text-sm font-medium" htmlFor="item-month">Month</label>
                <Input id="item-month" type="month" className="h-12 text-base" value={itemMonth} onChange={(e) => setItemMonth(e.target.value)} />
              </div>
            )}
            {itemMode === "yearly" && (
              <div className="space-y-2 max-w-sm">
                <label className="text-sm font-medium" htmlFor="item-year">Year</label>
                <Input id="item-year" type="number" min="2000" max="2100" className="h-12 text-base" value={itemYear} onChange={(e) => setItemYear(e.target.value)} />
              </div>
            )}
            {itemMode === "custom" && (
              <div className="grid gap-3 sm:grid-cols-2 max-w-xl">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="item-start">Start date</label>
                  <Input id="item-start" type="date" className="h-12 text-base" value={itemCustomStart} onChange={(e) => setItemCustomStart(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="item-end">End date</label>
                  <Input id="item-end" type="date" className="h-12 text-base" value={itemCustomEnd} onChange={(e) => setItemCustomEnd(e.target.value)} />
                </div>
              </div>
            )}

            {itemError && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{itemError}</p>
            )}

            <Button onClick={handleDownloadItem} size="lg" className="w-full h-14 text-base font-semibold">
              <FileDown className="h-5 w-5" /> Download item report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Current inventory snapshot</CardTitle>
            <CardDescription>Live stock per product type.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5 lg:gap-3">
              {allProductTypeIds.filter((id) => id !== FOOTBALL_TOP_ID && id !== FOOTBALL_BOTTOM_ID && id !== LEGACY_FOOTBALL_ID).map((id) => (
                <div key={id} className="rounded-2xl border bg-white dark:bg-muted/30 p-3 sm:p-4 shadow-sm text-center">
                  <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wide text-muted-foreground leading-tight break-words">{productTypeLabels[id] || id}</p>
                  <p className="text-lg sm:text-2xl font-bold mt-1.5 sm:mt-1">{(inv[id] || 0).toLocaleString()} <span className="text-[10px] sm:text-sm font-normal text-muted-foreground">dz</span></p>
                </div>
              ))}
              {allProductTypeIds.some((id) => id === FOOTBALL_TOP_ID || id === FOOTBALL_BOTTOM_ID) && (
                <FootballStockCard top={inv[FOOTBALL_TOP_ID] || 0} bottom={inv[FOOTBALL_BOTTOM_ID] || 0} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
