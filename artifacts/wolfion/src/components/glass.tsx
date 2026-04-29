import type { CSSProperties, ReactNode, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const RING_GRADIENT =
  "linear-gradient(135deg, rgba(180,140,150,0.55) 0%, rgba(190,160,110,0.40) 50%, rgba(140,120,160,0.55) 100%)";

const HAIRLINE_GRADIENT =
  "linear-gradient(90deg, transparent 0%, rgba(180,140,150,0.5) 30%, rgba(140,120,160,0.5) 70%, transparent 100%)";

export function GlassAtmosphere({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div
        className="absolute -top-[15%] -left-[10%] h-[55vh] w-[55vh] rounded-full opacity-25 blur-[120px]"
        style={{ background: "radial-gradient(circle, #D9899B 0%, transparent 70%)" }}
      />
      <div
        className="absolute top-[30%] -right-[10%] h-[50vh] w-[50vh] rounded-full opacity-20 blur-[110px]"
        style={{ background: "radial-gradient(circle, #C9A66B 0%, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-[10%] left-[35%] h-[45vh] w-[45vh] rounded-full opacity-20 blur-[110px]"
        style={{ background: "radial-gradient(circle, #9B85A8 0%, transparent 70%)" }}
      />
    </div>
  );
}

type GlassCardProps = HTMLAttributes<HTMLDivElement> & {
  ringed?: boolean;
  innerClassName?: string;
  haloOpacity?: number;
  rounded?: string;
  haloRounded?: string;
  padding?: string;
  glossTop?: boolean;
  sheen?: boolean;
};

/** Best-effort halo radius from a Tailwind rounded class. */
function deriveHaloRounded(rounded: string): string {
  if (rounded.includes("full")) return "rounded-full";
  if (rounded.includes("xl")) return "rounded-[2rem]";
  if (rounded.includes("lg")) return "rounded-2xl";
  if (rounded.includes("md")) return "rounded-xl";
  return "rounded-3xl";
}

/**
 * iOS Liquid Glass card.
 * Outer wrapper = gradient ring (1px). Inside = frosted glass with top gloss,
 * diagonal sheen, ambient halo behind the card.
 */
export function GlassCard({
  ringed = true,
  innerClassName,
  haloOpacity = 0.35,
  rounded = "rounded-3xl",
  haloRounded,
  padding = "p-6 sm:p-8",
  glossTop = true,
  sheen = true,
  className,
  children,
  ...rest
}: GlassCardProps) {
  const halo = haloRounded ?? deriveHaloRounded(rounded);
  return (
    <div className={cn("relative", className)} {...rest}>
      {/* Glow halo */}
      <div
        aria-hidden
        className={cn("absolute -inset-3 blur-2xl pointer-events-none", halo)}
        style={{
          background: RING_GRADIENT,
          opacity: haloOpacity,
        }}
      />
      {/* Gradient ring */}
      <div
        className={cn("relative", rounded, ringed ? "p-[1px]" : "")}
        style={ringed ? { background: RING_GRADIENT } : undefined}
      >
        <div
          className={cn(
            "relative overflow-hidden border border-white/40 dark:border-white/10",
            rounded,
            padding,
            innerClassName,
          )}
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 100%)",
            backdropFilter: "blur(22px) saturate(170%)",
            WebkitBackdropFilter: "blur(22px) saturate(170%)",
            boxShadow:
              "0 24px 60px -20px rgba(15,23,42,0.30), inset 0 1px 0 rgba(255,255,255,0.45)",
          }}
        >
          {glossTop && (
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-[40%] pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0) 100%)",
              }}
            />
          )}
          {sheen && (
            <div
              aria-hidden
              className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] pointer-events-none opacity-25"
              style={{
                background:
                  "linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.55) 50%, transparent 65%)",
                transform: "rotate(-8deg)",
              }}
            />
          )}
          <div className="relative">{children}</div>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact pill-shaped glass chip (good for filters, badges, stat blocks).
 */
export function GlassChip({
  className,
  children,
  style,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  const baseStyle: CSSProperties = {
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 100%)",
    backdropFilter: "blur(14px) saturate(170%)",
    WebkitBackdropFilter: "blur(14px) saturate(170%)",
    boxShadow:
      "0 6px 18px -8px rgba(15,23,42,0.25), inset 0 1px 0 rgba(255,255,255,0.45)",
    ...style,
  };
  return (
    <div
      className={cn(
        "rounded-full border border-white/40 dark:border-white/10 px-4 h-9 inline-flex items-center text-xs uppercase tracking-widest",
        className,
      )}
      style={baseStyle}
      {...rest}
    >
      {children}
    </div>
  );
}

/**
 * 3D framed photo card — gradient ring + halo + glossy top + diagonal sheen.
 * Matches the editorial banner treatment on the home page.
 */
export function GlassPhotoFrame({
  className,
  innerClassName,
  rounded = "rounded-3xl",
  haloRounded,
  haloOpacity = 0.45,
  children,
}: {
  className?: string;
  innerClassName?: string;
  rounded?: string;
  haloRounded?: string;
  haloOpacity?: number;
  children: ReactNode;
}) {
  const halo = haloRounded ?? deriveHaloRounded(rounded);
  return (
    <div className={cn("relative", className)}>
      <div
        aria-hidden
        className={cn("absolute -inset-4 blur-3xl pointer-events-none", halo)}
        style={{ background: RING_GRADIENT, opacity: haloOpacity }}
      />
      <div
        className={cn("relative", rounded)}
        style={{ background: RING_GRADIENT, padding: "2px" }}
      >
        <div
          className={cn(
            "relative overflow-hidden",
            rounded,
            innerClassName,
          )}
          style={{
            boxShadow:
              "0 30px 70px -25px rgba(15,23,42,0.45), inset 0 1px 0 rgba(255,255,255,0.4)",
          }}
        >
          {children}
          {/* Top gloss */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-[35%] pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 100%)",
            }}
          />
          {/* Diagonal sheen */}
          <div
            aria-hidden
            className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] pointer-events-none opacity-30"
            style={{
              background:
                "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.45) 50%, transparent 70%)",
              transform: "rotate(-8deg)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Ambient gradient hairline divider — sunset palette.
 */
export function GlassHairline({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("h-[1px] w-full", className)}
      style={{ background: HAIRLINE_GRADIENT }}
    />
  );
}

export const GLASS_RING_GRADIENT = RING_GRADIENT;
export const GLASS_HAIRLINE_GRADIENT = HAIRLINE_GRADIENT;
