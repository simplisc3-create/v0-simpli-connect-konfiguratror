"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowRight, Palette, Box, Truck, Shield, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ImageUpload } from "@/components/image-upload"
import { SiteHeader } from "@/components/site-header"
import { useCartStore } from "@/lib/cart-store"

const collections = [
  {
    id: "modular",
    name: "Modular",
    headline: "Modular Furniture",
    description:
      "Jedes Stück beginnt mit den feinsten Materialien, sorgfältig ausgewählt für Schönheit, Langlebigkeit und nachhaltige Herkunft. Unsere Handwerker ehren traditionelle Techniken und nutzen moderne Präzision.",
  },
  {
    id: "office",
    name: "Office",
    headline: "Office",
    description:
      "Professionelle Regalsysteme für den modernen Arbeitsplatz. Maximale Organisation trifft auf zeitloses Design für produktive Umgebungen.",
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
    <main className="min-h-screen bg-white">
      <SiteHeader transparent />

      <section className="relative h-[100dvh] w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            preload="auto"
            className="w-full h-full object-cover"
          >
            <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/0108%281%29-pS6CfKhfSUB0VKDFJvOzkgxn7AYWh3.mov" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col px-4 sm:px-6">
          {/* Spacer for nav */}
          <div className="h-16 sm:h-20 shrink-0" />

          {/* Main Content — vertically centered in remaining space */}
          <div className="flex-1 flex flex-col items-center justify-center gap-6 sm:gap-8">
            <h1 className="text-balance text-center text-5xl sm:text-7xl md:text-8xl lg:text-[7rem] xl:text-[8rem] font-bold text-white leading-none tracking-tight">
              {activeCollection.headline}
            </h1>

            {/* Collection Selector */}
            <div className="inline-flex items-center gap-1 sm:gap-1.5 bg-white/15 backdrop-blur-md rounded-full p-1">
              {collections.map((collection) => (
                <button
                  key={collection.id}
                  onClick={() => setActiveCollection(collection)}
                  className={`px-4 sm:px-7 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                    activeCollection.id === collection.id
                      ? "bg-white text-black shadow-lg"
                      : "text-white hover:bg-white/15"
                  }`}
                >
                  {collection.name}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom scroll hint */}
          <div className="pb-8 sm:pb-10 flex justify-center">
            <div className="animate-bounce">
              <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2">
                <div className="w-1.5 h-3 bg-white/60 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - optimized grid for mobile */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Warum Simpli Connect?</h2>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
              Unser modulares System vereint deutsches Qualitätshandwerk mit zeitlosem Design.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8">
            <FeatureCard
              icon={<Box className="w-5 h-5 sm:w-6 sm:h-6" />}
              title="Modulares System"
              description="Kombiniere Module nach deinen Wünschen. Erweitere jederzeit."
              bgColor="bg-yellow-400"
            />
            <FeatureCard
              icon={<Palette className="w-5 h-5 sm:w-6 sm:h-6" />}
              title="Individuelle Farben"
              description="Wähle aus 6 Sonderfarben oder klassischem Weiß und Schwarz."
              bgColor="bg-red-500"
            />
            <FeatureCard
              icon={<Truck className="w-5 h-5 sm:w-6 sm:h-6" />}
              title="Schnelle Lieferung"
              description="Versandfertig in 5-7 Werktagen. Kostenlos ab 500€."
              bgColor="bg-green-500"
            />
            <FeatureCard
              icon={<Shield className="w-5 h-5 sm:w-6 sm:h-6" />}
              title="Premium Qualität"
              description="Robuste Chromrahmen und hochwertige Materialien."
              bgColor="bg-orange-500"
            />
          </div>
        </div>
      </section>

      {/* Product Preview Section - optimized for mobile */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 sm:mb-12 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Bestseller</h2>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
                Lass dich von unseren Bestsellern inspirieren.
              </p>
            </div>
            <Link href="/shop" className="flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all">
              Alle ansehen <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 sm:gap-8 snap-x snap-mandatory sm:snap-none scrollbar-hide">
            <div className="flex-shrink-0 w-[280px] sm:w-auto mr-4 sm:mr-0 snap-start">
              <ProductCard
                youtubeId="ffjWvF61tJg"
                videoCrop={true}
                title="Starter Regal"
                description="4 Fächer, perfekt für den Einstieg"
                price="ab 399€"
                href="/konfigurator?preset=starter"
                badge="NEU"
                hoverMessage="selbst konfigurieren"
                cartItems={[
                  { id: "SIM001", name: "Leiter 40", artNr: "SIM001", price: 13.5 },
                  { id: "SIM001-2", name: "Leiter 40", artNr: "SIM001", price: 13.5 },
                  { id: "SIM001-3", name: "Leiter 40", artNr: "SIM001", price: 13.5 },
                  { id: "SIM007", name: "Stangenset 80", artNr: "SIM007", price: 12.0 },
                  { id: "SIM007-2", name: "Stangenset 80", artNr: "SIM007", price: 12.0 },
                  { id: "SIM007-3", name: "Stangenset 80", artNr: "SIM007", price: 12.0 },
                  { id: "SIM007-4", name: "Stangenset 80", artNr: "SIM007", price: 12.0 },
                  { id: "SIM010", name: "Flächenset 40 weiß grün", artNr: "SIM010-green", price: 15.0 },
                  { id: "SIM010-2", name: "Flächenset 40 weiß grün", artNr: "SIM010-green", price: 15.0 },
                  { id: "SIM011", name: "Flächenset 80 weiß grün", artNr: "SIM011-green", price: 22.0 },
                  { id: "SIM011-2", name: "Flächenset 80 weiß grün", artNr: "SIM011-green", price: 22.0 },
                ]}
              />
            </div>
            <div className="flex-shrink-0 w-[280px] sm:w-auto mr-4 sm:mr-0 snap-start">
              <ProductCard
                image="/medium-modular-shelf-system-4-compartments-chrome-.jpg"
                youtubeId="gBCkDel4Jlc"
                title="Home Office"
                description="4 Fächer mit Schubladen"
                price="ab 599€"
                href="/konfigurator?preset=homeoffice"
                badge="NEU"
                hoverMessage="selbst konfigurieren"
                cartItems={[
                  { id: "SIM002", name: "Leiter 80", artNr: "SIM002", price: 20.5 },
                  { id: "SIM002-2", name: "Leiter 80", artNr: "SIM002", price: 20.5 },
                  { id: "SIM002-3", name: "Leiter 80", artNr: "SIM002", price: 20.5 },
                  { id: "SIM007", name: "Stangenset 80", artNr: "SIM007", price: 12.0 },
                  { id: "SIM007-2", name: "Stangenset 80", artNr: "SIM007", price: 12.0 },
                  { id: "SIM007-3", name: "Stangenset 80", artNr: "SIM007", price: 12.0 },
                  { id: "SIM007-4", name: "Stangenset 80", artNr: "SIM007", price: 12.0 },
                  { id: "SIM018-blau", name: "Doppelschublade blau", artNr: "SIM018-blue", price: 85.0 },
                  { id: "SIM018-blau-2", name: "Doppelschublade blau", artNr: "SIM018-blue", price: 85.0 },
                  { id: "SIM018-blau-3", name: "Doppelschublade blau", artNr: "SIM018-blue", price: 85.0 },
                  { id: "SIM018-blau-4", name: "Doppelschublade blau", artNr: "SIM018-blue", price: 85.0 },
                ]}
              />
            </div>
            <div className="flex-shrink-0 w-[280px] sm:w-auto snap-start">
              <ProductCard
                image="/large-modular-wall-shelf-system-chrome-frame-color.jpg"
                youtubeId="hUbkjGIyy2E"
                videoCrop={false}
                title="Wohnzimmer Set"
                description="4 Fächer, individuell gestaltbar"
                price="ab 899€"
                href="/konfigurator?preset=wohnzimmer"
                badge="NEU"
                hoverMessage="selbst konfigurieren"
                cartItems={[
                  { id: "SIM001", name: "Leiter 40", artNr: "SIM001", price: 13.5 },
                  { id: "SIM001-2", name: "Leiter 40", artNr: "SIM001", price: 13.5 },
                  { id: "SIM007", name: "Stangenset 80", artNr: "SIM007", price: 12.0 },
                  { id: "SIM007-2", name: "Stangenset 80", artNr: "SIM007", price: 12.0 },
                  { id: "SIM007-3", name: "Stangenset 80", artNr: "SIM007", price: 12.0 },
                  { id: "SIM007-4", name: "Stangenset 80", artNr: "SIM007", price: 12.0 },
                  { id: "SIM010", name: "Flächenset 40 weiß", artNr: "SIM010", price: 15.0 },
                  { id: "SIM011", name: "Flächenset 80 weiß", artNr: "SIM011", price: 22.0 },
                  { id: "SIM011-2", name: "Flächenset 80 weiß", artNr: "SIM011", price: 22.0 },
                  { id: "SIM011-3", name: "Flächenset 80 weiß", artNr: "SIM011", price: 22.0 },
                  { id: "SIM011-4", name: "Flächenset 80 weiß", artNr: "SIM011", price: 22.0 },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Gestalte dein eigenes Regal</h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-400 max-w-xl mx-auto px-4">
            Mit unserem 3D-Konfigurator kannst du dein Traumregal in Echtzeit zusammenstellen. Wähle Größe, Module und
            Farben nach deinen Wünschen.
          </p>
          <Link href="/konfigurator">
            <Button size="lg" className="mt-6 sm:mt-8 bg-white text-black hover:bg-gray-100 gap-2">
              Konfigurator starten
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer - optimized for mobile */}
      <footer className="py-8 sm:py-12 px-4 sm:px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <span className="font-bold text-base sm:text-lg tracking-widest uppercase">Simpli Connect</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600">
                Modulare Regalsysteme aus Deutschland. Qualität seit 2020.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Produkte</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                <li>
                  <Link href="/shop" className="hover:text-black transition">
                    Shop
                  </Link>
                </li>
                <li>
                  <Link href="/konfigurator" className="hover:text-black transition">
                    Konfigurator
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="hover:text-black transition">
                    Zubehör
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Unternehmen</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                <li>
                  <Link href="/ueber-uns" className="hover:text-black transition">
                    Über uns
                  </Link>
                </li>
                <li>
                  <Link href="/kontakt" className="hover:text-black transition">
                    Kontakt
                  </Link>
                </li>
                <li>
                  <Link href="/karriere" className="hover:text-black transition">
                    Karriere
                  </Link>
                </li>
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Rechtliches</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                <li>
                  <Link href="/impressum" className="hover:text-black transition">
                    Impressum
                  </Link>
                </li>
                <li>
                  <Link href="/datenschutz" className="hover:text-black transition">
                    Datenschutz
                  </Link>
                </li>
                <li>
                  <Link href="/agb" className="hover:text-black transition">
                    AGB
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-100 text-center text-xs sm:text-sm text-gray-500">
            © 2026 Simpli Connect. Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  bgColor,
}: { icon: React.ReactNode; title: string; description: string; bgColor?: string }) {
  return (
    <div
      className={`${bgColor || "bg-white"} rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition`}
    >
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/80 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4">
        {icon}
      </div>
      <h3 className={`font-semibold text-sm sm:text-lg mb-1 sm:mb-2 ${bgColor ? "text-white" : ""}`}>{title}</h3>
      <p className={`text-xs sm:text-sm ${bgColor ? "text-white/90" : "text-gray-600"}`}>{description}</p>
    </div>
  )
}

function ProductCard({
  image,
  video,
  youtubeId,
  videoCrop = true,
  title,
  description,
  price,
  href,
  badge,
  hoverMessage,
  cartItems,
}: {
  image?: string
  video?: string
  youtubeId?: string
  videoCrop?: boolean
  title: string
  description: string
  price: string
  href?: string
  badge?: string
  hoverMessage?: string
  cartItems?: { id: string; name: string; artNr: string; price: number; image?: string }[]
}) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
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
          observer.disconnect() // Only load once
        }
      },
      {
        rootMargin: "100px", // Start loading 100px before entering viewport
        threshold: 0.1,
      },
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [youtubeId])

  const displayImage = uploadedImage || image

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
    <>
      <div
        ref={containerRef}
        className="aspect-square bg-gray-700 rounded-xl sm:rounded-2xl overflow-hidden mb-3 sm:mb-4 relative group"
      >
        {badge && (
          <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-40 animate-pulse hover:animate-none hover:scale-110 transition-transform cursor-pointer">
            <span className="bg-red-600 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg hover:bg-red-700 transition-colors">
              {badge}
            </span>
          </div>
        )}
        {hoverMessage && (
          <div className="absolute inset-0 z-30 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 sm:gap-4">
            <span className="text-white text-sm sm:text-lg font-semibold px-4 sm:px-6 py-2 sm:py-3 border-2 border-white rounded-full hover:bg-white hover:text-black transition-colors">
              {hoverMessage}
            </span>
            {cartItems && cartItems.length > 0 && (
              <button
                onClick={handleAddToCart}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-all ${
                  addedToCart ? "bg-green-500 text-white" : "bg-white text-black hover:bg-gray-200"
                }`}
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                {addedToCart ? "Hinzugefügt!" : "Warenkorb"}
              </button>
            )}
          </div>
        )}
        {youtubeId ? (
          <div className="absolute inset-0 z-20 overflow-hidden pointer-events-none bg-black">
            {isVisible ? (
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
                allow="autoplay; encrypted-media"
                allowFullScreen
                loading="lazy"
                className={`pointer-events-none ${videoCrop ? "absolute top-1/2 left-1/2" : "w-full h-full"}`}
                style={
                  videoCrop
                    ? {
                        border: "none",
                        width: "300%",
                        height: "300%",
                        transform: "translate(-50%, -50%)",
                      }
                    : {
                        border: "none",
                      }
                }
              />
            ) : (
              // Lightweight placeholder while not visible
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                  <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white/50 border-b-8 border-b-transparent ml-1" />
                </div>
              </div>
            )}
          </div>
        ) : video ? (
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-20">
            <source src={video} type="video/mp4" />
          </video>
        ) : (
          <ImageUpload onImageUpload={setUploadedImage} fallbackImage={displayImage} alt={title} />
        )}
      </div>
      <h3 className="font-semibold text-base sm:text-lg">{title}</h3>
      <p className="text-gray-600 text-xs sm:text-sm">{description}</p>
      <p className="mt-1 sm:mt-2 font-semibold text-black text-sm sm:text-base">{price}</p>
    </>
  )

  if (href) {
    return (
      <Link href={href} className="group cursor-pointer block relative">
        <CardContent />
      </Link>
    )
  }

  return (
    <div className="group cursor-auto relative">
      <CardContent />
    </div>
  )
}
