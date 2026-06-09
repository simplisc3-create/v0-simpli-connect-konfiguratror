import { isAdminAuthenticated, adminLogout } from "@/app/actions/admin-auth"
import { listOrders } from "@/app/actions/orders"
import { AdminLogin } from "./admin-login"
import { OrdersTable } from "./orders-table"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic"

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency }).format(amount)
}

export default async function AdminOrdersPage() {
  const authed = await isAdminAuthenticated()

  if (!authed) {
    return <AdminLogin />
  }

  const { orders, error } = await listOrders()

  const paidOrders = orders.filter((o) => o.paymentStatus === "paid" || o.paymentStatus === "no_payment_required")
  const revenue = paidOrders.reduce((sum, o) => sum + o.amountTotal, 0)
  const currency = orders[0]?.currency ?? "EUR"

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-white px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4" />
                Admin
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">Bestellungen</h1>
              <p className="text-sm text-gray-500">Live-Bestellungen aus Stripe</p>
            </div>
            <form action={adminLogout}>
              <Button type="submit" variant="outline" size="sm" className="bg-transparent">
                Abmelden
              </Button>
            </form>
          </div>

          {error ? (
            <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm mb-6">{error}</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 border border-gray-200 rounded-xl">
                <p className="text-sm text-gray-500">Bestellungen</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-xl">
                <p className="text-sm text-gray-500">Bezahlt</p>
                <p className="text-2xl font-bold text-gray-900">{paidOrders.length}</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-xl col-span-2 md:col-span-1">
                <p className="text-sm text-gray-500">Umsatz (bezahlt)</p>
                <p className="text-2xl font-bold text-gray-900">{formatMoney(revenue, currency)}</p>
              </div>
            </div>
          )}

          <OrdersTable initialOrders={orders} />
        </div>
      </main>
    </>
  )
}
