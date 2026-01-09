"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Palette, Box, Truck, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ImageUpload } from "@/components/image-upload"

const collections = [
  {
    id: "modular",
    name: "Modular",
    headline: "Modular",
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
      <section className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover">
            <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/0108%281%29-pS6CfKhfSUB0VKDFJvOzkgxn7AYWh3.mov" type="video/quicktime" />
            <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/0108%281%29-pS6CfKhfSUB0VKDFJvOzkgxn7AYWh3.mov" type="video/mp4" />
            {/* Fallback image if video doesn't load */}
            <img
              src="/modern-chrome-modular-shelf-system-white-backgroun.jpg"
              alt="Simpli Connect Regalsystem"
              className="w-full h-full object-cover"
            />
          </video>
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* Navigation - minimal, just brand name */}
        <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="text-white/90 hover:text-white transition">
              <span className="font-bold text-xl tracking-widest uppercase">Simpli Connect</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/shop" className="text-sm font-medium text-white/80 hover:text-white transition">
                Shop
              </Link>
              <Link href="/konfigurator" className="text-sm font-medium text-white/80 hover:text-white transition">
                Konfigurator
              </Link>
              <Link href="/kontakt" className="text-sm font-medium text-white/80 hover:text-white transition">
                Kontakt
              </Link>
              <Link href="/warenkorb" className="text-sm font-medium text-white/80 hover:text-white transition">
                Warenkorb
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col justify-between px-6 pt-44 pb-24">
          {/* Main Content - Top left aligned, above the shelf */}
          <div className="max-w-7xl mx-auto w-full">
            <h1 className="text-7xl md:text-8xl font-bold text-white leading-none lg:text-9xl tracking-tight px-px my-[-70px] mx-20">
              {activeCollection.headline}
            </h1>
          </div>

          {/* Spacer to push selector to bottom */}
          <div className="flex-1" />

          {/* Collection Selector - Bottom center */}
          <div className="max-w-7xl mx-auto w-full flex justify-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full p-1.5 py-[-6px] py-[-36px] py-0">
              {collections.map((collection) => (
                <button
                  key={collection.id}
                  onClick={() => setActiveCollection(collection)}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeCollection.id === collection.id
                      ? "bg-white text-black shadow-lg"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  {collection.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/70 rounded-full" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Warum Simpli Connect?</h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Unser modulares System vereint deutsches Qualitätshandwerk mit zeitlosem Design.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Box className="w-6 h-6" />}
              title="Modulares System"
              description="Kombiniere Module nach deinen Wünschen. Erweitere jederzeit."
            />
            <FeatureCard
              icon={<Palette className="w-6 h-6" />}
              title="Individuelle Farben"
              description="Wähle aus 6 Sonderfarben oder klassischem Weiß und Schwarz."
            />
            <FeatureCard
              icon={<Truck className="w-6 h-6" />}
              title="Schnelle Lieferung"
              description="Versandfertig in 5-7 Werktagen. Kostenlos ab 500€."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Premium Qualität"
              description="Robuste Chromrahmen und hochwertige Materialien."
            />
          </div>
        </div>
      </section>

      {/* Product Preview Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Beliebte Konfigurationen</h2>
              <p className="mt-2 text-gray-600">Lass dich von unseren Bestsellern inspirieren.</p>
            </div>
            <Link
              href="/shop"
              className="hidden md:flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all"
            >
              Alle ansehen <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <ProductCard
              image="/images/metanoia-ibiza-httpss.png"
              title="Starter Regal"
              description="2 Fächer, perfekt für den Einstieg"
              price="ab 299€"
            />
            <ProductCard
              image="/medium-modular-shelf-system-4-compartments-chrome-.jpg"
              title="Home Office"
              description="4 Fächer mit Schubladen"
              price="ab 599€"
            />
            <ProductCard
              image="/large-modular-wall-shelf-system-chrome-frame-color.jpg"
              title="Wohnzimmer Set"
              description="6 Fächer, individuell gestaltbar"
              price="ab 899€"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Gestalte dein eigenes Regal</h2>
          <p className="mt-4 text-gray-400 max-w-xl mx-auto">
            Mit unserem 3D-Konfigurator kannst du dein Traumregal in Echtzeit zusammenstellen. Wähle Größe, Module und
            Farben nach deinen Wünschen.
          </p>
          <Link href="/konfigurator">
            <Button size="lg" className="mt-8 bg-white text-black hover:bg-gray-100 gap-2">
              Konfigurator starten
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="font-bold text-lg tracking-widest uppercase">Simpli Connect</span>
              </div>
              <p className="text-sm text-gray-600">Modulare Regalsysteme aus Deutschland. Qualität seit 2020.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produkte</h4>
              <ul className="space-y-2 text-sm text-gray-600">
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
              <h4 className="font-semibold mb-4">Unternehmen</h4>
              <ul className="space-y-2 text-sm text-gray-600">
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
            <div>
              <h4 className="font-semibold mb-4">Rechtliches</h4>
              <ul className="space-y-2 text-sm text-gray-600">
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
          <div className="mt-12 pt-8 border-t border-gray-100 text-center text-sm text-gray-500">
            © 2026 Simpli Connect. Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">{icon}</div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  )
}

function ProductCard({
  image,
  title,
  description,
  price,
}: { image: string; title: string; description: string; price: string }) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)

  const displayImage = uploadedImage || image

  return (
    <div className="group cursor-auto">
      <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-4">
        <ImageUpload onImageUpload={setUploadedImage} fallbackImage={displayImage} alt={title} />
      </div>
      <Link href="/konfigurator" className="group">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
        <p className="mt-2 font-semibold text-black">{price}</p>
      </Link>
    </div>
  )
}
