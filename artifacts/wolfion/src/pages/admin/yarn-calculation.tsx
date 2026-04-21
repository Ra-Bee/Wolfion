import { useMemo, useState, type FormEvent } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Wrench, Plus, Trash2, Package } from "lucide-react";
import {
  STORAGE_KEYS,
  defaultProductTypes,
  defaultYarnPerDozen,
  initialInventory,
  formatDateLabel,
  getToday,
  useStored,
  useStoredNumber,
  type ProductTypeOption,
  type ProductionEntry,
  type SaleEntry,
  type DailyProductionEntry,
  type YarnPurchase,
  type YarnPerDozen,
  type YarnUsageEntry,
} from "@/lib/wolfion-store";

export default function YarnCalculationPage() {
  const [productTypes] = useStored<ProductTypeOption[]>(STORAGE_KEYS.productTypes, defaultProductTypes);
  const [productionEntries] = useStored<ProductionEntry[]>(STORAGE_KEYS.production, []);
  const [salesEntries] = useStored<SaleEntry[]>(STORAGE_KEYS.sales, []);
  const [dailyEntries] = useStored<DailyProductionEntry[]>(STORAGE_KEYS.daily, []);
  const [yarnPurchases, setYarnPurchases] = useStored<YarnPurchase[]>(STORAGE_KEYS.yarnPurchases, []);
  const [yarnPerDozen, setYarnPerDozen] = useStored<YarnPerDozen>(STORAGE_KEYS.yarnPerDozen, defaultYarnPerDozen);
  const [yarnUsageEntries] = useStored<YarnUsageEntry[]>(STORAGE_KEYS.yarnUsage, []);
  const [yarnStockKg] = useStoredNumber(STORAGE_KEYS.yarnStock, 0);

  const productTypeLabels = useMemo(() => {
    const m: Record<string, string> = {};
    for (const t of productTypes) m[t.id] = t.label;
    return m;
  }, [productTypes]);
  const allProductTypeIds = useMemo(() => productTypes.map((t) => t.id), [productTypes]);

  const inv = useMemo(() => {
    const stock: Record<string, number> = {};
    for (const id of allProductTypeIds) stock[id] = initialInventory[id] || 0;
    for (const e of productionEntries) stock[e.productType] = (stock[e.productType] || 0) + e.quantityDozen;
    for (const s of salesEntries) stock[s.productType] = (stock[s.productType] || 0) - s.quantityDozen;
    return stock;
  }, [productionEntries, salesEntries, allProductTypeIds]);

  const totalPurchasedKg = yarnPurchases.reduce((a, b) => a + b.kg, 0);
  const totalUsedFromUsage = yarnUsageEntries.reduce((a, b) => a + b.kgUsed, 0);
  const totalUsedFromDaily = dailyEntries.reduce((a, b) => a + (b.yarnUsedKg || 0), 0);
  const totalUsedKg = totalUsedFromUsage + totalUsedFromDaily;
  const availableKg = yarnStockKg + totalPurchasedKg;
  const remainingKg = Math.max(0, availableKg - totalUsedKg);
  const efficiencyPct = availableKg > 0 ? (totalUsedKg / availableKg) * 100 : 0;
  const futureYarnNeed = allProductTypeIds.reduce((sum, id) => sum + (inv[id] || 0) * (yarnPerDozen[id] || 0), 0);

  const [purchaseDate, setPurchaseDate] = useState(getToday());
  const [purchaseKg, setPurchaseKg] = useState("");
  const [error, setError] = useState("");

  function handleAddPurchase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const kg = Number(purchaseKg);
    if (!Number.isFinite(kg) || kg <= 0) { setError("Please enter a valid quantity in kg."); return; }
    if (!purchaseDate) { setError("Please choose a date."); return; }
    setError("");
    const entry: YarnPurchase = {
      id: crypto.randomUUID(),
      date: purchaseDate,
      kg,
      createdAt: new Date().toISOString(),
    };
    setYarnPurchases((prev) => [entry, ...prev]);
    setPurchaseKg("");
  }

  function handleRemovePurchase(id: string) {
    setYarnPurchases((prev) => prev.filter((p) => p.id !== id));
  }

  function updatePerDozen(id: string, value: string) {
    const num = Number(value);
    setYarnPerDozen((prev) => ({ ...prev, [id]: Number.isFinite(num) && num >= 0 ? num : 0 }));
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2"><Wrench className="h-7 w-7 text-primary" /> Yarn Calculation</h1>
          <p className="text-muted-foreground mt-1">Track yarn purchases, usage, efficiency, and future needs.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl border bg-primary/5 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total purchased</p>
            <p className="text-2xl font-bold mt-1">{totalPurchasedKg.toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-sm font-normal text-muted-foreground">kg</span></p>
          </div>
          <div className="rounded-2xl border bg-muted/30 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total used</p>
            <p className="text-2xl font-bold mt-1">{totalUsedKg.toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-sm font-normal text-muted-foreground">kg</span></p>
          </div>
          <div className="rounded-2xl border bg-muted/30 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Remaining stock</p>
            <p className="text-2xl font-bold mt-1">{remainingKg.toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-sm font-normal text-muted-foreground">kg</span></p>
          </div>
          <div className="rounded-2xl border bg-muted/30 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Efficiency</p>
            <p className="text-2xl font-bold mt-1">{efficiencyPct.toFixed(1)}%</p>
          </div>
          <div className="rounded-2xl border bg-orange-100/40 dark:bg-orange-900/20 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Future need</p>
            <p className="text-2xl font-bold mt-1">{futureYarnNeed.toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-sm font-normal text-muted-foreground">kg</span></p>
            <p className="text-[10px] text-muted-foreground mt-1">For current inventory</p>
          </div>
        </div>

        <Card className="border-2 border-primary/30 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2"><Package className="h-5 w-5 text-primary" /> Yarn purchases</CardTitle>
            <CardDescription>Log every yarn purchase to track total stock available.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAddPurchase} className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="yp-date">Date</label>
                <Input id="yp-date" type="date" className="h-12 text-base" max={getToday()} value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="yp-kg">Quantity (kg)</label>
                <Input id="yp-kg" type="number" min="0" step="0.01" inputMode="decimal" className="h-12 text-base" placeholder="" value={purchaseKg} onChange={(e) => setPurchaseKg(e.target.value)} required />
              </div>
              <div className="space-y-2 flex items-end">
                <Button type="submit" size="lg" className="h-12 w-full">
                  <Plus className="h-4 w-4" /> Add purchase
                </Button>
              </div>
            </form>
            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{error}</p>
            )}

            {yarnPurchases.length > 0 && (
              <div className="rounded-2xl border divide-y max-h-80 overflow-y-auto">
                {yarnPurchases.map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="font-medium">{p.kg.toLocaleString(undefined, { maximumFractionDigits: 2 })} kg</p>
                      <p className="text-xs text-muted-foreground">{formatDateLabel(p.date)}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemovePurchase(p.id)} aria-label="Remove">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Yarn used per dozen</CardTitle>
            <CardDescription>Average yarn consumed (in kg) to produce one dozen of each product.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                    onChange={(e) => updatePerDozen(id, e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">kg per dozen</p>
                </div>
              ))}
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">Future yarn needed by product</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="py-2 pr-4">Product</th>
                      <th className="py-2 pr-4">Stock (dz)</th>
                      <th className="py-2 pr-4">Per dozen (kg)</th>
                      <th className="py-2">Yarn needed (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allProductTypeIds.map((id) => {
                      const stock = inv[id] || 0;
                      const perDz = yarnPerDozen[id] || 0;
                      const need = stock * perDz;
                      return (
                        <tr key={id} className="border-b last:border-0">
                          <td className="py-3 pr-4 font-medium">{productTypeLabels[id] || id}</td>
                          <td className="py-3 pr-4">{stock.toLocaleString()}</td>
                          <td className="py-3 pr-4">{perDz.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                          <td className="py-3 font-semibold">{need.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
