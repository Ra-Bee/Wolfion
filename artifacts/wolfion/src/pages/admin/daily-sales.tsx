import { useMemo, useRef, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductTypeSelectItems } from "@/components/admin/product-type-select-items";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShoppingCart, Plus, Camera, X } from "lucide-react";
import { ManageEntriesDialog } from "@/components/admin/manage-entries-dialog";
import { EmptyState } from "@/components/admin/empty-state";
import { ListFilter, useListFilter } from "@/components/admin/list-filter";
import {
  STORAGE_KEYS,
  defaultProductTypes,
  defaultProductConfigs,
  formatDateLabel,
  formatNum,
  formatTk,
  getToday,
  initialInventory,
  FOOTBALL_COMBO_ID,
  FOOTBALL_COMBO_LABEL,
  FOOTBALL_TOP_ID,
  FOOTBALL_BOTTOM_ID,
  mergeComboSaleRows,
  type ProductConfig,
  type ProductionEntry,
  type ProductTypeOption,
  type SaleEntry,
} from "@/lib/wolfion-store";
import { useCloudStored } from "@/lib/cloud-store";
import { productTypeImage } from "@/lib/product-images";

const fmt = formatNum;
const money = formatTk;

const MAX_RECEIPT_DIM = 1280;
const RECEIPT_QUALITY = 0.7;

async function compressImage(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Could not read image"));
    el.src = dataUrl;
  });
  let { width, height } = img;
  if (width > MAX_RECEIPT_DIM || height > MAX_RECEIPT_DIM) {
    const scale = Math.min(MAX_RECEIPT_DIM / width, MAX_RECEIPT_DIM / height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", RECEIPT_QUALITY);
}

export default function DailySalesPage() {
  const [productTypes] = useCloudStored<ProductTypeOption[]>(STORAGE_KEYS.productTypes, defaultProductTypes);
  const [productConfigs] = useCloudStored<ProductConfig[]>(STORAGE_KEYS.productConfigs, defaultProductConfigs);
  const [productionEntries] = useCloudStored<ProductionEntry[]>(STORAGE_KEYS.production, []);
  const [sales, setSales] = useCloudStored<SaleEntry[]>(STORAGE_KEYS.sales, []);

  const [date, setDate] = useState(getToday());
  const [productType, setProductType] = useState(productTypes[0]?.id ?? "");
  const [customer, setCustomer] = useState("");
  const [qty, setQty] = useState("");
  const [pricePerDozen, setPrice] = useState("");
  const [receiptImage, setReceiptImage] = useState<string | undefined>(undefined);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [viewReceipt, setViewReceipt] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const labelById = useMemo<Record<string, string>>(
    () => ({ ...Object.fromEntries(productTypes.map((p) => [p.id, p.label])), [FOOTBALL_COMBO_ID]: FOOTBALL_COMBO_LABEL }),
    [productTypes],
  );

  // Live stock per product type (production minus sales), used to block
  // overselling — mirrors the dashboard's inventory computation.
  const inventory = useMemo(() => {
    const stock: Record<string, number> = {};
    for (const t of productTypes) stock[t.id] = initialInventory[t.id] || 0;
    for (const entry of productionEntries) {
      stock[entry.productType] = (stock[entry.productType] || 0) + entry.quantityDozen;
    }
    for (const entry of sales) {
      stock[entry.productType] = Math.max(0, (stock[entry.productType] || 0) - entry.quantityDozen);
    }
    return stock;
  }, [productTypes, productionEntries, sales]);

  const [filter, setFilter, matches] = useListFilter();
  // Full-set football sales are stored as two part records sharing a comboId;
  // history shows them as ONE "Full Set" row with the combined bill.
  const displaySales = useMemo(() => mergeComboSaleRows(sales), [sales]);
  const filteredSales = useMemo(
    () => displaySales.filter((s) => matches(s.date || s.createdAt.slice(0, 10), s.customerName, labelById[s.productType] || s.productType)),
    [displaySales, matches, labelById],
  );

  const totalPreview = (() => {
    const q = Number(qty); const p = Number(pricePerDozen);
    return Number.isFinite(q) && Number.isFinite(p) ? q * p : 0;
  })();

  const handleReceiptPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setScanning(true);
    setError("");
    try {
      const compressed = await compressImage(file);
      setReceiptImage(compressed);
    } catch {
      setError("Could not read receipt image. Try again.");
    } finally {
      setScanning(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const q = Number(qty); const p = Number(pricePerDozen);
    if (!date) return setError("Date is required.");
    if (!productType) return setError("Product type is required.");
    if (!customer.trim()) return setError("Customer name is required.");
    if (!Number.isFinite(q) || q <= 0) return setError("Quantity must be greater than zero.");
    if (!Number.isFinite(p) || p <= 0) return setError("Price per dozen must be greater than zero.");

    // Validate against available stock. A full-set football sale consumes
    // the quantity from BOTH the top part and the bottom part.
    const neededTypes = productType === FOOTBALL_COMBO_ID ? [FOOTBALL_TOP_ID, FOOTBALL_BOTTOM_ID] : [productType];
    for (const pt of neededTypes) {
      const available = inventory[pt] ?? 0;
      if (q > available) {
        return setError(`Only ${fmt(available)} dz ${(labelById[pt] || pt).toLowerCase()} available.`);
      }
    }

    const createdAt = new Date().toISOString();
    if (productType === FOOTBALL_COMBO_ID) {
      // "Sports Football (Full Set)": one football dozen = one top-part dozen
      // + one bottom-part dozen. Record both parts at the full quantity and
      // split the bill in proportion to their configured selling prices.
      const priceOf = (pt: string) => {
        const c = productConfigs.find((cfg) => cfg && cfg.id === pt);
        const v = Number(c?.sellingPricePerDozen);
        return Number.isFinite(v) && v > 0 ? v : 0;
      };
      const pTop = priceOf(FOOTBALL_TOP_ID);
      const pBottom = priceOf(FOOTBALL_BOTTOM_ID);
      const topShare = pTop + pBottom > 0 ? pTop / (pTop + pBottom) : 0.5;
      const total = q * p;
      const vTop = total * topShare;
      const vBottom = total - vTop;
      const comboId = crypto.randomUUID();
      const newSales: SaleEntry[] = (
        [
          [FOOTBALL_TOP_ID, vTop],
          [FOOTBALL_BOTTOM_ID, vBottom],
        ] as const
      ).map(([pt, v]) => ({
        id: crypto.randomUUID(),
        customerName: customer.trim(),
        productType: pt,
        quantityDozen: q,
        pricePerDozen: v / q,
        totalValue: v,
        createdAt,
        date,
        comboId,
        ...(receiptImage ? { receiptImage } : {}),
      }));
      setSales((prev) => [...newSales, ...prev]);
      setCustomer(""); setQty(""); setPrice(""); setReceiptImage(undefined);
      return;
    }
    const sale: SaleEntry = {
      id: crypto.randomUUID(),
      customerName: customer.trim(),
      productType,
      quantityDozen: q,
      pricePerDozen: p,
      totalValue: q * p,
      createdAt,
      date,
      ...(receiptImage ? { receiptImage } : {}),
    };
    setSales((prev) => [sale, ...prev]);
    setCustomer(""); setQty(""); setPrice(""); setReceiptImage(undefined);
  };

  // A "Full Set" row's id is the comboId shared by its two part records —
  // delete both together.
  const handleDelete = (id: string) => setSales((prev) => prev.filter((s) => s.id !== id && s.comboId !== id));

  const totalRevenue = sales.reduce((s, x) => s + x.totalValue, 0);
  const totalQty = displaySales.reduce((s, x) => s + x.quantityDozen, 0);

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
            <form onSubmit={handleSubmit} className="space-y-2">
              {/* Line 1: customer, date, price — compact, three across */}
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="c" className="text-xs">Customer</Label>
                  <Input id="c" value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="e.g. Karim" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="d" className="text-xs">Date</Label>
                  <Input id="d" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-2" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="p" className="text-xs">Price/dz</Label>
                  <Input id="p" type="number" step="0.01" min="0" value={pricePerDozen} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
                </div>
              </div>
              {/* Line 2: product type, quantity, total bill — three across */}
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Product</Label>
                  <Select value={productType} onValueChange={setProductType}>
                    <SelectTrigger>
                      <span className="flex items-center gap-2 min-w-0">
                        {productType && <img src={productTypeImage(productType)} alt="" className="h-5 w-5 object-contain shrink-0" />}
                        <SelectValue placeholder="Type" />
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      <ProductTypeSelectItems types={productTypes} includeCombo />
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="q" className="text-xs">Qty (dz)</Label>
                  <Input id="q" type="number" step="0.01" min="0" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="t" className="text-xs">Total bill</Label>
                  <Input id="t" readOnly value={money(totalPreview)} className="bg-muted/30 font-semibold px-2" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Receipt / Cash Memo (optional)</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleReceiptPick}
                />
                {receiptImage ? (
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => setViewReceipt(receiptImage)}
                      className="block border rounded-md overflow-hidden shrink-0"
                    >
                      <img
                        src={receiptImage}
                        alt="Receipt preview"
                        className="h-24 w-24 object-cover"
                      />
                    </button>
                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={scanning}
                      >
                        <Camera className="h-4 w-4 mr-1" /> Retake
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setReceiptImage(undefined)}
                      >
                        <X className="h-4 w-4 mr-1" /> Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={scanning}
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    {scanning ? "Processing..." : "Scan receipt with camera"}
                  </Button>
                )}
              </div>

              {error && <p className="text-sm text-destructive col-span-2">{error}</p>}

              <Button type="submit" size="lg" className="col-span-2 h-12 text-base font-semibold">
                <Plus className="h-5 w-5 mr-1" /> Save Sale
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border shadow-md">
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div>
              <CardTitle>Recent Sales</CardTitle>
              <CardDescription>{displaySales.length} sales recorded</CardDescription>
            </div>
            <ManageEntriesDialog
              title="Manage sales"
              description="Edit or delete saved sales entries."
              entries={displaySales}
              onDelete={handleDelete}
              editFields={[
                { key: "date", label: "Date", type: "date" },
                { key: "customerName", label: "Customer name", type: "text" },
                { key: "quantityDozen", label: "Quantity (dz)", type: "number" },
                { key: "pricePerDozen", label: "Price / dozen", type: "number" },
              ]}
              onSave={(id, patch) =>
                setSales((prev) => {
                  // A "Full Set" row's id is the comboId shared by its two
                  // part records: apply date/customer/qty to both and split
                  // the (full-set) price by each part's existing share.
                  const parts = prev.filter((s) => s.comboId === id);
                  if (parts.length > 0) {
                    const oldSum = parts.reduce((t, x) => t + (x.totalValue || 0), 0);
                    const oldQty = Number(parts[0].quantityDozen) || 0;
                    const q2 = Number(patch.quantityDozen ?? oldQty) || 0;
                    const setPrice = patch.pricePerDozen != null
                      ? Number(patch.pricePerDozen) || 0
                      : oldQty > 0 ? oldSum / oldQty : 0;
                    return prev.map((s) => {
                      if (s.comboId !== id) return s;
                      const share = oldSum > 0 ? (s.totalValue || 0) / oldSum : 1 / parts.length;
                      const partTotal = q2 * setPrice * share;
                      return {
                        ...s,
                        ...patch,
                        id: s.id,
                        productType: s.productType,
                        quantityDozen: q2,
                        pricePerDozen: q2 > 0 ? partTotal / q2 : 0,
                        totalValue: partTotal,
                      };
                    });
                  }
                  return prev.map((s) => {
                    if (s.id !== id) return s;
                    const merged = { ...s, ...patch };
                    return {
                      ...merged,
                      totalValue:
                        Number(merged.quantityDozen) * Number(merged.pricePerDozen),
                    };
                  });
                })
              }
              columns={[
                { header: "Date", render: (s) => formatDateLabel(s.date || s.createdAt.slice(0, 10)) },
                { header: "Customer", render: (s) => s.customerName },
                { header: "Type", render: (s) => labelById[s.productType] || s.productType },
                { header: "Qty", render: (s) => `${fmt(s.quantityDozen)} dz`, className: "text-right" },
                { header: "Total", render: (s) => money(s.totalValue), className: "text-right" },
                {
                  header: "Receipt",
                  render: (s) =>
                    s.receiptImage ? (
                      <button
                        type="button"
                        onClick={() => setViewReceipt(s.receiptImage!)}
                        className="border rounded overflow-hidden block"
                      >
                        <img
                          src={s.receiptImage}
                          alt="Receipt"
                          className="h-10 w-10 object-cover"
                        />
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    ),
                },
              ]}
            />
          </CardHeader>
          <CardContent>
            {sales.length === 0 ? (
              <EmptyState
                icon={ShoppingCart}
                title="No sales yet"
                description="Log your first sale to start tracking revenue and customer history."
              />
            ) : (
              <div className="overflow-x-auto space-y-3">
                <ListFilter state={filter} onChange={setFilter} searchPlaceholder="Search customer or product..." />
                {filteredSales.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No sales match your filter.</p>
                ) : (<>
                <div className="max-h-32 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="text-left text-muted-foreground border-b sticky top-0 bg-card z-10">
                    <tr>
                      <th className="py-1.5 pr-3 font-medium">Date</th>
                      <th className="py-1.5 pr-3 font-medium">Customer</th>
                      <th className="py-1.5 pr-3 font-medium">Type</th>
                      <th className="py-1.5 pr-3 text-right font-medium">Qty</th>
                      <th className="py-1.5 pr-3 text-right font-medium">Price</th>
                      <th className="py-1.5 pr-3 text-right font-medium">Total</th>
                      <th className="py-1.5 pr-0 font-medium">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.map((s) => (
                      <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="py-1 pr-3 whitespace-nowrap">{formatDateLabel(s.date || s.createdAt.slice(0, 10))}</td>
                        <td className="py-1 pr-3 truncate max-w-[120px]">{s.customerName}</td>
                        <td className="py-1 pr-3 max-w-[100px]">
                          <span className="flex items-center gap-1.5 min-w-0">
                            <img src={productTypeImage(s.productType)} alt="" className="h-4 w-4 object-contain shrink-0" />
                            <span className="truncate">{labelById[s.productType] || s.productType}</span>
                          </span>
                        </td>
                        <td className="py-1 pr-3 text-right whitespace-nowrap">{fmt(s.quantityDozen)}</td>
                        <td className="py-1 pr-3 text-right whitespace-nowrap">{money(s.pricePerDozen)}</td>
                        <td className="py-1 pr-3 text-right font-semibold whitespace-nowrap">{money(s.totalValue)}</td>
                        <td className="py-1 pr-0">
                          {s.receiptImage ? (
                            <button
                              type="button"
                              onClick={() => setViewReceipt(s.receiptImage!)}
                              className="border rounded overflow-hidden block"
                            >
                              <img src={s.receiptImage} alt="Receipt" className="h-6 w-6 object-cover" />
                            </button>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
                </>)}
              </div>
            )}
            <Separator className="my-4" />
            <div className="grid grid-cols-2 gap-4 text-sm font-semibold">
              <div className="flex justify-between"><span>Total quantity</span><span>{fmt(totalQty)} dz</span></div>
              <div className="flex justify-between"><span>Total revenue</span><span>{money(totalRevenue)}</span></div>
            </div>
          </CardContent>
        </Card>

        <Dialog open={viewReceipt !== null} onOpenChange={(o) => !o && setViewReceipt(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Receipt</DialogTitle>
            </DialogHeader>
            {viewReceipt ? (
              <img src={viewReceipt} alt="Receipt full size" className="w-full h-auto rounded" />
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
