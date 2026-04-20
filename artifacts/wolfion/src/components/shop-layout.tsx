import { Link, useLocation } from "wouter";
import { useUser, useClerk } from "@clerk/react";
import { useCart } from "@/hooks/use-cart";
import { useRole } from "@/hooks/use-role";
import { ShoppingBag, Menu, User, LogOut, Search, ShieldCheck, ChevronDown, Home as HomeIcon, Store, Mail, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose, SheetFooter } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import imgLogoWhite from "@assets/Image_20260416024938_44_2_1776717019706.png";

const PRIMARY_NAV = [
  { path: "/shop", label: "Home" },
  { path: "/products", label: "Shop" },
];

const VAPORYX_SUBCATS = [
  { path: "/products?category=short", label: "Short Socks" },
  { path: "/products?category=ankle", label: "Ankle Socks" },
  { path: "/products?category=kids", label: "Kids Socks" },
  { path: "/products?category=others", label: "Other Socks" },
];

const COLLECTION_SUBCATS = [
  { path: "/products?collection=mens", label: "Menswear" },
  { path: "/products?collection=womens", label: "Womenswear" },
  { path: "/products?collection=kids", label: "Kidswear" },
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
      {/* Glassmorphic header — single horizontal row */}
      <header className="sticky top-0 z-40 w-full bg-white/70 dark:bg-neutral-950/70 backdrop-blur-xl border-b border-neutral-200/60 dark:border-neutral-800/60 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center gap-3 sm:gap-6">
          {/* Mobile menu trigger */}
          <div className="md:hidden flex-shrink-0">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Menu" data-testid="mobile-menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[320px] p-0 flex flex-col bg-white dark:bg-neutral-950">
                <SheetHeader className="px-6 pt-7 pb-5 text-left border-b border-neutral-200 dark:border-neutral-800">
                  <SheetTitle className="tracking-[0.3em] text-base">WOLFION</SheetTitle>
                </SheetHeader>
                <nav className="flex-1 px-2 py-4 overflow-y-auto">
                  {PRIMARY_NAV.map((n) => (
                    <SheetClose asChild key={n.path}>
                      <Link href={n.path}>
                        <Button variant="ghost" className="w-full justify-start h-12 text-base font-light tracking-wide">
                          {n.label}
                        </Button>
                      </Link>
                    </SheetClose>
                  ))}

                  <Accordion type="multiple" className="w-full">
                    <AccordionItem value="bapari" className="border-none">
                      <AccordionTrigger className="px-4 h-12 text-base font-light tracking-wide hover:no-underline rounded-md">
                        Bapari Socks
                      </AccordionTrigger>
                      <AccordionContent className="pb-1">
                        <div className="flex flex-col">
                          {VAPORYX_SUBCATS.map((s) => (
                            <SheetClose asChild key={s.path}>
                              <Link href={s.path}>
                                <Button variant="ghost" className="w-full justify-start h-11 pl-8 text-sm font-light text-neutral-600 dark:text-neutral-300">
                                  {s.label}
                                </Button>
                              </Link>
                            </SheetClose>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="collection" className="border-none">
                      <AccordionTrigger className="px-4 h-12 text-base font-light tracking-wide hover:no-underline rounded-md">
                        Collection
                      </AccordionTrigger>
                      <AccordionContent className="pb-1">
                        <div className="flex flex-col">
                          {COLLECTION_SUBCATS.map((s) => (
                            <SheetClose asChild key={s.path}>
                              <Link href={s.path}>
                                <Button variant="ghost" className="w-full justify-start h-11 pl-8 text-sm font-light text-neutral-600 dark:text-neutral-300">
                                  {s.label}
                                </Button>
                              </Link>
                            </SheetClose>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

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

          {/* Logo */}
          <Link href="/shop" className="flex items-center gap-2 flex-shrink-0" data-testid="link-logo">
            <div className="h-8 w-8 rounded-md bg-black flex items-center justify-center overflow-hidden shadow-sm">
              <img src={imgLogoWhite} alt="Wolfion" className="h-full w-full object-contain p-0.5" />
            </div>
            <span className="font-semibold tracking-[0.3em] text-sm sm:text-base whitespace-nowrap">WOLFION</span>
          </Link>

          {/* Desktop nav — minimal 4 items, no overlap */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-10 flex-1 min-w-0">
            {PRIMARY_NAV.map((n) => {
              const cleanPath = n.path.split("?")[0];
              const active = location === cleanPath;
              return (
                <Link
                  key={n.path}
                  href={n.path}
                  className={`text-[12px] uppercase tracking-[0.2em] font-medium whitespace-nowrap transition-colors ${
                    active
                      ? "text-neutral-900 dark:text-neutral-50"
                      : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}

            {/* Wolfion dropdown — sock subcategories */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="inline-flex items-center gap-1 text-[12px] uppercase tracking-[0.2em] font-medium whitespace-nowrap text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50 transition-colors outline-none"
                  data-testid="nav-bapari"
                >
                  Bapari Socks
                  <ChevronDown className="h-3 w-3 opacity-70" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                sideOffset={14}
                className="w-56 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border border-neutral-200/70 dark:border-neutral-800/70 shadow-2xl rounded-xl p-2"
              >
                <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.25em] text-neutral-500 font-medium">
                  Socks
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-neutral-200/70 dark:bg-neutral-800/70" />
                {VAPORYX_SUBCATS.map((s) => (
                  <DropdownMenuItem
                    key={s.path}
                    asChild
                    className="text-sm rounded-lg cursor-pointer focus:bg-neutral-100 dark:focus:bg-neutral-800 py-2.5"
                  >
                    <Link href={s.path} data-testid={`vaporyx-${s.label}`}>
                      {s.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Collection dropdown — Menswear / Womenswear / Kidswear */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="inline-flex items-center gap-1 text-[12px] uppercase tracking-[0.2em] font-medium whitespace-nowrap text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50 transition-colors outline-none"
                  data-testid="nav-collection"
                >
                  Collection
                  <ChevronDown className="h-3 w-3 opacity-70" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                sideOffset={14}
                className="w-56 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border border-neutral-200/70 dark:border-neutral-800/70 shadow-2xl rounded-xl p-2"
              >
                <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.25em] text-neutral-500 font-medium">
                  Apparel
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-neutral-200/70 dark:bg-neutral-800/70" />
                {COLLECTION_SUBCATS.map((s) => (
                  <DropdownMenuItem
                    key={s.path}
                    asChild
                    className="text-sm rounded-lg cursor-pointer focus:bg-neutral-100 dark:focus:bg-neutral-800 py-2.5"
                  >
                    <Link href={s.path} data-testid={`collection-${s.label}`}>
                      {s.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {isAdmin && (
              <Button
                size="sm"
                variant="outline"
                onClick={switchToAdmin}
                className="h-8 px-3 text-[11px] uppercase tracking-[0.15em] font-medium border-neutral-300 dark:border-neutral-700 active:scale-95 transition-transform"
                data-testid="switch-mode-toggle"
              >
                <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                Admin Mode
              </Button>
            )}

            <Button variant="ghost" size="icon" aria-label="Search" data-testid="btn-search" className="active:scale-95 transition-transform">
              <Search className="h-5 w-5" />
            </Button>

            <div className="hidden md:block">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Account & Menu" data-testid="btn-account" className="active:scale-95 transition-transform">
                    <User className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[340px] p-0 flex flex-col bg-white dark:bg-neutral-950">
                  <SheetHeader className="px-6 pt-7 pb-5 text-left border-b border-neutral-200 dark:border-neutral-800">
                    <SheetTitle className="text-base">{user?.fullName || "Account"}</SheetTitle>
                    <p className="text-xs text-neutral-500 truncate">
                      {user?.emailAddresses[0]?.emailAddress}
                    </p>
                  </SheetHeader>
                  <nav className="flex-1 px-2 py-3 overflow-y-auto">
                    <SheetClose asChild>
                      <Link href="/shop">
                        <Button variant="ghost" className="w-full justify-start h-11" data-testid="menu-home">
                          <HomeIcon className="mr-3 h-4 w-4" /> Home
                        </Button>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/products">
                        <Button variant="ghost" className="w-full justify-start h-11" data-testid="menu-shop">
                          <Store className="mr-3 h-4 w-4" /> Shop
                        </Button>
                      </Link>
                    </SheetClose>

                    <Accordion type="multiple" className="w-full">
                      <AccordionItem value="bapari-r" className="border-none">
                        <AccordionTrigger className="px-4 h-11 text-sm font-medium hover:no-underline rounded-md" data-testid="menu-bapari">
                          Bapari Socks
                        </AccordionTrigger>
                        <AccordionContent className="pb-1">
                          {VAPORYX_SUBCATS.map((s) => (
                            <SheetClose asChild key={s.path}>
                              <Link href={s.path}>
                                <Button variant="ghost" className="w-full justify-start h-10 pl-10 text-sm font-light text-neutral-600 dark:text-neutral-300">
                                  {s.label}
                                </Button>
                              </Link>
                            </SheetClose>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="collection-r" className="border-none">
                        <AccordionTrigger className="px-4 h-11 text-sm font-medium hover:no-underline rounded-md" data-testid="menu-collection">
                          Collection
                        </AccordionTrigger>
                        <AccordionContent className="pb-1">
                          {COLLECTION_SUBCATS.map((s) => (
                            <SheetClose asChild key={s.path}>
                              <Link href={s.path}>
                                <Button variant="ghost" className="w-full justify-start h-10 pl-10 text-sm font-light text-neutral-600 dark:text-neutral-300">
                                  {s.label}
                                </Button>
                              </Link>
                            </SheetClose>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    <SheetClose asChild>
                      <Link href="/contact">
                        <Button variant="ghost" className="w-full justify-start h-11" data-testid="menu-contact">
                          <Mail className="mr-3 h-4 w-4" /> Contact
                        </Button>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/about">
                        <Button variant="ghost" className="w-full justify-start h-11" data-testid="menu-about">
                          <Info className="mr-3 h-4 w-4" /> About
                        </Button>
                      </Link>
                    </SheetClose>

                    <div className="my-2 border-t border-neutral-200 dark:border-neutral-800" />

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
                  </nav>
                  <SheetFooter className="border-t border-neutral-200 dark:border-neutral-800 p-4">
                    <Button variant="outline" className="w-full" onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" /> Sign Out
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative active:scale-95 transition-transform" aria-label="Cart" data-testid="link-cart">
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
            <div className="text-xs uppercase tracking-widest text-neutral-500 mb-3">Bapari Socks</div>
            <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
              {VAPORYX_SUBCATS.map((s) => (
                <li key={s.path}>
                  <Link href={s.path} className="hover:underline">{s.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-neutral-500 mb-3">Collection</div>
            <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
              {COLLECTION_SUBCATS.map((s) => (
                <li key={s.path}>
                  <Link href={s.path} className="hover:underline">{s.label}</Link>
                </li>
              ))}
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
              <Button size="sm" className="h-9 rounded-md bg-neutral-900 dark:bg-white dark:text-neutral-900 active:scale-95 transition-transform">→</Button>
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
