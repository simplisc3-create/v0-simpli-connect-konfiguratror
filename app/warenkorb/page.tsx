"use client"

import Link from "next/link"
import { useCartStore } from "@/lib/cart-store"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function WarenkorbPage() {
  const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore()

  const shipping = getTotalPrice() >= 500 ? 0 : 49
  const total = getTotalPrice() + shipping

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="font-semibold text-xl tracking-tight">Simpli Connect</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">
              Home
            </Link>
            <Link href="/shop" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">
              Shop
            </Link>
            <Link href="/konfigurator" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">
              Konfigurator
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Warenkorb</h1>

          {items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Dein Warenkorb ist leer</h2>
              <p className="text-gray-600 mb-6">Entdecke unsere Produkte und stelle dein Traumregal zusammen.</p>
              <div className="flex gap-4 justify-center">
                <Link href="/shop">
                  <Button variant="outline" className="bg-transparent">
                    Zum Shop
                  </Button>
                </Link>
                <Link href="/konfigurator">
                  <Button className="bg-black hover:bg-gray-800">Zum Konfigurator</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <p className="text-xs text-gray-400">{item.artNr}</p>
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm font-medium text-gray-900 mt-1">{item.price.toFixed(2)} €</p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-gray-50 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-gray-50 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 sticky top-24">
                  <h2 className="font-semibold text-lg mb-4">Zusammenfassung</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Zwischensumme</span>
                      <span className="font-medium">{getTotalPrice().toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Versand</span>
                      <span className="font-medium">
                        {shipping === 0 ? (
                          <span className="text-green-600">Kostenlos</span>
                        ) : (
                          `${shipping.toFixed(2)} €`
                        )}
                      </span>
                    </div>
                    {shipping > 0 && (
                      <p className="text-xs text-gray-500">
                        Noch {(500 - getTotalPrice()).toFixed(2)} € bis zum kostenlosen Versand
                      </p>
                    )}
                    <div className="border-t border-gray-200 pt-3 flex justify-between">
                      <span className="font-semibold">Gesamt</span>
                      <span className="font-bold text-lg">{total.toFixed(2)} €</span>
                    </div>
                  </div>
                  <Link href="/checkout">
                    <Button className="w-full mt-6 bg-black hover:bg-gray-800 gap-2">
                      Zur Kasse
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/shop">
                    <Button variant="outline" className="w-full mt-2 bg-transparent">
                      Weiter einkaufen
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
