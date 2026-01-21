"use client"
import Link from "next/link"
import type React from "react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { ShoppingCart, Filter, ChevronDown, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/cart-store"
import { SiteHeader } from "@/components/site-header"
import { useProductImages } from "@/hooks/use-product-images"

const products = [
  {
    id: "leiter-40",
    name: "Leiter 40",
    artNr: "SIM001",
    description: "Vertikaler Rahmen 40cm",
    price: 13.5,
    category: "rahmen",
    image: "/chrome-metal-ladder-frame-40cm.jpg",
  },
  {
    id: "leiter-80",
    name: "Leiter 80",
    artNr: "SIM002",
    description: "Vertikaler Rahmen 80cm",
    price: 20.5,
    category: "rahmen",
    image: "/chrome-metal-ladder-frame-80cm.jpg",
  },
  {
    id: "leiter-120",
    name: "Leiter 120",
    artNr: "SIM003",
    description: "Vertikaler Rahmen 120cm",
    price: 27.5,
    category: "rahmen",
    image: "/chrome-metal-ladder-frame-120cm.jpg",
  },
  {
    id: "leiter-160",
    name: "Leiter 160",
    artNr: "SIM004",
    description: "Vertikaler Rahmen 160cm",
    price: 33.5,
    category: "rahmen",
    image: "/chrome-metal-ladder-frame-160cm.jpg",
  },
  {
    id: "leiter-200",
    name: "Leiter 200",
    artNr: "SIM005",
    description: "Vertikaler Rahmen 200cm",
    price: 41.0,
    category: "rahmen",
    image: "/chrome-metal-ladder-frame-200cm.jpg",
  },
  {
    id: "stangenset-40",
    name: "Stangenset 40",
    artNr: "SIM006",
    description: "Horizontale Stangen 40cm (2er Set)",
    price: 8.0,
    category: "rahmen",
    image: "/chrome-horizontal-bar-set-40cm.jpg",
  },
  {
    id: "stangenset-80",
    name: "Stangenset 80",
    artNr: "SIM007",
    description: "Horizontale Stangen 80cm (2er Set)",
    price: 12.0,
    category: "rahmen",
    image: "/chrome-horizontal-bar-set-80cm.jpg",
  },
  {
    id: "flaechenset-40-weiss",
    name: "Flächenset 40 Weiß",
    artNr: "SIM010",
    description: "Regalböden 40cm weiß (9 Stück)",
    price: 15.0,
    category: "flaechen",
    image: "/white-shelf-panels-40cm-pack.jpg",
  },
  {
    id: "flaechenset-80-weiss",
    name: "Flächenset 80 Weiß",
    artNr: "SIM011",
    description: "Regalböden 80cm weiß (11 Stück)",
    price: 22.0,
    category: "flaechen",
    image: "/white-shelf-panels-80cm-pack.jpg",
  },
  {
    id: "flaechenset-40-schwarz",
    name: "Flächenset 40 Schwarz",
    artNr: "SIM009",
    description: "Regalböden 40cm schwarz (9 Stück)",
    price: 15.0,
    category: "flaechen",
    image: "/black-shelf-panels-40cm-pack.jpg",
  },
  {
    id: "flaechenset-80-schwarz",
    name: "Flächenset 80 Schwarz",
    artNr: "SIM012",
    description: "Regalböden 80cm schwarz (11 Stück)",
    price: 22.0,
    category: "flaechen",
    image: "/black-shelf-panels-80cm-pack.jpg",
  },
  {
    id: "doppelschublade-weiss",
    name: "Doppelschublade Weiß",
    artNr: "SIM018",
    description: "Schubladenmodul mit 2 Schubladen",
    price: 85.0,
    category: "module",
    image: "/images/products/doppelschublade-weiss.png",
  },
  {
    id: "tuer-40-weiss",
    name: "Tür 40cm Weiß",
    artNr: "SIM019-white",
    description: "Türmodul 40cm weiß",
    price: 45.0,
    category: "module",
    image: "/white-door-panel-40cm-furniture.jpg",
  },
  {
    id: "klapptuer-weiss",
    name: "Klapptür Weiß",
    artNr: "SIM032-white",
    description: "Klapptürmodul weiß",
    price: 55.0,
    category: "module",
    image: "/white-flip-door-panel-furniture.jpg",
  },
  {
    id: "funktionswand-edelstahl",
    name: "Funktionswand Edelstahl",
    artNr: "SIM023",
    description: "Rückwand Edelstahl",
    price: 35.0,
    category: "zubehoer",
    image: "/stainless-steel-back-panel.jpg",
  },
  {
    id: "schloss-typ-a",
    name: "Schloss Typ A",
    artNr: "SIM1000a",
    description: "Abschließbares Schloss",
    price: 25.0,
    category: "zubehoer",
    image: "/schloss-typ-a.jpg",
  },
]

const categories = [
  { id: "alle", name: "Alle Produkte" },
  { id: "rahmen", name: "Rahmen & Stangen" },
  { id: "flaechen", name: "Flächensets" },
  { id: "module", name: "Module" },
  { id: "zubehoer", name: "Zubehör" },
]

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState("alle")
  const [sortBy, setSortBy] = useState("name")
  const { getTotalItems, addItem } = useCartStore()
  const { imageMap, isLoading } = useProductImages()

  const filteredProducts =
    selectedCategory === "alle" ? products : products.filter((p) => p.category === selectedCategory)

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price
    if (sortBy === "price-desc") return b.price - a.price
    return a.name.localeCompare(b.name)
  })

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <SiteHeader />

      {/* Page Content */}
      <div className="pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900">Shop</h1>
            <p className="mt-2 text-gray-600">Alle Komponenten für dein individuelles Regalsystem.</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-gray-500" />
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    selectedCategory === cat.id ? "bg-black text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            <div className="md:ml-auto flex items-center gap-2">
              <span className="text-sm text-gray-500">Sortieren:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-gray-100 rounded-lg px-4 py-2 pr-8 text-sm font-medium cursor-pointer hover:bg-gray-200 transition"
                >
                  <option value="name">Name</option>
                  <option value="price-asc">Preis aufsteigend</option>
                  <option value="price-desc">Preis absteigend</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} addItem={addItem} imageMap={imageMap} />
            ))}
          </div>

          {/* CTA Banner */}
          <div className="mt-16 bg-gray-50 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Lieber selbst konfigurieren?</h2>
              <p className="mt-2 text-gray-600">
                Mit unserem 3D-Konfigurator stellst du dein Traumregal in Minuten zusammen.
              </p>
            </div>
            <Link href="/konfigurator">
              <Button size="lg" className="bg-black hover:bg-gray-800 whitespace-nowrap">
                Zum Konfigurator
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="font-semibold">Simpli Connect</span>
              </div>
              <p className="text-sm text-gray-600">Modulare Regalsysteme aus Deutschland.</p>
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
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Unternehmen</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="/kontakt" className="hover:text-black transition">
                    Kontakt
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

function ProductCard({ product, addItem, imageMap }: { product: (typeof products)[0]; addItem: any; imageMap: any }) {
  const [added, setAdded] = useState(false)

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: product.id,
      name: product.name,
      artNr: product.artNr,
      price: product.price,
      image: product.image,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <Link href={`/shop/${product.id}`} className="block">
      <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300">
        <div className="aspect-square overflow-hidden flex items-center justify-center bg-gray-50 relative">
          {imageMap[product.artNr] ? (
            <Image
              src={imageMap[product.artNr] || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : product.image ? (
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-lg" />
          )}
        </div>
        <div className="p-4">
          <p className="text-xs text-gray-400 mb-1">{product.artNr}</p>
          <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">{product.name}</h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="font-bold text-lg">{product.price.toFixed(2)} €</span>
            <Button
              size="sm"
              variant={added ? "default" : "outline"}
              className={`gap-1 ${added ? "bg-green-600 hover:bg-green-600" : "bg-transparent hover:bg-gray-100"}`}
              onClick={handleAdd}
            >
              {added ? (
                <>
                  <Check className="w-3 h-3" />
                  Hinzugefügt
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3 h-3" />
                  Hinzufügen
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  )
}
