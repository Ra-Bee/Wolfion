import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useUser, useClerk } from "@clerk/react";
import { ShoppingBag, ShieldCheck, LogOut, ArrowRight } from "lucide-react";
import { useRole } from "@/hooks/use-role";
import wolfionMark from "@assets/Image_20260421084152_72_2_1777147260094.jpg";

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

  const firstName =
    user?.firstName || user?.emailAddresses[0]?.emailAddress?.split("@")[0] || "Admin";

  return (
    <div
      className="min-h-[100dvh] w-full relative overflow-hidden text-white"
      style={{ colorScheme: "dark", background: "#04111A" }}
    >
      {/* Animated background blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-[15%] -left-[15%] h-[60vh] w-[60vh] rounded-full opacity-70 blur-[90px]"
          style={{
            background: "radial-gradient(circle at 30% 30%, #1ABBC4 0%, transparent 70%)",
            animation: "rs-blob1 16s ease-in-out infinite",
          }}
        />
        <div
          className="absolute -bottom-[20%] -right-[15%] h-[65vh] w-[65vh] rounded-full opacity-55 blur-[100px]"
          style={{
            background: "radial-gradient(circle at 60% 60%, #6E3CFB 0%, transparent 70%)",
            animation: "rs-blob2 22s ease-in-out infinite",
          }}
        />
        <div
          className="absolute top-[35%] left-[35%] h-[45vh] w-[45vh] rounded-full opacity-45 blur-[110px]"
          style={{
            background: "radial-gradient(circle at 50% 50%, #D4AF37 0%, transparent 65%)",
            animation: "rs-blob3 26s ease-in-out infinite",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' /%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)",
          }}
        />
      </div>

      <main
        className="relative min-h-[100dvh] grid place-items-center px-3 sm:px-4 py-8 sm:py-10"
        style={{ perspective: "1400px" }}
      >
        <div className="relative w-full max-w-[460px] mx-auto min-w-0">
          {/* Halo behind whole panel */}
          <div
            aria-hidden
            className="absolute -inset-3 rounded-[36px] blur-2xl opacity-50"
            style={{
              background:
                "linear-gradient(135deg, #1ABBC4 0%, #6E3CFB 50%, #D4AF37 100%)",
              animation: "rs-halo 8s ease-in-out infinite alternate",
            }}
          />

          {/* Header card */}
          <div className="relative rounded-[28px] p-[1.5px] mb-4"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(26,187,196,0.35) 35%, rgba(212,175,55,0.35) 70%, rgba(255,255,255,0.15) 100%)",
            }}
          >
            <div
              className="rounded-[27px] px-4 sm:px-6 py-6 sm:py-7 border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] text-center overflow-hidden"
              style={{
                background:
                  "linear-gradient(180deg, rgba(10,18,28,0.85) 0%, rgba(4,17,26,0.92) 100%)",
                backdropFilter: "blur(28px) saturate(140%)",
                WebkitBackdropFilter: "blur(28px) saturate(140%)",
              }}
            >
              <div className="flex flex-col items-center" style={{ transform: "translateZ(40px)" }}>
                <div className="relative h-[64px] w-[64px]">
                  <div
                    aria-hidden
                    className="absolute -inset-3 rounded-3xl blur-2xl opacity-80"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(26,187,196,0.7) 0%, transparent 70%)",
                    }}
                  />
                  <div className="relative h-[64px] w-[64px] rounded-2xl overflow-hidden ring-1 ring-white/25 shadow-[0_15px_40px_-5px_rgba(26,187,196,0.5)]">
                    <img src={wolfionMark} alt="Wolfion" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/30 pointer-events-none" />
                  </div>
                </div>

                <h1
                  className="mt-4 text-[20px] sm:text-[22px] font-bold tracking-[0.22em] sm:tracking-[0.32em]"
                  style={{
                    background:
                      "linear-gradient(135deg, #ffffff 0%, #1ABBC4 55%, #D4AF37 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  WOLFION
                </h1>

                <div className="mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 bg-white/[0.06] border border-white/10 text-[10px] uppercase tracking-[0.22em] text-white/75 backdrop-blur-md">
                  <ShieldCheck className="h-3 w-3 text-amber-300" />
                  Administrator
                </div>

                <h2 className="mt-3 text-[18px] font-semibold tracking-tight text-white">
                  Welcome back, {firstName}
                </h2>
                <p className="mt-1 text-[12px] text-white/60">
                  Choose how you want to continue
                </p>
              </div>
            </div>
          </div>

          {/* Mode cards */}
          <div className="grid gap-3.5">
            <ModeCard
              gradient="linear-gradient(135deg, #1ABBC4 0%, #6E3CFB 100%)"
              icon={<ShieldCheck className="h-6 w-6" />}
              title="Admin Mode"
              subtitle="Manage production, sales, inventory & reports"
              onClick={() => setRole("admin")}
              testId="select-admin-mode"
            />
            <ModeCard
              gradient="linear-gradient(135deg, #D4AF37 0%, #1ABBC4 100%)"
              icon={<ShoppingBag className="h-6 w-6" />}
              title="Customer Mode"
              subtitle="Shop the Wolfion collection"
              onClick={() => setRole("customer")}
              testId="select-customer-mode"
            />
          </div>

          {/* Sign out */}
          <div className="relative mt-6 text-center">
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] text-white/55 hover:text-white transition-colors"
              data-testid="role-sign-out"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>

          <p className="relative mt-4 text-center text-[9px] sm:text-[10px] uppercase tracking-[0.18em] sm:tracking-[0.3em] text-white/35 px-2">
            Wolfion · Certified in Australia &amp; Bangladesh
          </p>
        </div>
      </main>

      <style>{`
        @keyframes rs-blob1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(8%, 12%) scale(1.15); }
        }
        @keyframes rs-blob2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-10%, -8%) scale(1.12); }
        }
        @keyframes rs-blob3 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.45; }
          50% { transform: translate(-6%, 4%) scale(1.2); opacity: 0.6; }
        }
        @keyframes rs-halo {
          0% { opacity: 0.35; filter: blur(40px); }
          100% { opacity: 0.6; filter: blur(56px); }
        }
      `}</style>
    </div>
  );
}

type ModeCardProps = {
  gradient: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
  testId: string;
};

function ModeCard({ gradient, icon, title, subtitle, onClick, testId }: ModeCardProps) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      el.style.setProperty("--rx", `${(y - 0.5) * -4}deg`);
      el.style.setProperty("--ry", `${(x - 0.5) * 6}deg`);
    };
    const onLeave = () => {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <button
      ref={ref}
      onClick={onClick}
      data-testid={testId}
      className="group relative text-left active:scale-[0.99] transition-transform"
      style={{
        transformStyle: "preserve-3d",
        transform: "rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))",
        transition: "transform 240ms ease-out",
      }}
    >
      {/* Glow halo */}
      <div
        aria-hidden
        className="absolute -inset-1 rounded-[22px] blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-500 pointer-events-none"
        style={{ background: gradient }}
      />
      {/* Gradient border */}
      <div className="relative rounded-[20px] p-[1.5px]" style={{ background: gradient }}>
        <div
          className="rounded-[19px] flex items-center gap-3 sm:gap-4 p-3.5 sm:p-5 border border-white/10 overflow-hidden"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,18,28,0.85) 0%, rgba(4,17,26,0.92) 100%)",
            backdropFilter: "blur(20px) saturate(140%)",
            WebkitBackdropFilter: "blur(20px) saturate(140%)",
          }}
        >
          {/* Icon tile */}
          <div
            className="relative h-11 w-11 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5)]"
            style={{ background: gradient }}
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-transparent via-white/10 to-white/25 pointer-events-none" />
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[15px] sm:text-base text-white truncate">{title}</h3>
            <p className="text-[11px] sm:text-[12px] text-white/60 mt-0.5 truncate">{subtitle}</p>
          </div>
          <ArrowRight className="h-5 w-5 text-white/40 shrink-0 transition-all group-hover:text-white group-hover:translate-x-0.5" />
        </div>
      </div>
    </button>
  );
}
