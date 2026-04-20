import { ShopLayout } from "@/components/shop-layout";
import founderImg from "@assets/wd_1776721500513.jpg";

const FADE = "animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both";

export default function AboutPage() {
  return (
    <ShopLayout>
      <section className="container mx-auto px-5 py-16 sm:py-24">
        <div className={`max-w-2xl mb-14 sm:mb-20 ${FADE}`}>
          <p className="text-[11px] uppercase tracking-[0.5em] text-neutral-500 mb-4">About</p>
          <h1 className="text-4xl sm:text-6xl font-light tracking-tight leading-[1.05]">
            About the <span className="font-serif italic">Founder</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Founder image — circular */}
          <div className={`${FADE} delay-100 flex flex-col items-center`}>
            <div className="relative w-[260px] h-[260px] sm:w-[340px] sm:h-[340px] lg:w-[380px] lg:h-[380px] rounded-full overflow-hidden bg-neutral-100 dark:bg-neutral-900 shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
              <img
                src={founderImg}
                alt="Md Rabby Bapari — Founder of Wolfion"
                className="absolute inset-0 h-full w-full object-cover"
                data-testid="founder-image"
              />
            </div>
            <p className="mt-6 text-xs uppercase tracking-[0.35em] text-neutral-500 text-center">
              Md Rabby Bapari · Founder
            </p>
          </div>

          {/* Founder text */}
          <div className={`${FADE} delay-200`}>
            <p className="text-[11px] uppercase tracking-[0.4em] text-neutral-500 mb-5">The story</p>
            <div className="space-y-6 text-base sm:text-lg leading-[1.75] font-light text-neutral-800 dark:text-neutral-200">
              <p>
                <span className="font-medium text-neutral-900 dark:text-neutral-50">Md Rabby Bapari</span> is the founder of{" "}
                <span className="font-medium text-neutral-900 dark:text-neutral-50">Wolfion</span>, a fashion brand rooted in
                textile engineering, global fashion education, and sustainable design. Beginning his journey in Bangladesh
                as a textile engineer, he developed strong technical expertise in fabrics and garment construction.
              </p>
              <p>
                He later studied fashion design in China and is currently pursuing Fashion Design at{" "}
                <span className="font-medium text-neutral-900 dark:text-neutral-50">Curtin University</span> in Australia.
                His work blends engineering precision with creative vision, shaping Wolfion into a brand focused on{" "}
                <span className="font-serif italic">ethical, innovative, and long-lasting fashion.</span>
              </p>
            </div>

            <div className="mt-10 pt-8 border-t border-neutral-200 dark:border-neutral-800 grid grid-cols-3 gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 mb-1.5">Origin</p>
                <p className="text-sm font-medium">Bangladesh</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 mb-1.5">Studied</p>
                <p className="text-sm font-medium">China</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 mb-1.5">Now</p>
                <p className="text-sm font-medium">Australia</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </ShopLayout>
  );
}
