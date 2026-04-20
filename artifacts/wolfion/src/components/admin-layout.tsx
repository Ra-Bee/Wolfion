import { useLocation } from "wouter";
import { useUser, useClerk } from "@clerk/react";
import { useRole } from "@/hooks/use-role";
import { useTheme } from "@/hooks/use-theme";
import {
  LogOut, Menu, ShieldCheck, Sun, Moon, FileText, Users as UsersIcon,
  Wrench, Factory, ShoppingCart, TrendingUp, Wallet, HandCoins, LayoutDashboard, ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet";
import wolfionLogo from "@assets/Image_20260421042552_60_2_1776716788241.jpg";

type AdminNavItem = { path: string; label: string; icon: React.ComponentType<{ className?: string }> };

const ADMIN_NAV: AdminNavItem[] = [
  { path: "/admin-dashboard", label: "Admin Dashboard", icon: LayoutDashboard },
  { path: "/admin/daily-production", label: "Daily Production Entry", icon: Factory },
  { path: "/admin/daily-sales", label: "Daily Sales Entry", icon: ShoppingCart },
  { path: "/admin/profit", label: "Profit Dashboard", icon: TrendingUp },
  { path: "/admin/inventory-report", label: "Inventory Report", icon: FileText },
  { path: "/admin/labor-payroll", label: "Labor Payroll", icon: UsersIcon },
  { path: "/admin/yarn-calculation", label: "Yarn Calculation", icon: Wrench },
  { path: "/admin/investments", label: "Investment & Investor", icon: Wallet },
  { path: "/admin/debts", label: "Debt Management", icon: HandCoins },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { setRole } = useRole();
  const { theme, toggleTheme } = useTheme();
  const [, setLocation] = useLocation();

  const handleSignOut = () => {
    setRole(null);
    signOut(() => setLocation("/"));
  };

  const switchToCustomer = () => {
    setRole("customer");
    setLocation("/shop");
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      {/* Admin top bar — distinctly utilitarian */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/70">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => setLocation("/admin-dashboard")}
            className="flex items-center gap-2"
            data-testid="link-admin-home"
          >
            <div className="h-8 w-8 rounded-md bg-black overflow-hidden flex items-center justify-center">
              <img src={wolfionLogo} alt="Wolfion" className="h-full w-full object-cover" />
            </div>
            <div className="hidden sm:flex flex-col leading-tight text-left">
              <span className="font-bold text-sm tracking-wide whitespace-nowrap">WOLFION</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Admin Console
              </span>
            </div>
          </button>

          <div className="flex items-center gap-1">
            <span className="hidden md:inline-flex items-center gap-1.5 mr-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold tracking-wider uppercase">
              <ShieldCheck className="h-3 w-3" /> Admin Mode
            </span>
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="rounded-full">
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu" data-testid="button-admin-menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[380px] p-0 flex flex-col">
                <SheetHeader className="px-5 pt-6 pb-4 border-b text-left">
                  <SheetTitle className="text-base">{user?.fullName || user?.emailAddresses[0]?.emailAddress}</SheetTitle>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <ShieldCheck className="h-3 w-3 text-primary" /> Admin Console
                  </p>
                </SheetHeader>

                <nav className="flex-1 overflow-y-auto py-3 px-2">
                  <div className="flex flex-col gap-1">
                    {ADMIN_NAV.map((item) => {
                      const Icon = item.icon;
                      return (
                        <SheetClose asChild key={item.path}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start h-11"
                            onClick={() => setLocation(item.path)}
                            data-testid={`nav-${item.path.replace(/\//g, "-")}`}
                          >
                            <Icon className="mr-3 h-4 w-4" /> {item.label}
                          </Button>
                        </SheetClose>
                      );
                    })}
                    <div className="my-2 border-t" />
                    <SheetClose asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-11"
                        onClick={switchToCustomer}
                        data-testid="switch-to-customer"
                      >
                        <ShoppingBag className="mr-3 h-4 w-4" /> Switch to Customer Mode
                      </Button>
                    </SheetClose>
                  </div>
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

      <main className="flex-1">{children}</main>
    </div>
  );
}
