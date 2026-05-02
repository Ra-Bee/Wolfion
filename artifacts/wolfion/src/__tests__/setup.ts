import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.sessionStorage.clear();
  window.history.replaceState(null, "", "/");
});

if (!window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

if (!window.scrollTo) {
  window.scrollTo = (() => {}) as typeof window.scrollTo;
}

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (!("ResizeObserver" in window)) {
  // @ts-expect-error – jsdom polyfill
  window.ResizeObserver = ResizeObserverStub;
}

if (!("IntersectionObserver" in window)) {
  class IntersectionObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [] as IntersectionObserverEntry[];
    }
    root = null;
    rootMargin = "";
    thresholds: ReadonlyArray<number> = [];
  }
  // @ts-expect-error – jsdom polyfill
  window.IntersectionObserver = IntersectionObserverStub;
}
