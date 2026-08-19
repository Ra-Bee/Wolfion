import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { HandCoins, Plus, Users } from "lucide-react";
import { ManageEntriesDialog } from "@/components/admin/manage-entries-dialog";
import { ReceiptCapture, ReceiptThumb } from "@/components/admin/receipt-capture";
import { EmptyState } from "@/components/admin/empty-state";
import { ListFilter, useListFilter } from "@/components/admin/list-filter";
import {
  STORAGE_KEYS,
  formatDateLabel,
  formatTk,
  getToday,
  useStored,
  type Debt,
  type DebtPayment,
} from "@/lib/wolfion-store";

const money = formatTk;

export default function DebtsPage() {
  const [debts, setDebts] = useStored<Debt[]>(STORAGE_KEYS.debts, []);
  const [payments, setPayments] = useStored<DebtPayment[]>(STORAGE_KEYS.debtPayments, []);

  // New debt
  const [dDate, setDDate] = useState(getToday());
  const [dPerson, setDPerson] = useState("");
  const [dAmount, setDAmount] = useState("");
  const [dDesc, setDDesc] = useState("");
  const [dReceipt, setDReceipt] = useState<string | undefined>(undefined);
  const [dError, setDError] = useState("");

  // Payment
  const [pDebtId, setPDebtId] = useState("");
  const [pDate, setPDate] = useState(getToday());
  const [pAmount, setPAmount] = useState("");
  const [pReceipt, setPReceipt] = useState<string | undefined>(undefined);
  const [pError, setPError] = useState("");

  const summary = useMemo(() => {
    return debts.map((d) => {
      const paid = payments.filter((p) => p.debtId === d.id).reduce((s, x) => s + x.amount, 0);
      return { ...d, paid, remaining: Math.max(0, d.amount - paid) };
    });
  }, [debts, payments]);

  const totals = useMemo(() => {
    const total = summary.reduce((s, x) => s + x.amount, 0);
    const paid = summary.reduce((s, x) => s + x.paid, 0);
    return { total, paid, remaining: Math.max(0, total - paid) };
  }, [summary]);

  const [debtFilter, setDebtFilter, debtMatches] = useListFilter();
  const filteredSummary = useMemo(
    () => summary.filter((d) => debtMatches(d.date, d.personName, d.description || "")),
    [summary, debtMatches],
  );
  const [payFilter, setPayFilter, payMatches] = useListFilter();
  const filteredPayments = useMemo(
    () => payments.filter((p) => {
      const d = debts.find((x) => x.id === p.debtId);
      return payMatches(p.date, d?.personName || "");
    }),
    [payments, payMatches, debts],
  );

  const byPerson = useMemo(() => {
    const map = new Map<string, { total: number; paid: number; remaining: number }>();
    for (const s of summary) {
      const cur = map.get(s.personName) || { total: 0, paid: 0, remaining: 0 };
      cur.total += s.amount;
      cur.paid += s.paid;
      cur.remaining += s.remaining;
      map.set(s.personName, cur);
    }
    return Array.from(map.entries()).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.remaining - a.remaining);
  }, [summary]);

  const submitDebt = (e: React.FormEvent) => {
    e.preventDefault();
    setDError("");
    const a = Number(dAmount);
    if (!dDate) return setDError("Date is required.");
    if (!dPerson.trim()) return setDError("Person/Company name is required.");
    if (!Number.isFinite(a) || a <= 0) return setDError("Amount must be greater than zero.");
    const debt: Debt = {
      id: crypto.randomUUID(),
      date: dDate,
      personName: dPerson.trim(),
      amount: a,
      description: dDesc.trim() || undefined,
      createdAt: new Date().toISOString(),
      ...(dReceipt ? { receiptImage: dReceipt } : {}),
    };
    setDebts((prev) => [debt, ...prev]);
    setDPerson(""); setDAmount(""); setDDesc(""); setDReceipt(undefined);
  };

  const submitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPError("");
    const a = Number(pAmount);
    if (!pDebtId) return setPError("Choose which debt to pay.");
    if (!pDate) return setPError("Date is required.");
    if (!Number.isFinite(a) || a <= 0) return setPError("Amount must be greater than zero.");
    const pay: DebtPayment = {
      id: crypto.randomUUID(),
      debtId: pDebtId,
      date: pDate,
      amount: a,
      createdAt: new Date().toISOString(),
      ...(pReceipt ? { receiptImage: pReceipt } : {}),
    };
    setPayments((prev) => [pay, ...prev]);
    setPAmount(""); setPReceipt(undefined);
  };

  const deleteDebt = (id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
    setPayments((prev) => prev.filter((p) => p.debtId !== id));
    if (pDebtId === id) setPDebtId("");
  };

  const debtLabel = (d: Debt) => `${d.personName} — ${money(d.amount)} (${formatDateLabel(d.date)})`;

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3"><HandCoins className="h-8 w-8 text-primary" /> Debt Management</h1>
          <p className="text-muted-foreground mt-1">Track who you owe, what's been paid, and what's still due.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-2 border-primary/30 bg-primary/5"><CardContent className="p-5"><p className="text-xs text-muted-foreground">Total Debt</p><p className="text-2xl font-bold mt-1">{money(totals.total)}</p></CardContent></Card>
          <Card className="border-2 border-emerald-500/30 bg-emerald-500/5"><CardContent className="p-5"><p className="text-xs text-muted-foreground">Paid</p><p className="text-2xl font-bold mt-1">{money(totals.paid)}</p></CardContent></Card>
          <Card className="border-2 border-orange-500/30 bg-orange-500/5"><CardContent className="p-5"><p className="text-xs text-muted-foreground">Remaining Due</p><p className="text-2xl font-bold mt-1">{money(totals.remaining)}</p></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border shadow-md">
            <CardHeader>
              <CardTitle>Add New Debt</CardTitle>
              <CardDescription>Money you owe to a person or company.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitDebt} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Date</Label><Input type="date" value={dDate} onChange={(e) => setDDate(e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Amount (Tk)</Label><Input type="number" step="0.01" min="0" value={dAmount} onChange={(e) => setDAmount(e.target.value)} placeholder="0" /></div>
                <div className="space-y-1.5 sm:col-span-2"><Label>Person / Company</Label><Input value={dPerson} onChange={(e) => setDPerson(e.target.value)} placeholder="e.g. Yarn Bazar Ltd." /></div>
                <div className="space-y-1.5 sm:col-span-2"><Label>Description (optional)</Label><Input value={dDesc} onChange={(e) => setDDesc(e.target.value)} placeholder="Purpose / invoice no." /></div>
                <div className="sm:col-span-2"><ReceiptCapture value={dReceipt} onChange={setDReceipt} label="Bill / invoice photo (optional)" /></div>
                {dError && <p className="text-sm text-destructive sm:col-span-2">{dError}</p>}
                <Button type="submit" size="lg" className="sm:col-span-2 h-11"><Plus className="h-4 w-4 mr-1" /> Save Debt</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border shadow-md">
            <CardHeader>
              <CardTitle>Record Payment</CardTitle>
              <CardDescription>Reduce remaining balance on a debt.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitPayment} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Debt</Label>
                  <Select value={pDebtId} onValueChange={setPDebtId}>
                    <SelectTrigger><SelectValue placeholder={debts.length ? "Select a debt" : "Add a debt first"} /></SelectTrigger>
                    <SelectContent>
                      {debts.map((d) => <SelectItem key={d.id} value={d.id}>{debtLabel(d)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Date</Label><Input type="date" value={pDate} onChange={(e) => setPDate(e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Amount (Tk)</Label><Input type="number" step="0.01" min="0" value={pAmount} onChange={(e) => setPAmount(e.target.value)} placeholder="0" /></div>
                <div className="sm:col-span-2"><ReceiptCapture value={pReceipt} onChange={setPReceipt} label="Payment receipt photo (optional)" /></div>
                {pError && <p className="text-sm text-destructive sm:col-span-2">{pError}</p>}
                <Button type="submit" size="lg" className="sm:col-span-2 h-11" disabled={!debts.length}><Plus className="h-4 w-4 mr-1" /> Save Payment</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card className="border shadow-md">
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div>
              <CardTitle>Debts Overview</CardTitle>
              <CardDescription>Per-debt status: total, paid and remaining.</CardDescription>
            </div>
            <ManageEntriesDialog
              title="Manage debts"
              description="Edit or delete saved debt records. Editing the total updates the remaining balance automatically."
              entries={summary}
              onDelete={deleteDebt}
              editFields={[
                { key: "date", label: "Date", type: "date" },
                { key: "personName", label: "Person", type: "text" },
                { key: "amount", label: "Total amount (Tk)", type: "number" },
              ]}
              onSave={(id, patch) => setDebts((prev) => prev.map((d) => d.id === id ? { ...d, ...patch } : d))}
              columns={[
                { header: "Date", render: (d) => formatDateLabel(d.date) },
                { header: "Person", render: (d) => d.personName },
                { header: "Total", render: (d) => money(d.amount), className: "text-right" },
                { header: "Remaining", render: (d) => money(d.remaining), className: "text-right" },
              ]}
            />
          </CardHeader>
          <CardContent>
            {summary.length === 0 ? (
              <EmptyState
                icon={HandCoins}
                title="No debts recorded yet"
                description="Add your first debt above to start tracking what you owe."
              />
            ) : (
              <div className="space-y-3">
                <ListFilter state={debtFilter} onChange={setDebtFilter} searchPlaceholder="Search person or company..." />
                <div className="overflow-x-auto">
                {filteredSummary.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No debts match your filter.</p>
                ) : (
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground border-b">
                    <tr>
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Person / Company</th>
                      <th className="py-2 pr-4">Description</th>
                      <th className="py-2 pr-4 text-right">Total</th>
                      <th className="py-2 pr-4 text-right">Paid</th>
                      <th className="py-2 pr-4 text-right">Remaining</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSummary.map((d) => (
                      <tr key={d.id} className="border-b last:border-0">
                        <td className="py-2 pr-4 whitespace-nowrap">{formatDateLabel(d.date)}</td>
                        <td className="py-2 pr-4 font-medium">{d.personName}</td>
                        <td className="py-2 pr-4 text-muted-foreground">{d.description || "—"}</td>
                        <td className="py-2 pr-4 text-right">{money(d.amount)}</td>
                        <td className="py-2 pr-4 text-right text-emerald-600">{money(d.paid)}</td>
                        <td className={`py-2 pr-4 text-right font-semibold ${d.remaining > 0 ? "text-destructive" : "text-emerald-600"}`}>{money(d.remaining)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                )}
                </div>
              </div>
            )}
            <Separator className="my-4" />
            <div className="grid grid-cols-3 gap-4 text-sm font-semibold">
              <div className="flex justify-between"><span>Total</span><span>{money(totals.total)}</span></div>
              <div className="flex justify-between"><span>Paid</span><span className="text-emerald-600">{money(totals.paid)}</span></div>
              <div className="flex justify-between"><span>Remaining</span><span className="text-destructive">{money(totals.remaining)}</span></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-md">
          <CardHeader>
            <CardTitle>By Person / Company</CardTitle>
          </CardHeader>
          <CardContent>
            {byPerson.length === 0 ? (
              <EmptyState icon={Users} title="No data yet" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground border-b">
                    <tr>
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4 text-right">Total</th>
                      <th className="py-2 pr-4 text-right">Paid</th>
                      <th className="py-2 pr-4 text-right">Remaining</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byPerson.map((p) => (
                      <tr key={p.name} className="border-b last:border-0">
                        <td className="py-2 pr-4 font-medium">{p.name}</td>
                        <td className="py-2 pr-4 text-right">{money(p.total)}</td>
                        <td className="py-2 pr-4 text-right text-emerald-600">{money(p.paid)}</td>
                        <td className={`py-2 pr-4 text-right font-semibold ${p.remaining > 0 ? "text-destructive" : "text-emerald-600"}`}>{money(p.remaining)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border shadow-md">
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>{payments.length} payments recorded</CardDescription>
            </div>
            <ManageEntriesDialog
              title="Manage payments"
              description="Edit or delete saved payment records."
              entries={payments}
              onDelete={(id) => setPayments((prev) => prev.filter((x) => x.id !== id))}
              editFields={[
                { key: "date", label: "Date", type: "date" },
                { key: "amount", label: "Amount (Tk)", type: "number" },
              ]}
              onSave={(id, patch) => setPayments((prev) => prev.map((p) => p.id === id ? { ...p, ...patch } : p))}
              columns={[
                { header: "Date", render: (p) => formatDateLabel(p.date) },
                { header: "Debt", render: (p) => {
                  const d = debts.find((x) => x.id === p.debtId);
                  return d ? `${d.personName} — ${money(d.amount)}` : "(deleted)";
                } },
                { header: "Amount", render: (p) => money(p.amount), className: "text-right" },
              ]}
            />
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <EmptyState icon={HandCoins} title="No payments yet" description="Record your first payment above to reduce a debt." />
            ) : (
              <div className="space-y-3">
                <ListFilter state={payFilter} onChange={setPayFilter} searchPlaceholder="Search person..." />
                <div className="overflow-x-auto">
                {filteredPayments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No payments match your filter.</p>
                ) : (
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground border-b">
                    <tr>
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Debt</th>
                      <th className="py-2 pr-4 text-right">Amount</th>
                      <th className="py-2 pr-4">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((p) => {
                      const d = debts.find((x) => x.id === p.debtId);
                      return (
                        <tr key={p.id} className="border-b last:border-0">
                          <td className="py-2 pr-4 whitespace-nowrap">{formatDateLabel(p.date)}</td>
                          <td className="py-2 pr-4">{d ? `${d.personName} — ${money(d.amount)}` : "(deleted)"}</td>
                          <td className="py-2 pr-4 text-right font-semibold text-emerald-600">{money(p.amount)}</td>
                          <td className="py-2 pr-4"><ReceiptThumb src={p.receiptImage} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
