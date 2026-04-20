import { AppLayout } from "@/components/layout";
import { adminMetrics } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, DollarSign, Package, Factory, TrendingUp, Plus, Zap } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEffect, useMemo, useState, type FormEvent } from "react";

type ProductType = "short-socks" | "ankle-socks" | "kids-socks";

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
};

type YarnUsageEntry = {
  id: string;
  productType: ProductType;
  kgUsed: number;
  createdAt: string;
};

const productTypeLabels: Record<ProductType, string> = {
  "short-socks": "Short socks",
  "ankle-socks": "Ankle socks",
  "kids-socks": "Kids socks",
};

const initialInventory: Record<ProductType, number> = {
  "short-socks": 320,
  "ankle-socks": 260,
  "kids-socks": 140,
};

const productionStorageKey = "wolfion_production_entries";
const salesStorageKey = "wolfion_sales_entries";
const yarnStockStorageKey = "wolfion_yarn_stock_kg";
const yarnUsageStorageKey = "wolfion_yarn_usage_entries";
const costStorageKey = "wolfion_cost_inputs";

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
  const [saleError, setSaleError] = useState("");
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
  const [quickSaleOpen, setQuickSaleOpen] = useState(false);
  const [quickSaleConfirm, setQuickSaleConfirm] = useState("");
  const [yarnCostInput, setYarnCostInput] = useState(() => (costs.yarnCostPerDozen ? String(costs.yarnCostPerDozen) : ""));
  const [laborCostInput, setLaborCostInput] = useState(() => (costs.laborCostPerDozen ? String(costs.laborCostPerDozen) : ""));
  const [packagingCostInput, setPackagingCostInput] = useState(() => (costs.packagingCostPerDozen ? String(costs.packagingCostPerDozen) : ""));

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

  const inventory = useMemo(() => {
    const stockAfterProduction = productionEntries.reduce<Record<ProductType, number>>(
      (stock, entry) => ({
        ...stock,
        [entry.productType]: stock[entry.productType] + entry.quantityDozen,
      }),
      { ...initialInventory },
    );

    return salesEntries.reduce<Record<ProductType, number>>(
      (stock, entry) => ({
        ...stock,
        [entry.productType]: Math.max(0, stock[entry.productType] - entry.quantityDozen),
      }),
      stockAfterProduction,
    );
  }, [productionEntries, salesEntries]);

  const totalInventoryDozen = Object.values(inventory).reduce((total, value) => total + value, 0);
  const totalProducedDozen = productionEntries.reduce((total, entry) => total + entry.quantityDozen, 0);
  const totalSoldDozen = salesEntries.reduce((total, entry) => total + entry.quantityDozen, 0);
  const totalSalesValue = salesEntries.reduce((total, entry) => total + entry.totalValue, 0);
  const productionByType = useMemo(() => {
    return productionEntries.reduce<Record<ProductType, number>>(
      (totals, entry) => ({
        ...totals,
        [entry.productType]: totals[entry.productType] + entry.quantityDozen,
      }),
      { "short-socks": 0, "ankle-socks": 0, "kids-socks": 0 },
    );
  }, [productionEntries]);
  const salesByType = useMemo(() => {
    return salesEntries.reduce<Record<ProductType, number>>(
      (totals, entry) => ({
        ...totals,
        [entry.productType]: totals[entry.productType] + entry.quantityDozen,
      }),
      { "short-socks": 0, "ankle-socks": 0, "kids-socks": 0 },
    );
  }, [salesEntries]);
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
  const costPerDozen = costs.yarnCostPerDozen + costs.laborCostPerDozen + costs.packagingCostPerDozen;
  const totalCostOfSales = totalSoldDozen * costPerDozen;
  const totalProfit = totalSalesValue - totalCostOfSales;
  const averageProfitPerSale = salesEntries.length > 0 ? totalProfit / salesEntries.length : 0;

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
    const pricePerDozen = Number(salePrice);

    if (!customerName.trim() || !Number.isFinite(quantityDozen) || quantityDozen <= 0 || !Number.isFinite(pricePerDozen) || pricePerDozen <= 0) {
      setSaleError("Enter customer name, quantity, and selling price.");
      return;
    }

    if (quantityDozen > inventory[saleProductType]) {
      setSaleError(`Only ${inventory[saleProductType].toLocaleString()} dozen ${productTypeLabels[saleProductType].toLowerCase()} available.`);
      return;
    }

    const totalValue = quantityDozen * pricePerDozen;
    const entry: SaleEntry = {
      id: crypto.randomUUID(),
      customerName: customerName.trim(),
      productType: saleProductType,
      quantityDozen,
      pricePerDozen,
      totalValue,
      createdAt: new Date().toISOString(),
    };

    setSalesEntries((current) => [entry, ...current]);
    setCustomerName("");
    setSaleProductType("short-socks");
    setSaleQuantity("");
    setSalePrice("");
    setSaleError("");
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

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Overview of operations, sales, and inventory.</p>
          </div>
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
                  if (customerName.trim() && Number(saleQuantity) > 0 && Number(salePrice) > 0 && Number(saleQuantity) <= inventory[saleProductType]) {
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
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="quick-product">Product</label>
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
                      placeholder="10"
                      value={saleQuantity}
                      onChange={(event) => setSaleQuantity(event.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="quick-price">Price / dozen</label>
                    <Input
                      id="quick-price"
                      type="number"
                      min="1"
                      step="0.01"
                      inputMode="decimal"
                      className="h-12 text-base"
                      placeholder="120"
                      value={salePrice}
                      onChange={(event) => setSalePrice(event.target.value)}
                      required
                    />
                  </div>
                </div>
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(adminMetrics.financials.monthlyRevenue + totalSalesValue).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">${totalSalesValue.toLocaleString()} entered in Sales</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Units Sold</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSoldDozen.toLocaleString()} dozen</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-600 font-medium flex items-center inline-flex">
                  <TrendingUp className="h-3 w-3 mr-1" /> Sales entered
                </span>
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Active Production</CardTitle>
              <Factory className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{productionEntries.length || adminMetrics.production.activeBatches} Batches</div>
              <p className="text-xs text-muted-foreground mt-1">{totalProducedDozen.toLocaleString()} dozen added to stock</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Inventory</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInventoryDozen.toLocaleString()} dozen</div>
              <p className="text-xs text-muted-foreground mt-1">Production adds, sales reduce stock</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalProfit >= 0 ? "text-green-700" : "text-destructive"}`}>
                ${totalProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Cost ${costPerDozen.toLocaleString(undefined, { maximumFractionDigits: 2 })}/dozen
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <Card>
            <CardHeader>
              <CardTitle>Production</CardTitle>
              <CardDescription>Add finished production in dozen. Inventory increases automatically.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddProduction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="production-date">Date</label>
                  <Input
                    id="production-date"
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="product-type">Product type</label>
                  <Select value={productType} onValueChange={(value) => setProductType(value as ProductType)}>
                    <SelectTrigger id="product-type">
                      <SelectValue placeholder="Choose product" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(productTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="quantity-dozen">Quantity in dozen</label>
                  <Input
                    id="quantity-dozen"
                    type="number"
                    min="1"
                    step="1"
                    inputMode="numeric"
                    placeholder="Example: 25"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    required
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" size="lg" className="h-12 w-full text-base font-semibold">
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              </form>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Recent production</h3>
                  <span className="text-xs text-muted-foreground">{productionEntries.length} records</span>
                </div>
                {recentProductionEntries.length > 0 ? (
                  <div className="space-y-3">
                    {recentProductionEntries.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between rounded-xl border bg-card/60 p-3">
                        <div>
                          <p className="text-sm font-medium">{productTypeLabels[entry.productType]}</p>
                          <p className="text-xs text-muted-foreground">{new Date(`${entry.date}T00:00:00`).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{entry.quantityDozen.toLocaleString()} dozen</p>
                          <p className="text-xs text-primary">Added to inventory</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed p-5 text-center">
                    <p className="text-sm font-medium">No production added yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Add the first batch to update inventory stock.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
              <CardDescription>Current stock per product, updated from production and sales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full min-w-[520px] text-sm">
                  <thead className="bg-muted/60 text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Product</th>
                      <th className="px-4 py-3 text-right font-medium">Opening stock</th>
                      <th className="px-4 py-3 text-right font-medium">Produced</th>
                      <th className="px-4 py-3 text-right font-medium">Sold</th>
                      <th className="px-4 py-3 text-right font-medium">Current stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Object.keys(productTypeLabels) as ProductType[]).map((type) => (
                      <tr key={type} className="border-t">
                        <td className="px-4 py-3 font-medium">{productTypeLabels[type]}</td>
                        <td className="px-4 py-3 text-right">{initialInventory[type].toLocaleString()} dozen</td>
                        <td className="px-4 py-3 text-right text-green-700">+{productionByType[type].toLocaleString()} dozen</td>
                        <td className="px-4 py-3 text-right text-destructive">-{salesByType[type].toLocaleString()} dozen</td>
                        <td className="px-4 py-3 text-right font-bold">{inventory[type].toLocaleString()} dozen</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sales</CardTitle>
            <CardDescription>Enter customer sales in dozen. Stock reduces automatically and total revenue is calculated.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddSale} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr_auto]">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="customer-name">Customer name</label>
                <Input
                  id="customer-name"
                  placeholder="Customer name"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="sale-product-type">Product type</label>
                <Select value={saleProductType} onValueChange={(value) => setSaleProductType(value as ProductType)}>
                  <SelectTrigger id="sale-product-type">
                    <SelectValue placeholder="Choose product" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(productTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="sale-quantity">Quantity sold in dozen</label>
                <Input
                  id="sale-quantity"
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  placeholder="Example: 10"
                  value={saleQuantity}
                  onChange={(event) => setSaleQuantity(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="sale-price">Selling price</label>
                <Input
                  id="sale-price"
                  type="number"
                  min="1"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="Example: 120"
                  value={salePrice}
                  onChange={(event) => setSalePrice(event.target.value)}
                  required
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" size="lg" className="h-12 w-full text-base font-semibold">
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
            </form>

            {saleError && (
              <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{saleError}</p>
            )}

            <div className="mt-6 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-2xl border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">Total revenue</p>
                <p className="mt-2 text-3xl font-bold">${totalSalesValue.toLocaleString()}</p>
                <p className="mt-1 text-xs text-muted-foreground">{totalSoldDozen.toLocaleString()} dozen sold across {salesEntries.length} records</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Recent sales</h3>
                  <span className="text-xs text-muted-foreground">{salesEntries.length} records</span>
                </div>
                {recentSalesEntries.length > 0 ? (
                  <div className="space-y-3">
                    {recentSalesEntries.map((sale) => (
                      <div key={sale.id} className="flex items-center justify-between rounded-xl border bg-card/60 p-3">
                        <div>
                          <p className="text-sm font-medium">{sale.customerName}</p>
                          <p className="text-xs text-muted-foreground">{sale.quantityDozen.toLocaleString()} dozen {productTypeLabels[sale.productType].toLowerCase()} at ${sale.pricePerDozen.toLocaleString()} per dozen</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">${sale.totalValue.toLocaleString()}</p>
                          <p className="text-xs text-primary">Stock reduced</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed p-5 text-center">
                    <p className="text-sm font-medium">No sales entered yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Add a sale to calculate value and reduce inventory.</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Yarn Management</CardTitle>
              <CardDescription>Add current yarn stock and yarn usage per production.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border bg-muted/30 p-4">
                    <p className="text-xs text-muted-foreground">Current stock</p>
                    <p className="mt-2 text-2xl font-bold">{yarnStockKg.toLocaleString()} kg</p>
                  </div>
                  <div className="rounded-2xl border bg-muted/30 p-4">
                    <p className="text-xs text-muted-foreground">Remaining yarn</p>
                    <p className="mt-2 text-2xl font-bold">{remainingYarnKg.toLocaleString()} kg</p>
                  </div>
                  <div className="rounded-2xl border bg-muted/30 p-4">
                    <p className="text-xs text-muted-foreground">7-day shortage</p>
                    <p className={`mt-2 text-2xl font-bold ${estimatedYarnShortageKg > 0 ? "text-destructive" : "text-green-700"}`}>
                      {estimatedYarnShortageKg.toLocaleString()} kg
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSetYarnStock} className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="current-yarn-stock">Current yarn stock (kg)</label>
                    <Input
                      id="current-yarn-stock"
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      placeholder="Example: 500"
                      value={currentYarnStock}
                      onChange={(event) => setCurrentYarnStock(event.target.value)}
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" size="lg" className="h-12 w-full text-base font-semibold">Update stock</Button>
                  </div>
                </form>

                <form onSubmit={handleAddYarnUsage} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="yarn-product-type">Production product</label>
                    <Select value={yarnUsageProductType} onValueChange={(value) => setYarnUsageProductType(value as ProductType)}>
                      <SelectTrigger id="yarn-product-type">
                        <SelectValue placeholder="Choose product" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(productTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="yarn-usage-kg">Yarn usage per production (kg)</label>
                    <Input
                      id="yarn-usage-kg"
                      type="number"
                      min="0.01"
                      step="0.01"
                      inputMode="decimal"
                      placeholder="Example: 18"
                      value={yarnUsageKg}
                      onChange={(event) => setYarnUsageKg(event.target.value)}
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" size="lg" className="h-12 w-full text-base font-semibold">
                      <Plus className="h-4 w-4" />
                      Add usage
                    </Button>
                  </div>
                </form>

                {yarnError && (
                  <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{yarnError}</p>
                )}

                <div className="rounded-xl border bg-card/60 p-4">
                  <p className="text-sm font-semibold">Shortage estimate</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Based on {yarnUsedLast7Days.toLocaleString()} kg used in the last 7 days. Estimated need for the next 7 days is {estimatedSevenDayNeedKg.toLocaleString()} kg.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Yarn Usage</CardTitle>
              <CardDescription>Latest yarn used for production</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentYarnUsageEntries.length > 0 ? recentYarnUsageEntries.map((entry) => (
                  <div key={entry.id} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">{productTypeLabels[entry.productType]}</p>
                      <p className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-sm font-medium">{entry.kgUsed.toLocaleString()} kg</div>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground">Yarn usage entered above will appear here.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cost Tracking</CardTitle>
            <CardDescription>Enter cost per dozen. Profit calculates automatically from sales.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveCosts} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="yarn-cost">Yarn cost per dozen</label>
                <Input
                  id="yarn-cost"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="Example: 40"
                  value={yarnCostInput}
                  onChange={(event) => setYarnCostInput(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="labor-cost">Labor cost per dozen</label>
                <Input
                  id="labor-cost"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="Example: 20"
                  value={laborCostInput}
                  onChange={(event) => setLaborCostInput(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="packaging-cost">Packaging cost per dozen</label>
                <Input
                  id="packaging-cost"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="Example: 8"
                  value={packagingCostInput}
                  onChange={(event) => setPackagingCostInput(event.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" size="lg" className="h-12 w-full text-base font-semibold">Save costs</Button>
              </div>
            </form>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">Cost per dozen</p>
                <p className="mt-2 text-2xl font-bold">${costPerDozen.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="mt-1 text-xs text-muted-foreground">Yarn + labor + packaging</p>
              </div>
              <div className="rounded-2xl border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">Average profit per sale</p>
                <p className={`mt-2 text-2xl font-bold ${averageProfitPerSale >= 0 ? "text-green-700" : "text-destructive"}`}>
                  ${averageProfitPerSale.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Across {salesEntries.length} sales</p>
              </div>
              <div className="rounded-2xl border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">Total profit</p>
                <p className={`mt-2 text-2xl font-bold ${totalProfit >= 0 ? "text-green-700" : "text-destructive"}`}>
                  ${totalProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Revenue ${totalSalesValue.toLocaleString()} − Cost ${totalCostOfSales.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              </div>
            </div>

            {salesEntries.length > 0 && (
              <div className="mt-6 overflow-x-auto rounded-xl border">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="bg-muted/60 text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Customer</th>
                      <th className="px-4 py-3 text-left font-medium">Product</th>
                      <th className="px-4 py-3 text-right font-medium">Quantity</th>
                      <th className="px-4 py-3 text-right font-medium">Revenue</th>
                      <th className="px-4 py-3 text-right font-medium">Cost</th>
                      <th className="px-4 py-3 text-right font-medium">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesEntries.slice(0, 6).map((sale) => {
                      const cost = sale.quantityDozen * costPerDozen;
                      const profit = sale.totalValue - cost;
                      return (
                        <tr key={sale.id} className="border-t">
                          <td className="px-4 py-3 font-medium">{sale.customerName}</td>
                          <td className="px-4 py-3">{productTypeLabels[sale.productType]}</td>
                          <td className="px-4 py-3 text-right">{sale.quantityDozen.toLocaleString()} dozen</td>
                          <td className="px-4 py-3 text-right">${sale.totalValue.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right">${cost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                          <td className={`px-4 py-3 text-right font-bold ${profit >= 0 ? "text-green-700" : "text-destructive"}`}>
                            ${profit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
