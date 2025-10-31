import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PWAProvider } from "@/components/pwa-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RentFlow - Property Management",
  description: "Property & Trailer Park Management with Offline Inspections",
  manifest: "/manifest.json",
  themeColor: "#3b82f6",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RentFlow",
  },
  icons: {
    icon: "/icon-192.svg",
    apple: "/icon-192.svg",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192" />
        <link rel="icon" href="/icon-192.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={inter.className}>
        <PWAProvider>{children}</PWAProvider>
      </body>
    </html>
  );
}

