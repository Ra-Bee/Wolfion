import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Home, Plus, Building2, Store } from "lucide-react";
import { ManageEntriesDialog } from "@/components/admin/manage-entries-dialog";
import { ReceiptCapture, ReceiptThumb } from "@/components/admin/receipt-capture";
import {
  STORAGE_KEYS,
  formatDateLabel,
  useStored,
  type RentEntry,
  type RentKind,
} from "@/lib/wolfion-store";

const kindLabel: Record<RentKind, string> = {
  factory: "Factory",
  shop: "Shop",
};

function money(n: number) {
  return `Tk ${new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n)}`;
}

function formatMonth(m: string) {
  if (!m) return "—";
  const [y, mm] = m.split("-");
  const d = new Date(Number(y), Number(mm) - 1, 1);
  return d.toLocaleString(undefined, { month: "long", year: "numeric" });
}

export default function RentPage() {
  const [entries, setEntries] = useStored<RentEntry[]>(STORAGE_KEYS.rents, []);

  const [kind, setKind] = useState<RentKind>("factory");
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [amount, setAmount] = useState("");
  const [paidOn, setPaidOn] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [receiptImage, setReceiptImage] = useState<string | undefined>(undefined);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState("");

  const sorted = useMemo(
    () => [...entries].sort((a, b) => (a.month < b.month ? 1 : a.month > b.month ? -1 : a.kind.localeCompare(b.kind))),
    [entries],
  );

  const totals = useMemo(() => {
    const factory = entries.filter((e) => e.kind === "factory").reduce((s, x) => s + x.amount, 0);
    const shop = entries.filter((e) => e.kind === "shop").reduce((s, x) => s + x.amount, 0);
    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthTotal = entries.filter((e) => e.month === thisMonth).reduce((s, x) => s + x.amount, 0);
    return { factory, shop, all: factory + shop, monthTotal };
  }, [entries]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setConfirm("");
    const a = Number(amount);
    if (!month) return setError("Month is required.");
    if (!Number.isFinite(a) || a <= 0) return setError("Amount must be greater than zero.");
    const entry: RentEntry = {
      id: crypto.randomUUID(),
      kind,
      month,
      amount: a,
      ...(paidOn ? { paidOn } : {}),
      ...(note.trim() ? { note: note.trim() } : {}),
      createdAt: new Date().toISOString(),
      ...(receiptImage ? { receiptImage } : {}),
    };
    setEntries((prev) => [entry, ...prev]);
    setAmount("");
    setNote("");
    setReceiptImage(undefined);
    setConfirm(`Saved ${kindLabel[kind]} rent for ${formatMonth(month)}.`);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Home className="h-8 w-8 text-primary" /> Rent
          </h1>
          <p className="text-muted-foreground mt-1">
            Track monthly rent for the factory and the shop.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="border-2 border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Building2 className="h-3 w-3" /> Factory total</p>
              <p className="text-xl font-bold mt-1">{money(totals.factory)}</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Store className="h-3 w-3" /> Shop total</p>
              <p className="text-xl font-bold mt-1">{money(totals.shop)}</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-orange-500/30 bg-orange-500/5">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">This month</p>
              <p className="text-xl font-bold mt-1">{money(totals.monthTotal)}</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-emerald-500/30 bg-emerald-500/5">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">All time</p>
              <p className="text-xl font-bold mt-1">{money(totals.all)}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border shadow-md">
          <CardHeader>
            <CardTitle>Add Rent</CardTitle>
            <CardDescription>Pick Factory or Shop, the month, and the amount.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {(["factory", "shop"] as RentKind[]).map((k) => (
                  <Button
                    key={k}
                    type="button"
                    variant={kind === k ? "default" : "outline"}
                    className="h-12 text-base"
                    onClick={() => setKind(k)}
                  >
                    {k === "factory" ? <Building2 className="h-4 w-4" /> : <Store className="h-4 w-4" />}
                    {kindLabel[k]}
                  </Button>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Month</Label>
                  <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label>Amount (Tk)</Label>
                  <Input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label>Paid on (optional)</Label>
                  <Input type="date" value={paidOn} onChange={(e) => setPaidOn(e.target.value)} className="h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label>Note (optional)</Label>
                  <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Landlord, receipt no., etc." className="h-11" />
                </div>
              </div>
              <ReceiptCapture value={receiptImage} onChange={setReceiptImage} label="Rent receipt photo (optional)" />
              {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{error}</p>}
              {confirm && <p className="rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-800">{confirm}</p>}
              <Button type="submit" size="lg" className="w-full h-12">
                <Plus className="h-4 w-4" /> Save rent
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border shadow-md">
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div>
              <CardTitle>History</CardTitle>
              <CardDescription>{sorted.length} rent entries — newest first.</CardDescription>
            </div>
            {sorted.length > 0 && (
              <ManageEntriesDialog
                title="Manage rent entries"
                description="Edit or delete saved rent entries."
                entries={sorted}
                onDelete={(id) => setEntries((prev) => prev.filter((e) => e.id !== id))}
                editFields={[
                  { key: "month", label: "Month (YYYY-MM)", type: "text" },
                  { key: "amount", label: "Amount (Tk)", type: "number" },
                  { key: "paidOn", label: "Paid on", type: "date" },
                  { key: "note", label: "Note", type: "text" },
                ]}
                onSave={(id, patch) => setEntries((prev) => prev.map((e) => e.id === id ? { ...e, ...patch } : e))}
                columns={[
                  { header: "Kind", render: (e) => kindLabel[e.kind] },
                  { header: "Month", render: (e) => formatMonth(e.month) },
                  { header: "Amount", render: (e) => money(e.amount), className: "text-right" },
                ]}
              />
            )}
          </CardHeader>
          <CardContent>
            {sorted.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No rent recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground border-b">
                    <tr>
                      <th className="py-2 pr-4">Kind</th>
                      <th className="py-2 pr-4">Month</th>
                      <th className="py-2 pr-4">Paid on</th>
                      <th className="py-2 pr-4">Note</th>
                      <th className="py-2 pr-4 text-right">Amount</th>
                      <th className="py-2 pr-4">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((e) => (
                      <tr key={e.id} className="border-b last:border-0">
                        <td className="py-2 pr-4 font-medium">
                          <span className="inline-flex items-center gap-1">
                            {e.kind === "factory" ? <Building2 className="h-3.5 w-3.5" /> : <Store className="h-3.5 w-3.5" />}
                            {kindLabel[e.kind]}
                          </span>
                        </td>
                        <td className="py-2 pr-4 whitespace-nowrap">{formatMonth(e.month)}</td>
                        <td className="py-2 pr-4 text-muted-foreground whitespace-nowrap">{e.paidOn ? formatDateLabel(e.paidOn) : "—"}</td>
                        <td className="py-2 pr-4 text-muted-foreground">{e.note || "—"}</td>
                        <td className="py-2 pr-4 text-right font-semibold">{money(e.amount)}</td>
                        <td className="py-2 pr-4"><ReceiptThumb src={e.receiptImage} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Separator className="my-4" />
            <div className="flex justify-between text-sm font-semibold">
              <span>Total rent paid</span>
              <span>{money(totals.all)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
