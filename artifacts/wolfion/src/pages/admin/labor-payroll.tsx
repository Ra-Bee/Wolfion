import { useMemo, useState, type FormEvent } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { FileDown, Plus, Users, DollarSign, ClipboardList } from "lucide-react";
import { ManageEntriesDialog } from "@/components/admin/manage-entries-dialog";
import { ReceiptCapture } from "@/components/admin/receipt-capture";
import { downloadReport, type WolfionReportData, type ReportRange } from "@/lib/reports";
import {
  STORAGE_KEYS,
  defaultProductTypes,
  formatDateLabel,
  formatTk,
  formatNum,
  getToday,
  type ProductTypeOption,
  type Worker,
  type WorkLog,
  type WorkerPayment,
} from "@/lib/wolfion-store";
import { useCloudStored } from "@/lib/cloud-store";

const money = formatTk;

export default function LaborPayrollPage() {
  const [productTypes] = useCloudStored<ProductTypeOption[]>(STORAGE_KEYS.productTypes, defaultProductTypes);
  const [workers] = useCloudStored<Worker[]>(STORAGE_KEYS.workers, []);
  const [workLogs] = useCloudStored<WorkLog[]>(STORAGE_KEYS.workLogs, []);
  const [payments, setPayments] = useCloudStored<WorkerPayment[]>(STORAGE_KEYS.workerPayments, []);

  const productTypeLabels = useMemo(() => {
    const m: Record<string, string> = {};
    for (const t of productTypes) m[t.id] = t.label;
    return m;
  }, [productTypes]);

  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(() => workers[0]?.id || "");
  const [paymentDate, setPaymentDate] = useState(getToday());
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentReceipt, setPaymentReceipt] = useState<string | undefined>(undefined);
  const [error, setError] = useState("");

  const workerStats = useMemo(() => workers.map((w) => {
    const logs = workLogs.filter((l) => l.workerId === w.id);
    const earned = logs.reduce((a, b) => a + b.amount, 0);
    const dozens = logs.reduce((a, b) => a + (b.dozens || 0), 0);
    const paid = payments.filter((p) => p.workerId === w.id).reduce((a, b) => a + b.amount, 0);
    return { worker: w, totalEarned: earned, totalDozens: dozens, totalPaid: paid, remaining: earned - paid };
  }), [workers, workLogs, payments]);

  const selectedStat = workerStats.find((s) => s.worker.id === selectedWorkerId);
  const selectedBills = useMemo(
    () => workLogs.filter((l) => l.workerId === selectedWorkerId).slice().sort((a, b) => b.date.localeCompare(a.date)),
    [workLogs, selectedWorkerId],
  );
  const selectedPayments = useMemo(
    () => payments.filter((p) => p.workerId === selectedWorkerId).slice().sort((a, b) => b.date.localeCompare(a.date)),
    [payments, selectedWorkerId],
  );

  function handleAddPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedWorkerId) { setError("Please select a worker first."); return; }
    const amt = Number(paymentAmount);
    if (!Number.isFinite(amt) || amt <= 0) { setError("Please enter a valid amount."); return; }
    if (!paymentDate) { setError("Please choose a date."); return; }
    setError("");
    const entry: WorkerPayment = {
      id: crypto.randomUUID(),
      workerId: selectedWorkerId,
      date: paymentDate,
      amount: amt,
      createdAt: new Date().toISOString(),
      ...(paymentReceipt ? { receiptImage: paymentReceipt } : {}),
    };
    setPayments((prev) => [entry, ...prev]);
    setPaymentAmount("");
    setPaymentReceipt(undefined);
  }

  function handleRemovePayment(id: string) {
    setPayments((prev) => prev.filter((p) => p.id !== id));
  }

  function handleDownloadLaborReport() {
    const today = getToday();
    const range: ReportRange = { label: `Labor Management Report — ${today}`, startDate: today, endDate: today };
    const data: WolfionReportData = {
      range,
      productTypeLabels,
      production: [],
      sales: [],
      daily: [],
      electricity: [],
      inventory: [],
      labor: workerStats.map((s) => ({
        name: s.worker.name,
        totalEarned: s.totalEarned,
        totalPaid: s.totalPaid,
        remaining: s.remaining,
      })),
      payments: payments.slice().sort((a, b) => b.date.localeCompare(a.date)).map((p) => ({
        workerName: workers.find((w) => w.id === p.workerId)?.name || "Unknown",
        date: p.date,
        amount: p.amount,
      })),
    };
    downloadReport(data, `Wolfion_Labor_Management_${today}.pdf`);
  }

  const totalPayable = workerStats.reduce((a, b) => a + b.remaining, 0);
  const totalPaidAll = workerStats.reduce((a, b) => a + b.totalPaid, 0);
  const totalEarnedAll = workerStats.reduce((a, b) => a + b.totalEarned, 0);

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2"><Users className="h-7 w-7 text-primary" /> Labor Management</h1>
            <p className="text-muted-foreground mt-1">Every staff member's work bill — date, dozens and what it was for — plus payments and dues.</p>
          </div>
          <Button onClick={handleDownloadLaborReport} size="lg" className="h-12">
            <FileDown className="h-5 w-5" /> Download Labor Report
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border bg-primary/5 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total payable</p>
            <p className="text-2xl font-bold mt-1 tabular-nums break-words">{money(totalPayable)}</p>
          </div>
          <div className="rounded-2xl border bg-muted/30 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total earned</p>
            <p className="text-2xl font-bold mt-1 tabular-nums break-words">{money(totalEarnedAll)}</p>
          </div>
          <div className="rounded-2xl border bg-muted/30 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total paid</p>
            <p className="text-2xl font-bold mt-1 tabular-nums break-words">{money(totalPaidAll)}</p>
          </div>
        </div>

        {workers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No staff added yet. Add staff from the Admin Dashboard to start tracking labor bills.
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-primary/30 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2"><ClipboardList className="h-5 w-5 text-primary" /> Staff work bill</CardTitle>
              <CardDescription>Select a staff member to see every work bill with date, dozens and details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2 max-w-sm">
                <label className="text-sm font-medium" htmlFor="worker-select">Select staff</label>
                <Select value={selectedWorkerId} onValueChange={setSelectedWorkerId}>
                  <SelectTrigger id="worker-select" className="h-12 text-base">
                    <SelectValue placeholder="Choose staff" />
                  </SelectTrigger>
                  <SelectContent>
                    {workers.map((w) => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedStat && (
                <>
                  <div className="grid gap-3 sm:grid-cols-4">
                    <div className="rounded-2xl border bg-muted/40 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total dozens</p>
                      <p className="text-2xl font-bold mt-1 tabular-nums break-words">{formatNum(selectedStat.totalDozens)}</p>
                    </div>
                    <div className="rounded-2xl border bg-muted/40 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total earned</p>
                      <p className="text-2xl font-bold mt-1 tabular-nums break-words">{money(selectedStat.totalEarned)}</p>
                    </div>
                    <div className="rounded-2xl border bg-muted/40 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total paid</p>
                      <p className="text-2xl font-bold mt-1 tabular-nums break-words">{money(selectedStat.totalPaid)}</p>
                    </div>
                    <div className={`rounded-2xl border p-4 ${selectedStat.remaining > 0 ? "bg-orange-100/50 dark:bg-orange-900/20" : "bg-green-100/40 dark:bg-green-900/20"}`}>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Remaining due</p>
                      <p className={`text-2xl font-bold mt-1 tabular-nums break-words ${selectedStat.remaining > 0 ? "text-orange-700 dark:text-orange-400" : "text-green-700 dark:text-green-400"}`}>
                        {money(selectedStat.remaining)}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Work bill detail */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Work bills — {selectedStat.worker.name}</h3>
                    {selectedBills.length === 0 ? (
                      <p className="rounded-2xl border bg-muted/20 p-6 text-center text-sm text-muted-foreground">No work bills yet. They are created automatically when you assign this staff in Daily Production Entry.</p>
                    ) : (
                      <div className="overflow-x-auto rounded-2xl border">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                              <th className="py-2 px-4">Work date</th>
                              <th className="py-2 px-4 text-right">Dozens</th>
                              <th className="py-2 px-4">Details</th>
                              <th className="py-2 px-4 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedBills.map((b) => (
                              <tr key={b.id} className="border-b last:border-0">
                                <td className="py-3 px-4 whitespace-nowrap">{formatDateLabel(b.date)}</td>
                                <td className="py-3 px-4 text-right tabular-nums">{b.dozens != null ? formatNum(b.dozens) : "—"}</td>
                                <td className="py-3 px-4">{b.note || "Manual entry"}</td>
                                <td className="py-3 px-4 text-right font-semibold tabular-nums">{money(b.amount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Payments */}
                  <form onSubmit={handleAddPayment} className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="pay-date">Payment date</label>
                      <Input id="pay-date" type="date" className="h-12 text-base" max={getToday()} value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="pay-amount">Amount paid</label>
                      <Input id="pay-amount" type="number" min="0" step="0.01" inputMode="decimal" className="h-12 text-base" placeholder="0" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} required />
                    </div>
                    <div className="space-y-2 flex items-end">
                      <Button type="submit" size="lg" className="h-12 w-full">
                        <Plus className="h-4 w-4" /> Record payment
                      </Button>
                    </div>
                    <div className="sm:col-span-3">
                      <ReceiptCapture value={paymentReceipt} onChange={setPaymentReceipt} label="Salary slip / bill photo (optional)" />
                    </div>
                  </form>
                  {error && (
                    <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{error}</p>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5"><DollarSign className="h-4 w-4" /> Payments — {selectedStat.worker.name}</h3>
                      <ManageEntriesDialog
                        title={`Manage payments — ${selectedStat.worker.name}`}
                        description="Edit or delete saved payment records."
                        entries={selectedPayments}
                        onDelete={handleRemovePayment}
                        editFields={[
                          { key: "date", label: "Date", type: "date" },
                          { key: "amount", label: "Amount (Tk)", type: "number" },
                        ]}
                        onSave={(id, patch) => setPayments((prev) => prev.map((p) => p.id === id ? { ...p, ...patch } : p))}
                        columns={[
                          { header: "Date", render: (p) => formatDateLabel(p.date) },
                          { header: "Amount", render: (p) => money(p.amount), className: "text-right" },
                        ]}
                      />
                    </div>
                    {selectedPayments.length === 0 ? (
                      <p className="rounded-2xl border bg-muted/20 p-6 text-center text-sm text-muted-foreground">No payments recorded yet.</p>
                    ) : (
                      <div className="rounded-2xl border divide-y">
                        {selectedPayments.map((p) => (
                          <div key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                            <div>
                              <p className="font-medium tabular-nums">{money(p.amount)}</p>
                              <p className="text-xs text-muted-foreground">{formatDateLabel(p.date)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">All staff — balance summary</CardTitle>
            <CardDescription>Quick overview of every staff member's current balance.</CardDescription>
          </CardHeader>
          <CardContent>
            {workerStats.length === 0 ? (
              <p className="text-sm text-muted-foreground">No staff yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="py-2 pr-4">Staff</th>
                      <th className="py-2 pr-4 text-right">Dozens</th>
                      <th className="py-2 pr-4 text-right">Earned</th>
                      <th className="py-2 pr-4 text-right">Paid</th>
                      <th className="py-2 text-right">Remaining</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workerStats.map((s) => (
                      <tr key={s.worker.id} className="border-b last:border-0">
                        <td className="py-3 pr-4 font-medium">{s.worker.name}</td>
                        <td className="py-3 pr-4 text-right tabular-nums">{formatNum(s.totalDozens)}</td>
                        <td className="py-3 pr-4 text-right tabular-nums">{money(s.totalEarned)}</td>
                        <td className="py-3 pr-4 text-right tabular-nums">{money(s.totalPaid)}</td>
                        <td className={`py-3 text-right font-semibold tabular-nums ${s.remaining > 0 ? "text-orange-600 dark:text-orange-400" : "text-green-700 dark:text-green-400"}`}>
                          {money(s.remaining)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
