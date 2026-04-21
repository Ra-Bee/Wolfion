import { ShopLayout } from "@/components/shop-layout";
import { ArrowUpRight } from "lucide-react";
import { CONTACT_LINKS as LINKS } from "@/lib/contact-info";

const FADE = "animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both";

export default function ContactPage() {
  return (
    <ShopLayout>
      <section className="container mx-auto px-5 py-16 sm:py-24 max-w-3xl">
        <div className={`mb-12 sm:mb-16 ${FADE}`}>
          <p className="text-[11px] uppercase tracking-[0.5em] text-neutral-500 mb-4">Contact</p>
          <h1 className="text-4xl sm:text-6xl font-light tracking-tight leading-[1.05]">
            Get in <span className="font-serif italic">touch.</span>
          </h1>
          <p className="mt-5 text-base text-neutral-600 dark:text-neutral-400 font-light leading-relaxed max-w-lg">
            Follow our story and discover the latest pieces from the Wolfion collection.
          </p>
        </div>

        {/* Clean icon rows */}
        <div className="divide-y divide-neutral-200 dark:divide-neutral-800 border-y border-neutral-200 dark:border-neutral-800">
          {LINKS.map((link, i) => {
            const Icon = link.icon;
            const external = !link.href.startsWith("mailto:");
            return (
              <a
                key={link.label}
                href={link.href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className={`group flex items-center gap-4 sm:gap-6 py-5 sm:py-6 hover:pl-2 transition-all duration-300 ${FADE}`}
                style={{ animationDelay: `${i * 80}ms` }}
                data-testid={link.testid}
              >
                <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 flex items-center justify-center flex-shrink-0 group-hover:bg-neutral-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-neutral-900 transition-colors duration-300">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-neutral-500 mb-0.5">
                    {link.label}
                  </p>
                  <p className="text-base sm:text-lg font-medium tracking-tight truncate text-neutral-900 dark:text-neutral-50">
                    {link.handle}
                  </p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-50 group-hover:rotate-12 transition-all duration-300 flex-shrink-0" />
              </a>
            );
          })}
        </div>
      </section>
    </ShopLayout>
  );
}
