import { useEffect, useRef } from "react";
import { ClerkProvider, useClerk, useUser } from '@clerk/react';
import { Switch, Route, Redirect, useLocation, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "@/pages/home";
import SignInPage from "@/pages/auth/sign-in";
import SignUpPage from "@/pages/auth/sign-up";
import RoleSelect from "@/pages/role-select";

import ShopHome from "@/pages/shop/home";
import Products from "@/pages/shop/products";
import ProductDetail from "@/pages/shop/product";
import Cart from "@/pages/shop/cart";
import CheckoutSuccess from "@/pages/shop/checkout-success";
import AboutPage from "@/pages/shop/about";
import ContactPage from "@/pages/shop/contact";
import SettingsPage from "@/pages/shop/settings";
import DevPreviewPage from "@/pages/dev-preview";

import AdminDashboard from "@/pages/admin/dashboard";
import InventoryReportPage from "@/pages/admin/inventory-report";
import LaborPayrollPage from "@/pages/admin/labor-payroll";
import YarnCalculationPage from "@/pages/admin/yarn-calculation";
import DailyProductionPage from "@/pages/admin/daily-production";
import DailySalesPage from "@/pages/admin/daily-sales";
import ProfitDashboardPage from "@/pages/admin/profit";
import InvestmentsPage from "@/pages/admin/investments";
import DebtsPage from "@/pages/admin/debts";

import NotFound from "@/pages/not-found";
import { useRole } from "@/hooks/use-role";
import wolfionLogo from "@assets/Image_20260421042552_60_2_1776716788241.jpg";

const queryClient = new QueryClient();

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const clerkAppearance = {
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${wolfionLogo}`,
  },
  variables: {
    colorPrimary: "hsl(21 100% 50%)",
    colorBackground: "hsl(0 0% 100%)",
    colorInputBackground: "hsl(0 0% 98%)",
    colorText: "hsl(222 47% 11%)",
    colorTextSecondary: "hsl(215 16% 47%)",
    colorInputText: "hsl(222 47% 11%)",
    colorNeutral: "hsl(214 32% 91%)",
    borderRadius: "0.75rem",
    fontFamily: "'Inter', sans-serif",
    fontFamilyButtons: "'Inter', sans-serif",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "rounded-2xl w-full overflow-hidden shadow-xl border border-gray-100",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: { color: "hsl(222, 47%, 11%)", fontSize: "1.5rem", fontWeight: "700" },
    headerSubtitle: { color: "hsl(215, 16%, 47%)" },
    socialButtonsBlockButtonText: { color: "hsl(222, 47%, 11%)", fontWeight: "500" },
    formFieldLabel: { color: "hsl(222, 47%, 11%)", fontWeight: "500" },
    footerActionLink: { color: "hsl(21, 100%, 50%)", fontWeight: "600" },
    footerActionText: { color: "hsl(215, 16%, 47%)" },
    dividerText: { color: "hsl(215, 16%, 47%)" },
    formFieldSuccessText: { color: "hsl(142, 76%, 36%)" },
    alertText: { color: "hsl(0, 84%, 60%)" },
    formButtonPrimary: "bg-primary hover:bg-primary/90 text-white font-medium rounded-xl h-10",
    formFieldInput: "rounded-xl border-gray-200 h-10 bg-gray-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all",
    socialButtonsBlockButton: "rounded-xl border border-gray-200 h-10 hover:bg-gray-50 transition-colors",
  },
};

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

function AppRouter() {
  const { isLoaded, isSignedIn } = useUser();
  const { role, isAdmin } = useRole();

  // Landing redirect based on role
  const HomeRedirect = () => {
    if (!isLoaded) return null;
    if (isSignedIn) {
      // Non-admins always go straight to /shop
      if (!isAdmin) return <Redirect to="/shop" />;
      // Admins must pick a mode first
      if (!role) return <Redirect to="/role-select" />;
      return <Redirect to={role === "admin" ? "/admin-dashboard" : "/shop"} />;
    }
    return <Home />;
  };

  // Customer routes — open to everyone signed in (admins can shop too)
  const ShopRouteWrapper = ({ children }: { children: React.ReactNode }) => {
    if (!isLoaded) return null;
    if (!isSignedIn) return <Redirect to="/sign-in" />;
    return <>{children}</>;
  };

  // Admin routes — strictly admin emails only
  const AdminRouteWrapper = ({ children }: { children: React.ReactNode }) => {
    if (!isLoaded) return null;
    if (!isSignedIn) return <Redirect to="/sign-in" />;
    if (!isAdmin) return <Redirect to="/shop" />;
    return <>{children}</>;
  };

  const RoleSelectRoute = () => {
    if (!isLoaded) return null;
    if (!isSignedIn) return <Redirect to="/sign-in" />;
    return <RoleSelect />;
  };

  return (
    <Switch>
      <Route path="/" component={HomeRedirect} />
      <Route path="/dev-preview" component={DevPreviewPage} />
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route path="/role-select" component={RoleSelectRoute} />

      {/* ===== Customer App ===== */}
      <Route path="/shop"><ShopRouteWrapper><ShopHome /></ShopRouteWrapper></Route>
      <Route path="/products"><ShopRouteWrapper><Products /></ShopRouteWrapper></Route>
      <Route path="/product/:id"><ShopRouteWrapper><ProductDetail /></ShopRouteWrapper></Route>
      <Route path="/cart"><ShopRouteWrapper><Cart /></ShopRouteWrapper></Route>
      <Route path="/checkout-success"><ShopRouteWrapper><CheckoutSuccess /></ShopRouteWrapper></Route>
      <Route path="/about"><ShopRouteWrapper><AboutPage /></ShopRouteWrapper></Route>
      <Route path="/contact"><ShopRouteWrapper><ContactPage /></ShopRouteWrapper></Route>
      <Route path="/settings"><ShopRouteWrapper><SettingsPage /></ShopRouteWrapper></Route>

      {/* Legacy customer paths → redirect to new shop */}
      <Route path="/app"><Redirect to="/shop" /></Route>
      <Route path="/app/product/:id">
        {(params) => <Redirect to={`/product/${params.id}`} />}
      </Route>
      <Route path="/app/checkout-success"><Redirect to="/checkout-success" /></Route>

      {/* ===== Admin App ===== */}
      <Route path="/admin-dashboard"><AdminRouteWrapper><AdminDashboard /></AdminRouteWrapper></Route>
      <Route path="/admin"><Redirect to="/admin-dashboard" /></Route>
      <Route path="/admin/inventory-report"><AdminRouteWrapper><InventoryReportPage /></AdminRouteWrapper></Route>
      <Route path="/admin/labor-payroll"><AdminRouteWrapper><LaborPayrollPage /></AdminRouteWrapper></Route>
      <Route path="/admin/yarn-calculation"><AdminRouteWrapper><YarnCalculationPage /></AdminRouteWrapper></Route>
      <Route path="/admin/daily-production"><AdminRouteWrapper><DailyProductionPage /></AdminRouteWrapper></Route>
      <Route path="/admin/daily-sales"><AdminRouteWrapper><DailySalesPage /></AdminRouteWrapper></Route>
      <Route path="/admin/profit"><AdminRouteWrapper><ProfitDashboardPage /></AdminRouteWrapper></Route>
      <Route path="/admin/investments"><AdminRouteWrapper><InvestmentsPage /></AdminRouteWrapper></Route>
      <Route path="/admin/debts"><AdminRouteWrapper><DebtsPage /></AdminRouteWrapper></Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  if (!clerkPubKey) {
    return <div className="p-8 text-red-500">Missing VITE_CLERK_PUBLISHABLE_KEY in .env file</div>;
  }

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      localization={{
        signIn: { start: { title: "Welcome back", subtitle: "Sign in to access your account" } },
        signUp: { start: { title: "Join Wolfion", subtitle: "Get access to member exclusives." } },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <AppRouter />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <TooltipProvider>
      <WouterRouter base={basePath}>
        <ClerkProviderWithRoutes />
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
