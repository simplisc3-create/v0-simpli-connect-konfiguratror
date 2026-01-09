"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/lib/cart-store"
import { ChevronLeft, Check, CreditCard, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)

  const shipping = getTotalPrice() >= 500 ? 0 : 49
  const total = getTotalPrice() + shipping

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step < 3) {
      setStep(step + 1)
      return
    }

    setIsSubmitting(true)
    // Simulate order processing
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsSubmitting(false)
    setOrderComplete(true)
    clearCart()
  }

  if (items.length === 0 && !orderComplete) {
    router.push("/warenkorb")
    return null
  }

  if (orderComplete) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Bestellung erfolgreich!</h1>
          <p className="text-gray-600 mb-6">
            Vielen Dank für deine Bestellung. Du erhältst in Kürze eine Bestätigung per E-Mail.
          </p>
          <Link href="/">
            <Button className="bg-black hover:bg-gray-800">Zurück zur Startseite</Button>
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="font-semibold text-xl tracking-tight">Simpli Connect</span>
          </Link>
          <Link href="/warenkorb" className="flex items-center gap-1 text-sm text-gray-600 hover:text-black transition">
            <ChevronLeft className="w-4 h-4" />
            Zurück zum Warenkorb
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {[
            { num: 1, label: "Adresse" },
            { num: 2, label: "Versand" },
            { num: 3, label: "Zahlung" },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= s.num ? "bg-black text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                {step > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span className={`ml-2 text-sm font-medium ${step >= s.num ? "text-gray-900" : "text-gray-500"}`}>
                {s.label}
              </span>
              {i < 2 && <div className="w-16 h-px bg-gray-200 mx-4" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                {step === 1 && (
                  <>
                    <h2 className="text-lg font-semibold mb-6">Lieferadresse</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Vorname</Label>
                        <Input id="firstName" required className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Nachname</Label>
                        <Input id="lastName" required className="mt-1" />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="email">E-Mail</Label>
                        <Input id="email" type="email" required className="mt-1" />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="street">Straße & Hausnummer</Label>
                        <Input id="street" required className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="zip">PLZ</Label>
                        <Input id="zip" required className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="city">Stadt</Label>
                        <Input id="city" required className="mt-1" />
                      </div>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <h2 className="text-lg font-semibold mb-6">Versandart</h2>
                    <div className="space-y-3">
                      <label className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border-2 border-black cursor-pointer">
                        <input type="radio" name="shipping" defaultChecked className="w-4 h-4" />
                        <Truck className="w-5 h-5 text-gray-600" />
                        <div className="flex-grow">
                          <p className="font-medium">Standardversand</p>
                          <p className="text-sm text-gray-500">5-7 Werktage</p>
                        </div>
                        <span className="font-medium">{shipping === 0 ? "Kostenlos" : `${shipping.toFixed(2)} €`}</span>
                      </label>
                      <label className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:border-gray-300 transition">
                        <input type="radio" name="shipping" className="w-4 h-4" />
                        <Truck className="w-5 h-5 text-gray-600" />
                        <div className="flex-grow">
                          <p className="font-medium">Expressversand</p>
                          <p className="text-sm text-gray-500">2-3 Werktage</p>
                        </div>
                        <span className="font-medium">29,00 €</span>
                      </label>
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <h2 className="text-lg font-semibold mb-6">Zahlungsart</h2>
                    <div className="space-y-3">
                      <label className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border-2 border-black cursor-pointer">
                        <input type="radio" name="payment" defaultChecked className="w-4 h-4" />
                        <CreditCard className="w-5 h-5 text-gray-600" />
                        <div className="flex-grow">
                          <p className="font-medium">Kreditkarte</p>
                          <p className="text-sm text-gray-500">Visa, Mastercard, American Express</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:border-gray-300 transition">
                        <input type="radio" name="payment" className="w-4 h-4" />
                        <div className="w-5 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                          P
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium">PayPal</p>
                          <p className="text-sm text-gray-500">Schnell und sicher bezahlen</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:border-gray-300 transition">
                        <input type="radio" name="payment" className="w-4 h-4" />
                        <div className="w-5 h-5 bg-gray-800 rounded text-white text-xs flex items-center justify-center font-bold">
                          R
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium">Rechnung</p>
                          <p className="text-sm text-gray-500">Zahlung innerhalb 14 Tage</p>
                        </div>
                      </label>
                    </div>
                  </>
                )}

                <div className="flex gap-4 mt-8">
                  {step > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(step - 1)}
                      className="bg-transparent"
                    >
                      Zurück
                    </Button>
                  )}
                  <Button type="submit" className="flex-grow bg-black hover:bg-gray-800" disabled={isSubmitting}>
                    {isSubmitting
                      ? "Wird verarbeitet..."
                      : step === 3
                        ? `Jetzt kaufen (${total.toFixed(2)} €)`
                        : "Weiter"}
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 border border-gray-100 sticky top-6">
              <h2 className="font-semibold text-lg mb-4">Deine Bestellung</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image || "/placeholder.svg?height=48&width=48"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">Menge: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">{(item.price * item.quantity).toFixed(2)} €</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Zwischensumme</span>
                  <span>{getTotalPrice().toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Versand</span>
                  <span>{shipping === 0 ? "Kostenlos" : `${shipping.toFixed(2)} €`}</span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-2 border-t border-gray-100">
                  <span>Gesamt</span>
                  <span>{total.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
