import { Fragment, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { productTypeImage } from "@/lib/product-images";
import { Separator } from "@/components/ui/separator";
import { Factory, Plus, Package, Sparkles } from "lucide-react";
import { ManageEntriesDialog } from "@/components/admin/manage-entries-dialog";
import { ReceiptCapture, ReceiptThumb } from "@/components/admin/receipt-capture";
import { EmptyState } from "@/components/admin/empty-state";
import { ListFilter, useListFilter } from "@/components/admin/list-filter";
import {
  STORAGE_KEYS,
  defaultProductTypes,
  formatDateLabel,
  formatNum,
  formatTk,
  getToday,
  computeProductYarn,
  recipeForProduct,
  defaultProductConfigs,
  RECIPE_PRODUCT_TYPE_ID,
  PACKAGING_COST_PER_DOZEN,
  IRON_COST_PER_DOZEN,
  OVERHEAD_COST_PER_DOZEN,
  PER_DOZEN_COST_ITEMS,
  TOTAL_PER_DOZEN_FIXED_COST,
  type DailyProductionEntry,
  type ProductConfig,
  type ProductionEntry,
  type ProductTypeOption,
  type YarnUsageEntry,
  type YarnPurchase,
  type WorkLog,
} from "@/lib/wolfion-store";
import { useCloudStored } from "@/lib/cloud-store";

const fmt = formatNum;
const money = formatTk;

export default function DailyProductionPage() {
  const [productTypes] = useCloudStored<ProductTypeOption[]>(STORAGE_KEYS.productTypes, defaultProductTypes);
  const [productConfigs] = useCloudStored<ProductConfig[]>(STORAGE_KEYS.productConfigs, defaultProductConfigs);
  const [dailyEntries, setDailyEntries] = useCloudStored<DailyProductionEntry[]>(STORAGE_KEYS.daily, []);
  const [productionEntries, setProductionEntries] = useCloudStored<ProductionEntry[]>(STORAGE_KEYS.production, []);
  const [yarnUsageEntries, setYarnUsageEntries] = useCloudStored<YarnUsageEntry[]>(STORAGE_KEYS.yarnUsage, []);
  const [yarnPurchases] = useCloudStored<YarnPurchase[]>(STORAGE_KEYS.yarnPurchases, []);
  const [, setWorkLogs] = useCloudStored<WorkLog[]>(STORAGE_KEYS.workLogs, []);

  const [date, setDate] = useState(getToday());
  const [productType, setProductType] = useState(RECIPE_PRODUCT_TYPE_ID || productTypes[0]?.id || "");
  const [qty, setQty] = useState("");
  const [receiptImage, setReceiptImage] = useState<string | undefined>(undefined);
  const [error, setError] = useState("");

  const labelById = useMemo(() => Object.fromEntries(productTypes.map((p) => [p.id, p.label])), [productTypes]);

  const [filter, setFilter, matches] = useListFilter();
  const filteredDaily = useMemo(
    () => dailyEntries.filter((e) => matches(e.date, e.productType ? labelById[e.productType] || e.productType : "")),
    [dailyEntries, matches, labelById],
  );

  const recipe = useMemo(() => recipeForProduct(productConfigs, productType), [productConfigs, productType]);
  const hasRecipe = recipe.length > 0;

  // Live, auto-calculated cost breakdown from the current form inputs.
  const calc = useMemo(() => {
    const q = Number(qty) || 0;
    const yarn = computeProductYarn(recipe, q, yarnPurchases, date);
    const items = PER_DOZEN_COST_ITEMS.map((it) => ({ ...it, cost: it.perDozen * q }));
    const fixedTotal = TOTAL_PER_DOZEN_FIXED_COST * q;
    const totalCost = yarn.totalCost + fixedTotal;
    return {
      q,
      yarn,
      items,
      fixedTotal,
      totalCost,
      costPerDozen: q > 0 ? totalCost / q : 0,
    };
  }, [qty, recipe, yarnPurchases, date]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const q = Number(qty);
    if (!date) return setError("Date is required.");
    if (!productType) return setError("Product type is required.");
    if (!Number.isFinite(q) || q <= 0) return setError("Quantity must be greater than zero.");

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const yarn = computeProductYarn(recipe, q, yarnPurchases, date);
    const packagingCost = PACKAGING_COST_PER_DOZEN * q;
    const ironCost = IRON_COST_PER_DOZEN * q;
    const laborCost = OVERHEAD_COST_PER_DOZEN * q; // rent + flip staff + sewing + electricity + salary
    const totalCost = yarn.totalCost + packagingCost + ironCost + laborCost;

    const dailyEntry: DailyProductionEntry = {
      id,
      date,
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
      productType,
      createdAt,
      ...(receiptImage ? { receiptImage } : {}),
    };
    setDailyEntries((prev) => [dailyEntry, ...prev]);

    const prodEntry: ProductionEntry = { id: crypto.randomUUID(), date, productType, quantityDozen: q, sourceDailyId: id };
    setProductionEntries((prev) => [prodEntry, ...prev]);

    if (yarn.totalKg > 0) {
      const usage: YarnUsageEntry = { id: crypto.randomUUID(), productType, kgUsed: yarn.totalKg, createdAt, sourceDailyId: id };
      setYarnUsageEntries((prev) => [usage, ...prev]);
    }

    setQty("");
    setReceiptImage(undefined);
  };

  const handleDelete = (id: string) => {
    setDailyEntries((prev) => prev.filter((e) => e.id !== id));
    setProductionEntries((prev) => prev.filter((p) => p.sourceDailyId !== id));
    setYarnUsageEntries((prev) => prev.filter((u) => u.sourceDailyId !== id));
    // Clear any legacy staff bills that older entries may have created.
    setWorkLogs((prev) => prev.filter((l) => l.sourceDailyId !== id));
  };

  // Edit recomputes every auto cost from the new date/quantity, and keeps the
  // linked production + yarn-usage records in sync.
  const handleEditSave = (id: string, patch: Partial<DailyProductionEntry>) => {
    let updatedEntry: DailyProductionEntry | null = null;
    setDailyEntries((prev) => prev.map((e) => {
      if (e.id !== id) return e;
      const merged = { ...e, ...patch };
      const q = Number(merged.totalProductionDozen) || 0;
      const d = merged.date;
      const entryRecipe = recipeForProduct(productConfigs, merged.productType);
      const yarn = computeProductYarn(entryRecipe, q, yarnPurchases, d);
      const packagingCost = PACKAGING_COST_PER_DOZEN * q;
      const ironCost = IRON_COST_PER_DOZEN * q;
      const laborCost = OVERHEAD_COST_PER_DOZEN * q;
      const totalCost = yarn.totalCost + packagingCost + ironCost + laborCost;
      updatedEntry = {
        ...merged,
        yarnUsedKg: yarn.totalKg,
        yarnCostPerKg: yarn.totalKg > 0 ? yarn.totalCost / yarn.totalKg : 0,
        laborCost,
        packagingCost,
        ironCost,
        staffBill: 0,
        totalCost,
        costPerDozen: q > 0 ? totalCost / q : 0,
      };
      return updatedEntry;
    }));
    // Keep the production + yarn-usage records in step.
    setProductionEntries((prev) => prev.map((p) =>
      p.sourceDailyId === id ? { ...p, date: patch.date ?? p.date, quantityDozen: Number(patch.totalProductionDozen ?? p.quantityDozen) || 0 } : p,
    ));
    if (updatedEntry) {
      const u = updatedEntry as DailyProductionEntry;
      setYarnUsageEntries((prev) => prev.map((y) => (y.sourceDailyId === id ? { ...y, kgUsed: u.yarnUsedKg } : y)));
    }
    // New model creates no worklogs; drop any stale legacy ones so Labor
    // Management totals don't reflect outdated amounts/dates after an edit.
    setWorkLogs((prev) => prev.filter((l) => l.sourceDailyId !== id));
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3"><Factory className="h-8 w-8 text-primary" /> Daily Production Entry</h1>
          <p className="text-muted-foreground mt-1">Just enter how many dozen you made — yarn, packaging, iron and all running costs are calculated for you.</p>
        </div>

        <Card className="border-2 border-primary/20 shadow-md">
          <CardHeader>
            <CardTitle>New Production Entry</CardTitle>
            <CardDescription>Pick the date, product and quantity. Everything else is automatic.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" className="h-12 text-base" max={getToday()} value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label>Product Type</Label>
                <Select value={productType} onValueChange={setProductType}>
                  <SelectTrigger className="h-12 text-base"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {productTypes.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        <span className="flex items-center gap-2">
                          <img src={productTypeImage(p.id)} alt="" className="h-5 w-5 object-contain shrink-0" />
                          {p.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label htmlFor="qty">Production (dozen)</Label>
                <Input id="qty" type="number" step="0.01" min="0" inputMode="decimal" className="h-12 text-base" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0" />
              </div>

              <div className="col-span-2">
                <ReceiptCapture value={receiptImage} onChange={setReceiptImage} label="Bill / photo (optional)" />
              </div>

              {/* Live auto-calculated breakdown */}
              <div className="col-span-2 rounded-xl border bg-muted/30 p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Sparkles className="h-4 w-4 text-primary" /> Auto-calculated cost
                </div>
                {hasRecipe ? (
                  <div className="overflow-x-auto">
                    {/* Full per-yarn detail on every screen size. Shows ~3-4 rows,
                        the rest scroll vertically; header + total stay pinned. */}
                    <div className="max-h-36 overflow-y-auto rounded-lg border">
                      <table className="w-full text-xs">
                        <thead className="text-left text-muted-foreground sticky top-0 bg-muted z-10">
                          <tr className="border-b">
                            <th className="py-1.5 px-3 font-medium">Yarn</th>
                            <th className="py-1.5 pr-3 text-right font-medium">Used (kg)</th>
                            <th className="py-1.5 pr-3 text-right font-medium">Price/kg</th>
                            <th className="py-1.5 pr-3 text-right font-medium">Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {calc.yarn.lines.map((l) => (
                            <tr key={l.id} className="border-b">
                              <td className="py-1 px-3">{l.label}</td>
                              <td className={`py-1 pr-3 text-right tabular-nums${l.kg < 0 ? " text-red-600 font-medium" : ""}`}>{l.kg.toLocaleString(undefined, { maximumFractionDigits: 3 })}</td>
                              <td className={`py-1 pr-3 text-right tabular-nums${l.pricePerKg < 0 ? " text-red-600 font-medium" : ""}`}>{money(l.pricePerKg)}</td>
                              <td className={`py-1 pr-3 text-right tabular-nums${l.cost < 0 ? " text-red-600 font-medium" : ""}`}>{money(l.cost)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="sticky bottom-0 bg-muted">
                          <tr className="font-semibold border-t">
                            <td className="py-1.5 px-3">Total yarn</td>
                            <td className={`py-1.5 pr-3 text-right tabular-nums${calc.yarn.totalKg < 0 ? " text-red-600" : ""}`}>{calc.yarn.totalKg.toLocaleString(undefined, { maximumFractionDigits: 3 })}</td>
                            <td className="py-1.5 pr-3" />
                            <td className={`py-1.5 pr-3 text-right tabular-nums${calc.yarn.totalCost < 0 ? " text-red-600" : ""}`}>{money(calc.yarn.totalCost)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No yarn recipe is set for this product yet, so yarn cost is 0. Add one in <span className="font-medium">Product Setup</span>. All running costs below still apply.</p>
                )}

                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                  {calc.items.map((it) => (
                    <Fragment key={it.id}>
                      <span className="text-muted-foreground">{it.label} ({it.perDozen} Tk/dz)</span>
                      <span className="text-right font-medium tabular-nums">{money(it.cost)}</span>
                    </Fragment>
                  ))}
                </div>
                <Separator />
                <div className="flex items-stretch gap-1 rounded-lg bg-background/60 p-2 text-center">
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="text-[10px] text-muted-foreground leading-tight">Total daily production</p>
                    <p className={`text-sm font-bold tabular-nums${calc.q < 0 ? " text-red-600" : ""}`}>{fmt(calc.q)} dz</p>
                  </div>
                  <div className="w-px self-stretch bg-border shrink-0" />
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="text-[10px] text-muted-foreground leading-tight">Total cost</p>
                    <p className={`text-sm font-bold tabular-nums${calc.totalCost < 0 ? " text-red-600" : ""}`}>{money(calc.totalCost)}</p>
                  </div>
                  <div className="w-px self-stretch bg-border shrink-0" />
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="text-[10px] text-muted-foreground leading-tight">Cost per dozen</p>
                    <p className={`text-sm font-bold tabular-nums${calc.costPerDozen < 0 ? " text-red-600" : ""}`}>{money(calc.costPerDozen)}</p>
                  </div>
                </div>
              </div>

              {error && <p className="text-sm text-destructive col-span-2">{error}</p>}

              <Button type="submit" size="lg" className="col-span-2 h-12 text-base font-semibold">
                <Plus className="h-5 w-5 mr-1" /> Save Production Entry
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border shadow-md">
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5 text-primary" /> Recent Entries</CardTitle>
              <CardDescription>{dailyEntries.length} total entries</CardDescription>
            </div>
            <ManageEntriesDialog
              title="Manage production entries"
              description="Edit the date or quantity — yarn, packaging, iron and all running costs recompute automatically."
              entries={dailyEntries}
              onDelete={handleDelete}
              editFields={[
                { key: "date", label: "Date", type: "date" },
                { key: "totalProductionDozen", label: "Quantity (dz)", type: "number" },
              ]}
              onSave={handleEditSave}
              columns={[
                { header: "Date", render: (e) => formatDateLabel(e.date) },
                { header: "Type", render: (e) => (e.productType ? labelById[e.productType] || e.productType : "—") },
                { header: "Qty (dz)", render: (e) => fmt(e.totalProductionDozen), className: "text-right" },
                { header: "Total cost", render: (e) => money(e.totalCost), className: "text-right" },
              ]}
            />
          </CardHeader>
          <CardContent>
            {dailyEntries.length === 0 ? (
              <EmptyState
                icon={Factory}
                title="No production yet"
                description="Add your first day's production to start tracking costs and yarn usage."
              />
            ) : (
              <div className="overflow-x-auto space-y-3">
                <ListFilter state={filter} onChange={setFilter} searchPlaceholder="Search product type..." />
                <div className="max-h-32 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="text-left text-muted-foreground border-b sticky top-0 bg-card z-10">
                    <tr>
                      <th className="py-1.5 pr-3 font-medium">Date</th>
                      <th className="py-1.5 pr-3 font-medium">Type</th>
                      <th className="py-1.5 pr-3 text-right font-medium">Qty</th>
                      <th className="py-1.5 pr-3 text-right font-medium">Yarn</th>
                      <th className="py-1.5 pr-3 text-right font-medium">Total</th>
                      <th className="py-1.5 pr-3 text-right font-medium">Cost/dz</th>
                      <th className="py-1.5 pr-0 font-medium">Bill</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDaily.map((e) => (
                      <tr key={e.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="py-1 pr-3 whitespace-nowrap">{formatDateLabel(e.date)}</td>
                        <td className="py-1 pr-3 truncate max-w-[120px]">{e.productType ? labelById[e.productType] || e.productType : "—"}</td>
                        <td className="py-1 pr-3 text-right whitespace-nowrap tabular-nums">{fmt(e.totalProductionDozen)}</td>
                        <td className="py-1 pr-3 text-right whitespace-nowrap tabular-nums">{fmt(e.yarnUsedKg)}</td>
                        <td className="py-1 pr-3 text-right whitespace-nowrap tabular-nums">{money(e.totalCost)}</td>
                        <td className="py-1 pr-3 text-right whitespace-nowrap tabular-nums">{money(e.costPerDozen)}</td>
                        <td className="py-1 pr-0"><ReceiptThumb src={e.receiptImage} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
                {filteredDaily.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No entries match your filter.</p>
                )}
              </div>
            )}
            <Separator className="my-4" />
            <div className="flex justify-between text-sm font-semibold">
              <span>Total production</span>
              <span className="tabular-nums">{fmt(dailyEntries.reduce((s, e) => s + e.totalProductionDozen, 0))} dz</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
