import { useEffect, useState } from "react";
import {
  loadSavedPayments,
  maskCard,
  maskEmail,
  maskPhone,
  persistSavedPayments,
  type SavedPayment,
  type SavedPaymentKind,
} from "@/lib/payment-methods";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Plus, Star, StarOff, Trash2, Wallet, Smartphone } from "lucide-react";
import bkashLogo from "@assets/unnamed_1777146200639.png";
import nagadLogo from "@assets/unnamed_(1)_1777146284882.png";
import rocketLogo from "@assets/images_1777146355425.png";

const KIND_META: Record<
  SavedPaymentKind,
  { label: string; bg: string; logoUrl?: string; icon?: typeof CreditCard }
> = {
  card: { label: "Credit / Debit Card", bg: "bg-neutral-900", logoUrl: "https://cdn.simpleicons.org/visa/ffffff" },
  bkash: { label: "bKash", bg: "bg-[#E2136E]", logoUrl: bkashLogo },
  nagad: { label: "Nagad", bg: "bg-[#EC1C24]", logoUrl: nagadLogo },
  rocket: { label: "Rocket", bg: "bg-[#8C3494]", logoUrl: rocketLogo },
  paypal: { label: "PayPal", bg: "bg-[#003087]", logoUrl: "https://cdn.simpleicons.org/paypal/ffffff" },
  unionpay: { label: "UnionPay", bg: "bg-gradient-to-br from-[#E21836] via-[#003E7F] to-[#005F2C]", icon: CreditCard },
};

const KIND_OPTIONS: { id: SavedPaymentKind; label: string; icon: typeof CreditCard }[] = [
  { id: "card", label: "Credit / Debit Card", icon: CreditCard },
  { id: "bkash", label: "bKash", icon: Smartphone },
  { id: "nagad", label: "Nagad", icon: Smartphone },
  { id: "rocket", label: "Rocket", icon: Smartphone },
  { id: "paypal", label: "PayPal", icon: Wallet },
  { id: "unionpay", label: "UnionPay", icon: CreditCard },
];

function PayLogo({ kind }: { kind: SavedPaymentKind }) {
  const meta = KIND_META[kind];
  const Icon = meta.icon;
  return (
    <span className={`h-10 w-10 shrink-0 rounded-lg flex items-center justify-center text-white ${meta.bg}`}>
      {meta.logoUrl ? (
        <img src={meta.logoUrl} alt={meta.label} className="h-5 w-5 object-contain" />
      ) : Icon ? (
        <Icon className="h-5 w-5" />
      ) : null}
    </span>
  );
}

export function SavedPayments() {
  const [items, setItems] = useState<SavedPayment[]>([]);
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<SavedPaymentKind>("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [walletNumber, setWalletNumber] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");

  useEffect(() => {
    setItems(loadSavedPayments());
    const onChange = () => setItems(loadSavedPayments());
    window.addEventListener("wolfion:savedPayments:changed", onChange);
    return () => window.removeEventListener("wolfion:savedPayments:changed", onChange);
  }, []);

  function reset() {
    setCardNumber("");
    setCardName("");
    setCardExpiry("");
    setWalletNumber("");
    setPaypalEmail("");
    setKind("card");
  }

  const isWallet = kind === "bkash" || kind === "nagad" || kind === "rocket";
  const isCardLike = kind === "card" || kind === "unionpay";

  const canSave =
    (isCardLike && cardNumber.replace(/\D/g, "").length >= 13 && cardExpiry.length >= 4 && cardName.trim().length > 0) ||
    (isWallet && /^01[3-9]\d{8}$/.test(walletNumber.replace(/\D/g, ""))) ||
    (kind === "paypal" && /\S+@\S+\.\S+/.test(paypalEmail));

  function handleSave() {
    let label = KIND_META[kind].label;
    let detail = "";
    if (isCardLike) detail = `${maskCard(cardNumber)} · exp ${cardExpiry}`;
    if (isWallet) detail = maskPhone(walletNumber);
    if (kind === "paypal") detail = maskEmail(paypalEmail);

    const newItem: SavedPayment = {
      id: `pm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      kind,
      label,
      detail,
      isDefault: items.length === 0,
      createdAt: Date.now(),
    };
    const next = [...items, newItem];
    persistSavedPayments(next);
    setItems(next);
    setOpen(false);
    reset();
  }

  function handleRemove(id: string) {
    const next = items.filter((i) => i.id !== id);
    if (next.length > 0 && !next.some((i) => i.isDefault)) next[0].isDefault = true;
    persistSavedPayments(next);
    setItems(next);
  }

  function handleSetDefault(id: string) {
    const next = items.map((i) => ({ ...i, isDefault: i.id === id }));
    persistSavedPayments(next);
    setItems(next);
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-neutral-950 shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
      <div className="p-6 sm:p-8 flex items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Payment Methods
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Saved cards and wallets used for faster checkout.
          </p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          className="rounded-full bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 h-10 px-4"
          data-testid="add-payment-method"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Add
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="p-10 text-center">
          <CreditCard className="mx-auto h-10 w-10 text-neutral-300 dark:text-neutral-700 mb-4" />
          <p className="text-sm text-neutral-500">No payment methods yet.</p>
          <p className="text-xs text-neutral-400 mt-1">Add a card or wallet to skip the form at checkout.</p>
        </div>
      ) : (
        <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {items.map((p) => (
            <li
              key={p.id}
              className="p-5 sm:px-8 flex items-center gap-4"
              data-testid={`saved-payment-${p.id}`}
            >
              <PayLogo kind={p.kind} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{p.label}</span>
                  {p.isDefault && (
                    <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 mt-0.5 truncate">{p.detail}</p>
              </div>
              <div className="flex items-center gap-1">
                {!p.isDefault && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 rounded-full"
                    onClick={() => handleSetDefault(p.id)}
                    title="Set as default"
                    aria-label="Set as default"
                  >
                    <StarOff className="h-4 w-4 text-neutral-400" />
                  </Button>
                )}
                {p.isDefault && (
                  <span className="h-9 w-9 inline-flex items-center justify-center" title="Default" aria-label="Default">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  </span>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 rounded-full text-neutral-400 hover:text-red-600"
                  onClick={() => handleRemove(p.id)}
                  title="Remove"
                  aria-label="Remove"
                  data-testid={`remove-payment-${p.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-light tracking-tight">Add payment method</DialogTitle>
            <DialogDescription className="text-neutral-500">
              Saved on this device. We never store full card numbers — only the last 4 digits.
            </DialogDescription>
          </DialogHeader>

          {/* Kind picker */}
          <div className="grid grid-cols-3 gap-2 mt-2">
            {KIND_OPTIONS.map((opt) => {
              const active = kind === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setKind(opt.id)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col items-start gap-2 ${
                    active
                      ? "border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-900 shadow-sm"
                      : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"
                  }`}
                  data-testid={`kind-${opt.id}`}
                >
                  <PayLogo kind={opt.id} />
                  <span className="text-xs font-medium leading-tight">{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form */}
          <div className="mt-2 space-y-3">
            {isCardLike && (
              <>
                <div>
                  <Label htmlFor="cardName" className="text-xs uppercase tracking-widest text-neutral-500">Cardholder Name</Label>
                  <Input
                    id="cardName"
                    placeholder="As printed on card"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="mt-1.5 h-12 rounded-lg"
                    data-testid="input-saved-card-name"
                  />
                </div>
                <div>
                  <Label htmlFor="cardNumber" className="text-xs uppercase tracking-widest text-neutral-500">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder={kind === "unionpay" ? "6222 0000 0000 0000" : "1234 5678 9012 3456"}
                    inputMode="numeric"
                    maxLength={23}
                    value={cardNumber}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 19);
                      setCardNumber(v.replace(/(.{4})/g, "$1 ").trim());
                    }}
                    className="mt-1.5 h-12 rounded-lg"
                    data-testid="input-saved-card-number"
                  />
                </div>
                <div>
                  <Label htmlFor="cardExpiry" className="text-xs uppercase tracking-widest text-neutral-500">Expiry</Label>
                  <Input
                    id="cardExpiry"
                    placeholder="MM/YY"
                    maxLength={5}
                    value={cardExpiry}
                    onChange={(e) => {
                      let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                      if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
                      setCardExpiry(v);
                    }}
                    className="mt-1.5 h-12 rounded-lg"
                    data-testid="input-saved-card-expiry"
                  />
                </div>
              </>
            )}

            {isWallet && (
              <div>
                <Label htmlFor="walletNumber" className="text-xs uppercase tracking-widest text-neutral-500">
                  {KIND_META[kind].label} Number
                </Label>
                <Input
                  id="walletNumber"
                  placeholder="01XXXXXXXXX"
                  inputMode="numeric"
                  maxLength={11}
                  value={walletNumber}
                  onChange={(e) => setWalletNumber(e.target.value.replace(/\D/g, ""))}
                  className="mt-1.5 h-12 rounded-lg"
                  data-testid="input-saved-wallet"
                />
              </div>
            )}

            {kind === "paypal" && (
              <div>
                <Label htmlFor="paypalEmail" className="text-xs uppercase tracking-widest text-neutral-500">PayPal Email</Label>
                <Input
                  id="paypalEmail"
                  type="email"
                  placeholder="you@example.com"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  className="mt-1.5 h-12 rounded-lg"
                  data-testid="input-saved-paypal"
                />
              </div>
            )}
          </div>

          <DialogFooter className="mt-4 gap-2 sm:gap-2">
            <Button variant="outline" className="h-12 rounded-full" onClick={() => { setOpen(false); reset(); }}>
              Cancel
            </Button>
            <Button
              className="h-12 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 px-6"
              onClick={handleSave}
              disabled={!canSave}
              data-testid="save-payment"
            >
              Save method
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
