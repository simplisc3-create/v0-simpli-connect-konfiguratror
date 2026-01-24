"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowRight, Palette, Box, Truck, Shield, ShoppingCart, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { useCartStore } from "@/lib/cart-store"

const collections = [
  {
    id: "modular",
    name: "Modular",
    headline: "Modular Furniture",
    description:
      "Jedes Stück beginnt mit den feinsten Materialien, sorgfältig ausgewählt für Schönheit, Langlebigkeit und nachhaltige Herkunft.",
  },
  {
    id: "office",
    name: "Office",
    headline: "Office",
    description:
      "Professionelle Regalsysteme für den modernen Arbeitsplatz. Maximale Organisation trifft auf zeitloses Design.",
  },
  {
    id: "living",
    name: "Living",
    headline: "Living",
    description:
      "Wohnraumlösungen die Stil und Funktion vereinen. Schaffen Sie persönliche Räume mit individuell konfigurierbaren Regalsystemen.",
  },
]

export default function Home() {
  const [activeCollection, setActiveCollection] = useState(collections[0])

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader transparent />

      {/* Hero Section */}
      <section className="relative h-[100dvh] w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover">
            <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/0108%281%29-pS6CfKhfSUB0VKDFJvOzkgxn7AYWh3.mov" type="video/quicktime" />
            <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/0108%281%29-pS6CfKhfSUB0VKDFJvOzkgxn7AYWh3.mov" type="video/mp4" />
            <img
              src="/modern-chrome-modular-shelf-system-white-backgroun.jpg"
              alt="Simpli Connect Regalsystem"
              className="w-full h-full object-cover"
            />
          </video>
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col justify-between px-4 sm:px-6 pt-24 sm:pt-44 pb-20 sm:pb-24">
          <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col items-center justify-center">
            <p className="text-white/70 uppercase tracking-[0.3em] text-xs sm:text-sm mb-4 sm:mb-6">
              Modulare Regalsysteme
            </p>
            <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-white leading-[0.9] tracking-tight text-center">
              <span className="block">Optimal organization</span>
              <span className="block italic">meets exquisite design</span>
            </h1>
            <p className="mt-6 sm:mt-8 text-white/80 text-center max-w-xl text-sm sm:text-base leading-relaxed px-4">
              Verwandeln Sie Ihre Räume in funktionale Kunstwerke mit den maßgeschneiderten Designlösungen von Simpli Connect.
            </p>
          </div>

          {/* Bottom CTAs */}
          <div className="max-w-7xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 sm:gap-4">
              <Link href="/simpli-connected" className="group flex flex-col items-center gap-3 text-white">
                <span className="text-xs uppercase tracking-[0.2em] text-white/70">Entdecken Sie</span>
                <span className="text-sm font-medium">Unsere Story</span>
                <div className="w-10 h-10 rounded-full border border-accent flex items-center justify-center group-hover:bg-accent transition-colors">
                  <ArrowRight className="w-4 h-4 text-accent group-hover:text-foreground" />
                </div>
              </Link>

              {/* Collection Selector */}
              <div className="inline-flex items-center gap-1 sm:gap-2 bg-white/10 backdrop-blur-md rounded-full p-1 sm:p-1.5 border border-white/20">
                {collections.map((collection) => (
                  <button
                    key={collection.id}
                    onClick={() => setActiveCollection(collection)}
                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                      activeCollection.id === collection.id
                        ? "bg-white text-foreground shadow-lg"
                        : "text-white hover:bg-white/10"
                    }`}
                  >
                    {collection.name}
                  </button>
                ))}
              </div>

              <Link href="/shop" className="group flex flex-col items-center gap-3 text-white">
                <span className="text-xs uppercase tracking-[0.2em] text-white/70">Kaufen Sie</span>
                <span className="text-sm font-medium">Stellar Products</span>
                <div className="w-10 h-10 rounded-full border border-accent flex items-center justify-center group-hover:bg-accent transition-colors">
                  <ArrowRight className="w-4 h-4 text-accent group-hover:text-foreground" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 sm:mb-24">
            <p className="text-muted-foreground uppercase tracking-[0.2em] text-xs mb-4">Unsere Kernwerte</p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-foreground leading-tight max-w-2xl">
              Warum Simpli Connect?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
            <FeatureCard
              number="1"
              title="Modulares System"
              description="Kombiniere Module nach deinen Wünschen. Erweitere jederzeit ohne Einschränkungen."
            />
            <FeatureCard
              number="2"
              title="Individuelle Farben"
              description="Wähle aus 6 Sonderfarben oder klassischem Weiß und Schwarz."
            />
            <FeatureCard
              number="3"
              title="Schnelle Lieferung"
              description="Versandfertig in 5-7 Werktagen. Kostenloser Versand ab 500€."
            />
            <FeatureCard
              number="4"
              title="Premium Qualität"
              description="Robuste Chromrahmen und hochwertige Materialien aus Deutschland."
            />
          </div>
        </div>
      </section>

      {/* Product Preview Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 bg-secondary/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 sm:mb-16 gap-4">
            <div>
              <p className="text-muted-foreground uppercase tracking-[0.2em] text-xs mb-4">Inspiration</p>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-foreground">Bestseller</h2>
            </div>
            <Link 
              href="/shop" 
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent transition-colors group"
            >
              Alle Produkte ansehen 
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <ProductCard
              youtubeId="ffjWvF61tJg"
              videoCrop={true}
              title="Starter Regal"
              description="4 Fächer, perfekt für den Einstieg"
              price="ab 399€"
              href="/konfigurator?preset=starter"
              cartItems={[
                { id: "SIM001", name: "Leiter 40", artNr: "SIM001", price: 13.5 },
                { id: "SIM001-2", name: "Leiter 40", artNr: "SIM001", price: 13.5 },
                { id: "SIM001-3", name: "Leiter 40", artNr: "SIM001", price: 13.5 },
                { id: "SIM007", name: "Stangenset 80", artNr: "SIM007", price: 12.0 },
                { id: "SIM007-2", name: "Stangenset 80", artNr: "SIM007", price: 12.0 },
              ]}
            />
            <ProductCard
              image="/medium-modular-shelf-system-4-compartments-chrome-.jpg"
              youtubeId="gBCkDel4Jlc"
              title="Home Office"
              description="4 Fächer mit Schubladen"
              price="ab 599€"
              href="/konfigurator?preset=homeoffice"
              cartItems={[
                { id: "SIM002", name: "Leiter 80", artNr: "SIM002", price: 20.5 },
                { id: "SIM002-2", name: "Leiter 80", artNr: "SIM002", price: 20.5 },
                { id: "SIM007", name: "Stangenset 80", artNr: "SIM007", price: 12.0 },
              ]}
            />
            <ProductCard
              image="/large-modular-wall-shelf-system-chrome-frame-color.jpg"
              youtubeId="hUbkjGIyy2E"
              videoCrop={false}
              title="Wohnzimmer Set"
              description="4 Fächer, individuell gestaltbar"
              price="ab 899€"
              href="/konfigurator?preset=wohnzimmer"
              cartItems={[
                { id: "SIM001", name: "Leiter 40", artNr: "SIM001", price: 13.5 },
                { id: "SIM001-2", name: "Leiter 40", artNr: "SIM001", price: 13.5 },
                { id: "SIM007", name: "Stangenset 80", artNr: "SIM007", price: 12.0 },
              ]}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 bg-foreground text-background">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-background/60 uppercase tracking-[0.2em] text-xs mb-6">Konfigurator</p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight">
            Gestalte dein eigenes Regal
          </h2>
          <p className="mt-6 text-background/70 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Mit unserem 3D-Konfigurator kannst du dein Traumregal in Echtzeit zusammenstellen. 
            Wähle Größe, Module und Farben nach deinen Wünschen.
          </p>
          <Link href="/konfigurator">
            <Button 
              size="lg" 
              className="mt-8 sm:mt-10 bg-background text-foreground hover:bg-background/90 rounded-full px-8 gap-2"
            >
              Konfigurator starten
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 sm:py-24 px-4 sm:px-6 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
            <div className="col-span-2 md:col-span-1">
              <span className="font-serif text-xl sm:text-2xl">Simpli Connect</span>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Modulare Regalsysteme aus Deutschland. Qualität seit 2020.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-4 text-sm uppercase tracking-wider">Produkte</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="/shop" className="hover:text-foreground transition-colors">
                    Shop
                  </Link>
                </li>
                <li>
                  <Link href="/konfigurator" className="hover:text-foreground transition-colors">
                    Konfigurator
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="hover:text-foreground transition-colors">
                    Zubehör
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-4 text-sm uppercase tracking-wider">Unternehmen</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="/ueber-uns" className="hover:text-foreground transition-colors">
                    Über uns
                  </Link>
                </li>
                <li>
                  <Link href="/kontakt" className="hover:text-foreground transition-colors">
                    Kontakt
                  </Link>
                </li>
                <li>
                  <Link href="/karriere" className="hover:text-foreground transition-colors">
                    Karriere
                  </Link>
                </li>
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
              <h4 className="font-medium text-foreground mb-4 text-sm uppercase tracking-wider">Rechtliches</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="/impressum" className="hover:text-foreground transition-colors">
                    Impressum
                  </Link>
                </li>
                <li>
                  <Link href="/datenschutz" className="hover:text-foreground transition-colors">
                    Datenschutz
                  </Link>
                </li>
                <li>
                  <Link href="/agb" className="hover:text-foreground transition-colors">
                    AGB
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 Simpli Connect. Alle Rechte vorbehalten.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                Instagram
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                LinkedIn
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                Pinterest
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({
  number,
  title,
  description,
}: { number: string; title: string; description: string }) {
  return (
    <div className="bg-card p-8 sm:p-10 group hover:bg-secondary/30 transition-colors">
      <span className="font-serif text-4xl sm:text-5xl text-accent/30 group-hover:text-accent transition-colors">
        {number}
      </span>
      <h3 className="font-medium text-foreground mt-6 mb-3 text-lg">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}

function ProductCard({
  image,
  youtubeId,
  videoCrop = true,
  title,
  description,
  price,
  href,
  cartItems,
}: {
  image?: string
  youtubeId?: string
  videoCrop?: boolean
  title: string
  description: string
  price: string
  href?: string
  cartItems?: { id: string; name: string; artNr: string; price: number; image?: string }[]
}) {
  const addItems = useCartStore((state) => state.addItems)
  const [addedToCart, setAddedToCart] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!youtubeId) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: "100px",
        threshold: 0.1,
      },
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [youtubeId])

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (cartItems && cartItems.length > 0) {
      addItems(cartItems)
      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 2000)
    }
  }

  const CardContent = () => (
    <div className="group">
      <div
        ref={containerRef}
        className="aspect-[4/5] bg-secondary rounded-lg overflow-hidden mb-5 relative"
      >
        {youtubeId && isVisible ? (
          <div className={`absolute inset-0 ${videoCrop ? "scale-150" : ""}`}>
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title={title}
            />
          </div>
        ) : image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-muted" />
        )}
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/60 transition-colors duration-300 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="text-background text-sm font-medium px-6 py-3 border border-background rounded-full hover:bg-background hover:text-foreground transition-colors">
            Konfigurieren
          </span>
          {cartItems && cartItems.length > 0 && (
            <button
              onClick={handleAddToCart}
              className={`mt-3 flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all ${
                addedToCart 
                  ? "bg-green-500 text-white" 
                  : "bg-background text-foreground hover:bg-background/90"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              {addedToCart ? "Hinzugefügt!" : "In den Warenkorb"}
            </button>
          )}
        </div>
      </div>
      
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-medium text-foreground text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <span className="text-foreground font-medium whitespace-nowrap">{price}</span>
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        <CardContent />
      </Link>
    )
  }

  return <CardContent />
}
