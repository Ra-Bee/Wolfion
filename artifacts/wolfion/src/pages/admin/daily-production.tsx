import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Trash2, Factory, Plus, Package } from "lucide-react";
import {
  STORAGE_KEYS,
  defaultProductTypes,
  formatDateLabel,
  getToday,
  useStored,
  useStoredNumber,
  type DailyProductionEntry,
  type ProductionEntry,
  type ProductTypeOption,
  type YarnUsageEntry,
} from "@/lib/wolfion-store";

function fmt(n: number) { return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n); }
function money(n: number) { return `Tk ${new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n)}`; }

export default function DailyProductionPage() {
  const [productTypes] = useStored<ProductTypeOption[]>(STORAGE_KEYS.productTypes, defaultProductTypes);
  const [dailyEntries, setDailyEntries] = useStored<DailyProductionEntry[]>(STORAGE_KEYS.daily, []);
  const [productionEntries, setProductionEntries] = useStored<ProductionEntry[]>(STORAGE_KEYS.production, []);
  const [yarnUsageEntries, setYarnUsageEntries] = useStored<YarnUsageEntry[]>(STORAGE_KEYS.yarnUsage, []);
  const [yarnStockKg, setYarnStockKg] = useStoredNumber(STORAGE_KEYS.yarnStock, 0);

  const [date, setDate] = useState(getToday());
  const [productType, setProductType] = useState(productTypes[0]?.id ?? "");
  const [qty, setQty] = useState("");
  const [yarnUsed, setYarnUsed] = useState("");
  const [machineHours, setMachineHours] = useState("");
  const [yarnCost, setYarnCost] = useState("");
  const [laborCost, setLaborCost] = useState("");
  const [packaging, setPackaging] = useState("");
  const [iron, setIron] = useState("");
  const [error, setError] = useState("");

  const labelById = useMemo(() => Object.fromEntries(productTypes.map((p) => [p.id, p.label])), [productTypes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const q = Number(qty);
    const yu = Number(yarnUsed) || 0;
    const mh = Number(machineHours) || 0;
    const yc = Number(yarnCost) || 0;
    const lc = Number(laborCost) || 0;
    const pc = Number(packaging) || 0;
    const ic = Number(iron) || 0;
    if (!date) return setError("Date is required.");
    if (!productType) return setError("Product type is required.");
    if (!Number.isFinite(q) || q <= 0) return setError("Quantity must be greater than zero.");

    const totalCost = yu * yc + lc + pc + ic;
    const costPerDozen = q > 0 ? totalCost / q : 0;
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const dailyEntry: DailyProductionEntry = {
      id,
      date,
      totalProductionDozen: q,
      yarnUsedKg: yu,
      machineHours: mh,
      yarnCostPerKg: yc,
      laborCost: lc,
      packagingCost: pc,
      ironCost: ic,
      totalCost,
      costPerDozen,
      productType,
      createdAt,
    };
    setDailyEntries((prev) => [dailyEntry, ...prev]);

    const prodEntry: ProductionEntry = { id: crypto.randomUUID(), date, productType, quantityDozen: q, sourceDailyId: id };
    setProductionEntries((prev) => [prodEntry, ...prev]);

    if (yu > 0) {
      const usage: YarnUsageEntry = { id: crypto.randomUUID(), productType, kgUsed: yu, createdAt, sourceDailyId: id };
      setYarnUsageEntries((prev) => [usage, ...prev]);
      setYarnStockKg((prev) => Math.max(0, prev - yu));
    }

    setQty(""); setYarnUsed(""); setMachineHours(""); setYarnCost("");
    setLaborCost(""); setPackaging(""); setIron("");
  };

  const handleDelete = (id: string) => {
    const entry = dailyEntries.find((e) => e.id === id);
    setDailyEntries((prev) => prev.filter((e) => e.id !== id));
    setProductionEntries((prev) => prev.filter((p) => p.sourceDailyId !== id));
    setYarnUsageEntries((prev) => prev.filter((u) => u.sourceDailyId !== id));
    if (entry && entry.yarnUsedKg > 0) {
      setYarnStockKg((prev) => prev + entry.yarnUsedKg);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3"><Factory className="h-8 w-8 text-primary" /> Daily Production Entry</h1>
          <p className="text-muted-foreground mt-1">Record today's production with full cost breakdown.</p>
        </div>

        <Card className="border-2 border-primary/20 shadow-md">
          <CardHeader>
            <CardTitle>New Production Entry</CardTitle>
            <CardDescription>Yarn use is automatically deducted from yarn stock.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="qty">Production (dz)</Label>
                <Input id="qty" type="number" step="0.01" min="0" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="yarn">Yarn Used (kg)</Label>
                <Input id="yarn" type="number" step="0.01" min="0" value={yarnUsed} onChange={(e) => setYarnUsed(e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mh">Machine Hours</Label>
                <Input id="mh" type="number" step="0.1" min="0" value={machineHours} onChange={(e) => setMachineHours(e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="yc">Yarn / kg (Tk)</Label>
                <Input id="yc" type="number" step="0.01" min="0" value={yarnCost} onChange={(e) => setYarnCost(e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lc">Labor (Tk)</Label>
                <Input id="lc" type="number" step="0.01" min="0" value={laborCost} onChange={(e) => setLaborCost(e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pc">Packaging (Tk)</Label>
                <Input id="pc" type="number" step="0.01" min="0" value={packaging} onChange={(e) => setPackaging(e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="ic">Iron / Finishing (Tk)</Label>
                <Input id="ic" type="number" step="0.01" min="0" value={iron} onChange={(e) => setIron(e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Product Type</Label>
                <Select value={productType} onValueChange={setProductType}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {productTypes.map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {error && <p className="text-sm text-destructive col-span-2">{error}</p>}

              <div className="col-span-2 flex items-center justify-between rounded-lg border bg-muted/30 p-3 text-sm">
                <span className="text-muted-foreground">Yarn stock available</span>
                <span className="font-semibold">{fmt(yarnStockKg)} kg</span>
              </div>

              <Button type="submit" size="lg" className="col-span-2 h-12 text-base font-semibold">
                <Plus className="h-5 w-5 mr-1" /> Save Production Entry
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5 text-primary" /> Recent Entries</CardTitle>
            <CardDescription>{dailyEntries.length} total entries</CardDescription>
          </CardHeader>
          <CardContent>
            {dailyEntries.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No production entries yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground border-b">
                    <tr>
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Type</th>
                      <th className="py-2 pr-4 text-right">Qty (dz)</th>
                      <th className="py-2 pr-4 text-right">Yarn (kg)</th>
                      <th className="py-2 pr-4 text-right">Total Cost</th>
                      <th className="py-2 pr-4 text-right">Cost/dz</th>
                      <th className="py-2 pr-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyEntries.slice(0, 50).map((e) => (
                      <tr key={e.id} className="border-b last:border-0">
                        <td className="py-2 pr-4 whitespace-nowrap">{formatDateLabel(e.date)}</td>
                        <td className="py-2 pr-4">{e.productType ? labelById[e.productType] || e.productType : "—"}</td>
                        <td className="py-2 pr-4 text-right">{fmt(e.totalProductionDozen)}</td>
                        <td className="py-2 pr-4 text-right">{fmt(e.yarnUsedKg)}</td>
                        <td className="py-2 pr-4 text-right">{money(e.totalCost)}</td>
                        <td className="py-2 pr-4 text-right">{money(e.costPerDozen)}</td>
                        <td className="py-2 pr-2 text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(e.id)} aria-label="Delete">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {dailyEntries.length > 50 && (
                  <p className="text-xs text-muted-foreground mt-3">Showing first 50 of {dailyEntries.length}.</p>
                )}
              </div>
            )}
            <Separator className="my-4" />
            <div className="flex justify-between text-sm font-semibold">
              <span>Total production</span>
              <span>{fmt(dailyEntries.reduce((s, e) => s + e.totalProductionDozen, 0))} dz</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
