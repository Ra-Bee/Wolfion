import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Wraps sensitive admin content behind a PIN.
 *
 * Each gate has its own `pinId` so different sections (e.g. delete
 * actions, user list) can have independent PINs. The PIN is stored as
 * a SHA-256 hash in localStorage on this device only — no server copy,
 * no recovery flow.
 *
 * Unlock state is per-tab via sessionStorage so admins can navigate
 * around without re-entering the PIN every page load.
 */
export function PinGate({
  pinId,
  title = "Locked",
  description = "Enter your PIN to continue.",
  children,
}: {
  pinId: string;
  title?: string;
  description?: string;
  children: ReactNode;
}) {
  const pinKey = `wolfion_pin_${pinId}`;

  // Always start locked. The PIN must be entered every time the gated
  // page is opened (and every time the user navigates away and back),
  // not cached for the rest of the session.
  const [unlocked, setUnlocked] = useState<boolean>(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!unlocked) {
      try {
        setNeedsSetup(!localStorage.getItem(pinKey));
      } catch {
        setNeedsSetup(true);
      }
    }
  }, [unlocked, pinKey]);

  const hashPin = async (raw: string) => {
    const enc = new TextEncoder().encode(`wolfion::${pinId}::${raw}`);
    const buf = await crypto.subtle.digest("SHA-256", enc);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

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
        try {
          localStorage.setItem(pinKey, await hashPin(pin));
        } catch {
          setError("Could not save PIN on this device.");
          return;
        }
      } else {
        const stored = (() => {
          try {
            return localStorage.getItem(pinKey);
          } catch {
            return null;
          }
        })();
        const h = await hashPin(pin);
        if (stored !== h) {
          setError("Wrong PIN.");
          return;
        }
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
              <Label htmlFor={`gate-pin-${pinId}`}>
                {needsSetup ? "Create a new PIN" : "PIN"}
              </Label>
              <Input
                id={`gate-pin-${pinId}`}
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
                data-testid={`gate-pin-input-${pinId}`}
              />
            </div>
            {needsSetup && (
              <div>
                <Label htmlFor={`gate-pin-confirm-${pinId}`}>Confirm PIN</Label>
                <Input
                  id={`gate-pin-confirm-${pinId}`}
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  value={pinConfirm}
                  onChange={(e) => {
                    setPinConfirm(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="••••"
                  data-testid={`gate-pin-confirm-${pinId}`}
                />
              </div>
            )}
            {error && (
              <p
                className="text-xs text-destructive"
                data-testid={`gate-pin-error-${pinId}`}
              >
                {error}
              </p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={busy || !pin || (needsSetup && !pinConfirm)}
              data-testid={`gate-pin-submit-${pinId}`}
            >
              <ShieldCheck className="h-4 w-4 mr-1.5" />
              {needsSetup ? "Set PIN & unlock" : "Unlock"}
            </Button>
            {needsSetup && (
              <p className="text-[10px] text-muted-foreground">
                This PIN is separate from any other PIN you have. It only
                unlocks this section on this device. There is no recovery
                if you forget it.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
