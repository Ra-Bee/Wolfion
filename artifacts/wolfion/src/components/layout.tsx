import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useUser, useClerk } from '@clerk/react';
import { useRole } from '@/hooks/use-role';
import { useCart } from '@/hooks/use-cart';
import { ShoppingBag, User, LogOut, Menu, X, ArrowRight, ShieldCheck, Home, Sun, Moon, FileText, Users as UsersIcon, Wrench, Factory, ShoppingCart, TrendingUp, Wallet, HandCoins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { useTheme } from '@/hooks/use-theme';
import wolfionLogo from "@assets/Image_20260421042552_60_2_1776716788241.jpg";

export function CartDrawer({ children }: { children: React.ReactNode }) {
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [, setLocation] = useLocation();

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      clearCart();
      setIsCheckingOut(false);
      setIsOpen(false);
      setLocation('/app/checkout-success');
    }, 1500);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto py-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <ShoppingBag className="h-12 w-12 mb-4 opacity-20" />
              <p>Your cart is empty.</p>
              <Button variant="link" onClick={() => setIsOpen(false)} className="mt-4">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item, idx) => (
                <div key={`${item.product.id}-${item.size}-${idx}`} className="flex gap-4">
                  <div className="h-20 w-20 rounded-md overflow-hidden bg-muted shrink-0">
                    <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm">{item.product.name}</h4>
                        <button onClick={() => removeItem(item.product.id, item.size)} className="text-muted-foreground hover:text-foreground">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{item.product.color} / Size {item.size}</p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center border rounded-md">
                        <button className="px-2 py-1 text-sm hover:bg-muted" onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}>-</button>
                        <span className="px-2 text-sm w-8 text-center">{item.quantity}</span>
                        <button className="px-2 py-1 text-sm hover:bg-muted" onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}>+</button>
                      </div>
                      <span className="font-medium text-sm">${(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {items.length > 0 && (
          <div className="border-t pt-4 mt-auto">
            <div className="flex justify-between mb-4">
              <span className="font-medium">Subtotal</span>
              <span className="font-bold">${totalPrice.toFixed(2)}</span>
            </div>
            <Button className="w-full" size="lg" onClick={handleCheckout} disabled={isCheckingOut}>
              {isCheckingOut ? "Processing..." : "Checkout"} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { role, setRole } = useRole();
  const { totalItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [, setLocation] = useLocation();

  const handleSignOut = () => {
    setRole(null);
    signOut(() => setLocation('/'));
  };

  const isCustomer = role === 'customer';

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={isCustomer ? "/app" : "/admin"} className="flex items-center gap-2">
            <img src={wolfionLogo} alt="Wolfion Logo" className="h-9 w-9 rounded-md object-cover" />
            <span className="font-bold text-xl tracking-tight hidden sm:inline-block">WOLFION</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              className="rounded-full transition-transform hover:scale-110"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
            {isCustomer && (
              <CartDrawer>
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingBag className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </CartDrawer>
            )}
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[380px] p-0 flex flex-col">
                <SheetHeader className="px-5 pt-6 pb-4 border-b text-left">
                  <SheetTitle className="text-base">{user?.fullName || user?.emailAddresses[0]?.emailAddress}</SheetTitle>
                  <p className="text-xs text-muted-foreground capitalize">Role: {role}</p>
                </SheetHeader>

                <nav className="flex-1 overflow-y-auto py-3 px-2">
                  {isCustomer ? (
                    <div className="flex flex-col gap-1">
                      <SheetClose asChild>
                        <Link href="/app">
                          <Button variant="ghost" className="w-full justify-start h-11"><Home className="mr-3 h-4 w-4" /> Shop Home</Button>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button variant="ghost" className="w-full justify-start h-11" onClick={() => setRole('admin')}>
                          <ShieldCheck className="mr-3 h-4 w-4" /> Switch to Admin
                        </Button>
                      </SheetClose>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <SheetClose asChild>
                        <Button variant="ghost" className="w-full justify-start h-11" onClick={() => setLocation('/admin')}>
                          <Home className="mr-3 h-4 w-4" /> Home (Admin Dashboard)
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button variant="ghost" className="w-full justify-start h-11" onClick={() => setLocation('/admin/daily-production')}>
                          <Factory className="mr-3 h-4 w-4" /> Daily Production Entry
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button variant="ghost" className="w-full justify-start h-11" onClick={() => setLocation('/admin/daily-sales')}>
                          <ShoppingCart className="mr-3 h-4 w-4" /> Daily Sales Entry
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button variant="ghost" className="w-full justify-start h-11" onClick={() => setLocation('/admin/profit')}>
                          <TrendingUp className="mr-3 h-4 w-4" /> Profit Dashboard
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button variant="ghost" className="w-full justify-start h-11" onClick={() => setLocation('/admin/inventory-report')}>
                          <FileText className="mr-3 h-4 w-4" /> Inventory Report
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button variant="ghost" className="w-full justify-start h-11" onClick={() => setLocation('/admin/labor-payroll')}>
                          <UsersIcon className="mr-3 h-4 w-4" /> Labor Payroll
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button variant="ghost" className="w-full justify-start h-11" onClick={() => setLocation('/admin/yarn-calculation')}>
                          <Wrench className="mr-3 h-4 w-4" /> Yarn Calculation
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button variant="ghost" className="w-full justify-start h-11" onClick={() => setLocation('/admin/investments')}>
                          <Wallet className="mr-3 h-4 w-4" /> Investment & Investor
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button variant="ghost" className="w-full justify-start h-11" onClick={() => setLocation('/admin/debts')}>
                          <HandCoins className="mr-3 h-4 w-4" /> Debt Management
                        </Button>
                      </SheetClose>
                      <div className="my-2 border-t" />
                      <SheetClose asChild>
                        <Button variant="ghost" className="w-full justify-start h-11" onClick={() => setRole('customer')}>
                          <User className="mr-3 h-4 w-4" /> Switch to Customer
                        </Button>
                      </SheetClose>
                    </div>
                  )}
                </nav>

                <SheetFooter className="border-t p-4 mt-auto">
                  <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
