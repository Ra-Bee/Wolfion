import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk, useUser } from '@clerk/react';
import { Switch, Route, useLocation, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "@/pages/home";
import SignInPage from "@/pages/auth/sign-in";
import SignUpPage from "@/pages/auth/sign-up";
import RoleSelect from "@/pages/role-select";
import Shop from "@/pages/app/shop";
import ProductDetail from "@/pages/app/product";
import CheckoutSuccess from "@/pages/app/checkout-success";
import AdminDashboard from "@/pages/admin/dashboard";
import NotFound from "@/pages/not-found";
import { useRole } from "@/hooks/use-role";
import wolfionLogo from "@assets/Image_20260416024854_43_2_1776709316015.png";

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
    colorPrimary: "hsl(21 100% 50%)", // primary orange
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

// Routes protecting logic
function AppRouter() {
  const { isLoaded, isSignedIn } = useUser();
  const { role } = useRole();
  const [, setLocation] = useLocation();

  // If user hits base path and is signed in, redirect them to role selection or their app
  const HomeRedirect = () => {
    if (!isLoaded) return null;
    if (isSignedIn) {
      if (!role) {
        setLocation("/role-select");
        return null;
      }
      setLocation(role === "admin" ? "/admin" : "/app");
      return null;
    }
    return <Home />;
  };

  // Protect customer app routes
  const AppRouteWrapper = ({ children }: { children: React.ReactNode }) => {
    if (!isLoaded) return null;
    if (!isSignedIn) {
      setLocation("/sign-in");
      return null;
    }
    if (!role) {
      setLocation("/role-select");
      return null;
    }
    if (role === "admin") {
      setLocation("/admin");
      return null;
    }
    return <>{children}</>;
  };

  // Protect admin routes
  const AdminRouteWrapper = ({ children }: { children: React.ReactNode }) => {
    if (!isLoaded) return null;
    if (!isSignedIn) {
      setLocation("/sign-in");
      return null;
    }
    if (!role) {
      setLocation("/role-select");
      return null;
    }
    if (role === "customer") {
      setLocation("/app");
      return null;
    }
    return <>{children}</>;
  };

  // Protect role selection (must be signed in, but maybe already has a role)
  const RoleSelectRoute = () => {
    if (!isLoaded) return null;
    if (!isSignedIn) {
      setLocation("/sign-in");
      return null;
    }
    return <RoleSelect />;
  };

  return (
    <Switch>
      <Route path="/" component={HomeRedirect} />
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      
      <Route path="/role-select" component={RoleSelectRoute} />
      
      <Route path="/app">
        <AppRouteWrapper><Shop /></AppRouteWrapper>
      </Route>
      <Route path="/app/product/:id">
        <AppRouteWrapper><ProductDetail /></AppRouteWrapper>
      </Route>
      <Route path="/app/checkout-success">
        <AppRouteWrapper><CheckoutSuccess /></AppRouteWrapper>
      </Route>
      
      <Route path="/admin">
        <AdminRouteWrapper><AdminDashboard /></AdminRouteWrapper>
      </Route>

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
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: "Sign in to access your account",
          },
        },
        signUp: {
          start: {
            title: "Join Wolfion",
            subtitle: "Get access to member exclusives.",
          },
        },
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
