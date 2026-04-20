import { useEffect } from "react";
import { useLocation } from "wouter";
import { useUser, useClerk } from "@clerk/react";
import { ShoppingBag, ShieldCheck, LogOut } from "lucide-react";
import { useRole } from "@/hooks/use-role";
import { Button } from "@/components/ui/button";

export default function RoleSelect() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { role, setRole } = useRole();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // If role is already selected, redirect to the appropriate app
    if (role === "customer") setLocation("/app");
    if (role === "admin") setLocation("/admin");
  }, [role, setLocation]);

  const selectRole = (selectedRole: "customer" | "admin") => {
    setRole(selectedRole);
  };

  const handleSignOut = () => {
    signOut(() => setLocation("/"));
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-6 shadow-sm">
            <img src={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/logo.svg`} alt="Wolfion" className="h-8 w-8 brightness-0 invert" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome, {user?.firstName || "there"}</h1>
          <p className="text-muted-foreground">Please select an experience to continue.</p>
        </div>

        <div className="grid gap-4 mt-8">
          <button 
            onClick={() => selectRole("customer")}
            className="flex items-center gap-4 p-4 rounded-2xl border bg-card hover:border-primary hover:shadow-md transition-all text-left group"
          >
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Shop Wolfion</h3>
              <p className="text-sm text-muted-foreground">Browse products and checkout</p>
            </div>
          </button>

          <button 
            onClick={() => selectRole("admin")}
            className="flex items-center gap-4 p-4 rounded-2xl border bg-card hover:border-foreground hover:shadow-md transition-all text-left group"
          >
            <div className="h-12 w-12 rounded-full bg-muted text-foreground flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Admin Dashboard</h3>
              <p className="text-sm text-muted-foreground">Manage production, sales & inventory</p>
            </div>
          </button>
        </div>

        <div className="pt-8 text-center">
          <Button variant="ghost" onClick={handleSignOut} className="text-muted-foreground">
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
