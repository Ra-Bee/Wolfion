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

export type UltionReportData = {
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
  return `$${(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}
function fmtNum(n: number): string {
  return (n || 0).toLocaleString();
}

function inRange(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}

function monthsInRange(start: string, end: string): string[] {
  const result: string[] = [];
  const s = new Date(`${start}T00:00:00`);
  const e = new Date(`${end}T00:00:00`);
  const cur = new Date(s.getFullYear(), s.getMonth(), 1);
  while (cur <= e) {
    result.push(`${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}`);
    cur.setMonth(cur.getMonth() + 1);
  }
  return result;
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

function drawPageHeader(doc: jsPDF, range: ReportRange) {
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
  doc.text("Ultion Inventory Report", logoX + logoSize + 6, logoY + 9);

  // Subtitle: range label + date span
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(range.label, logoX + logoSize + 6, logoY + 15);
  doc.text(`${range.startDate} → ${range.endDate}`, logoX + logoSize + 6, logoY + 20);

  // Generated timestamp on the right
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 14, logoY + 20, { align: "right" });

  // Accent rule
  doc.setDrawColor(...PRIMARY);
  doc.setLineWidth(0.8);
  doc.line(14, HEADER_HEIGHT - 4, pageWidth - 14, HEADER_HEIGHT - 4);
  doc.setLineWidth(0.2);
}

export function generateUltionReport(data: UltionReportData): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header is drawn once per page in the final pass below.
  let y = HEADER_HEIGHT + 4;

  // ====== Filter to range ======
  const production = data.production.filter((e) => inRange(e.date, data.range.startDate, data.range.endDate));
  const sales = data.sales.filter((e) => inRange(e.date, data.range.startDate, data.range.endDate));
  const daily = data.daily.filter((e) => inRange(e.date, data.range.startDate, data.range.endDate));
  const months = monthsInRange(data.range.startDate, data.range.endDate);
  const electricity = data.electricity.filter((e) => months.includes(e.month));
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
  const totalElectricityCost = electricity.reduce((s, e) => s + e.totalBill, 0);
  const totalCost = totalYarnCost + totalLaborCost + totalPackagingCost + totalIronCost + totalElectricityCost;
  const profit = totalSalesValue - totalCost;

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
      ["Total cost", fmtMoney(totalCost)],
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
        e.date,
        data.productTypeLabels[e.productType] || e.productType,
        fmtNum(e.quantityDozen),
      ]),
      foot: [["Total", "", fmtNum(production.reduce((s, e) => s + e.quantityDozen, 0))]],
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
        e.date,
        e.customerName,
        data.productTypeLabels[e.productType] || e.productType,
        fmtNum(e.quantityDozen),
        fmtMoney(e.totalValue),
      ]),
      foot: [["Total", "", "", fmtNum(totalSalesDozen), fmtMoney(totalSalesValue)]],
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
      ["Labor", fmtMoney(totalLaborCost)],
      ["Packaging", fmtMoney(totalPackagingCost)],
      ["Iron / finishing", fmtMoney(totalIronCost)],
      ["Electricity", fmtMoney(totalElectricityCost)],
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
      `Ultion · Page ${i} of ${pages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: "center" },
    );
  }

  return doc;
}

export function downloadReport(data: UltionReportData, filename?: string) {
  const doc = generateUltionReport(data);
  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(filename || `Ultion_Report_${stamp}.pdf`);
}
