"use client"
import Link from "next/link"
import { useState } from "react"
import { ChevronDown, ArrowRight, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { productsSimpliRegale } from "@/lib/simpli-products"
import { SimpliRegalCard } from "@/components/simpli-regal-card"
import { ShopProductCard } from "@/components/shop-product-card"
import { products80, products40 } from "@/lib/shop-modules"
import { shopCategories } from "@/lib/shop-categories"

const categories = [
  { id: "alle", name: "Alle" },
  { id: "offen", name: "Offene Module" },
  { id: "geschlossen", name: "Mit Türen" },
  { id: "schubladen", name: "Schubladen" },
]

// New height-based categories for Simpli Regale
const simpliRegaleCategories = [
  { id: "alle", name: "Alle" },
  { id: "lowboard", name: "Lowboards (40-60 cm)" },
  { id: "sideboard", name: "Sideboards (80-100 cm)" },
  { id: "highboard", name: "Highboards (120-400 cm)" },
]

export default function ShopPage() {
  const [selectedTab, setSelectedTab] = useState<"simpli-regale" | 80 | 40>("simpli-regale")
  const [selectedCategory, setSelectedCategory] = useState("alle")
  const [sortBy, setSortBy] = useState("name")

  // Get products based on selected tab
  const currentProducts = selectedTab === 80 
    ? products80 
    : selectedTab === 40
      ? products40
      : [] // For simpli-regale we'll use a different display

  // Filter by category - use different categories for Simpli Regale (height-based) vs modules (type-based)
  const availableCategories = selectedTab === "simpli-regale"
    ? simpliRegaleCategories
    : selectedTab === 80
      ? categories 
      : categories.filter(c => c.id !== "schubladen")

  // Reset category if switching tabs and current category is not valid for new tab
  const effectiveCategory = (() => {
    if (selectedTab === "simpli-regale") {
      // If switching to Simpli Regale and current category is from modules, reset to "alle"
      if (["offen", "geschlossen", "schubladen"].includes(selectedCategory)) return "alle"
      return selectedCategory
    }
    // If switching to modules and current category is from Simpli Regale, reset to "alle"
    if (["lowboard", "sideboard", "highboard"].includes(selectedCategory)) return "alle"
    // For 40cm modules, don't show schubladen
    if (selectedTab === 40 && selectedCategory === "schubladen") return "alle"
    return selectedCategory
  })()

  const filteredProducts =
    effectiveCategory === "alle" ? currentProducts : currentProducts.filter((p) => p.category === effectiveCategory)

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price
    if (sortBy === "price-desc") return b.price - a.price
    return a.name.localeCompare(b.name)
  })

  const regaleCategories = shopCategories.filter((c) => c.group === "regale")
  const moduleCategories = shopCategories.filter((c) => c.group === "module")

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
          {/* Kategorien */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Nach Kategorie shoppen</h2>
            <p className="mt-1 text-sm text-gray-500">Vorkonfigurierte Regale und Einzelmodule – übersichtlich sortiert.</p>

            <h3 className="mt-6 mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Komplett-Regale</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {regaleCategories.map((c) => (
                <CategoryTile key={c.slug} slug={c.slug} title={c.title} subtitle={c.subtitle} />
              ))}
            </div>

            <h3 className="mt-6 mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Einzelmodule</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {moduleCategories.map((c) => (
                <CategoryTile key={c.slug} slug={c.slug} title={c.title} subtitle={c.subtitle} />
              ))}
            </div>
          </section>

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
                ? "Vorkonfigurierte Komplett-Sets - sortiert nach Höhe"
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
            /* Simpli Regale - Komplett-Sets */
            <div className="space-y-8">
              {productsSimpliRegale
                .filter((regal) => effectiveCategory === "alle" || regal.category === effectiveCategory)
                .sort((a, b) => {
                  if (sortBy === "price-asc") return a.price - b.price
                  if (sortBy === "price-desc") return b.price - a.price
                  return a.name.localeCompare(b.name)
                })
                .map((regal) => (
                  <SimpliRegalCard key={regal.id} regal={regal} />
                ))}
            </div>
          ) : (
            /* Regular Products Grid */
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <ShopProductCard key={product.id} product={product} />
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

          {/* Katalog Download Banner */}
          <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex w-12 h-12 rounded-xl bg-teal-50 items-center justify-center shrink-0">
                <Download className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Katalog als PDF herunterladen</h2>
                <p className="mt-2 text-gray-600 max-w-lg text-pretty">
                  Alle Module und vorkonfigurierten Regale mit Maßen, Materialien und Studio-Renderings –
                  übersichtlich als hochwertiges PDF-Magazin zum Mitnehmen.
                </p>
              </div>
            </div>
            <a href="/api/katalog/pdf?download=1" className="shrink-0">
              <Button size="lg" variant="outline" className="border-gray-300 text-gray-900 hover:bg-gray-50 whitespace-nowrap gap-2 bg-transparent">
                <Download className="w-4 h-4" />
                Katalog herunterladen
              </Button>
            </a>
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
                <li>
                  <a href="/api/katalog/pdf?download=1" className="hover:text-black transition">
                    Katalog (PDF)
                  </a>
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

function CategoryTile({ slug, title, subtitle }: { slug: string; title: string; subtitle: string }) {
  return (
    <Link
      href={`/shop/kategorie/${slug}`}
      className="group flex items-center justify-between gap-3 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-teal-200 transition-all duration-200"
    >
      <div>
        <h4 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">{title}</h4>
        <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all shrink-0" />
    </Link>
  )
}
