import Link from "next/link"
import { redirect } from "next/navigation"
import { Check, Package, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { getOrderSummary } from "@/app/actions/stripe"

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams

  if (!session_id) {
    redirect("/")
  }

  const order = await getOrderSummary(session_id)

  if (!order || order.paymentStatus !== "paid") {
    redirect("/")
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <SiteHeader />

      <div className="max-w-2xl mx-auto px-6 py-12 pt-24">
        {/* Success header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-balance">Vielen Dank für deine Bestellung!</h1>
          <p className="text-gray-600">Deine Zahlung war erfolgreich und wird nun bearbeitet.</p>
        </div>

        {/* Order details card */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Bestellnummer</p>
              <p className="font-mono font-semibold text-gray-900">{order.orderNumber}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
              <Check className="w-3.5 h-3.5" />
              Bezahlt
            </span>
          </div>

          {/* Line items */}
          <div className="px-6 py-4 space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">Menge: {item.quantity}</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900 whitespace-nowrap">
                  {item.amountTotal.toFixed(2)} {order.currency === "EUR" ? "€" : order.currency}
                </p>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100">
            <span className="font-semibold text-gray-900">Gesamt</span>
            <span className="font-semibold text-gray-900">
              {order.amountTotal.toFixed(2)} {order.currency === "EUR" ? "€" : order.currency}
            </span>
          </div>
        </div>

        {/* Email confirmation note */}
        {order.email && (
          <div className="mt-6 flex items-start gap-3 rounded-xl bg-white border border-gray-100 px-6 py-4">
            <Mail className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600">
              {"Eine Bestätigung und Rechnung wurde an "}
              <span className="font-medium text-gray-900">{order.email}</span>
              {" gesendet."}
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="w-full sm:w-auto bg-black hover:bg-gray-800">Zurück zur Startseite</Button>
          </Link>
          <Link href="/shop">
            <Button variant="outline" className="w-full sm:w-auto bg-transparent">
              Weiter einkaufen
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
