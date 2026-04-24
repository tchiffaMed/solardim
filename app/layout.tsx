import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "SolarDim Niger — Dimensionnement PV",
  description:
    "Outil professionnel de dimensionnement technico-financier d'installations solaires photovoltaïques au Niger. Méthode  SAHELIO. Calculs complets, carte interactive, rapport PDF.",
  keywords: [
    "solaire",
    "photovoltaïque",
    "Niger",
    "dimensionnement",
    " SAHELIO",
    "PV",
    "énergie renouvelable",
  ],
  authors: [{ name: "SolarDim Niger" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SolarDim Niger",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    title: "SolarDim Niger — Dimensionnement PV",
    description:
      "Dimensionnement technico-financier d'installations solaires PV au Niger. Méthode  SAHELIO.",
    siteName: "SolarDim Niger",
  },
};

export const viewport: Viewport = {
  themeColor: "#D97706",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        {/* Leaflet CSS */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
        {/* PWA iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SolarDim" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
        <link rel="icon" href="/icons/icon-96.svg" type="image/svg+xml" />
      </head>
      <body className="bg-earth-50 min-h-screen">
        {children}
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            style: { fontFamily: "var(--font-body)", borderRadius: "12px" },
          }}
        />
      </body>
    </html>
  );
}
