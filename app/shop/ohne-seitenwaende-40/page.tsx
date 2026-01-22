"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"
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
  Wind,
  Maximize,
  Move,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Product3DPreview } from "@/components/product-3d-preview"
import { useCartStore } from "@/lib/cart-store"

const product = {
  id: "ohne-seitenwaende-40",
  name: "Ohne Seitenwände 40",
  fullName: "Kompaktes Modul ohne Seitenwände",
  artNr: "MOD-40-002",
  description:
    "Das kompakte Modul ohne Seitenwände im praktischen 40cm Format - maximale Durchlässigkeit für Licht und Luft. Perfekt geeignet als Raumteiler oder wenn Sie Ihre Gegenstände von mehreren Seiten zugänglich machen möchten. Die offene Struktur schafft ein luftiges Ambiente und eignet sich hervorragend für moderne, offene Wohnkonzepte.",
  shortDescription: "Maximale Offenheit im kompakten Format.",
  price: 42.0,
  category: "40er",
  moduleType: "ohne-seitenwaende",
  width: 40,
  features: [
    { icon: Wind, title: "Maximale Luftigkeit", description: "Offene Seiten für optimale Durchlässigkeit" },
    { icon: Move, title: "Beidseitiger Zugriff", description: "Zugang von allen Seiten möglich" },
    { icon: Layers, title: "Raumteiler-Qualität", description: "Perfekt als dekorativer Raumteiler" },
    { icon: Maximize, title: "Kompaktes Design", description: "40cm Breite für flexible Platzierung" },
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
  { id: "white", label: "Weiß", hex: "#FFFFFF" },
  { id: "grey", label: "Grau", hex: "#9E9E9E" },
  { id: "black", label: "Schwarz", hex: "#111111" },
  { id: "blue", label: "Blau", hex: "#1E5EFF" },
  { id: "green", label: "Grün", hex: "#2FAE5D" },
  { id: "yellow", label: "Gelb", hex: "#FFD400" },
  { id: "orange", label: "Orange", hex: "#FF8A00" },
  { id: "red", label: "Rot", hex: "#E53935" },
]

const colorPrices: Record<string, number> = {
  white: 0, black: 0, blue: 15, green: 15, yellow: 15, orange: 15, red: 15,
}

const relatedProducts = [
  { id: "offenes-fach-40", name: "Offenes Fach 40", price: 45.0, moduleType: "offenes-fach" },
  { id: "mit-rueckwand-40", name: "Mit Rückwand 40", price: 50.0, moduleType: "mit-rueckwand" },
  { id: "mit-tuere-rechts-40", name: "Mit Türe Rechts 40", price: 55.0, moduleType: "mit-tuere-rechts" },
]

export default function OhneSeitenwaende40ProductPage() {
  const [selectedColor, setSelectedColor] = useState("white")
  const [added, setAdded] = useState(false)
  const [activeTab, setActiveTab] = useState<"features" | "specs">("features")
  const { addItem } = useCartStore()

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

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
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
            <div className="flex gap-2 mt-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`w-20 h-20 bg-gray-100 flex items-center justify-center cursor-pointer transition-all ${
                    i === 1 ? "ring-2 ring-teal-500" : "hover:ring-2 hover:ring-gray-300"
                  }`}
                >
                  {i === 1 ? (
                    <span className="text-xs text-gray-500 font-medium">3D</span>
                  ) : (
                    <Wind className="w-5 h-5 text-gray-300" />
                  )}
                </div>
              ))}
            </div>
          </div>

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

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Produktbeschreibung</h2>
        <div className="prose prose-lg max-w-none text-gray-600">
          <p>{product.description}</p>
          <p className="mt-4">
            Das Modul ohne Seitenwände ist die perfekte Wahl für alle, die ein minimalistisches Design bevorzugen. 
            Die offene Struktur lässt Licht durch und schafft ein Gefühl von Leichtigkeit im Raum. Ideal für 
            Pflanzen, Skulpturen oder Bücher, die von allen Seiten betrachtet werden sollen.
          </p>
          <p className="mt-4">
            Trotz der reduzierten Bauweise bietet das Modul erstaunliche Stabilität. Der verchromte Stahlrahmen 
            und die pulverbeschichtete Boden- und Deckplatte garantieren eine sichere Aufbewahrung Ihrer 
            Lieblingsstücke. Perfekt für moderne Wohnräume und zeitgenössische Einrichtungsstile.
          </p>
        </div>
      </section>

      <section className="bg-white border-t border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Weitere 40er Module</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Link
                key={relatedProduct.id}
                href={`/shop/${relatedProduct.id}`}
                className="group block bg-white border border-gray-100 overflow-hidden hover:border-gray-300 hover:shadow-md transition-all"
              >
                <div className="aspect-square bg-gray-50 overflow-hidden">
                  <Product3DPreview moduleType={relatedProduct.moduleType} color="white" width={40} />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                    {relatedProduct.name}
                  </h3>
                  <p className="text-lg font-bold text-gray-900 mt-1">ab {relatedProduct.price.toFixed(2)} EUR</p>
                </div>
              </Link>
            ))}

            <Link
              href="/shop?category=40er"
              className="group flex flex-col items-center justify-center bg-gray-900 p-8 text-center hover:bg-gray-800 transition-colors"
            >
              <Package className="w-12 h-12 text-white mb-4" />
              <span className="text-white font-semibold text-lg">Alle 40er Module</span>
              <span className="text-gray-400 text-sm mt-1">entdecken</span>
              <ChevronRight className="w-6 h-6 text-white mt-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

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
