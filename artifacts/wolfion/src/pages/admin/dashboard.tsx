import { AppLayout } from "@/components/layout";
import { adminMetrics } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, DollarSign, Package, Factory, TrendingUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of operations, sales, and inventory.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${adminMetrics.financials.monthlyRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">This month • Margin {adminMetrics.financials.profitMargin}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Units Sold</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminMetrics.sales.thisMonth.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-600 font-medium flex items-center inline-flex">
                  <TrendingUp className="h-3 w-3 mr-1" /> {adminMetrics.sales.trend}
                </span> vs last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Active Production</CardTitle>
              <Factory className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminMetrics.production.activeBatches} Batches</div>
              <p className="text-xs text-muted-foreground mt-1">{adminMetrics.production.unitsInProduction.toLocaleString()} units • Est {adminMetrics.production.estimatedCompletion}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Inventory</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminMetrics.inventory.totalUnits.toLocaleString()}</div>
              <p className="text-xs text-destructive font-medium mt-1">{adminMetrics.inventory.lowStockAlerts} items low on stock</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Yarn Supply</CardTitle>
              <CardDescription>Current raw material levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">Cotton Blend</div>
                  <div className="text-sm">{adminMetrics.yarn.cottonBlend}</div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">Merino Wool</div>
                  <div className="text-sm">{adminMetrics.yarn.merinoWool}</div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">Elastane</div>
                  <div className="text-sm text-amber-600 font-medium">{adminMetrics.yarn.elastane} (Reorder soon)</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Sales Activity</CardTitle>
              <CardDescription>Live feed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: "ORD-9281", item: "The Everyday Crew (Onyx Black)", qty: 3, amount: "$42.00", time: "2 min ago" },
                  { id: "ORD-9280", item: "Performance Ankle (Wolf Orange)", qty: 1, amount: "$12.00", time: "15 min ago" },
                  { id: "ORD-9279", item: "Merino Lounge (Heather Grey)", qty: 2, amount: "$44.00", time: "42 min ago" },
                  { id: "ORD-9278", item: "The Everyday Crew (Arctic White)", qty: 5, amount: "$70.00", time: "1 hour ago" },
                ].map((sale) => (
                  <div key={sale.id} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">{sale.id} <span className="text-muted-foreground font-normal text-xs ml-2">{sale.time}</span></p>
                      <p className="text-xs text-muted-foreground">{sale.qty}x {sale.item}</p>
                    </div>
                    <div className="text-sm font-medium">{sale.amount}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
