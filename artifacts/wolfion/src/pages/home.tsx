import { Link } from "wouter";
import { ArrowRight, ShieldCheck, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import wolfionLogo from "@assets/Image_20260421042552_60_2_1776716788241.jpg";

export default function Home() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <header className="absolute top-0 w-full z-50 px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={wolfionLogo} alt="Ultion" className="h-9 w-9 rounded-md object-cover" />
          <span className="font-bold text-xl tracking-tight">ULTION</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in">
            <Button variant="ghost" className="hidden sm:inline-flex font-medium">Log in</Button>
          </Link>
          <Link href="/sign-up">
            <Button className="rounded-full px-6 font-medium bg-foreground text-background hover:bg-foreground/90">Shop Now</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-12 px-6">
        <div className="max-w-3xl w-full mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-sm font-medium mb-4">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            The new standard in everyday essentials
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter leading-[1.1] text-balance">
            Socks that don't <br className="hidden sm:block" />
            <span className="text-primary italic font-serif font-medium">compromise.</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-balance">
            Sharp design, uncompromising comfort, and materials that last. Ultion is built for those who know details matter.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/sign-up" className="w-full sm:w-auto">
              <Button size="lg" className="w-full rounded-full text-base h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/sign-in" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full rounded-full text-base h-14 px-8 border-foreground/10 hover:bg-muted">
                I already have an account
              </Button>
            </Link>
          </div>
        </div>

        <div className="w-full max-w-5xl mx-auto mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-both">
          <div className="relative group overflow-hidden rounded-2xl aspect-[4/5] bg-muted">
            <img 
              src="https://images.unsplash.com/photo-1582966772680-860e372bb558?w=800&q=80" 
              alt="Black socks" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
              <p className="text-white font-medium text-lg">The Everyday Crew</p>
              <p className="text-white/80 text-sm">Onyx Black</p>
            </div>
          </div>
          
          <div className="relative group overflow-hidden rounded-2xl aspect-[4/5] bg-muted md:-translate-y-8">
            <img 
              src="https://images.unsplash.com/photo-1608222351212-18fe0ec7b13b?w=800&q=80" 
              alt="White socks" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
              <p className="text-white font-medium text-lg">The Everyday Crew</p>
              <p className="text-white/80 text-sm">Arctic White</p>
            </div>
          </div>
          
          <div className="relative group overflow-hidden rounded-2xl aspect-[4/5] bg-muted">
            <img 
              src="https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=800&q=80" 
              alt="Orange socks" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
              <p className="text-white font-medium text-lg">Performance Ankle</p>
              <p className="text-white/80 text-sm">Wolf Orange</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
