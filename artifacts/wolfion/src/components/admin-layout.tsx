import { useLocation } from "wouter";
import { useUser, useClerk } from "@clerk/react";
import { useRole } from "@/hooks/use-role";
import { useTheme } from "@/hooks/use-theme";
import { clearAdminStorage } from "@/lib/wolfion-store";
import {
  LogOut, Menu, ShieldCheck, Sun, Moon, Monitor, FileText, Users as UsersIcon,
  Wrench, Factory, ShoppingCart, TrendingUp, HandCoins, LayoutDashboard, ShoppingBag,
  Package, Receipt, FolderArchive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { useStableDisclosure } from "@/hooks/use-stable-disclosure";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import wolfionLogo from "@assets/Image_20260421042552_60_2_1776716788241.jpg";

type AdminNavItem = { path: string; label: string; icon: React.ComponentType<{ className?: string }> };

const ADMIN_NAV: AdminNavItem[] = [
  { path: "/admin-dashboard", label: "Admin Dashboard", icon: LayoutDashboard },
  { path: "/admin/products", label: "Manage Products", icon: Package },
  { path: "/admin/daily-production", label: "Daily Production Entry", icon: Factory },
  { path: "/admin/daily-sales", label: "Daily Sales Entry", icon: ShoppingCart },
  { path: "/admin/profit", label: "Profit Dashboard", icon: TrendingUp },
  { path: "/admin/inventory-report", label: "Inventory Report", icon: FileText },
  { path: "/admin/labor-payroll", label: "Labor Payroll", icon: UsersIcon },
  { path: "/admin/yarn-calculation", label: "Yarn Calculation", icon: Wrench },
  { path: "/admin/debts", label: "Debt Management", icon: HandCoins },
  { path: "/admin/cost-history", label: "Cost History", icon: Receipt },
  { path: "/admin/documents", label: "Documents", icon: FolderArchive },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { setRole } = useRole();
  const { preference, toggleTheme } = useTheme();
  const [, setLocation] = useLocation();
  const [adminMenuOpen, setAdminMenuOpen] = useStableDisclosure();
  // Bridge Clerk -> Firebase once at the layout level. Every admin page
  // gets cloud sync as soon as it mounts, with no per-page setup.
  const { cloudStatus, cloudError } = useFirebaseAuth();

  const handleSignOut = () => {
    clearAdminStorage();
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
        <div className="container mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2 max-w-full overflow-hidden">
          <button
            onClick={() => setLocation("/admin-dashboard")}
            className="flex items-center gap-2 min-w-0 flex-shrink"
            data-testid="link-admin-home"
          >
            <div className="h-8 w-8 rounded-md bg-black overflow-hidden flex items-center justify-center flex-shrink-0">
              <img src={wolfionLogo} alt="Wolfion" className="h-full w-full object-cover" />
            </div>
            <div className="flex items-baseline gap-1.5 sm:gap-2 leading-none min-w-0">
              <span className="font-bold text-sm sm:text-base tracking-wide whitespace-nowrap">WOLFION</span>
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.25em] text-muted-foreground/70 font-light whitespace-nowrap">
                Admin
              </span>
            </div>
          </button>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={switchToCustomer}
              className="h-8 px-2 sm:px-3 text-[10px] sm:text-[11px] uppercase tracking-[0.12em] sm:tracking-[0.15em] font-medium active:scale-95 transition-transform"
              data-testid="switch-mode-toggle"
            >
              <ShoppingBag className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Customer Mode</span>
              <span className="sm:hidden ml-1">Customer</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={`Theme: ${preference}. Click to change`}
              title={`Theme: ${preference[0].toUpperCase() + preference.slice(1)} (tap to cycle Light → Dark → System)`}
              className="rounded-full h-9 w-9"
            >
              {preference === "light" ? (
                <Sun className="h-5 w-5" />
              ) : preference === "dark" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Monitor className="h-5 w-5" />
              )}
            </Button>

            <Sheet open={adminMenuOpen} onOpenChange={setAdminMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open menu"
                  className="h-9 w-9"
                  data-testid="button-admin-menu"
                  style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[380px] p-0 flex flex-col">
                <SheetHeader className="px-5 pt-6 pb-4 border-b text-left">
                  <SheetTitle className="text-base">{user?.fullName || user?.emailAddresses[0]?.emailAddress}</SheetTitle>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <ShieldCheck className="h-3 w-3 text-primary" /> Admin
                  </p>
                  <p
                    className="text-[10px] mt-1 flex items-center gap-1.5"
                    data-testid="cloud-status"
                  >
                    <span
                      className={
                        "inline-block h-1.5 w-1.5 rounded-full " +
                        (cloudStatus === "ready"
                          ? "bg-emerald-500"
                          : cloudStatus === "error"
                            ? "bg-red-500"
                            : "bg-amber-500 animate-pulse")
                      }
                    />
                    <span className="text-muted-foreground">
                      {cloudStatus === "ready"
                        ? "Cloud sync on"
                        : cloudStatus === "error"
                          ? `Cloud offline${cloudError ? `: ${cloudError}` : ""}`
                          : cloudStatus === "not-admin"
                            ? "Cloud disabled"
                            : "Connecting cloud…"}
                    </span>
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
