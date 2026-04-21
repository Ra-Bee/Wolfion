import { useEffect } from "react";
import { useLocation } from "wouter";
import { useUser, useClerk } from "@clerk/react";
import { ShoppingBag, ShieldCheck, LogOut } from "lucide-react";
import { useRole } from "@/hooks/use-role";
import { Button } from "@/components/ui/button";
import wolfionLogo from "@assets/Image_20260421084152_72_2_1776732289773.jpg";

export default function RoleSelect() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { role, setRole, isAdmin } = useRole();
  const [, setLocation] = useLocation();

  // Auto-route once a mode is chosen, or if user isn't admin (they have no choice)
  useEffect(() => {
    if (!isAdmin) {
      setLocation("/shop");
      return;
    }
    if (role === "customer") setLocation("/shop");
    if (role === "admin") setLocation("/admin-dashboard");
  }, [role, isAdmin, setLocation]);

  const handleSignOut = () => {
    setRole(null);
    signOut(() => setLocation("/"));
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-black overflow-hidden flex items-center justify-center mb-6 shadow-sm">
            <img src={wolfionLogo} alt="Wolfion" className="h-full w-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Select Mode</h1>
          <p className="text-muted-foreground text-sm">
            Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress}. Choose how you want to continue.
          </p>
        </div>

        <div className="grid gap-4 mt-8">
          <button
            onClick={() => setRole("admin")}
            className="flex items-center gap-4 p-5 rounded-2xl border bg-card hover:border-primary hover:shadow-md transition-all text-left group"
            data-testid="select-admin-mode"
          >
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Admin Mode</h3>
              <p className="text-sm text-muted-foreground">Manage production, sales, inventory & reports</p>
            </div>
          </button>

          <button
            onClick={() => setRole("customer")}
            className="flex items-center gap-4 p-5 rounded-2xl border bg-card hover:border-foreground hover:shadow-md transition-all text-left group"
            data-testid="select-customer-mode"
          >
            <div className="h-12 w-12 rounded-full bg-muted text-foreground flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Customer Mode</h3>
              <p className="text-sm text-muted-foreground">Shop the Wolfion collection</p>
            </div>
          </button>
        </div>

        <div className="pt-6 text-center">
          <Button variant="ghost" onClick={handleSignOut} className="text-muted-foreground">
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
