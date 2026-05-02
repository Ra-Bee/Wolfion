import { useEffect, useRef, lazy, Suspense, type ReactNode } from "react";
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
// ProductDetail and Cart are EAGER imports on purpose: they are the two
// most-visited screens in the shop funnel (every product tap → ProductDetail →
// Cart). Lazy-loading them was producing a visible spinner flash on the first
// tap of a product card on slow / cold-cache connections, which made the tap
// feel like it didn't register (Task #15). Bundling them with the main entry
// trades a tiny bit of initial download for an instant, no-flash navigation.
// The remaining secondary shop routes (about/contact/settings/etc.) stay
// lazy — they're rarely visited and don't sit on the critical path.
import ProductDetail from "@/pages/shop/product";
import Cart from "@/pages/shop/cart";
const Products = lazy(() => import("@/pages/shop/products"));
const CheckoutSuccess = lazy(() => import("@/pages/shop/checkout-success"));
const AboutPage = lazy(() => import("@/pages/shop/about"));
const ContactPage = lazy(() => import("@/pages/shop/contact"));
const SettingsPage = lazy(() => import("@/pages/shop/settings"));
const PrivacyPolicyPage = lazy(() => import("@/pages/shop/privacy"));
const DevPreviewPage = lazy(() => import("@/pages/dev-preview"));

const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const InventoryReportPage = lazy(() => import("@/pages/admin/inventory-report"));
const LaborPayrollPage = lazy(() => import("@/pages/admin/labor-payroll"));
const YarnCalculationPage = lazy(() => import("@/pages/admin/yarn-calculation"));
const DailyProductionPage = lazy(() => import("@/pages/admin/daily-production"));
const DailySalesPage = lazy(() => import("@/pages/admin/daily-sales"));
const ProfitDashboardPage = lazy(() => import("@/pages/admin/profit"));
const InvestmentsPage = lazy(() => import("@/pages/admin/investments"));
const DebtsPage = lazy(() => import("@/pages/admin/debts"));

import NotFound from "@/pages/not-found";

function PageFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-neutral-100 animate-spin" />
    </div>
  );
}
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

// NOTE: These wrappers MUST be defined at module scope (not inside AppRouter).
// If they're inline, every Clerk re-render produces a new component reference,
// which causes React to fully unmount + remount their children — including
// lazy-loaded pages like ProductDetail. That manifests as taps "doing nothing"
// (the Suspense fallback flashes and the click target unmounts mid-navigation).

function HomeRedirect() {
  const { isLoaded, isSignedIn } = useUser();
  const { role, isAdmin } = useRole();
  if (!isLoaded) return null;
  if (isSignedIn) {
    if (!isAdmin) return <Redirect to="/shop" />;
    if (!role) return <Redirect to="/role-select" />;
    return <Redirect to={role === "admin" ? "/admin-dashboard" : "/shop"} />;
  }
  return <Home />;
}

// Customer routes — open to everyone signed in (admins can shop too).
// While Clerk is loading we show the page fallback instead of redirecting,
// so a transient unloaded tick during navigation can't bounce the user to /sign-in.
function ShopRouteWrapper({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  if (!isLoaded) return <PageFallback />;
  if (!isSignedIn) return <Redirect to="/sign-in" />;
  return <Suspense fallback={<PageFallback />}>{children}</Suspense>;
}

// Admin routes — strictly admin emails only.
function AdminRouteWrapper({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  const { isAdmin } = useRole();
  if (!isLoaded) return <PageFallback />;
  if (!isSignedIn) return <Redirect to="/sign-in" />;
  if (!isAdmin) return <Redirect to="/shop" />;
  return <Suspense fallback={<PageFallback />}>{children}</Suspense>;
}

function RoleSelectRoute() {
  const { isLoaded, isSignedIn } = useUser();
  const { isAdmin } = useRole();
  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect to="/sign-in" />;
  // Only admin emails get to choose a mode. Everyone else goes straight to the shop.
  if (!isAdmin) return <Redirect to="/shop" />;
  return <RoleSelect />;
}

function LegacyProductRedirect({ params }: { params: { id: string } }) {
  return <Redirect to={`/product/${params.id}`} />;
}

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={HomeRedirect} />
      <Route path="/dev-preview">
        <Suspense fallback={<PageFallback />}>
          <DevPreviewPage />
        </Suspense>
      </Route>
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route path="/role-select" component={RoleSelectRoute} />

      {/* Public legal pages — must be reachable without sign-in (Play Store requirement) */}
      <Route path="/privacy">
        <Suspense fallback={<PageFallback />}>
          <PrivacyPolicyPage />
        </Suspense>
      </Route>
      <Route path="/privacy-policy"><Redirect to="/privacy" /></Route>

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
      <Route path="/app/product/:id" component={LegacyProductRedirect} />
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
