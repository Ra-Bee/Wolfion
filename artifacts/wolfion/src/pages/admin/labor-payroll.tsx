import { useMemo, useState, type FormEvent } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { FileDown, Plus, Trash2, Users, DollarSign } from "lucide-react";
import { downloadReport, type WolfionReportData, type ReportRange } from "@/lib/reports";
import {
  STORAGE_KEYS,
  defaultProductTypes,
  formatDateLabel,
  getToday,
  useStored,
  type ProductTypeOption,
  type Worker,
  type WorkLog,
  type WorkerPayment,
} from "@/lib/wolfion-store";

export default function LaborPayrollPage() {
  const [productTypes] = useStored<ProductTypeOption[]>(STORAGE_KEYS.productTypes, defaultProductTypes);
  const [workers] = useStored<Worker[]>(STORAGE_KEYS.workers, []);
  const [workLogs] = useStored<WorkLog[]>(STORAGE_KEYS.workLogs, []);
  const [payments, setPayments] = useStored<WorkerPayment[]>(STORAGE_KEYS.workerPayments, []);

  const productTypeLabels = useMemo(() => {
    const m: Record<string, string> = {};
    for (const t of productTypes) m[t.id] = t.label;
    return m;
  }, [productTypes]);

  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(() => workers[0]?.id || "");
  const [paymentDate, setPaymentDate] = useState(getToday());
  const [paymentAmount, setPaymentAmount] = useState("");
  const [error, setError] = useState("");

  const workerStats = useMemo(() => workers.map((w) => {
    const earned = workLogs.filter((l) => l.workerId === w.id).reduce((a, b) => a + b.amount, 0);
    const paid = payments.filter((p) => p.workerId === w.id).reduce((a, b) => a + b.amount, 0);
    return { worker: w, totalEarned: earned, totalPaid: paid, remaining: earned - paid };
  }), [workers, workLogs, payments]);

  const selectedStat = workerStats.find((s) => s.worker.id === selectedWorkerId);
  const selectedHistory = useMemo(
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
    };
    setPayments((prev) => [entry, ...prev]);
    setPaymentAmount("");
  }

  function handleRemovePayment(id: string) {
    setPayments((prev) => prev.filter((p) => p.id !== id));
  }

  function handleDownloadLaborReport() {
    const today = getToday();
    const range: ReportRange = { label: `Labor Payroll Report — ${today}`, startDate: today, endDate: today };
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
    downloadReport(data, `Wolfion_Labor_Payroll_${today}.pdf`);
  }

  const totalPayable = workerStats.reduce((a, b) => a + b.remaining, 0);
  const totalPaidAll = workerStats.reduce((a, b) => a + b.totalPaid, 0);
  const totalEarnedAll = workerStats.reduce((a, b) => a + b.totalEarned, 0);

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2"><Users className="h-7 w-7 text-primary" /> Labor Payroll</h1>
            <p className="text-muted-foreground mt-1">Track worker earnings, payments, and remaining dues.</p>
          </div>
          <Button onClick={handleDownloadLaborReport} size="lg" className="h-12">
            <FileDown className="h-5 w-5" /> Download Labor Report
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border bg-primary/5 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total payable</p>
            <p className="text-2xl font-bold mt-1">Tk {totalPayable.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
          </div>
          <div className="rounded-2xl border bg-muted/30 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total earned</p>
            <p className="text-2xl font-bold mt-1">Tk {totalEarnedAll.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
          </div>
          <div className="rounded-2xl border bg-muted/30 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total paid</p>
            <p className="text-2xl font-bold mt-1">Tk {totalPaidAll.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
          </div>
        </div>

        {workers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No workers added yet. Add workers from the Admin Dashboard to start tracking payroll.
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-primary/30 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2"><DollarSign className="h-5 w-5 text-primary" /> Worker payments</CardTitle>
              <CardDescription>Select a worker to view balance, add payments, and see history.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2 max-w-sm">
                <label className="text-sm font-medium" htmlFor="worker-select">Select worker</label>
                <Select value={selectedWorkerId} onValueChange={setSelectedWorkerId}>
                  <SelectTrigger id="worker-select" className="h-12 text-base">
                    <SelectValue placeholder="Choose worker" />
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
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border bg-muted/40 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total earned</p>
                      <p className="text-2xl font-bold mt-1">Tk {selectedStat.totalEarned.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="rounded-2xl border bg-muted/40 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total paid</p>
                      <p className="text-2xl font-bold mt-1">Tk {selectedStat.totalPaid.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className={`rounded-2xl border p-4 ${selectedStat.remaining > 0 ? "bg-orange-100/50 dark:bg-orange-900/20" : "bg-green-100/40 dark:bg-green-900/20"}`}>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Remaining due</p>
                      <p className={`text-2xl font-bold mt-1 ${selectedStat.remaining > 0 ? "text-orange-700 dark:text-orange-400" : "text-green-700 dark:text-green-400"}`}>
                        Tk {selectedStat.remaining.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <form onSubmit={handleAddPayment} className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="pay-date">Date</label>
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
                  </form>
                  {error && (
                    <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{error}</p>
                  )}

                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Payment history — {selectedStat.worker.name}</h3>
                    {selectedHistory.length === 0 ? (
                      <p className="rounded-2xl border bg-muted/20 p-6 text-center text-sm text-muted-foreground">No payments recorded yet.</p>
                    ) : (
                      <div className="rounded-2xl border divide-y">
                        {selectedHistory.map((p) => (
                          <div key={p.id} className="flex items-center justify-between px-4 py-3">
                            <div>
                              <p className="font-medium">Tk {p.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                              <p className="text-xs text-muted-foreground">{formatDateLabel(p.date)}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleRemovePayment(p.id)} aria-label="Remove payment">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
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
            <CardTitle className="text-xl">All workers — balance summary</CardTitle>
            <CardDescription>Quick overview of every worker's current balance.</CardDescription>
          </CardHeader>
          <CardContent>
            {workerStats.length === 0 ? (
              <p className="text-sm text-muted-foreground">No workers yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="py-2 pr-4">Worker</th>
                      <th className="py-2 pr-4">Earned</th>
                      <th className="py-2 pr-4">Paid</th>
                      <th className="py-2">Remaining</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workerStats.map((s) => (
                      <tr key={s.worker.id} className="border-b last:border-0">
                        <td className="py-3 pr-4 font-medium">{s.worker.name}</td>
                        <td className="py-3 pr-4">Tk {s.totalEarned.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                        <td className="py-3 pr-4">Tk {s.totalPaid.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                        <td className={`py-3 font-semibold ${s.remaining > 0 ? "text-orange-600 dark:text-orange-400" : "text-green-700 dark:text-green-400"}`}>
                          Tk {s.remaining.toLocaleString(undefined, { maximumFractionDigits: 2 })}
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
