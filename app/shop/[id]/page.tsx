"use client"

import { Button } from "@/components/ui/button"
import type React from "react"
import { useParams, notFound } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, ShoppingCart, Package, Ruler, Hash, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Product3DPreview } from "@/components/product-3d-preview"
import { useCartStore } from "@/lib/cart-store"

// Module products with 3D previews - same as shop page
const products = [
  {
    id: "offenes-fach",
    name: "Offenes Fach",
    artNr: "MOD-001",
    description: "Offenes Regalfach ohne Abdeckungen - perfekt für schnellen Zugriff und Dekoration. Die offene Bauweise ermöglicht maximale Flexibilität bei der Gestaltung deines Regalsystems.",
    price: 29.0,
    category: "40er",
    moduleType: "offenes-fach",
  },
  {
    id: "ohne-seitenwaende",
    name: "Ohne Seitenwände",
    artNr: "MOD-002",
    description: "Modul ohne Seitenwände - für durchgehende Regale und offene Raumgestaltung. Ideal für breite Objekte oder wenn du einen fließenden Look bevorzugst.",
    price: 32.0,
    category: "40er",
    moduleType: "ohne-seitenwaende",
  },
  {
    id: "ohne-rueckwand",
    name: "Ohne Rückwand",
    artNr: "MOD-003",
    description: "Modul ohne Rückwand - ideal als Raumteiler mit beidseitigem Zugang. Perfekt für offene Wohnkonzepte und flexible Raumgestaltung.",
    price: 35.0,
    category: "40er",
    moduleType: "ohne-rueckwand",
  },
  {
    id: "mit-rueckwand",
    name: "Mit Rückwand",
    artNr: "MOD-004",
    description: "Geschlossenes Modul mit Rückwand - für einen aufgeräumten Look. Die Rückwand verhindert das Durchrutschen von Gegenständen und bietet zusätzliche Stabilität.",
    price: 42.0,
    category: "40er",
    moduleType: "mit-rueckwand",
  },
  {
    id: "mit-tueren",
    name: "Mit Türen",
    artNr: "MOD-005",
    description: "Modul mit zwei Türen - Stauraum mit elegantem Verschluss. Verbirg den Inhalt stilvoll und halte Staub fern. Push-to-open Mechanismus für komfortable Bedienung.",
    price: 65.0,
    category: "80er",
    moduleType: "mit-tueren",
  },
  {
    id: "mit-klapptuer",
    name: "Mit Klapptür",
    artNr: "MOD-006",
    description: "Modul mit nach unten öffnender Klapptür - platzsparend und praktisch. Soft-Close-Scharniere für sanftes Schließen.",
    price: 55.0,
    category: "40er",
    moduleType: "mit-klapptuer",
  },
  {
    id: "mit-klapptuer-oben",
    name: "Klapptür (nach oben)",
    artNr: "MOD-007",
    description: "Modul mit nach oben öffnender Klapptür - für Überkopf-Zugang. Gasfeder-Unterstützung hält die Tür offen während du Gegenstände entnimmst.",
    price: 58.0,
    category: "40er",
    moduleType: "mit-klapptuer-oben",
  },
  {
    id: "mit-doppelschublade",
    name: "Mit Schubladen",
    artNr: "MOD-008",
    description: "Modul mit zwei Schubladen - optimaler Stauraum für Kleinteile. Vollauszug mit Soft-Close für komfortable Bedienung und leisen Betrieb.",
    price: 85.0,
    category: "80er",
    moduleType: "mit-doppelschublade",
  },
  {
    id: "mit-einzelschublade",
    name: "Einzelschublade",
    artNr: "MOD-009",
    description: "Modul mit einer Schublade - kompakter Stauraum für einzelne Fächer. Perfekt für die obere Regalreihe oder als Akzent.",
    price: 48.0,
    category: "40er",
    moduleType: "mit-einzelschublade",
  },
  {
    id: "abschliessbare-tueren",
    name: "Abschließbar",
    artNr: "MOD-010",
    description: "Modul mit abschließbaren Türen - sicherer Stauraum für Wertgegenstände. Hochwertiges Schloss mit zwei Schlüsseln inklusive.",
    price: 95.0,
    category: "80er",
    moduleType: "abschliessbare-tueren",
  },
]

// Available colors matching the configurator
const availableColors = [
  { id: "white", label: "Weiß", hex: "#FFFFFF" },
  { id: "grey", label: "Grau", hex: "#9E9E9E" },
  { id: "black", label: "Schwarz", hex: "#111111" },
  { id: "blue", label: "Blau", hex: "#1E5EFF" },
  { id: "green", label: "Grün", hex: "#2FAE5D" },
  { id: "yellow", label: "Gelb", hex: "#FFD400" },
  { id: "orange", label: "Orange", hex: "#FF8A00" },
  { id: "red", label: "Rot", hex: "#E53935" },
]

// Color price adjustments
const colorPrices: Record<string, number> = {
  white: 0,
  grey: 0,
  black: 0,
  blue: 15,
  green: 15,
  yellow: 15,
  orange: 15,
  red: 15,
}

export default function ProductDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const product = products.find((p) => p.id === id)
  
  const [selectedColor, setSelectedColor] = useState("white")
  const [added, setAdded] = useState(false)
  const { addItem } = useCartStore()

  if (!product) {
    notFound()
  }

  const currentPrice = product.price + (colorPrices[selectedColor] || 0)
  const selectedColorData = availableColors.find(c => c.id === selectedColor)

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

  // Category labels
  const categoryLabels: Record<string, string> = {
    "40er": "40er Module",
    "80er": "80er Module",
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/shop" className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Zurück zum Shop</span>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
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
          <li>
            <Link href="/" className="hover:text-teal-600 transition-colors">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/shop" className="hover:text-teal-600 transition-colors">
              Shop
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 truncate max-w-[200px]">{product.name}</li>
        </ol>
      </nav>

      {/* Product Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* 3D Viewer */}
          <div className="relative">
            <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden">
              <Product3DPreview
                moduleType={product.moduleType}
                color={selectedColor}
                width={80}
                autoRotate={true}
              />
            </div>
            {/* Category badge */}
            <Badge
              variant="secondary"
              className="absolute top-4 left-4 bg-teal-500/10 text-teal-600 border-teal-500/20 z-20"
            >
              {categoryLabels[product.category] || product.category}
            </Badge>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {/* Title & Price */}
            <div>
              <p className="text-sm text-gray-500 mb-2">{product.artNr}</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight text-balance">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-4xl font-bold text-teal-600">{currentPrice.toFixed(2)} €</span>
                <span className="text-gray-500 text-sm">inkl. MwSt.</span>
              </div>
              {colorPrices[selectedColor] > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Grundpreis {product.price.toFixed(2)} € + {colorPrices[selectedColor].toFixed(2)} € Farbaufschlag
                </p>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed mt-6">{product.description}</p>

            {/* Color Selection */}
            <div className="mt-8">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Farbe wählen</h3>
              <div className="flex flex-wrap gap-3">
                {availableColors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                      selectedColor === color.id 
                        ? "border-teal-500 bg-teal-500/5" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div 
                      className="w-6 h-6 rounded-full border border-gray-300 shadow-inner" 
                      style={{ backgroundColor: color.hex }} 
                    />
                    <span className={`text-sm font-medium ${selectedColor === color.id ? "text-teal-600" : "text-gray-700"}`}>
                      {color.label}
                    </span>
                    {colorPrices[color.id] > 0 && (
                      <span className="text-xs text-gray-400">+{colorPrices[color.id]}€</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <Separator className="my-8 bg-gray-200" />

            {/* Specifications */}
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Spezifikationen</h3>
              <SpecRow icon={Hash} label="Artikelnummer" value={product.artNr} />
              <SpecRow icon={Ruler} label="Breite" value="80 cm" />
              <SpecRow icon={Package} label="Kategorie" value={categoryLabels[product.category] || product.category} />
            </div>

            <Separator className="my-8 bg-gray-200" />

            {/* Add to Cart */}
            <div className="mt-auto space-y-3">
              <Button
                size="lg"
                className={`w-full gap-2 text-lg py-6 ${
                  added 
                    ? "bg-green-600 hover:bg-green-600" 
                    : "bg-teal-600 hover:bg-teal-700"
                }`}
                onClick={handleAddToCart}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5" />
                    Hinzugefügt!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    In den Warenkorb - {currentPrice.toFixed(2)} €
                  </>
                )}
              </Button>
              <Link href={`/konfigurator?preset=${product.moduleType}`} className="block">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full gap-2 py-6 border-2 border-teal-600 text-teal-600 hover:bg-teal-50 bg-transparent"
                >
                  <Package className="w-5 h-5" />
                  Weiter konfigurieren
                </Button>
              </Link>
              <p className="text-center text-gray-500 text-sm mt-3">Kostenloser Versand ab 100 €</p>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <RelatedProducts currentProductId={product.id} category={product.category} selectedColor={selectedColor} />
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">© 2026 Simpli Connect. Alle Rechte vorbehalten.</p>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-gray-600 hover:text-teal-600 text-sm transition-colors">
                Home
              </Link>
              <Link href="/shop" className="text-gray-600 hover:text-teal-600 text-sm transition-colors">
                Shop
              </Link>
              <Link href="/konfigurator" className="text-gray-600 hover:text-teal-600 text-sm transition-colors">
                Konfigurator
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

// Specification row component
function SpecRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100">
        <Icon className="w-5 h-5 text-teal-600" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-gray-900 font-medium">{value}</p>
      </div>
    </div>
  )
}

// Related products component with 3D previews
function RelatedProducts({ currentProductId, category, selectedColor }: { currentProductId: string; category: string; selectedColor: string }) {
  const related = products.filter((p) => p.category === category && p.id !== currentProductId).slice(0, 4)

  if (related.length === 0) return null

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Ähnliche Module</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {related.map((product) => (
          <Link
            key={product.id}
            href={`/shop/${product.id}`}
            className="group block bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-teal-500/50 hover:shadow-md transition-all duration-300"
          >
            <div className="aspect-square bg-gray-50 overflow-hidden">
              <Product3DPreview
                moduleType={product.moduleType}
                color={selectedColor}
                width={80}
                autoRotate={true}
              />
            </div>
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-teal-600 transition-colors">
                {product.name}
              </h3>
              <p className="text-teal-600 font-semibold mt-1">ab {product.price.toFixed(2)} €</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
