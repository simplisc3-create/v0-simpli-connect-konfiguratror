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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isTransparent 
            ? "bg-transparent" 
            : "bg-background/95 backdrop-blur-md border-b border-border"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 -ml-2 rounded-lg transition-colors ${
              isTransparent 
                ? "text-white hover:bg-white/10" 
                : "text-foreground hover:bg-muted"
            }`}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <Link
            href="/"
            className={`transition-colors duration-300 ${
              isTransparent 
                ? "text-white hover:text-white/80" 
                : "text-foreground hover:text-foreground/80"
            }`}
          >
            <span className="font-serif text-xl sm:text-2xl tracking-tight">
              Simpli Connect
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            <Link
              href="/shop"
              className={`text-sm font-medium transition-colors duration-300 ${
                isTransparent 
                  ? "text-white/80 hover:text-white" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Shop
            </Link>
            <Link
              href="/konfigurator"
              className={`text-sm font-medium transition-colors duration-300 ${
                isTransparent 
                  ? "text-white/80 hover:text-white" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Konfigurator
            </Link>
            <Link
              href="/simpli-connected"
              className={`text-sm font-medium transition-colors duration-300 ${
                isTransparent 
                  ? "text-white/80 hover:text-white" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Simpli Connected
            </Link>
            <Link
              href="/kontakt"
              className={`text-sm font-medium transition-colors duration-300 ${
                isTransparent 
                  ? "text-white/80 hover:text-white" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Kontakt
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <a
              href="https://simpli-connect-voice-agent-373433007851.us-west1.run.app"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                size="sm"
                className={`gap-2 rounded-full transition-all duration-300 ${
                  isTransparent
                    ? "bg-white/10 border-white/30 text-white hover:bg-white hover:text-foreground"
                    : "bg-destructive border-destructive text-destructive-foreground hover:bg-destructive/90"
                }`}
              >
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline text-xs font-semibold">SOS</span>
              </Button>
            </a>

            <Link href="/warenkorb">
              <Button
                variant="outline"
                size="sm"
                className={`gap-2 rounded-full transition-all duration-300 ${
                  isTransparent
                    ? "bg-white/10 border-white/30 text-white hover:bg-white hover:text-foreground"
                    : "bg-transparent border-border text-foreground hover:bg-muted"
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="text-sm tabular-nums">({mounted ? getTotalItems() : 0})</span>
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div 
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" 
            onClick={() => setMobileMenuOpen(false)} 
          />
          <div className="absolute top-[65px] left-0 right-0 bg-background border-b border-border shadow-lg">
            <nav className="flex flex-col py-2">
              <Link
                href="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="px-6 py-4 text-base font-medium text-foreground hover:bg-muted transition-colors"
              >
                Shop
              </Link>
              <Link
                href="/konfigurator"
                onClick={() => setMobileMenuOpen(false)}
                className="px-6 py-4 text-base font-medium text-foreground hover:bg-muted transition-colors"
              >
                Konfigurator
              </Link>
              <Link
                href="/simpli-connected"
                onClick={() => setMobileMenuOpen(false)}
                className="px-6 py-4 text-base font-medium text-foreground hover:bg-muted transition-colors"
              >
                Simpli Connected
              </Link>
              <Link
                href="/kontakt"
                onClick={() => setMobileMenuOpen(false)}
                className="px-6 py-4 text-base font-medium text-foreground hover:bg-muted transition-colors"
              >
                Kontakt
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
