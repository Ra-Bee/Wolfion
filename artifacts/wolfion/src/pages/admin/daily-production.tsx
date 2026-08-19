import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductTypeSelectItems } from "@/components/admin/product-type-select-items";
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
  pricePerKgToLb,
  computeProductYarn,
  recipeForProduct,
  defaultProductConfigs,
  RECIPE_PRODUCT_TYPE_ID,
  perDozenRatesFor,
  perDozenCostItemsFor,
  FOOTBALL_COMBO_ID,
  FOOTBALL_COMBO_LABEL,
  FOOTBALL_TOP_ID,
  FOOTBALL_BOTTOM_ID,
  mergeComboDailyRows,
  type DailyProductionEntry,
  type ProductConfig,
  type ProductionEntry,
  type ProductTypeOption,
  type YarnUsageEntry,
  type YarnPurchase,
  type WorkLog,
} from "@/lib/wolfion-store";
import { useCloudStored } from "@/lib/cloud-store";
import { productTypeImage } from "@/lib/product-images";

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

  const labelById = useMemo<Record<string, string>>(
    () => ({ ...Object.fromEntries(productTypes.map((p) => [p.id, p.label])), [FOOTBALL_COMBO_ID]: FOOTBALL_COMBO_LABEL }),
    [productTypes],
  );

  const [filter, setFilter, matches] = useListFilter();
  // Full-set football entries are stored as two part records sharing a
  // comboId; history shows them as ONE "Full Set" row.
  const displayDaily = useMemo(() => mergeComboDailyRows(dailyEntries), [dailyEntries]);
  const filteredDaily = useMemo(
    () => displayDaily.filter((e) => matches(e.date, e.productType ? labelById[e.productType] || e.productType : "")),
    [displayDaily, matches, labelById],
  );

  // "Sports Football (Full Set)" = top part + bottom part, each at the full
  // entered quantity (40 dz football = 40 dz top + 40 dz bottom).
  const partTypes = useMemo(
    () => (productType === FOOTBALL_COMBO_ID ? [FOOTBALL_TOP_ID, FOOTBALL_BOTTOM_ID] : [productType]),
    [productType],
  );
  const recipe = useMemo(() => recipeForProduct(productConfigs, partTypes[0]), [productConfigs, partTypes]);
  const hasRecipe = partTypes.every((pt) => recipeForProduct(productConfigs, pt).length > 0);

  // Live, auto-calculated cost breakdown from the current form inputs.
  const calc = useMemo(() => {
    const q = Number(qty) || 0;
    const parts = partTypes.map((pt) => computeProductYarn(recipeForProduct(productConfigs, pt), q, yarnPurchases, date));
    const yarn = {
      totalKg: parts.reduce((s, p) => s + p.totalKg, 0),
      totalCost: parts.reduce((s, p) => s + p.totalCost, 0),
      lines: parts.flatMap((p, i) => p.lines.map((l) => ({ ...l, id: `${i}-${l.id}` }))),
    };
    // Sum per-dozen items across all parts (each part uses its own product's
    // rates — custom "other costs" from Product Setup or the defaults).
    const itemMap = new Map<string, { id: string; label: string; perDozen: number; cost: number }>();
    let fixedTotal = 0;
    for (const pt of partTypes) {
      for (const it of perDozenCostItemsFor(productConfigs, pt)) {
        const prev = itemMap.get(it.id);
        if (prev) {
          prev.perDozen += it.perDozen;
          prev.cost += it.perDozen * q;
        } else {
          itemMap.set(it.id, { ...it, cost: it.perDozen * q });
        }
      }
      fixedTotal += perDozenRatesFor(productConfigs, pt).fixedTotal * q;
    }
    const items = Array.from(itemMap.values());
    const totalCost = yarn.totalCost + fixedTotal;
    return {
      q,
      yarn,
      items,
      fixedTotal,
      totalCost,
      costPerDozen: q > 0 ? totalCost / q : 0,
    };
  }, [qty, partTypes, productConfigs, yarnPurchases, date]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const q = Number(qty);
    if (!date) return setError("Date is required.");
    if (!productType) return setError("Product type is required.");
    if (!Number.isFinite(q) || q <= 0) return setError("Quantity must be greater than zero.");

    const createdAt = new Date().toISOString();
    const comboId = productType === FOOTBALL_COMBO_ID ? crypto.randomUUID() : undefined;
    const newDaily: DailyProductionEntry[] = [];
    const newProduction: ProductionEntry[] = [];
    const newYarnUsage: YarnUsageEntry[] = [];
    for (const partType of partTypes) {
      const id = crypto.randomUUID();
      const yarn = computeProductYarn(recipeForProduct(productConfigs, partType), q, yarnPurchases, date);
      const rates = perDozenRatesFor(productConfigs, partType);
      const packagingCost = rates.packaging * q;
      const ironCost = rates.iron * q;
      const laborCost = rates.overhead * q; // rent + flip staff + sewing + electricity + salary
      const totalCost = yarn.totalCost + packagingCost + ironCost + laborCost;

      newDaily.push({
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
        productType: partType,
        createdAt,
        ...(receiptImage ? { receiptImage } : {}),
        ...(comboId ? { comboId } : {}),
      });
      newProduction.push({ id: crypto.randomUUID(), date, productType: partType, quantityDozen: q, sourceDailyId: id, ...(comboId ? { comboId } : {}) });
      if (yarn.totalKg > 0) {
        newYarnUsage.push({ id: crypto.randomUUID(), productType: partType, kgUsed: yarn.totalKg, createdAt, sourceDailyId: id });
      }
    }
    setDailyEntries((prev) => [...newDaily, ...prev]);
    setProductionEntries((prev) => [...newProduction, ...prev]);
    if (newYarnUsage.length > 0) {
      setYarnUsageEntries((prev) => [...newYarnUsage, ...prev]);
    }

    setQty("");
    setReceiptImage(undefined);
  };

  const handleDelete = (id: string) => {
    // A "Full Set" row's id is the comboId shared by its top + bottom part
    // records — remove every matching record and everything they created.
    const targetIds = new Set(dailyEntries.filter((e) => e.id === id || e.comboId === id).map((e) => e.id));
    if (targetIds.size === 0) targetIds.add(id);
    setDailyEntries((prev) => prev.filter((e) => !targetIds.has(e.id)));
    setProductionEntries((prev) => prev.filter((p) => !p.sourceDailyId || !targetIds.has(p.sourceDailyId)));
    setYarnUsageEntries((prev) => prev.filter((u) => !u.sourceDailyId || !targetIds.has(u.sourceDailyId)));
    // Clear any legacy staff bills that older entries may have created.
    setWorkLogs((prev) => prev.filter((l) => !l.sourceDailyId || !targetIds.has(l.sourceDailyId)));
  };

  // Edit recomputes every auto cost from the new date/quantity, and keeps the
  // linked production + yarn-usage records in sync. A "Full Set" row fans the
  // edit out to both its part records.
  const handleEditSave = (id: string, patch: Partial<DailyProductionEntry>) => {
    // Compute the updated part records up front (from the current state
    // snapshot), then apply them with plain functional setters. Collecting
    // results inside a setter callback is not a safe React pattern.
    const targets = dailyEntries.filter((e) => e.id === id || e.comboId === id);
    if (targets.length === 0) return;
    const updatedList = targets.map((e) => {
      const merged = { ...e, ...patch, id: e.id, productType: e.productType };
      const q = Number(merged.totalProductionDozen) || 0;
      const d = merged.date;
      const entryRecipe = recipeForProduct(productConfigs, merged.productType);
      const yarn = computeProductYarn(entryRecipe, q, yarnPurchases, d);
      const rates = perDozenRatesFor(productConfigs, merged.productType);
      const packagingCost = rates.packaging * q;
      const ironCost = rates.iron * q;
      const laborCost = rates.overhead * q;
      const totalCost = yarn.totalCost + packagingCost + ironCost + laborCost;
      const updated: DailyProductionEntry = {
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
      return updated;
    });
    const byDailyId = new Map(updatedList.map((u) => [u.id, u]));
    setDailyEntries((prev) => prev.map((e) => byDailyId.get(e.id) ?? e));
    // Keep the production + yarn-usage records in step.
    setProductionEntries((prev) => prev.map((p) => {
      const u = p.sourceDailyId ? byDailyId.get(p.sourceDailyId) : undefined;
      return u ? { ...p, date: u.date, quantityDozen: Number(u.totalProductionDozen) || 0 } : p;
    }));
    setYarnUsageEntries((prev) => prev.map((y) => {
      const u = y.sourceDailyId ? byDailyId.get(y.sourceDailyId) : undefined;
      return u ? { ...y, kgUsed: u.yarnUsedKg } : y;
    }));
    // New model creates no worklogs; drop any stale legacy ones so Labor
    // Management totals don't reflect outdated amounts/dates after an edit.
    setWorkLogs((prev) => prev.filter((l) => !l.sourceDailyId || !byDailyId.has(l.sourceDailyId)));
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
                  <SelectTrigger className="h-12 text-base">
                    <span className="flex items-center gap-2 min-w-0">
                      {productType && <img src={productTypeImage(productType)} alt="" className="h-5 w-5 object-contain shrink-0" />}
                      <SelectValue placeholder="Select type" />
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <ProductTypeSelectItems types={productTypes} includeCombo />
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
                {!hasRecipe && (
                  <p className="text-xs text-muted-foreground">No yarn recipe is set for this product yet, so yarn cost is 0. Add one in <span className="font-medium">Product Setup</span>. All running costs below still apply.</p>
                )}
                {/* One scrollable list of every cost line — yarn and running
                    costs together. Shows ~4 rows, the rest scroll; the header
                    stays pinned on top. */}
                <div className="max-h-40 overflow-y-auto rounded-lg border">
                  <table className="w-full text-xs">
                    <thead className="text-left text-muted-foreground sticky top-0 bg-muted z-10">
                      <tr className="border-b">
                        <th className="py-1.5 px-3 font-medium">Item</th>
                        <th className="py-1.5 pr-3 text-right font-medium">Used (kg)</th>
                        <th className="py-1.5 pr-3 text-right font-medium">Price/kg · /lb</th>
                        <th className="py-1.5 pr-3 text-right font-medium">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hasRecipe &&
                        calc.yarn.lines.map((l) => (
                          <tr key={l.id} className="border-b">
                            <td className="py-1 px-3">{l.label}</td>
                            <td className={`py-1 pr-3 text-right tabular-nums${l.kg < 0 ? " text-red-600 font-medium" : ""}`}>{l.kg.toLocaleString(undefined, { maximumFractionDigits: 3 })}</td>
                            <td className={`py-1 pr-3 text-right tabular-nums${l.pricePerKg < 0 ? " text-red-600 font-medium" : ""}`}>
                              <div>{money(l.pricePerKg)}/kg</div>
                              <div className="text-[10px] text-muted-foreground">{money(pricePerKgToLb(l.pricePerKg))}/lb</div>
                            </td>
                            <td className={`py-1 pr-3 text-right tabular-nums${l.cost < 0 ? " text-red-600 font-medium" : ""}`}>{money(l.cost)}</td>
                          </tr>
                        ))}
                      {hasRecipe && (
                        <tr className="font-semibold border-b bg-muted/40">
                          <td className="py-1 px-3">Total yarn</td>
                          <td className={`py-1 pr-3 text-right tabular-nums${calc.yarn.totalKg < 0 ? " text-red-600" : ""}`}>{calc.yarn.totalKg.toLocaleString(undefined, { maximumFractionDigits: 3 })}</td>
                          <td className="py-1 pr-3" />
                          <td className={`py-1 pr-3 text-right tabular-nums${calc.yarn.totalCost < 0 ? " text-red-600" : ""}`}>{money(calc.yarn.totalCost)}</td>
                        </tr>
                      )}
                      {calc.items.map((it) => (
                        <tr key={it.id} className="border-b last:border-0">
                          <td className="py-1 px-3" colSpan={3}>
                            {it.label} <span className="text-muted-foreground">({it.perDozen} Tk/dz)</span>
                          </td>
                          <td className="py-1 pr-3 text-right tabular-nums">{money(it.cost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
              <CardDescription>{displayDaily.length} total entries</CardDescription>
            </div>
            <ManageEntriesDialog
              title="Manage production entries"
              description="Edit the date or quantity — yarn, packaging, iron and all running costs recompute automatically."
              entries={displayDaily}
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
                        <td className="py-1 pr-3 max-w-[120px]">
                          {e.productType ? (
                            <span className="flex items-center gap-1.5 min-w-0">
                              <img src={productTypeImage(e.productType)} alt="" className="h-4 w-4 object-contain shrink-0" />
                              <span className="truncate">{labelById[e.productType] || e.productType}</span>
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
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
              <span className="tabular-nums">{fmt(displayDaily.reduce((s, e) => s + e.totalProductionDozen, 0))} dz</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
