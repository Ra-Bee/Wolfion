import { SignUp } from "@clerk/react";
import wolfionLogo from "@assets/Rabby_1776709654876.jpg";

export default function SignUpPage() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  // To update login providers, app branding, or OAuth settings use the Auth
  // pane in the workspace toolbar. More information can be found in the Replit docs.
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
      
      <div className="relative z-10 w-full max-w-[400px]">
        <div className="flex justify-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-black flex items-center justify-center shadow-lg shadow-primary/20 overflow-hidden">
            <img src={wolfionLogo} alt="Wolfion" className="h-full w-full object-cover" />
          </div>
        </div>
        <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
      </div>
    </div>
  );
}
