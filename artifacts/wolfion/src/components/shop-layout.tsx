import { Link, useLocation } from "wouter";
import { useUser, useClerk } from "@clerk/react";
import { useCart } from "@/hooks/use-cart";
import { useRole } from "@/hooks/use-role";
import { ShoppingBag, Menu, User, LogOut, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose, SheetFooter } from "@/components/ui/sheet";
import imgLogoWhite from "@assets/Image_20260416024938_44_2_1776717019706.png";

const NAV = [
  { path: "/shop", label: "Home" },
  { path: "/products", label: "Shop" },
  { path: "/products?category=short", label: "Short" },
  { path: "/products?category=ankle", label: "Ankle" },
  { path: "/products?category=kids", label: "Kids" },
];

export function ShopLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { setRole, isAdmin } = useRole();
  const { totalItems } = useCart();
  const [location, setLocation] = useLocation();

  const handleSignOut = () => {
    setRole(null);
    signOut(() => setLocation("/"));
  };

  const switchToAdmin = () => {
    setRole("admin");
    setLocation("/admin-dashboard");
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50 antialiased font-sans">
      {/* Top header — single horizontal row, no overlapping absolute elements */}
      <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md border-b border-neutral-200/70 dark:border-neutral-800/70">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center gap-3 sm:gap-6">
          {/* Mobile menu trigger */}
          <div className="md:hidden flex-shrink-0">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Menu" data-testid="mobile-menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0 flex flex-col bg-white dark:bg-neutral-950">
                <SheetHeader className="px-6 pt-7 pb-5 text-left border-b border-neutral-200 dark:border-neutral-800">
                  <SheetTitle className="tracking-[0.35em] text-base">WOLFION</SheetTitle>
                </SheetHeader>
                <nav className="flex-1 px-2 py-4">
                  {NAV.map((n) => (
                    <SheetClose asChild key={n.path}>
                      <Link href={n.path}>
                        <Button variant="ghost" className="w-full justify-start h-12 text-base font-light tracking-wide">
                          {n.label}
                        </Button>
                      </Link>
                    </SheetClose>
                  ))}
                  <div className="my-3 border-t border-neutral-200 dark:border-neutral-800" />
                  <SheetClose asChild>
                    <Link href="/cart">
                      <Button variant="ghost" className="w-full justify-start h-12 text-base font-light tracking-wide">
                        <ShoppingBag className="mr-3 h-4 w-4" /> Cart ({totalItems})
                      </Button>
                    </Link>
                  </SheetClose>
                  {isAdmin && (
                    <SheetClose asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-12 text-base font-light tracking-wide"
                        onClick={switchToAdmin}
                        data-testid="switch-to-admin-mobile"
                      >
                        <ShieldCheck className="mr-3 h-4 w-4" /> Switch to Admin Mode
                      </Button>
                    </SheetClose>
                  )}
                </nav>
                <SheetFooter className="border-t border-neutral-200 dark:border-neutral-800 p-4 flex-col gap-2 sm:flex-col">
                  <div className="text-xs text-neutral-500 px-2 truncate">
                    Signed in as {user?.emailAddresses[0]?.emailAddress}
                  </div>
                  <Button variant="outline" className="w-full justify-start" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo (left) */}
          <Link
            href="/shop"
            className="flex items-center gap-2 flex-shrink-0"
            data-testid="link-logo"
          >
            <div className="h-8 w-8 rounded-sm bg-black flex items-center justify-center overflow-hidden">
              <img src={imgLogoWhite} alt="Wolfion" className="h-full w-full object-contain p-0.5" />
            </div>
            <span className="font-semibold tracking-[0.35em] text-sm sm:text-base">WOLFION</span>
          </Link>

          {/* Desktop nav (center, inline with logo) */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 flex-1 min-w-0">
            {NAV.map((n) => {
              const cleanPath = n.path.split("?")[0];
              const active = location === cleanPath;
              return (
                <Link
                  key={n.path}
                  href={n.path}
                  className={`text-[12px] uppercase tracking-[0.18em] font-medium whitespace-nowrap transition-colors ${
                    active
                      ? "text-neutral-900 dark:text-neutral-50"
                      : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Visible Switch to Admin button — admins only */}
            {isAdmin && (
              <Button
                size="sm"
                variant="outline"
                onClick={switchToAdmin}
                className="hidden sm:inline-flex h-8 px-3 text-[11px] uppercase tracking-[0.15em] font-medium border-neutral-300 dark:border-neutral-700"
                data-testid="switch-to-admin"
              >
                <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                Admin Mode
              </Button>
            )}

            <Button variant="ghost" size="icon" aria-label="Search" data-testid="btn-search">
              <Search className="h-5 w-5" />
            </Button>

            {/* Account (desktop only) */}
            <div className="hidden md:block">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Account" data-testid="btn-account">
                    <User className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[320px] p-0 flex flex-col bg-white dark:bg-neutral-950">
                  <SheetHeader className="px-6 pt-7 pb-5 text-left border-b border-neutral-200 dark:border-neutral-800">
                    <SheetTitle className="text-base">Account</SheetTitle>
                    <p className="text-xs text-neutral-500 truncate">
                      {user?.fullName || user?.emailAddresses[0]?.emailAddress}
                    </p>
                  </SheetHeader>
                  <div className="flex-1 px-4 py-4 space-y-1">
                    <SheetClose asChild>
                      <Link href="/cart">
                        <Button variant="ghost" className="w-full justify-start h-11">
                          <ShoppingBag className="mr-3 h-4 w-4" /> My Cart ({totalItems})
                        </Button>
                      </Link>
                    </SheetClose>
                    {isAdmin && (
                      <SheetClose asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-start h-11"
                          onClick={switchToAdmin}
                          data-testid="switch-to-admin-account"
                        >
                          <ShieldCheck className="mr-3 h-4 w-4" /> Switch to Admin Mode
                        </Button>
                      </SheetClose>
                    )}
                  </div>
                  <SheetFooter className="border-t border-neutral-200 dark:border-neutral-800 p-4">
                    <Button variant="outline" className="w-full" onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" /> Sign Out
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative" aria-label="Cart" data-testid="link-cart">
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-[10px] font-bold flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 mt-20">
        <div className="container mx-auto px-5 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div className="col-span-2 md:col-span-1">
            <div className="font-semibold tracking-[0.3em] mb-3">WOLFION</div>
            <p className="text-neutral-500 text-xs leading-relaxed max-w-xs">
              Sharp design. Uncompromising comfort. Crafted for those who know details matter.
            </p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-neutral-500 mb-3">Shop</div>
            <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
              <li><Link href="/products?category=short" className="hover:underline">Short Socks</Link></li>
              <li><Link href="/products?category=ankle" className="hover:underline">Ankle Socks</Link></li>
              <li><Link href="/products?category=kids" className="hover:underline">Kids Socks</Link></li>
              <li><Link href="/products?category=others" className="hover:underline">Others</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-neutral-500 mb-3">Help</div>
            <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
              <li>Shipping</li>
              <li>Returns</li>
              <li>Size Guide</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-neutral-500 mb-3">Newsletter</div>
            <p className="text-xs text-neutral-500 mb-2">Drops, releases, and stories.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 h-9 px-3 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100"
              />
              <Button size="sm" className="h-9 rounded-md bg-neutral-900 dark:bg-white dark:text-neutral-900">→</Button>
            </div>
          </div>
        </div>
        <div className="border-t border-neutral-200 dark:border-neutral-800 py-5 text-center text-xs text-neutral-500">
          © {new Date().getFullYear()} Wolfion. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
