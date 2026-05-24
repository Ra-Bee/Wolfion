import { useMemo, useState, type FormEvent } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Zap, Plus, Battery } from "lucide-react";
import { ManageEntriesDialog } from "@/components/admin/manage-entries-dialog";
import { ReceiptCapture, ReceiptThumb } from "@/components/admin/receipt-capture";
import { EmptyState } from "@/components/admin/empty-state";
import {
  STORAGE_KEYS,
  formatDateLabel,
  formatTk,
  useStored,
  type ElectricityEntry,
} from "@/lib/wolfion-store";

type Recharge = {
  id: string;
  date: string;
  amount: number;
  note?: string;
  createdAt: string;
  receiptImage?: string;
};

const money = formatTk;

function formatMonthLabel(month: string) {
  if (!month) return "—";
  return new Date(`${month}-01T00:00:00`).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export default function ElectricityPage() {
  const [entries, setEntries] = useStored<ElectricityEntry[]>(STORAGE_KEYS.electricity, []);
  const [recharges, setRecharges] = useStored<Recharge[]>(STORAGE_KEYS.electricityRecharges, []);

  // Monthly bill form
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [bill, setBill] = useState("");
  const [billReceipt, setBillReceipt] = useState<string | undefined>(undefined);
  const [billError, setBillError] = useState("");
  const [billConfirm, setBillConfirm] = useState("");

  // Recharge form
  const [rDate, setRDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [rAmt, setRAmt] = useState("");
  const [rNote, setRNote] = useState("");
  const [rReceipt, setRReceipt] = useState<string | undefined>(undefined);
  const [rError, setRError] = useState("");
  const [rConfirm, setRConfirm] = useState("");

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => (a.month < b.month ? 1 : -1)),
    [entries],
  );
  const sortedRecharges = useMemo(
    () => [...recharges].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [recharges],
  );

  const totals = useMemo(() => {
    const billsAll = entries.reduce((s, x) => s + (Number(x.totalBill) || 0), 0);
    const rechAll = recharges.reduce((s, x) => s + (Number(x.amount) || 0), 0);
    const thisMonth = new Date().toISOString().slice(0, 7);
    const billThis = entries.find((e) => e.month === thisMonth)?.totalBill || 0;
    const rechThis = recharges
      .filter((r) => r.date.startsWith(thisMonth))
      .reduce((s, x) => s + (Number(x.amount) || 0), 0);
    return { billsAll, rechAll, billThis, rechThis };
  }, [entries, recharges]);

  function saveBill(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBillError("");
    setBillConfirm("");
    const a = Number(bill);
    if (!month || !Number.isFinite(a) || a <= 0) {
      setBillError("Enter a month and a valid bill amount.");
      return;
    }
    setEntries((current) => {
      const filtered = current.filter((x) => x.month !== month);
      return [
        {
          id: crypto.randomUUID(),
          month,
          totalBill: a,
          createdAt: new Date().toISOString(),
          ...(billReceipt ? { receiptImage: billReceipt } : {}),
        },
        ...filtered,
      ];
    });
    setBill("");
    setBillReceipt(undefined);
    setBillConfirm(`Saved ${formatMonthLabel(month)} electricity bill.`);
  }

  function saveRecharge(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setRError("");
    setRConfirm("");
    const a = Number(rAmt);
    if (!rDate || !Number.isFinite(a) || a <= 0) {
      setRError("Enter a date and a valid recharge amount.");
      return;
    }
    setRecharges((current) => [
      {
        id: crypto.randomUUID(),
        date: rDate,
        amount: a,
        ...(rNote.trim() ? { note: rNote.trim() } : {}),
        createdAt: new Date().toISOString(),
        ...(rReceipt ? { receiptImage: rReceipt } : {}),
      },
      ...current,
    ]);
    setRAmt("");
    setRNote("");
    setRReceipt(undefined);
    setRConfirm(`Recharge of ${money(a)} saved.`);
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Zap className="h-8 w-8 text-primary" /> Electricity Bill
          </h1>
          <p className="text-muted-foreground mt-1">
            Monthly electricity bill and prepaid card recharges.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="border-2 border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Bill this month</p>
              <p className="text-xl font-bold mt-1">{money(totals.billThis)}</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Recharged this month</p>
              <p className="text-xl font-bold mt-1">{money(totals.rechThis)}</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-orange-500/30 bg-orange-500/5">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Bills all time</p>
              <p className="text-xl font-bold mt-1">{money(totals.billsAll)}</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-emerald-500/30 bg-emerald-500/5">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Recharged all time</p>
              <p className="text-xl font-bold mt-1">{money(totals.rechAll)}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border shadow-md">
          <CardHeader>
            <CardTitle>Add monthly bill</CardTitle>
            <CardDescription>Save the total electricity bill for a month.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveBill} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Month</label>
                  <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="h-11" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Total bill (Tk)</label>
                  <Input type="number" min="1" step="0.01" inputMode="decimal" value={bill} onChange={(e) => setBill(e.target.value)} placeholder="0" className="h-11" required />
                </div>
              </div>
              <ReceiptCapture value={billReceipt} onChange={setBillReceipt} label="Bill photo (optional)" />
              {billError && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{billError}</p>}
              {billConfirm && <p className="rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-800">{billConfirm}</p>}
              <Button type="submit" size="lg" className="w-full h-12"><Plus className="h-4 w-4" /> Save bill</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border shadow-md">
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div>
              <CardTitle>Monthly history</CardTitle>
              <CardDescription>{sortedEntries.length} months</CardDescription>
            </div>
            {sortedEntries.length > 0 && (
              <ManageEntriesDialog
                title="Manage electricity bills"
                description="Edit the month or total bill, or delete a saved entry."
                entries={sortedEntries}
                onDelete={(id) => setEntries((prev) => prev.filter((x) => x.id !== id))}
                editFields={[
                  { key: "month", label: "Month (YYYY-MM)", type: "text" },
                  { key: "totalBill", label: "Total bill (Tk)", type: "number" },
                ]}
                onSave={(id, patch) => setEntries((prev) => prev.map((e) => e.id === id ? { ...e, ...patch } : e))}
                columns={[
                  { header: "Month", render: (e) => formatMonthLabel(e.month) },
                  { header: "Bill", render: (e) => money(e.totalBill), className: "text-right" },
                ]}
              />
            )}
          </CardHeader>
          <CardContent>
            {sortedEntries.length === 0 ? (
              <EmptyState icon={Zap} title="No bills saved yet" description="Save this month's electricity bill above." />
            ) : (
              <div className="space-y-2">
                {sortedEntries.map((e) => (
                  <div key={e.id} className="flex items-center justify-between gap-3 rounded-xl border bg-card/60 px-4 py-3">
                    <p className="text-sm font-semibold">{formatMonthLabel(e.month)}</p>
                    <div className="flex items-center gap-3">
                      <p className="text-base font-bold whitespace-nowrap">{money(e.totalBill)}</p>
                      <ReceiptThumb src={e.receiptImage} size={36} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border shadow-md">
          <CardHeader>
            <CardTitle>Card recharge</CardTitle>
            <CardDescription>Prepaid meter recharge log.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveRecharge} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Date</label>
                  <Input type="date" value={rDate} onChange={(e) => setRDate(e.target.value)} className="h-11" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Recharge amount (Tk)</label>
                  <Input type="number" min="1" step="0.01" inputMode="decimal" value={rAmt} onChange={(e) => setRAmt(e.target.value)} placeholder="0" className="h-11" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Note (optional)</label>
                <Input value={rNote} onChange={(e) => setRNote(e.target.value)} placeholder="e.g. Auto-pay from bKash card" className="h-11" />
              </div>
              <ReceiptCapture value={rReceipt} onChange={setRReceipt} label="Recharge receipt (optional)" />
              {rError && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{rError}</p>}
              {rConfirm && <p className="rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-800">{rConfirm}</p>}
              <Button type="submit" size="lg" className="w-full h-12"><Plus className="h-4 w-4" /> Save recharge</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border shadow-md">
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div>
              <CardTitle>Recharge history</CardTitle>
              <CardDescription>{sortedRecharges.length} entries · Total {money(totals.rechAll)}</CardDescription>
            </div>
            {sortedRecharges.length > 0 && (
              <ManageEntriesDialog
                title="Manage recharges"
                description="Edit or delete a saved electricity card recharge."
                entries={sortedRecharges}
                onDelete={(id) => setRecharges((prev) => prev.filter((x) => x.id !== id))}
                editFields={[
                  { key: "date", label: "Date", type: "date" },
                  { key: "amount", label: "Amount (Tk)", type: "number" },
                  { key: "note", label: "Note", type: "text" },
                ]}
                onSave={(id, patch) => setRecharges((prev) => prev.map((e) => e.id === id ? { ...e, ...patch } : e))}
                columns={[
                  { header: "Date", render: (e) => formatDateLabel(e.date) },
                  { header: "Amount", render: (e) => money(e.amount), className: "text-right" },
                ]}
              />
            )}
          </CardHeader>
          <CardContent>
            {sortedRecharges.length === 0 ? (
              <EmptyState icon={Battery} title="No recharges yet" description="Log your first prepaid card top-up above." />
            ) : (
              <div className="space-y-2">
                {sortedRecharges.map((r) => (
                  <div key={r.id} className="flex items-center justify-between gap-3 rounded-xl border bg-card/60 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{formatDateLabel(r.date)}</p>
                      {r.note && <p className="text-xs text-muted-foreground truncate">{r.note}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-base font-bold whitespace-nowrap">{money(r.amount)}</p>
                      <ReceiptThumb src={r.receiptImage} size={36} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Separator className="my-4" />
            <div className="flex justify-between text-sm font-semibold">
              <span>Total recharged</span>
              <span>{money(totals.rechAll)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
