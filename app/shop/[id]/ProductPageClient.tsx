"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ShoppingCart, Package, Ruler, Palette, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { products, type Product, type ProductColor, getColorHex, colorLabels, categoryLabels } from "@/lib/products"

// Color display component
function ColorSwatch({ color, isSelected = false }: { color: ProductColor; isSelected?: boolean }) {
  const hex = getColorHex(color)

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
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
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

export default function ProductPageClient({ product }: { product: Product }) {
  // Get dimension string
  const dimensionStr =
    product.width && product.height
      ? `${product.width} × ${product.height} cm`
      : product.width
        ? `${product.width} cm`
        : "Standard"

  const [selectedColor, setSelectedColor] = useState<ProductColor>((product.colors?.[0] as ProductColor) || "weiss")

  const currentVariant = product.variants?.find((v) => v.color === selectedColor)
  const displayImage = currentVariant?.image || product.image
  const displayArtNr = currentVariant?.artNr || product.artNr

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
          {/* Product Image */}
          <div className="relative">
            <div className="aspect-square bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden relative">
              {displayImage ? (
                <Image
                  src={displayImage || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <Package className="w-32 h-32 text-gray-300" />
              )}
              {/* Category badge */}
              <Badge
                variant="secondary"
                className="absolute top-4 left-4 bg-teal-500/10 text-teal-600 border-teal-500/20"
              >
                {categoryLabels[product.category] || product.category}
              </Badge>
            </div>

            <div className="flex gap-3 mt-4">
              {product.variants && product.variants.length > 0
                ? product.variants.map((variant, i) => (
                    <button
                      key={variant.color}
                      onClick={() => setSelectedColor(variant.color as ProductColor)}
                      className={`w-20 h-20 rounded-lg border flex items-center justify-center overflow-hidden relative ${variant.color === selectedColor ? "border-teal-500 ring-2 ring-teal-500/50" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      {variant.image ? (
                        <Image
                          src={variant.image || "/placeholder.svg"}
                          alt={variant.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-gray-300" />
                      )}
                    </button>
                  ))
                : [1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`w-20 h-20 rounded-lg border flex items-center justify-center overflow-hidden relative ${i === 1 ? "border-teal-500 bg-gray-50" : "border-gray-200 bg-gray-50"}`}
                    >
                      {product.image && i === 1 ? (
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover"
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
              <p className="text-sm text-gray-500 mb-2">{displayArtNr}</p>
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

            {product.colors && product.colors.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Verfügbare Farben</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color as ProductColor)}
                      className="cursor-pointer"
                    >
                      <ColorSwatch color={color as ProductColor} isSelected={color === selectedColor} />
                    </button>
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
              <Button
                size="lg"
                className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-6 text-lg rounded-xl transition-all duration-300 hover:shadow-lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                In den Warenkorb
              </Button>
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
