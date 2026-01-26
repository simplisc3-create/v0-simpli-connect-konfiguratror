"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ShoppingCart, Phone, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/cart-store"

interface SiteHeaderProps {
  transparent?: boolean
}

export function SiteHeader({ transparent = false }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { getTotalItems } = useCartStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const isTransparent = transparent && !scrolled

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isTransparent ? "bg-transparent" : "bg-card/95 backdrop-blur-md border-b border-border shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 -ml-2 rounded-lg transition-colors ${
              isTransparent ? "text-primary-foreground hover:bg-primary-foreground/10" : "text-foreground hover:bg-muted"
            }`}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link
            href="/"
            className={`transition-colors duration-300 ${isTransparent ? "text-primary-foreground/90 hover:text-primary-foreground" : "text-foreground hover:text-muted-foreground"}`}
          >
            <span className="font-bold tracking-widest uppercase text-base sm:text-2xl md:text-3xl">
              Simpli Connect
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/shop"
              className={`font-medium transition-colors duration-300 ${
                isTransparent ? "text-primary-foreground/80 hover:text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Shop
            </Link>
            <Link
              href="/konfigurator"
              className={`font-medium transition-colors duration-300 ${
                isTransparent ? "text-primary-foreground/80 hover:text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Konfigurator
            </Link>
            <Link
              href="/kontakt"
              className={`font-medium transition-colors duration-300 ${
                isTransparent ? "text-primary-foreground/80 hover:text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Kontakt
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="https://simpli-connect-voice-agent-373433007851.us-west1.run.app"
              target="_blank"
              rel="noopener noreferrer"
              className="blink-animation"
            >
              <Button
                variant="outline"
                size="sm"
                className="gap-1 sm:gap-2 px-2 sm:px-3 bg-destructive border-destructive text-destructive-foreground hover:bg-destructive/90 hover:border-destructive/90"
              >
                <Phone className="w-4 h-4" />
                <span className="font-bold text-xs hidden sm:inline">SOS</span>
              </Button>
            </a>

            <Link href="/warenkorb">
              <Button
                variant="outline"
                size="sm"
                className={`gap-1 sm:gap-2 px-2 sm:px-3 transition-all duration-300 ${
                  isTransparent
                    ? "bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20"
                    : "bg-transparent border-border text-foreground hover:bg-muted"
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="text-sm">({mounted ? getTotalItems() : 0})</span>
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-foreground/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-[60px] left-0 right-0 bg-card shadow-lg">
            <div className="flex flex-col py-4">
              <Link
                href="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="px-6 py-3 text-lg font-medium text-foreground hover:bg-muted transition-colors"
              >
                Shop
              </Link>
              <Link
                href="/konfigurator"
                onClick={() => setMobileMenuOpen(false)}
                className="px-6 py-3 text-lg font-medium text-foreground hover:bg-muted transition-colors"
              >
                Konfigurator
              </Link>
              <Link
                href="/kontakt"
                onClick={() => setMobileMenuOpen(false)}
                className="px-6 py-3 text-lg font-medium text-foreground hover:bg-muted transition-colors"
              >
                Kontakt
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
