"use client"

import Link from "next/link"
import { useParams, notFound } from "next/navigation"
import { ArrowLeft, ArrowRight, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { ShopProductCard } from "@/components/shop-product-card"
import { SimpliRegalCard } from "@/components/simpli-regal-card"
import {
  getCategoryBySlug,
  getModulesForCategory,
  getRegaleForCategory,
  shopCategories,
} from "@/lib/shop-categories"

export default function CategoryPage() {
  const params = useParams()
  const slug = typeof params.slug === "string" ? params.slug : Array.isArray(params.slug) ? params.slug[0] : ""

  const category = getCategoryBySlug(slug)
  if (!category) {
    notFound()
  }

  const isRegale = category.group === "regale"
  const modules = isRegale ? [] : getModulesForCategory(slug)
  const regale = isRegale ? getRegaleForCategory(slug) : []
  const count = isRegale ? regale.length : modules.length

  // Andere Kategorien derselben Gruppe für die Quer-Navigation
  const related = shopCategories.filter((c) => c.group === category.group && c.slug !== category.slug)

  return (
    <main className="min-h-screen bg-gray-50">
      <SiteHeader />

      <div className="pt-20 pb-16">
        {/* Header */}
        <div className="border-b border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <Link href="/shop" className="hover:text-gray-900 transition">
                Shop
              </Link>
              <span>/</span>
              <span className="text-gray-900">{category.title}</span>
            </nav>

            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Zurück zum Shop
            </Link>

            <div className="flex items-center gap-2 text-teal-600 mb-2">
              <Package className="w-4 h-4" />
              <span className="text-sm font-medium uppercase tracking-wide">
                {isRegale ? "Komplett-Regale" : "Einzelmodule"}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight text-balance">
              {category.title}
            </h1>
            <p className="mt-2 text-lg text-teal-600 font-medium">{category.subtitle}</p>
            <p className="mt-3 text-gray-600 max-w-2xl text-pretty leading-relaxed">{category.description}</p>
            <p className="mt-4 text-sm text-gray-500">
              {count} {count === 1 ? "Produkt" : "Produkte"}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Products */}
          {count === 0 ? (
            <p className="text-gray-500">In dieser Kategorie sind aktuell keine Produkte verfügbar.</p>
          ) : isRegale ? (
            <div className="space-y-8">
              {regale.map((regal) => (
                <SimpliRegalCard key={regal.id} regal={regal} />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {modules.map((product) => (
                <ShopProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Related categories */}
          {related.length > 0 && (
            <div className="mt-16">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Weitere Kategorien</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {related.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/shop/kategorie/${c.slug}`}
                    className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-gray-200 transition-all duration-300"
                  >
                    <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                      {c.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{c.subtitle}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-teal-600">
                      Ansehen
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
