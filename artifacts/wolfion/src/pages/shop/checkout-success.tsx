import { Link } from "wouter";
import { ShopLayout } from "@/components/shop-layout";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function CheckoutSuccess() {
  return (
    <ShopLayout>
      <div className="container mx-auto px-5 py-24 max-w-lg text-center flex flex-col items-center">
        <div className="h-20 w-20 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-8 animate-in zoom-in duration-500">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <h1 className="text-3xl font-light tracking-tight mb-3">Order confirmed</h1>

        <p className="text-neutral-500 text-sm mb-10 max-w-sm leading-relaxed">
          Thank you for your purchase. We've received your order and will notify you when it ships.
        </p>

        <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 w-full p-6 rounded-2xl mb-10 flex justify-between items-center text-left">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-neutral-500">Order number</p>
            <p className="font-mono font-medium mt-1">#WLF-{Math.floor(100000 + Math.random() * 900000)}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-widest text-neutral-500">Date</p>
            <p className="font-medium mt-1">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <Link href="/shop">
          <Button size="lg" className="rounded-full px-8 bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900">
            Continue shopping <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </ShopLayout>
  );
}
