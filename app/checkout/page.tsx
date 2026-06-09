"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/lib/cart-store"
import { Check, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SiteHeader } from "@/components/site-header"
import { StripeCheckout } from "@/components/stripe-checkout"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const [step, setStep] = useState(1)
  // Set once payment completes so the empty-cart guard doesn't redirect to the
  // cart while we navigate to the confirmation page.
  const [completing, setCompleting] = useState(false)

  const shipping = getTotalPrice() >= 500 ? 0 : 49
  const total = getTotalPrice() + shipping

  // Client sends SKU ids + quantities. Name + price are only a fallback for
  // configurator-derived custom lines; catalog prices are validated server-side.
  const checkoutLines = items.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    name: item.name,
    price: item.price,
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Steps 1 (address) and 2 (shipping) advance the wizard. Step 3 renders the
    // Stripe Embedded Checkout, which handles payment itself.
    if (step < 3) {
      setStep(step + 1)
    }
  }

  const handlePaymentComplete = (sessionId: string) => {
    setCompleting(true)
    clearCart()
    router.push(`/checkout/success?session_id=${sessionId}`)
  }

  if (items.length === 0 && !completing) {
    router.push("/warenkorb")
    return null
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <SiteHeader />

      <div className="max-w-6xl mx-auto px-6 py-12 pt-24">
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
                    <h2 className="text-lg font-semibold mb-6">Zahlung</h2>
                    <StripeCheckout lines={checkoutLines} onComplete={handlePaymentComplete} />
                  </>
                )}

                {step < 3 && (
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
                    <Button type="submit" className="flex-grow bg-black hover:bg-gray-800">
                      Weiter
                    </Button>
                  </div>
                )}

                {step === 3 && (
                  <div className="mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(step - 1)}
                      className="bg-transparent"
                    >
                      Zurück
                    </Button>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 border border-gray-100 sticky top-24">
              <h2 className="font-semibold text-lg mb-4">Deine Bestellung</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image || "/placeholder.svg"}
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
