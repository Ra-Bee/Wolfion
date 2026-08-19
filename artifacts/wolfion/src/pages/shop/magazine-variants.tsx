// Dev-only preview page to compare magazine design variants.
// Open at /shop/magazine-variants?__preview&v=a|b|c
import { lazy, Suspense } from "react";

const VariantA = lazy(() => import("@/components/magazine-variants/variant-a"));
const VariantB = lazy(() => import("@/components/magazine-variants/variant-b"));
const VariantC = lazy(() => import("@/components/magazine-variants/variant-c"));

export default function MagazineVariants() {
  const v = new URLSearchParams(window.location.search).get("v") ?? "a";
  const Variant = v === "b" ? VariantB : v === "c" ? VariantC : VariantA;
  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-neutral-950 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <Suspense fallback={<div className="text-center text-sm text-neutral-400 py-20">Loading…</div>}>
          <Variant />
        </Suspense>
      </div>
    </div>
  );
}
