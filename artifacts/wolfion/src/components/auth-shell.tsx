import { useEffect, useRef } from "react";
import wolfionMark from "@assets/Image_20260421084152_72_2_1777147260094.jpg";

type Props = {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AuthShell({ eyebrow, title, subtitle, children }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
    const onMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rx = (y - 0.5) * -5;
      const ry = (x - 0.5) * 5;
      card.style.setProperty("--rx", `${rx}deg`);
      card.style.setProperty("--ry", `${ry}deg`);
    };
    const onLeave = () => {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    };
    const parent = card.parentElement;
    parent?.addEventListener("mousemove", onMove);
    parent?.addEventListener("mouseleave", onLeave);
    return () => {
      parent?.removeEventListener("mousemove", onMove);
      parent?.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      className="min-h-[100dvh] w-full relative overflow-hidden text-white"
      style={{ colorScheme: "dark", background: "#04111A" }}
    >
      {/* Animated 3D background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-[15%] -left-[15%] h-[60vh] w-[60vh] rounded-full opacity-70 blur-[90px]"
          style={{
            background: "radial-gradient(circle at 30% 30%, #1ABBC4 0%, transparent 70%)",
            animation: "ws-blob1 16s ease-in-out infinite",
          }}
        />
        <div
          className="absolute -bottom-[20%] -right-[15%] h-[65vh] w-[65vh] rounded-full opacity-55 blur-[100px]"
          style={{
            background: "radial-gradient(circle at 60% 60%, #6E3CFB 0%, transparent 70%)",
            animation: "ws-blob2 22s ease-in-out infinite",
          }}
        />
        <div
          className="absolute top-[35%] left-[35%] h-[45vh] w-[45vh] rounded-full opacity-45 blur-[110px]"
          style={{
            background: "radial-gradient(circle at 50% 50%, #D4AF37 0%, transparent 65%)",
            animation: "ws-blob3 26s ease-in-out infinite",
          }}
        />
        {/* Subtle grain */}
        <div
          className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' /%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
        {/* Vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)",
          }}
        />
      </div>

      <main
        className="relative min-h-[100dvh] grid place-items-center px-4 py-8"
        style={{ perspective: "1400px" }}
      >
        <div className="relative w-full max-w-[400px] mx-auto">
          {/* Glow halo */}
          <div
            aria-hidden
            className="absolute -inset-2 rounded-[32px] blur-2xl opacity-50"
            style={{
              background:
                "linear-gradient(135deg, #1ABBC4 0%, #6E3CFB 50%, #D4AF37 100%)",
              animation: "ws-halo 8s ease-in-out infinite alternate",
            }}
          />

          {/* 3D tilt wrapper */}
          <div
            ref={cardRef}
            className="relative"
            style={{
              transformStyle: "preserve-3d",
              transform:
                "rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))",
              transition: "transform 240ms ease-out",
            }}
          >
            {/* Gradient border */}
            <div
              className="rounded-[28px] p-[1.5px]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(26,187,196,0.35) 35%, rgba(212,175,55,0.35) 70%, rgba(255,255,255,0.15) 100%)",
              }}
            >
              {/* Glass card */}
              <div
                className="rounded-[27px] p-6 sm:p-8 border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(10,18,28,0.85) 0%, rgba(4,17,26,0.92) 100%)",
                  backdropFilter: "blur(28px) saturate(140%)",
                  WebkitBackdropFilter: "blur(28px) saturate(140%)",
                }}
              >
                {/* Brand mark with glow */}
                <div
                  className="flex flex-col items-center text-center"
                  style={{ transform: "translateZ(40px)" }}
                >
                  <div className="relative h-[72px] w-[72px]">
                    <div
                      aria-hidden
                      className="absolute -inset-3 rounded-3xl blur-2xl opacity-80"
                      style={{
                        background:
                          "radial-gradient(circle, rgba(26,187,196,0.7) 0%, transparent 70%)",
                      }}
                    />
                    <div
                      className="relative h-[72px] w-[72px] rounded-2xl overflow-hidden ring-1 ring-white/25 shadow-[0_15px_40px_-5px_rgba(26,187,196,0.5)]"
                      style={{ transform: "translateZ(20px)" }}
                    >
                      <img
                        src={wolfionMark}
                        alt="Wolfion"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/30 pointer-events-none" />
                    </div>
                  </div>

                  <h1
                    className="mt-5 text-[24px] font-bold tracking-[0.32em]"
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

                  <div className="mt-5 inline-flex items-center gap-2 rounded-full px-3 py-1 bg-white/[0.06] border border-white/10 text-[10px] uppercase tracking-[0.22em] text-white/75 backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {eyebrow}
                  </div>

                  <h2 className="mt-4 text-[19px] font-semibold tracking-tight text-white">
                    {title}
                  </h2>
                  <p className="mt-1.5 text-[12px] text-white/60">
                    {subtitle}
                  </p>
                </div>

                {/* Auth form slot */}
                <div className="mt-5" style={{ transform: "translateZ(20px)" }}>
                  {children}
                </div>
              </div>
            </div>
          </div>

          {/* Card reflection */}
          <div
            aria-hidden
            className="mt-3 mx-12 h-10 rounded-full blur-2xl opacity-60"
            style={{
              background:
                "linear-gradient(180deg, rgba(26,187,196,0.4) 0%, transparent 100%)",
            }}
          />

          {/* Footer hint */}
          <p className="relative mt-4 text-center text-[10px] uppercase tracking-[0.3em] text-white/35">
            Wolfion · Certified in Australia & Bangladesh
          </p>
        </div>
      </main>

      <style>{`
        @keyframes ws-blob1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(8%, 12%) scale(1.15); }
        }
        @keyframes ws-blob2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-10%, -8%) scale(1.12); }
        }
        @keyframes ws-blob3 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.45; }
          50% { transform: translate(-6%, 4%) scale(1.2); opacity: 0.6; }
        }
        @keyframes ws-halo {
          0% { opacity: 0.35; filter: blur(40px); }
          100% { opacity: 0.6; filter: blur(56px); }
        }
      `}</style>
    </div>
  );
}

export const clerkAppearance = {
  variables: {
    colorPrimary: "#1ABBC4",
    colorBackground: "transparent",
    colorInputBackground: "rgba(255,255,255,0.04)",
    colorText: "#ffffff",
    colorTextSecondary: "rgba(255,255,255,0.65)",
    colorInputText: "#ffffff",
    colorDanger: "#fca5a5",
    borderRadius: "14px",
    fontFamily: "inherit",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "!shadow-none !border-0 !bg-transparent",
    card: "!bg-transparent !text-white !shadow-none !border-0 !p-0",
    logoBox: "!hidden",
    logoImage: "!hidden",
    header: "!hidden",
    headerTitle: "!hidden",
    headerSubtitle: "!hidden",
    socialButtonsBlockButton:
      "!bg-white/[0.06] !text-white !border !border-white/15 hover:!bg-white/10 hover:!border-white/25 !backdrop-blur-md h-11 font-medium !shadow-[0_4px_20px_rgba(0,0,0,0.3)] !transition-all",
    socialButtonsBlockButtonText: "!text-white !font-medium",
    socialButtonsBlockButtonArrow: "!text-white/70",
    dividerLine: "!bg-white/15",
    dividerText: "!text-white/50 !text-[10px] !uppercase !tracking-[0.2em]",
    formFieldLabel: "!text-white/85 !font-medium !text-xs !uppercase !tracking-[0.12em]",
    formFieldInput:
      "!bg-white/[0.04] !text-white !border !border-white/15 hover:!border-white/25 focus:!border-[#1ABBC4] focus:!ring-2 focus:!ring-[#1ABBC4]/30 h-11 placeholder:!text-white/35 !backdrop-blur-md !transition-all",
    formFieldHintText: "!text-white/60",
    formFieldInfoText: "!text-white/60",
    formFieldWarningText: "!text-amber-300",
    formFieldSuccessText: "!text-emerald-300",
    formFieldErrorText: "!text-red-300",
    formButtonPrimary:
      "!bg-gradient-to-r !from-[#1ABBC4] !via-[#16D4DD] !to-[#D4AF37] hover:!brightness-110 !text-black h-12 font-semibold tracking-wide !rounded-xl !shadow-[0_10px_30px_-5px_rgba(26,187,196,0.5)] !transition-all hover:!shadow-[0_15px_40px_-5px_rgba(26,187,196,0.7)] active:!scale-[0.98]",
    footer: "!bg-transparent !border-0",
    footerAction: "!bg-transparent",
    footerActionText: "!text-white/55",
    footerActionLink:
      "!text-[#1ABBC4] hover:!text-[#16D4DD] !font-semibold !no-underline",
    identityPreview:
      "!bg-white/[0.04] !border-white/15 !text-white !backdrop-blur-md",
    identityPreviewText: "!text-white",
    formFieldAction: "!text-[#1ABBC4] hover:!text-[#16D4DD]",
    formResendCodeLink: "!text-[#1ABBC4]",
    alertText: "!text-white/85",
    otpCodeFieldInput:
      "!bg-white/[0.04] !text-white !border !border-white/15 focus:!border-[#1ABBC4] !backdrop-blur-md",
  },
} as const;
