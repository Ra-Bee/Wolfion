import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ShopLayout } from "@/components/shop-layout";
import { GlassCard } from "@/components/glass";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";

type LastOrder = { method?: string; badge?: string; total?: number; ts?: number };

export default function CheckoutSuccess() {
  const [last, setLast] = useState<LastOrder | null>(null);
  const [orderNo] = useState(() => `WLF-${Math.floor(100000 + Math.random() * 900000)}`);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("wolfion:lastOrder");
      if (raw) setLast(JSON.parse(raw));
    } catch {}
  }, []);

  return (
    <ShopLayout>
      <div className="container mx-auto px-5 py-24 max-w-lg text-center flex flex-col items-center">
        {/* 3D glass success disc */}
        <div className="relative mb-8 animate-in zoom-in duration-500">
          <div
            aria-hidden
            className="absolute -inset-4 rounded-full blur-2xl opacity-[0.15] pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(200,200,200,0.6) 50%, rgba(255,255,255,0.8) 100%)",
            }}
          />
          <div
            className="relative h-24 w-24 rounded-full p-[2px]"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(200,200,200,0.1) 50%, rgba(255,255,255,0.3) 100%)",
            }}
          >
            <div
              className="h-full w-full rounded-full flex items-center justify-center text-black dark:text-white border border-neutral-200 dark:border-white/10"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.3) 100%)",
                backdropFilter: "blur(18px) saturate(170%)",
                WebkitBackdropFilter: "blur(18px) saturate(170%)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.55), 0 12px 32px -10px rgba(0,0,0,0.2)",
              }}
            >
              <CheckCircle2 className="h-11 w-11" />
            </div>
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-serif italic tracking-wide mb-5">Order confirmed</h1>

        <p className="text-neutral-500 text-sm mb-12 max-w-sm leading-relaxed font-light">
          Thank you for your purchase. We've received your order and will notify you when it ships.
        </p>

        <GlassCard padding="p-6" rounded="rounded-2xl" className="w-full mb-6">
          <div className="flex justify-between items-center text-left">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-neutral-500">Order number</p>
              <p className="font-mono font-medium mt-1">#{orderNo}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-widest text-neutral-500">Date</p>
              <p className="font-medium mt-1">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </GlassCard>

        {last && (
          <GlassCard padding="p-6" rounded="rounded-2xl" className="w-full mb-10">
            <div className="flex justify-between items-center text-left">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-neutral-500">Paid with</p>
                <p className="font-medium mt-1">{last.method ?? "—"}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-widest text-neutral-500">Amount</p>
                <p className="font-medium mt-1">Tk {(last.total ?? 0).toFixed(2)}</p>
              </div>
            </div>
          </GlassCard>
        )}

        <Link href="/shop">
          <Button size="lg" className="rounded-full px-8 bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900">
            Continue shopping <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </ShopLayout>
  );
}
