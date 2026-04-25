import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ShopLayout } from "@/components/shop-layout";
import { useCart } from "@/hooks/use-cart";
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
import { Minus, Plus, X, ArrowRight, ShoppingBag, Check, Banknote } from "lucide-react";

type PaymentMethod =
  | "bkash"
  | "nagad"
  | "rocket"
  | "card"
  | "paypal"
  | "alipay"
  | "wechat"
  | "unionpay"
  | "cod";

type PayOption = {
  id: PaymentMethod;
  label: string;
  hint: string;
  badge: string;
  bg: string;
  // Either an SVG logo URL or a custom renderer
  logoUrl?: string;
  logoColor?: string; // hex without #
  wordmark?: { text: string; font?: string; italic?: boolean };
};

const PAYMENT_OPTIONS: PayOption[] = [
  { id: "bkash", label: "bKash", hint: "Mobile wallet · instant", badge: "bKash", bg: "bg-[#E2136E]", wordmark: { text: "bKash", italic: true } },
  { id: "nagad", label: "Nagad", hint: "Mobile wallet · instant", badge: "Nagad", bg: "bg-[#EC1C24]", wordmark: { text: "Nagad" } },
  { id: "rocket", label: "Rocket", hint: "DBBL mobile banking", badge: "Rocket", bg: "bg-[#8C3494]", wordmark: { text: "Rocket" } },
  { id: "card", label: "Credit / Debit Card", hint: "Visa, Mastercard, Amex", badge: "Card", bg: "bg-neutral-900", logoUrl: "https://cdn.simpleicons.org/visa/ffffff" },
  { id: "paypal", label: "PayPal", hint: "Sign in with your PayPal account", badge: "PayPal", bg: "bg-[#003087]", logoUrl: "https://cdn.simpleicons.org/paypal/ffffff" },
  { id: "alipay", label: "Alipay", hint: "Scan to pay · 支付宝", badge: "Alipay", bg: "bg-[#1677FF]", logoUrl: "https://cdn.simpleicons.org/alipay/ffffff" },
  { id: "wechat", label: "WeChat Pay", hint: "Scan to pay · 微信支付", badge: "WeChat", bg: "bg-[#07C160]", logoUrl: "https://cdn.simpleicons.org/wechat/ffffff" },
  { id: "unionpay", label: "UnionPay", hint: "China UnionPay · 银联", badge: "UnionPay", bg: "bg-gradient-to-br from-[#E21836] via-[#003E7F] to-[#005F2C]", wordmark: { text: "银联" } },
  { id: "cod", label: "Cash on Delivery", hint: "Pay when you receive", badge: "COD", bg: "bg-emerald-700", wordmark: { text: "COD" } },
];

function PayLogo({ opt, size = "md" }: { opt: PayOption; size?: "sm" | "md" }) {
  const dim = size === "md" ? "h-10 w-10" : "h-6 w-6";
  const textSize = size === "md" ? "text-[11px]" : "text-[8px]";
  return (
    <span className={`${dim} shrink-0 rounded-lg flex items-center justify-center text-white overflow-hidden ${opt.bg}`}>
      {opt.logoUrl ? (
        <img src={opt.logoUrl} alt={opt.label} className={size === "md" ? "h-5 w-5 object-contain" : "h-3.5 w-3.5 object-contain"} loading="lazy" />
      ) : opt.id === "cod" ? (
        <Banknote className={size === "md" ? "h-5 w-5" : "h-3.5 w-3.5"} />
      ) : (
        <span
          className={`${textSize} font-bold tracking-tight leading-none ${opt.wordmark?.italic ? "italic" : ""}`}
          style={{ fontFamily: "ui-sans-serif, system-ui" }}
        >
          {opt.wordmark?.text ?? opt.badge}
        </span>
      )}
    </span>
  );
}

export default function Cart() {
  const { items, updateQuantity, removeItem, clearCart, totalPrice, totalItems } = useCart();
  const [, setLocation] = useLocation();
  const [processing, setProcessing] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("bkash");
  const [walletNumber, setWalletNumber] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [codAddress, setCodAddress] = useState("");
  const [codPhone, setCodPhone] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [unionpayNumber, setUnionpayNumber] = useState("");

  const shipping = totalPrice >= 50 || totalPrice === 0 ? 0 : 5;
  const tax = totalPrice * 0.08;
  const grandTotal = totalPrice + shipping + tax;

  const isWallet = method === "bkash" || method === "nagad" || method === "rocket";
  const isCard = method === "card";
  const isCod = method === "cod";
  const isPaypal = method === "paypal";
  const isQr = method === "alipay" || method === "wechat";
  const isUnionpay = method === "unionpay";

  const canPay =
    (isWallet && /^01[3-9]\d{8}$/.test(walletNumber.replace(/\s/g, ""))) ||
    (isCard &&
      cardNumber.replace(/\s/g, "").length >= 13 &&
      cardExpiry.length >= 4 &&
      cardCvc.length >= 3) ||
    (isCod && codAddress.trim().length > 5 && codPhone.trim().length >= 11) ||
    (isPaypal && /\S+@\S+\.\S+/.test(paypalEmail)) ||
    (isUnionpay && unionpayNumber.replace(/\s/g, "").length >= 13) ||
    isQr;

  const handleConfirmPayment = () => {
    setProcessing(true);
    setTimeout(() => {
      const chosen = PAYMENT_OPTIONS.find((o) => o.id === method);
      try {
        sessionStorage.setItem(
          "wolfion:lastOrder",
          JSON.stringify({
            method: chosen?.label,
            badge: chosen?.badge,
            total: grandTotal,
            ts: Date.now(),
          }),
        );
      } catch {}
      clearCart();
      setProcessing(false);
      setPayOpen(false);
      setLocation("/checkout-success");
    }, 1400);
  };

  if (items.length === 0) {
    return (
      <ShopLayout>
        <div className="container mx-auto px-5 py-32 text-center max-w-md">
          <ShoppingBag className="mx-auto h-12 w-12 text-neutral-300 mb-6" />
          <h1 className="text-3xl font-light tracking-tight mb-3">Your bag is empty</h1>
          <p className="text-sm text-neutral-500 mb-8">Discover the latest pieces from the Wolfion collection.</p>
          <Link href="/products">
            <Button className="h-12 px-8 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900">
              Shop the collection <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </ShopLayout>
    );
  }

  return (
    <ShopLayout>
      <div className="container mx-auto px-5 pt-12 pb-20 max-w-6xl">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-2">Your bag</p>
          <h1 className="text-4xl font-light tracking-tight">Cart ({totalItems})</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 lg:gap-16 items-start">
          {/* Items */}
          <div className="border-t border-neutral-200 dark:border-neutral-800">
            {items.map((item, idx) => (
              <div
                key={`${item.product.id}-${item.size}-${idx}`}
                className="flex gap-5 py-6 border-b border-neutral-200 dark:border-neutral-800"
                data-testid={`cart-item-${item.product.id}`}
              >
                <Link href={`/product/${item.product.id}`} className="shrink-0">
                  <div className="h-28 w-24 sm:h-32 sm:w-28 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                    <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                  </div>
                </Link>

                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between gap-3">
                    <div>
                      <Link href={`/product/${item.product.id}`}>
                        <h3 className="text-sm font-medium hover:underline">{item.product.name}</h3>
                      </Link>
                      <p className="text-xs text-neutral-500 mt-1">{item.product.color}</p>
                      <p className="text-xs text-neutral-500">Size {item.size}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id, item.size)}
                      className="text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50"
                      aria-label="Remove"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <div className="inline-flex items-center border border-neutral-300 dark:border-neutral-700 rounded-full">
                      <button
                        className="h-9 w-9 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-l-full"
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        className="h-9 w-9 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-r-full"
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="text-sm font-medium">Tk {(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-5 flex justify-between items-center text-sm">
              <Link href="/products" className="text-neutral-500 hover:underline inline-flex items-center">
                ← Continue shopping
              </Link>
              <button onClick={clearCart} className="text-neutral-500 hover:text-red-600 text-xs uppercase tracking-widest">
                Clear bag
              </button>
            </div>
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-24 bg-neutral-50 dark:bg-neutral-900 rounded-2xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800">
            <h2 className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-6">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-neutral-500">Subtotal</span><span>Tk {totalPrice.toFixed(2)}</span></div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Shipping</span>
                <span>{shipping === 0 ? "Free" : `Tk ${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between"><span className="text-neutral-500">Estimated tax</span><span>Tk {tax.toFixed(2)}</span></div>
            </div>

            <div className="border-t border-neutral-200 dark:border-neutral-800 mt-6 pt-6 flex justify-between items-baseline">
              <span className="text-sm font-medium">Total</span>
              <span className="text-2xl font-light">Tk {grandTotal.toFixed(2)}</span>
            </div>

            <Button
              className="w-full mt-6 h-13 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 text-sm uppercase tracking-widest font-medium py-4"
              onClick={() => setPayOpen(true)}
              data-testid="checkout"
            >
              Checkout <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            {/* Payment chips preview */}
            <div className="mt-5 flex flex-wrap gap-2 justify-center items-center">
              {PAYMENT_OPTIONS.map((p) => (
                <span key={p.id} title={p.label} aria-label={p.label}>
                  <PayLogo opt={p} size="sm" />
                </span>
              ))}
            </div>

            <p className="text-[11px] text-neutral-500 mt-4 text-center leading-relaxed">
              Secure checkout. Demo only — no real payment is processed.
            </p>
          </aside>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={payOpen} onOpenChange={(o) => !processing && setPayOpen(o)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-light tracking-tight">Choose payment</DialogTitle>
            <DialogDescription className="text-neutral-500">
              Total due: <span className="font-medium text-neutral-900 dark:text-neutral-50">Tk {grandTotal.toFixed(2)}</span>
            </DialogDescription>
          </DialogHeader>

          {/* Method picker */}
          <div className="space-y-2 mt-2">
            {PAYMENT_OPTIONS.map((opt) => {
              const active = method === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setMethod(opt.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                    active
                      ? "border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-900 shadow-sm"
                      : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"
                  }`}
                  data-testid={`pay-method-${opt.id}`}
                >
                  <PayLogo opt={opt} size="md" />
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium">{opt.label}</span>
                    <span className="block text-xs text-neutral-500 mt-0.5">{opt.hint}</span>
                  </span>
                  <span
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      active ? "border-neutral-900 dark:border-white bg-neutral-900 dark:bg-white" : "border-neutral-300 dark:border-neutral-700"
                    }`}
                  >
                    {active && <Check className="h-3 w-3 text-white dark:text-neutral-900" />}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Method-specific form */}
          <div className="mt-2 space-y-3">
            {isWallet && (
              <div>
                <Label htmlFor="walletNumber" className="text-xs uppercase tracking-widest text-neutral-500">
                  {method === "bkash" ? "bKash" : method === "nagad" ? "Nagad" : "Rocket"} Number
                </Label>
                <Input
                  id="walletNumber"
                  placeholder="01XXXXXXXXX"
                  inputMode="numeric"
                  maxLength={11}
                  value={walletNumber}
                  onChange={(e) => setWalletNumber(e.target.value.replace(/\D/g, ""))}
                  className="mt-1.5 h-12 rounded-lg"
                  data-testid="input-wallet"
                />
                <p className="text-[11px] text-neutral-500 mt-2">A confirmation PIN will be sent to this number.</p>
              </div>
            )}

            {isCard && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="cardNumber" className="text-xs uppercase tracking-widest text-neutral-500">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    inputMode="numeric"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 16);
                      setCardNumber(v.replace(/(.{4})/g, "$1 ").trim());
                    }}
                    className="mt-1.5 h-12 rounded-lg"
                    data-testid="input-card-number"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
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
                      data-testid="input-card-expiry"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cardCvc" className="text-xs uppercase tracking-widest text-neutral-500">CVC</Label>
                    <Input
                      id="cardCvc"
                      placeholder="123"
                      inputMode="numeric"
                      maxLength={4}
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ""))}
                      className="mt-1.5 h-12 rounded-lg"
                      data-testid="input-card-cvc"
                    />
                  </div>
                </div>
              </div>
            )}

            {isCod && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="codAddress" className="text-xs uppercase tracking-widest text-neutral-500">Delivery Address</Label>
                  <Input
                    id="codAddress"
                    placeholder="House, road, area, city"
                    value={codAddress}
                    onChange={(e) => setCodAddress(e.target.value)}
                    className="mt-1.5 h-12 rounded-lg"
                    data-testid="input-cod-address"
                  />
                </div>
                <div>
                  <Label htmlFor="codPhone" className="text-xs uppercase tracking-widest text-neutral-500">Phone</Label>
                  <Input
                    id="codPhone"
                    placeholder="01XXXXXXXXX"
                    inputMode="numeric"
                    maxLength={11}
                    value={codPhone}
                    onChange={(e) => setCodPhone(e.target.value.replace(/\D/g, ""))}
                    className="mt-1.5 h-12 rounded-lg"
                    data-testid="input-cod-phone"
                  />
                </div>
                <p className="text-[11px] text-neutral-500">Pay in cash when your order arrives at your door.</p>
              </div>
            )}

            {isPaypal && (
              <div>
                <Label htmlFor="paypalEmail" className="text-xs uppercase tracking-widest text-neutral-500">PayPal Email</Label>
                <Input
                  id="paypalEmail"
                  type="email"
                  placeholder="you@example.com"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  className="mt-1.5 h-12 rounded-lg"
                  data-testid="input-paypal-email"
                />
                <p className="text-[11px] text-neutral-500 mt-2">You'll be redirected to PayPal to authorize the payment.</p>
              </div>
            )}

            {isQr && (
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 flex flex-col items-center text-center">
                <div className="h-32 w-32 rounded-lg bg-white dark:bg-neutral-100 p-3 shadow-sm">
                  <div
                    className="h-full w-full"
                    style={{
                      backgroundImage:
                        "linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)",
                      backgroundSize: "12px 12px",
                      backgroundPosition: "0 0, 0 6px, 6px -6px, -6px 0",
                    }}
                    aria-hidden
                  />
                </div>
                <p className="text-sm font-medium mt-4">
                  Open your {method === "alipay" ? "Alipay" : "WeChat"} app
                </p>
                <p className="text-[11px] text-neutral-500 mt-1.5 max-w-xs">
                  Scan the QR code to confirm the Tk {grandTotal.toFixed(2)} payment, then tap Pay below.
                </p>
              </div>
            )}

            {isUnionpay && (
              <div>
                <Label htmlFor="unionpayNumber" className="text-xs uppercase tracking-widest text-neutral-500">UnionPay Card Number</Label>
                <Input
                  id="unionpayNumber"
                  placeholder="6222 0000 0000 0000"
                  inputMode="numeric"
                  maxLength={23}
                  value={unionpayNumber}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 19);
                    setUnionpayNumber(v.replace(/(.{4})/g, "$1 ").trim());
                  }}
                  className="mt-1.5 h-12 rounded-lg"
                  data-testid="input-unionpay-number"
                />
                <p className="text-[11px] text-neutral-500 mt-2">A one-time SMS code will be sent to verify the payment.</p>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4 gap-2 sm:gap-2">
            <Button
              variant="outline"
              className="h-12 rounded-full"
              onClick={() => setPayOpen(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              className="h-12 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 text-sm uppercase tracking-widest font-medium px-6"
              onClick={handleConfirmPayment}
              disabled={!canPay || processing}
              data-testid="confirm-payment"
            >
              {processing ? "Processing…" : `Pay Tk ${grandTotal.toFixed(2)}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ShopLayout>
  );
}
