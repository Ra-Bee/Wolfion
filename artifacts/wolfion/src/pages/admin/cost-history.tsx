import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Trash2, Receipt, Plus } from "lucide-react";
import {
  STORAGE_KEYS,
  formatDateLabel,
  getToday,
  useStored,
  type CostHistoryEntry,
} from "@/lib/wolfion-store";

function money(n: number) {
  return `Tk ${new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n)}`;
}

export default function CostHistoryPage() {
  const [entries, setEntries] = useStored<CostHistoryEntry[]>(STORAGE_KEYS.costHistory, []);

  const [date, setDate] = useState(getToday());
  const [item, setItem] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const sorted = useMemo(
    () => [...entries].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
    [entries],
  );

  const totals = useMemo(() => {
    const all = entries.reduce((s, x) => s + x.amount, 0);
    const thisMonth = new Date().toISOString().slice(0, 7);
    const month = entries.filter((e) => e.date.startsWith(thisMonth)).reduce((s, x) => s + x.amount, 0);
    return { all, month, count: entries.length };
  }, [entries]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const a = Number(amount);
    if (!date) return setError("Date is required.");
    if (!item.trim()) return setError("Cost item is required.");
    if (!Number.isFinite(a) || a <= 0) return setError("Amount must be greater than zero.");
    const entry: CostHistoryEntry = {
      id: crypto.randomUUID(),
      date,
      item: item.trim(),
      amount: a,
      note: note.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    setEntries((prev) => [entry, ...prev]);
    setItem("");
    setAmount("");
    setNote("");
  };

  const remove = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Receipt className="h-8 w-8 text-primary" /> Cost History
          </h1>
          <p className="text-muted-foreground mt-1">
            Log every business cost — what you paid for, when, and how much.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-2 border-primary/30 bg-primary/5">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground">Total Cost</p>
              <p className="text-2xl font-bold mt-1">{money(totals.all)}</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-orange-500/30 bg-orange-500/5">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold mt-1">{money(totals.month)}</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-emerald-500/30 bg-emerald-500/5">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground">Entries</p>
              <p className="text-2xl font-bold mt-1">{totals.count}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border shadow-md">
          <CardHeader>
            <CardTitle>Add Cost</CardTitle>
            <CardDescription>Cost item, date and amount.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  data-testid="input-cost-date"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Amount (Tk)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  data-testid="input-cost-amount"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Cost Item</Label>
                <Input
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                  placeholder="e.g. Yarn purchase, Rent, Electricity bill, Repair"
                  data-testid="input-cost-item"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Note (optional)</Label>
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Invoice no., supplier, purpose…"
                  data-testid="input-cost-note"
                />
              </div>
              {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
              <Button type="submit" size="lg" className="sm:col-span-2 h-11" data-testid="btn-add-cost">
                <Plus className="h-4 w-4 mr-1" /> Save Cost
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border shadow-md">
          <CardHeader>
            <CardTitle>History</CardTitle>
            <CardDescription>{sorted.length} cost entries — newest first.</CardDescription>
          </CardHeader>
          <CardContent>
            {sorted.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No costs recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground border-b">
                    <tr>
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Cost Item</th>
                      <th className="py-2 pr-4">Note</th>
                      <th className="py-2 pr-4 text-right">Amount</th>
                      <th className="py-2 pr-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((e) => (
                      <tr key={e.id} className="border-b last:border-0" data-testid={`row-cost-${e.id}`}>
                        <td className="py-2 pr-4 whitespace-nowrap">{formatDateLabel(e.date)}</td>
                        <td className="py-2 pr-4 font-medium">{e.item}</td>
                        <td className="py-2 pr-4 text-muted-foreground">{e.note || "—"}</td>
                        <td className="py-2 pr-4 text-right font-semibold">{money(e.amount)}</td>
                        <td className="py-2 pr-2 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(e.id)}
                            aria-label="Delete"
                            data-testid={`btn-delete-cost-${e.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Separator className="my-4" />
            <div className="flex justify-between text-sm font-semibold">
              <span>Total</span>
              <span>{money(totals.all)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
