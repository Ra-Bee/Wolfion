import { useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";

/**
 * Global swipe-down-to-refresh for the app. Because Wolfion runs inside a
 * WebView (Capacitor) that mirrors the live site, there is no browser chrome
 * to pull on, so we implement the gesture ourselves: when the page is scrolled
 * to the very top and the user drags down past a threshold, we reload.
 *
 * Guards:
 *  - Only starts when window is at the top (scrollY === 0).
 *  - Ignores the gesture if it began inside a nested scroll area that is itself
 *    scrolled (e.g. an open menu / dialog list), so those keep scrolling.
 */
const THRESHOLD = 70; // px of pull needed to trigger a refresh
const MAX_PULL = 120; // clamp so the indicator never flies off screen

export function PullToRefresh() {
  const [display, setDisplay] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [dragging, setDragging] = useState(false);

  const pull = useRef(0);
  const startY = useRef<number | null>(null);
  const active = useRef(false);
  const busy = useRef(false);

  useEffect(() => {
    const setPull = (v: number) => {
      pull.current = v;
      setDisplay(v);
    };

    const nestedScrolled = (target: EventTarget | null): boolean => {
      let node = target as HTMLElement | null;
      while (node && node !== document.body && node !== document.documentElement) {
        const oy = getComputedStyle(node).overflowY;
        if ((oy === "auto" || oy === "scroll") && node.scrollTop > 0) return true;
        node = node.parentElement;
      }
      return false;
    };

    const onStart = (e: TouchEvent) => {
      if (busy.current) return;
      if (e.touches.length !== 1) return;
      if (window.scrollY > 0) return;
      if (nestedScrolled(e.target)) return;
      startY.current = e.touches[0].clientY;
      active.current = true;
    };

    const onMove = (e: TouchEvent) => {
      if (!active.current || startY.current == null || busy.current) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy <= 0) {
        if (pull.current !== 0) setPull(0);
        setDragging(false);
        return;
      }
      setDragging(true);
      // Rubber-band resistance so the pull feels natural.
      setPull(Math.min(MAX_PULL, dy * 0.5));
    };

    const onEnd = () => {
      if (!active.current) return;
      active.current = false;
      startY.current = null;
      setDragging(false);
      if (pull.current >= THRESHOLD && !busy.current) {
        busy.current = true;
        setRefreshing(true);
        setPull(THRESHOLD);
        // Soft reload: tell the splash script in index.html to skip the
        // full-screen logo splash — a refresh should feel like a quick
        // spinner, not an app restart.
        try {
          sessionStorage.setItem("wolfion-skip-splash", "1");
        } catch {
          /* ignore */
        }
        window.setTimeout(() => window.location.reload(), 350);
      } else {
        setPull(0);
      }
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    window.addEventListener("touchcancel", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onEnd);
    };
  }, []);

  const offset = (refreshing ? THRESHOLD : display) - 44;
  const visible = display > 0 || refreshing;

  return (
    <div
      aria-hidden
      className="fixed left-0 right-0 top-0 z-[100] flex justify-center pointer-events-none"
      style={{ paddingTop: "max(env(safe-area-inset-top), var(--safe-area-inset-top, 0px), var(--native-safe-top-floor, 0px))" }}
    >
      <div
        style={{
          transform: `translateY(${offset}px)`,
          opacity: visible ? 1 : 0,
          transition: dragging ? "none" : "transform 0.25s ease, opacity 0.25s ease",
        }}
      >
        <div className="mt-2 h-9 w-9 rounded-full bg-white/95 dark:bg-neutral-800/95 shadow-lg backdrop-blur flex items-center justify-center border border-black/5 dark:border-white/10">
          <RefreshCw
            className={"h-4 w-4 text-primary " + (refreshing ? "animate-spin" : "")}
            style={
              refreshing
                ? undefined
                : { transform: `rotate(${Math.min(display, MAX_PULL) * 3}deg)` }
            }
          />
        </div>
      </div>
    </div>
  );
}
