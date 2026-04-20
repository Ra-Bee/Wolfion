import { SignIn } from "@clerk/react";
import wolfionMark from "@assets/Image_20260421042552_60_2_1776716788241.jpg";
import imgTees from "@assets/Image_20260416041311_58_2_1776716983907.png";
import imgPortrait from "@assets/Image_20260416035728_55_2_1776716993092.jpg";
import imgSocks from "@assets/Image_20260416025624_54_2_1776717008197.jpg";
import imgLogoWhite from "@assets/Image_20260416024938_44_2_1776717019706.png";
import imgLogoEmbroidered from "@assets/Gemini_Generated_Image_7q4kiq7q4kiq7q4k_1776717041891.png";

export default function SignInPage() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <div className="min-h-[100dvh] grid grid-cols-1 lg:grid-cols-2 bg-background">
      {/* Brand showcase */}
      <aside className="relative hidden lg:block overflow-hidden bg-black text-white">
        <img
          src={imgPortrait}
          alt="Ultion"
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />

        <div className="relative z-10 flex h-full flex-col justify-between p-10">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-md ring-1 ring-white/20 overflow-hidden flex items-center justify-center">
              <img src={imgLogoWhite} alt="" className="h-full w-full object-contain p-1" />
            </div>
            <span className="text-base font-semibold tracking-[0.22em] whitespace-nowrap">ULTION</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <figure className="col-span-2 aspect-[4/3] rounded-2xl overflow-hidden ring-1 ring-white/10">
              <img src={imgSocks} alt="Ultion collection" className="h-full w-full object-cover" />
            </figure>
            <figure className="aspect-[3/4] rounded-2xl overflow-hidden ring-1 ring-white/10">
              <img src={imgLogoEmbroidered} alt="Embroidered Ultion logo" className="h-full w-full object-cover" />
            </figure>
            <figure className="col-span-3 aspect-[16/7] rounded-2xl overflow-hidden ring-1 ring-white/10">
              <img src={imgTees} alt="Ultion apparel" className="h-full w-full object-cover" />
            </figure>
          </div>

          <div>
            <h2 className="text-3xl font-light leading-tight">
              Sharp design.<br />
              <span className="italic font-serif text-primary">Uncompromising comfort.</span>
            </h2>
            <p className="mt-3 text-sm text-white/60 max-w-md">
              Welcome back to Ultion — sign in to continue shopping the latest pieces from our collection.
            </p>
          </div>
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Mobile hero strip */}
        <div className="lg:hidden absolute top-0 inset-x-0 h-40 overflow-hidden">
          <img src={imgPortrait} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-background" />
        </div>

        <div className="relative z-10 w-full max-w-[400px] lg:mt-0 mt-32">
          <div className="flex flex-col items-center mb-8">
            <div className="h-16 w-16 rounded-2xl bg-black flex items-center justify-center shadow-lg shadow-primary/20 overflow-hidden">
              <img src={wolfionMark} alt="Ultion" className="h-full w-full object-cover" />
            </div>
            <h1 className="mt-4 text-2xl font-semibold">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in to your Ultion account</p>
          </div>
          <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
        </div>
      </main>
    </div>
  );
}
