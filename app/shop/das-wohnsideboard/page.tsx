"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"
import { ArrowLeft, ShoppingCart, Package, Check, Truck, RotateCcw, Award, ChevronRight, Grid3X3, Layers, Sparkles, Box } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SimpliRegal3DPreview } from "@/components/simpli-regal-3d-preview"
import { useCartStore } from "@/lib/cart-store"
import { productsSimpliRegale } from "@/lib/simpli-products"

const regal = productsSimpliRegale.find(r => r.id === "das-wohnsideboard")!

export default function DasWohnsideboardProductPage() {
  const [added, setAdded] = useState(false)
  const [activeTab, setActiveTab] = useState<"features" | "specs">("features")
  const { addItem } = useCartStore()

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleAddToCart = () => {
    addItem({ id: regal.id, name: regal.name, artNr: regal.artNr, price: regal.price })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const specs = [
    { label: "Breite gesamt", value: `${regal.cols * regal.width} cm` },
    { label: "Höhe gesamt", value: `${regal.rows * 40} cm` },
    { label: "Tiefe", value: "40 cm" },
    { label: "Spalten", value: `${regal.cols}` },
    { label: "Ebenen", value: `${regal.rows}` },
    { label: "Modulbreite", value: `${regal.width} cm` },
    { label: "Material Rahmen", value: "Verchromter Stahl" },
  ]

  const features = [
    { icon: Grid3X3, title: `${regal.rows}x${regal.cols} Raster`, description: `${regal.rows} Ebenen, ${regal.cols} Spalten` },
    { icon: Layers, title: "Komplett-Set", description: "Inkl. Leiter & Stangen" },
    { icon: Sparkles, title: "Premium Qualität", description: "Hochwertige Verarbeitung" },
    { icon: Box, title: "Modular", description: "Erweiterbar & anpassbar" },
  ]

  return (
    <main className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/shop" className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors">
              <ArrowLeft className="w-5 h-5" /><span className="text-sm font-medium">Zurück zum Shop</span>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-900 flex items-center justify-center"><span className="text-white font-bold text-sm">S</span></div>
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
          <li><Link href="/shop#simpli-regale" className="hover:text-teal-600 transition-colors">Simpli Regale</Link></li>
          <li><ChevronRight className="w-4 h-4" /></li>
          <li className="text-gray-900 font-medium">{regal.name}</li>
        </ol>
      </nav>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <div className="relative">
            <div className="absolute top-4 left-4 z-20">
              <Badge className="bg-teal-600 text-white border-0 px-3 py-1.5 text-xs font-semibold tracking-wide">SIMPLI REGAL</Badge>
            </div>
            <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden relative">
              <SimpliRegal3DPreview regal={regal} className="w-full h-full" />
            </div>
          </div>

          <div className="flex flex-col">
            <p className="text-sm text-gray-500 font-mono">{regal.artNr}</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mt-2 text-balance">{regal.name}</h1>
            <p className="text-lg text-gray-600 mt-2">{regal.subtitle}</p>
            <div className="flex items-baseline gap-3 mt-6">
              <span className="text-5xl font-bold text-gray-900">{regal.price.toFixed(2)}</span>
              <span className="text-2xl text-gray-500">EUR</span>
            </div>
            <p className="text-sm text-gray-500">inkl. MwSt. zzgl. Versand</p>
            <p className="text-gray-600 leading-relaxed mt-6 text-lg">{regal.description}</p>

            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Enthaltene Module</h3>
              <div className="flex flex-wrap gap-2">
                {regal.features.map((feature, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium">{feature}</span>
                ))}
              </div>
            </div>

            <Separator className="my-8 bg-gray-200" />

            <div className="space-y-4">
              <Button size="lg" className={`w-full gap-3 text-lg py-7 font-semibold transition-all ${added ? "bg-green-600 hover:bg-green-600" : "bg-gray-900 hover:bg-gray-800"}`} onClick={handleAddToCart}>
                {added ? (<><Check className="w-6 h-6" />Hinzugefügt!</>) : (<><ShoppingCart className="w-6 h-6" />In den Warenkorb - {regal.price.toFixed(2)} EUR</>)}
              </Button>
              <Link href="/konfigurator?preset=das-wohnsideboard" className="block">
                <Button variant="outline" size="lg" className="w-full gap-2 py-6 border-2 border-teal-600 text-teal-600 hover:bg-teal-50 bg-transparent">
                  <Package className="w-5 h-5" />Im Konfigurator anpassen
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="flex flex-col items-center text-center p-4 bg-gray-50"><Truck className="w-6 h-6 text-gray-700 mb-2" /><span className="text-xs font-medium text-gray-700">Kostenloser Versand</span><span className="text-xs text-gray-500">ab 100 EUR</span></div>
              <div className="flex flex-col items-center text-center p-4 bg-gray-50"><RotateCcw className="w-6 h-6 text-gray-700 mb-2" /><span className="text-xs font-medium text-gray-700">30 Tage</span><span className="text-xs text-gray-500">Rückgaberecht</span></div>
              <div className="flex flex-col items-center text-center p-4 bg-gray-50"><Award className="w-6 h-6 text-gray-700 mb-2" /><span className="text-xs font-medium text-gray-700">Premium</span><span className="text-xs text-gray-500">Qualität</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center gap-2 mb-12">
            <button onClick={() => setActiveTab("features")} className={`px-8 py-3 font-semibold text-sm uppercase tracking-wide transition-all ${activeTab === "features" ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-100"}`}>Eigenschaften</button>
            <button onClick={() => setActiveTab("specs")} className={`px-8 py-3 font-semibold text-sm uppercase tracking-wide transition-all ${activeTab === "specs" ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-100"}`}>Technische Daten</button>
          </div>
          {activeTab === "features" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 bg-gray-900 flex items-center justify-center mb-6"><feature.icon className="w-7 h-7 text-white" /></div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          )}
          {activeTab === "specs" && (
            <div className="max-w-2xl mx-auto bg-white shadow-sm">
              <div className="divide-y divide-gray-100">
                {specs.map((spec, index) => (<div key={index} className="flex items-center justify-between px-6 py-5"><span className="text-gray-600">{spec.label}</span><span className="font-semibold text-gray-900">{spec.value}</span></div>))}
              </div>
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-gray-100 mt-16">
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
