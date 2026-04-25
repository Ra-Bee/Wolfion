import { ShopLayout } from "@/components/shop-layout";
import { GlassCard } from "@/components/glass";
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

        {/* Glass card list */}
        <GlassCard padding="p-3 sm:p-4" rounded="rounded-3xl">
          <ul className="divide-y divide-white/30 dark:divide-white/10">
            {LINKS.map((link, i) => {
              const Icon = link.icon;
              const external = !link.href.startsWith("mailto:");
              return (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    className={`group relative flex items-center gap-4 sm:gap-6 px-3 sm:px-4 py-4 sm:py-5 rounded-2xl transition-all duration-300 hover:bg-white/30 dark:hover:bg-white/5 hover:pl-5 ${FADE}`}
                    style={{ animationDelay: `${i * 80}ms` }}
                    data-testid={link.testid}
                  >
                    {/* Glass icon disc */}
                    <div
                      className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-full p-[1.5px] flex-shrink-0"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(251,113,133,0.6) 0%, rgba(245,158,11,0.45) 50%, rgba(147,51,234,0.6) 100%)",
                      }}
                    >
                      <div
                        className="h-full w-full rounded-full flex items-center justify-center text-neutral-900 dark:text-neutral-50 border border-white/40 dark:border-white/10"
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.1) 100%)",
                          backdropFilter: "blur(14px) saturate(170%)",
                          WebkitBackdropFilter: "blur(14px) saturate(170%)",
                          boxShadow:
                            "inset 0 1px 0 rgba(255,255,255,0.55), 0 6px 16px -8px rgba(15,23,42,0.30)",
                        }}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
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
                </li>
              );
            })}
          </ul>
        </GlassCard>
      </section>
    </ShopLayout>
  );
}
