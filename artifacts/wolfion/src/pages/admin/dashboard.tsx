import { AppLayout } from "@/components/layout";
import { adminMetrics } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, DollarSign, Package, Factory, TrendingUp, Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
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

  useEffect(() => {
    localStorage.setItem(productionStorageKey, JSON.stringify(productionEntries));
  }, [productionEntries]);

  useEffect(() => {
    localStorage.setItem(salesStorageKey, JSON.stringify(salesEntries));
  }, [salesEntries]);

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
  const recentProductionEntries = productionEntries.slice(0, 4);
  const recentSalesEntries = salesEntries.slice(0, 4);

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

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of operations, sales, and inventory.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                  <Button type="submit" className="w-full">
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
              <CardDescription>Current stock by product type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(Object.keys(productTypeLabels) as ProductType[]).map((type) => (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{productTypeLabels[type]}</span>
                      <span className="text-sm font-bold">{inventory[type].toLocaleString()} dozen</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${Math.min(100, (inventory[type] / Math.max(totalInventoryDozen, 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
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
                <Button type="submit" className="w-full">
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
              <CardTitle>Yarn Supply</CardTitle>
              <CardDescription>Current raw material levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">Cotton Blend</div>
                  <div className="text-sm">{adminMetrics.yarn.cottonBlend}</div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">Merino Wool</div>
                  <div className="text-sm">{adminMetrics.yarn.merinoWool}</div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">Elastane</div>
                  <div className="text-sm text-amber-600 font-medium">{adminMetrics.yarn.elastane} (Reorder soon)</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Sales Activity</CardTitle>
              <CardDescription>Latest entered sales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSalesEntries.length > 0 ? recentSalesEntries.map((sale) => (
                  <div key={sale.id} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">{sale.customerName}</p>
                      <p className="text-xs text-muted-foreground">{sale.quantityDozen} dozen {productTypeLabels[sale.productType].toLowerCase()}</p>
                    </div>
                    <div className="text-sm font-medium">${sale.totalValue.toLocaleString()}</div>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground">Sales entered above will appear here.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
