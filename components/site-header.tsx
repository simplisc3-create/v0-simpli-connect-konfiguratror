"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ShoppingCart, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/cart-store"

interface SiteHeaderProps {
  transparent?: boolean
}

export function SiteHeader({ transparent = false }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const { getTotalItems } = useCartStore()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const isTransparent = transparent && !scrolled

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isTransparent ? "bg-transparent" : "bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm"
      }`}
    >
      <style jsx>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .blink-animation {
          animation: blink 1s ease-in-out infinite;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className={`transition-colors duration-300 ${isTransparent ? "text-white/90 hover:text-white" : "text-gray-900 hover:text-gray-600"}`}
        >
          <span className="font-bold tracking-widest uppercase text-2xl md:text-3xl">Simpli Connect</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/shop"
            className={`font-medium transition-colors duration-300 ${
              isTransparent ? "text-white/80 hover:text-white" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Shop
          </Link>
          <Link
            href="/konfigurator"
            className={`font-medium transition-colors duration-300 ${
              isTransparent ? "text-white/80 hover:text-white" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Konfigurator
          </Link>
          <Link
            href="/kontakt"
            className={`font-medium transition-colors duration-300 ${
              isTransparent ? "text-white/80 hover:text-white" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Kontakt
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://simpli-connect-voice-agent-373433007851.us-west1.run.app"
            target="_blank"
            rel="noopener noreferrer"
            className="blink-animation"
          >
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-red-600 border-red-600 text-white hover:bg-red-700 hover:border-red-700"
            >
              <Phone className="w-4 h-4" />
              <span className="font-bold text-xs">SOS</span>
            </Button>
          </a>

          <Link href="/warenkorb">
            <Button
              variant="outline"
              size="sm"
              className={`gap-2 transition-all duration-300 ${
                isTransparent
                  ? "bg-white/10 border-white/30 text-white hover:bg-white/20"
                  : "bg-transparent border-gray-200 text-gray-900 hover:bg-gray-100"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Warenkorb</span> ({getTotalItems()})
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
