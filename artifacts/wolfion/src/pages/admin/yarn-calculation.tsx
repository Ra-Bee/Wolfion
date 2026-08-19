import { useCallback, useMemo, useState, type FormEvent } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wrench, Plus, Package, TrendingUp } from "lucide-react";
import { ManageEntriesDialog } from "@/components/admin/manage-entries-dialog";
import {
  STORAGE_KEYS,
  defaultYarnTypes,
  formatDateLabel,
  formatTk,
  getToday,
  allRecipeYarns,
  recipeForProduct,
  defaultProductConfigs,
  RECIPE_PRODUCT_TYPE_ID,
  toKg,
  pricePerKgToLb,
  yarnPricePerKgOn,
  recipeDefaultPricePerKg,
  displayYarnName,
  yarnMergeKey,
  compareYarnLabel,
  type DailyProductionEntry,
  type ProductConfig,
  type YarnPurchase,
  type YarnUnit,
} from "@/lib/wolfion-store";
import { useCloudStored } from "@/lib/cloud-store";

const money = formatTk;
const OTHER_ID = "other";
const ADD_NEW = "__ADD__";

// The yarn this purchase is for: recipe id, custom name, or legacy free-text name.
function typeKeyOf(p: YarnPurchase): string {
  return p.yarnTypeId || p.yarnType || OTHER_ID;
}

function kgFmt(n: number): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function num1(n: number): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

function barColor(coverage: number): string {
  if (coverage >= 1) return "bg-emerald-500";
  if (coverage >= 0.5) return "bg-amber-500";
  if (coverage > 0) return "bg-orange-500";
  return "bg-rose-500";
}

export default function YarnCalculationPage() {
  const [yarnPurchases, setYarnPurchases] = useCloudStored<YarnPurchase[]>(STORAGE_KEYS.yarnPurchases, []);
  const [dailyEntries] = useCloudStored<DailyProductionEntry[]>(STORAGE_KEYS.daily, []);
  const [yarnTypes, setYarnTypes] = useCloudStored<string[]>(STORAGE_KEYS.yarnTypes, defaultYarnTypes);
  const [productConfigs] = useCloudStored<ProductConfig[]>(STORAGE_KEYS.productConfigs, defaultProductConfigs);

  // Every recipe yarn used by any configured product (deduped across products).
  const allYarns = useMemo(() => allRecipeYarns(productConfigs), [productConfigs]);
  const recipeLabel = useMemo(
    () => Object.fromEntries(allYarns.map((r) => [r.id, r.label])) as Record<string, string>,
    [allYarns],
  );
  const yarnLabel = useCallback(
    (id: string | undefined) => {
      if (!id) return "Other yarn";
      return recipeLabel[id] || (id === OTHER_ID ? "Other yarn" : id);
    },
    [recipeLabel],
  );

  // Every selectable custom yarn: the saved list plus any name already used on a
  // purchase (so legacy/dashboard-added yarns are never missing from the picker).
  const selectableTypes = useMemo(() => {
    const set = new Set<string>(yarnTypes);
    for (const p of yarnPurchases) {
      const k = typeKeyOf(p);
      if (k !== OTHER_ID && !allYarns.some((r) => r.id === k)) set.add(k);
    }
    return Array.from(set);
  }, [yarnTypes, yarnPurchases, allYarns]);

  // Yarn consumed per recipe item, summed over every product's daily production
  // using that product's own recipe.
  const consumptionByType = useMemo(() => {
    const used: Record<string, number> = {};
    for (const e of dailyEntries) {
      const recipe = recipeForProduct(productConfigs, e.productType);
      if (recipe.length === 0) continue;
      const q = e.totalProductionDozen || 0;
      for (const item of recipe) {
        used[item.id] = (used[item.id] || 0) + (item.gramsPerDozen * q) / 1000;
      }
    }
    return used;
  }, [dailyEntries, productConfigs]);

  // Build a row per recipe yarn, plus any custom purchase types not in a recipe.
  const typeRows = useMemo(() => {
    const ids = new Set<string>(allYarns.map((r) => r.id));
    for (const t of yarnTypes) ids.add(t);
    for (const p of yarnPurchases) ids.add(typeKeyOf(p));
    const today = getToday();
    const raw = Array.from(ids).map((id) => {
      const recipe = allYarns.find((r) => r.id === id);
      const purchased = yarnPurchases.filter((p) => typeKeyOf(p) === id);
      const purchasedKg = purchased.reduce((a, b) => a + (b.kg || 0), 0);
      const spent = purchased.reduce((a, b) => a + (b.totalPrice || 0), 0);
      const used = consumptionByType[id] || 0;
      const pricePerKg = yarnPricePerKgOn(yarnPurchases, id, today, recipe ? recipeDefaultPricePerKg(recipe) : purchasedKg > 0 ? spent / purchasedKg : 0);
      return {
        id,
        label: yarnLabel(id),
        purchasedKg,
        spent,
        used,
        remaining: purchasedKg - used,
        pricePerKg,
        isRecipe: Boolean(recipe),
      };
    });
    // Combine yarns that share the same (reordered) name, even if they came
    // from different products, summing their amounts and weighting the price.
    const merged = new Map<string, (typeof raw)[number] & { _pw: number }>();
    for (const r of raw) {
      const key = yarnMergeKey(r.label);
      const ex = merged.get(key);
      if (ex) {
        ex.purchasedKg += r.purchasedKg;
        ex.spent += r.spent;
        ex.used += r.used;
        ex.remaining += r.remaining;
        ex._pw += r.pricePerKg * r.purchasedKg;
        ex.isRecipe = ex.isRecipe || r.isRecipe;
      } else {
        merged.set(key, { ...r, label: displayYarnName(r.label), _pw: r.pricePerKg * r.purchasedKg });
      }
    }
    return Array.from(merged.values())
      .map(({ _pw, ...r }) => ({ ...r, pricePerKg: r.purchasedKg > 0 ? _pw / r.purchasedKg : r.pricePerKg }))
      .sort((a, b) => compareYarnLabel(a.label, b.label));
  }, [yarnPurchases, yarnTypes, consumptionByType, allYarns, yarnLabel]);

  const totalPurchasedKg = yarnPurchases.reduce((a, b) => a + (b.kg || 0), 0);
  const totalSpent = yarnPurchases.reduce((a, b) => a + (b.totalPrice || 0), 0);
  const totalUsedKg = typeRows.reduce((a, b) => a + b.used, 0);
  const totalRemainingKg = totalPurchasedKg - totalUsedKg;

  // Average production per active day, per product, used to project future needs.
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

  const totalAvgDozenPerDay = useMemo(
    () => Object.values(avgDozenByProduct).reduce((a, b) => a + b, 0),
    [avgDozenByProduct],
  );

  // Per-yarn weekly/monthly need, summed across every product that uses the yarn
  // (need = grams/dozen in that product × that product's avg dozens/day).
  const needByYarn = useMemo(() => {
    const weekly: Record<string, number> = {};
    const monthly: Record<string, number> = {};
    const yearly: Record<string, number> = {};
    for (const c of productConfigs) {
      const avg = avgDozenByProduct[c.id] || 0;
      if (avg <= 0) continue;
      for (const item of c.yarnRecipe ?? []) {
        weekly[item.id] = (weekly[item.id] || 0) + (item.gramsPerDozen * avg * 7) / 1000;
        monthly[item.id] = (monthly[item.id] || 0) + (item.gramsPerDozen * avg * 30) / 1000;
        yearly[item.id] = (yearly[item.id] || 0) + (item.gramsPerDozen * avg * 365) / 1000;
      }
    }
    return { weekly, monthly, yearly };
  }, [productConfigs, avgDozenByProduct]);

  // Per-yarn future need (weekly + monthly) and how much stock covers it.
  const futureRows = useMemo(() => {
    const raw = allYarns.map((item) => {
      const purchased = yarnPurchases.filter((p) => typeKeyOf(p) === item.id);
      const purchasedKg = purchased.reduce((a, b) => a + (b.kg || 0), 0);
      const used = consumptionByType[item.id] || 0;
      const remaining = purchasedKg - used;
      const weeklyNeed = needByYarn.weekly[item.id] || 0;
      const monthlyNeed = needByYarn.monthly[item.id] || 0;
      const yearlyNeed = needByYarn.yearly[item.id] || 0;
      return { id: item.id, label: item.label, remaining, purchasedKg, used, weeklyNeed, monthlyNeed, yearlyNeed };
    });
    // Combine same-named yarns (across products) by summing stock and needs.
    const merged = new Map<string, (typeof raw)[number]>();
    for (const r of raw) {
      const key = yarnMergeKey(r.label);
      const ex = merged.get(key);
      if (ex) {
        ex.remaining += r.remaining;
        ex.purchasedKg += r.purchasedKg;
        ex.used += r.used;
        ex.weeklyNeed += r.weeklyNeed;
        ex.monthlyNeed += r.monthlyNeed;
        ex.yearlyNeed += r.yearlyNeed;
      } else {
        merged.set(key, { ...r, label: displayYarnName(r.label) });
      }
    }
    return Array.from(merged.values())
      .map((r) => ({
        ...r,
        coverage: r.monthlyNeed > 0 ? r.remaining / r.monthlyNeed : r.remaining > 0 ? 1 : 0,
        weeksLeft: r.weeklyNeed > 0 ? r.remaining / r.weeklyNeed : 0,
        shortfall: r.monthlyNeed - r.remaining,
      }))
      .sort((a, b) => compareYarnLabel(a.label, b.label));
  }, [allYarns, yarnPurchases, consumptionByType, needByYarn]);

  const [purchaseDate, setPurchaseDate] = useState(getToday());
  const [yarnTypeId, setYarnTypeId] = useState(allRecipeYarns(defaultProductConfigs)[0]?.id ?? OTHER_ID);
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState<YarnUnit>("kg");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [showAddType, setShowAddType] = useState(false);
  const [newType, setNewType] = useState("");
  const [period, setPeriod] = useState<"weekly" | "monthly" | "yearly" | "total">("weekly");

  function handleCreateType() {
    const name = newType.trim();
    if (!name) return;
    // If the name is actually one of the recipe yarns, link to its id rather
    // than creating a duplicate custom bucket.
    const recipeMatch = allYarns.find((r) => r.label.toLowerCase() === name.toLowerCase());
    if (recipeMatch) {
      setYarnTypeId(recipeMatch.id);
    } else {
      const existing = yarnTypes.find((y) => y.toLowerCase() === name.toLowerCase());
      if (!existing) setYarnTypes((cur) => [...cur, name]);
      setYarnTypeId(existing ?? name);
    }
    setNewType("");
    setShowAddType(false);
  }

  function handleAddPurchase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amt = Number(amount);
    const total = Number(price);
    if (!purchaseDate) { setError("Please choose a date."); return; }
    if (showAddType) { setError("Finish adding the new yarn type, or pick one from the list."); return; }
    if (yarnTypeId === ADD_NEW || !yarnTypeId) { setError("Please pick or add a yarn type."); return; }
    if (!Number.isFinite(amt) || amt <= 0) { setError("Please enter a valid amount."); return; }
    if (!Number.isFinite(total) || total < 0) { setError("Please enter a valid price."); return; }
    setError("");
    const isRecipe = allYarns.some((r) => r.id === yarnTypeId);
    const isCustomName = !isRecipe && yarnTypeId !== OTHER_ID;
    const entry: YarnPurchase = {
      id: crypto.randomUUID(),
      date: purchaseDate,
      yarnTypeId,
      ...(isCustomName ? { yarnType: yarnTypeId } : {}),
      amount: amt,
      unit,
      kg: toKg(amt, unit),
      totalPrice: total,
      createdAt: new Date().toISOString(),
    };
    setYarnPurchases((prev) => [entry, ...prev]);
    setAmount("");
    setPrice("");
  }

  function handleRemovePurchase(id: string) {
    setYarnPurchases((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2"><Wrench className="h-7 w-7 text-primary" /> Yarn Purchased and Calculation</h1>
          <p className="text-muted-foreground mt-1">Log every yarn purchase with its price, and see how much of each yarn is left in the factory.</p>
        </div>

        <Card className="border-2 border-primary/30 shadow-md">
          <CardHeader>
            <div className="flex flex-row items-start justify-between gap-3 flex-wrap">
              <div>
                <CardTitle className="text-xl flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Yarn needs vs stock</CardTitle>
                <CardDescription>
                  {period === "total"
                    ? "Lifetime totals — how much of each yarn you've bought is still in stock."
                    : totalAvgDozenPerDay > 0
                    ? `Auto-calculated from your average of ${num1(totalAvgDozenPerDay)} dozen/day across all products. Each bar shows how much of your ${period} need you already have in stock.`
                    : "Record some daily production and this will auto-calculate how much yarn you need each week, month and year."}
                </CardDescription>
              </div>
              <div className="flex flex-wrap rounded-full border p-1 shrink-0">
                {(["weekly", "monthly", "yearly", "total"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors capitalize ${period === p ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                  >{p}</button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {futureRows.map((r) => {
              const isTotal = period === "total";
              const need = isTotal
                ? r.purchasedKg
                : period === "weekly"
                ? r.weeklyNeed
                : period === "monthly"
                ? r.monthlyNeed
                : r.yearlyNeed;
              const have = Math.max(0, r.remaining);
              const coverage = need > 0 ? have / need : have > 0 ? 1 : 0;
              const shortfall = need - have;
              const periodsLeft = need > 0 ? have / need : 0;
              const periodWord = period === "weekly" ? "week" : period === "monthly" ? "month" : "year";
              const periodWordPlural = period === "weekly" ? "weeks" : period === "monthly" ? "months" : "years";
              return (
                <div key={r.id} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium truncate">{r.label}</span>
                    <span className="shrink-0 tabular-nums">
                      {isTotal ? (
                        <>
                          <span className="font-semibold text-foreground">{kgFmt(have)} kg</span>
                          <span className="text-muted-foreground"> left of </span>
                          <span className="font-semibold text-foreground">{kgFmt(r.purchasedKg)} kg</span>
                          <span className="text-muted-foreground"> bought</span>
                        </>
                      ) : (
                        <>
                          <span className={have <= 0 ? "font-semibold text-rose-500" : "font-semibold text-foreground"}>{kgFmt(have)} kg</span>
                          <span className="text-muted-foreground"> have / </span>
                          <span className="font-semibold text-foreground">{kgFmt(need)} kg</span>
                          <span className="text-muted-foreground"> need</span>
                        </>
                      )}
                    </span>
                  </div>
                  <div className="h-4 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${need > 0 ? barColor(coverage) : "bg-muted-foreground/30"}`}
                      style={{ width: `${need > 0 ? Math.min(1, coverage) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="text-xs tabular-nums">
                    {isTotal ? (
                      r.purchasedKg <= 0 ? (
                        <span className="text-muted-foreground">No purchases recorded yet</span>
                      ) : (
                        <span className="font-medium text-foreground">{kgFmt(r.used)} kg used · {kgFmt(have)} kg remaining</span>
                      )
                    ) : need <= 0 ? (
                      <span className="text-muted-foreground">Record daily production to see {periodWord} need</span>
                    ) : have <= 0 ? (
                      <span className="font-medium text-rose-500">Out of stock — buy {kgFmt(need)} kg for this {periodWord}</span>
                    ) : shortfall > 0 ? (
                      <span className="font-medium text-orange-600 dark:text-orange-400">Buy {kgFmt(shortfall)} kg more for this {periodWord}</span>
                    ) : (
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">Enough for ~{num1(periodsLeft)} {periodWordPlural}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/30 shadow-md">
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div>
              <CardTitle className="text-xl flex items-center gap-2"><Package className="h-5 w-5 text-primary" /> Yarn purchases</CardTitle>
              <CardDescription>Record each purchase: which yarn, how much, and the price you paid.</CardDescription>
            </div>
            <ManageEntriesDialog
              title="Manage yarn purchases"
              description="Edit or delete saved yarn purchase records."
              entries={yarnPurchases}
              onDelete={handleRemovePurchase}
              editFields={[
                { key: "date", label: "Date", type: "date" },
                { key: "amount", label: "Amount", type: "number" },
                { key: "totalPrice", label: "Total price (Tk)", type: "number" },
              ]}
              onSave={(id, patch) => setYarnPurchases((prev) => prev.map((p) => {
                if (p.id !== id) return p;
                const merged = { ...p, ...patch };
                const amt = Number(merged.amount) || 0;
                return { ...merged, amount: amt, kg: toKg(amt, merged.unit || "kg"), totalPrice: Number(merged.totalPrice) || 0 };
              }))}
              columns={[
                { header: "Date", render: (p) => formatDateLabel(p.date) },
                { header: "Yarn", render: (p) => yarnLabel(typeKeyOf(p)) },
                { header: "Amount", render: (p) => `${(p.amount ?? p.kg).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${p.unit ?? "kg"}`, className: "text-right" },
                { header: "Price", render: (p) => money(p.totalPrice ?? 0), className: "text-right" },
              ]}
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAddPurchase} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-2 lg:col-span-2">
                <label className="text-sm font-medium" htmlFor="yp-type">Yarn type</label>
                <Select
                  value={showAddType ? "" : yarnTypeId}
                  onValueChange={(v) => {
                    if (v === ADD_NEW) { setShowAddType(true); return; }
                    setShowAddType(false);
                    setYarnTypeId(v);
                  }}
                >
                  <SelectTrigger id="yp-type" className="h-12 text-base"><SelectValue placeholder="Select yarn" /></SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Recipe yarns</SelectLabel>
                      {allYarns.map((r) => <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>)}
                    </SelectGroup>
                    {selectableTypes.length > 0 && (
                      <SelectGroup>
                        <SelectLabel>Your added yarns</SelectLabel>
                        {selectableTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectGroup>
                    )}
                    <SelectGroup>
                      <SelectItem value={ADD_NEW}>➕ Add new yarn type…</SelectItem>
                      <SelectItem value={OTHER_ID}>Other yarn</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {showAddType && (
                  <div className="mt-2 flex gap-2">
                    <Input
                      autoFocus
                      className="h-11 text-base"
                      placeholder="New yarn name (e.g. Green)"
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCreateType(); } }}
                    />
                    <Button type="button" className="h-11 shrink-0" onClick={handleCreateType}>Add</Button>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="yp-date">Date</label>
                <Input id="yp-date" type="date" className="h-12 text-base" max={getToday()} value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="yp-amount">Amount</label>
                <div className="flex gap-2">
                  <Input id="yp-amount" type="number" min="0" step="0.01" inputMode="decimal" className="h-12 text-base" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                  <Select value={unit} onValueChange={(v) => setUnit(v as YarnUnit)}>
                    <SelectTrigger className="h-12 w-20 text-base"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="lb">lb</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="yp-price">Total price (Tk)</label>
                <Input id="yp-price" type="number" min="0" step="0.01" inputMode="decimal" className="h-12 text-base" placeholder="0" value={price} onChange={(e) => setPrice(e.target.value)} required />
              </div>
              <div className="space-y-2 flex items-end lg:col-span-5">
                <Button type="submit" size="lg" className="h-12 w-full sm:w-auto">
                  <Plus className="h-4 w-4" /> Add purchase
                </Button>
              </div>
            </form>
            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{error}</p>
            )}

            {yarnPurchases.length > 0 && (
              <div className="rounded-2xl border divide-y max-h-44 overflow-y-auto">
                {yarnPurchases.map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-4 py-3 gap-3">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{yarnLabel(typeKeyOf(p))} — {(p.amount ?? p.kg).toLocaleString(undefined, { maximumFractionDigits: 2 })} {p.unit ?? "kg"}</p>
                      <p className="text-xs text-muted-foreground">{formatDateLabel(p.date)} · {kgFmt(p.kg || 0)} kg</p>
                    </div>
                    <p className="font-semibold tabular-nums shrink-0">{money(p.totalPrice ?? 0)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border bg-primary/5 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total purchased</p>
            <p className="text-2xl font-bold mt-1 tabular-nums break-words">{kgFmt(totalPurchasedKg)} <span className="text-sm font-normal text-muted-foreground">kg</span></p>
          </div>
          <div className="rounded-2xl border bg-muted/30 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total spent</p>
            <p className="text-2xl font-bold mt-1 tabular-nums break-words">{money(totalSpent)}</p>
          </div>
          <div className="rounded-2xl border bg-emerald-100/40 dark:bg-emerald-900/20 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Remaining stock</p>
            <p className="text-2xl font-bold mt-1 tabular-nums break-words">{kgFmt(totalRemainingKg)} <span className="text-sm font-normal text-muted-foreground">kg</span></p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Yarn remaining in factory</CardTitle>
            <CardDescription>Purchased minus used (used is calculated from short-socks production).</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-4">Yarn</th>
                    <th className="py-2 pr-4 text-right">Purchased (kg)</th>
                    <th className="py-2 pr-4 text-right">Used (kg)</th>
                    <th className="py-2 pr-4 text-right">Remaining (kg)</th>
                    <th className="py-2 text-right">Price/kg · /lb</th>
                  </tr>
                </thead>
                <tbody>
                  {typeRows.map((r) => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">{r.label}</td>
                      <td className="py-3 pr-4 text-right tabular-nums">{kgFmt(r.purchasedKg)}</td>
                      <td className="py-3 pr-4 text-right tabular-nums">{kgFmt(r.used)}</td>
                      <td className={`py-3 pr-4 text-right font-semibold tabular-nums ${r.remaining < 0 ? "text-destructive" : ""}`}>{kgFmt(r.remaining)}</td>
                      <td className="py-3 text-right tabular-nums">
                        <div>{money(r.pricePerKg)}/kg</div>
                        <div className="text-xs text-muted-foreground">{money(pricePerKgToLb(r.pricePerKg))}/lb</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
