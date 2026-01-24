"use client"
import Link from "next/link"
import type React from "react"
import { useState } from "react"
import { ShoppingCart, ChevronDown, Check, ArrowRight, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/cart-store"
import { SiteHeader } from "@/components/site-header"
import { Product3DPreview } from "@/components/product-3d-preview"
import { productsSimpliRegale } from "@/lib/simpli-products"
import { SimpliRegalCard } from "@/components/simpli-regal-card" // Declare SimpliRegalCard import

// 80cm Module products with 3D previews
const products80 = [
  {
    id: "offenes-fach-80",
    name: "Offenes Fach",
    artNr: "MOD-80-001",
    description: "Perfekt für schnellen Zugriff und Dekoration",
    price: 29.0,
    category: "offen",
    width: 80,
    glbModule: { moduleType: "offenes-fach", color: "white", width: 80 as const },
  },
  {
    id: "ohne-seitenwaende-80",
    name: "Ohne Seitenwände",
    artNr: "MOD-80-002",
    description: "Für durchgehende Regale und offene Raumgestaltung",
    price: 32.0,
    category: "offen",
    width: 80,
    glbModule: { moduleType: "ohne-seitenwaende", color: "white", width: 80 as const },
  },
  {
    id: "ohne-rueckwand-80",
    name: "Ohne Rückwand",
    artNr: "MOD-80-003",
    description: "Ideal als Raumteiler mit beidseitigem Zugang",
    price: 35.0,
    category: "offen",
    width: 80,
    glbModule: { moduleType: "ohne-rueckwand", color: "white", width: 80 as const },
  },
  {
    id: "mit-rueckwand-80",
    name: "Mit Rückwand",
    artNr: "MOD-80-004",
    description: "Für einen aufgeräumten, geschlossenen Look",
    price: 42.0,
    category: "offen",
    width: 80,
    glbModule: { moduleType: "mit-rueckwand", color: "white", width: 80 as const },
  },
  {
    id: "mit-tueren-80",
    name: "Mit Türen",
    artNr: "MOD-80-005",
    description: "Stauraum mit elegantem Verschluss",
    price: 65.0,
    category: "geschlossen",
    width: 80,
    glbModule: { moduleType: "mit-tueren", color: "white", width: 80 as const },
  },
  {
    id: "mit-klapptuer-80",
    name: "Mit Klapptür",
    artNr: "MOD-80-006",
    description: "Platzsparend mit Soft-Close-Scharnieren",
    price: 55.0,
    category: "geschlossen",
    width: 80,
    glbModule: { moduleType: "mit-klapptuer", color: "white", width: 80 as const },
  },
  {
    id: "mit-klapptuer-oben-80",
    name: "Klapptür (oben)",
    artNr: "MOD-80-007",
    description: "Nach oben öffnend mit Gasfeder-Unterstützung",
    price: 58.0,
    category: "geschlossen",
    width: 80,
    glbModule: { moduleType: "mit-klapptuer-oben", color: "white", width: 80 as const },
  },
  {
    id: "mit-doppelschublade-80",
    name: "Mit Schubladen",
    artNr: "MOD-80-008",
    description: "Optimaler Stauraum mit Vollauszug",
    price: 85.0,
    category: "schubladen",
    width: 80,
    glbModule: { moduleType: "mit-doppelschublade", color: "white", width: 80 as const },
  },
  {
    id: "mit-einzelschublade-80",
    name: "Einzelschublade",
    artNr: "MOD-80-009",
    description: "Kompakter Stauraum für einzelne Fächer",
    price: 48.0,
    category: "schubladen",
    width: 80,
    glbModule: { moduleType: "mit-einzelschublade", color: "white", width: 80 as const },
  },
  {
    id: "abschliessbare-tueren-80",
    name: "Abschließbar",
    artNr: "MOD-80-010",
    description: "Sicherer Stauraum mit Schloss",
    price: 95.0,
    category: "geschlossen",
    width: 80,
    glbModule: { moduleType: "abschliessbare-tueren", color: "white", width: 80 as const },
  },
]

// 40cm Module products with 3D previews
const products40 = [
  {
    id: "offenes-fach-40",
    name: "Offenes Fach",
    artNr: "MOD-40-001",
    description: "Kompaktes offenes Fach für kleine Räume",
    price: 22.0,
    category: "offen",
    width: 40,
    glbModule: { moduleType: "offenes-fach", color: "white", width: 40 as const },
  },
  {
    id: "ohne-seitenwaende-40",
    name: "Ohne Seitenwände",
    artNr: "MOD-40-002",
    description: "Schlankes Design ohne seitliche Begrenzung",
    price: 25.0,
    category: "offen",
    width: 40,
    glbModule: { moduleType: "ohne-seitenwaende", color: "white", width: 40 as const },
  },
  {
    id: "mit-rueckwand-40",
    name: "Mit Rückwand",
    artNr: "MOD-40-003",
    description: "Geschlossene Rückseite für sauberen Look",
    price: 32.0,
    category: "offen",
    width: 40,
    glbModule: { moduleType: "mit-rueckwand", color: "white", width: 40 as const },
  },
  {
    id: "mit-tuere-rechts-40",
    name: "Mit Tür rechts",
    artNr: "MOD-40-004",
    description: "Einzeltür mit Anschlag rechts",
    price: 45.0,
    category: "geschlossen",
    width: 40,
    glbModule: { moduleType: "mit-tuere-rechts", color: "white", width: 40 as const },
  },
  {
    id: "mit-tuere-links-40",
    name: "Mit Tür links",
    artNr: "MOD-40-005",
    description: "Einzeltür mit Anschlag links",
    price: 45.0,
    category: "geschlossen",
    width: 40,
    glbModule: { moduleType: "mit-tuere-links", color: "white", width: 40 as const },
  },
  {
    id: "abschliessbar-links-40",
    name: "Abschließbar links",
    artNr: "MOD-40-006",
    description: "Sicherer Stauraum mit Schloss, Anschlag links",
    price: 65.0,
    category: "geschlossen",
    width: 40,
    glbModule: { moduleType: "abschliessbar-links", color: "white", width: 40 as const },
  },
]

// Recommended products - curated selection
const productsRecommended = [
  {
    id: "offenes-fach-80",
    name: "Offenes Fach 80",
    artNr: "MOD-80-001",
    description: "Perfekt für schnellen Zugriff und Dekoration",
    price: 29.0,
    category: "offen",
    width: 80,
    glbModule: { moduleType: "offenes-fach", color: "white", width: 80 as const },
    badge: "Bestseller",
  },
  {
    id: "mit-doppelschublade-80",
    name: "Mit Schubladen",
    artNr: "MOD-80-008",
    description: "Optimaler Stauraum mit Vollauszug",
    price: 85.0,
    category: "schubladen",
    width: 80,
    glbModule: { moduleType: "mit-doppelschublade", color: "white", width: 80 as const },
    badge: "Beliebt",
  },
  {
    id: "mit-tueren-80",
    name: "Mit Türen",
    artNr: "MOD-80-005",
    description: "Stauraum mit elegantem Verschluss",
    price: 65.0,
    category: "geschlossen",
    width: 80,
    glbModule: { moduleType: "mit-tueren", color: "white", width: 80 as const },
    badge: "Top Bewertung",
  },
  {
    id: "offenes-fach-40",
    name: "Offenes Fach 40",
    artNr: "MOD-40-001",
    description: "Kompaktes offenes Fach für kleine Räume",
    price: 22.0,
    category: "offen",
    width: 40,
    glbModule: { moduleType: "offenes-fach", color: "white", width: 40 as const },
    badge: "Preis-Tipp",
  },
  {
    id: "mit-rueckwand-80",
    name: "Mit Rückwand",
    artNr: "MOD-80-004",
    description: "Für einen aufgeräumten, geschlossenen Look",
    price: 42.0,
    category: "offen",
    width: 80,
    glbModule: { moduleType: "mit-rueckwand", color: "white", width: 80 as const },
    badge: "Neu",
  },
  {
    id: "abschliessbare-tueren-80",
    name: "Abschließbar",
    artNr: "MOD-80-010",
    description: "Sicherer Stauraum mit Schloss",
    price: 95.0,
    category: "geschlossen",
    width: 80,
    glbModule: { moduleType: "abschliessbare-tueren", color: "white", width: 80 as const },
    badge: "Premium",
  },
]

// Combined for backwards compatibility - use products80 as default
const products = products80

const categories = [
  { id: "alle", name: "Alle" },
  { id: "offen", name: "Offene Module" },
  { id: "geschlossen", name: "Mit Türen" },
  { id: "schubladen", name: "Schubladen" },
]

export default function ShopPage() {
  const [selectedTab, setSelectedTab] = useState<"simpli-regale" | 80 | 40>("simpli-regale")
  const [selectedCategory, setSelectedCategory] = useState("alle")
  const [sortBy, setSortBy] = useState("name")
  const [selectedWidth, setSelectedWidth] = useState(80) // Declare selectedWidth
  const { addItem } = useCartStore()

  // Get products based on selected tab
  const currentProducts = selectedTab === 80 
    ? products80 
    : selectedTab === 40
      ? products40
      : [] // For simpli-regale we'll use a different display

  // Filter by category (only show "schubladen" category for 80cm modules and simpli-regale, not for 40cm)
  const availableCategories = selectedTab === 80 || selectedTab === "simpli-regale"
    ? categories 
    : categories.filter(c => c.id !== "schubladen")

  // Reset category if switching to 40cm and "schubladen" was selected
  const effectiveCategory = selectedTab === 40 && selectedCategory === "schubladen" ? "alle" : selectedCategory

  const filteredProducts =
    effectiveCategory === "alle" ? currentProducts : currentProducts.filter((p) => p.category === effectiveCategory)

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price
    if (sortBy === "price-desc") return b.price - a.price
    return a.name.localeCompare(b.name)
  })

  return (
    <main className="min-h-screen bg-gray-50">
      <SiteHeader />

      <div className="pt-20 pb-16">
        {/* Hero Section */}
        <div className="relative border-b border-gray-100 overflow-hidden">
          <img 
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bgmoduleshop.png-eClL7CKco4EzhVgNEKgd6hFe11YohJ.jpeg"
            alt="Modular shelf on beach"
            className="w-full h-auto object-contain"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight drop-shadow-lg">Module Shop</h1>
              <p className="mt-4 text-lg text-white/90 max-w-xl drop-shadow-md">
                Alle Module für dein individuelles Regalsystem. Wähle aus verschiedenen Varianten und Farben.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Width Tabs */}
          <div className="mb-6">
            <div className="inline-flex rounded-xl bg-gray-200 p-1">
              <button
                onClick={() => setSelectedTab("simpli-regale")}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  selectedTab === "simpli-regale"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Simpli Regale
              </button>
              <button
                onClick={() => setSelectedTab(80)}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  selectedTab === 80
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                80er Module
              </button>
              <button
                onClick={() => setSelectedTab(40)}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  selectedTab === 40
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                40er Module
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {selectedTab === "simpli-regale"
                ? "Alle verfügbaren Module - komplettes Sortiment in einer Übersicht"
                : selectedTab === 80 
                  ? "Breite Module (80cm) - ideal für große Regale" 
                  : "Schmale Module (40cm) - perfekt für kompakte Lösungen"}
            </p>
          </div>

          {/* Category Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex items-center gap-2 flex-wrap">
              {availableCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    effectiveCategory === cat.id 
                      ? "bg-teal-600 text-white shadow-md" 
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            <div className="sm:ml-auto flex items-center gap-2">
              <span className="text-sm text-gray-500">Sortieren:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 pr-8 text-sm font-medium cursor-pointer hover:border-gray-300 transition"
                >
                  <option value="name">Name</option>
                  <option value="price-asc">Preis aufsteigend</option>
                  <option value="price-desc">Preis absteigend</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
              </div>
            </div>
          </div>

          {/* Content based on tab */}
          {selectedTab === "simpli-regale" ? (
            /* Simpli Regale - Komplett-Sets - 2 products per row */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {productsSimpliRegale.map((regal) => (
                <SimpliRegalCard key={regal.id} regal={regal} />
              ))}
            </div>
          ) : (
            /* Regular Products Grid */
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} addItem={addItem} />
              ))}
            </div>
          )}



          {/* CTA Banner */}
          <div className="mt-16 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">Lieber selbst konfigurieren?</h2>
              <p className="mt-3 text-gray-300 max-w-lg">
                Mit unserem 3D-Konfigurator stellst du dein Traumregal in Minuten zusammen. 
                Kombiniere Module, Farben und Größen nach deinen Wünschen.
              </p>
            </div>
            <Link href="/konfigurator">
              <Button size="lg" className="bg-teal-500 hover:bg-teal-600 text-white whitespace-nowrap gap-2">
                Zum Konfigurator
                <ArrowRight className="w-4 h-4" />
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

function ProductCard({ product, addItem }: { product: (typeof products)[0]; addItem: any }) {
  const [added, setAdded] = useState(false)

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: product.id,
      name: product.name,
      artNr: product.artNr,
      price: product.price,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <Link href={`/shop/${product.id}`} className="block">
      <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300">
        <div className="aspect-square overflow-hidden flex items-center justify-center bg-gray-50 relative">
          <Product3DPreview
            moduleType={product.glbModule.moduleType}
            color={product.glbModule.color}
            width={product.glbModule.width}
            autoRotate={true}
          />
        </div>
        <div className="p-4">
          <p className="text-xs text-gray-400 mb-1">{product.artNr}</p>
          <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">{product.name}</h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="font-bold text-lg">ab {product.price.toFixed(2)} €</span>
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
