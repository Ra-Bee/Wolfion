import { SignUp } from "@clerk/react";
import wolfionMark from "@assets/Image_20260421042552_60_2_1776716788241.jpg";

export default function SignUpPage() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <div
      className="min-h-[100dvh] w-full bg-black text-white grid place-items-center"
      style={{ colorScheme: "dark" }}
    >
      <main className="w-full max-w-[380px] mx-auto -translate-x-5 flex flex-col items-center justify-center px-4 py-6">
        <div className="w-full mx-auto flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-2 duration-700">
          {/* Logo */}
          <div className="h-12 w-12 rounded-xl bg-white overflow-hidden ring-1 ring-white/20 shadow-sm">
            <img src={wolfionMark} alt="Wolfion" className="h-full w-full object-cover" />
          </div>
          {/* Brand name */}
          <h1 className="mt-3 text-xl font-bold tracking-[-0.01em] text-white">
            WOLFION
          </h1>

          <h2 className="mt-4 text-base font-semibold tracking-tight text-white">
            Create account
          </h2>
          <p className="mt-1 text-[12px] text-white/70">Join Wolfion in under a minute</p>

          {/* Auth form */}
          <div className="mt-3 w-full">
            <SignUp
              routing="path"
              path={`${basePath}/sign-up`}
              signInUrl={`${basePath}/sign-in`}
              appearance={{
                variables: {
                  colorPrimary: "#ffffff",
                  colorBackground: "#000000",
                  colorInputBackground: "#0a0a0a",
                  colorText: "#ffffff",
                  colorTextSecondary: "#a3a3a3",
                  colorInputText: "#ffffff",
                  colorDanger: "#f87171",
                  borderRadius: "12px",
                  fontFamily: "inherit",
                },
                elements: {
                  rootBox: "w-full",
                  cardBox: "!shadow-none !border-0 !bg-black",
                  card: "!bg-black !text-white !shadow-none !border-0 !p-0",
                  logoBox: "!hidden",
                  logoImage: "!hidden",
                  header: "!hidden",
                  headerTitle: "!hidden",
                  headerSubtitle: "!hidden",
                  socialButtonsBlockButton:
                    "!bg-white !text-black !border !border-white/20 hover:!bg-neutral-200 h-11 font-medium !shadow-sm",
                  socialButtonsBlockButtonText: "!text-black !font-medium",
                  socialButtonsBlockButtonArrow: "!text-black",
                  dividerLine: "!bg-white/20",
                  dividerText: "!text-white/60",
                  formFieldLabel: "!text-white !font-medium",
                  formFieldInput:
                    "!bg-neutral-900 !text-white !border !border-white focus:!border-white h-11 placeholder:!text-white/50",
                  formFieldHintText: "!text-white",
                  formFieldInfoText: "!text-white",
                  formFieldWarningText: "!text-white",
                  formFieldSuccessText: "!text-white",
                  formFieldErrorText: "!text-red-300",
                  formButtonPrimary:
                    "!bg-white hover:!bg-neutral-200 !text-black h-11 font-medium tracking-wide !rounded-xl !shadow-sm transition-colors",
                  footer: "!bg-black !border-0",
                  footerAction: "!bg-black",
                  footerActionText: "!text-white/70",
                  footerActionLink:
                    "!text-white hover:!text-neutral-300 !font-semibold !no-underline",
                  identityPreview: "!bg-neutral-900 !border-white/20 !text-white",
                  identityPreviewText: "!text-white",
                  formFieldAction: "!text-white/80",
                  formResendCodeLink: "!text-white",
                  alertText: "!text-white",
                },
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
