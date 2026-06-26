import { Instagram, Facebook, Globe, Mail } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ContactLink {
  icon: LucideIcon;
  label: string;
  handle: string;
  href: string;
  testid: string;
}

export const CONTACT_LINKS: ContactLink[] = [
  {
    icon: Instagram,
    label: "Instagram",
    handle: "@wolfion.com.au",
    href: "https://www.instagram.com/wolfion.com.au?igsh=c3FzOTE5Y3o3a2Qz",
    testid: "contact-instagram",
  },
  {
    icon: Facebook,
    label: "Facebook",
    handle: "facebook.com/wolfion",
    href: "https://www.facebook.com/share/1A8R9qhp4y/",
    testid: "contact-facebook",
  },
  {
    icon: Globe,
    label: "Website",
    handle: "www.wolfion.com.au",
    href: "https://www.wolfion.com.au",
    testid: "contact-website",
  },
  {
    icon: Mail,
    label: "Email",
    handle: "wolfion@wolfion.com.au",
    href: "mailto:wolfion@wolfion.com.au",
    testid: "contact-email",
  },
];
