"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"
import {
  ArrowLeft,
  ShoppingCart,
  Package,
  Check,
  Truck,
  RotateCcw,
  Award,
  ChevronRight,
  Layers,
  Shield,
  Square,
  Palette,
  ArrowRight,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Product3DPreview } from "@/components/product-3d-preview"
import { useCartStore } from "@/lib/cart-store"

const product = {
  id: "mit-rueckwand-40",
  name: "Mit Rückwand 40",
  fullName: "Kompaktes Modul mit Rückwand",
  artNr: "MOD-40-003",
  description:
    "Das kompakte Modul mit geschlossener Rückwand im praktischen 40cm Format. Die Rückwand bietet nicht nur zusätzliche Stabilität, sondern schützt Ihre Gegenstände vor Staub und setzt sie perfekt in Szene. Ideal für die Präsentation von Sammlerstücken, Büchern oder wichtigen Dokumenten in kleineren Räumen.",
  shortDescription: "Geschützter Stauraum im kompakten Design.",
  price: 52.0,
  category: "40er",
  moduleType: "mit-rueckwand",
  width: 40,
  features: [
    { icon: Shield, title: "Geschützter Raum", description: "Rückwand schützt vor Staub und bietet Stabilität" },
    { icon: Square, title: "Perfekte Kulisse", description: "Idealer Hintergrund für Ihre Lieblingsstücke" },
    { icon: Layers, title: "Kompakt & Stabil", description: "40cm Breite mit zusätzlicher Stabilität" },
    { icon: Palette, title: "Design-Akzent", description: "Rückwand als farbiges Statement" },
  ],
  specs: [
    { label: "Breite", value: "40 cm" },
    { label: "Höhe", value: "40 cm" },
    { label: "Tiefe", value: "40 cm" },
    { label: "Material Korpus", value: "Pulverbeschichtetes Metall" },
    { label: "Material Rahmen", value: "Verchromter Stahl" },
    { label: "Belastbarkeit", value: "15 kg" },
  ],
}

const availableColors = [
  { id: "white", label: "Weiß", hex: "#f5f5f5" },
  { id: "black", label: "Schwarz", hex: "#1a1a1a" },
  { id: "blue", label: "Blau", hex: "#00bfff" },
  { id: "green", label: "Grün", hex: "#00994d" },
  { id: "yellow", label: "Gelb", hex: "#f0c000" },
  { id: "orange", label: "Orange", hex: "#ff7300" },
  { id: "red", label: "Rot", hex: "#e61919" },
]

const colorPrices: Record<string, number> = {
  white: 0, black: 0, blue: 15, green: 15, yellow: 15, orange: 15, red: 15,
}

const relatedProducts = [
  { id: "offenes-fach-40", name: "Offenes Fach 40", price: 45, moduleType: "offenes-fach" },
  { id: "mit-tuere-rechts-40", name: "Mit Türe Rechts 40", price: 65, moduleType: "mit-tuere-rechts" },
  { id: "abschliessbar-links-40", name: "Abschliessbar 40", price: 85, moduleType: "abschliessbar-links" },
]

export default function MitRueckwand40ProductPage() {
  const [selectedColor, setSelectedColor] = useState("white")
  const [added, setAdded] = useState(false)
  const [activeTab, setActiveTab] = useState<"features" | "specs">("features")
  const { addItem } = useCartStore()

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const currentPrice = product.price + (colorPrices[selectedColor] || 0)
  const selectedColorData = availableColors.find((c) => c.id === selectedColor)

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-${selectedColor}`,
      name: `${product.name} (${selectedColorData?.label})`,
      artNr: product.artNr,
      price: currentPrice,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/shop" className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Zurück zum Shop</span>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-900 flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Simpli Connect</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li><Link href="/" className="hover:text-teal-600 transition-colors">Home</Link></li>
          <li><ChevronRight className="w-4 h-4" /></li>
          <li><Link href="/shop" className="hover:text-teal-600 transition-colors">Shop</Link></li>
          <li><ChevronRight className="w-4 h-4" /></li>
          <li><Link href="/shop?category=40er" className="hover:text-teal-600 transition-colors">40er Module</Link></li>
          <li><ChevronRight className="w-4 h-4" /></li>
          <li className="text-gray-900 font-medium">{product.name}</li>
        </ol>
      </nav>

      {/* Product Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Product Image */}
          <div className="relative">
            <div className="absolute top-4 left-4 z-20">
              <Badge className="bg-gray-700 text-white border-0 px-3 py-1.5 text-xs font-semibold tracking-wide">
                40er SERIE
              </Badge>
            </div>
            <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden relative">
              <Product3DPreview moduleType={product.moduleType} color={selectedColor} width={40} />
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border border-gray-300" style={{ backgroundColor: selectedColorData?.hex }} />
                  <span className="text-sm font-medium text-gray-700">{selectedColorData?.label}</span>
                </div>
              </div>
            </div>
            {/* Thumbnail strip */}
            <div className="flex gap-2 mt-4">
              {availableColors.slice(0, 4).map((color) => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(color.id)}
                  className={`w-16 h-16 border-2 flex items-center justify-center transition-all ${
                    selectedColor === color.id ? "border-gray-900" : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <div className="w-10 h-10" style={{ backgroundColor: color.hex }} />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <p className="text-sm text-gray-500 font-mono">{product.artNr}</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mt-2 text-balance">{product.name}</h1>
            <p className="text-lg text-gray-600 mt-2">{product.fullName}</p>

            <div className="flex items-baseline gap-3 mt-6">
              <span className="text-5xl font-bold text-gray-900">{currentPrice.toFixed(2)}</span>
              <span className="text-2xl text-gray-500">EUR</span>
            </div>
            {colorPrices[selectedColor] > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Grundpreis {product.price.toFixed(2)} EUR + {colorPrices[selectedColor].toFixed(2)} EUR Farbaufschlag
              </p>
            )}
            <p className="text-sm text-gray-500">inkl. MwSt. zzgl. Versand</p>
            <p className="text-gray-600 leading-relaxed mt-6 text-lg">{product.shortDescription}</p>

            {/* Color Selection */}
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Farbe wählen</h3>
              <div className="flex flex-wrap gap-3">
                {availableColors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color.id)}
                    className={`group relative flex items-center gap-3 px-4 py-3 border-2 transition-all ${
                      selectedColor === color.id ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <div className="w-6 h-6 border border-gray-300 shadow-inner" style={{ backgroundColor: color.hex }} />
                    <span className={`text-sm font-medium ${selectedColor === color.id ? "text-gray-900" : "text-gray-600"}`}>
                      {color.label}
                    </span>
                    {colorPrices[color.id] > 0 && <span className="text-xs text-gray-400">+{colorPrices[color.id]} EUR</span>}
                    {selectedColor === color.id && <Check className="w-4 h-4 text-gray-900 absolute -top-1.5 -right-1.5 bg-white" />}
                  </button>
                ))}
              </div>
            </div>

            <Separator className="my-8 bg-gray-200" />

            {/* Add to Cart */}
            <div className="space-y-4">
              <Button
                size="lg"
                className={`w-full gap-3 text-lg py-7 font-semibold transition-all ${added ? "bg-green-600 hover:bg-green-600" : "bg-gray-900 hover:bg-gray-800"}`}
                onClick={handleAddToCart}
              >
                {added ? (<><Check className="w-6 h-6" />Hinzugefügt!</>) : (<><ShoppingCart className="w-6 h-6" />In den Warenkorb - {currentPrice.toFixed(2)} EUR</>)}
              </Button>
              <Link href={`/konfigurator?preset=${product.moduleType}`} className="block">
                <Button variant="outline" size="lg" className="w-full gap-2 py-6 border-2 border-teal-600 text-teal-600 hover:bg-teal-50 bg-transparent">
                  <Package className="w-5 h-5" />Weiter konfigurieren
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="flex flex-col items-center text-center p-4 bg-gray-50">
                <Truck className="w-6 h-6 text-gray-700 mb-2" />
                <span className="text-xs font-medium text-gray-700">Kostenloser Versand</span>
                <span className="text-xs text-gray-500">ab 100 EUR</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-gray-50">
                <RotateCcw className="w-6 h-6 text-gray-700 mb-2" />
                <span className="text-xs font-medium text-gray-700">30 Tage</span>
                <span className="text-xs text-gray-500">Rückgaberecht</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-gray-50">
                <Award className="w-6 h-6 text-gray-700 mb-2" />
                <span className="text-xs font-medium text-gray-700">Premium</span>
                <span className="text-xs text-gray-500">Qualität</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features & Specs Tabs */}
      <section className="bg-gray-50 py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center gap-2 mb-12">
            <button onClick={() => setActiveTab("features")} className={`px-8 py-3 font-semibold text-sm uppercase tracking-wide transition-all ${activeTab === "features" ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-100"}`}>
              Eigenschaften
            </button>
            <button onClick={() => setActiveTab("specs")} className={`px-8 py-3 font-semibold text-sm uppercase tracking-wide transition-all ${activeTab === "specs" ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-100"}`}>
              Technische Daten
            </button>
          </div>

          {activeTab === "features" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {product.features.map((feature, index) => (
                <div key={index} className="bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 bg-gray-900 flex items-center justify-center mb-6">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "specs" && (
            <div className="max-w-2xl mx-auto bg-white shadow-sm">
              <div className="divide-y divide-gray-100">
                {product.specs.map((spec, index) => (
                  <div key={index} className="flex items-center justify-between px-6 py-5">
                    <span className="text-gray-600">{spec.label}</span>
                    <span className="font-semibold text-gray-900">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Product Description */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Produktbeschreibung</h2>
        <div className="prose prose-lg max-w-none text-gray-600 space-y-4">
          <p>{product.description}</p>
          <p>
            Die geschlossene Rückwand macht dieses Modul zur idealen Wahl für die Präsentation von Sammlerstücken, 
            Büchern oder Dekorationsartikeln. Die farbige Rückwand kann als Design-Akzent eingesetzt werden und 
            setzt Ihre Lieblingsstücke perfekt in Szene.
          </p>
          <p>
            Dank des modularen Simpli Connect Systems können Sie dieses Modul beliebig mit anderen 40er oder 80er 
            Modulen kombinieren. Der robuste Metallrahmen mit verchromter Oberfläche garantiert langlebige Qualität 
            und zeitloses Design für Ihr Zuhause oder Büro.
          </p>
        </div>
      </section>

      {/* Related Products */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Weitere 40er Module</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((related) => (
              <Link key={related.id} href={`/shop/${related.id}`} className="group">
                <div className="bg-white p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="aspect-square bg-gray-100 mb-4 overflow-hidden">
                    <Product3DPreview moduleType={related.moduleType} color="white" width={40} />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">{related.name}</h3>
                  <p className="text-gray-600 mt-1">ab {related.price.toFixed(2)} EUR</p>
                </div>
              </Link>
            ))}
            <Link href="/shop?category=40er" className="group">
              <div className="bg-gray-900 p-4 h-full flex flex-col items-center justify-center text-center min-h-[280px]">
                <span className="text-white font-semibold mb-2">Alle 40er Module</span>
                <ArrowRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">2026 Simpli Connect. Alle Rechte vorbehalten.</p>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-gray-600 hover:text-teal-600 text-sm transition-colors">Home</Link>
              <Link href="/shop" className="text-gray-600 hover:text-teal-600 text-sm transition-colors">Shop</Link>
              <Link href="/konfigurator" className="text-gray-600 hover:text-teal-600 text-sm transition-colors">Konfigurator</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
