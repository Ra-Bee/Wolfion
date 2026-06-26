import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.wolfion.app",
  appName: "Wolfion",
  webDir: "www",
  server: {
    url: "https://wolfion-portal.replit.app",
    androidScheme: "https",
    cleartext: false,
    allowNavigation: [
      "wolfion-portal.replit.app",
      "*.replit.app",
      "wolfion.com.au",
      "*.wolfion.com.au",
      "*.clerk.accounts.dev",
      "*.clerk.dev",
      "*.clerk.com",
      "accounts.google.com",
      "*.google.com",
      "*.gstatic.com",
    ],
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
