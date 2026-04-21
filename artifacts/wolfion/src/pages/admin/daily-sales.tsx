import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Trash2, ShoppingCart, Plus } from "lucide-react";
import {
  STORAGE_KEYS,
  defaultProductTypes,
  formatDateLabel,
  getToday,
  useStored,
  type ProductTypeOption,
  type SaleEntry,
} from "@/lib/wolfion-store";

function fmt(n: number) { return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n); }
function money(n: number) { return `Tk ${fmt(n)}`; }

export default function DailySalesPage() {
  const [productTypes] = useStored<ProductTypeOption[]>(STORAGE_KEYS.productTypes, defaultProductTypes);
  const [sales, setSales] = useStored<SaleEntry[]>(STORAGE_KEYS.sales, []);

  const [date, setDate] = useState(getToday());
  const [productType, setProductType] = useState(productTypes[0]?.id ?? "");
  const [customer, setCustomer] = useState("");
  const [qty, setQty] = useState("");
  const [pricePerDozen, setPrice] = useState("");
  const [error, setError] = useState("");

  const labelById = useMemo(() => Object.fromEntries(productTypes.map((p) => [p.id, p.label])), [productTypes]);

  const totalPreview = (() => {
    const q = Number(qty); const p = Number(pricePerDozen);
    return Number.isFinite(q) && Number.isFinite(p) ? q * p : 0;
  })();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const q = Number(qty); const p = Number(pricePerDozen);
    if (!date) return setError("Date is required.");
    if (!productType) return setError("Product type is required.");
    if (!customer.trim()) return setError("Customer name is required.");
    if (!Number.isFinite(q) || q <= 0) return setError("Quantity must be greater than zero.");
    if (!Number.isFinite(p) || p <= 0) return setError("Price per dozen must be greater than zero.");

    const sale: SaleEntry = {
      id: crypto.randomUUID(),
      customerName: customer.trim(),
      productType,
      quantityDozen: q,
      pricePerDozen: p,
      totalValue: q * p,
      createdAt: new Date().toISOString(),
      date,
    };
    setSales((prev) => [sale, ...prev]);
    setCustomer(""); setQty(""); setPrice("");
  };

  const handleDelete = (id: string) => setSales((prev) => prev.filter((s) => s.id !== id));

  const totalRevenue = sales.reduce((s, x) => s + x.totalValue, 0);
  const totalQty = sales.reduce((s, x) => s + x.quantityDozen, 0);

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3"><ShoppingCart className="h-8 w-8 text-primary" /> Daily Sales Entry</h1>
          <p className="text-muted-foreground mt-1">Log every sale to track revenue and customer history.</p>
        </div>

        <Card className="border-2 border-primary/20 shadow-md">
          <CardHeader>
            <CardTitle>New Sale</CardTitle>
            <CardDescription>Total auto-calculates from quantity × price.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
              <div className="space-y-1.5 col-span-2 lg:col-span-1">
                <Label htmlFor="d">Date</Label>
                <Input id="d" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="space-y-1.5 col-span-2 lg:col-span-3">
                <Label htmlFor="c">Customer Name</Label>
                <Input id="c" value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="e.g. Karim Traders" />
              </div>
              <div className="space-y-1.5 col-span-2 lg:col-span-1">
                <Label htmlFor="q">Quantity (dozen)</Label>
                <Input id="q" type="number" step="0.01" min="0" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-1.5 col-span-2 lg:col-span-1">
                <Label htmlFor="p">Price / dozen (Tk)</Label>
                <Input id="p" type="number" step="0.01" min="0" value={pricePerDozen} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
              </div>
              <div className="rounded-lg border bg-muted/30 p-3 flex items-center justify-between col-span-4 lg:col-span-2">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-lg font-bold">{money(totalPreview)}</span>
              </div>
              <div className="space-y-1.5 col-span-4">
                <Label>Product Type</Label>
                <Select value={productType} onValueChange={setProductType}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {productTypes.map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {error && <p className="text-sm text-destructive col-span-4">{error}</p>}

              <Button type="submit" size="lg" className="col-span-4 h-12 text-base font-semibold">
                <Plus className="h-5 w-5 mr-1" /> Save Sale
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border shadow-md">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>{sales.length} sales recorded</CardDescription>
          </CardHeader>
          <CardContent>
            {sales.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No sales recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground border-b">
                    <tr>
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Customer</th>
                      <th className="py-2 pr-4">Type</th>
                      <th className="py-2 pr-4 text-right">Qty (dz)</th>
                      <th className="py-2 pr-4 text-right">Price/dz</th>
                      <th className="py-2 pr-4 text-right">Total</th>
                      <th className="py-2 pr-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.slice(0, 50).map((s) => (
                      <tr key={s.id} className="border-b last:border-0">
                        <td className="py-2 pr-4 whitespace-nowrap">{formatDateLabel(s.date || s.createdAt.slice(0, 10))}</td>
                        <td className="py-2 pr-4">{s.customerName}</td>
                        <td className="py-2 pr-4">{labelById[s.productType] || s.productType}</td>
                        <td className="py-2 pr-4 text-right">{fmt(s.quantityDozen)}</td>
                        <td className="py-2 pr-4 text-right">{money(s.pricePerDozen)}</td>
                        <td className="py-2 pr-4 text-right font-semibold">{money(s.totalValue)}</td>
                        <td className="py-2 pr-2 text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)} aria-label="Delete">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {sales.length > 50 && <p className="text-xs text-muted-foreground mt-3">Showing first 50 of {sales.length}.</p>}
              </div>
            )}
            <Separator className="my-4" />
            <div className="grid grid-cols-2 gap-4 text-sm font-semibold">
              <div className="flex justify-between"><span>Total quantity</span><span>{fmt(totalQty)} dz</span></div>
              <div className="flex justify-between"><span>Total revenue</span><span>{money(totalRevenue)}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
