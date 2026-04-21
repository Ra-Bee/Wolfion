import { SignUp } from "@clerk/react";
import wolfionMark from "@assets/Image_20260421042552_60_2_1776716788241.jpg";

export default function SignUpPage() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <div className="min-h-[100dvh] w-full bg-white text-neutral-900" style={{ colorScheme: "light" }}>
      <main className="mx-auto w-full max-w-[400px] min-h-[100dvh] flex flex-col items-center justify-center px-5 py-6">
        <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-700">
          {/* Logo on top */}
          <div className="h-12 w-12 rounded-xl bg-white overflow-hidden ring-1 ring-neutral-200 shadow-sm">
            <img src={wolfionMark} alt="Wolfion" className="h-full w-full object-cover" />
          </div>

          {/* Brand name below logo */}
          <h1 className="mt-3 text-xl font-bold tracking-[-0.01em] text-black">
            WOLFION
          </h1>

          <h2 className="mt-4 text-base font-semibold tracking-tight text-black">
            Create account
          </h2>
          <p className="mt-1 text-[12px] text-neutral-500">Join Wolfion in under a minute</p>

          {/* Auth form */}
          <div className="mt-3 w-full">
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
                  colorTextSecondary: "#6b7280",
                  colorInputText: "#0a0a0a",
                  colorDanger: "#dc2626",
                  borderRadius: "12px",
                  fontFamily: "inherit",
                },
                elements: {
                  rootBox: "w-full",
                  cardBox: "!shadow-none !border-0",
                  card: "!bg-white !text-neutral-900 !shadow-none !border-0 !p-0",
                  logoBox: "!hidden",
                  logoImage: "!hidden",
                  header: "!hidden",
                  headerTitle: "!hidden",
                  headerSubtitle: "!hidden",
                  socialButtonsBlockButton:
                    "!bg-white !text-neutral-900 !border !border-neutral-200 hover:!bg-neutral-50 h-11 font-medium !shadow-sm",
                  socialButtonsBlockButtonText: "!text-neutral-900 !font-medium",
                  socialButtonsBlockButtonArrow: "!text-neutral-900",
                  dividerLine: "!bg-neutral-200",
                  dividerText: "!text-neutral-500",
                  formFieldLabel: "!text-neutral-800 !font-medium",
                  formFieldInput:
                    "!bg-white !text-neutral-900 !border !border-neutral-200 focus:!border-neutral-900 h-11 placeholder:!text-neutral-400",
                  formButtonPrimary:
                    "!bg-black hover:!bg-neutral-800 !text-white h-11 font-medium tracking-wide !rounded-xl !shadow-sm transition-colors",
                  footer: "!bg-white !border-0",
                  footerAction: "!bg-white",
                  footerActionText: "!text-neutral-600",
                  footerActionLink:
                    "!text-black hover:!text-neutral-700 !font-semibold !no-underline",
                  identityPreview: "!bg-neutral-50 !border-neutral-200",
                  identityPreviewText: "!text-neutral-900",
                  formFieldAction: "!text-neutral-700",
                  formResendCodeLink: "!text-black",
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
