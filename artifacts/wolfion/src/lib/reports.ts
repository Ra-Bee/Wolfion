import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import wolfionLogoDataUrl from "@assets/Image_20260421042552_60_2_1776716788241.jpg?inline";

export type ReportProductionEntry = {
  date: string;
  productType: string;
  quantityDozen: number;
};

export type ReportSaleEntry = {
  date: string;
  customerName: string;
  productType: string;
  quantityDozen: number;
  totalValue: number;
  /** Production cost of just this sale's dozens (yarn at sale date + fixed/dozen). */
  costOfGoods: number;
};

export type ReportDailyEntry = {
  date: string;
  totalProductionDozen: number;
  yarnUsedKg: number;
  yarnCostPerKg: number;
  laborCost: number;
  packagingCost: number;
  ironCost: number;
  totalCost: number;
};

export type ReportElectricityEntry = {
  month: string;
  totalBill: number;
};

export type ReportInventoryItem = {
  productType: string;
  stockDozen: number;
};

export type ReportLaborItem = {
  name: string;
  totalEarned: number;
  totalPaid: number;
  remaining: number;
};

export type ReportPaymentItem = {
  workerName: string;
  date: string;
  amount: number;
};

export type ReportRange = {
  label: string;
  startDate: string;
  endDate: string;
};

export type WolfionReportData = {
  range: ReportRange;
  productTypeLabels: Record<string, string>;
  production: ReportProductionEntry[];
  sales: ReportSaleEntry[];
  daily: ReportDailyEntry[];
  electricity: ReportElectricityEntry[];
  inventory: ReportInventoryItem[];
  labor?: ReportLaborItem[];
  payments?: ReportPaymentItem[];
};

const PRIMARY: [number, number, number] = [255, 102, 0];
const TEXT: [number, number, number] = [30, 30, 30];
const MUTED: [number, number, number] = [120, 120, 120];

function fmtMoney(n: number): string {
  return `Tk ${(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}
function fmtNum(n: number): string {
  return (n || 0).toLocaleString();
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** "2026-07-05" -> "5 July 2026" (day, month name, year). */
function fmtDateLong(iso: string): string {
  const [y, m, d] = (iso || "").split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTH_NAMES[m - 1]} ${y}`;
}

/** "2026-07-05" -> "05/07/2026 Sunday" (numeric date + weekday). */
function fmtDateHistory(iso: string): string {
  const [y, m, d] = (iso || "").split("-").map(Number);
  if (!y || !m || !d) return iso;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y} ${DAY_NAMES[dt.getUTCDay()]}`;
}

/** Header date span. Shows "All time" for the all-time sentinel range. */
function fmtRangeSpan(range: ReportRange): string {
  if (range.startDate === "0000-01-01") return "All time";
  if (range.startDate === range.endDate) return fmtDateLong(range.startDate);
  return `${fmtDateLong(range.startDate)} to ${fmtDateLong(range.endDate)}`;
}

function inRange(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}

function sectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFillColor(...PRIMARY);
  doc.rect(14, y, 4, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...TEXT);
  doc.text(title, 22, y + 5.5);
  return y + 11;
}

const HEADER_HEIGHT = 38;

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + needed > pageHeight - 18) {
    doc.addPage();
    return HEADER_HEIGHT;
  }
  return y;
}

function drawPageHeader(doc: jsPDF, range: ReportRange, title = "Wolfion Inventory Report") {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Clear header background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, HEADER_HEIGHT - 4, "F");

  // Logo (top-left, square, proportional)
  const logoSize = 22;
  const logoX = 14;
  const logoY = 6;
  try {
    doc.addImage(wolfionLogoDataUrl as string, "JPEG", logoX, logoY, logoSize, logoSize, undefined, "FAST");
  } catch {
    // ignore if image fails to render in this jsPDF instance
  }

  // Title beside logo
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...TEXT);
  doc.text(title, logoX + logoSize + 6, logoY + 9);

  // Subtitle: range label + date span
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(range.label, logoX + logoSize + 6, logoY + 15);
  doc.text(fmtRangeSpan(range), logoX + logoSize + 6, logoY + 20);

  // Top-right corner — "Bapari Socks" brand mark
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...PRIMARY);
  doc.text("Bapari Socks", pageWidth - 14, logoY + 8, { align: "right" });

  // Generated timestamp under it
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 14, logoY + 20, { align: "right" });

  // Accent rule
  doc.setDrawColor(...PRIMARY);
  doc.setLineWidth(0.8);
  doc.line(14, HEADER_HEIGHT - 4, pageWidth - 14, HEADER_HEIGHT - 4);
  doc.setLineWidth(0.2);
}

export function generateWolfionReport(data: WolfionReportData): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header is drawn once per page in the final pass below.
  let y = HEADER_HEIGHT + 4;

  // ====== Filter to range ======
  const production = data.production.filter((e) => inRange(e.date, data.range.startDate, data.range.endDate));
  const sales = data.sales.filter((e) => inRange(e.date, data.range.startDate, data.range.endDate));
  const daily = data.daily.filter((e) => inRange(e.date, data.range.startDate, data.range.endDate));
  const payments = (data.payments || []).filter((p) => inRange(p.date, data.range.startDate, data.range.endDate));

  // ====== Profit Summary (top) ======
  const totalProductionDozen = production.reduce((s, e) => s + e.quantityDozen, 0)
    || daily.reduce((s, e) => s + e.totalProductionDozen, 0);
  const totalSalesValue = sales.reduce((s, e) => s + e.totalValue, 0);
  const totalSalesDozen = sales.reduce((s, e) => s + e.quantityDozen, 0);
  const totalYarnCost = daily.reduce((s, e) => s + e.yarnUsedKg * e.yarnCostPerKg, 0);
  const totalLaborCost = daily.reduce((s, e) => s + e.laborCost, 0);
  const totalPackagingCost = daily.reduce((s, e) => s + e.packagingCost, 0);
  const totalIronCost = daily.reduce((s, e) => s + e.ironCost, 0);
  // Single source of truth: full per-dozen loaded production cost (yarn +
  // packaging + iron + overhead). Overhead already bundles rent + electricity +
  // salary, so actual electricity bills are NOT added again (no double-count).
  const totalCost = daily.reduce((s, e) => s + e.totalCost, 0);
  // Sales-based profit: revenue − cost of only the dozens sold. Unsold stock is
  // not counted as a loss, so production cost is shown separately for context.
  // COGS is summed over the SAME range-filtered sales as everything else (each
  // sale carries its own cost), so PDF profit always matches the on-screen range.
  const costOfGoodsSold = sales.reduce((s, e) => s + (e.costOfGoods || 0), 0);
  const profit = totalSalesValue - costOfGoodsSold;

  y = sectionTitle(doc, "Profit Summary", y);
  autoTable(doc, {
    startY: y,
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 3, textColor: TEXT },
    headStyles: { fillColor: PRIMARY, textColor: 255, fontStyle: "bold" },
    head: [["Metric", "Value"]],
    body: [
      ["Total production (dozen)", fmtNum(totalProductionDozen)],
      ["Total sold (dozen)", fmtNum(totalSalesDozen)],
      ["Total sales", fmtMoney(totalSalesValue)],
      ["Cost of goods sold", fmtMoney(costOfGoodsSold)],
      ["Total production cost", fmtMoney(totalCost)],
      [{ content: profit >= 0 ? "Profit" : "Loss", styles: { fontStyle: "bold" } },
       { content: fmtMoney(Math.abs(profit)), styles: { fontStyle: "bold", textColor: profit >= 0 ? [22, 130, 50] : [200, 40, 40] } }],
    ],
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // ====== Production Data ======
  y = ensureSpace(doc, y, 30);
  y = sectionTitle(doc, "Production Data", y);
  if (production.length === 0) {
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text("No production records in this period.", 14, y);
    y += 8;
  } else {
    autoTable(doc, {
      startY: y,
      theme: "striped",
      styles: { fontSize: 9, cellPadding: 2.5, textColor: TEXT },
      headStyles: { fillColor: PRIMARY, textColor: 255 },
      head: [["Date", "Product type", "Quantity (dz)"]],
      body: production.map((e) => [
        fmtDateHistory(e.date),
        data.productTypeLabels[e.productType] || e.productType,
        `${fmtNum(e.quantityDozen)} dz`,
      ]),
      foot: [["Total", "", `${fmtNum(production.reduce((s, e) => s + e.quantityDozen, 0))} dz`]],
      footStyles: { fillColor: [240, 240, 240], textColor: TEXT, fontStyle: "bold" },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // ====== Sales Data ======
  y = ensureSpace(doc, y, 30);
  y = sectionTitle(doc, "Sales Data", y);
  if (sales.length === 0) {
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text("No sales records in this period.", 14, y);
    y += 8;
  } else {
    autoTable(doc, {
      startY: y,
      theme: "striped",
      styles: { fontSize: 9, cellPadding: 2.5, textColor: TEXT },
      headStyles: { fillColor: PRIMARY, textColor: 255 },
      head: [["Date", "Customer", "Product type", "Qty (dz)", "Total"]],
      body: sales.map((e) => [
        fmtDateHistory(e.date),
        e.customerName,
        data.productTypeLabels[e.productType] || e.productType,
        `${fmtNum(e.quantityDozen)} dz`,
        fmtMoney(e.totalValue),
      ]),
      foot: [["Total", "", "", `${fmtNum(totalSalesDozen)} dz`, fmtMoney(totalSalesValue)]],
      footStyles: { fillColor: [240, 240, 240], textColor: TEXT, fontStyle: "bold" },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // ====== Cost Data ======
  y = ensureSpace(doc, y, 30);
  y = sectionTitle(doc, "Cost Breakdown", y);
  autoTable(doc, {
    startY: y,
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 3, textColor: TEXT },
    headStyles: { fillColor: PRIMARY, textColor: 255 },
    head: [["Cost", "Amount"]],
    body: [
      ["Yarn", fmtMoney(totalYarnCost)],
      ["Labor & overhead (incl. rent, electricity)", fmtMoney(totalLaborCost)],
      ["Packaging", fmtMoney(totalPackagingCost)],
      ["Iron / finishing", fmtMoney(totalIronCost)],
    ],
    foot: [["Total cost", fmtMoney(totalCost)]],
    footStyles: { fillColor: [240, 240, 240], textColor: TEXT, fontStyle: "bold" },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // ====== Inventory Summary ======
  y = ensureSpace(doc, y, 30);
  y = sectionTitle(doc, "Inventory Summary (current)", y);
  if (data.inventory.length === 0) {
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text("No inventory data.", 14, y);
    y += 8;
  } else {
    autoTable(doc, {
      startY: y,
      theme: "striped",
      styles: { fontSize: 10, cellPadding: 3, textColor: TEXT },
      headStyles: { fillColor: PRIMARY, textColor: 255 },
      head: [["Product type", "Stock (dz)"]],
      body: data.inventory.map((i) => [
        data.productTypeLabels[i.productType] || i.productType,
        fmtNum(i.stockDozen),
      ]),
      foot: [["Total", fmtNum(data.inventory.reduce((s, i) => s + i.stockDozen, 0))]],
      footStyles: { fillColor: [240, 240, 240], textColor: TEXT, fontStyle: "bold" },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // ====== Labor (optional) ======
  if (data.labor && data.labor.length > 0) {
    y = ensureSpace(doc, y, 30);
    y = sectionTitle(doc, "Labor Payroll", y);
    autoTable(doc, {
      startY: y,
      theme: "striped",
      styles: { fontSize: 9, cellPadding: 2.5, textColor: TEXT },
      headStyles: { fillColor: PRIMARY, textColor: 255 },
      head: [["Worker", "Earned", "Paid", "Remaining"]],
      body: data.labor.map((w) => [
        w.name,
        fmtMoney(w.totalEarned),
        fmtMoney(w.totalPaid),
        fmtMoney(w.remaining),
      ]),
      foot: [[
        "Total",
        fmtMoney(data.labor.reduce((s, w) => s + w.totalEarned, 0)),
        fmtMoney(data.labor.reduce((s, w) => s + w.totalPaid, 0)),
        fmtMoney(data.labor.reduce((s, w) => s + w.remaining, 0)),
      ]],
      footStyles: { fillColor: [240, 240, 240], textColor: TEXT, fontStyle: "bold" },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 6;

    if (payments.length > 0) {
      y = ensureSpace(doc, y, 30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...TEXT);
      doc.text("Payment history (in period)", 14, y);
      y += 4;
      autoTable(doc, {
        startY: y,
        theme: "striped",
        styles: { fontSize: 9, cellPadding: 2.5, textColor: TEXT },
        headStyles: { fillColor: PRIMARY, textColor: 255 },
        head: [["Date", "Worker", "Amount"]],
        body: payments.map((p) => [p.date, p.workerName, fmtMoney(p.amount)]),
        margin: { left: 14, right: 14 },
      });
      y = (doc as any).lastAutoTable.finalY + 8;
    }
  }

  // ====== Header + footer (every page) ======
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    drawPageHeader(doc, data.range);
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(
      `Wolfion · Page ${i} of ${pages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: "center" },
    );
  }

  return doc;
}

export function downloadReport(data: WolfionReportData, filename?: string) {
  const doc = generateWolfionReport(data);
  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(filename || `Wolfion_Report_${stamp}.pdf`);
}

// ============================================================================
// Single-item detailed report
// ============================================================================

export type ItemReportContent = "production" | "sales" | "all";

export type WolfionItemReportData = {
  range: ReportRange;
  productType: string;
  productLabel: string;
  content: ItemReportContent;
  /** Current live stock (dozen) for this item, across all time. */
  currentStockDozen: number;
  /** Production rows for this item, already filtered to the range. */
  production: ReportProductionEntry[];
  /** Sale rows for this item, already filtered to the range. */
  sales: ReportSaleEntry[];
};

export function generateItemReport(data: WolfionItemReportData): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = HEADER_HEIGHT + 4;

  const showProd = data.content === "production" || data.content === "all";
  const showSales = data.content === "sales" || data.content === "all";

  const producedDz = data.production.reduce((s, e) => s + e.quantityDozen, 0);
  const soldDz = data.sales.reduce((s, e) => s + e.quantityDozen, 0);
  const salesValue = data.sales.reduce((s, e) => s + e.totalValue, 0);
  const cogs = data.sales.reduce((s, e) => s + (e.costOfGoods || 0), 0);
  const profit = salesValue - cogs;

  // ====== Item Summary ======
  y = sectionTitle(doc, `${data.productLabel} — Summary`, y);
  const summaryBody: (string | { content: string; styles: Record<string, unknown> })[][] = [
    ["Produced in period (dozen)", fmtNum(producedDz)],
    ["Sold in period (dozen)", fmtNum(soldDz)],
    ["Current stock (dozen)", fmtNum(data.currentStockDozen)],
  ];
  if (showSales) {
    summaryBody.push(
      ["Sales revenue", fmtMoney(salesValue)],
      ["Cost of goods sold", fmtMoney(cogs)],
      [
        { content: profit >= 0 ? "Profit" : "Loss", styles: { fontStyle: "bold" } },
        { content: fmtMoney(Math.abs(profit)), styles: { fontStyle: "bold", textColor: profit >= 0 ? [22, 130, 50] : [200, 40, 40] } },
      ],
    );
  }
  autoTable(doc, {
    startY: y,
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 3, textColor: TEXT },
    headStyles: { fillColor: PRIMARY, textColor: 255, fontStyle: "bold" },
    head: [["Metric", "Value"]],
    body: summaryBody as any,
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // ====== Production History ======
  if (showProd) {
    y = ensureSpace(doc, y, 30);
    y = sectionTitle(doc, "Production History", y);
    if (data.production.length === 0) {
      doc.setFontSize(9);
      doc.setTextColor(...MUTED);
      doc.text("No production records in this period.", 14, y);
      y += 8;
    } else {
      autoTable(doc, {
        startY: y,
        theme: "striped",
        styles: { fontSize: 9, cellPadding: 2.5, textColor: TEXT },
        headStyles: { fillColor: PRIMARY, textColor: 255 },
        head: [["Date", "Quantity (dz)"]],
        body: [...data.production]
          .sort((a, b) => a.date.localeCompare(b.date))
          .map((e) => [fmtDateHistory(e.date), `${fmtNum(e.quantityDozen)} dz`]),
        foot: [["Total", `${fmtNum(producedDz)} dz`]],
        footStyles: { fillColor: [240, 240, 240], textColor: TEXT, fontStyle: "bold" },
        margin: { left: 14, right: 14 },
      });
      y = (doc as any).lastAutoTable.finalY + 8;
    }
  }

  // ====== Sales History ======
  if (showSales) {
    y = ensureSpace(doc, y, 30);
    y = sectionTitle(doc, "Sales History", y);
    if (data.sales.length === 0) {
      doc.setFontSize(9);
      doc.setTextColor(...MUTED);
      doc.text("No sales records in this period.", 14, y);
      y += 8;
    } else {
      autoTable(doc, {
        startY: y,
        theme: "striped",
        styles: { fontSize: 9, cellPadding: 2.5, textColor: TEXT },
        headStyles: { fillColor: PRIMARY, textColor: 255 },
        head: [["Date", "Customer", "Qty (dz)", "Total"]],
        body: [...data.sales]
          .sort((a, b) => a.date.localeCompare(b.date))
          .map((e) => [fmtDateHistory(e.date), e.customerName, `${fmtNum(e.quantityDozen)} dz`, fmtMoney(e.totalValue)]),
        foot: [["Total", "", `${fmtNum(soldDz)} dz`, fmtMoney(salesValue)]],
        footStyles: { fillColor: [240, 240, 240], textColor: TEXT, fontStyle: "bold" },
        margin: { left: 14, right: 14 },
      });
      y = (doc as any).lastAutoTable.finalY + 8;
    }
  }

  // ====== Header + footer (every page) ======
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    drawPageHeader(doc, data.range, `Wolfion — ${data.productLabel}`);
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(
      `Wolfion · Page ${i} of ${pages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: "center" },
    );
  }

  return doc;
}

export function downloadItemReport(data: WolfionItemReportData, filename?: string) {
  const doc = generateItemReport(data);
  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(filename || `Wolfion_Item_${stamp}.pdf`);
}

// ============================================================================
// All-products totals report (no detailed entries)
// ============================================================================

export type AllProductsRow = {
  productType: string;
  label: string;
  producedDz: number;
  soldDz: number;
  currentStockDozen: number;
  salesValue: number;
  cogs: number;
};

export type WolfionAllProductsReportData = {
  range: ReportRange;
  content: ItemReportContent;
  rows: AllProductsRow[];
};

export function generateAllProductsReport(data: WolfionAllProductsReportData): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = HEADER_HEIGHT + 4;

  const showProd = data.content === "production" || data.content === "all";
  const showSales = data.content === "sales" || data.content === "all";

  const totProduced = data.rows.reduce((s, r) => s + r.producedDz, 0);
  const totSold = data.rows.reduce((s, r) => s + r.soldDz, 0);
  const totStock = data.rows.reduce((s, r) => s + r.currentStockDozen, 0);
  const totRevenue = data.rows.reduce((s, r) => s + r.salesValue, 0);
  const totCogs = data.rows.reduce((s, r) => s + r.cogs, 0);
  const totProfit = totRevenue - totCogs;

  // ====== Overall Summary ======
  y = sectionTitle(doc, "All Products — Summary", y);
  const summaryBody: (string | { content: string; styles: Record<string, unknown> })[][] = [
    ["Total produced in period (dozen)", `${fmtNum(totProduced)} dz`],
    ["Total sold in period (dozen)", `${fmtNum(totSold)} dz`],
    ["Total current stock (dozen)", `${fmtNum(totStock)} dz`],
  ];
  if (showSales) {
    summaryBody.push(
      ["Total sales revenue", fmtMoney(totRevenue)],
      ["Total cost of goods sold", fmtMoney(totCogs)],
      [
        { content: totProfit >= 0 ? "Total profit" : "Total loss", styles: { fontStyle: "bold" } },
        { content: fmtMoney(Math.abs(totProfit)), styles: { fontStyle: "bold", textColor: totProfit >= 0 ? [22, 130, 50] : [200, 40, 40] } },
      ],
    );
  }
  autoTable(doc, {
    startY: y,
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 3, textColor: TEXT },
    headStyles: { fillColor: PRIMARY, textColor: 255, fontStyle: "bold" },
    head: [["Metric", "Value"]],
    body: summaryBody as any,
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // ====== Per-product totals table ======
  y = ensureSpace(doc, y, 30);
  y = sectionTitle(doc, "Per-product Totals", y);

  const head: string[] = ["Product"];
  if (showProd) head.push("Produced");
  if (showSales) head.push("Sold", "Revenue", "Profit");
  head.push("Stock");

  const body = data.rows.map((r) => {
    const row: string[] = [r.label];
    if (showProd) row.push(`${fmtNum(r.producedDz)} dz`);
    if (showSales) {
      row.push(`${fmtNum(r.soldDz)} dz`, fmtMoney(r.salesValue), fmtMoney(r.salesValue - r.cogs));
    }
    row.push(`${fmtNum(r.currentStockDozen)} dz`);
    return row;
  });

  const foot: string[] = ["Total"];
  if (showProd) foot.push(`${fmtNum(totProduced)} dz`);
  if (showSales) foot.push(`${fmtNum(totSold)} dz`, fmtMoney(totRevenue), fmtMoney(totProfit));
  foot.push(`${fmtNum(totStock)} dz`);

  autoTable(doc, {
    startY: y,
    theme: "striped",
    styles: { fontSize: 9, cellPadding: 2.5, textColor: TEXT },
    headStyles: { fillColor: PRIMARY, textColor: 255 },
    head: [head],
    body,
    foot: [foot],
    footStyles: { fillColor: [240, 240, 240], textColor: TEXT, fontStyle: "bold" },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // ====== Header + footer (every page) ======
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    drawPageHeader(doc, data.range, "Wolfion — All Products");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(
      `Wolfion · Page ${i} of ${pages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: "center" },
    );
  }

  return doc;
}

export function downloadAllProductsReport(data: WolfionAllProductsReportData, filename?: string) {
  const doc = generateAllProductsReport(data);
  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(filename || `Wolfion_AllProducts_${stamp}.pdf`);
}
