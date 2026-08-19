import { useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { productTypeImage } from "@/lib/product-images";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCloudStored } from "@/lib/cloud-store";
import {
  STORAGE_KEYS,
  defaultProductConfigs,
  defaultProductTypes,
  formatTk,
  RECIPE_PRODUCT_TYPE_ID,
  LEGACY_FOOTBALL_ID,
  PACKAGING_COST_PER_DOZEN,
  IRON_COST_PER_DOZEN,
  FACTORY_RENT_COST_PER_DOZEN,
  FLIP_STAFF_COST_PER_DOZEN,
  SEWING_COST_PER_DOZEN,
  ELECTRICITY_COST_PER_DOZEN,
  STAFF_SALARY_COST_PER_DOZEN,
  perDozenRatesFor,
  type ProductConfig,
  type ProductTypeOption,
  type YarnRecipeItem,
  type YarnUnit,
  type ProductionEntry,
  type SaleEntry,
  type DailyProductionEntry,
} from "@/lib/wolfion-store";
import { SlidersHorizontal, Plus, Pencil, Trash2, X } from "lucide-react";

const money = formatTk;

type DraftRow = {
  id: string;
  label: string;
  gramsPerDozen: string;
  defaultPricePerKg: string;
  priceUnit: YarnUnit;
};
type Draft = {
  id: string | null; // null = creating a new product
  label: string;
  sellingPricePerDozen: string;
  stockValuePerDozen: string;
  // Other per-dozen costs (blank = use the app default).
  packagingPerDozen: string;
  ironPerDozen: string;
  factoryRentPerDozen: string;
  flipStaffPerDozen: string;
  sewingPerDozen: string;
  electricityPerDozen: string;
  staffSalaryPerDozen: string;
  extras: DraftExtraCost[];
  rows: DraftRow[];
};

type DraftExtraCost = {
  id: string;
  label: string;
  amount: string;
};

/** The seven editable non-yarn cost lines, with their app defaults (Tk/dozen). */
const OTHER_COST_FIELDS = [
  { key: "packagingPerDozen", label: "Packaging", defaultValue: PACKAGING_COST_PER_DOZEN },
  { key: "ironPerDozen", label: "Iron / finishing", defaultValue: IRON_COST_PER_DOZEN },
  { key: "factoryRentPerDozen", label: "Factory rent", defaultValue: FACTORY_RENT_COST_PER_DOZEN },
  { key: "flipStaffPerDozen", label: "Flip staff", defaultValue: FLIP_STAFF_COST_PER_DOZEN },
  { key: "sewingPerDozen", label: "Sewing", defaultValue: SEWING_COST_PER_DOZEN },
  { key: "electricityPerDozen", label: "Electricity", defaultValue: ELECTRICITY_COST_PER_DOZEN },
  { key: "staffSalaryPerDozen", label: "Staff salary", defaultValue: STAFF_SALARY_COST_PER_DOZEN },
] as const;

/** Blank input = "use the default"; anything else is a number (0 allowed). */
function parseOptionalCost(s: string): number | undefined {
  if (s.trim() === "") return undefined;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueId(base: string, taken: Set<string>): string {
  const root = slugify(base) || "item";
  let id = root;
  let n = 2;
  while (taken.has(id)) id = `${root}-${n++}`;
  return id;
}

function emptyRow(): DraftRow {
  return { id: "", label: "", gramsPerDozen: "", defaultPricePerKg: "", priceUnit: "kg" };
}

function blankDraft(): Draft {
  return {
    id: null,
    label: "",
    sellingPricePerDozen: "",
    stockValuePerDozen: "",
    packagingPerDozen: "",
    ironPerDozen: "",
    factoryRentPerDozen: "",
    flipStaffPerDozen: "",
    sewingPerDozen: "",
    electricityPerDozen: "",
    staffSalaryPerDozen: "",
    extras: [],
    rows: [emptyRow()],
  };
}

function draftFromConfig(c: ProductConfig): Draft {
  return {
    id: c.id,
    label: c.label,
    sellingPricePerDozen: c.sellingPricePerDozen ? String(c.sellingPricePerDozen) : "",
    stockValuePerDozen: c.stockValuePerDozen ? String(c.stockValuePerDozen) : "",
    packagingPerDozen: c.packagingPerDozen != null ? String(c.packagingPerDozen) : "",
    ironPerDozen: c.ironPerDozen != null ? String(c.ironPerDozen) : "",
    factoryRentPerDozen: c.factoryRentPerDozen != null ? String(c.factoryRentPerDozen) : "",
    flipStaffPerDozen: c.flipStaffPerDozen != null ? String(c.flipStaffPerDozen) : "",
    sewingPerDozen: c.sewingPerDozen != null ? String(c.sewingPerDozen) : "",
    electricityPerDozen: c.electricityPerDozen != null ? String(c.electricityPerDozen) : "",
    staffSalaryPerDozen: c.staffSalaryPerDozen != null ? String(c.staffSalaryPerDozen) : "",
    extras: (c.extraCostsPerDozen ?? []).map((e) => ({
      id: e.id,
      label: e.label,
      amount: String(e.perDozen),
    })),
    rows: c.yarnRecipe?.length
      ? c.yarnRecipe.map((r) => ({
          id: r.id,
          label: r.label,
          gramsPerDozen: String(r.gramsPerDozen),
          defaultPricePerKg: String(r.defaultPricePerKg),
          priceUnit: (r.priceUnit === "lb" ? "lb" : "kg") as YarnUnit,
        }))
      : [emptyRow()],
  };
}

export default function ProductSetupPage() {
  const [productConfigs, setProductConfigs] = useCloudStored<ProductConfig[]>(
    STORAGE_KEYS.productConfigs,
    defaultProductConfigs,
  );
  const [, setProductTypes] = useCloudStored<ProductTypeOption[]>(STORAGE_KEYS.productTypes, defaultProductTypes);
  // Read-only: used to block deleting a product that is referenced by saved
  // entries (deleting it would let the dashboard's auto-recompute zero out the
  // yarn cost of those historical records).
  const [productionEntries] = useCloudStored<ProductionEntry[]>(STORAGE_KEYS.production, []);
  const [salesEntries] = useCloudStored<SaleEntry[]>(STORAGE_KEYS.sales, []);
  const [dailyEntries] = useCloudStored<DailyProductionEntry[]>(STORAGE_KEYS.daily, []);

  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<ProductConfig | null>(null);

  const usageCount = (id: string) =>
    productionEntries.filter((e) => e.productType === id).length +
    salesEntries.filter((e) => e.productType === id).length +
    // Legacy daily entries have no productType and resolve to short socks.
    dailyEntries.filter((e) => (e.productType || RECIPE_PRODUCT_TYPE_ID) === id).length;
  const deletingInUse = deleting ? usageCount(deleting.id) : 0;

  const openCreate = () => {
    setError("");
    setDraft(blankDraft());
  };
  const openEdit = (c: ProductConfig) => {
    setError("");
    setDraft(draftFromConfig(c));
  };

  const updateRow = (idx: number, patch: Partial<DraftRow>) => {
    setDraft((d) => (d ? { ...d, rows: d.rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)) } : d));
  };
  const addRow = () => setDraft((d) => (d ? { ...d, rows: [...d.rows, emptyRow()] } : d));
  const removeRow = (idx: number) =>
    setDraft((d) => (d ? { ...d, rows: d.rows.filter((_, i) => i !== idx) } : d));

  const handleSave = () => {
    if (!draft) return;
    const label = draft.label.trim();
    if (!label) {
      setError("Product name is required.");
      return;
    }

    // Build the yarn recipe from non-empty rows. Existing rows keep their id so
    // purchase history (keyed by yarn id) stays linked; new rows get a slug id.
    const takenYarnIds = new Set<string>();
    for (const r of draft.rows) if (r.id) takenYarnIds.add(r.id);
    const yarnRecipe: YarnRecipeItem[] = draft.rows
      .filter((r) => r.label.trim() !== "")
      .map((r) => {
        const id = r.id || uniqueId(r.label, takenYarnIds);
        takenYarnIds.add(id);
        return {
          id,
          label: r.label.trim(),
          gramsPerDozen: Number(r.gramsPerDozen) || 0,
          defaultPricePerKg: Number(r.defaultPricePerKg) || 0,
          priceUnit: r.priceUnit,
        };
      });

    const sellingPricePerDozen = Number(draft.sellingPricePerDozen) || 0;
    const stockValuePerDozen = Number(draft.stockValuePerDozen) || 0;
    const packagingPerDozen = parseOptionalCost(draft.packagingPerDozen);
    const ironPerDozen = parseOptionalCost(draft.ironPerDozen);
    const factoryRentPerDozen = parseOptionalCost(draft.factoryRentPerDozen);
    const flipStaffPerDozen = parseOptionalCost(draft.flipStaffPerDozen);
    const sewingPerDozen = parseOptionalCost(draft.sewingPerDozen);
    const electricityPerDozen = parseOptionalCost(draft.electricityPerDozen);
    const staffSalaryPerDozen = parseOptionalCost(draft.staffSalaryPerDozen);
    const seenExtraIds = new Set<string>();
    const extraCostsPerDozen = draft.extras
      .map((e) => ({ id: e.id, label: e.label.trim(), perDozen: Number(e.amount) }))
      .filter((e) => e.label !== "" && Number.isFinite(e.perDozen) && e.perDozen >= 0)
      .map((e) => {
        // Guarantee unique ids so breakdown lines never merge/collapse.
        let uid = e.id;
        let n = 2;
        while (seenExtraIds.has(uid)) uid = `${e.id}-${n++}`;
        seenExtraIds.add(uid);
        return { ...e, id: uid };
      });
    const anyDetailedOverhead =
      factoryRentPerDozen != null ||
      flipStaffPerDozen != null ||
      sewingPerDozen != null ||
      electricityPerDozen != null ||
      staffSalaryPerDozen != null;

    if (draft.id === null) {
      // Creating: derive a unique product id from the name.
      const takenProductIds = new Set(productConfigs.map((c) => c.id));
      const id = uniqueId(label, takenProductIds);
      const next: ProductConfig = {
        id,
        label,
        yarnRecipe,
        sellingPricePerDozen,
        stockValuePerDozen,
        packagingPerDozen,
        ironPerDozen,
        factoryRentPerDozen,
        flipStaffPerDozen,
        sewingPerDozen,
        electricityPerDozen,
        staffSalaryPerDozen,
        extraCostsPerDozen,
      };
      setProductConfigs((prev) => [...prev, next]);
      // Keep the shared product-type list (used by every product dropdown) in sync.
      setProductTypes((prev) => (prev.some((p) => p.id === id) ? prev : [...prev, { id, label }]));
    } else {
      const id = draft.id;
      setProductConfigs((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                label,
                yarnRecipe,
                sellingPricePerDozen,
                stockValuePerDozen,
                packagingPerDozen,
                ironPerDozen,
                // Individual lines replace the old lumped overhead override,
                // but only when the user actually set one — otherwise keep it.
                overheadPerDozen: anyDetailedOverhead ? undefined : c.overheadPerDozen,
                factoryRentPerDozen,
                flipStaffPerDozen,
                sewingPerDozen,
                electricityPerDozen,
                staffSalaryPerDozen,
                extraCostsPerDozen,
              }
            : c,
        ),
      );
      setProductTypes((prev) => {
        const found = prev.some((p) => p.id === id);
        return found ? prev.map((p) => (p.id === id ? { ...p, label } : p)) : [...prev, { id, label }];
      });
    }
    setDraft(null);
  };

  const handleDelete = (c: ProductConfig) => {
    if (usageCount(c.id) > 0) return; // guarded in the UI; never delete in-use products
    setProductConfigs((prev) => prev.filter((p) => p.id !== c.id));
    setProductTypes((prev) => prev.filter((p) => p.id !== c.id));
    setDeleting(null);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <SlidersHorizontal className="h-8 w-8 text-primary" /> Product Setup
            </h1>
            <p className="text-muted-foreground mt-1">
              Add your products and set each one's yarn recipe, selling price and stock value. These drive every cost and profit calculation across the app.
            </p>
          </div>
          <Button onClick={openCreate} className="h-11">
            <Plus className="mr-2 h-4 w-4" /> Add product
          </Button>
        </div>

        {productConfigs.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="py-16 text-center space-y-4">
              <SlidersHorizontal className="h-10 w-10 mx-auto text-muted-foreground/50" />
              <div>
                <h3 className="text-lg font-medium">No products yet</h3>
                <p className="text-sm text-muted-foreground">Add your first product to start tracking its costs.</p>
              </div>
              <Button onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" /> Add your first product
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {productConfigs.filter((c) => c && c.id !== LEGACY_FOOTBALL_ID).map((c) => (
              <Card key={c.id} className="border-2 border-primary/15 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <img src={productTypeImage(c.id)} alt="" className="h-6 w-6 object-contain shrink-0" />
                      {c.label}
                    </CardTitle>
                    <div className="flex shrink-0 gap-1">
                      <Button size="icon" variant="ghost" aria-label={`Edit ${c.label}`} onClick={() => openEdit(c)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Delete ${c.label}`}
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleting(c)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    Selling {money(c.sellingPricePerDozen)}/dz · Stock value {money(c.stockValuePerDozen)}/dz
                    <br />
                    Other costs {money(perDozenRatesFor(productConfigs, c.id).fixedTotal)}/dz
                    {c.overheadPerDozen == null &&
                    !c.extraCostsPerDozen?.length &&
                    OTHER_COST_FIELDS.every((f) => c[f.key] == null)
                      ? " (default)"
                      : " (custom)"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  {!c.yarnRecipe?.length ? (
                    <p className="text-xs text-muted-foreground">No yarn recipe — yarn cost is 0 for this product.</p>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Yarn recipe ({c.yarnRecipe.length})</p>
                      <ul className="text-xs space-y-0.5">
                        {c.yarnRecipe.map((r) => (
                          <li key={r.id} className="flex items-center justify-between gap-2 tabular-nums">
                            <span className="truncate">{r.label}</span>
                            <span className="text-muted-foreground whitespace-nowrap">
                              {r.gramsPerDozen} g/dz · {money(r.defaultPricePerKg)}/{r.priceUnit === "lb" ? "lb" : "kg"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create / edit dialog */}
      <Dialog open={draft !== null} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{draft?.id === null ? "Add product" : "Edit product"}</DialogTitle>
            <DialogDescription>Set the name, prices and yarn recipe for this product.</DialogDescription>
          </DialogHeader>

          {draft && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="ps-name">Product name</Label>
                <Input
                  id="ps-name"
                  className="h-11"
                  value={draft.label}
                  onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                  placeholder="e.g. Ankle socks"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="ps-sell">Selling price / dozen (Tk)</Label>
                  <Input
                    id="ps-sell"
                    type="number"
                    step="0.01"
                    min="0"
                    inputMode="decimal"
                    className="h-11"
                    value={draft.sellingPricePerDozen}
                    onChange={(e) => setDraft({ ...draft, sellingPricePerDozen: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ps-stock">Stock value / dozen (Tk)</Label>
                  <Input
                    id="ps-stock"
                    type="number"
                    step="0.01"
                    min="0"
                    inputMode="decimal"
                    className="h-11"
                    value={draft.stockValuePerDozen}
                    onChange={(e) => setDraft({ ...draft, stockValuePerDozen: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Other costs / dozen (Tk)</Label>
                <p className="text-xs text-muted-foreground">
                  Leave a box empty to use the app default shown in it. Type a number (0 allowed) to override it for this product.
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {OTHER_COST_FIELDS.map((f) => (
                    <div key={f.key} className="space-y-1">
                      <Label htmlFor={`ps-${f.key}`} className="text-xs font-normal text-muted-foreground">
                        {f.label}
                      </Label>
                      <Input
                        id={`ps-${f.key}`}
                        type="number"
                        step="0.01"
                        min="0"
                        inputMode="decimal"
                        className="h-11"
                        value={draft[f.key]}
                        onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                        placeholder={String(f.defaultValue)}
                      />
                    </div>
                  ))}
                </div>
                <div className="space-y-2 pt-1">
                  {draft.extras.map((ex, i) => (
                    <div key={ex.id} className="flex items-end gap-2">
                      <div className="flex-1 space-y-1">
                        <Label htmlFor={`ps-ex-name-${ex.id}`} className="text-xs font-normal text-muted-foreground">
                          Cost name
                        </Label>
                        <Input
                          id={`ps-ex-name-${ex.id}`}
                          className="h-11"
                          value={ex.label}
                          onChange={(e) => {
                            const extras = draft.extras.slice();
                            extras[i] = { ...ex, label: e.target.value };
                            setDraft({ ...draft, extras });
                          }}
                          placeholder="e.g. Labeling"
                        />
                      </div>
                      <div className="w-28 space-y-1">
                        <Label htmlFor={`ps-ex-amt-${ex.id}`} className="text-xs font-normal text-muted-foreground">
                          Tk / dozen
                        </Label>
                        <Input
                          id={`ps-ex-amt-${ex.id}`}
                          type="number"
                          step="0.01"
                          min="0"
                          inputMode="decimal"
                          className="h-11"
                          value={ex.amount}
                          onChange={(e) => {
                            const extras = draft.extras.slice();
                            extras[i] = { ...ex, amount: e.target.value };
                            setDraft({ ...draft, extras });
                          }}
                          placeholder="0"
                        />
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-11 w-11 shrink-0 text-muted-foreground"
                        onClick={() => setDraft({ ...draft, extras: draft.extras.filter((x) => x.id !== ex.id) })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        extras: [
                          ...draft.extras,
                          { id: `x${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, label: "", amount: "" },
                        ],
                      })
                    }
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" /> Add another cost
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Yarn recipe (per dozen)</Label>
                  <Button type="button" size="sm" variant="outline" onClick={addRow}>
                    <Plus className="mr-1 h-3.5 w-3.5" /> Add yarn
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  List each yarn this product uses with grams per dozen and its price (per kg or per lb). Leave empty for products with no yarn.
                </p>
                <div className="space-y-2">
                  {draft.rows.map((r, idx) => (
                    <div key={idx} className="grid grid-cols-[1fr_auto] gap-2 rounded-lg border p-2">
                      <div className="space-y-2">
                        <Input
                          className="h-10"
                          value={r.label}
                          onChange={(e) => updateRow(idx, { label: e.target.value })}
                          placeholder="Yarn name (e.g. Cotton)"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            inputMode="decimal"
                            className="h-10"
                            value={r.gramsPerDozen}
                            onChange={(e) => updateRow(idx, { gramsPerDozen: e.target.value })}
                            placeholder="g / dozen"
                            aria-label="Grams per dozen"
                          />
                          <div className="flex gap-1.5">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              inputMode="decimal"
                              className="h-10 min-w-0 flex-1"
                              value={r.defaultPricePerKg}
                              onChange={(e) => updateRow(idx, { defaultPricePerKg: e.target.value })}
                              placeholder={`Tk / ${r.priceUnit}`}
                              aria-label={`Price per ${r.priceUnit}`}
                            />
                            <select
                              className="h-10 shrink-0 rounded-md border border-input bg-background px-1.5 text-sm"
                              value={r.priceUnit}
                              onChange={(e) =>
                                updateRow(idx, { priceUnit: e.target.value === "lb" ? "lb" : "kg" })
                              }
                              aria-label="Price unit"
                            >
                              <option value="kg">/kg</option>
                              <option value="lb">/lb</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="self-start text-destructive hover:text-destructive"
                        aria-label="Remove yarn"
                        onClick={() => removeRow(idx)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDraft(null)}>Cancel</Button>
            <Button onClick={handleSave}>Save product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleting !== null} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deletingInUse > 0 ? "Can't delete this product" : "Delete this product?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleting && deletingInUse > 0 ? (
                <>
                  <span className="font-medium text-foreground">{deleting.label}</span> is used by {deletingInUse} saved
                  {" "}entr{deletingInUse === 1 ? "y" : "ies"} (production, sales or daily). Deleting it would change
                  those past records' costs, so it's kept. You can still edit its recipe and prices instead.
                </>
              ) : deleting ? (
                <>
                  <span className="font-medium text-foreground">{deleting.label}</span> will be removed from product
                  setup and from every product dropdown. This cannot be undone.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{deletingInUse > 0 ? "Close" : "Cancel"}</AlertDialogCancel>
            {deletingInUse === 0 && (
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => deleting && handleDelete(deleting)}
              >
                Delete
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
