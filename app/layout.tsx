import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BustedDarts - Master Your Finishing",
  description:
    "Professional darts training app focused on checkout math and decision-making under realistic match conditions",
  generator: "v0.app",
  manifest: "/manifest.json",
  applicationName: "BustedDarts",
  keywords: ["darts", "training", "checkout", "sports", "game"],
  authors: [{ name: "BustedDarts" }],
  creator: "BustedDarts",
  publisher: "BustedDarts",
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "BustedDarts",
    title: "BustedDarts - Master Your Finishing",
    description:
      "Professional darts training app focused on checkout math and decision-making under realistic match conditions",
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a0f1f" },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BustedDarts",
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: [
      {
        url: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="busted-darts-theme"
        >
          {children}
        </ThemeProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
