import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { useUser, useClerk } from "@clerk/react";
import { clearAdminStorage } from "@/lib/wolfion-store";
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
    clearAdminStorage();
    setRole(null);
    signOut(() => setLocation("/"));
  };

  const switchToAdmin = () => {
    setRole("admin");
    setLocation("/admin-dashboard");
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50 antialiased font-sans">
      {/* 3D Glass header — bevel highlight top + deep drop shadow */}
      <header
        className="sticky top-0 z-40 w-full bg-white/75 dark:bg-neutral-950/75 backdrop-blur-2xl border-b border-neutral-200/60 dark:border-neutral-800/60"
        style={{
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.85), inset 0 -1px 0 rgba(0,0,0,0.06), 0 12px 28px -10px rgba(0,0,0,0.18), 0 4px 10px -4px rgba(0,0,0,0.08)",
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center gap-3 sm:gap-6">
          {/* Mobile menu trigger */}
          <div className="md:hidden flex-shrink-0">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Menu" data-testid="mobile-menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[320px] p-0 flex flex-col bg-white/85 dark:bg-neutral-950/90 backdrop-blur-2xl border-r border-white/40 dark:border-white/10"
                style={{
                  boxShadow:
                    "inset -1px 0 0 rgba(255,255,255,0.5), 12px 0 40px -8px rgba(0,0,0,0.35), 4px 0 12px -4px rgba(0,0,0,0.18)",
                }}
              >
                {/* Compact 3D gradient header band */}
                <SheetHeader
                  className="px-4 py-3 text-left relative overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(135deg, #FFF7ED 0%, #FFE4E6 45%, #FAE8FF 100%)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.06), 0 4px 12px -8px rgba(120,80,95,0.25)",
                  }}
                >
                  {/* Soft sunset halo */}
                  <div
                    aria-hidden
                    className="absolute -top-8 -right-8 h-20 w-20 rounded-full blur-2xl opacity-40 pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(circle, #D9899B 0%, #C9A66B 60%, transparent 100%)",
                    }}
                  />
                  <div className="relative flex items-center gap-2.5">
                    <div
                      className="h-7 w-7 rounded-md bg-black flex items-center justify-center overflow-hidden"
                      style={{
                        boxShadow:
                          "inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 10px -3px rgba(0,0,0,0.4)",
                      }}
                    >
                      <img src={imgLogoWhite} alt="Wolfion" className="h-full w-full object-contain p-0.5" />
                    </div>
                    <SheetTitle
                      className="tracking-[0.3em] text-sm text-black dark:text-white font-bold"
                      style={{ textShadow: "0 1px 0 rgba(255,255,255,0.7), 0 1px 3px rgba(0,0,0,0.15)" }}
                    >
                      WOLFION
                    </SheetTitle>
                  </div>
                </SheetHeader>
                <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-3">
                  {PRIMARY_NAV.map((n) => (
                    <SheetClose asChild key={n.path}>
                      <Link href={n.path}>
                        <button className="menu-3d-item w-full">{n.label}</button>
                      </Link>
                    </SheetClose>
                  ))}

                  <Accordion type="multiple" className="w-full space-y-3 pt-1">
                    <AccordionItem value="bapari" className="border-none">
                      <AccordionTrigger className="menu-3d-item w-full hover:no-underline">
                        Bapari Socks
                      </AccordionTrigger>
                      <AccordionContent className="pb-1 pt-3">
                        <div className="flex flex-col gap-2 pl-2">
                          {VAPORYX_SUBCATS.map((s) => (
                            <SheetClose asChild key={s.path}>
                              <Link href={s.path}>
                                <button className="menu-3d-sub w-full">{s.label}</button>
                              </Link>
                            </SheetClose>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="collection" className="border-none">
                      <AccordionTrigger className="menu-3d-item w-full hover:no-underline">
                        Collection
                      </AccordionTrigger>
                      <AccordionContent className="pb-1 pt-3">
                        <div className="flex flex-col gap-2 pl-2">
                          {COLLECTION_SUBCATS.map((s) => (
                            <SheetClose asChild key={s.path}>
                              <Link href={s.path}>
                                <button className="menu-3d-sub w-full">{s.label}</button>
                              </Link>
                            </SheetClose>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <div className="my-3 h-px bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />
                  <SheetClose asChild>
                    <Link href="/cart">
                      <button className="menu-3d-item w-full flex items-center">
                        <ShoppingBag className="mr-2.5 h-4 w-4" /> Cart ({totalItems})
                      </button>
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/settings">
                      <button className="menu-3d-item w-full flex items-center" data-testid="menu-settings-mobile">
                        <Settings className="mr-2.5 h-4 w-4" /> Settings
                      </button>
                    </Link>
                  </SheetClose>
                  {isAdmin && (
                    <SheetClose asChild>
                      <button
                        className="menu-3d-item menu-3d-accent w-full flex items-center"
                        onClick={switchToAdmin}
                        data-testid="switch-to-admin-mobile"
                      >
                        <ShieldCheck className="mr-2.5 h-4 w-4" /> Switch to Admin Mode
                      </button>
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
            <span
              className="font-bold tracking-[0.3em] text-sm sm:text-base whitespace-nowrap text-black dark:text-white"
              style={{
                textShadow:
                  "0 1px 0 rgba(255,255,255,0.7), 0 2px 4px rgba(0,0,0,0.18)",
              }}
            >
              WOLFION
            </span>
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

      <main className="relative flex-1 isolate">
        {/* Ambient atmosphere — sunset glow blobs */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div
            className="absolute -top-[8%] -left-[8%] h-[60vh] w-[60vh] rounded-full opacity-25 blur-[140px] dark:opacity-30"
            style={{ background: "radial-gradient(circle, #D9899B 0%, transparent 70%)" }}
          />
          <div
            className="absolute top-[35%] -right-[12%] h-[55vh] w-[55vh] rounded-full opacity-20 blur-[130px] dark:opacity-25"
            style={{ background: "radial-gradient(circle, #C9A66B 0%, transparent 70%)" }}
          />
          <div
            className="absolute bottom-[5%] left-[30%] h-[50vh] w-[50vh] rounded-full opacity-20 blur-[130px] dark:opacity-25"
            style={{ background: "radial-gradient(circle, #9B85A8 0%, transparent 70%)" }}
          />
        </div>
        {children}
      </main>

      <footer className="relative mt-20 overflow-hidden bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-black">
        {/* Ambient glow blobs */}
        <div
          aria-hidden
          className="absolute top-[-10%] left-[-5%] h-[45vh] w-[45vh] rounded-full opacity-20 blur-[120px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #D9899B 0%, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="absolute top-[20%] right-[-10%] h-[40vh] w-[40vh] rounded-full opacity-20 blur-[110px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #C9A66B 0%, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="absolute bottom-[-10%] left-[40%] h-[40vh] w-[40vh] rounded-full opacity-15 blur-[110px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #9B85A8 0%, transparent 70%)" }}
        />
        {/* Top hairline */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[1px] pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(180,140,150,0.5) 30%, rgba(140,120,160,0.5) 70%, transparent 100%)",
          }}
        />

        <div className="relative container mx-auto px-5 pt-14 pb-10 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-sm">
          {/* Brand block */}
          <div className="col-span-2 md:col-span-1">
            <div
              className="font-semibold tracking-[0.3em] mb-3 text-2xl"
              style={{
                background:
                  "linear-gradient(135deg, #9C5872 0%, #C9A66B 50%, #9B85A8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              WOLFION
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 text-xs leading-relaxed max-w-xs">
              Sharp design. Uncompromising comfort. Crafted for those who know details matter.
            </p>
          </div>

          {/* Bapari Socks links */}
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#9C5872] dark:text-[#E8C5CD] mb-3 font-semibold">Bapari Socks</div>
            <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
              {VAPORYX_SUBCATS.map((s) => (
                <li key={s.path}>
                  <Link href={s.path} className="hover:text-[#9C5872] dark:hover:text-[#E8C5CD] transition-colors">{s.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Collection links */}
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#C9A66B] dark:text-[#E5D4A8] mb-3 font-semibold">Collection</div>
            <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
              {COLLECTION_SUBCATS.map((s) => (
                <li key={s.path}>
                  <Link href={s.path} className="hover:text-[#C9A66B] dark:hover:text-[#E5D4A8] transition-colors">{s.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter — glass card */}
          <div className="col-span-2 md:col-span-1">
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#7B6790] dark:text-[#9B85A8] mb-3 font-semibold">Newsletter</div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">Drops, releases, and stories.</p>
            <div className="relative">
              {/* Glow halo */}
              <div
                aria-hidden
                className="absolute -inset-1 rounded-2xl blur-md opacity-40 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, #D9899B 0%, #C9A66B 50%, #9B85A8 100%)",
                }}
              />
              {/* Gradient ring */}
              <div
                className="relative rounded-2xl p-[1px]"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(180,140,150,0.6) 0%, rgba(190,160,110,0.4) 50%, rgba(140,120,160,0.6) 100%)",
                }}
              >
                <div
                  className="rounded-[15px] p-1.5 flex gap-1.5 border border-white/40 dark:border-white/10"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.65) 100%)",
                    backdropFilter: "blur(20px) saturate(170%)",
                    WebkitBackdropFilter: "blur(20px) saturate(170%)",
                  }}
                >
                  <div className="dark:hidden absolute inset-0 -z-10 rounded-[15px] bg-white/70" />
                  <div
                    className="hidden dark:block absolute inset-0 -z-10 rounded-[15px]"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(15,25,35,0.9) 0%, rgba(8,18,28,0.95) 100%)",
                    }}
                  />
                  <input
                    type="email"
                    placeholder="Your email"
                    className="flex-1 h-9 px-3 text-sm bg-transparent text-neutral-900 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus:outline-none"
                  />
                  <Button
                    size="sm"
                    className="h-9 px-4 rounded-[11px] text-white font-semibold border-0 active:scale-95 transition-transform shadow-[0_6px_20px_-6px_rgba(180,140,150,0.6)]"
                    style={{
                      background:
                        "linear-gradient(135deg, #D9899B 0%, #C9A66B 60%, #9B85A8 100%)",
                    }}
                  >
                    →
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social / Contact links — glass pills with gradient ring */}
        <div className="relative container mx-auto px-5 pb-10">
          <div className="text-[10px] uppercase tracking-[0.3em] text-neutral-600 dark:text-neutral-400 mb-4 text-center sm:text-left font-semibold">Follow us</div>
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
                  className="group relative block"
                  data-testid={`footer-${link.testid}`}
                >
                  {/* Glow halo on hover */}
                  <div
                    aria-hidden
                    className="absolute -inset-1 rounded-full blur-md opacity-0 group-hover:opacity-70 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(135deg, #D9899B 0%, #C9A66B 50%, #9B85A8 100%)",
                    }}
                  />
                  {/* Gradient ring */}
                  <div
                    className="relative rounded-full p-[1px] transition-transform duration-500 group-hover:-translate-y-0.5"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(180,140,150,0.5) 0%, rgba(190,160,110,0.4) 50%, rgba(140,120,160,0.5) 100%)",
                    }}
                  >
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center text-neutral-800 dark:text-neutral-100 border border-white/40 dark:border-white/10"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.6) 100%)",
                        backdropFilter: "blur(14px) saturate(170%)",
                        WebkitBackdropFilter: "blur(14px) saturate(170%)",
                      }}
                    >
                      <div className="dark:hidden absolute inset-0 -z-10 rounded-full bg-white/70" />
                      <div
                        className="hidden dark:block absolute inset-0 -z-10 rounded-full"
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(15,25,35,0.9) 0%, rgba(8,18,28,0.95) 100%)",
                        }}
                      />
                      <Icon className="h-4 w-4 relative" />
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Brand statement — glass card */}
        <div className="relative container mx-auto px-5 pb-10">
          <div className="relative max-w-3xl mx-auto">
            <div
              aria-hidden
              className="absolute -inset-2 rounded-[26px] blur-xl opacity-25 pointer-events-none"
              style={{
                background:
                  "linear-gradient(135deg, #D9899B 0%, #C9A66B 50%, #9B85A8 100%)",
              }}
            />
            <div
              className="relative rounded-[20px] p-[1px]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(180,140,150,0.4) 0%, rgba(190,160,110,0.3) 50%, rgba(140,120,160,0.4) 100%)",
              }}
            >
              <div
                className="relative rounded-[19px] px-6 py-7 sm:px-10 sm:py-9 border border-white/40 dark:border-white/10"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.6) 100%)",
                  backdropFilter: "blur(20px) saturate(140%)",
                  WebkitBackdropFilter: "blur(20px) saturate(140%)",
                }}
              >
                <div className="dark:hidden absolute inset-0 -z-10 rounded-[19px] bg-white/70" />
                <div
                  className="hidden dark:block absolute inset-0 -z-10 rounded-[19px]"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(15,25,35,0.9) 0%, rgba(8,18,28,0.95) 100%)",
                  }}
                />
                <p
                  className="text-center text-sm sm:text-base font-light leading-[1.7] tracking-wide text-neutral-700 dark:text-neutral-300"
                  data-testid="brand-statement"
                >
                  Wolfion stands for{" "}
                  <span className="text-neutral-900 dark:text-neutral-100 font-medium">fair pay, respect, and responsibility</span>{" "}
                  to the people who create our products, along with a commitment to{" "}
                  <span className="font-serif italic text-[#9C5872] dark:text-[#E8C5CD] font-medium">sustainability</span>—built into every product we create.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom hairline + copyright */}
        <div className="relative">
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-[1px] pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(180,140,150,0.4) 30%, rgba(140,120,160,0.4) 70%, transparent 100%)",
            }}
          />
          <div className="py-5 text-center text-xs text-neutral-600 dark:text-neutral-500 space-y-2">
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/privacy"
                className="hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
                data-testid="footer-privacy"
              >
                Privacy Policy
              </Link>
              <span className="text-neutral-400 dark:text-neutral-700">·</span>
              <Link
                href="/contact"
                className="hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
                data-testid="footer-contact-link"
              >
                Contact
              </Link>
            </div>
            <div>
              © {new Date().getFullYear()} <span className="font-semibold tracking-[0.2em] text-neutral-800 dark:text-neutral-300">WOLFION</span>. All rights reserved.
            </div>
          </div>
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
                        <span className="h-12 w-12 rounded-md overflow-hidden bg-white dark:bg-neutral-800 shrink-0 flex items-center justify-center">
                          <img src={p.image} alt={p.name} className="h-full w-full object-contain p-1" />
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
