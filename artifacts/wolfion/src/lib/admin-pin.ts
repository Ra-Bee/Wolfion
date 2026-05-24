const PIN_KEY = "wolfion_admin_pin_hash";

async function hashPin(pin: string): Promise<string> {
  const enc = new TextEncoder().encode(`wolfion::${pin}`);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function hasAdminPin(): boolean {
  try {
    return Boolean(localStorage.getItem(PIN_KEY));
  } catch {
    return false;
  }
}

export async function setAdminPin(pin: string): Promise<void> {
  const h = await hashPin(pin);
  localStorage.setItem(PIN_KEY, h);
}

export async function verifyAdminPin(pin: string): Promise<boolean> {
  const stored = localStorage.getItem(PIN_KEY);
  if (!stored) return false;
  const h = await hashPin(pin);
  return h === stored;
}

export function clearAdminPin(): void {
  localStorage.removeItem(PIN_KEY);
}
