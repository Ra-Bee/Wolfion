import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { ShopLayout } from "@/components/shop-layout";
import { GlassCard } from "@/components/glass";

type InfoSection = {
  title: string;
  body: string;
};

type InfoPageProps = {
  eyebrow: string;
  title: string;
  introduction: string;
  sections: InfoSection[];
  primaryLink: { href: string; label: string };
  portrait?: {
    src: string;
    alt: string;
  };
  advocacy?: {
    image: string;
    alt: string;
  };
  achievement?: {
    image: string;
    alt: string;
  };
  scholarship?: {
    image: string;
    alt: string;
  };
  fashionScholarship?: {
    image: string;
    alt: string;
  };
  curtinScholarship?: {
    image: string;
    alt: string;
  };
};

function PublicInfoPage({
  eyebrow,
  title,
  introduction,
  sections,
  primaryLink,
  portrait,
  advocacy,
  achievement,
  scholarship,
  fashionScholarship,
  curtinScholarship,
}: InfoPageProps) {
  return (
    <ShopLayout>
      <main className="container mx-auto max-w-4xl px-5 py-16 sm:py-24">
        <header className="max-w-3xl mb-12 sm:mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both">
          <p className="text-[11px] uppercase tracking-[0.5em] text-neutral-500 mb-4">
            {eyebrow}
          </p>
          <h1 className="text-4xl sm:text-6xl font-light tracking-tight leading-[1.05]">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed font-light text-neutral-600 dark:text-neutral-300">
            {introduction}
          </p>
          {portrait ? (
            <img
              src={portrait.src}
              alt={portrait.alt}
              width={180}
              height={180}
              className="mt-8 h-44 w-44 rounded-full object-cover shadow-xl"
            />
          ) : null}
        </header>

        <div className="grid gap-5 sm:grid-cols-2">
          {sections.map((section) => (
            <GlassCard
              key={section.title}
              padding="p-7 sm:p-8"
              rounded="rounded-3xl"
            >
              <section>
                <h2 className="font-serif text-2xl text-neutral-900 dark:text-white">
                  {section.title}
                </h2>
                <p className="mt-4 text-sm sm:text-base leading-relaxed font-light text-neutral-600 dark:text-neutral-300">
                  {section.body}
                </p>
              </section>
            </GlassCard>
          ))}
        </div>

        {advocacy ? (
          <section className="mt-8 grid gap-6 overflow-hidden rounded-3xl border border-black/5 bg-white/60 p-5 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.45)] dark:border-white/10 dark:bg-white/[0.04] sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:p-7">
            <img
              src={advocacy.image}
              alt={advocacy.alt}
              className="h-full min-h-64 w-full rounded-2xl object-cover grayscale"
            />
            <div className="flex flex-col justify-center p-2 sm:p-5">
              <p className="text-[11px] uppercase tracking-[0.4em] text-neutral-500">
                Social advocacy
              </p>
              <h2 className="mt-4 font-serif text-3xl text-neutral-900 dark:text-white">
                Fearless beyond fashion
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300 sm:text-base">
                Beyond fashion and entrepreneurship, Rabby has also used his
                influence for social advocacy. During the 2024 Bangladesh
                student uprising, he used his digital platforms to amplify
                student voices, raise awareness, share key developments, and
                support calls for reform, justice, and accountability.
              </p>
            </div>
          </section>
        ) : null}

        {achievement ? (
          <section className="mt-8 grid gap-6 overflow-hidden rounded-3xl border border-black/5 bg-white/60 p-5 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.45)] dark:border-white/10 dark:bg-white/[0.04] sm:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] sm:p-7">
            <div className="flex flex-col justify-center p-2 sm:p-5">
              <p className="text-[11px] uppercase tracking-[0.4em] text-neutral-500">
                Leadership and achievement
              </p>
              <h2 className="mt-4 font-serif text-3xl text-neutral-900 dark:text-white">
                1st place in East Java
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300 sm:text-base">
                In 2024, under his leadership, Rabby and his team secured 1st
                place while representing Curtin University in the WAEJUC East
                Java Exploration program in Indonesia, involving students from
                Western Australian universities including Curtin University,
                Edith Cowan University, UWA, Murdoch University and the
                University of Notre Dame Australia.
              </p>
            </div>
            <img
              src={achievement.image}
              alt={achievement.alt}
              className="h-full min-h-64 w-full rounded-2xl object-cover"
            />
          </section>
        ) : null}

        {scholarship ? (
          <section className="mt-8 grid gap-6 overflow-hidden rounded-3xl border border-black/5 bg-white/60 p-5 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.45)] dark:border-white/10 dark:bg-white/[0.04] sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:p-7">
            <img
              src={scholarship.image}
              alt={scholarship.alt}
              className="h-full min-h-64 w-full rounded-2xl object-cover"
            />
            <div className="flex flex-col justify-center p-2 sm:p-5">
              <p className="text-[11px] uppercase tracking-[0.4em] text-neutral-500">
                Education journey
              </p>
              <h2 className="mt-4 font-serif text-3xl text-neutral-900 dark:text-white">
                A full scholarship to study in China
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300 sm:text-base">
                In 2018, Rabby received a full scholarship to study at Chengdu
                Textile College (CDTC) in China, now known as Chengdu Qinggong
                Polytechnic University.
              </p>
            </div>
          </section>
        ) : null}

        {fashionScholarship ? (
          <section className="mt-8 grid gap-6 overflow-hidden rounded-3xl border border-black/5 bg-white/60 p-5 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.45)] dark:border-white/10 dark:bg-white/[0.04] sm:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] sm:p-7">
            <div className="flex flex-col justify-center p-2 sm:p-5">
              <p className="text-[11px] uppercase tracking-[0.4em] text-neutral-500">
                Education journey
              </p>
              <h2 className="mt-4 font-serif text-3xl text-neutral-900 dark:text-white">
                Full scholarship in Beijing
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300 sm:text-base">
                In 2021, Rabby secured admission to the Beijing Institute of
                Fashion Technology and was awarded a full scholarship to
                continue his studies there.
              </p>
            </div>
            <img
              src={fashionScholarship.image}
              alt={fashionScholarship.alt}
              className="h-full min-h-64 w-full rounded-2xl object-cover"
            />
          </section>
        ) : null}

        {curtinScholarship ? (
          <section className="mt-8 grid gap-6 overflow-hidden rounded-3xl border border-black/5 bg-white/60 p-5 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.45)] dark:border-white/10 dark:bg-white/[0.04] sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:p-7">
            <img
              src={curtinScholarship.image}
              alt={curtinScholarship.alt}
              className="h-full min-h-64 w-full rounded-2xl object-cover"
            />
            <div className="flex flex-col justify-center p-2 sm:p-5">
              <p className="text-[11px] uppercase tracking-[0.4em] text-neutral-500">
                Education journey
              </p>
              <h2 className="mt-4 font-serif text-3xl text-neutral-900 dark:text-white">
                Curtin University in Australia
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300 sm:text-base">
                In 2023, Rabby was admitted to Curtin University in Australia
                with a 25% scholarship and received credit for four units based
                on his previous studies and experience.
              </p>
            </div>
          </section>
        ) : null}

        <div className="mt-10 flex flex-wrap items-center gap-5">
          <Link
            href={primaryLink.href}
            className="inline-flex h-12 items-center gap-3 rounded-full bg-neutral-900 px-7 text-xs font-medium uppercase tracking-[0.2em] text-white transition-transform active:scale-95 dark:bg-white dark:text-neutral-900"
          >
            {primaryLink.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/about"
            className="text-xs uppercase tracking-[0.2em] text-neutral-500 underline underline-offset-4 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            About WOLFION
          </Link>
          <Link
            href="/founder/md-rabby-bapari"
            className="text-xs uppercase tracking-[0.2em] text-neutral-500 underline underline-offset-4 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            Md Rabby Bapari — Founder
          </Link>
        </div>
      </main>
    </ShopLayout>
  );
}

export function WolfionAppPage() {
  return (
    <PublicInfoPage
      eyebrow="WOLFION App"
      title="WOLFION, wherever you are."
      introduction="The WOLFION app brings the customer store to mobile, making it easy to discover the collection, review product details and keep your shopping experience close at hand."
      sections={[
        {
          title: "Browse the collection",
          body: "Explore WOLFION socks and apparel through the same customer experience available on the public website.",
        },
        {
          title: "Designed for mobile",
          body: "The app is built for a straightforward mobile shopping experience while staying connected to the official WOLFION store.",
        },
      ]}
      primaryLink={{ href: "/shop", label: "Open WOLFION Store" }}
    />
  );
}

export function FounderPage() {
  return (
    <PublicInfoPage
      eyebrow="Founder Profile"
      title="Md Rabby Bapari — Founder of WOLFION"
      introduction="Md Rabby Bapari is a textile engineer, fashion designer and entrepreneur, and the Founder of WOLFION, an Australian fashion and textile brand."
      portrait={{
        src: "/founder/md-rabby-bapari-portrait.jpg",
        alt: "Md Rabby Bapari — Founder of WOLFION",
      }}
      advocacy={{
        image: "/founder/advocacy-2024.jpg",
        alt: "A fearless social advocacy message shown during a public demonstration",
      }}
      achievement={{
        image: "/founder/waejuc-east-java-2024.jpg",
        alt: "Rabby and his Curtin University team celebrating their WAEJUC East Java Exploration achievement",
      }}
      scholarship={{
        image: "/founder/chengdu-textile-college.jpg",
        alt: "Chengdu Qinggong Polytechnic University emblem",
      }}
      fashionScholarship={{
        image: "/founder/beijing-fashion-institute-2021.jpeg",
        alt: "Beijing Institute of Fashion Technology campus",
      }}
      curtinScholarship={{
        image: "/founder/curtin-university-2023.jpg",
        alt: "Curtin University campus in Perth, Australia",
      }}
      sections={[
        {
          title: "Background",
          body: "His background combines textile engineering, fashion design, manufacturing and entrepreneurship, beginning with textile engineering in Bangladesh and fashion studies in China and Australia.",
        },
        {
          title: "Academic foundation",
          body: "In 2012, Rabby secured 1st position in Class 10 and achieved an A+ in the SSC board examination in Bangladesh.",
        },
        {
          title: "Choosing textile engineering",
          body: "In 2014, he secured admission to Dhaka Government Polytechnic Institute in Civil Engineering, competing among approximately 52,000 candidates. At the same time, he earned a place to study Textile Engineering at Barisal Textile Engineering College. He ultimately chose Textile Engineering and continued his studies in that field.",
        },
        {
          title: "Work",
          body: "His work focuses on fashion, textiles, product development and manufacturing, blending engineering precision with creative direction.",
        },
      ]}
      primaryLink={{ href: "/about", label: "About WOLFION" }}
    />
  );
}

export function SocksPage() {
  return (
    <PublicInfoPage
      eyebrow="WOLFION Socks"
      title="Socks engineered for everyday comfort."
      introduction="WOLFION socks combine considered design, textile knowledge and practical comfort across short, ankle, kids and specialty styles."
      sections={[
        {
          title: "Bapari Socks",
          body: "WOLFION's sock collection is shaped by a textile-engineering approach to fit, material, durability and finishing.",
        },
        {
          title: "Styles for daily wear",
          body: "The public collection includes short socks, ankle socks, kids socks and specialty pieces for different uses and seasons.",
        },
      ]}
      primaryLink={{ href: "/products", label: "Shop WOLFION Socks" }}
    />
  );
}

export function ManufacturingPage() {
  return (
    <PublicInfoPage
      eyebrow="Manufacturing"
      title="Textile knowledge behind every product."
      introduction="WOLFION brings textile engineering, fashion design and manufacturing knowledge together to develop products with careful attention to material, construction and use."
      sections={[
        {
          title: "Product development",
          body: "Ideas are considered through the full product journey, from textile selection and construction choices to fit, finishing and presentation.",
        },
        {
          title: "Manufacturing focus",
          body: "WOLFION's approach is informed by practical garment and sock manufacturing experience, with quality and long-term wear in mind.",
        },
      ]}
      primaryLink={{ href: "/services", label: "View Capabilities" }}
    />
  );
}

export function ServicesPage() {
  return (
    <PublicInfoPage
      eyebrow="Capabilities"
      title="Fashion, textile and product expertise."
      introduction="WOLFION's capabilities connect fashion design with textile engineering, product development and manufacturing knowledge."
      sections={[
        {
          title: "Fashion and textiles",
          body: "The brand's work draws on fashion design, textile materials, garment construction and a practical understanding of how products are made.",
        },
        {
          title: "From concept to product",
          body: "WOLFION develops ideas with attention to material, function, manufacturing requirements and the final customer experience.",
        },
      ]}
      primaryLink={{ href: "/contact", label: "Contact WOLFION" }}
    />
  );
}