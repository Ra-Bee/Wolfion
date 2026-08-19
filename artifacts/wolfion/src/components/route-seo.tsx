import { useEffect } from "react";
import { useLocation } from "wouter";

const ORIGIN = "https://www.wolfion.com.au";

const PUBLIC_META: Record<string, { title: string; description: string }> = {
  "/": {
    title: "WOLFION | Australian Fashion & Textile Brand",
    description:
      "WOLFION is an Australian fashion and textile brand combining considered design, textile engineering, product development and manufacturing knowledge.",
  },
  "/shop": {
    title: "Shop WOLFION | Premium Socks and Fashion",
    description:
      "Explore the official WOLFION store for premium short, ankle, kids and specialty socks designed with comfort, material and construction in mind.",
  },
  "/about": {
    title: "About WOLFION | Fashion, Textiles and Design",
    description:
      "Learn about WOLFION, an Australian fashion and textile brand founded by textile engineer, fashion designer and entrepreneur Md Rabby Bapari.",
  },
  "/founder/md-rabby-bapari": {
    title: "Md Rabby Bapari | Founder of WOLFION",
    description:
      "Md Rabby Bapari is a textile engineer, fashion designer, entrepreneur and Founder of WOLFION, an Australian fashion and textile brand.",
  },
  "/app": {
    title: "WOLFION App | Shop WOLFION on Mobile",
    description:
      "Discover the WOLFION app for a mobile way to browse the official customer store, explore products and stay connected to the WOLFION collection.",
  },
  "/products": {
    title: "WOLFION Products | Premium Socks Collection",
    description:
      "Browse WOLFION products, including premium short socks, ankle socks, kids socks and specialty styles engineered for comfort and daily wear.",
  },
  "/socks": {
    title: "WOLFION Socks | Engineered Everyday Comfort",
    description:
      "Discover WOLFION socks designed with textile knowledge and everyday comfort in mind, including short, ankle, kids and specialty sock styles.",
  },
  "/manufacturing": {
    title: "WOLFION Manufacturing | Textile Product Knowledge",
    description:
      "Learn how WOLFION combines textile engineering, fashion design, product development and practical manufacturing knowledge across its work.",
  },
  "/services": {
    title: "WOLFION Services | Fashion and Textile Expertise",
    description:
      "Explore WOLFION capabilities across fashion design, textile engineering, product development and practical manufacturing knowledge.",
  },
  "/contact": {
    title: "Contact WOLFION | Official Brand Enquiries",
    description:
      "Contact WOLFION for official brand, product and customer enquiries, and find verified links to the Australian fashion and textile brand.",
  },
  "/privacy": {
    title: "WOLFION Privacy Policy | Website and App",
    description:
      "Read the WOLFION privacy policy for information about how the official website and mobile app collect, use, protect and retain personal information.",
  },
};

const PRIVATE_PREFIXES = [
  "/admin",
  "/admin-dashboard",
  "/sign-in",
  "/sign-up",
  "/app-sso",
  "/role-select",
  "/cart",
  "/checkout-success",
  "/settings",
  "/dev-preview",
];

function setMeta(selector: string, attribute: string, value: string) {
  const element = document.head.querySelector<HTMLMetaElement>(selector);
  if (element) element.setAttribute(attribute, value);
}

export function RouteSeo() {
  const [location] = useLocation();

  useEffect(() => {
    const path = location.split("?")[0] || "/";
    const meta = PUBLIC_META[path];
    const privatePage = PRIVATE_PREFIXES.some(
      (prefix) => path === prefix || path.startsWith(`${prefix}/`),
    );

    if (privatePage) {
      setMeta('meta[name="robots"]', "content", "noindex, nofollow, noarchive");
      return;
    }

    if (!meta) return;

    document.title = meta.title;
    setMeta('meta[name="description"]', "content", meta.description);
    setMeta(
      'meta[name="robots"]',
      "content",
      "index, follow, max-image-preview:large",
    );
    setMeta('meta[property="og:title"]', "content", meta.title);
    setMeta('meta[property="og:description"]', "content", meta.description);
    setMeta('meta[property="og:url"]', "content", `${ORIGIN}${path}`);
    setMeta('meta[name="twitter:title"]', "content", meta.title);
    setMeta('meta[name="twitter:description"]', "content", meta.description);

    const canonical =
      document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    canonical?.setAttribute("href", `${ORIGIN}${path}`);
  }, [location]);

  return null;
}