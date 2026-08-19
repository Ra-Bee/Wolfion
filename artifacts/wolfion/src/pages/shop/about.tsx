import { ShopLayout } from "@/components/shop-layout";
import { GlassCard, GlassPhotoFrame } from "@/components/glass";
import founderImg from "@assets/fghfghj_1785778151920.jpg";
import advocacyImg from "@assets/FB_IMG_1787094684901_1787094692996.jpg";
import achievementImg from "@assets/Screenshot_20260819_072613_Instagram_1787096064568.jpg";
import scholarshipImg from "@assets/A785E5C829B8ADE121E81C477F5_E0208F20_89649_1787096883937.jpg";
import fashionScholarshipImg from "@assets/images_(1)_1787096787561.jpeg";
import curtinScholarshipImg from "@assets/curtin-perth-2728x1364px.jpg.optimal_1787097146894.jpg";

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
          {/* Founder image — 3D glass framed circular portrait */}
          <div className={`${FADE} delay-100 flex flex-col items-center`}>
            <GlassPhotoFrame
              rounded="rounded-full"
              haloOpacity={0.55}
              className="w-[260px] h-[260px] sm:w-[340px] sm:h-[340px] lg:w-[380px] lg:h-[380px]"
              innerClassName="w-full h-full bg-neutral-100 dark:bg-neutral-900"
            >
              <img
                src={founderImg}
                alt="Md Rabby Bapari — Founder of Wolfion"
                className="absolute inset-0 h-full w-full object-cover"
                data-testid="founder-image"
              />
            </GlassPhotoFrame>
            <p className="mt-6 text-xs uppercase tracking-[0.35em] text-neutral-500 text-center">
              Md Rabby Bapari · Founder
            </p>
          </div>

          {/* Founder text — glass card */}
          <div className={`${FADE} delay-200`}>
            <GlassCard padding="p-7 sm:p-9" rounded="rounded-3xl">
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

              <div className="mt-8 pt-6 border-t border-white/30 dark:border-white/10 grid grid-cols-3 gap-4">
                {[
                  { label: "Origin", value: "Bangladesh" },
                  { label: "Studied", value: "China" },
                  { label: "Now", value: "Australia" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 mb-1.5">{s.label}</p>
                    <p className="text-sm font-medium">{s.value}</p>
                  </div>
                ))}
              </div>
              <p className="mt-6">
                <a
                  href="/founder/md-rabby-bapari"
                  className="text-xs uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors underline underline-offset-4"
                  data-testid="about-founder-link"
                >
                  Md Rabby Bapari — Founder
                </a>
              </p>
            </GlassCard>
          </div>
        </div>

        <div className={`mt-8 grid gap-5 sm:grid-cols-2 ${FADE}`}>
          <GlassCard padding="p-7 sm:p-8" rounded="rounded-3xl">
            <section>
              <h2 className="font-serif text-2xl text-neutral-900 dark:text-white">Academic foundation</h2>
              <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300 sm:text-base">
                In 2012, Rabby secured 1st position in Class 10 and achieved an A+ in the SSC board examination in Bangladesh.
              </p>
            </section>
          </GlassCard>
          <GlassCard padding="p-7 sm:p-8" rounded="rounded-3xl">
            <section>
              <h2 className="font-serif text-2xl text-neutral-900 dark:text-white">Choosing textile engineering</h2>
              <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300 sm:text-base">
                In 2014, Rabby secured admission to Dhaka Government Polytechnic Institute in Civil Engineering, competing among approximately 52,000 candidates. At the same time, he earned a place to study Textile Engineering at Barisal Textile Engineering College. He ultimately chose Textile Engineering and continued his studies in that field.
              </p>
            </section>
          </GlassCard>
        </div>

        <section className={`mt-12 grid gap-6 overflow-hidden rounded-3xl border border-black/5 bg-white/60 p-5 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.45)] dark:border-white/10 dark:bg-white/[0.04] sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:p-7 ${FADE}`}>
          <img
            src={advocacyImg}
            alt="A fearless social advocacy message shown during a public demonstration"
            className="h-full min-h-64 w-full rounded-2xl object-cover grayscale"
          />
          <div className="flex flex-col justify-center p-2 sm:p-5">
            <p className="text-[11px] uppercase tracking-[0.4em] text-neutral-500">Social advocacy</p>
            <h2 className="mt-4 font-serif text-3xl text-neutral-900 dark:text-white">Fearless beyond fashion</h2>
            <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300 sm:text-base">
              Beyond fashion and entrepreneurship, Rabby has also used his influence for social advocacy. During the 2024 Bangladesh student uprising, he used his digital platforms to amplify student voices, raise awareness, share key developments, and support calls for reform, justice, and accountability.
            </p>
          </div>
        </section>

        <section className={`mt-8 grid gap-6 overflow-hidden rounded-3xl border border-black/5 bg-white/60 p-5 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.45)] dark:border-white/10 dark:bg-white/[0.04] sm:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] sm:p-7 ${FADE}`}>
          <div className="flex flex-col justify-center p-2 sm:p-5">
            <p className="text-[11px] uppercase tracking-[0.4em] text-neutral-500">Leadership and achievement</p>
            <h2 className="mt-4 font-serif text-3xl text-neutral-900 dark:text-white">1st place in East Java</h2>
            <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300 sm:text-base">
              In 2024, under his leadership, Rabby and his team secured 1st place while representing Curtin University in the WAEJUC East Java Exploration program in Indonesia, involving students from Western Australian universities including Curtin University, Edith Cowan University, UWA, Murdoch University and the University of Notre Dame Australia.
            </p>
          </div>
          <img
            src={achievementImg}
            alt="Rabby and his Curtin University team celebrating their WAEJUC East Java Exploration achievement"
            className="h-full min-h-64 w-full rounded-2xl object-cover"
          />
        </section>

        <section className={`mt-8 grid gap-6 overflow-hidden rounded-3xl border border-black/5 bg-white/60 p-5 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.45)] dark:border-white/10 dark:bg-white/[0.04] sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:p-7 ${FADE}`}>
          <img
            src={scholarshipImg}
            alt="Chengdu Qinggong Polytechnic University emblem"
            className="h-full min-h-64 w-full rounded-2xl object-cover"
          />
          <div className="flex flex-col justify-center p-2 sm:p-5">
            <p className="text-[11px] uppercase tracking-[0.4em] text-neutral-500">Education journey</p>
            <h2 className="mt-4 font-serif text-3xl text-neutral-900 dark:text-white">A full scholarship to study in China</h2>
            <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300 sm:text-base">
              In 2018, Rabby received a full scholarship to study at Chengdu Textile College (CDTC) in China, now known as Chengdu Qinggong Polytechnic University.
            </p>
          </div>
        </section>

        <section className={`mt-8 grid gap-6 overflow-hidden rounded-3xl border border-black/5 bg-white/60 p-5 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.45)] dark:border-white/10 dark:bg-white/[0.04] sm:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] sm:p-7 ${FADE}`}>
          <div className="flex flex-col justify-center p-2 sm:p-5">
            <p className="text-[11px] uppercase tracking-[0.4em] text-neutral-500">Education journey</p>
            <h2 className="mt-4 font-serif text-3xl text-neutral-900 dark:text-white">Full scholarship in Beijing</h2>
            <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300 sm:text-base">
              In 2021, Rabby secured admission to the Beijing Institute of Fashion Technology and was awarded a full scholarship to continue his studies there.
            </p>
          </div>
          <img
            src={fashionScholarshipImg}
            alt="Beijing Institute of Fashion Technology campus"
            className="h-full min-h-64 w-full rounded-2xl object-cover"
          />
        </section>

        <section className={`mt-8 grid gap-6 overflow-hidden rounded-3xl border border-black/5 bg-white/60 p-5 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.45)] dark:border-white/10 dark:bg-white/[0.04] sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:p-7 ${FADE}`}>
          <img
            src={curtinScholarshipImg}
            alt="Curtin University campus in Perth, Australia"
            className="h-full min-h-64 w-full rounded-2xl object-cover"
          />
          <div className="flex flex-col justify-center p-2 sm:p-5">
            <p className="text-[11px] uppercase tracking-[0.4em] text-neutral-500">Education journey</p>
            <h2 className="mt-4 font-serif text-3xl text-neutral-900 dark:text-white">Curtin University in Australia</h2>
            <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300 sm:text-base">
              In 2023, Rabby was admitted to Curtin University in Australia with a 25% scholarship and received credit for four units based on his previous studies and experience.
            </p>
          </div>
        </section>
      </section>
    </ShopLayout>
  );
}
