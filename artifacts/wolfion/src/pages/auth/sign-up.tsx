import { SignUp } from "@clerk/react";
import { AuthShell, clerkAppearance } from "@/components/auth-shell";

export default function SignUpPage() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <AuthShell
      eyebrow="Create your account"
      title="Welcome to Wolfion"
      subtitle="Join the world of premium socks in under a minute"
    >
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
        appearance={clerkAppearance}
      />
    </AuthShell>
  );
}
