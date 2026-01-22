"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingCart, Check, Package, ArrowLeft, Truck, RotateCcw, Shield, Layers, Box, Ruler } from "lucide-react"
import { useCartStore } from "@/lib/cart-store"
import { Product3DPreview } from "@/components/product-3d-preview"

const COLORS = [
  { id: "weiss", name: "Weiss", hex: "#FFFFFF", border: true },
  { id: "schwarz", name: "Schwarz", hex: "#1a1a1a" },
  { id: "blau", name: "Blau", hex: "#1e40af" },
  { id: "gruen", name: "Gruen", hex: "#15803d" },
  { id: "gelb", name: "Gelb", hex: "#eab308" },
  { id: "rot", name: "Rot", hex: "#dc2626" },
]

const PRODUCT = {
  id: "ohne-seitenwaende-40",
  name: "Ohne Seitenwaende 40",
  shortName: "Offen Schmal",
  description: "Schlankes Design ohne seitliche Begrenzung - ideal fuer durchgehende Regale.",
  basePrice: 25,
  sku: "MOD-040-002",
  moduleType: "ohne-seitenwaende",
  width: 40,
  features: [
    { icon: Layers, title: "Durchgehend", desc: "Keine seitlichen Waende" },
    { icon: Box, title: "Flexibel", desc: "Perfekt fuer lange Objekte" },
    { icon: Ruler, title: "Kompakt", desc: "40 x 40 x 40 cm" },
    { icon: Shield, title: "Stabil", desc: "Robuste Konstruktion" },
  ],
  specs: [
    { label: "Breite", value: "40 cm" },
    { label: "Hoehe", value: "40 cm" },
    { label: "Tiefe", value: "40 cm" },
    { label: "Material Korpus", value: "MDF lackiert" },
    { label: "Material Rahmen", value: "Stahl verchromt" },
    { label: "Max. Belastung", value: "15 kg" },
  ],
}

export default function OhneSeitenwaende40Page() {
  const [selectedColor, setSelectedColor] = useState("weiss")
  const [added, setAdded] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  const colorSurcharge = selectedColor !== "weiss" && selectedColor !== "schwarz" ? 15 : 0
  const currentPrice = PRODUCT.basePrice + colorSurcharge

  const handleAddToCart = () => {
    addItem({
      id: `${PRODUCT.id}-${selectedColor}`,
      name: `${PRODUCT.name} - ${COLORS.find(c => c.id === selectedColor)?.name}`,
      price: currentPrice,
      quantity: 1,
      color: selectedColor,
      moduleType: PRODUCT.moduleType,
      width: PRODUCT.width,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/shop" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Zurueck zum Shop
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden relative">
              <Badge className="absolute top-4 left-4 z-10 bg-gray-900 text-white">40er Modul</Badge>
              <Product3DPreview moduleType={PRODUCT.moduleType} color={selectedColor} width={PRODUCT.width} className="w-full h-full" />
            </div>
            <div className="flex justify-center gap-6 py-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck className="w-4 h-4" /><span>Kostenloser Versand ab 100 EUR</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <RotateCcw className="w-4 h-4" /><span>30 Tage Rueckgabe</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">SKU: {PRODUCT.sku}</p>
                <h1 className="text-4xl font-bold text-gray-900">{PRODUCT.name}</h1>
                <p className="text-gray-600 mt-3">{PRODUCT.description}</p>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-gray-900">{currentPrice.toFixed(2)} EUR</span>
                {colorSurcharge > 0 && <span className="text-sm text-gray-500">(+{colorSurcharge} EUR Farbaufschlag)</span>}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Farbe: {COLORS.find(c => c.id === selectedColor)?.name}</label>
                <div className="flex gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color.id)}
                      className={`w-10 h-10 rounded-full transition-all ${selectedColor === color.id ? "ring-2 ring-offset-2 ring-teal-600" : "hover:scale-110"} ${color.border ? "border border-gray-300" : ""}`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <Tabs defaultValue="features" className="mt-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="features">Eigenschaften</TabsTrigger>
                  <TabsTrigger value="specs">Technische Daten</TabsTrigger>
                </TabsList>
                <TabsContent value="features" className="mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    {PRODUCT.features.map((feature, i) => (
                      <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                        <feature.icon className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{feature.title}</p>
                          <p className="text-gray-600 text-xs">{feature.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="specs" className="mt-4">
                  <div className="space-y-2">
                    {PRODUCT.specs.map((spec, i) => (
                      <div key={i} className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">{spec.label}</span>
                        <span className="font-medium text-gray-900">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="mt-8 space-y-3">
              <Button size="lg" className={`w-full gap-2 text-lg py-6 ${added ? "bg-green-600 hover:bg-green-600" : "bg-teal-600 hover:bg-teal-700"}`} onClick={handleAddToCart}>
                {added ? (<><Check className="w-5 h-5" />Hinzugefuegt!</>) : (<><ShoppingCart className="w-5 h-5" />In den Warenkorb - {currentPrice.toFixed(2)} EUR</>)}
              </Button>
              <Link href={`/konfigurator?preset=${PRODUCT.moduleType}`} className="block">
                <Button variant="outline" size="lg" className="w-full gap-2 py-6 border-2 border-teal-600 text-teal-600 hover:bg-teal-50 bg-transparent">
                  <Package className="w-5 h-5" />Weiter konfigurieren
                </Button>
              </Link>
              <p className="text-center text-gray-500 text-sm">Kostenloser Versand ab 100 EUR</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
