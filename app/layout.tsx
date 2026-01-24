import type React from "react"
import type { Metadata } from "next"

import "./globals.css"

import { Inter, Playfair_Display } from "next/font/google"
import { SosFloatingSphere } from "@/components/sos-floating-sphere"

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
})

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  title: "Simpli Connect | Modulare Regalsysteme",
  description:
    "Entdecke das Simpli Connect Regalsystem. Hochwertige Chromrahmen, individuell konfigurierbare Module und endlose Gestaltungsfreiheit.",
  generator: "v0.app",
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
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Simpli Connect | Modulare Regalsysteme",
    description:
      "Entdecke das Simpli Connect Regalsystem. Hochwertige Chromrahmen, individuell konfigurierbare Module und endlose Gestaltungsfreiheit.",
    images: [
      {
        url: "/images/og-thumbnail.png",
        width: 1200,
        height: 630,
        alt: "Simpli Connect - Modulare Regalsysteme in verschiedenen Farben",
      },
    ],
    locale: "de_DE",
    type: "website",
    siteName: "Simpli Connect",
  },
  twitter: {
    card: "summary_large_image",
    title: "Simpli Connect | Modulare Regalsysteme",
    description:
      "Entdecke das Simpli Connect Regalsystem. Hochwertige Chromrahmen, individuell konfigurierbare Module und endlose Gestaltungsfreiheit.",
    images: ["/images/og-thumbnail.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        {children}
        <SosFloatingSphere />
      </body>
    </html>
  )
}
