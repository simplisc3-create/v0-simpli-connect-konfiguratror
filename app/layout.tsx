import type React from "react"
import type { Metadata } from "next"

import "./globals.css"

import { Inter } from "next/font/google"
import { SosFloatingSphere } from "@/components/sos-floating-sphere"

const inter = Inter({ subsets: ["latin"] })

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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de">
      <body className={`${inter.className} antialiased`}>
        {children}
        <SosFloatingSphere />
      </body>
    </html>
  )
}
