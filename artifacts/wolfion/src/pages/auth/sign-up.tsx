import { SignUp } from "@clerk/react";
import wolfionMark from "@assets/Image_20260421042552_60_2_1776716788241.jpg";

export default function SignUpPage() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-black text-white">
      {/* Subtle radial spotlight */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 35%, rgba(45,45,45,0.6) 0%, rgba(15,15,15,0.9) 50%, #000 85%)",
        }}
      />

      <main className="relative z-10 min-h-[100dvh] flex flex-col items-center justify-center px-5 py-12">
        <div className="w-full max-w-[420px] flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-700">
          {/* Single logo at top */}
          <div className="h-14 w-14 rounded-2xl bg-white shadow-2xl shadow-white/10 overflow-hidden ring-1 ring-white/10">
            <img src={wolfionMark} alt="Wolfion" className="h-full w-full object-cover" />
          </div>

          <h1
            className="mt-6 text-3xl font-semibold tracking-tight text-white"
            style={{ textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}
          >
            Create account
          </h1>
          <p className="mt-2 text-sm text-white/75">Join Wolfion in under a minute</p>

          {/* Auth form — wrapped in light color-scheme to prevent Clerk auto-dark */}
          <div className="mt-8 w-full" style={{ colorScheme: "light" }}>
            <SignUp
              routing="path"
              path={`${basePath}/sign-up`}
              signInUrl={`${basePath}/sign-in`}
              appearance={{
                variables: {
                  colorPrimary: "#000000",
                  colorBackground: "#ffffff",
                  colorInputBackground: "#ffffff",
                  colorText: "#0a0a0a",
                  colorTextSecondary: "#525252",
                  colorInputText: "#0a0a0a",
                  colorDanger: "#dc2626",
                  borderRadius: "12px",
                  fontFamily: "inherit",
                },
                elements: {
                  rootBox: "w-full",
                  cardBox: "shadow-2xl rounded-2xl",
                  card: "!bg-white !text-neutral-900 !shadow-none !border-0 px-6 py-7",
                  logoBox: "!hidden",
                  logoImage: "!hidden",
                  header: "!hidden",
                  headerTitle: "!hidden",
                  headerSubtitle: "!hidden",
                  socialButtonsBlockButton:
                    "!bg-white !text-neutral-900 !border !border-neutral-300 hover:!bg-neutral-50 h-11 font-medium",
                  socialButtonsBlockButtonText: "!text-neutral-900 !font-medium",
                  socialButtonsBlockButtonArrow: "!text-neutral-900",
                  dividerLine: "!bg-neutral-200",
                  dividerText: "!text-neutral-500",
                  formFieldLabel: "!text-neutral-800 !font-medium",
                  formFieldInput:
                    "!bg-white !text-neutral-900 !border !border-neutral-300 focus:!border-neutral-900 h-11",
                  formButtonPrimary:
                    "!bg-neutral-900 hover:!bg-neutral-800 !text-white h-11 font-medium tracking-wide !shadow-none",
                  footer: "!bg-white !border-t !border-neutral-100",
                  footerAction: "!bg-white",
                  footerActionText: "!text-neutral-600",
                  footerActionLink:
                    "!text-neutral-900 hover:!text-neutral-700 !font-semibold !no-underline",
                  identityPreview: "!bg-neutral-50 !border-neutral-200",
                  identityPreviewText: "!text-neutral-900",
                  formFieldAction: "!text-neutral-700",
                  formResendCodeLink: "!text-neutral-900",
                  alertText: "!text-neutral-800",
                },
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
