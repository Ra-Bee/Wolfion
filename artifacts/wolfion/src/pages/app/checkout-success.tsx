import { Link } from "wouter";
import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function CheckoutSuccess() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-24 max-w-lg text-center flex flex-col items-center">
        <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8 animate-in zoom-in duration-500">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight mb-4">Order Confirmed</h1>
        
        <p className="text-muted-foreground text-lg mb-8 text-balance">
          Thank you for your purchase. We've received your order and will notify you when it ships.
        </p>
        
        <div className="bg-muted w-full p-6 rounded-2xl mb-8 flex justify-between items-center text-left">
          <div>
            <p className="text-sm text-muted-foreground">Order Number</p>
            <p className="font-mono font-medium">#WLF-{Math.floor(100000 + Math.random() * 900000)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="font-medium">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
        
        <Link href="/app">
          <Button size="lg" className="rounded-full px-8">
            Continue Shopping <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </AppLayout>
  );
}
