import { useMemo } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, DollarSign, Package, Factory, Zap, Users as UsersIcon } from "lucide-react";
import {
  STORAGE_KEYS,
  defaultProductTypes,
  useStored,
  type DailyProductionEntry,
  type ElectricityEntry,
  type ProductTypeOption,
  type SaleEntry,
  type WorkerPayment,
} from "@/lib/wolfion-store";

function money(n: number) { return `Tk ${new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n)}`; }
function monthKey(iso: string) { return iso?.slice(0, 7) ?? ""; }
function monthLabel(key: string) {
  if (!key) return "";
  const [y, m] = key.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export default function ProfitDashboardPage() {
  const [productTypes] = useStored<ProductTypeOption[]>(STORAGE_KEYS.productTypes, defaultProductTypes);
  const [sales] = useStored<SaleEntry[]>(STORAGE_KEYS.sales, []);
  const [daily] = useStored<DailyProductionEntry[]>(STORAGE_KEYS.daily, []);
  const [electricity] = useStored<ElectricityEntry[]>(STORAGE_KEYS.electricity, []);
  const [workerPayments] = useStored<WorkerPayment[]>(STORAGE_KEYS.workerPayments, []);

  const labelById = useMemo(() => Object.fromEntries(productTypes.map((p) => [p.id, p.label])), [productTypes]);
  const thisMonth = new Date().toISOString().slice(0, 7);

  const totalRevenue = sales.reduce((s, x) => s + x.totalValue, 0);
  const productionCost = daily.reduce((s, x) => s + x.totalCost, 0);
  const electricityCost = electricity.reduce((s, x) => s + x.totalBill, 0);
  const laborPaid = workerPayments.reduce((s, x) => s + x.amount, 0);
  const totalCost = productionCost + electricityCost + laborPaid;
  const totalProfit = totalRevenue - totalCost;

  const monthRevenue = sales.filter((s) => (s.date || s.createdAt.slice(0, 10)).startsWith(thisMonth)).reduce((a, x) => a + x.totalValue, 0);
  const monthProdCost = daily.filter((d) => d.date.startsWith(thisMonth)).reduce((a, x) => a + x.totalCost, 0);
  const monthElec = electricity.filter((e) => e.month === thisMonth).reduce((a, x) => a + x.totalBill, 0);
  const monthLabor = workerPayments.filter((p) => p.date.startsWith(thisMonth)).reduce((a, x) => a + x.amount, 0);
  const monthProfit = monthRevenue - (monthProdCost + monthElec + monthLabor);

  const byMonth = useMemo(() => {
    const months = new Set<string>();
    sales.forEach((s) => months.add(monthKey(s.date || s.createdAt)));
    daily.forEach((d) => months.add(monthKey(d.date)));
    electricity.forEach((e) => months.add(e.month));
    workerPayments.forEach((p) => months.add(monthKey(p.date)));
    months.delete("");
    const arr = Array.from(months).sort().reverse();
    return arr.map((mk) => {
      const rev = sales.filter((s) => monthKey(s.date || s.createdAt) === mk).reduce((a, x) => a + x.totalValue, 0);
      const pc = daily.filter((d) => d.date.startsWith(mk)).reduce((a, x) => a + x.totalCost, 0);
      const ec = electricity.filter((e) => e.month === mk).reduce((a, x) => a + x.totalBill, 0);
      const lc = workerPayments.filter((p) => p.date.startsWith(mk)).reduce((a, x) => a + x.amount, 0);
      const cost = pc + ec + lc;
      return { mk, label: monthLabel(mk), revenue: rev, cost, profit: rev - cost };
    });
  }, [sales, daily, electricity, workerPayments]);

  const byType = useMemo(() => {
    return productTypes.map((p) => {
      const rev = sales.filter((s) => s.productType === p.id).reduce((a, x) => a + x.totalValue, 0);
      const qty = sales.filter((s) => s.productType === p.id).reduce((a, x) => a + x.quantityDozen, 0);
      return { id: p.id, label: p.label, revenue: rev, qty };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [productTypes, sales]);

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3"><TrendingUp className="h-8 w-8 text-primary" /> Profit Dashboard</h1>
          <p className="text-muted-foreground mt-1">Revenue, cost, and profit at a glance.</p>
        </div>

        <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5 lg:gap-4">
          <KPI title="Total Revenue" value={money(totalRevenue)} icon={<DollarSign className="h-5 w-5 text-emerald-500" />} accent="emerald" />
          <KPI title="Total Cost" value={money(totalCost)} icon={<Package className="h-5 w-5 text-orange-500" />} accent="orange" />
          <KPI title="Total Profit" value={money(totalProfit)} icon={<TrendingUp className="h-5 w-5 text-primary" />} accent={totalProfit >= 0 ? "emerald" : "red"} />
          <KPI title="This Month Profit" value={money(monthProfit)} icon={<TrendingUp className="h-5 w-5 text-primary" />} accent={monthProfit >= 0 ? "emerald" : "red"} />
        </div>

        <Card className="border-2 border-primary/20 shadow-md">
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
            <CardDescription>Where the money is going.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-2 sm:gap-4">
            <Tile icon={<Factory className="h-5 w-5" />} label="Production cost" value={money(productionCost)} />
            <Tile icon={<Zap className="h-5 w-5" />} label="Electricity" value={money(electricityCost)} />
            <Tile icon={<UsersIcon className="h-5 w-5" />} label="Labor paid" value={money(laborPaid)} />
          </CardContent>
        </Card>

        <Card className="border shadow-md">
          <CardHeader>
            <CardTitle>Profit by Month</CardTitle>
            <CardDescription>Most recent first.</CardDescription>
          </CardHeader>
          <CardContent>
            {byMonth.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No data yet. Add sales and production entries.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground border-b">
                    <tr>
                      <th className="py-2 pr-4">Month</th>
                      <th className="py-2 pr-4 text-right">Revenue</th>
                      <th className="py-2 pr-4 text-right">Cost</th>
                      <th className="py-2 pr-4 text-right">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byMonth.map((r) => (
                      <tr key={r.mk} className="border-b last:border-0">
                        <td className="py-2 pr-4 whitespace-nowrap">{r.label}</td>
                        <td className="py-2 pr-4 text-right">{money(r.revenue)}</td>
                        <td className="py-2 pr-4 text-right">{money(r.cost)}</td>
                        <td className={`py-2 pr-4 text-right font-semibold ${r.profit >= 0 ? "text-emerald-600" : "text-destructive"}`}>{money(r.profit)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border shadow-md">
          <CardHeader>
            <CardTitle>Revenue by Product Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground border-b">
                  <tr>
                    <th className="py-2 pr-4">Product</th>
                    <th className="py-2 pr-4 text-right">Qty (dz)</th>
                    <th className="py-2 pr-4 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {byType.map((t) => (
                    <tr key={t.id} className="border-b last:border-0">
                      <td className="py-2 pr-4">{t.label}</td>
                      <td className="py-2 pr-4 text-right">{t.qty.toLocaleString()}</td>
                      <td className="py-2 pr-4 text-right font-semibold">{money(t.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between text-sm font-semibold">
              <span>Total revenue</span><span>{money(totalRevenue)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

function KPI({ title, value, icon, accent }: { title: string; value: string; icon: React.ReactNode; accent: "emerald" | "orange" | "red" }) {
  const ring = accent === "emerald" ? "border-emerald-500/30 bg-emerald-500/5"
    : accent === "orange" ? "border-orange-500/30 bg-orange-500/5"
    : "border-red-500/30 bg-red-500/5";
  return (
    <Card className={`border-2 ${ring} shadow-sm`}>
      <CardContent className="p-5 flex items-center gap-3">
        <div className="rounded-full bg-background border p-2">{icon}</div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="text-xl font-bold truncate">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Tile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4 flex items-center gap-3">
      <div className="rounded-full bg-background border p-2 text-primary">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
}
