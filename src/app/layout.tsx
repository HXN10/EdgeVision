import type { Metadata } from "next";
import { Sora, DM_Sans } from "next/font/google";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
  weight: ["400", "500", "600"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["400", "500"],
});

import type { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export const metadata: Metadata = {
  title: {
    default: "EdgeVision — AI Image Tools in Your Browser",
    template: "%s | EdgeVision",
  },
  description:
    "7 AI-powered image tools that run 100% locally in your browser. Remove backgrounds, enhance photos, crop, compress, upscale, and denoise — no uploads, no servers.",
  keywords: [
    "image editor",
    "background remover",
    "image enhancer",
    "image compressor",
    "image upscaler",
    "AI",
    "privacy",
    "local processing",
    "WebAssembly",
    "PWA",
  ],
  manifest: "/manifest.json",
  openGraph: {
    title: "EdgeVision — AI Image Tools in Your Browser",
    description:
      "7 AI-powered image tools, 100% private. No uploads, no servers.",
    type: "website",
  },
};

const themeScript = `
  (function() {
    try {
      var local = localStorage.getItem('ev-theme');
      if (local === 'light') {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.add('dark');
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${sora.variable} ${dmSans.variable} font-dm-sans antialiased`}
      >
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
