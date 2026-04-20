import { ShopLayout } from "@/components/shop-layout";
import { Instagram, Globe, ArrowUpRight } from "lucide-react";

const FADE = "animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both";

const LINKS = [
  {
    icon: Instagram,
    label: "Instagram",
    handle: "@wolfion.com.au",
    href: "https://www.instagram.com/wolfion.com.au?igsh=c3FzOTE5Y3o3a2Qz",
    testid: "contact-instagram",
  },
  {
    icon: Globe,
    label: "Website",
    handle: "www.wolfion.com.au",
    href: "https://www.wolfion.com.au",
    testid: "contact-website",
  },
];

export default function ContactPage() {
  return (
    <ShopLayout>
      <section className="container mx-auto px-5 py-16 sm:py-24">
        <div className={`max-w-2xl mb-14 sm:mb-20 ${FADE}`}>
          <p className="text-[11px] uppercase tracking-[0.5em] text-neutral-500 mb-4">Contact</p>
          <h1 className="text-4xl sm:text-6xl font-light tracking-tight leading-[1.05]">
            Get in <span className="font-serif italic">touch.</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
            Follow our story and discover the latest pieces from the Wolfion collection.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 max-w-3xl">
          {LINKS.map((link, i) => {
            const Icon = link.icon;
            return (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group block p-7 sm:p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 hover:border-neutral-900 dark:hover:border-neutral-50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 ${FADE}`}
                style={{ animationDelay: `${i * 120}ms` }}
                data-testid={link.testid}
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="h-12 w-12 rounded-2xl bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-900 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-50 group-hover:rotate-12 transition-all duration-500" />
                </div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-neutral-500 mb-2">{link.label}</p>
                <p className="text-lg font-medium tracking-tight break-all">{link.handle}</p>
              </a>
            );
          })}
        </div>
      </section>
    </ShopLayout>
  );
}
