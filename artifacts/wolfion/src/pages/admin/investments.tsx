import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Wallet, Plus, Users as UsersIcon } from "lucide-react";
import { ManageEntriesDialog } from "@/components/admin/manage-entries-dialog";
import {
  STORAGE_KEYS,
  formatDateLabel,
  getToday,
  useStored,
  type Investment,
  type InvestorEntry,
} from "@/lib/wolfion-store";

function money(n: number) { return `Tk ${new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n)}`; }

export default function InvestmentsPage() {
  const [investments, setInvestments] = useStored<Investment[]>(STORAGE_KEYS.investments, []);
  const [investors, setInvestors] = useStored<InvestorEntry[]>(STORAGE_KEYS.investors, []);

  // Investment form
  const [iDate, setIDate] = useState(getToday());
  const [iType, setIType] = useState("");
  const [iDesc, setIDesc] = useState("");
  const [iAmount, setIAmount] = useState("");
  const [iSource, setISource] = useState("");
  const [iError, setIError] = useState("");

  // Investor form
  const [vName, setVName] = useState("");
  const [vDate, setVDate] = useState(getToday());
  const [vAmount, setVAmount] = useState("");
  const [vError, setVError] = useState("");

  const totalInvested = investments.reduce((s, x) => s + x.amount, 0);
  const totalFromInvestors = investors.reduce((s, x) => s + x.amount, 0);

  const perInvestor = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of investors) map.set(v.name, (map.get(v.name) || 0) + v.amount);
    return Array.from(map.entries())
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [investors]);

  const submitInvestment = (e: React.FormEvent) => {
    e.preventDefault();
    setIError("");
    const a = Number(iAmount);
    if (!iDate) return setIError("Date is required.");
    if (!iType.trim()) return setIError("Type is required (e.g. Equipment, Yarn, Cash).");
    if (!Number.isFinite(a) || a <= 0) return setIError("Amount must be greater than zero.");
    const inv: Investment = {
      id: crypto.randomUUID(),
      date: iDate,
      type: iType.trim(),
      description: iDesc.trim(),
      amount: a,
      source: iSource.trim(),
      createdAt: new Date().toISOString(),
    };
    setInvestments((prev) => [inv, ...prev]);
    setIType(""); setIDesc(""); setIAmount(""); setISource("");
  };

  const submitInvestor = (e: React.FormEvent) => {
    e.preventDefault();
    setVError("");
    const a = Number(vAmount);
    if (!vName.trim()) return setVError("Investor name is required.");
    if (!vDate) return setVError("Date is required.");
    if (!Number.isFinite(a) || a <= 0) return setVError("Amount must be greater than zero.");
    const v: InvestorEntry = {
      id: crypto.randomUUID(),
      name: vName.trim(),
      date: vDate,
      amount: a,
      createdAt: new Date().toISOString(),
    };
    setInvestors((prev) => [v, ...prev]);
    setVName(""); setVAmount("");
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3"><Wallet className="h-8 w-8 text-primary" /> Investment & Investor</h1>
          <p className="text-muted-foreground mt-1">Track all business investments and contributions from investors.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-2 border-primary/30 bg-primary/5">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground">Total Invested</p>
              <p className="text-2xl font-bold mt-1">{money(totalInvested)}</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-emerald-500/30 bg-emerald-500/5">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground">Investor Contributions</p>
              <p className="text-2xl font-bold mt-1">{money(totalFromInvestors)}</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-orange-500/30 bg-orange-500/5">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground">Unique Investors</p>
              <p className="text-2xl font-bold mt-1">{perInvestor.length}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Wallet className="h-5 w-5 text-primary" /> Add Investment</CardTitle>
              <CardDescription>Equipment, yarn, cash etc.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitInvestment} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Date</Label><Input type="date" value={iDate} onChange={(e) => setIDate(e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Type</Label><Input value={iType} onChange={(e) => setIType(e.target.value)} placeholder="Equipment / Yarn / Cash" /></div>
                <div className="space-y-1.5 sm:col-span-2"><Label>Description</Label><Input value={iDesc} onChange={(e) => setIDesc(e.target.value)} placeholder="Optional" /></div>
                <div className="space-y-1.5"><Label>Amount (Tk)</Label><Input type="number" step="0.01" min="0" value={iAmount} onChange={(e) => setIAmount(e.target.value)} placeholder="0" /></div>
                <div className="space-y-1.5"><Label>Source</Label><Input value={iSource} onChange={(e) => setISource(e.target.value)} placeholder="Owner / Bank / Investor name" /></div>
                {iError && <p className="text-sm text-destructive sm:col-span-2">{iError}</p>}
                <Button type="submit" size="lg" className="sm:col-span-2 h-11"><Plus className="h-4 w-4 mr-1" /> Save Investment</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UsersIcon className="h-5 w-5 text-primary" /> Add Investor Contribution</CardTitle>
              <CardDescription>Money received from an investor.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitInvestor} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5 sm:col-span-2"><Label>Investor Name</Label><Input value={vName} onChange={(e) => setVName(e.target.value)} placeholder="e.g. Rahim Uddin" /></div>
                <div className="space-y-1.5"><Label>Date</Label><Input type="date" value={vDate} onChange={(e) => setVDate(e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Amount (Tk)</Label><Input type="number" step="0.01" min="0" value={vAmount} onChange={(e) => setVAmount(e.target.value)} placeholder="0" /></div>
                {vError && <p className="text-sm text-destructive sm:col-span-2">{vError}</p>}
                <Button type="submit" size="lg" className="sm:col-span-2 h-11"><Plus className="h-4 w-4 mr-1" /> Save Contribution</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card className="border shadow-md">
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div>
              <CardTitle>All Investments</CardTitle>
              <CardDescription>{investments.length} entries</CardDescription>
            </div>
            <ManageEntriesDialog
              title="Manage investments"
              description="Delete saved investment entries."
              entries={investments}
              onDelete={(id) => setInvestments((p) => p.filter((x) => x.id !== id))}
              columns={[
                { header: "Date", render: (i) => formatDateLabel(i.date) },
                { header: "Type", render: (i) => i.type },
                { header: "Source", render: (i) => i.source || "—" },
                { header: "Amount", render: (i) => money(i.amount), className: "text-right" },
              ]}
            />
          </CardHeader>
          <CardContent>
            {investments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No investments yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground border-b">
                    <tr>
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Type</th>
                      <th className="py-2 pr-4">Description</th>
                      <th className="py-2 pr-4">Source</th>
                      <th className="py-2 pr-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investments.map((i) => (
                      <tr key={i.id} className="border-b last:border-0">
                        <td className="py-2 pr-4 whitespace-nowrap">{formatDateLabel(i.date)}</td>
                        <td className="py-2 pr-4">{i.type}</td>
                        <td className="py-2 pr-4">{i.description || "—"}</td>
                        <td className="py-2 pr-4">{i.source || "—"}</td>
                        <td className="py-2 pr-4 text-right font-semibold">{money(i.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Separator className="my-4" />
            <div className="flex justify-between text-sm font-semibold"><span>Total invested</span><span>{money(totalInvested)}</span></div>
          </CardContent>
        </Card>

        <Card className="border shadow-md">
          <CardHeader>
            <CardTitle>Per Investor Summary</CardTitle>
            <CardDescription>Aggregated by investor name.</CardDescription>
          </CardHeader>
          <CardContent>
            {perInvestor.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No investor contributions yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground border-b">
                    <tr>
                      <th className="py-2 pr-4">Investor</th>
                      <th className="py-2 pr-4 text-right">Total Contributed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {perInvestor.map((p) => (
                      <tr key={p.name} className="border-b last:border-0">
                        <td className="py-2 pr-4">{p.name}</td>
                        <td className="py-2 pr-4 text-right font-semibold">{money(p.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {investors.length > 0 && (
              <>
                <Separator className="my-4" />
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-sm font-semibold">Recent contributions</h3>
                  <ManageEntriesDialog
                    title="Manage contributions"
                    description="Delete saved investor contributions."
                    entries={investors}
                    onDelete={(id) => setInvestors((p) => p.filter((x) => x.id !== id))}
                    columns={[
                      { header: "Date", render: (v) => formatDateLabel(v.date) },
                      { header: "Investor", render: (v) => v.name },
                      { header: "Amount", render: (v) => money(v.amount), className: "text-right" },
                    ]}
                  />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-muted-foreground border-b">
                      <tr>
                        <th className="py-2 pr-4">Date</th>
                        <th className="py-2 pr-4">Investor</th>
                        <th className="py-2 pr-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {investors.slice(0, 30).map((v) => (
                        <tr key={v.id} className="border-b last:border-0">
                          <td className="py-2 pr-4 whitespace-nowrap">{formatDateLabel(v.date)}</td>
                          <td className="py-2 pr-4">{v.name}</td>
                          <td className="py-2 pr-4 text-right">{money(v.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
