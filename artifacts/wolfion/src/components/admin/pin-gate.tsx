import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  hasAdminPin,
  setAdminPin,
  verifyAdminPin,
} from "@/lib/admin-pin";

const UNLOCK_KEY = "wolfion_pin_unlocked";

/**
 * Wraps sensitive admin content behind the existing admin PIN.
 *
 * - If no PIN exists on the device yet, prompts the admin to create one
 *   (two-field confirm) — reuses the same SHA-256 storage as the
 *   manage-entries-dialog, so a PIN created here also unlocks delete.
 * - Once verified, marks the gate unlocked in sessionStorage so the
 *   admin can navigate around without re-entering it every page load.
 *   The unlock clears automatically when the browser tab closes.
 */
export function PinGate({
  title = "Locked",
  description = "Enter your admin PIN to continue.",
  children,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
}) {
  const [unlocked, setUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(UNLOCK_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [needsSetup, setNeedsSetup] = useState(false);
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!unlocked) setNeedsSetup(!hasAdminPin());
  }, [unlocked]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!pin || pin.length < 4) {
      setError("PIN must be at least 4 digits.");
      return;
    }
    setBusy(true);
    try {
      if (needsSetup) {
        if (pin !== pinConfirm) {
          setError("PINs do not match.");
          return;
        }
        await setAdminPin(pin);
      } else {
        const ok = await verifyAdminPin(pin);
        if (!ok) {
          setError("Wrong PIN.");
          return;
        }
      }
      try {
        sessionStorage.setItem(UNLOCK_KEY, "1");
      } catch {
        // ignore
      }
      setPin("");
      setPinConfirm("");
      setUnlocked(true);
    } finally {
      setBusy(false);
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="container mx-auto px-3 sm:px-4 py-10 max-w-md">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <Lock className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">{title}</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">{description}</p>

          <form onSubmit={submit} className="space-y-3">
            <div>
              <Label htmlFor="gate-pin">
                {needsSetup ? "Create a new PIN" : "PIN"}
              </Label>
              <Input
                id="gate-pin"
                type="password"
                inputMode="numeric"
                autoComplete="off"
                autoFocus
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="••••"
                data-testid="gate-pin-input"
              />
            </div>
            {needsSetup && (
              <div>
                <Label htmlFor="gate-pin-confirm">Confirm PIN</Label>
                <Input
                  id="gate-pin-confirm"
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  value={pinConfirm}
                  onChange={(e) => {
                    setPinConfirm(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="••••"
                  data-testid="gate-pin-confirm"
                />
              </div>
            )}
            {error && (
              <p className="text-xs text-destructive" data-testid="gate-pin-error">
                {error}
              </p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={busy || !pin || (needsSetup && !pinConfirm)}
              data-testid="gate-pin-submit"
            >
              <ShieldCheck className="h-4 w-4 mr-1.5" />
              {needsSetup ? "Set PIN & unlock" : "Unlock"}
            </Button>
            {needsSetup && (
              <p className="text-[10px] text-muted-foreground">
                You don't have a PIN yet. Set one now — you'll use it to
                unlock sensitive admin actions on this device.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
