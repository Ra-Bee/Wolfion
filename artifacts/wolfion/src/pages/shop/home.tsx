import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { ShopLayout } from "@/components/shop-layout";
import { categories } from "@/lib/data";
import imgHeroMobileFearless from "@assets/optimized/wolfion_hero_mobile_fearless.jpg";
import imgHeroLandscape from "@assets/optimized/wolfion_hero_fearless_full_v2.jpg";
import imgSocks from "@assets/optimized/wolfion_socks.jpg";
import imgEditorialCover from "@assets/optimized/wolfion_editorial_cover.jpg";
import imgEditorialLook1 from "@assets/optimized/wolfion_editorial_look1.jpg";
import imgEditorialLook2 from "@assets/optimized/wolfion_editorial_look2.jpg";
import imgEditorialLook3 from "@assets/optimized/wolfion_editorial_look3_cover.jpeg";
import imgEditorialDetail from "@assets/optimized/wolfion_editorial_detail.jpg";
import vidEditorial from "@assets/optimized/wolfion_editorial_film_hd.mp4";
import imgDigitalFashion from "@assets/optimized/wolfion_digitalfashion_full_v8.jpg";
import imgFilmPoster from "@assets/optimized/wolfion_film_poster.jpg";
import imgMagazineCutout from "@assets/optimized/wolfion_ourstory_full_v7.jpg";
import imgBapariSocks from "@assets/optimized/wolfion_sockshero_dark.jpg";

const FADE = "animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both";

export default function ShopHome() {
  const sockCats = categories;
  const heroFrameRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLImageElement>(null);
  const craftFrameRef = useRef<HTMLDivElement>(null);
  const craftImgRef = useRef<HTMLImageElement>(null);

  // Dev-only: auto-scroll to a section for screenshot previews.
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const target = new URLSearchParams(window.location.search).get("__scroll");
    if (!target) return;
    const t = setTimeout(() => {
      document.getElementById(target)?.scrollIntoView();
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  // Scroll to #hash section (e.g. /shop#bapari-socks from the header nav)
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const t = setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
    }, 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const frame = heroFrameRef.current;
    const img = heroImgRef.current;
    if (!frame) return;
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = frame.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const rx = (y - 0.5) * -6;
        const ry = (x - 0.5) * 6;
        frame.style.setProperty("--rx", `${rx}deg`);
        frame.style.setProperty("--ry", `${ry}deg`);
        if (img) {
          img.style.transform = `translate3d(${(x - 0.5) * -14}px, ${(y - 0.5) * -10}px, 0) scale(1.08)`;
        }
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      frame.style.setProperty("--rx", "0deg");
      frame.style.setProperty("--ry", "0deg");
      if (img) img.style.transform = "translate3d(0,0,0) scale(1.05)";
    };
    const parent = frame.parentElement;
    parent?.addEventListener("mousemove", onMove);
    parent?.addEventListener("mouseleave", onLeave);
    return () => {
      parent?.removeEventListener("mousemove", onMove);
      parent?.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  // === Craft section: interactive 3D tilt on touch + mouse ===
  // The previous version listened on the parent with passive
  // pointermove, but on phones a finger drag is treated as a page
  // scroll, so pointermove never fired and the tilt never applied.
  // Fix: listen directly on the frame, set touch-action:none on it
  // (configured inline in JSX), capture the pointer on pointerdown,
  // and track pointermove while captured. This way a drag inside
  // the photo tilts it; a drag anywhere else still scrolls the page.
  useEffect(() => {
    const frame = craftFrameRef.current;
    const img = craftImgRef.current;
    if (!frame) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Touch screens: never capture the pointer — grabbing the finger inside
    // this full-width frame blocks vertical page scrolling in the middle of
    // the screen (user report). The tilt stays as a mouse-only effect.
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

    let raf = 0;
    let resetTimer: ReturnType<typeof setTimeout> | null = null;
    let active = false;

    const apply = (clientX: number, clientY: number) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = frame.getBoundingClientRect();
        const x = (clientX - rect.left) / rect.width;
        const y = (clientY - rect.top) / rect.height;
        const cx = Math.max(0, Math.min(1, x));
        const cy = Math.max(0, Math.min(1, y));
        const rx = (cy - 0.5) * -10;
        const ry = (cx - 0.5) * 10;
        frame.style.setProperty("--crx", `${rx}deg`);
        frame.style.setProperty("--cry", `${ry}deg`);
        if (img) {
          img.style.transform = `translate3d(${(cx - 0.5) * -18}px, ${(cy - 0.5) * -14}px, 0) scale(1.06)`;
        }
      });
    };

    const reset = () => {
      cancelAnimationFrame(raf);
      frame.style.setProperty("--crx", "0deg");
      frame.style.setProperty("--cry", "0deg");
      if (img) img.style.transform = "translate3d(0,0,0) scale(1)";
    };

    const onPointerDown = (e: PointerEvent) => {
      active = true;
      if (resetTimer) {
        clearTimeout(resetTimer);
        resetTimer = null;
      }
      try {
        frame.setPointerCapture(e.pointerId);
      } catch {
        /* ignore — capture not supported */
      }
      apply(e.clientX, e.clientY);
    };
    const onPointerMove = (e: PointerEvent) => {
      // Mouse: tilt on hover (no button required).
      // Touch / pen: only tilt while finger is down.
      if (e.pointerType !== "mouse" && !active) return;
      apply(e.clientX, e.clientY);
    };
    const onPointerUp = (e: PointerEvent) => {
      active = false;
      try {
        frame.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      // Small ease-back delay so the tilt doesn't snap back instantly.
      resetTimer = setTimeout(reset, 220);
    };
    const onPointerLeave = (e: PointerEvent) => {
      if (e.pointerType === "mouse") reset();
    };
    const onPointerCancel = () => {
      active = false;
      reset();
    };

    frame.addEventListener("pointerdown", onPointerDown);
    frame.addEventListener("pointermove", onPointerMove);
    frame.addEventListener("pointerup", onPointerUp);
    frame.addEventListener("pointerleave", onPointerLeave);
    frame.addEventListener("pointercancel", onPointerCancel);
    return () => {
      frame.removeEventListener("pointerdown", onPointerDown);
      frame.removeEventListener("pointermove", onPointerMove);
      frame.removeEventListener("pointerup", onPointerUp);
      frame.removeEventListener("pointerleave", onPointerLeave);
      frame.removeEventListener("pointercancel", onPointerCancel);
      cancelAnimationFrame(raf);
      if (resetTimer) clearTimeout(resetTimer);
    };
  }, []);

  // === Generic touch/mouse tilt for product/collection/box cards ===
  // Finds every element marked with [data-tilt-card] (sock category
  // cards, Everyday Essentials cards, Wolfion Box cards) and applies
  // the same press-to-tilt + spring-back interaction as the Craft
  // frame. Cards keep their existing hover transforms; the tilt is
  // applied as an inline transform on the card root.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    // Touch screens: skip entirely — pointer capture on cards that cover
    // most of the screen blocks vertical finger scrolling. Mouse-only.
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
    const cards = Array.from(
      document.querySelectorAll<HTMLElement>("[data-tilt-card]"),
    );
    if (cards.length === 0) return;

    const cleanups: Array<() => void> = [];

    cards.forEach((card) => {
      let raf = 0;
      let active = false;
      let resetTimer: ReturnType<typeof setTimeout> | null = null;

      const apply = (clientX: number, clientY: number) => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = (clientX - rect.left) / rect.width;
          const y = (clientY - rect.top) / rect.height;
          const cx = Math.max(0, Math.min(1, x));
          const cy = Math.max(0, Math.min(1, y));
          const rx = (cy - 0.5) * -10;
          const ry = (cx - 0.5) * 10;
          card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
        });
      };
      const reset = () => {
        cancelAnimationFrame(raf);
        card.style.transform = "";
      };
      const onDown = (e: PointerEvent) => {
        active = true;
        if (resetTimer) {
          clearTimeout(resetTimer);
          resetTimer = null;
        }
        try {
          card.setPointerCapture(e.pointerId);
        } catch {
          /* noop */
        }
        apply(e.clientX, e.clientY);
      };
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse" && !active) return;
        apply(e.clientX, e.clientY);
      };
      const onUp = (e: PointerEvent) => {
        active = false;
        try {
          card.releasePointerCapture(e.pointerId);
        } catch {
          /* noop */
        }
        resetTimer = setTimeout(reset, 220);
      };
      const onLeave = (e: PointerEvent) => {
        if (e.pointerType === "mouse") reset();
      };
      const onCancel = () => {
        active = false;
        reset();
      };

      card.addEventListener("pointerdown", onDown);
      card.addEventListener("pointermove", onMove);
      card.addEventListener("pointerup", onUp);
      card.addEventListener("pointerleave", onLeave);
      card.addEventListener("pointercancel", onCancel);
      cleanups.push(() => {
        card.removeEventListener("pointerdown", onDown);
        card.removeEventListener("pointermove", onMove);
        card.removeEventListener("pointerup", onUp);
        card.removeEventListener("pointerleave", onLeave);
        card.removeEventListener("pointercancel", onCancel);
        cancelAnimationFrame(raf);
        if (resetTimer) clearTimeout(resetTimer);
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <ShopLayout>
      <div className="wf-page-in">
      {/* 1 — HERO */}
      <section className="relative w-full overflow-hidden lg:hidden" style={{ background: "#b6b2b1" }}>
        <div className="relative">
          <img
            src={imgHeroMobileFearless}
            alt="Wolfion — Fearless by Design"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="w-full h-auto"
          />
          {/* Wordmark — crisp real text, like the picture */}
          <div className="absolute inset-x-0 top-[11%] text-center pointer-events-none">
            <span
              className="font-serif text-[2.1rem] sm:text-5xl tracking-[0.28em] text-neutral-800"
              style={{ fontWeight: 400, marginRight: "-0.28em", transform: "translateX(0.18em)", display: "inline-block" }}
            >
              WOLFION
            </span>
          </div>
          <div className="absolute inset-x-0 top-[14.8%] text-center pointer-events-none">
            <span className="text-[10px] sm:text-xs tracking-[0.45em] uppercase text-neutral-600">
              Fearless by Design
            </span>
          </div>
          {/* Clickable hotspots over the picture's own buttons */}
          <Link
            href="/products"
            aria-label="Explore Collection"
            data-testid="hero-shop-now"
            className="absolute block cursor-pointer"
            style={{ left: "6%", top: "85%", width: "88%", height: "4.5%" }}
          />
          <Link
            href="/products"
            aria-label="Discover Wolfion"
            data-testid="hero-discover-wolfion"
            className="absolute block cursor-pointer"
            style={{ left: "28%", top: "90.5%", width: "48%", height: "4%" }}
          />
        </div>
      </section>

      {/* 1b — DESKTOP HERO · landscape editorial layout */}
      <section className="relative hidden lg:block w-full overflow-hidden" style={{ background: "#96959a" }}>
        <div className="relative mx-auto max-w-[1700px]">
          <img
            src={imgHeroLandscape}
            alt="Wolfion — Fearless by Design"
            loading="eager"
            decoding="async"
            className="w-full h-auto"
          />
          {/* Crisp real text replacing the baked-in headline */}
          <div className="absolute pointer-events-none" style={{ left: "5.5%", top: "33%", width: "42%" }}>
            <h2
              className="font-serif uppercase text-neutral-800 leading-[1.04]"
              style={{ fontSize: "clamp(2.6rem, 4.6vw, 4.9rem)", letterSpacing: "0.08em", fontWeight: 400 }}
            >
              Fearless
              <br />
              by Design
            </h2>
            <p
              className="mt-6 uppercase text-neutral-600"
              style={{ fontSize: "clamp(0.65rem, 0.85vw, 0.85rem)", letterSpacing: "0.28em", lineHeight: 1.9 }}
            >
              Where fashion meets intention.
              <br />
              Crafted for those who lead.
            </p>
            <div className="mt-7 h-px w-14 bg-neutral-500/70" />
          </div>
          {/* Clickable hotspots over the picture's own buttons */}
          <Link
            href="/products"
            aria-label="Explore Collection"
            data-testid="hero-discover-collection"
            className="absolute flex items-center gap-3 cursor-pointer group"
            style={{ left: "5.5%", top: "72%" }}
          >
            <span
              className="uppercase text-neutral-800 border-b border-neutral-700 pb-1"
              style={{ fontSize: "clamp(0.65rem, 0.85vw, 0.85rem)", letterSpacing: "0.22em", fontWeight: 500 }}
            >
              Explore Collection
            </span>
            <span aria-hidden className="text-neutral-800 transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
          <Link
            href="/products"
            aria-label="Get Started"
            data-testid="hero-get-started"
            className="absolute block cursor-pointer"
            style={{ left: "77%", top: "85%", width: "20%", height: "12%" }}
          />
        </div>
      </section>

      {/* 4.4 — THE WOLFION EDITORIAL · Fashion campaign shoot */}
      <section id="editorial" className="relative container mx-auto px-4 sm:px-5 pb-6 sm:pb-8 pt-0">
        <div
          aria-hidden
          className="absolute top-[10%] left-[5%] h-[45vh] w-[45vh] rounded-full opacity-15 blur-[120px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #E11D48 0%, transparent 70%)" }}
        />

        {/* Featured: Our Story editorial — the picture as-is, full-bleed edge to edge */}
        <div className={`relative ${FADE}`} style={{ marginLeft: "calc(50% - 50vw)", marginRight: "calc(50% - 50vw)" }}>
          <div className="relative flex flex-col justify-center">
            <div className="relative w-full">
              <img
                src={imgMagazineCutout}
                alt="Wolfion — Our Story campaign"
                loading="lazy"
                className="relative w-full h-auto"
              />
            </div>
          </div>
        </div>

        {/* Digital Fashion page — his mockup with the real film playing inside the phone */}
        <div
          id="film"
          className={`relative ${FADE}`}
          style={{ marginLeft: "calc(50% - 50vw)", marginRight: "calc(50% - 50vw)" }}
        >
          <div className="relative">
            <img
              src={imgDigitalFashion}
              alt="Wolfion — Digital Fashion"
              loading="eager"
              decoding="async"
              className="w-full h-auto block"
            />
            {/* The film, playing inside the phone frame baked into the picture */}
            <video
              src={vidEditorial}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster={imgFilmPoster}
              className="absolute object-cover bg-black"
              style={{
                left: "15.92%",
                top: "6.23%",
                width: "21.73%",
                height: "70.85%",
                borderRadius: "1.8vw",
              }}
              data-testid="digitalfashion-phone-video"
            />
          </div>
        </div>

        {/* Bapari Socks page — dark hero mockup */}
        <div
          id="bapari-socks"
          className={`relative overflow-hidden ${FADE}`}
          style={{ marginLeft: "calc(50% - 50vw)", marginRight: "calc(50% - 50vw)" }}
        >
          <img
            src={imgBapariSocks}
            alt="Bapari Socks by Wolfion — built for comfort, made to move"
            loading="lazy"
            decoding="async"
            className="w-full h-auto block"
            data-testid="baparisocks-page"
          />
          {/* Clickable hotspot over the baked-in SHOP NOW button */}
          <Link
            href="/products"
            aria-label="Shop now"
            data-testid="sockspage-shop-now"
            className="absolute"
            style={{ left: "3%", top: "76.5%", width: "20%", height: "13.5%" }}
          />
        </div>

        {/* Featured product — crisp real text + premium studio shot */}
        <div
          className="relative bg-[#eceae7] dark:bg-[#141414]"
          style={{ marginLeft: "calc(50% - 50vw)", marginRight: "calc(50% - 50vw)" }}
        >
          <div className="px-5 sm:px-10 py-8 sm:py-14 text-center">
            <div>
              <p className="text-[9px] sm:text-[11px] uppercase tracking-[0.4em] text-neutral-500 dark:text-neutral-400 mb-3">
                Featured Product
              </p>
              <h2 className="font-serif text-2xl sm:text-5xl tracking-wide text-neutral-900 dark:text-white leading-tight">
                WOLFION
                <br />
                BAPARI SOCKS
              </h2>
              <Link href="/products">
                <button
                  className="mt-5 sm:mt-8 inline-flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-4 sm:px-6 h-9 sm:h-11 text-[10px] sm:text-xs uppercase tracking-[0.2em] active:scale-95 transition-transform"
                  data-testid="sockspage-add-to-cart"
                >
                  Add to Cart <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3 — BAPARI SOCKS · Engineered Comfort */}
      <section className="relative w-full pb-6 sm:pb-8 overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-[10%] left-[40%] h-[50vh] w-[50vh] rounded-full opacity-20 blur-[120px] pointer-events-none"
          style={{
            background: "radial-gradient(circle, #1ABBC4 0%, transparent 70%)",
          }}
        />

        <div className="relative grid grid-cols-4 gap-0" style={{ perspective: "1200px" }}>
          {sockCats.map((c, i) => (
            <Link
              key={c.id}
              href={`/products?category=${c.id}`}
              className={`group block tilt-card ${FADE}`}
              style={{ animationDelay: `${i * 120}ms` }}
              data-testid={`home-sock-${c.id}`}
              data-tilt-card
            >
              <div className="relative" style={{ transformStyle: "preserve-3d" }}>
                {/* Glow halo on hover */}
                <div
                  aria-hidden
                  className="absolute -inset-1 blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(200,200,200,0.2) 100%)",
                  }}
                />
                {/* Gradient border */}
                <div
                  className="relative p-[1px] transition-transform duration-700 group-hover:-translate-y-2 group-hover:rotate-[0.5deg]"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.2) 100%)",
                  }}
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100 dark:bg-[#0f0f0f] shadow-lg group-hover:shadow-[0_15px_35px_-5px_rgba(0,0,0,0.8)] transition-shadow duration-700">
                    <div aria-hidden className="absolute inset-0 bg-[#e8ddd2] dark:bg-[#1a1a1a]" />
                    <img
                      src={c.image}
                      alt={c.label}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
                    />
                    {/* Glossy sheen */}
                    <div
                      aria-hidden
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)",
                      }}
                    />
                    {/* Liquid Glass label chip — dark glass for readability on any photo */}
                    <div className="absolute bottom-1 left-1 right-1 sm:bottom-3 sm:left-3 sm:right-3">
                      <div
                        className="rounded-lg px-1 py-1 sm:px-3 sm:py-2.5 border border-white/15 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.5)]"
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(8,18,28,0.62) 0%, rgba(8,18,28,0.45) 100%)",
                          backdropFilter: "blur(20px) saturate(170%)",
                          WebkitBackdropFilter: "blur(20px) saturate(170%)",
                        }}
                      >
                        <h3 className="text-[9px] sm:text-sm font-semibold text-white tracking-wide leading-tight drop-shadow-sm">{c.label}</h3>
                        <p className="text-[7px] sm:text-[11px] text-white/90 mt-0.5 font-light leading-tight truncate">{c.tagline}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4.5 — THE WOLFION BOX · Premium packaging */}
      <section id="wolfion-box" className="relative w-full pb-0"></section>

      {/* 5 — EDITORIAL CRAFT BANNER · 3D Glass framed photo */}
      <section className="relative w-full pt-0 pb-8 sm:pb-10 overflow-visible">
        <div className={`relative w-full ${FADE}`} style={{ perspective: "1400px" }}>
          {/* Soft neutral glow halo behind the photo (no colored tint —
              same neutral feel as the iPhone-style hero glass). */}
          <div
            aria-hidden
            className="absolute -inset-3 sm:-inset-5 rounded-[34px] blur-2xl opacity-40 pointer-events-none craft-halo-pulse"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 50%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 70%)",
            }}
          />
          {/* Gradient ring — animated conic border that slowly rotates
              its highlight around the frame, like a glass rim catching
              light. */}
          <div
            ref={craftFrameRef}
            className="relative p-0 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.55)] craft-frame-3d select-none"
            style={{
              transformStyle: "preserve-3d",
              transition: "transform 380ms cubic-bezier(0.22, 1, 0.36, 1)",
              // pan-y keeps vertical finger scroll working (so the
              // user can swipe past this big hero frame), while
              // horizontal drags still deliver pointermove for the
              // tilt to engage. Was previously "none" which trapped
              // vertical scroll inside the frame.
              touchAction: "pan-y",
            }}
          >
            <div
              className="relative overflow-hidden aspect-[16/10] sm:aspect-auto sm:h-[70vh] sm:min-h-[480px]"
            >
              <div aria-hidden className="absolute inset-0 bg-[#e8ddd2] dark:bg-[#2d2521]" />
              <img
                ref={craftImgRef}
                src={imgSocks}
                alt="Wolfion craftsmanship"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  transition: "transform 420ms cubic-bezier(0.22, 1, 0.36, 1)",
                  willChange: "transform",
                }}
              />
              {/* Bottom darkening gradient for text */}
              <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-black/55 via-black/25 to-transparent pointer-events-none" />
              {/* Top glossy highlight (glass sheen) */}
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-1/3 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, transparent 100%)",
                }}
              />
              {/* Diagonal sheen */}
              <div
                aria-hidden
                className="absolute -inset-x-1/2 inset-y-0 pointer-events-none craft-sheen"
                style={{
                  background:
                    "linear-gradient(115deg, transparent 38%, rgba(255,255,255,0.18) 50%, transparent 62%)",
                }}
              />

              {/* Text content overlay */}
            </div>
          </div>
        </div>
      </section>

      {/* Founder feature — right before footer */}
      <section className="relative container mx-auto px-5 pb-0">
        <div id="founder" className={`max-w-2xl mx-auto ${FADE}`}>
          <div className="relative mb-0 text-center">
            <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.5em] text-neutral-500 dark:text-neutral-400 leading-none">The Founder</p>
            <h3 className="mt-2 font-serif italic text-2xl sm:text-3xl text-neutral-900 dark:text-white leading-snug">Md Rabby Bapari</h3>
            <p className="mt-2">
              <a
                href="/founder/md-rabby-bapari"
                className="text-xs uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors underline underline-offset-4"
                data-testid="home-founder-link"
              >
                Md Rabby Bapari — Founder
              </a>
            </p>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes wf-blob1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(8%, 12%) scale(1.15); }
        }
        @keyframes wf-blob2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-10%, -8%) scale(1.12); }
        }
        @keyframes wf-blob3 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.25; }
          50% { transform: translate(-6%, 4%) scale(1.2); opacity: 0.35; }
        }
        @keyframes wf-hero-float {
          0%, 100% { transform: translateY(0) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)); }
          50% { transform: translateY(-6px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)); }
        }
        @keyframes wf-hero-sheen {
          0% { transform: translateX(-60%) rotate(8deg); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateX(60%) rotate(8deg); opacity: 0; }
        }
        @keyframes wf-hero-halo {
          0%, 100% { opacity: 0.22; transform: scale(1); }
          50% { opacity: 0.36; transform: scale(1.04); }
        }
        .hero-frame-3d {
          animation: wf-hero-float 7s ease-in-out infinite;
        }
        .hero-sheen {
          animation: wf-hero-sheen 6.5s ease-in-out infinite;
          animation-delay: 1.2s;
        }
        .hero-halo-pulse {
          animation: wf-hero-halo 5.5s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-frame-3d, .hero-sheen, .hero-halo-pulse { animation: none !important; }
        }
        /* On touch / coarse-pointer devices (i.e. phones) the constantly-
           running sheen sweep + halo pulse + float repaint a huge blurred
           layer every frame. When the user scrolls past the hero the
           compositor has to keep doing that work in parallel with the
           scroll, which causes a visible micro-flicker on lower-end
           Androids. Disable those continuous animations on touch devices
           and pin the frame to its own GPU layer so scroll stays smooth.
           The 3D mouse-tilt is pointer-only anyway. */
        @media (hover: none), (pointer: coarse) {
          .hero-frame-3d,
          .hero-sheen,
          .hero-halo-pulse {
            animation: none !important;
          }
          .hero-frame-3d {
            transform: translateZ(0) !important;
            will-change: auto !important;
          }
        }
        /* Dark mode: hide the warm halo that sits *inside* the bevel
           border. We keep the broader warm wash on the section bg and
           the gold-glass bevel frame itself, so the result reads like
           an iPhone-style 3D glass tile (clean glass edge, no inner
           color glow). Light mode keeps the original halo. */
        .dark .hero-halo-pulse {
          display: none !important;
        }
        /* Dark mode: also strip the gold tint from the bevel itself so
           the border reads as neutral glass (white highlight -> dark
           shadow) instead of gold-tinted. Keeps the 3D bevel structure
           and depth, just removes the warm color from the edge. */
        .dark .hero-frame-3d {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.55) 0%,
            rgba(255, 255, 255, 0.18) 35%,
            rgba(0, 0, 0, 0.35) 70%,
            rgba(0, 0, 0, 0.65) 100%
          ) !important;
          box-shadow:
            0 24px 60px -22px rgba(0, 0, 0, 0.6),
            0 6px 22px -10px rgba(0, 0, 0, 0.35),
            inset 0 1px 0 rgba(255, 255, 255, 0.28),
            inset 0 -1px 0 rgba(0, 0, 0, 0.5) !important;
        }

        /* === Editorial "Craft" section animations ===
           Mirrors the hero's float/halo/sheen vocabulary so the whole
           page feels alive, but with a slower, more editorial cadence. */
        @keyframes wf-craft-float {
          0%, 100% {
            transform: translateY(0)
              rotateX(var(--crx, 0deg))
              rotateY(var(--cry, 0deg));
          }
          50% {
            transform: translateY(-5px)
              rotateX(var(--crx, 0deg))
              rotateY(var(--cry, 0deg));
          }
        }
        @keyframes wf-craft-halo {
          0%, 100% { opacity: 0.42; transform: scale(1); }
          50%      { opacity: 0.6;  transform: scale(1.035); }
        }
        @keyframes wf-craft-sheen {
          0%   { transform: translateX(-40%); opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateX(40%); opacity: 0; }
        }
        @keyframes wf-craft-rise {
          from { opacity: 0; transform: translateY(14px); filter: blur(6px); }
          to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
        }
        @keyframes wf-craft-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes wf-craft-spark {
          0%, 100% { opacity: 0.7; transform: scale(1) rotate(0deg); }
          50%      { opacity: 1;   transform: scale(1.15) rotate(20deg); }
        }
        .craft-frame-3d {
          animation: wf-craft-float 9s ease-in-out infinite;
          will-change: transform;
        }
        /* Animated conic gradient border. We register --craft-angle as
           a CSS @property so it can be transitioned/animated; the
           background uses it to rotate the highlight stops around the
           frame. Falls back gracefully on browsers without @property. */
        @property --craft-angle {
          syntax: "<angle>";
          inherits: false;
          initial-value: 0deg;
        }
        @keyframes wf-craft-border-spin {
          to { --craft-angle: 360deg; }
        }
        /* Neutral 3D-glass bevel, same iPhone-glass vocabulary as the
           hero. The conic-gradient stops are pure white -> black so the
           rim has no color tint; only the *highlight position* orbits
           the frame, like light catching a glass edge. */
        .craft-border-spin {
          --craft-angle: 0deg;
          background:
            conic-gradient(
              from var(--craft-angle),
              rgba(255, 255, 255, 0.9) 0deg,
              rgba(255, 255, 255, 0.25) 80deg,
              rgba(0, 0, 0, 0.55) 180deg,
              rgba(255, 255, 255, 0.25) 280deg,
              rgba(255, 255, 255, 0.9) 360deg
            );
          box-shadow:
            0 24px 60px -22px rgba(0, 0, 0, 0.55),
            inset 0 1px 0 rgba(255, 255, 255, 0.45),
            inset 0 -1px 0 rgba(0, 0, 0, 0.45);
          animation:
            wf-craft-float 9s ease-in-out infinite,
            wf-craft-border-spin 8s linear infinite;
        }
        /* Fallback for browsers without @property support: animate the
           background-position of a long neutral gradient so the border
           still shimmers, even if it doesn't truly orbit. */
        @supports not (background: conic-gradient(from 0deg, red, blue)) {
          .craft-border-spin {
            background: linear-gradient(
              115deg,
              rgba(255, 255, 255, 0.9) 0%,
              rgba(255, 255, 255, 0.25) 35%,
              rgba(0, 0, 0, 0.55) 65%,
              rgba(255, 255, 255, 0.9) 100%
            );
            background-size: 300% 100%;
            animation:
              wf-craft-float 9s ease-in-out infinite,
              wf-craft-shimmer 6s linear infinite;
          }
        }
        .craft-halo-pulse {
          animation: wf-craft-halo 6.5s ease-in-out infinite;
        }
        .craft-sheen {
          animation: wf-craft-sheen 7.5s ease-in-out infinite;
          animation-delay: 1.4s;
        }
        .craft-rise {
          opacity: 0;
          animation: wf-craft-rise 900ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .craft-rise-1 { animation-delay: 80ms; }
        .craft-rise-2 { animation-delay: 240ms; }
        .craft-rise-3 { animation-delay: 480ms; }
        .craft-shimmer {
          animation: wf-craft-shimmer 6s linear infinite;
        }
        .craft-spark {
          animation: wf-craft-spark 2.8s ease-in-out infinite;
          transform-origin: center;
        }
        @media (prefers-reduced-motion: reduce) {
          .craft-frame-3d,
          .craft-border-spin,
          .craft-halo-pulse,
          .craft-sheen,
          .craft-rise,
          .craft-shimmer,
          .craft-spark {
            animation: none !important;
            opacity: 1 !important;
            filter: none !important;
            transform: none !important;
          }
        }
        @media (hover: none), (pointer: coarse) {
          /* Phones: kill the constantly-running heavy animations
             (sheen sweep + halo pulse + border spin) so scroll past
             this section stays buttery. The float keyframe is kept
             because it's the carrier for the touch-tilt --crx/--cry
             vars; without it the tilt wouldn't apply. The float is
             cheap (translateY 5px) and only animates when this
             section is on screen. */
          .craft-border-spin,
          .craft-halo-pulse,
          .craft-sheen {
            animation: none !important;
          }
          .craft-frame-3d {
            will-change: transform;
          }
        }

        /* === Experience the Source overlays === */
        @keyframes source-sweep {
          0%   { transform: translateX(0) skewX(-18deg); opacity: 0; }
          12%  { opacity: 0.55; }
          50%  { opacity: 0.55; }
          80%  { opacity: 0; }
          100% { transform: translateX(520%) skewX(-18deg); opacity: 0; }
        }
        .source-sweep {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 230, 170, 0.0) 20%,
            rgba(255, 230, 170, 0.55) 50%,
            rgba(255, 230, 170, 0.0) 80%,
            transparent 100%
          );
          filter: blur(6px);
          animation: source-sweep 7s ease-in-out 1.2s infinite;
          mix-blend-mode: screen;
        }
        @keyframes source-corner-in {
          0%   { opacity: 0; transform: scale(0.7); }
          100% { opacity: 1; transform: scale(1); }
        }
        .source-corner {
          position: absolute;
          width: 22px;
          height: 22px;
          border: 1.5px solid rgba(252, 211, 77, 0.85);
          filter: drop-shadow(0 0 6px rgba(252, 211, 77, 0.35));
          opacity: 0;
          animation: source-corner-in 700ms cubic-bezier(0.22, 1, 0.36, 1) 250ms forwards;
        }
        @media (min-width: 640px) {
          .source-corner { width: 28px; height: 28px; }
        }
        .source-corner-tl { top: 0;    left: 0;    border-right: 0; border-bottom: 0; }
        .source-corner-tr { top: 0;    right: 0;   border-left:  0; border-bottom: 0; animation-delay: 350ms; }
        .source-corner-bl { bottom: 0; left: 0;    border-right: 0; border-top:    0; animation-delay: 450ms; }
        .source-corner-br { bottom: 0; right: 0;   border-left:  0; border-top:    0; animation-delay: 550ms; }

        @keyframes source-chip-in {
          0%   { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .source-chip-in {
          opacity: 0;
          animation: source-chip-in 600ms cubic-bezier(0.22, 1, 0.36, 1) 700ms forwards;
        }
        .source-chip-delay-1 { animation-delay: 850ms; }
        .source-chip-delay-2 { animation-delay: 1000ms; }
        .source-chip-delay-3 { animation-delay: 1150ms; }

        @keyframes source-ping {
          0%   { transform: scale(1);   opacity: 0.75; }
          75%, 100% { transform: scale(2.4); opacity: 0; }
        }
        .source-ping { animation: source-ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite; }

        @keyframes source-bob {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-3px); }
        }
        .source-bob { animation: source-bob 2.4s ease-in-out infinite; }

        @keyframes source-vignette {
          0%, 100% { box-shadow: inset 0 0 60px rgba(0, 0, 0, 0.35); }
          50%      { box-shadow: inset 0 0 90px rgba(0, 0, 0, 0.55); }
        }
        .source-vignette { animation: source-vignette 6s ease-in-out infinite; }

        @keyframes source-seal-spin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .source-seal-spin { animation: source-seal-spin 18s linear infinite; transform-origin: 50% 50%; }

        /* Gentle continuous 3D float on the whole framed photo —
           composes with the touch-tilt inline transform via the
           wrapper, but here we just animate a soft levitation +
           micro yaw so the frame feels alive even when idle. */
        @keyframes source-float {
          0%, 100% {
            transform: translateY(0) rotateX(0deg) rotateY(0deg);
          }
          50% {
            transform: translateY(-4px) rotateX(0.6deg) rotateY(-0.8deg);
          }
        }
        .source-float {
          animation: source-float 9s ease-in-out infinite;
          will-change: transform;
        }
        /* Once a finger / cursor is engaged, [data-tilt-card] sets an
           inline transform — pause the float so the two don't fight. */
        .source-float[style*="transform"] { animation: none; }

        /* Floating depth particles — copper motes drifting in 3D. */
        .source-mote {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 9999px;
          background: radial-gradient(circle, rgba(255, 230, 170, 0.95) 0%, rgba(180, 83, 9, 0) 70%);
          box-shadow: 0 0 6px rgba(252, 211, 77, 0.55);
          opacity: 0;
          will-change: transform, opacity;
        }
        @keyframes source-mote-drift {
          0%   { opacity: 0; transform: translate3d(0, 20px, -40px) scale(0.6); }
          15%  { opacity: 0.9; }
          85%  { opacity: 0.9; }
          100% { opacity: 0; transform: translate3d(60px, -120px, 60px) scale(1.2); }
        }
        .source-mote-1 { left: 12%; top: 78%; animation: source-mote-drift 11s ease-in-out  0.0s infinite; }
        .source-mote-2 { left: 28%; top: 88%; animation: source-mote-drift 13s ease-in-out  1.6s infinite; width: 3px; height: 3px; }
        .source-mote-3 { left: 46%; top: 70%; animation: source-mote-drift 12s ease-in-out  3.2s infinite; }
        .source-mote-4 { left: 62%; top: 92%; animation: source-mote-drift 14s ease-in-out  4.8s infinite; width: 5px; height: 5px; }
        .source-mote-5 { left: 78%; top: 80%; animation: source-mote-drift 12s ease-in-out  6.4s infinite; }
        .source-mote-6 { left: 90%; top: 86%; animation: source-mote-drift 13s ease-in-out  8.0s infinite; width: 3px; height: 3px; }

        @keyframes source-grain {
          0%   { transform: translate(0, 0); }
          25%  { transform: translate(-6px, 4px); }
          50%  { transform: translate(4px, -8px); }
          75%  { transform: translate(-3px, -3px); }
          100% { transform: translate(0, 0); }
        }
        .source-grain {
          opacity: 0.10;
          mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.95  0 0 0 0 0.85  0 0 0 0 0.55  0 0 0 1 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
          background-size: 160px 160px;
          animation: source-grain 1.2s steps(4) infinite;
          will-change: transform;
        }

        @media (prefers-reduced-motion: reduce) {
          .source-sweep,
          .source-ping,
          .source-bob,
          .source-vignette,
          .source-seal-spin,
          .source-float,
          .source-mote,
          .source-grain { animation: none !important; }
          .source-corner,
          .source-chip-in { opacity: 1 !important; transform: none !important; animation: none !important; }
        }

        /* === Phone-only flicker fix ===
           On touch / coarse-pointer devices the long list of constantly
           running infinite animations on the "Source" frame (animated
           noise grain, sweep, vignette, mote drift, seal spin, float,
           ping, bob) and the craft section (shimmer, spark) repaint
           huge filtered/blended layers every frame. Combined with the
           backdrop-filter blurs elsewhere, that causes a visible
           flicker on lower-end Androids when the page first opens and
           when scrolling. Kill them on phones — the static 3D bevels,
           gold corners, halos, gradients and shadow depth are all
           preserved, so the section still reads as a premium 3D scene,
           just no perpetual motion. The press-to-tilt interaction is
           unaffected (it sets inline transforms via JS). */
        @media (hover: none), (pointer: coarse) {
          .source-sweep,
          .source-ping,
          .source-bob,
          .source-vignette,
          .source-seal-spin,
          .source-float,
          .source-mote,
          .source-grain,
          .craft-spark,
          .craft-shimmer {
            animation: none !important;
          }
          /* The grain layer is the single biggest repaint cost on
             phones (animated SVG noise with mix-blend-mode: overlay).
             Hide it entirely on coarse-pointer devices. */
          .source-grain { display: none !important; }
          /* Pin the source frame to its own GPU layer so it doesn't
             get re-rasterised on every scroll tick. */
          .source-float {
            transform: translateZ(0);
            will-change: auto;
          }
        }

        /* One-shot page-open fade so the very first paint doesn't
           flash. Slow is fine, the user explicitly asked for "slow ok
           but no flicker". Single 500ms ease, no infinite repaint. */
        @keyframes wf-page-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .wf-page-in {
          animation: wf-page-in 500ms ease-out both;
        }
        @media (prefers-reduced-motion: reduce) {
          .wf-page-in { animation: none !important; opacity: 1 !important; }
        }

        /* === Touch/mouse tilt for product / collection / box cards ===
           Marks any element with [data-tilt-card]: lets the browser
           deliver finger-drag pointer events to the card (instead of
           hijacking them for page scroll), kills the tap highlight
           overlay, and gives the tilt transform a smooth spring back
           when the JS clears it on pointerup. */
        .tilt-card {
          /* pan-y lets the browser keep handling vertical finger
             scrolls (so the page scrolls normally when the user
             drags up/down on a card), while still firing
             pointermove for horizontal drags so the card can tilt
             around the Y axis. Fixes "can't scroll when I touch a
             picture" on the customer page. */
          touch-action: pan-y;
          -webkit-tap-highlight-color: transparent;
          transition: transform 320ms cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .tilt-card { transition: none; transform: none !important; }
        }
      `}</style>
      </div>
    </ShopLayout>
  );
}
