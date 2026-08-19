export type SavedPaymentKind = "card" | "bkash" | "nagad" | "rocket" | "paypal" | "unionpay";

export type SavedPayment = {
  id: string;
  kind: SavedPaymentKind;
  label: string;
  detail: string;
  isDefault?: boolean;
  createdAt: number;
};

const KEY = "wolfion:savedPayments";

export function loadSavedPayments(): SavedPayment[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedPayment[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function persistSavedPayments(items: SavedPayment[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("wolfion:savedPayments:changed"));
  } catch {}
}

export function maskCard(num: string): string {
  const clean = num.replace(/\D/g, "");
  if (clean.length < 4) return "•••• ????";
  return `•••• ${clean.slice(-4)}`;
}

export function maskPhone(num: string): string {
  const clean = num.replace(/\D/g, "");
  if (clean.length < 4) return "•••• ????";
  return `${clean.slice(0, 3)}-•••-${clean.slice(-4)}`;
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, 2);
  return `${visible}${"•".repeat(Math.max(2, local.length - 2))}@${domain}`;
}
