import { UserProfile } from "@clerk/react";
import { ShopLayout } from "@/components/shop-layout";
import { SavedPayments } from "@/components/saved-payments";

export default function SettingsPage() {
  return (
    <ShopLayout>
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-3xl" style={{ colorScheme: "light" }}>
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Account Settings
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Manage your profile, payment methods, and security preferences.
          </p>
        </div>

        <div className="mb-8">
          <SavedPayments />
        </div>

        <div className="rounded-2xl bg-white shadow-sm border border-neutral-200 overflow-hidden">
          <UserProfile
            routing="hash"
            appearance={{
              variables: {
                colorPrimary: "#000000",
                colorBackground: "#ffffff",
                colorInputBackground: "#ffffff",
                colorText: "#0a0a0a",
                colorTextSecondary: "#6b7280",
                colorInputText: "#0a0a0a",
                borderRadius: "12px",
                fontFamily: "inherit",
              },
              elements: {
                rootBox: "w-full",
                cardBox: "!shadow-none !border-0 w-full",
                card: "!bg-white !text-neutral-900 !shadow-none !border-0 w-full",
                navbar: "!bg-neutral-50 !border-r !border-neutral-200",
                navbarButton: "!text-neutral-700 hover:!text-black",
                navbarButtonActive: "!text-black !font-semibold",
                pageScrollBox: "!bg-white",
                profileSectionTitleText: "!text-neutral-900",
                formFieldLabel: "!text-neutral-800 !font-medium",
                formFieldInput:
                  "!bg-white !text-neutral-900 !border !border-neutral-200 focus:!border-neutral-900 placeholder:!text-neutral-400",
                formButtonPrimary:
                  "!bg-black hover:!bg-neutral-800 !text-white !rounded-xl !shadow-sm",
                formButtonReset: "!text-neutral-700",
                badge: "!bg-neutral-100 !text-neutral-700",
              },
            }}
          />
        </div>
      </div>
    </ShopLayout>
  );
}
