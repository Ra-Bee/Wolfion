import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { useUser, useClerk } from "@clerk/react";
import { useCart } from "@/hooks/use-cart";
import { useRole } from "@/hooks/use-role";
import { ShoppingBag, Menu, User, LogOut, Search, ShieldCheck, ChevronDown, Home as HomeIcon, Store, Mail, Info, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose, SheetFooter } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { products, categories } from "@/lib/data";
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
import { CONTACT_LINKS } from "@/lib/contact-info";

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

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.color.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [searchQuery]);

  const matchingCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return categories.filter((c) => c.label.toLowerCase().includes(q) || c.tagline.toLowerCase().includes(q));
  }, [searchQuery]);

  useEffect(() => {
    if (searchOpen) {
      // Small delay so the dialog mounts before focusing
      setTimeout(() => searchInputRef.current?.focus(), 80);
    } else {
      setSearchQuery("");
    }
  }, [searchOpen]);

  // Cmd/Ctrl + K to open search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const goToSearch = (q?: string) => {
    const term = (q ?? searchQuery).trim();
    if (term) setLocation(`/products?q=${encodeURIComponent(term)}`);
    setSearchOpen(false);
  };

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
                  <SheetClose asChild>
                    <Link href="/settings">
                      <Button variant="ghost" className="w-full justify-start h-12 text-base font-light tracking-wide" data-testid="menu-settings-mobile">
                        <Settings className="mr-3 h-4 w-4" /> Settings
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
                className="h-8 px-2 sm:px-3 text-[10px] sm:text-[11px] uppercase tracking-[0.12em] sm:tracking-[0.15em] font-medium border-neutral-300 dark:border-neutral-700 active:scale-95 transition-transform"
                data-testid="switch-mode-toggle"
              >
                <ShieldCheck className="h-3.5 w-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">Admin Mode</span>
                <span className="sm:hidden ml-1">Admin</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              aria-label="Search"
              data-testid="btn-search"
              onClick={() => setSearchOpen(true)}
              className="active:scale-95 transition-transform"
            >
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
                    <SheetClose asChild>
                      <Link href="/settings">
                        <Button variant="ghost" className="w-full justify-start h-11" data-testid="menu-settings">
                          <Settings className="mr-3 h-4 w-4" /> Settings
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

        {/* Social / Contact links */}
        <div className="container mx-auto px-5 pb-8">
          <div className="text-xs uppercase tracking-widest text-neutral-500 mb-3 text-center sm:text-left">Follow us</div>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            {CONTACT_LINKS.map((link) => {
              const Icon = link.icon;
              const external = !link.href.startsWith("mailto:");
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  aria-label={link.label}
                  title={`${link.label} · ${link.handle}`}
                  className="h-10 w-10 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 transition-colors"
                  data-testid={`footer-${link.testid}`}
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>
        <div className="border-t border-neutral-200 dark:border-neutral-800">
          <div className="container mx-auto px-6 py-12 sm:py-14 max-w-3xl">
            <p
              className="text-center text-sm sm:text-base font-light leading-[1.7] tracking-wide text-neutral-600 dark:text-neutral-400"
              data-testid="brand-statement"
            >
              Wolfion stands for <span className="text-neutral-900 dark:text-neutral-100">fair pay, respect, and responsibility</span> to the people who create our products, along with a commitment to <span className="font-serif italic text-neutral-900 dark:text-neutral-100">sustainability</span>—built into every product we create.
            </p>
          </div>
        </div>
        <div className="border-t border-neutral-200 dark:border-neutral-800 py-5 text-center text-xs text-neutral-500">
          © {new Date().getFullYear()} Wolfion. All rights reserved.
        </div>
      </footer>

      {/* Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent
          className="sm:max-w-2xl p-0 gap-0 overflow-hidden top-[12%] translate-y-0 sm:top-[15%]"
        >
          <DialogTitle className="sr-only">Search</DialogTitle>

          {/* Input */}
          <div className="flex items-center gap-3 px-5 h-16 border-b border-neutral-200 dark:border-neutral-800">
            <Search className="h-5 w-5 text-neutral-400 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search products, colors, categories…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") goToSearch(); }}
              className="flex-1 bg-transparent border-0 outline-none text-base placeholder:text-neutral-400 text-neutral-900 dark:text-neutral-50"
              data-testid="search-input"
              autoComplete="off"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 shrink-0"
                aria-label="Clear"
                data-testid="search-clear"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex h-6 px-1.5 items-center text-[10px] font-mono text-neutral-500 bg-neutral-100 dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700">
              ESC
            </kbd>
          </div>

          {/* Body */}
          <div className="max-h-[60vh] overflow-y-auto">
            {!searchQuery.trim() ? (
              <div className="p-5">
                <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-500 mb-3">Browse by category</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/products?category=${c.id}`}
                      onClick={() => setSearchOpen(false)}
                      className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                      data-testid={`search-cat-${c.id}`}
                    >
                      <span className="block text-sm font-medium">{c.label}</span>
                      <span className="block text-xs text-neutral-500 mt-0.5 truncate">{c.tagline}</span>
                    </Link>
                  ))}
                </div>

                <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-500 mt-6 mb-3">Try searching for</p>
                <div className="flex flex-wrap gap-2">
                  {["Crew", "Ankle", "Black", "White", "Kids", "Merino"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setSearchQuery(t)}
                      className="px-3 h-8 rounded-full text-xs border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3">
                {matchingCategories.length > 0 && (
                  <div className="mb-2">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-500 px-3 py-2">Categories</p>
                    {matchingCategories.map((c) => (
                      <Link
                        key={c.id}
                        href={`/products?category=${c.id}`}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                      >
                        <span className="h-9 w-9 rounded-md bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                          <Store className="h-4 w-4 text-neutral-500" />
                        </span>
                        <span className="flex-1">
                          <span className="block text-sm font-medium">{c.label}</span>
                          <span className="block text-xs text-neutral-500">{c.tagline}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                )}

                {searchResults.length > 0 ? (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-500 px-3 py-2">Products</p>
                    {searchResults.map((p) => (
                      <Link
                        key={p.id}
                        href={`/product/${p.id}`}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                        data-testid={`search-result-${p.id}`}
                      >
                        <span className="h-12 w-12 rounded-md overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0">
                          <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-medium truncate">{p.name}</span>
                          <span className="block text-xs text-neutral-500 truncate">{p.color}</span>
                        </span>
                        <span className="text-sm font-medium shrink-0">Tk {p.price.toFixed(2)}</span>
                      </Link>
                    ))}
                    <button
                      onClick={() => goToSearch()}
                      className="w-full mt-2 px-3 py-2.5 rounded-lg text-sm text-center text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                    >
                      See all results for "{searchQuery}"
                    </button>
                  </div>
                ) : matchingCategories.length === 0 ? (
                  <div className="px-5 py-12 text-center">
                    <p className="text-sm text-neutral-500">No matches for "{searchQuery}"</p>
                    <p className="text-xs text-neutral-400 mt-1">Try a different keyword or browse the shop.</p>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
