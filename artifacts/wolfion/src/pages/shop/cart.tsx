import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ShopLayout } from "@/components/shop-layout";
import { GlassCard, GlassPhotoFrame } from "@/components/glass";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { loadSavedPayments, type SavedPayment } from "@/lib/payment-methods";
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
import bkashLogo from "@assets/unnamed_1777146200639.png";
import nagadLogo from "@assets/unnamed_(1)_1777146284882.png";
import rocketLogo from "@assets/images_1777146355425.png";

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

// Softer / lighter palette so the payment row reads as elegant rather than
// neon-bright. Each shade is the brand colour pulled toward Tailwind's 400/500
// tier, which still keeps the white logo legible (≈3:1 contrast or better) but
// removes the harsh saturation the original brand hex codes had.
const PAYMENT_OPTIONS: PayOption[] = [
  { id: "card", label: "Credit / Debit Card", hint: "Visa, Mastercard, Amex", badge: "Card", bg: "bg-neutral-700", logoUrl: "https://cdn.simpleicons.org/visa/ffffff" },
  { id: "bkash", label: "bKash", hint: "Mobile wallet · instant", badge: "bKash", bg: "bg-pink-400", logoUrl: bkashLogo },
  { id: "nagad", label: "Nagad", hint: "Mobile wallet · instant", badge: "Nagad", bg: "bg-rose-400", logoUrl: nagadLogo },
  { id: "rocket", label: "Rocket", hint: "DBBL mobile banking", badge: "Rocket", bg: "bg-purple-400", logoUrl: rocketLogo },
  { id: "paypal", label: "PayPal", hint: "Sign in with your PayPal account", badge: "PayPal", bg: "bg-blue-500", logoUrl: "https://cdn.simpleicons.org/paypal/ffffff" },
  { id: "alipay", label: "Alipay", hint: "Scan to pay · 支付宝", badge: "Alipay", bg: "bg-sky-400", logoUrl: "https://cdn.simpleicons.org/alipay/ffffff" },
  { id: "wechat", label: "WeChat Pay", hint: "Scan to pay · 微信支付", badge: "WeChat", bg: "bg-emerald-400", logoUrl: "https://cdn.simpleicons.org/wechat/ffffff" },
  { id: "unionpay", label: "UnionPay", hint: "China UnionPay · 银联", badge: "UnionPay", bg: "bg-gradient-to-br from-rose-400 via-blue-500 to-emerald-500", wordmark: { text: "银联" } },
  { id: "cod", label: "Cash on Delivery", hint: "Pay when you receive", badge: "COD", bg: "bg-emerald-500", wordmark: { text: "COD" } },
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
  const [saved, setSaved] = useState<SavedPayment[]>([]);
  const [usingSavedId, setUsingSavedId] = useState<string | null>(null);

  useEffect(() => {
    if (!payOpen) return;
    const next = loadSavedPayments();
    setSaved(next);
    const def = next.find((p) => p.isDefault) ?? next[0];
    if (def) {
      setUsingSavedId(def.id);
      setMethod(def.kind as PaymentMethod);
    }
  }, [payOpen]);

  const shipping = totalPrice >= 50 || totalPrice === 0 ? 0 : 5;
  const tax = totalPrice * 0.08;
  const grandTotal = totalPrice + shipping + tax;

  const isWallet = method === "bkash" || method === "nagad" || method === "rocket";
  const isCard = method === "card";
  const isCod = method === "cod";
  const isPaypal = method === "paypal";
  const isQr = method === "alipay" || method === "wechat";
  const isUnionpay = method === "unionpay";

  const usingSaved = !!usingSavedId && saved.some((s) => s.id === usingSavedId && s.kind === method);

  const canPay =
    usingSaved ||
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
          {/* 3D glass empty-bag disc */}
          <div className="relative inline-flex mb-6">
            <div
              aria-hidden
              className="absolute -inset-4 rounded-full blur-2xl opacity-40 pointer-events-none"
              style={{
                background:
                  "linear-gradient(135deg, rgba(180,140,150,0.55) 0%, rgba(190,160,110,0.45) 50%, rgba(140,120,160,0.55) 100%)",
              }}
            />
            <div
              className="relative h-20 w-20 rounded-full p-[2px]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(180,140,150,0.7) 0%, rgba(190,160,110,0.5) 50%, rgba(140,120,160,0.7) 100%)",
              }}
            >
              <div
                className="h-full w-full rounded-full flex items-center justify-center text-neutral-700 dark:text-neutral-200 border border-white/40 dark:border-white/10"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.10) 100%)",
                  backdropFilter: "blur(16px) saturate(170%)",
                  WebkitBackdropFilter: "blur(16px) saturate(170%)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.55), 0 10px 26px -10px rgba(15,23,42,0.4)",
                }}
              >
                <ShoppingBag className="h-9 w-9" />
              </div>
            </div>
          </div>
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
                  <GlassPhotoFrame
                    rounded="rounded-lg"
                    haloOpacity={0.20}
                    className="h-28 w-24 sm:h-32 sm:w-28"
                    innerClassName="h-full w-full bg-white dark:bg-neutral-900"
                  >
                    <img src={item.product.image} alt={item.product.name} className="absolute inset-0 h-full w-full object-cover" />
                  </GlassPhotoFrame>
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
                    <div
                      className="inline-flex items-center border border-white/40 dark:border-white/10 rounded-full"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.10) 100%)",
                        backdropFilter: "blur(14px) saturate(170%)",
                        WebkitBackdropFilter: "blur(14px) saturate(170%)",
                        boxShadow:
                          "inset 0 1px 0 rgba(255,255,255,0.5), 0 6px 16px -8px rgba(15,23,42,0.25)",
                      }}
                    >
                      <button
                        className="h-9 w-9 flex items-center justify-center hover:bg-white/40 dark:hover:bg-white/10 rounded-l-full transition-colors"
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        className="h-9 w-9 flex items-center justify-center hover:bg-white/40 dark:hover:bg-white/10 rounded-r-full transition-colors"
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

          {/* Summary — middle glass card */}
          <aside className="lg:sticky lg:top-24">
            <GlassCard
              padding="p-6 sm:p-8"
              rounded="rounded-3xl"
              haloOpacity={0.18}
              ringed={false}
            >
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
            </GlassCard>
          </aside>
        </div>
      </div>

      {/* Payment Dialog — 3D glass */}
      <Dialog open={payOpen} onOpenChange={(o) => !processing && setPayOpen(o)}>
        <DialogContent
          className="sm:max-w-lg max-h-[90vh] overflow-y-auto !border-0 !p-0 !bg-transparent !shadow-none"
        >
          {/* Glow halo behind the panel */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-3 rounded-[32px] blur-2xl opacity-50"
            style={{
              background:
                "linear-gradient(135deg, #1ABBC4 0%, #6E3CFB 50%, #D4AF37 100%)",
            }}
          />
          {/* Gradient border */}
          <div
            className="relative rounded-[24px] p-[1.5px]"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(26,187,196,0.35) 35%, rgba(212,175,55,0.35) 70%, rgba(255,255,255,0.15) 100%)",
            }}
          >
            {/* Glass interior */}
            <div
              className="rounded-[23px] p-5 sm:p-6 border border-white/10 text-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] [&_input]:!bg-white/[0.05] [&_input]:!border-white/15 [&_input]:!text-white [&_input]:placeholder:!text-white/35 [&_input]:!backdrop-blur-md [&_label]:!text-white/65"
              style={{
                background:
                  "linear-gradient(180deg, rgba(10,18,28,0.94) 0%, rgba(4,17,26,0.97) 100%)",
                backdropFilter: "blur(28px) saturate(140%)",
                WebkitBackdropFilter: "blur(28px) saturate(140%)",
                colorScheme: "dark",
              }}
            >
          <DialogHeader>
            <DialogTitle
              className="text-2xl font-bold tracking-tight"
              style={{
                background:
                  "linear-gradient(135deg, #ffffff 0%, #5EEAD4 55%, #E5D4A8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Choose payment
            </DialogTitle>
            <DialogDescription className="!text-white/70">
              Total due: <span className="font-semibold text-white">Tk {grandTotal.toFixed(2)}</span>
            </DialogDescription>
          </DialogHeader>

          {/* Saved methods quick-pick */}
          {saved.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/55">Saved methods</p>
                <Link href="/settings" onClick={() => setPayOpen(false)} className="text-[11px] text-[#5EEAD4] hover:text-white transition-colors">
                  Manage
                </Link>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                {saved.map((s) => {
                  const opt = PAYMENT_OPTIONS.find((o) => o.id === s.kind);
                  const selected = usingSavedId === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setUsingSavedId(s.id);
                        setMethod(s.kind as PaymentMethod);
                      }}
                      className={`shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-colors duration-150 ${
                        selected
                          ? "border-[#5EEAD4]/60 bg-white/[0.08] shadow-[0_8px_24px_-8px_rgba(94,234,212,0.5)]"
                          : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]"
                      }`}
                      data-testid={`saved-${s.id}`}
                    >
                      {opt && <PayLogo opt={opt} size="sm" />}
                      <span className="text-left">
                        <span className="block text-[11px] font-medium leading-tight text-white">{s.label}</span>
                        <span className="block text-[10px] text-white/55 leading-tight">{s.detail}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 mb-1 flex items-center gap-3">
                <span className="h-px flex-1 bg-white/10" />
                <span className="text-[10px] uppercase tracking-widest text-white/45">or pick another</span>
                <span className="h-px flex-1 bg-white/10" />
              </div>
            </div>
          )}

          {/* Method picker — 3D glass cards */}
          <div className="space-y-2.5 mt-3">
            {PAYMENT_OPTIONS.map((opt) => {
              const active = method === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => { setMethod(opt.id); setUsingSavedId(null); }}
                  className="group relative w-full text-left active:scale-[0.99] transition-transform"
                  data-testid={`pay-method-${opt.id}`}
                >
                  {/* Hover/active glow */}
                  <div
                    aria-hidden
                    className={`absolute -inset-0.5 rounded-[18px] blur-md transition-opacity duration-300 pointer-events-none ${
                      active ? "opacity-80" : "opacity-0 group-hover:opacity-50"
                    }`}
                    style={{
                      background:
                        "linear-gradient(135deg, #1ABBC4 0%, #6E3CFB 100%)",
                    }}
                  />
                  {/* Gradient border */}
                  <div
                    className="relative rounded-[16px] p-[1.5px] transition-all"
                    style={{
                      background: active
                        ? "linear-gradient(135deg, #1ABBC4 0%, #D4AF37 100%)"
                        : "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 100%)",
                    }}
                  >
                    <div
                      className="rounded-[15px] flex items-center gap-4 p-3.5 border border-white/10 backdrop-blur-md"
                      style={{
                        background: active
                          ? "linear-gradient(180deg, rgba(26,187,196,0.14) 0%, rgba(110,60,251,0.10) 100%)"
                          : "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
                      }}
                    >
                      <PayLogo opt={opt} size="md" />
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-semibold text-white">{opt.label}</span>
                        <span className="block text-xs text-white/55 mt-0.5 truncate">{opt.hint}</span>
                      </span>
                      <span
                        className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          active
                            ? "border-[#5EEAD4] bg-gradient-to-br from-[#1ABBC4] to-[#D4AF37] shadow-[0_0_12px_rgba(94,234,212,0.6)]"
                            : "border-white/25 bg-white/[0.04]"
                        }`}
                      >
                        {active && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Method-specific form (hidden when using a saved method) */}
          <div className="mt-2 space-y-3">
            {usingSaved && (
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-200 flex items-center gap-3 backdrop-blur-md">
                <Check className="h-4 w-4 shrink-0" />
                <span>Using your saved {PAYMENT_OPTIONS.find((o) => o.id === method)?.label}. A verification code will be sent to confirm.</span>
              </div>
            )}
            {!usingSaved && isWallet && (
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

            {!usingSaved && isCard && (
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

            {!usingSaved && isPaypal && (
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

            {!usingSaved && isUnionpay && (
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

          <DialogFooter className="mt-5 gap-2 sm:gap-2">
            <Button
              variant="outline"
              className="h-12 rounded-full !bg-white/[0.04] !text-white !border-white/15 hover:!bg-white/10 hover:!border-white/30 backdrop-blur-md"
              onClick={() => setPayOpen(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              className="h-12 rounded-full !bg-gradient-to-r !from-[#1ABBC4] !via-[#16D4DD] !to-[#D4AF37] hover:!brightness-110 !text-black text-sm uppercase tracking-widest font-bold px-6 shadow-[0_10px_30px_-5px_rgba(26,187,196,0.5)] hover:shadow-[0_15px_40px_-5px_rgba(26,187,196,0.7)] transition-all"
              onClick={handleConfirmPayment}
              disabled={!canPay || processing}
              data-testid="confirm-payment"
            >
              {processing ? "Processing…" : `Pay Tk ${grandTotal.toFixed(2)}`}
            </Button>
          </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ShopLayout>
  );
}
