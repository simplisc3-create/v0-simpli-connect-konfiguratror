import { Button } from "@/components/ui/button"
import type React from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ShoppingCart, Package, Ruler, Palette, Hash } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AddToCartButton } from "./add-to-cart-button"
import { ProductImageClient } from "./product-image-client"
import { ProductViewerClient } from "./product-viewer-client"

const products = [
  {
    id: "leiter-40",
    name: "Leiter 40",
    artNr: "SIM001",
    description:
      "Vertikaler Rahmen 40cm - Perfekt als Seitenrahmen für kompakte Regale. Robuste Stahlkonstruktion mit langlebiger Chrom-Beschichtung.",
    price: 13.5,
    category: "rahmen",
    image: "/chrome-metal-ladder-frame-40cm.jpg",
    width: 40,
    height: null,
  },
  {
    id: "leiter-80",
    name: "Leiter 80",
    artNr: "SIM002",
    description:
      "Vertikaler Rahmen 80cm - Ideal für mittelhohe Regalkonstruktionen. Stabile Verbindungspunkte für sichere Montage.",
    price: 20.5,
    category: "rahmen",
    image: "/chrome-metal-ladder-frame-80cm.jpg",
    width: 80,
    height: null,
  },
  {
    id: "leiter-120",
    name: "Leiter 120",
    artNr: "SIM003",
    description: "Vertikaler Rahmen 120cm - Für höhere Regaleinheiten. Premium Qualität mit präziser Verarbeitung.",
    price: 27.5,
    category: "rahmen",
    image: "/chrome-metal-ladder-frame-120cm.jpg",
    width: 120,
    height: null,
  },
  {
    id: "leiter-160",
    name: "Leiter 160",
    artNr: "SIM004",
    description:
      "Vertikaler Rahmen 160cm - Große Regalwände leicht gemacht. Maximale Stabilität durch verstärkte Konstruktion.",
    price: 33.5,
    category: "rahmen",
    image: "/chrome-metal-ladder-frame-160cm.jpg",
    width: 160,
    height: null,
  },
  {
    id: "leiter-200",
    name: "Leiter 200",
    artNr: "SIM005",
    description: "Vertikaler Rahmen 200cm - Für raumhohe Regalsysteme. Höchste Tragkraft und Langlebigkeit.",
    price: 41.0,
    category: "rahmen",
    image: "/chrome-metal-ladder-frame-200cm.jpg",
    width: 200,
    height: null,
  },
  {
    id: "stangenset-40",
    name: "Stangenset 40",
    artNr: "SIM006",
    description: "Horizontale Stangen 40cm (2er Set) - Verbinden die vertikalen Rahmen und definieren die Regaltiefe.",
    price: 8.0,
    category: "rahmen",
    image: "/chrome-horizontal-bar-set-40cm.jpg",
    width: 40,
    height: null,
  },
  {
    id: "stangenset-80",
    name: "Stangenset 80",
    artNr: "SIM007",
    description: "Horizontale Stangen 80cm (2er Set) - Für breitere Regalfächer mit mehr Stellfläche.",
    price: 12.0,
    category: "rahmen",
    image: "/chrome-horizontal-bar-set-80cm.jpg",
    width: 80,
    height: null,
  },
  {
    id: "flaechenset-40-weiss",
    name: "Flächenset 40 Weiß",
    artNr: "SIM010",
    description: "Regalböden 40cm weiß (9 Stück) - Hochwertige MDF-Platten mit strapazierfähiger Melaminbeschichtung.",
    price: 15.0,
    category: "flaechen",
    image: "/white-shelf-panels-40cm-pack.jpg",
    width: 40,
    height: null,
    colors: ["weiss"],
  },
  {
    id: "flaechenset-80-weiss",
    name: "Flächenset 80 Weiß",
    artNr: "SIM011",
    description: "Regalböden 80cm weiß (11 Stück) - Mehr Fläche für größere Regale. Einfache Montage ohne Werkzeug.",
    price: 22.0,
    category: "flaechen",
    image: "/white-shelf-panels-80cm-pack.jpg",
    width: 80,
    height: null,
    colors: ["weiss"],
  },
  {
    id: "flaechenset-40-schwarz",
    name: "Flächenset 40 Schwarz",
    artNr: "SIM009",
    description: "Regalböden 40cm schwarz (9 Stück) - Elegante Optik in modernem Schwarz.",
    price: 15.0,
    category: "flaechen",
    image: "/black-shelf-panels-40cm-pack.jpg",
    width: 40,
    height: null,
    colors: ["anthrazit"],
  },
  {
    id: "flaechenset-80-schwarz",
    name: "Flächenset 80 Schwarz",
    artNr: "SIM012",
    description: "Regalböden 80cm schwarz (11 Stück) - Perfekt für ein modernes, minimalistisches Design.",
    price: 22.0,
    category: "flaechen",
    image: "/black-shelf-panels-80cm-pack.jpg",
    width: 80,
    height: null,
    colors: ["anthrazit"],
  },
  {
    id: "doppelschublade-weiss",
    name: "Doppelschublade Weiß",
    artNr: "SIM018",
    description:
      "Schubladenmodul mit 2 Schubladen - Praktischer Stauraum für Kleinteile. Sanft schließende Vollauszüge.",
    price: 85.0,
    category: "module",
    image: "/images/products/doppelschublade-weiss.png",
    width: 40,
    height: 36,
    colors: ["weiss"],
  },
  {
    id: "tuer-40-weiss",
    name: "Tür 40cm Weiß",
    artNr: "SIM019-white",
    description: "Türmodul 40cm weiß - Verbergen Sie den Inhalt stilvoll. Push-to-open Mechanismus inklusive.",
    price: 45.0,
    category: "module",
    image: "/white-door-panel-40cm-furniture.jpg",
    width: 40,
    height: 36,
    colors: ["weiss"],
  },
  {
    id: "klapptuer-weiss",
    name: "Klapptür Weiß",
    artNr: "SIM032-white",
    description: "Klapptürmodul weiß - Nach oben öffnende Tür mit Soft-Close. Modern und platzsparend.",
    price: 55.0,
    category: "module",
    image: "/white-flip-door-panel-furniture.jpg",
    width: 40,
    height: 36,
    colors: ["weiss"],
  },
  {
    id: "funktionswand-edelstahl",
    name: "Funktionswand Edelstahl",
    artNr: "SIM023",
    description: "Rückwand Edelstahl - Magnetische Oberfläche für flexible Nutzung. Rostfrei und pflegeleicht.",
    price: 35.0,
    category: "zubehoer",
    image: "/stainless-steel-back-panel.jpg",
    width: 40,
    height: 36,
  },
  {
    id: "schloss-typ-a",
    name: "Schloss Typ A",
    artNr: "SIM1000a",
    description: "Abschließbares Schloss - Sichern Sie wertvolle Gegenstände. Zwei Schlüssel inklusive.",
    price: 25.0,
    category: "zubehoer",
    image: "/schloss-typ-a.jpg",
    width: null,
    height: null,
  },
]

type ProductColor = "weiss" | "anthrazit" | "eiche" | "nussbaum"

function getColorHex(color: ProductColor): string {
  const colorMap: Record<ProductColor, string> = {
    weiss: "#FFFFFF",
    anthrazit: "#3D3D3D",
    eiche: "#C4A77D",
    nussbaum: "#5D4037",
  }
  return colorMap[color] || "#CCCCCC"
}

// Generate static params for all products
export async function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }))
}

// Generate metadata for each product page
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = products.find((p) => p.id === id)

  if (!product) {
    return {
      title: "Produkt nicht gefunden | Simpli Connect",
    }
  }

  return {
    title: `${product.name} | Simpli Connect Shop`,
    description: product.description || `${product.name} - Hochwertiges Regalmodul von Simpli Connect`,
  }
}

// Color display component
function ColorSwatch({ color, isSelected = false }: { color: ProductColor; isSelected?: boolean }) {
  const hex = getColorHex(color)
  const colorLabels: Record<ProductColor, string> = {
    weiss: "Weiß",
    anthrazit: "Anthrazit",
    eiche: "Eiche",
    nussbaum: "Nussbaum",
  }

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${isSelected ? "border-teal-500 bg-teal-500/10" : "border-gray-200 bg-gray-50"}`}
    >
      <div className="w-5 h-5 rounded-full border border-gray-300" style={{ backgroundColor: hex }} />
      <span className="text-sm text-gray-600">{colorLabels[color]}</span>
    </div>
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

// Related products component
function RelatedProducts({ currentProductId, category }: { currentProductId: string; category: string }) {
  const related = products.filter((p) => p.category === category && p.id !== currentProductId).slice(0, 4)

  if (related.length === 0) return null

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Ähnliche Produkte</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {related.map((product) => (
          <Link
            key={product.id}
            href={`/shop/${product.id}`}
            className="group block bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-teal-500/50 hover:shadow-md transition-all duration-300"
          >
            <div className="aspect-square bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
              {product.image ? (
                <ProductImageClient
                  artNr={product.artNr}
                  defaultImage={product.image}
                  productName={product.name}
                />
              ) : (
                <Package className="w-12 h-12 text-gray-400 group-hover:text-teal-500 transition-colors" />
              )}
            </div>
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-teal-600 transition-colors">
                {product.name}
              </h3>
              <p className="text-teal-600 font-semibold mt-1">{product.price.toFixed(2)} €</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = products.find((p) => p.id === id)

  if (!product) {
    notFound()
  }

  // Get dimension string
  const dimensionStr =
    product.width && product.height
      ? `${product.width} × ${product.height} cm`
      : product.width
        ? `${product.width} cm`
        : "Standard"

  // Category labels
  const categoryLabels: Record<string, string> = {
    rahmen: "Rahmen & Stangen",
    flaechen: "Flächensets",
    module: "Module",
    zubehoer: "Zubehör",
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
          {/* Product Image / 3D Viewer */}
          <div className="relative">
            <ProductViewerClient
              product={{
                artNr: product.artNr,
                name: product.name,
                image: product.image,
                category: product.category,
                size: product.width || product.height || 80,
              }}
              priority
            />
            {/* Category badge */}
            <Badge
              variant="secondary"
              className="absolute top-4 left-4 bg-teal-500/10 text-teal-600 border-teal-500/20 z-20"
            >
              {categoryLabels[product.category] || product.category}
            </Badge>

            {/* Thumbnail placeholder for future images */}
            <div className="flex gap-3 mt-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`w-20 h-20 rounded-lg border flex items-center justify-center overflow-hidden relative ${i === 1 ? "border-teal-500 bg-gray-50" : "border-gray-200 bg-gray-50"}`}
                >
                  {product.image && i === 1 ? (
                    <ProductImageClient
                      artNr={product.artNr}
                      defaultImage={product.image}
                      productName={product.name}
                    />
                  ) : (
                    <Package className="w-8 h-8 text-gray-300" />
                  )}
                </div>
              ))}
            </div>
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
                <span className="text-4xl font-bold text-teal-600">{product.price.toFixed(2)} €</span>
                <span className="text-gray-500 text-sm">inkl. MwSt.</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed mt-6">{product.description}</p>

            {/* Color variants */}
            {product.colors && product.colors.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Verfügbare Farben</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color, index) => (
                    <ColorSwatch key={color} color={color as ProductColor} isSelected={index === 0} />
                  ))}
                </div>
              </div>
            )}

            <Separator className="my-8 bg-gray-200" />

            {/* Specifications */}
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Spezifikationen</h3>
              <SpecRow icon={Hash} label="Artikelnummer" value={product.artNr} />
              <SpecRow icon={Ruler} label="Abmessungen" value={dimensionStr} />
              <SpecRow icon={Package} label="Kategorie" value={categoryLabels[product.category] || product.category} />
              {product.colors && product.colors.length > 0 && (
                <SpecRow icon={Palette} label="Farben" value={`${product.colors.length} verfügbar`} />
              )}
            </div>

            <Separator className="my-8 bg-gray-200" />

            {/* Add to Cart */}
            <div className="mt-auto">
              <AddToCartButton
                product={{
                  id: product.id,
                  name: product.name,
                  artNr: product.artNr,
                  price: product.price,
                  image: product.image || "",
                }}
              />
              <p className="text-center text-gray-500 text-sm mt-3">Kostenloser Versand ab 100 €</p>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <RelatedProducts currentProductId={product.id} category={product.category} />
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
