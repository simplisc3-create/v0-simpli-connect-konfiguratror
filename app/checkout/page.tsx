"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/lib/cart-store"
import { Check, CreditCard, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SiteHeader } from "@/components/site-header"

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
      <main className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-secondary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Bestellung erfolgreich!</h1>
          <p className="text-muted-foreground mb-6">
            Vielen Dank für deine Bestellung. Du erhältst in Kürze eine Bestätigung per E-Mail.
          </p>
          <Link href="/">
            <Button className="bg-foreground hover:bg-foreground/90">Zurück zur Startseite</Button>
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
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
                  step >= s.num ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                }`}
              >
                {step > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span className={`ml-2 text-sm font-medium ${step >= s.num ? "text-foreground" : "text-muted-foreground"}`}>
                {s.label}
              </span>
              {i < 2 && <div className="w-16 h-px bg-border mx-4" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <div className="bg-card rounded-xl p-6 border border-border">
                {step === 1 && (
                  <>
                    <h2 className="text-lg font-semibold mb-6 text-foreground">Lieferadresse</h2>
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
                    <h2 className="text-lg font-semibold mb-6 text-foreground">Versandart</h2>
                    <div className="space-y-3">
                      <label className="flex items-center gap-4 p-4 bg-muted rounded-lg border-2 border-foreground cursor-pointer">
                        <input type="radio" name="shipping" defaultChecked className="w-4 h-4" />
                        <Truck className="w-5 h-5 text-muted-foreground" />
                        <div className="flex-grow">
                          <p className="font-medium text-foreground">Standardversand</p>
                          <p className="text-sm text-muted-foreground">5-7 Werktage</p>
                        </div>
                        <span className="font-medium">{shipping === 0 ? "Kostenlos" : `${shipping.toFixed(2)} €`}</span>
                      </label>
                      <label className="flex items-center gap-4 p-4 bg-muted rounded-lg border border-border cursor-pointer hover:border-foreground/50 transition">
                        <input type="radio" name="shipping" className="w-4 h-4" />
                        <Truck className="w-5 h-5 text-muted-foreground" />
                        <div className="flex-grow">
                          <p className="font-medium text-foreground">Expressversand</p>
                          <p className="text-sm text-muted-foreground">2-3 Werktage</p>
                        </div>
                        <span className="font-medium">29,00 €</span>
                      </label>
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <h2 className="text-lg font-semibold mb-6 text-foreground">Zahlungsart</h2>
                    <div className="space-y-3">
                      <label className="flex items-center gap-4 p-4 bg-muted rounded-lg border-2 border-foreground cursor-pointer">
                        <input type="radio" name="payment" defaultChecked className="w-4 h-4" />
                        <CreditCard className="w-5 h-5 text-muted-foreground" />
                        <div className="flex-grow">
                          <p className="font-medium text-foreground">Kreditkarte</p>
                          <p className="text-sm text-muted-foreground">Visa, Mastercard, American Express</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-4 p-4 bg-muted rounded-lg border border-border cursor-pointer hover:border-foreground/50 transition">
                        <input type="radio" name="payment" className="w-4 h-4" />
                        <div className="w-5 h-5 bg-primary rounded text-primary-foreground text-xs flex items-center justify-center font-bold">
                          P
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium text-foreground">PayPal</p>
                          <p className="text-sm text-muted-foreground">Schnell und sicher bezahlen</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-4 p-4 bg-muted rounded-lg border border-border cursor-pointer hover:border-foreground/50 transition">
                        <input type="radio" name="payment" className="w-4 h-4" />
                        <div className="w-5 h-5 bg-foreground rounded text-background text-xs flex items-center justify-center font-bold">
                          R
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium text-foreground">Rechnung</p>
                          <p className="text-sm text-muted-foreground">Zahlung innerhalb 14 Tage</p>
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
                  <Button type="submit" className="flex-grow bg-foreground hover:bg-foreground/90 text-background" disabled={isSubmitting}>
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
            <div className="bg-card rounded-xl p-6 border border-border sticky top-24">
              <h2 className="font-semibold text-lg mb-4 text-foreground">Deine Bestellung</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Menge: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">{(item.price * item.quantity).toFixed(2)} €</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-border mt-4 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Zwischensumme</span>
                  <span>{getTotalPrice().toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Versand</span>
                  <span>{shipping === 0 ? "Kostenlos" : `${shipping.toFixed(2)} €`}</span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-2 border-t border-border text-foreground">
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
