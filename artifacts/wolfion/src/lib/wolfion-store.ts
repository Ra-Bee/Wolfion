import { useEffect, useState } from "react";
import { useCloudStored } from "@/lib/cloud-store";

export type ProductType = string;
export type ProductTypeOption = { id: string; label: string };

export type ProductionEntry = {
  id: string;
  date: string;
  productType: ProductType;
  quantityDozen: number;
  sourceDailyId?: string;
};

export type SaleEntry = {
  id: string;
  customerName: string;
  productType: ProductType;
  quantityDozen: number;
  pricePerDozen: number;
  totalValue: number;
  createdAt: string;
  date?: string;
  receiptImage?: string;
};

export type DailyProductionEntry = {
  id: string;
  date: string;
  totalProductionDozen: number;
  yarnUsedKg: number;
  machineHours: number;
  yarnCostPerKg: number;
  laborCost: number;
  packagingCost: number;
  ironCost: number;
  staffBill?: number;
  totalCost: number;
  costPerDozen: number;
  productType?: ProductType;
  createdAt: string;
  receiptImage?: string;
};

export type ElectricityEntry = {
  id: string;
  month: string;
  totalBill: number;
  createdAt: string;
};

export type Worker = {
  id: string;
  name: string;
  payType: "daily" | "per_unit";
  rate: number;
  createdAt: string;
};

export type WorkLog = {
  id: string;
  workerId: string;
  date: string;
  amount: number;
  createdAt: string;
};

export type WorkerPayment = {
  id: string;
  workerId: string;
  date: string;
  amount: number;
  createdAt: string;
  receiptImage?: string;
};

export type YarnPurchase = { id: string; date: string; kg: number; createdAt: string; receiptImage?: string };

export type Investment = {
  id: string;
  date: string;
  type: string;
  description: string;
  amount: number;
  source: string;
  createdAt: string;
  receiptImage?: string;
};

export type InvestorEntry = {
  id: string;
  name: string;
  date: string;
  amount: number;
  createdAt: string;
  receiptImage?: string;
};

export type Debt = {
  id: string;
  date: string;
  personName: string;
  amount: number;
  description?: string;
  createdAt: string;
  receiptImage?: string;
};

export type DebtPayment = {
  id: string;
  debtId: string;
  date: string;
  amount: number;
  createdAt: string;
  receiptImage?: string;
};
export type YarnPerDozen = Record<string, number>;
export type YarnUsageEntry = {
  id: string;
  productType: ProductType;
  kgUsed: number;
  createdAt: string;
  sourceDailyId?: string;
};

export const STORAGE_KEYS = {
  productTypes: "wolfion_product_types",
  production: "wolfion_production_entries",
  sales: "wolfion_sales_entries",
  yarnStock: "wolfion_yarn_stock_kg",
  yarnUsage: "wolfion_yarn_usage_entries",
  daily: "wolfion_daily_production_entries",
  electricity: "wolfion_monthly_electricity",
  workers: "wolfion_workers",
  workLogs: "wolfion_worker_logs",
  workerPayments: "wolfion_worker_payments",
  yarnPurchases: "wolfion_yarn_purchases",
  yarnPerDozen: "wolfion_yarn_per_dozen",
  investments: "wolfion_investments",
  investors: "wolfion_investors",
  debts: "wolfion_debts",
  debtPayments: "wolfion_debt_payments",
  costInputs: "wolfion_cost_inputs",
  costHistory: "wolfion_cost_history",
} as const;

export type CostHistoryEntry = {
  id: string;
  date: string;
  item: string;
  amount: number;
  note?: string;
  createdAt: string;
  receiptImage?: string;
};

export const defaultProductTypes: ProductTypeOption[] = [
  { id: "short-socks", label: "Short socks" },
  { id: "ankle-socks", label: "Ankle socks" },
  { id: "kids-socks", label: "Kids socks" },
  { id: "mixed", label: "Mixed" },
  { id: "others", label: "Others" },
];

export const initialInventory: Record<string, number> = {
  "short-socks": 320,
  "ankle-socks": 260,
  "kids-socks": 140,
  "mixed": 0,
  "others": 0,
};

export const defaultYarnPerDozen: YarnPerDozen = {
  "short-socks": 0.5,
  "ankle-socks": 0.6,
  "kids-socks": 0.4,
  "others": 0.55,
};

export function getToday() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDateLabel(isoDate: string) {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    if (v == null) return fallback;
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
}

const SAME_TAB_EVENT = "wolfion:storage";

function notifySameTab(key: string) {
  try {
    window.dispatchEvent(new CustomEvent(SAME_TAB_EVENT, { detail: { key } }));
  } catch { /* ignore */ }
}

// Storage keys that mirror to Firebase Realtime Database for cross-device
// admin sync. As of Phase 2 this covers ALL admin datasets — every
// key in STORAGE_KEYS below. Every key here is consumed only by admin
// pages; customer pages don't read these keys, so no extra read-access
// is granted to non-admins (RTDB rules still require admin claim).
const CLOUD_SYNCED_KEYS: ReadonlySet<string> = new Set<string>([
  STORAGE_KEYS.productTypes,
  STORAGE_KEYS.production,
  STORAGE_KEYS.sales,
  STORAGE_KEYS.yarnStock,
  STORAGE_KEYS.yarnUsage,
  STORAGE_KEYS.daily,
  STORAGE_KEYS.electricity,
  STORAGE_KEYS.workers,
  STORAGE_KEYS.workLogs,
  STORAGE_KEYS.workerPayments,
  STORAGE_KEYS.yarnPurchases,
  STORAGE_KEYS.yarnPerDozen,
  STORAGE_KEYS.investments,
  STORAGE_KEYS.investors,
  STORAGE_KEYS.debts,
  STORAGE_KEYS.debtPayments,
  STORAGE_KEYS.costInputs,
  STORAGE_KEYS.costHistory,
]);

export function useStored<T>(key: string, fallback: T) {
  // NOTE on the conditional hook below: React forbids hooks whose
  // identity changes across renders for the SAME component instance.
  // Every call site passes a string literal from STORAGE_KEYS, so the
  // branch chosen is constant for the lifetime of that call site --
  // satisfies the underlying invariant the rule protects.
  if (CLOUD_SYNCED_KEYS.has(key)) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useCloudStored<T>(key, fallback);
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useLocalStored<T>(key, fallback);
}

function useLocalStored<T>(key: string, fallback: T) {
  const [value, setValueState] = useState<T>(() => readJSON<T>(key, fallback));

  const setValue: typeof setValueState = (next) => {
    setValueState((prev) => {
      const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      try { localStorage.setItem(key, JSON.stringify(resolved)); } catch { /* ignore */ }
      notifySameTab(key);
      return resolved;
    });
  };

  useEffect(() => {
    const refresh = () => setValueState(readJSON<T>(key, fallback));
    const onStorage = (e: StorageEvent) => { if (e.key === key) refresh(); };
    const onSameTab = (e: Event) => {
      const detail = (e as CustomEvent).detail as { key?: string } | undefined;
      if (detail?.key === key) refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(SAME_TAB_EVENT, onSameTab);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(SAME_TAB_EVENT, onSameTab);
    };
  }, [key, fallback]);

  return [value, setValue] as const;
}

export function useStoredNumber(key: string, fallback: number) {
  // Route cloud-synced number keys (e.g. yarnStockKg) through the
  // same cloud-store hook used for arrays/objects. Same stable-branch
  // safety argument as useStored — call sites always pass a constant
  // STORAGE_KEYS literal.
  if (CLOUD_SYNCED_KEYS.has(key)) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useCloudStored<number>(key, fallback);
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useLocalStoredNumber(key, fallback);
}

function useLocalStoredNumber(key: string, fallback: number) {
  const readNum = (): number => {
    try {
      const v = localStorage.getItem(key);
      if (v == null) return fallback;
      const n = Number(v);
      return Number.isFinite(n) ? n : fallback;
    } catch { return fallback; }
  };
  const [value, setValueState] = useState<number>(readNum);

  const setValue: typeof setValueState = (next) => {
    setValueState((prev) => {
      const resolved = typeof next === "function" ? (next as (p: number) => number)(prev) : next;
      try { localStorage.setItem(key, String(resolved)); } catch { /* ignore */ }
      notifySameTab(key);
      return resolved;
    });
  };

  useEffect(() => {
    const refresh = () => setValueState(readNum());
    const onStorage = (e: StorageEvent) => { if (e.key === key) refresh(); };
    const onSameTab = (e: Event) => {
      const detail = (e as CustomEvent).detail as { key?: string } | undefined;
      if (detail?.key === key) refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(SAME_TAB_EVENT, onSameTab);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(SAME_TAB_EVENT, onSameTab);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, fallback]);

  return [value, setValue] as const;
}

export function inDateRange(date: string, start: string, end: string) {
  if (!date) return false;
  return date >= start && date <= end;
}

export function clearAdminStorage() {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    localStorage.removeItem("wolfion:savedPayments");
  } catch { /* ignore */ }
}
