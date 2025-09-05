import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Providers } from "@/components/Providers";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import React from "react";
import { PlayerProvider } from "@/components/PlayerProvider";
import AudioPlayerBar from "@/components/AudioPlayerBar";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorNotificationProvider } from "@/components/ErrorNotificationProvider";
import AdLayoutWrapper from "@/components/AdManager/AdLayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

const APP_NAME = "PodDB Pro";
const APP_DEFAULT_TITLE = "PodDB Pro - The Podcast Database";
const APP_TITLE_TEMPLATE = "%s | PodDB Pro";
const APP_DESCRIPTION = "The IMDb for podcasts. Discover, explore, and contribute to the largest, community-powered podcast database in the world. Find rankings, episodes, and creator info.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  formatDetection: {
    telephone: false,
  },
  keywords: [
    "podcast", "podcasts", "podcast database", "largest podcast database",
    "biggest podcast database", "podcast directory", "IMDb for podcasts",
    "podcast search", "podcast rankings", "top podcasts", "podcast episodes",
    "podcast creators", "podcast guests", "podcast news"
  ],
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    url: "https://poddb.pro", // Production domain
    images: [
      {
        url: "/og-image.png", // Replace with your actual OG image path
        width: 1200,
        height: 630,
        alt: "PodDB Pro - The Podcast Database",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    images: ["/og-image.png"], // Replace with your actual OG image path
  },
};

export const viewport: Viewport = {
  themeColor: "#111827",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={APP_DEFAULT_TITLE} />
      </head>
      <body className={inter.className}>
        <Providers>
          <PlayerProvider>
            <ErrorBoundary>
              <ErrorNotificationProvider>
                <Toaster />
                <Sonner />
                <div className="min-h-screen bg-background flex flex-col">
                  <Navigation />
                  <main className="flex-grow">{children}</main>
                  <Footer />
                </div>
                <AudioPlayerBar />
                <AnalyticsTracker />
              </ErrorNotificationProvider>
            </ErrorBoundary>
          </PlayerProvider>
        </Providers>
      </body>
    </html>
  );
}
